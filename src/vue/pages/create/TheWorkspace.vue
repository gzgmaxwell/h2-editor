<template>
    <div
        v-keymap
        v-scroll
        class="eqc-workspace"
    >
        <div class="safe-space">
            <the-editor ref="editor" />
        </div>
        <div
            v-if="isShowEmptyTip && !puzzleMode"
            :style="emptyTipStyle"
            class="empty-tip"
        >
            <img
                :src="icon"
                class="icon"
            >
            <p class="text">
                从左侧选择一个模板，或者从设置<span
                    class="bg"
                    @click="nav2bg()"
                >背景</span>开始
            </p>
        </div>
        <div
            ref="selectBox"
            class="select-box"
        />
        <grid-line v-if="grid.show" />
        <ruler-line v-if="ruler.show" />
        <ruler-bar
            v-if="ruler.show"
            ref="rulerBar"
        />
        <guide-line />
        <stretch-bar
            v-if="editorSize.show"
            ref="stretchBar"
        />
        <scale-bar />
        <scale-preview />
        <context-menu />
        <scale-drag ref="scaleDrag" />
        <scale-scroll-bar />
        <table-menu />
        <table-menu-in />
    </div>
</template>

<script>
import storageLocal from '../../../utils/storageLocal'
import TheEditor from './TheEditor.vue'
import ContextMenu from './workspace/ContextMenu.vue'
import ScaleBar from './workspace/ScaleBar.vue'
import ScaleDrag from './workspace/ScaleDrag.vue'
import ScalePreview from './workspace/ScalePreview.vue'
import StretchBar from './workspace/StretchBar.vue'
import GridLine from './workspace/GridLine.vue'
import RulerBar from './workspace/RulerBar.vue'
import RulerLine from './workspace/RulerLine.vue'
import GuideLine from './workspace/GuideLine.vue'
import scroll from './workspace/scroll'
import textTypes from '../../../config/enum.text.type'
import combineInitor from './workspace/combine.box.js'
import elementType from '../../../config/enum.element.type'
import group from '../../../img/group.png'
import renderDisplay from './workspace/elementDisplay'
import ScaleScrollBar from './workspace/ScaleScrollBar.vue'
import TableMenu from './workspace/TableMenu.vue'
import TableMenuIn from './workspace/TableMenuIn.vue'
import util from '../../../utils/util'

export default {
    components: {
        TheEditor,
        ContextMenu,
        ScaleBar,
        ScaleDrag,
        ScalePreview,
        StretchBar,
        GridLine,
        RulerBar,
        RulerLine,
        GuideLine,
        ScaleScrollBar,
        TableMenu,
        TableMenuIn
    },
    directives: {
        scroll
    },
    data() {
        return {
            workspaceKey: storageLocal.key.workspaceDragTip,
            isDragging: false,
            textTypes,
            mouseState: false,
            exeFlag: true,
            icon: group,
            isShowEmptyTip: false
        }
    },
    computed: {
        editorSize() {
            return this.$store.state.layout.editorSize
        },
        scene() {
            return this.$store.state.scene
        },
        eqxScene() {
            return this.scene.eqxScene
        },
        isNeedInitCombineBox() {
            return this.scene.isNeedInitCombineBox
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        eqxElementsSelected() {
            return this.scene.eqxElementsSelected
        },
        elementsPasted() {
            return this.scene.elementsPasted
        },
        pasteTimes() {
            return this.scene.pasteTimes
        },
        guideLine() {
            return this.$store.state.guideLine
        },
        grid() {
            return this.guideLine.grid
        },
        ruler() {
            return this.guideLine.ruler
        },
        eqxElements() { // 页面元素
            return this.eqxPage.eqxElements
        },
        background() { // 页面背景
            return this.eqxPage.pageJson.properties.background
        },
        layout() {
            return this.$store.state.layout
        },
        nav() {
            return this.layout.nav
        },
        emptyTipStyle() {
            return {
                marginLeft: Vue.store.state.layout.workSpaceScroll.x + 'px',
                marginTop: Vue.store.state.layout.workSpaceScroll.y + 'px'
            }
        },
        eqxScene2() {
            return this.scene.eqxScene2
        },
        eqxPage2() {
            return this.scene.eqxPage2
        },
        pageJson2() {
            return this.eqxPage2.pageJson
        },
        eqxScene3() {
            return this.scene.eqxScene3
        },
        eqxPage3() {
            return this.scene.eqxPage3
        },
        pageJson3() {
            return this.eqxPage3.pageJson
        },
        eqxScene2EditCompleteEvent() {
            return this.scene.eqxScene2EditCompleteEvent
        },
        puzzleMode() {
            return this.$store.state.scene.puzzleMode
        }
    },
    watch: {
        eqxElementsSelected() {
            if (this.eqxElementsSelected.length > 1) {
                // 初始化combineBox 是针对按住ctrl 多选
                if (this.isNeedInitCombineBox) {
                    !this.mouseState && combineInitor.initCombine(this.eqxElementsSelected, this.eqxPage)
                } else {
                    this.$store.commit('SCENE_IS_NEED_INIT_COMBINE_BOX', true)
                }
            }
            if (this.exeFlag) {
                this.exeFlag = false
                setTimeout(() => {
                    renderDisplay() // 重新绘制展示页面逻辑
                    this.exeFlag = true
                }, 0)
            }
        },
        elementsPasted(newVal) {
            if (!util.isAllowPastElement()) {
                return
            }
            const strlState = Vue.store.state.scene.ctrlState
            const arr = this.eqxPage.pasteElements(newVal, this.pasteTimes)
            if (!strlState) {
                this.$store.commit('ELEMENT_SELECT', { eqxElements: arr })
            }

            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        eqxElements() {
            const noBgSet = (['', '#FFFFFF'].indexOf(this.background.bottom.color) > -1) && (this.background.top.color === '') && (this.background.middle.src === '')
            if (this.eqxElements.length === 0 && noBgSet) {
                this.isShowEmptyTip = true
            } else {
                this.isShowEmptyTip = false
            }
        },
        background: {
            handler(newVal) {
                const noBgSet = (['', '#FFFFFF'].indexOf(this.background.bottom.color) > -1) && (this.background.top.color === '') && (this.background.middle.src === '')
                if (this.eqxElements.length === 0 && noBgSet) {
                    this.isShowEmptyTip = true
                } else {
                    this.isShowEmptyTip = false
                }
            },
            deep: true
        },
        eqxScene2EditCompleteEvent(newVal, oldVal) {
            // 更新元素 每一页找到对应的预览页面
            this.eqxScene.eqxPages.forEach((eqxPage, pageIndex) => {
                eqxPage.pageJson.elements.forEach(element => {
                    if (element.type === elementType.text || element.type === elementType.image) {
                        let findElement = []
                        if (pageIndex === 0) {
                            findElement = this.pageJson2.elements.filter(element2 => {
                                return element.id === element2.id
                            })
                        } else if (pageIndex === 1) {
                            findElement = this.pageJson3.elements.filter(element2 => {
                                return element.id === element2.id
                            })
                        }
                        if (findElement.length > 0) {
                            if (element.type === elementType.text) {
                                element.property.content = findElement[0].property.content
                            } else {
                                element.property.src = findElement[0].property.src
                                element.css = findElement[0].css
                                // 保证不被裁切，不然图片显示不完成
                                element.property.crop = undefined
                            }
                        }
                    }
                })
            })
            this.renderPage()
        }
    },
    mounted() {
        // 判断是否显示空白提示(底层背景空白页时默认为白色，所以透明和白色都认为没有设置背景)
        const noBgSet = (['', '#FFFFFF'].indexOf(this.background.bottom.color) > -1) &&
        (this.background.top.color === '') &&
        (this.background.middle.src === '')

        if (this.eqxElements.length === 0 && noBgSet) {
            this.isShowEmptyTip = true
        } else {
            this.isShowEmptyTip = false
        }

        const $el = this.$el
        $el.addEventListener('mousedown', e => {
            // 阻止双击会选中其它元素，但这里不能加，否则自定义修改尺寸时，点击这里不能触发blur事件。现通过selectstart方式解决
            // e.preventDefault()
            // 如果在拖拽画布
            if (this.isDragging) {
                return
            }
            // 关闭左边素材条件框
            Vue.store.commit('MATERIAL_MORE_CHANGE', { show: false })
            // 关闭模板颜色选择框
            Vue.store.commit('TEMPLATE_COLOR_PANEL', { show: false })
            // 关闭模板设置
            Vue.store.commit('TEMPLATE_CONFIG', { show: false })
            // 关闭模板分类
            Vue.store.commit('TEMPLATE_CATEGORY', { show: false })

            // 鼠标右键
            if (e.button === 2 && this.eqxElementsSelected.length === 0) {
                Vue.store.commit('LAYOUT_CONTEXT_MENU', { pageX: e.pageX, pageY: e.pageY })
            }

            // 清除所有组件的选中状态
            this.eqxElementsSelected.length && this.$store.commit('ELEMENT_SELECT', { eqxElements: [] })
            this.eqxPage.clearElementsSelected()
            // 清除文字选择状态
            getSelection().removeAllRanges()

            const $selectBox = this.$refs.selectBox
            const eqxElements = this.eqxPage.eqxElements
            const selectBoxPoint = {
                x0: e.pageX,
                y0: e.pageY
            }
            const { left, top } = $el.getBoundingClientRect()
            const elementsCenterPoint = getElementsCenterPos(eqxElements, left, top)

            // 阻止mousemove默认会选中其它元素的情况
            const selectstart = e => e.preventDefault()

            const mousemove = e => {
                this.mouseState = true // 鼠标状态 正在移动
                selectBoxPoint.x1 = e.pageX
                selectBoxPoint.y1 = e.pageY
                const selectBoxCss = getSelectBoxCss(selectBoxPoint, left, top)
                showSelectBox($selectBox, selectBoxCss)
                showElementsBox(eqxElements, elementsCenterPoint, selectBoxCss, this)
            }

            const mouseup = e => {
                combineInitor.initCombine(this.eqxElementsSelected, this.eqxPage)
                this.mouseState = false
                $selectBox.removeAttr('style')
                document.removeEventListener('selectstart', selectstart)
                document.removeEventListener('mousemove', mousemove)
                document.removeEventListener('mouseup', mouseup)
            }

            document.addEventListener('selectstart', selectstart)
            document.addEventListener('mousemove', mousemove)
            document.addEventListener('mouseup', mouseup)
        })

        /**
         * 获取多选框的位置
         */
        function getSelectBoxCss(selectBoxPoint, workspaceLeft, workspaceTop) {
            const selectBoxCss = {
                left: selectBoxPoint.x0 - workspaceLeft,
                top: selectBoxPoint.y0 - workspaceTop
            }
            selectBoxCss.width = selectBoxPoint.x1 - selectBoxPoint.x0
            selectBoxCss.height = selectBoxPoint.y1 - selectBoxPoint.y0

            if (selectBoxPoint.x1 < selectBoxPoint.x0) {
                selectBoxCss.left = selectBoxPoint.x1 - workspaceLeft
                selectBoxCss.width = -selectBoxCss.width
            }
            if (selectBoxPoint.y1 < selectBoxPoint.y0) {
                selectBoxCss.top = selectBoxPoint.y1 - workspaceTop
                selectBoxCss.height = -selectBoxCss.height
            }

            return selectBoxCss
        }

        /**
         * 显示多选框
         */
        function showSelectBox($selectBox, selectBoxCss) {
            $selectBox.css({
                left: selectBoxCss.left + 'px',
                top: selectBoxCss.top + 'px',
                width: selectBoxCss.width + 'px',
                height: selectBoxCss.height + 'px',
                display: 'block'
            })
        }

        /**
         * 显示组件的选择框
         */
        function showElementsBox(eqxElements, elementsCenterPoint, selectBoxCss, that) {
            const { left, top, width, height } = selectBoxCss
            const arr = []
            elementsCenterPoint.forEach((pos, index) => {
                const eqxElement = eqxElements[index]
                const { x, y } = pos
                if (x > left && y > top && x < left + width && y < top + height) {
                    if (eqxElement && !eqxElement.elementJson.property.lock) {
                        if (eqxElement.elementJson.type === elementType.gif) {
                            // 只有秀客和超级用户可以编辑gif组件  其余的不能选中组件也不能编辑
                            if (that.user.allow('gifUploadUsing')) {
                                eqxElement.isSelected = true
                                arr.push(eqxElement)
                            }
                        } else if (eqxElement.combineBox && !eqxElement.combineBox.elementJson.property.lock) {
                            eqxElement.isSelected = true
                            // arr.push(eqxElement)
                            arr.concat(eqxElement.combineBox.childElements)
                        } else if (!eqxElement.combineBox) {
                            eqxElement.isSelected = true
                            arr.push(eqxElement)
                        }
                    }
                } else {
                    if (index < eqxElements.length) {
                        eqxElement.isSelected = false
                    }
                }
            })
            Vue.store.commit('ELEMENT_SELECT', { eqxElements: arr })
        }

        /**
         * 获取组件在workspace上的中心位置
         */
        function getElementsCenterPos(eqxElements, workspaceLeft, workspaceTop) {
            return eqxElements.map(eqxElement => {
                const { left, top, width, height } = eqxElement.$el.getBoundingClientRect()
                return {
                    x: left - workspaceLeft + width / 2,
                    y: top - workspaceTop + height / 2
                }
            })
        }

        // 根据本地历史显示标尺
        this.getRulerConfigHistory()
    },
    methods: {
        getRulerConfigHistory() {
            const key = storageLocal.key.rulerConfigHistory
            const res = storageLocal.getItem(key)
            if (res) {
                Vue.store.commit('RULER_ADD', { show: res.show, xLines: res.xLines, yLines: res.yLines })
            }
        },
        renderPage() {
            this.$refs.editor.renderPage()
        },
        nav2bg() {
            const navs = this.nav.list.filter((v, i) => v.type === 'background')
            const item = navs[0]
            this.$store.commit('LAYOUT_NAV', { item })
            this.$store.commit('LAYOUT_NAV_PANEL', { show: true })
        }
    }
}
</script>

<style lang="scss">
.eqc-workspace {
    background: #eceef0;
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 0; // 画面放大后，这个尺寸也是固定的。虽然不知道为何要给一个固定值
    height: 100%;
    overflow: hidden;
    .safe-space {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
    }
    .select-box {
        display: none;
        position: absolute;
        border: 1px solid #1593ff;
        background: rgba(21, 147, 255, 0.1);
    }
    .scale-tip {
        position: absolute;
        top: 8px;
        left: 50%;
        height: 36px;
        padding-right: 10px;
        line-height: 36px;
        box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
        border-radius: 3px;
        color: #1593ff;
        background: #fff;
        transform: translateX(-50%);
        .icon {
            margin: 10px;
            font-size: 16px;
        }
    }
    .art-font-tip {
        position: absolute;
        top: 50px;
        left: 50%;
        height: 36px;
        padding-right: 10px;
        line-height: 36px;
        box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
        border-radius: 3px;
        color: #1593ff;
        background: #fff;
        transform: translateX(-50%);
        .icon {
            margin: 10px;
            font-size: 16px;
        }
    }
    .eqc-background {
        background: url("../../../img/opacity_40.png") center;
    }
    .empty-tip {
        // z-index: 1;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
        position: absolute;
        .icon {
            width: 33px;
            height: 24px;
        }
        .text {
            margin-top: 10px;
            font-size: 12px;
            font-weight: 400;
            color: rgba(79, 93, 105, 1);
            line-height: 17px;
            .bg {
                color: #1593ff;
                cursor: pointer;
            }
        }
    }
}
</style>
