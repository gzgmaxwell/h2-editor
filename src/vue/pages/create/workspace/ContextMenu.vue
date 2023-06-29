<template>
    <ul
        v-show="isShow"
        :style="posStyle"
        class="eqc-context-menu"
        @mousedown.stop
    >
        <li
            v-show="menu.lock"
            class="item"
            @click="lock"
        >
            <span class="text">{{ isLock ? '解除锁定':'锁定' }}</span>
            <span class="shortcut">{{ isMac ? '⌘' : 'Ctrl ' }}L</span>
        </li>
        <li
            v-show="menu.combine"
            class="item"
            @click="combine"
        >
            <span class="text">{{ isCombine ? '取消组合':'组合' }}</span>
            <span class="shortcut">{{ isMac ? '⌘' : 'Ctrl ' }}G</span>
        </li>
        <li
            v-show="menu.lock"
            class="line"
        />
        <li
            v-show="menu.replace"
            class="item"
            @click="replace"
        >
            <span class="text">替换</span>
        </li>
        <li
            v-show="menu.copy"
            class="item"
            @click="copy"
        >
            <span class="text">复制</span>
            <span class="shortcut">{{ isMac ? '⌘' : 'Ctrl ' }}C</span>
        </li>
        <li
            v-show="menu.paste"
            class="item"
            @click="paste"
        >
            <span class="text">粘贴</span>
            <span class="shortcut">{{ isMac ? '⌘' : 'Ctrl ' }}V</span>
        </li>
        <li
            v-show="menu.crop"
            class="item"
            @click="crop"
        >
            <span class="text">裁切</span>
        </li>
        <li
            v-show="menu.remove"
            class="item"
            @click="remove"
        >
            <span class="text">删除</span>
            <span class="shortcut">{{ isMac ? 'Delete' : 'Backspace' }}</span>
        </li>
        <li
            v-show="menu.up"
            class="line"
        />
        <li
            v-show="menu.up"
            class="item"
            @click="updateZIndex('up')"
        >
            <span class="text">上移</span>
        </li>
        <li
            v-show="menu.down"
            class="item"
            @click="updateZIndex('down')"
        >
            <span class="text">下移</span>
        </li>
        <li
            v-show="menu.top"
            class="item"
            @click="updateZIndex('top')"
        >
            <span class="text">置顶</span>
        </li>
        <li
            v-show="menu.bottom"
            class="item"
            @click="updateZIndex('bottom')"
        >
            <span class="text">置底</span>
        </li>
    </ul>
</template>

<script>
import util from '../../../../utils/util'
import elementType from '../../../../config/enum.element.type'
import statistic from '../../../../config/statistic'

export default {
    data() {
        return {
            menu: {
                lock: false,
                up: false,
                down: false,
                top: false,
                bottom: false,
                copy: false,
                paste: false,
                remove: false,
                crop: false,
                replace: false,
                combine: false
            },
            posStyle: {
                left: 0,
                top: 0
            },
            isShow: false,
            isLock: false,
            isCombine: false
        }
    },
    computed: {
        layout() {
            return this.$store.state.layout
        },
        nav() {
            return this.layout.nav
        },
        contextMenu() {
            return this.layout.contextMenu
        },
        scene() {
            return this.$store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        eqxElementsSelected() {
            return this.scene.eqxElementsSelected
        },
        elementsCopied() {
            return this.scene.elementsCopied
        },
        isMac() {
            return util.isMac
        }
    },
    watch: {
        contextMenu(pos) {
            this.initPos(pos)
        }
    },
    methods: {
        initPos({ pageX, pageY }) {
            // 先来一个整体的操作，再分情况单独处理
            for (const key in this.menu) {
                this.menu[key] = this.eqxElementsSelected.length === 1
            }

            // 如果有多个组件选中，肯定是选中的临时框
            // 锁定、取消组合、删除、复制、上移、下移、置顶、置底。且这些操作都是针对整个编组的，而不是某一个组件
            if (this.eqxElementsSelected.length > 1) {
                this.menu.copy = this.menu.paste = this.menu.remove = true
                this.menu.lock = false
            } else {
                const eqxElement = this.eqxElementsSelected[0]
                if (eqxElement && eqxElement.isSelected) {
                // 获取锁定状态
                    const { lock } = eqxElement.elementJson.property
                    this.isLock = lock
                }
                if (eqxElement && eqxElement.isSelected && eqxElement.elementJson.type === elementType.combine) {
                    // 组合状态 展示：锁定、取消组合、删除、复制、上移、下移、置顶、置底
                    const { lock } = eqxElement.elementJson.property
                    this.isLock = lock
                    this.menu.combine = !lock // 锁定状态不展示 组合功能按钮
                    this.menu.remove = this.menu.copy = this.menu.up = this.menu.down = this.menu.top = this.menu.bottom = this.menu.paste = true
                    if (eqxElement.combineBox) {
                        this.isCombine = eqxElement.combineBox.isCombine
                    } else {
                        this.isCombine = eqxElement.isCombine
                    }
                } else if (eqxElement && eqxElement.isSelected && eqxElement.combineBox) {
                    const { lock } = eqxElement.combineBox.elementJson.property
                    this.isLock = lock
                    this.menu.combine = !lock // 锁定状态不展示 组合功能按钮
                    this.menu.remove = this.menu.copy = this.menu.up = this.menu.down = this.menu.top = this.menu.bottom = this.menu.paste = true
                    if (eqxElement.combineBox.combineBox) {
                        this.isCombine = eqxElement.combineBox.combineBox.isCombine
                    } else {
                        this.isCombine = eqxElement.combineBox.isCombine
                    }
                    this.menu.crop = this.menu.replace = false // 编组中的元素不能裁切
                } else {
                    this.menu.combine = false
                }
                if (eqxElement && eqxElement.elementJson.type === elementType.gif) {
                    this.menu.copy = false
                }
            }
            // 多个组件不能裁切
            if (this.eqxElementsSelected.length) {
                const elementJson = this.eqxElementsSelected[0].elementJson
                // 不是图片不能裁切
                // svg不能裁切
                if ((elementJson.type !== elementType.image && elementJson.type !== elementType.frame) ||
                (elementJson.type === elementType.frame && !elementJson.property.frames) ||
                (elementJson.type === elementType.image && /\.svg$/.test(elementJson.property.src))) {
                    this.menu.crop = false
                }
                // 图片和形状才能替换
                if (![elementType.image, elementType.shape, elementType.frame].includes(elementJson.type)) {
                    this.menu.replace = false
                }
            }

            // 如果有复制过，不论是否有组件选中，都可以粘贴
            this.menu.paste = !!this.elementsCopied.length

            const $element = this.$el
            const $workspace = this.$parent.$el
            const workspaceRect = $workspace.getBoundingClientRect()
            const left = pageX - workspaceRect.left
            const top = pageY - workspaceRect.top

            this.posStyle = {
                left: left + 'px',
                top: top + 'px'
            }
            for (const key in this.menu) {
                if (this.menu[key]) {
                    this.isShow = true
                    break
                }
            }

            // 需要等menu里的渲染完，getBoundingClientRect才能拿到正常的数据
            this.$nextTick(() => {
                let elementRect = $element.getBoundingClientRect()
                if (elementRect.left - workspaceRect.left + elementRect.width > workspaceRect.width) {
                    $element.css({ left: left - elementRect.width - 2 + 'px' })
                }
                if (elementRect.top - workspaceRect.top + elementRect.height > workspaceRect.height) {
                    let tmpTop = top - elementRect.height - 2
                    // 若是小于0则将top改为0避免顶部条遮住右键菜单
                    if (tmpTop < 0) {
                        tmpTop = 0
                    }
                    $element.css({ top: tmpTop + 'px' })
                }

                elementRect = $element.getBoundingClientRect()

                const mousemove = e => {
                    if (e.pageX < elementRect.left - 20 ||
                    e.pageX > elementRect.left + elementRect.width + 20 ||
                    e.pageY < elementRect.top - 20 ||
                    e.pageY > elementRect.top + elementRect.height + 20) {
                        this.hide()
                        document.removeEventListener('mousemove', mousemove)
                    }
                }

                document.addEventListener('mousemove', mousemove)
            })
        },
        updateZIndex(type) {
            const eqxElement = this.eqxElementsSelected[0]
            if (eqxElement.combineBox) {
                this.eqxPage.updateZIndex(eqxElement.combineBox, type)
            } else {
                this.eqxPage.updateZIndex(eqxElement, type)
            }
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        copy() {
            this.$store.commit('ELEMENT_COPY')
            this.hide()

            // 通过复制别的内容来清空剪切板
            const $input = document.querySelector('#input_copy')
            $input.select()
            document.execCommand('copy')
            $input.blur()
        },
        paste() {
            // 判断是否允许粘贴
            if (!util.isAllowPastElement()) {
                Vue.notifier.warn('最多可添加5个3D立体字', 5)
                return
            }
            Vue.helpnotifier.open('copy', 'CTRL+鼠标左键拖动组件，即可快速完成复制粘贴')
            this.$store.commit('ELEMENT_PASTE')
            // 复制了之后要对图层重新排序
            this.eqxPage.sortCombineElement()
            this.hide()
        },
        crop() {
            const eqxElement = this.eqxElementsSelected[0]
            const { css, property, type } = eqxElement.elementJson
            const oldWidth = parseInt(css.width)
            const oldHeight = parseInt(css.height)
            const oldRatio = oldWidth / oldHeight
            const options = {
                ratio: oldRatio,
                src: property.src,
                crop: property.crop,
                hideOptions: type === elementType.frame
            }
            if (type === elementType.frame) {
                options.src = property.frames[0].src
                options.crop = property.frames[0].crop
                this.dialog.openImageCrop(options)
                    .then(result => {
                        const { crop } = result
                        eqxElement.updateProperty({
                            frames: {
                                0: {
                                    crop,
                                    src: property.frames[0].src
                                }
                            }
                        })
                        this.eqxPage.eqxHistory.add(this.eqxPage)
                    })
                    .catch(err => err && this.logger.error(err))
            } else {
                this.dialog.openImageCrop(options)
                    .then(result => {
                        const { selectedRatio, crop } = result
                        eqxElement.updateProperty({
                            crop
                        })
                        if (selectedRatio === 'fixed') {
                        // 不用处理
                        } else {
                            let newWidth = 0
                            let newHeight = 0
                            const newRatio = crop.width / crop.height

                            // 基于原来的最大边处理，所以多次裁切后的的图片会越来越小
                            if (oldRatio > newRatio) {
                                newHeight = oldHeight
                                newWidth = Math.round(newHeight * newRatio)
                            } else {
                                newWidth = oldWidth
                                newHeight = Math.round(newWidth / newRatio)
                            }
                            eqxElement.updateCss({
                                width: newWidth + 'px',
                                height: newHeight + 'px'
                            })
                        }
                        this.eqxPage.eqxHistory.add(this.eqxPage)
                    })
                    .catch(err => err && this.logger.error(err))
            }
            this.hide()
        },
        replace() {
            let type = ''
            let info = ''
            const { image, shape, frame } = elementType

            switch (this.eqxElementsSelected[0].elementJson.type) {
                case image:type = 'image'; info = '图片'; break
                case shape:type = 'shape'; info = '形状'; break
                case frame:type = 'frame'; info = '图片或嵌入框'; break
            }
            if (type === 'image') {
                // 图片类型 打开素材弹窗
                this.dialog.openMaterialLib()
                    .then(res => {
                        if (res && res.success) {
                            Vue.api.file.getImageInfo(res.path).then(data => {
                                if (data.data.format === 'gif') {
                                    Vue.notifier.fail('gif文件不能被替换')
                                } else {
                                    const property = this.eqxElementsSelected[0].elementJson.property
                                    property.src = res.path
                                    if (property.crop) {
                                        delete property.crop
                                    }
                                    this.eqxElementsSelected[0].updateProperty(property)
                                }
                            })
                        }
                    })
                    .catch(err => {
                        err && this.logger.error(err)
                    })
            } else {
                this.$store.commit('LAYOUT_NAV', { item: this.nav.list[2] })
                this.$store.commit('LAYOUT_NAV_PANEL', { show: true })
                this.$store.commit('LAYOUT_MATERIAL', { type })
                this.hide()
                let notifierStr = `从左侧素材或上传中拖拽${info}可添加或替换`
                if (type === 'shape') {
                    notifierStr = `从左侧素材拖拽${info}可添加或替换`
                }
                this.notifier.info(notifierStr)
            }
        },
        remove() {
            if (this.eqxElementsSelected[0].combineBox) {
                // this.eqxPage.deleteElements(this.eqxElementsSelected[0].combineBox.childElements)
                // this.eqxPage.deleteElements([this.eqxElementsSelected[0].combineBox])
                if (this.eqxElementsSelected[0].combineBox.combineBox) {
                    this.eqxElementsSelected[0].combineBox.combineBox.deleteCombineElement(this.eqxElementsSelected[0].combineBox.combineBox)
                } else {
                    this.eqxElementsSelected[0].combineBox.deleteCombineElement(this.eqxElementsSelected[0].combineBox)
                }
            } else {
                if (this.eqxElementsSelected[0].elementJson.type === elementType.combine) {
                // this.eqxPage.deleteElements(this.eqxElementsSelected[0].childElements)
                    this.eqxElementsSelected[0].deleteCombineElement(this.eqxElementsSelected[0])
                }
            }
            this.eqxPage.deleteElements(this.eqxElementsSelected)
            this.eqxPage.eqxHistory.add(this.eqxPage)
            this.$store.commit('ELEMENT_SELECT', { eqxElements: [] })
            this.hide()
        },
        hide() {
            this.isShow = false
        },
        lock() {
            // 更新lock状态
            const eqxElement = this.eqxElementsSelected[0]
            if (eqxElement.isSelected) {
                // 修改锁定状态
                let { lock } = eqxElement.elementJson.property
                if (eqxElement.combineBox) {
                    lock = eqxElement.combineBox.elementJson.property.lock
                    eqxElement.combineBox.elementJson.property.lock = !lock
                    eqxElement.combineBox.updateProperty(eqxElement.combineBox.elementJson.property)
                } else {
                    eqxElement.elementJson.property.lock = !lock
                    eqxElement.updateProperty(eqxElement.elementJson.property)
                }
                if (!lock) {
                    window._hmt.push(['_trackEvent',
                        statistic.category.F,
                        statistic.action.LLAUL,
                        statistic.opt_label.LLAUL.lock])
                } else {
                    window._hmt.push(['_trackEvent',
                        statistic.category.F,
                        statistic.action.LLAUL,
                        statistic.opt_label.LLAUL.unlock])
                }

                // 更新当前按钮显示
                this.isLock = !lock
                // 重新选定组件用以显示锁定框
                const eqxElements = Vue.store.state.scene.eqxElementsSelected.slice()
                eqxElement.eqxPage.clearElementsSelected()
                eqxElements.length = 0

                if (!eqxElement.combineBox) {
                    eqxElement.isSelected = true
                    eqxElements.push(eqxElement)
                } else {
                    eqxElement.combineBox.isSelected = true
                    eqxElements.push(eqxElement.combineBox)
                }

                Vue.store.commit('ELEMENT_SELECT', { eqxElements })
                // 如果锁定时，combine还是临时组合 则直接组合
                if (this.isLock && eqxElement.elementJson.type === elementType.combine && !eqxElement.isCombine) {
                    eqxElement.isCombine = true
                    this.isCombine = true
                    eqxElement.flatCombine(eqxElement, this.eqxPage)
                }
                if (this.isLock && eqxElement.combineBox) {
                    eqxElement.combineBox.isCombine = true
                    this.isCombine = true
                    eqxElement.combineBox.flatCombine(eqxElement.combineBox, this.eqxPage)
                    eqxElement.combineBox.elementJson.property.lock = !lock
                    this.menu.combine = false // 不展示取消组合目录
                }
                if (eqxElement.elementJson.type === elementType.combine) {
                    this.menu.combine = !this.isLock // 锁定成功  不展示组合按钮
                }
            }
        },
        combine() {
            this.isCombine = !this.isCombine
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.LCAUC,
                this.isCombine ? statistic.opt_label.LCAUC.combine : statistic.opt_label.LCAUC.uncombine])
            this.eqxElementsSelected.map(item => {
                let changeCombineElement = item
                if (item.elementJson.type === elementType.combine) {
                    if (item.combineBox) {
                        changeCombineElement = item.combineBox
                    }
                } else if (item.combineBox) {
                    if (item.combineBox.combineBox) {
                        changeCombineElement = item.combineBox.combineBox
                    } else {
                        changeCombineElement = item.combineBox
                    }
                }
                changeCombineElement.isCombine = this.isCombine
                changeCombineElement.buildConnecttionWidthElements()
                changeCombineElement.elementBox.isCombine = changeCombineElement.isCombine // 改变选中框的样式
                if (changeCombineElement.isCombine) {
                    changeCombineElement.flatCombine(changeCombineElement, this.eqxPage) // 组合不允许嵌套
                }
                changeCombineElement.isSelected = true
                Vue.store.commit('ELEMENT_SELECT', { eqxElements: [changeCombineElement] })
            })
        }
    }
}
</script>

<style lang="scss">
.eqc-context-menu {
    position: absolute;
    padding: 8px 1px;
    background: #fff;
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
    // transition: all 0.5s;
    .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 120px;
        height: 30px;
        padding: 0 12px;
        font-size: 12px;
        color: #4f5d69;
        cursor: pointer;
        transition: all 0.3s;
        &:hover {
            color: #fff;
            background: #4f5d69;
            .shortcut {
                color: #fff;
            }
        }
        .text {
            display: flex;
            align-items: center;
            .icon {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 30px;
                height: 30px;
                font-size: 14px;
            }
        }
        .shortcut {
            color: #999;
        }
    }
    .line {
        width: 100%;
        margin: 8px 0;
        border-bottom: 1px solid #ccd5db;
    }
}
</style>
