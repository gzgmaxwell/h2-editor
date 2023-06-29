<template>
    <div
        id="layer"
        :style="{left: '500px', top: '100px',width:isSpecial?'237px':'184px'}"
        class="eqc-layer"
        @mousedown.stop
    >
        <div
            v-drag-layer="{target: '#layer', container: '.eqc-create'}"
            class="head"
        >
            <span>图层管理</span>
            <i
                class="close eqf-no"
                @click="close"
            />
        </div>
        <div
            id="layer_content"
            v-scroll-bar
            class="content"
        >
            <ul class="list">
                <li
                    v-for="(item,index) in eqxElements"
                    v-show="checkEqxElementShow(item)"
                    :key="item.elementJson.id"
                    v-drag-layer-item="{container: '#layer_content', eqxElement: item, onMouseUp}"
                    :class="{active: item.isSelected,combineElement:item.elementJson.type === 106 || !item.combineBox || item.combineBox && !item.combineBox.isCombine}"
                    :style="{order: index}"
                    :data-z-index="item.elementJson.css.zIndex"
                    class="item"
                    @click="select($event, item)"
                    @mousedown="openMenu($event,item)"
                    @mouseover="itemHoverId = item.elementJson.id"
                    @mouseleave="itemHoverId = -1"
                >
                    <span
                        class="label"
                        @click="foldOrOpenBox(item)"
                    >
                        <i
                            v-show="item.elementJson.type === 106"
                            :class="!item.elementJson.property.open ? 'eqf-menu-right':'eqf-menu-down'"
                            style="margin-left:0"
                            class="special"
                        />
                        <i
                            :class="{'eqf-fileopen-f':item.elementJson.type === elementType.combine && item.elementJson.property.open,
                                     'eqf-file-f':item.elementJson.type === elementType.combine && !item.elementJson.property.open,
                                     'eqf-image-f':[elementType.image,elementType.qrcode,elementType.shape,elementType.frame,elementType.gif].includes(item.elementJson.type),
                                     'eqf-shape-f':[elementType.shape].includes(item.elementJson.type),
                                     'eqf-t-new':[elementType.text,elementType.date].includes(item.elementJson.type),
                                     'eqf-fontmall':[elementType.textThreeD].includes(item.elementJson.type),
                                     'eqf-moreform':[elementType.table].includes(item.elementJson.type),
                                     'ml0':item.elementJson.type === elementType.combine,
                                     'ml19': item.elementJson.type !== elementType.combine,
                                     'eqf-shape-f': [elementType.puzzle].includes(item.elementJson.type)
                            }"
                            class="special"
                        />
                        {{ showLable(item) }}
                    </span>

                    <div
                        :class="{active: item.isSelected}"
                        class="op-box"
                    >
                        <span
                            v-show="itemHoverId === item.elementJson.id && !(item.combineBox && item.combineBox.isCombine)"
                            data-hint="删除"
                            class="icon-item hint--left hint--rounded delete"
                        >
                            <i
                                class="eqf-no-f"
                                @click="deleteItem(item)"
                            />
                        </span>
                        <span
                            v-show="itemHoverId === item.elementJson.id && !(item.combineBox && item.combineBox.isCombine)"
                            data-hint="复制"
                            class="icon-item hint--left hint--rounded delte"
                        >
                            <i
                                class="eqf-copy-f"
                                @click="copyItem(item)"
                            />
                        </span>
                        <span
                            :data-hint="item.elementJson.property.lock ? '解锁':'锁定'"
                            :style="{color:item.elementJson.property.lock ? 'white':'inherit',visibility:item.combineBox?'hidden':'visible'}"
                            class="icon-item hint--left hint--rounded"
                        >
                            <i
                                :class="item.elementJson.property.lock ? 'eqf-lock-f':'eqf-unlock-f'"
                                @click.stop="lock($event,item)"
                            />
                        </span>
                        <span
                            :data-hint="item.elementJson.css.display !== 'none'?'隐藏':'显示'"
                            :style="{color:item.elementJson.css.display !== 'none' ? 'inherit':'white'}"
                            class="icon-item hint--left hint--rounded"
                        >
                            <i
                                :class="item.elementJson.css.display !== 'none' ? 'eqf-eye-f':'eqf-hidden-f'"
                                @click.stop="editEye($event, item)"
                            />
                        </span>
                        <span
                            v-if="isSpecial"
                            :style="{visibility:item.elementJson.type === 106?'hidden':'visible'}"
                            class="showLabel"
                            @click="setElementLabel(item)"
                        >
                            <span :style="{color:item.elementJson.property.markLabel?'white':'#9099a4'}">{{ (item.elementJson.property.markLabel? item.elementJson.property.markLabel:'设置') | textFilter }}</span>
                        </span>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import dragLayer from './dragLayer'
import dragLayerItem from './dragLayerItem'
import statistic from '../../../../config/statistic'
import elementType from '../../../../config/enum.element.type.js'
export default {
    filters: {
        textFilter(val) {
            if (val.length > 4) {
                return val.substr(0, 3) + '...'
            } else {
                return val
            }
        }
    },
    directives: {
        dragLayer,
        dragLayerItem
    },
    data() {
        return {
            isMoved: false,
            itemHoverId: -1,
            elementType
        }
    },
    computed: {
        showLable() {
            return function (item) {
                if (item.elementJson.type === elementType.text) {
                    if (this.itemHoverId === item.elementJson.id) {
                        return '文字'
                    } else {
                        return item.elementJson.property.showLayerLabel
                    }
                } else {
                    return item.elementJson.property.showLayerLabel
                }
            }
        },
        isSpecial() {
            return this.user.allow('layerControl')
        },
        scene() {
            return this.$store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        eqxElementsSelected() {
            return this.$store.state.scene.eqxElementsSelected
        },
        eqxElements() {
            let imageCount = 0
            let qrcodeCount = 0
            let shapeCount = 0
            let frameCount = 0
            let combineCount = 0
            let dateCount = 0
            let gifCount = 0
            let tableCount = 0
            let threeDTextCount = 0
            let puzzleCount = 0
            const haveLabelArr = []
            const noLabelArr = []
            this.eqxPage.eqxElements.forEach(element => {
                if (element.elementJson.property.showLayerLabel) {
                    haveLabelArr.push(element)
                } else {
                    noLabelArr.push(element)
                }
            })

            haveLabelArr.forEach(element => {
                const elementCount = Number(element.elementJson.property.showLayerLabel.replace(/\D/g, ''))
                if (element.elementJson.type === elementType.image && imageCount < elementCount) {
                    imageCount = elementCount
                } else if (element.elementJson.type === elementType.qrcode && qrcodeCount < elementCount) {
                    qrcodeCount = elementCount
                } else if (element.elementJson.type === elementType.shape && shapeCount < elementCount) {
                    shapeCount = elementCount
                } else if (element.elementJson.type === elementType.frame && frameCount < elementCount) {
                    frameCount = elementCount
                } else if (element.elementJson.type === elementType.combine && combineCount < elementCount) {
                    combineCount = elementCount
                } else if (element.elementJson.type === elementType.date && dateCount < elementCount) {
                    dateCount = elementCount
                } else if (element.elementJson.type === elementType.gif && gifCount < elementCount) {
                    dateCount = elementCount
                } else if (element.elementJson.type === elementType.table && tableCount < elementCount) {
                    dateCount = elementCount
                } else if (element.elementJson.type === elementType.textThreeD && threeDTextCount < elementCount) {
                    threeDTextCount = elementCount
                } else if (element.elementJson.type === elementType.text) {
                    let content = element.$text.innerText + ''
                    content = content.trim()
                    if (content.length > 3) {
                        element.elementJson.property.showLayerLabel = content.substr(0, 3) + '...'
                    } else {
                        element.elementJson.property.showLayerLabel = content
                    }
                } else if (element.elementJson.type === elementType.puzzle && puzzleCount < elementCount) {
                    puzzleCount = elementCount
                }
            })
            noLabelArr.forEach(element => {
                if (element.elementJson.type === elementType.text) {
                    let content = element.$text.innerText + ''
                    content = content.trim()
                    if (content.length > 3) {
                        element.elementJson.property.showLayerLabel = content.substr(0, 3) + '...'
                    } else {
                        element.elementJson.property.showLayerLabel = content
                    }
                } else if (element.elementJson.type === elementType.image) {
                    imageCount++
                    element.elementJson.property.showLayerLabel = '图片' + imageCount
                } else if (element.elementJson.type === elementType.qrcode) {
                    qrcodeCount++
                    element.elementJson.property.showLayerLabel = '二维码' + qrcodeCount
                } else if (element.elementJson.type === elementType.shape) {
                    shapeCount++
                    element.elementJson.property.showLayerLabel = '形状' + shapeCount
                } else if (element.elementJson.type === elementType.frame) {
                    frameCount++
                    element.elementJson.property.showLayerLabel = '嵌入框' + frameCount
                } else if (element.elementJson.type === elementType.combine) {
                    combineCount++
                    element.elementJson.property.showLayerLabel = '组合' + combineCount
                    element.elementJson.property.open = false
                } else if (element.elementJson.type === elementType.date) {
                    dateCount++
                    element.elementJson.property.showLayerLabel = '日期' + dateCount
                } else if (element.elementJson.type === elementType.table) {
                    tableCount++
                    element.elementJson.property.showLayerLabel = '表格' + tableCount
                } else if (element.elementJson.type === elementType.gif) {
                    gifCount++
                    element.elementJson.property.showLayerLabel = 'gif' // 因为gif在一个场景中最多只有一个
                } else if (element.elementJson.type === elementType.textThreeD) {
                    threeDTextCount++
                    element.elementJson.property.showLayerLabel = '立体字' + threeDTextCount
                } else if (element.elementJson.type === elementType.puzzle) {
                    puzzleCount++
                    element.elementJson.property.showLayerLabel = '拼图' + puzzleCount
                }
            })
            return this.eqxPage.eqxElements
        }
    },
    watch: {
        eqxElementsSelected(newVal, oldElement) {
            if (oldElement.length >= 1) {
                const element = oldElement[0]
                if (element.elementJson.type === elementType.text) {
                    let content = element.$text.innerText + ''
                    content = content.trim()
                    content = content.length > 3 ? content.substr(0, 3) + '...' : content
                    if (element.elementJson.property.showLayerLabel !== content) {
                        element.elementJson.property.showLayerLabel = content
                    }
                }
            }
        }
    },
    mounted() {
        Vue.helpnotifier.open('ctrl', '长按Ctrl+鼠标点选，即可进行多个图层')
    },
    methods: {
        onMouseUp(isMoved) {
            this.isMoved = isMoved
        },
        checkEqxElementShow(item) {
            if (item.elementJson.type !== 106 && item.combineBox && item.combineBox.isCombine) {
                // 在组合内 且组合成功 组合框不显示
                return item.combineBox.elementJson.property.open
            }
            if (item.elementJson.type === 106 && !item.isCombine) {
                return false
            }
            return true
        },
        foldOrOpenBox(eqxElement) {
            if (eqxElement.elementJson.type === elementType.combine) {
                eqxElement.elementJson.property.open = !eqxElement.elementJson.property.open
            }
        },
        checkLockElementCanSelect(eqxElements, element) {
            const arr = [element, ...eqxElements]
            let pass = true
            arr.map(item => {
                if (item.combineBox && item.combineBox.elementJson.property.lock) {
                    Vue.notifier.fail('批量操作请先解锁组件！')
                    pass = false
                } else if (item.elementJson.property.lock) {
                    Vue.notifier.fail('批量操作请先解锁组件！')
                    pass = false
                }
            })

            return pass
        },
        // 校验该组件是否能够多选选中   批量选择只能是非编组或者是同一个编组的
        checkElementCanSelect(eqxElements, element) {
            let combineBoxId = null
            if (element.combineBox) {
                combineBoxId = element.combineBox.elementJson.id
            }
            let pass = true
            eqxElements.map(item => {
                if (item.combineBox) {
                    if (item.combineBox.elementJson.id !== combineBoxId) {
                        pass = false
                    }
                } else {
                    if (combineBoxId) {
                        pass = false
                    }
                }
            })
            !pass && Vue.notifier.fail('批量选择只能是非编组或者是同一个编组的')
            if (pass) {
                return this.checkLockElementCanSelect(eqxElements, element)
            }
            return pass
        },
        // 选中
        select(e, eqxElement) {
            if (this.isMoved) {
                return
            }
            // 只要点击就关闭这个右键弹窗
            this.$store.commit('SCENE_SIDERBAR_MENU_OPTION_SHOW', false)
            const { css: { display } } = eqxElement.elementJson
            const eqxElements = Vue.store.state.scene.eqxElementsSelected.slice()
            if (display !== 'none') {
                //  按住ctrl批量选择
                if (e.ctrlKey) {
                    // 批量选择只能是非编组或者是同一个编组的
                    if (this.checkElementCanSelect(eqxElements, eqxElement)) {
                        //  发信号 控制不让其生成combineBox
                        this.$store.commit('SCENE_IS_NEED_INIT_COMBINE_BOX', false)
                        const index = eqxElements.indexOf(eqxElement)
                        if (index === -1) {
                            eqxElement.isSelected = true
                            eqxElements.push(eqxElement)
                        } else {
                        // 如果存在 再次点击就取消选中
                            eqxElement.isSelected = false
                            eqxElements.splice(index, 1)
                        }
                    }
                } else {
                    eqxElement.eqxPage.clearElementsSelected()
                    eqxElement.isSelected = true
                    eqxElements.length = 0
                    eqxElements.push(eqxElement)
                }
            }
            Vue.store.commit('ELEMENT_SELECT', { eqxElements })
        },
        isSelected() {
            const eqxElements = Vue.store.state.scene.eqxElementsSelected.slice()
            let flag = true
            eqxElements.forEach((eqxElement) => {
                if (eqxElement.isSelected) {
                    flag = false
                }
            })
            if (flag) {
                Vue.store.commit('ELEMENT_SELECT', { eqxElements: [] })
            }
        },
        lock(e, eqxElement) {
            // 更新lock状态
            const { lock } = eqxElement.elementJson.property
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
            eqxElement.elementJson.property.lock = !lock
            // 选定组件用以显示锁定框
            this.select(e, eqxElement)
        },
        editEye(e, eqxElement) {
            let { display } = eqxElement.elementJson.css
            if (display === 'none') {
                if (eqxElement.elementJson.type === elementType.textThreeD) {
                    display = 'flex'
                } else if (eqxElement.elementJson.type === elementType.table) {
                    display = 'grid'
                } else {
                    display = 'block'
                }
            } else {
                display = 'none'
                if (eqxElement.elementJson.type === elementType.combine) {
                    eqxElement.childElements.map(item => {
                        item.elementBox.$el.css({ display: 'none' })
                    })
                }
                eqxElement.elementBox.$el.css({ display: 'none' })
            }
            eqxElement.updateCss({ display })
            if (eqxElement.elementJson.type === elementType.combine) {
                eqxElement.childElements.map(item => {
                    if (item.elementJson.type === elementType.textThreeD && display === 'block') {
                        item.updateCss({ display: 'flex' })
                    } else {
                        item.updateCss({ display })
                    }
                })
            }
            this.isSelected()
            this.checkCombineDisplay(eqxElement)
        },
        close() {
            this.$store.commit('LAYOUT_LAYER', { show: false })
        },
        checkCombineDisplay(eqxElement) {
            // 是不是展示combine元素
            if (eqxElement.combineBox) {
                let showFlag = false
                eqxElement.combineBox.childElements.map(item => {
                    const { display } = item.elementJson.css
                    if (display === 'block') {
                        showFlag = true
                    }
                })
                if (showFlag) {
                    eqxElement.combineBox.updateCss({ display: 'block' })
                } else {
                    eqxElement.combineBox.updateCss({ display: 'none' })
                    eqxElement.combineBox.elementBox.$el.css({ display: 'none' })
                }
            }
        },
        setElementLabel(element) {
            // this.$refs.settingLabel.open(element)
            this.dialog.openSettingLabel(element)
        },
        openMenu(e, item) {
            if (e.button === 2) {
                let eqxElements = []
                const selectElements = Vue.store.state.scene.eqxElementsSelected
                if (e.ctrlKey) {
                    if (selectElements.indexOf(item) === -1) {
                        eqxElements = [item, ...selectElements]
                    } else {
                        eqxElements = selectElements
                    }
                } else {
                    eqxElements = [item]
                }

                const menuConfig = {
                    show: true,
                    eqxElements,
                    left: e.pageX,
                    top: e.pageY
                }
                this.$store.commit('SCENE_SIDERBAR_MENU_OPTION', menuConfig)
            }
        },
        // 组件删除
        deleteItem(item) {
            if (item.combineBox) {
                item.combineBox.deleteCombineElement(item.combineBox)
            } else {
                if (item.elementJson.type === elementType.combine) {
                    item.deleteCombineElement(item)
                }
            }
            this.eqxPage.deleteElements([item])
            Vue.store.commit('ELEMENT_SELECT', { eqxElements: [] })
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        copyItem(item) {
            setTimeout(() => {
                this.$store.commit('ELEMENT_COPY')
                // 通过复制别的内容来清空剪切板
                const $input = document.querySelector('#input_copy')
                $input.select()
                document.execCommand('copy')
                $input.blur()
            }, 100)
        }
    }
}
</script>

<style lang="scss">
.eqc-layer {
    position: absolute;
    width: 184px;
    box-shadow: $boxShadow;
    font-size: 12px;
    background: #1d2024;
    z-index: 93;
    border-radius: 5px;
    .head {
        height: 40px;
        padding: 0 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #1d2024;
        font-weight: bold;
        color: #eceef0;
        background: #1d2024;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        cursor: move;
        .close {
            font-size: 20px;
            transition: all 0.3s;
            cursor: pointer;
            &:hover {
                color: $red-normal;
            }
        }
        span {
            font-size: 12px;
        }
    }
    .content {
        position: relative;
        height: 460px;
        .list {
            display: flex;
            flex-direction: column;
            .combineElement {
                background: #252930 !important;
            }
            .boxElement {
                text-indent: 10px;
            }
            .item {
                height: 36px;
                padding: 0 12px 0 8px;
                display: flex;
                align-items: center;
                transition: background 0.3s;
                border-bottom: 1px solid #1d2024;
                user-select: none;
                color: #9099a4;
                display: flex;
                justify-content: space-between;
                border-left: 2px solid transparent;
                cursor: pointer;
                background-color: #2e333a;
                // &.even {
                //     background: #f7f8f9;
                // }
                &:hover {
                    background: #404955 !important;
                    color: white;
                }
                &.active {
                    color: white;
                    background: #404955 !important;
                    border-left: 2px solid #358dd9;
                }
                span {
                    font-size: 12px;
                    i {
                        margin-left: 10px;
                        transition: all 0.3s;
                        &:hover {
                            color: #1593ff;
                        }
                    }
                    .ml0 {
                        margin: 0 8px 0 4px;
                    }
                    .ml19 {
                        margin: 0 8px 0 21px;
                    }
                    .special {
                        font-size: 16px;
                    }
                    .boxElement {
                        margin: 0 8px 0 21px;
                    }
                }
                .label {
                    display: flex;
                    align-items: center;
                }
                .op-box {
                    min-width: 30px;
                    .icon-item {
                        width: 16px;
                    }
                    .delete i {
                        &:hover {
                            color: #ec3a70 !important;
                        }
                    }
                }
                .showLabel {
                    display: inline-block;
                    margin: 0 0 0 12px;
                    text-align: center;
                    span {
                        font-size: 12px;
                    }
                }
            }
        }
    }
}
</style>
