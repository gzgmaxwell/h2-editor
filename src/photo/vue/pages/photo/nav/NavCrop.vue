<template>
    <div class="eqc-photo-nav-crop">
        <ul class="module module-crop">
            <li
                class="module-item"
                data-type="base"
                data-status="false"
            >
                <div
                    class="title"
                    @click="titleClick"
                >
                    基础裁剪
                    <i class="eqf-down arrow" />
                </div>
                <div
                    data-height="105"
                    class="content"
                >
                    <div class="setting base-crop">
                        <div class="row row1">
                            <div
                                class="base-drop-down"
                                @click="baseCrop.openSelectModeControl = !baseCrop.openSelectModeControl"
                            >
                                <span class="ellipsis">{{ baseCrop.selectedMode.name }}</span>
                                <div
                                    class="triangle"
                                >
                                    <i class="icon eqf-menu-down" />
                                </div>
                                <base-drop-down
                                    v-if="baseCrop.openSelectModeControl"
                                    :list="baseCrop.modeList"
                                    :style="`${mode!==PhotoModeType.independent?'top:calc(-100% + 92px) !important':''}`"
                                    :css="{left: '0px', top: '31px', paddingBottom: '10px', width: '100%', zIndex: 3}"
                                    :selected-item="baseCrop.selectedMode"
                                    :max-item-num="4"
                                    item-key="id"
                                    @choose="baseCropTypeChoose"
                                />
                            </div>
                        </div>
                        <div class="row row2">
                            <span class="inptu-left input-width-left">宽</span>
                            <span class="inptu-left input-height-left">高</span>
                            <base-input-simple
                                ref="cropSizeWidthInput"
                                :change="widthChange"
                                class="base-crop-size"
                            />
                            <base-input-simple
                                ref="cropSizeHeightInput"
                                :change="heightChange"
                                class="base-crop-size base-crop-size-height"
                            />
                        </div>
                        <div class="row row3">
                            <label
                                class="lock-scale"
                                @click="lockScaleClick"
                            >
                                <div
                                    :class="{active: baseCrop.lockScale}"
                                    class="eqc-base-checkbox"
                                >
                                    <i class="icon eqf-yes" />
                                </div>
                                锁定比例</label>
                        </div>
                    </div>
                    <nav-button-group
                        :id="'base'"
                        :cancle="cancle"
                        :apply="apply"
                    />
                </div>
            </li>
            <li
                class="module-item"
                data-type="advanced"
                data-status="false"
            >
                <div
                    class="title"
                    @click="titleClick"
                >
                    高级裁剪
                    <i class="eqf-down arrow" />
                </div>
                <div
                    data-height="400"
                    class="content"
                >
                    <div
                        ref="advancedCrop"
                        v-photo-scroll-bar="{onScrollMove}"
                        class="setting advanced-crop"
                    >
                        <ul class="svg-list">
                            <template
                                v-for="svgItem of advancedCrop.svgList"
                            >
                                <nav-crop-svg-item
                                    :key="svgItem.id"
                                    :selected="svgSelected"
                                    :item="svgItem"
                                />
                            </template>
                        </ul>
                    </div>
                    <nav-button-group
                        :id="'advancedCrop'"
                        :cancle="cancle"
                        :apply="apply"
                    />
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import NavButtonGroup from './NavButtonGroup.vue'
import util from '../../../../../utils/util'
import loader from '../../../../../utils/loader'
import EnumGoodsType from '../../../../../config/enum.goods.type'
import NavCropSvgItem from './NavCropSvgItem.vue'
import elementType from '../../../../../config/enum.element.type'
import EqxScene from '../../../../core/scene'
import EqxPage from '../../../../core/html/page'
import PhotoModeType from '../../../../../config/enum.photoMode.type'
import historyType from '../../../../../config/enum.photoHistory.type'

export default {
    components: {
        // 取消、应用按钮组合
        NavButtonGroup,
        NavCropSvgItem
    },
    props: {
        mode: {
            type: Number,
            default: 1
        }
    },
    data() {
        return {
            historyType,
            PhotoModeType: PhotoModeType,
            cropType: null, // 裁剪类型：基础裁剪||高级裁剪
            baseCrop: {
                status: false,
                openSelectModeControl: false,
                modeList: [
                    { id: '0', name: '自由', width: null, height: null, top: null, left: null, whRatio: 0, mode: 'free', allowReSize: true },
                    { id: '1', name: '1:1', width: null, height: null, top: null, left: null, whRatio: 1, mode: 'fixed_WH_Ratio', allowReSize: true },
                    { id: '2', name: '1:2', width: null, height: null, top: null, left: null, whRatio: 1 / 2, mode: 'fixed_WH_Ratio', allowReSize: true },
                    { id: '3', name: '2:1', width: null, height: null, top: null, left: null, whRatio: 2 / 1, mode: 'fixed_WH_Ratio', allowReSize: true },
                    { id: '4', name: '1:3', width: null, height: null, top: null, left: null, whRatio: 1 / 3, mode: 'fixed_WH_Ratio', allowReSize: true },
                    { id: '5', name: '3:1', width: null, height: null, top: null, left: null, whRatio: 3 / 1, mode: 'fixed_WH_Ratio', allowReSize: true },
                    { id: '6', name: '1:4', width: null, height: null, top: null, left: null, whRatio: 1 / 4, mode: 'fixed_WH_Ratio', allowReSize: true },
                    { id: '7', name: '4:1', width: null, height: null, top: null, left: null, whRatio: 4 / 1, mode: 'fixed_WH_Ratio', allowReSize: true },
                    { id: '8', name: '4:3', width: null, height: null, top: null, left: null, whRatio: 4 / 3, mode: 'fixed_WH_Ratio', allowReSize: true },
                    { id: '9', name: '3:4', width: null, height: null, top: null, left: null, whRatio: 3 / 4, mode: 'fixed_WH_Ratio', allowReSize: true },
                    { id: '10', name: '2:3', width: null, height: null, top: null, left: null, whRatio: 2 / 3, mode: 'fixed_WH_Ratio', allowReSize: true },
                    { id: '11', name: '3:2', width: null, height: null, top: null, left: null, whRatio: 3 / 2, mode: 'fixed_WH_Ratio', allowReSize: true },
                    { id: '12', name: '16:9', width: null, height: null, top: null, left: null, whRatio: 16 / 9, mode: 'fixed_WH_Ratio', allowReSize: true },
                    { id: '13', name: '9:16', width: null, height: null, top: null, left: null, whRatio: 9 / 16, mode: 'fixed_WH_Ratio', allowReSize: true },
                    { id: '14', name: '21:9', width: null, height: null, top: null, left: null, whRatio: 21 / 9, mode: 'fixed_WH_Ratio', allowReSize: true },
                    { id: '15', name: '9:21', width: null, height: null, top: null, left: null, whRatio: 9 / 21, mode: 'fixed_WH_Ratio', allowReSize: true },
                    { id: '16', name: '1/3横', width: null, height: null, top: null, left: null, whRatio: null, mode: 'fixed_WH', allowReSize: false },
                    { id: '17', name: '1/2横', width: null, height: null, top: null, left: null, whRatio: null, mode: 'fixed_WH', allowReSize: false },
                    { id: '18', name: '1/3竖', width: null, height: null, top: null, left: null, whRatio: null, mode: 'fixed_WH', allowReSize: false },
                    { id: '19', name: '1/2竖', width: null, height: null, top: null, left: null, whRatio: null, mode: 'fixed_WH', allowReSize: false }
                ],
                selectedMode: { id: '0', name: '自由', width: null, height: null, top: null, left: null, whRatio: 0, mode: 'free', allowReSize: true },
                modeFree: { id: '0', name: '自由', whRatio: 0, mode: 'free', allowReSize: true },
                lockScale: false
            },
            advancedCrop: {
                svgList: []
            }
        }
    },
    computed: {
        photoLayout() {
            return Vue.store.state.photoLayout
        },
        photoScene() {
            return Vue.store.state.photoScene
        },
        eqxScene() {
            return this.photoScene.eqxScene
        },
        eqxPage() {
            return this.photoScene.eqxPage
        },
        eqxPageWidth() {
            return this.eqxPage.$el.offsetWidth
        },
        eqxPageHeight() {
            return this.eqxPage.$el.offsetHeight
        },
        toolCropChangeEvent() {
            return this.photoLayout.toolCropChangeEvent
        },
        itemClickEvent() {
            return this.photoLayout.nav.itemClickEvent
        },
        photoHistory() {
            return Vue.store.state.photoHistory
        },
        selectType() {
            return Vue.store.state.photoLayout.nav.selectedItem.type
        },
        background() {
            return Vue.store.state.photoCrop.background
        },
        isHistoryChangeNav() {
            return this.photoScene.isHistoryChangeNav
        }
    },
    watch: {
        toolCropChangeEvent: {
            handler(newVal, oldVal) {
                if (newVal) {
                    if (newVal.action === 'resize') {
                        this.setCropInputVal(newVal.params.width, newVal.params.height)
                    } else if (newVal.action === 'newimg' && this.cropType !== null) {
                        this.closeAllMenu()
                    }
                }
            },
            immediate: true,
            deep: true
        },
        itemClickEvent() {
            if (this.photoLayout.nav.selectedItem !== this.photoLayout.nav.list[1]) {
                this.closeAllMenu()
                this.eqxPage.clearCrop()
            } else {
                if (this.isHistoryChangeNav) {
                    return
                }
                document.querySelector('div.eqc-photo-nav-crop.content > ul > li:nth-child(1) > div.title').click()
            }
        },
        background: {
            handler(newVal, oldVal) {
                if (newVal && newVal !== null) {
                    const background = {
                        src: newVal.base64Str,
                        width: newVal.width,
                        height: newVal.height
                    }
                    this.eqxPage.eqxBackground.setBackground(background)
                    // 更新页面大小为图片大小
                    Vue.store.commit('PHOTO_SCENE_SIZE_CHANGE', { width: newVal.width, height: newVal.height })
                    const $elWorkspace = this.eqxPage.$el.parentElement
                    this.eqxPage.setScale('fit', $elWorkspace.offsetWidth, $elWorkspace.offsetHeight)
                }
            },
            deep: true
        }
    },
    created() {
        Vue.loading.open('正在加载形状')
        Vue.api.product.getNewProducts({
            pageNo: 1,
            pageSize: 52,
            apiCode: Vue.env.mall.apiCode[0],
            categoryId: util.isTestEnvironment() ? EnumGoodsType.goodsType.frame[0] : EnumGoodsType.goodsType.frame[1],
            tab: 'sys',
            mostType: 'sort'
        }).then(res => {
            if (res.data.list) {
                this.advancedCrop.svgList = res.data.list
                Vue.loading.close()
            }
        }).catch(err => {
            err && Vue.logger.error(err)
        })
    },
    mounted() {
        document.querySelector('div.eqc-photo-nav-crop.content > ul > li:nth-child(1) > div.title').click()
    },
    methods: {
        // 点击标题
        titleClick() {
            const clickLiDataType = event.currentTarget.parentNode.attr('data-type')
            const opeartPromise = new Promise((resolve, reject) => {
                resolve()
                // if (this.cropType === null) {
                //     resolve()
                // } else {
                //     Vue.dialog.openConfirm({
                //         msg: '修改尚未应用',
                //         confirmName: '应用',
                //         cancelName: '不应用'
                //     }).then(() => {
                //         // 应用当前操作
                //         resolve()
                //     }).catch(() => {
                //         resolve()
                //     })
                // }
            })
            opeartPromise.then(() => {
                this.eqxPage.clearCrop()
                const liNodes = document.querySelector('.module-crop').querySelectorAll('li.module-item')
                for (let i = 0; i < liNodes.length; i++) {
                    const liItem = liNodes[i]
                    const arrowDom = liItem.querySelector('i.arrow')
                    const contentDom = liItem.children[1]
                    const haveButtonGroup = liItem.children[1].querySelector('.eqc-photo-botton-group')
                    const BUTTON_GROUP_HEIGHT = 68
                    if (liItem.attr('data-type') === clickLiDataType) {
                        if (liItem.attr('data-status') === 'true') {
                            // 关闭
                            arrowDom.className = 'eqf-down arrow'
                            contentDom.style.height = '0px'
                            liItem.attr('data-status', 'false')
                            this.cropType = null
                            this.baseCrop.selectedMode = this.baseCrop.modeFree
                            this.baseCrop.openSelectModeControl = false
                        } else {
                            // 打开
                            arrowDom.className = 'eqf-right arrow'
                            contentDom.style.height = parseInt(contentDom.attr('data-height')) + (haveButtonGroup ? BUTTON_GROUP_HEIGHT : 0) + 'px'
                            liItem.attr('data-status', 'true')
                            this.cropType = clickLiDataType
                            setTimeout(() => this.$refs.advancedCrop && this.$refs.advancedCrop.myScroll.refresh(), 300)
                        }
                    } else {
                        if (liItem.attr('data-status') === 'true') {
                            // 关闭
                            arrowDom.className = 'eqf-down arrow'
                            contentDom.style.height = '0px'
                            liItem.attr('data-status', 'false')
                            this.baseCrop.selectedMode = this.baseCrop.modeFree
                            this.baseCrop.openSelectModeControl = false
                        }
                    }
                }
                if (this.cropType === 'base') {
                    this.setSideBar(false)
                    // 基础裁剪
                    const percent = 0.9
                    const svgWidth = this.eqxScene.sceneJson.width * percent
                    const svgHeight = this.eqxScene.sceneJson.height * percent
                    // 设置宽高控件最大最小值
                    this.setCropInputRange(0, this.eqxScene.sceneJson.width, 0, this.eqxScene.sceneJson.height)
                    // 设置宽高控件值
                    this.setCropInputVal(parseInt(svgWidth), parseInt(svgHeight))
                    // 增加矩形裁切组件
                    this.eqxPage.addElement({
                        css: {
                            cursor: 'move',
                            width: `${svgWidth}px`,
                            height: `${svgHeight}px`,
                            left: `${(this.eqxScene.sceneJson.width - svgWidth) / 2}px`,
                            top: `${(this.eqxScene.sceneJson.height - svgHeight) / 2}px`
                        },
                        property: {
                            svgSrc: 'group1/M00/B1/A3/yq0KXFZysi-ACYaKAAACDQH4Nes625.svg',
                            imageBase64: this.eqxPage.pageJson.properties.background.src,
                            lockScale: false,
                            allowResize: true
                        },
                        type: 109
                    })
                    const cropElement = this.getCropElement()
                    cropElement.elementBox.$el.css({ display: 'block' })
                } else if (this.cropType === 'advanced') {
                    this.setSideBar(false)
                    // 高级裁剪
                    document.querySelector('div.setting.advanced-crop > ul > li:nth-child(1)').click()
                } else {
                    this.setSideBar(true)
                }
            })
        },
        // 关闭所有菜单
        closeAllMenu() {
            this.setSideBar(true)
            this.baseCrop.selectedMode = this.baseCrop.modeFree
            const liNodes = document.querySelector('.module-crop').querySelectorAll('li.module-item')
            for (let i = 0; i < liNodes.length; i++) {
                const liItem = liNodes[i]
                const arrowDom = liItem.querySelector('i.arrow')
                const contentDom = liItem.children[1]
                if (liItem.attr('data-status') === 'true') {
                    // 关闭
                    arrowDom.className = 'eqf-down arrow'
                    contentDom.style.height = '0px'
                    liItem.attr('data-status', 'false')
                    this.cropType = null
                    this.baseCrop.openSelectModeControl = false
                }
            }
        },
        // 基础裁剪模式选择
        baseCropTypeChoose(item) {
            // 隐藏模式选择
            event.stopPropagation()
            this.baseCrop.openSelectModeControl = !this.baseCrop.openSelectModeControl
            // 设置当前选中项
            this.baseCrop.selectedMode = item
            // 自由模式锁定比例不勾选  非自由模式锁定比例勾选
            this.baseCrop.lockScale = item.id !== '0'
            let svgWidth, svgHeight, svgLeft, svgTop
            const percent = 0.9
            if (item.allowReSize) {
                if (item.id === this.baseCrop.modeFree.id) {
                    // 自由
                    svgWidth = this.eqxScene.sceneJson.width * percent
                    svgHeight = this.eqxScene.sceneJson.height * percent
                    svgLeft = (this.eqxScene.sceneJson.width - svgWidth) / 2
                    svgTop = (this.eqxScene.sceneJson.height - svgHeight) / 2
                } else {
                    // 非自由固定比例
                    const minSideValue = Math.min(this.eqxScene.sceneJson.width, this.eqxScene.sceneJson.height)
                    if (item.whRatio === 1) {
                        svgWidth = minSideValue * percent
                        svgHeight = minSideValue * percent
                    } else if (item.whRatio > 1) {
                        svgWidth = minSideValue * percent
                        svgHeight = svgWidth / item.whRatio
                    } else {
                        svgHeight = minSideValue * percent
                        svgWidth = svgHeight * item.whRatio
                    }
                    svgLeft = (this.eqxScene.sceneJson.width - svgWidth) / 2
                    svgTop = (this.eqxScene.sceneJson.height - svgHeight) / 2
                }
            } else {
                const curCropName = this.baseCrop.selectedMode.name
                if (curCropName === '1/2横') {
                    svgWidth = this.eqxScene.sceneJson.width
                    svgHeight = this.eqxScene.sceneJson.height / 2
                    svgTop = this.eqxScene.sceneJson.height / 4
                    svgLeft = 0
                } else if (curCropName === '1/3横') {
                    svgWidth = this.eqxScene.sceneJson.width
                    svgHeight = this.eqxScene.sceneJson.height / 3
                    svgTop = this.eqxScene.sceneJson.height * (2 / 3) / 2
                    svgLeft = 0
                } else if (curCropName === '1/2竖') {
                    svgWidth = this.eqxScene.sceneJson.width / 2
                    svgHeight = this.eqxScene.sceneJson.height
                    svgTop = 0
                    svgLeft = this.eqxScene.sceneJson.width / 4
                } else if (curCropName === '1/3竖') {
                    svgWidth = this.eqxScene.sceneJson.width / 3
                    svgHeight = this.eqxScene.sceneJson.height
                    svgTop = 0
                    svgLeft = this.eqxScene.sceneJson.width * (2 / 3) / 2
                }
            }
            svgWidth = `${svgWidth}px`
            svgHeight = `${svgHeight}px`
            svgLeft = `${svgLeft}px`
            svgTop = `${svgTop}px`
            this.changeCropElementSize(svgWidth, svgHeight, svgLeft, svgTop)
            this.changeCropElementAllowResize(item.allowReSize, this.baseCrop.lockScale)
        },
        // 宽改变事件
        widthChange(pVal) {
            this.changeCropElementSize(pVal, undefined, undefined, undefined)
        },
        // 高改变事件
        heightChange(pVal) {
            this.changeCropElementSize(undefined, pVal, undefined, undefined)
        },
        // 设置宽高值的范围
        setCropInputRange(pMinWidth, pMaxWidth, pMinHeight, pMaxHeight) {
            this.$refs.cropSizeWidthInput.setValueRange(pMinWidth, pMaxWidth)
            this.$refs.cropSizeHeightInput.setValueRange(pMinHeight, pMaxHeight)
        },
        // 设置宽高值
        setCropInputVal(pWidth, pHeight) {
            if (pWidth) {
                this.$refs.cropSizeWidthInput.setValue(pWidth)
            }
            if (pHeight) {
                this.$refs.cropSizeHeightInput.setValue(pHeight)
            }
        },
        // 获取裁切框元素
        getCropElement() {
            const cropElement = this.eqxPage.eqxElements.filter(item => {
                return item.elementJson.type === elementType.crop
            })[0]
            return cropElement
        },
        // 设置裁切框元素的大小
        changeCropElementSize(width, height, left, top) {
            const cropElement = this.getCropElement()
            cropElement.updateCss({
                width: `${width || cropElement.elementJson.css.width}`,
                height: `${height || cropElement.elementJson.css.height}`,
                left: `${left || cropElement.elementJson.css.left}`,
                top: `${top || cropElement.elementJson.css.top}`
            })
        },
        // 设置裁切框元素属性是否允许改变的大小以及是否锁定比例
        changeCropElementAllowResize(pAllowResize, pLockScale) {
            const cropElement = this.getCropElement()
            cropElement.updateProperty({
                allowResize: pAllowResize,
                lockScale: pLockScale
            })
        },
        // 比例锁定点击
        lockScaleClick() {
            // 设置相反状态
            this.baseCrop.lockScale = !this.baseCrop.lockScale
            // 如果不锁定则自动切换到自由模式
            if (this.baseCrop.lockScale) {
                // 锁定
                if (this.baseCrop.selectedMode.id === this.baseCrop.modeFree.id) {
                    // 自由模式下 锁定
                    this.changeCropElementAllowResize(true, true)
                }
            } else {
                // 未锁定 切换到自由模式
                this.baseCrop.selectedMode = this.baseCrop.modeFree
                this.changeCropElementAllowResize(true, false)
            }
        },
        // 高级裁剪
        svgSelected(pSvg) {
            this.eqxPage.clearCrop()
            const svgSrc = pSvg.productTypeMap.path
            loader.svg(svgSrc).then($svgTemp => {
                const svgOriginWidth = parseFloat($svgTemp.attr('width'))
                const svgOriginHeight = parseFloat($svgTemp.attr('height'))
                const percent = 0.9
                let svgWidth, svgHeight
                const minSideValue = Math.min(this.eqxScene.sceneJson.width, this.eqxScene.sceneJson.height)
                if (svgOriginWidth === svgOriginHeight) {
                    svgWidth = minSideValue * percent
                    svgHeight = minSideValue * percent
                } else if (svgOriginWidth > svgOriginHeight) {
                    svgWidth = minSideValue * percent
                    svgHeight = svgWidth * (svgOriginHeight / svgOriginWidth)
                } else {
                    svgHeight = minSideValue * percent
                    svgWidth = svgHeight * (svgOriginWidth / svgOriginHeight)
                }
                this.eqxPage.addElement({
                    css: {
                        cursor: 'move',
                        width: `${svgWidth}px`,
                        height: `${svgHeight}px`,
                        left: `${(this.eqxScene.sceneJson.width - svgWidth) / 2}px`,
                        top: `${(this.eqxScene.sceneJson.height - svgHeight) / 2}px`
                    },
                    property: {
                        svgSrc: svgSrc,
                        imageBase64: this.eqxPage.pageJson.properties.background.src,
                        lockScale: false,
                        allowResize: true
                    },
                    type: 109
                })
                const cropElement = this.getCropElement()
                cropElement.elementBox.$el.css({ display: 'block' })
            })
        },
        // 取消
        cancle(pId) {
            this.cropType = null
            this.baseCrop.selectedMode = this.baseCrop.modeFree
            this.eqxPage.clearCrop()
            // 清除选中组件
            Vue.store.commit('PHOTO_ELEMENT_SELECT', { eqxElements: [] })
            this.setSideBar(true)
            const liNodes = document.querySelector('.module-crop').querySelectorAll('li.module-item')
            for (let i = 0; i < liNodes.length; i++) {
                const liItem = liNodes[i]
                const arrowDom = liItem.querySelector('i.arrow')
                const contentDom = liItem.children[1]
                if (liItem.attr('data-status') === 'true') {
                    // 关闭
                    arrowDom.className = 'eqf-down arrow'
                    contentDom.style.height = '0px'
                    liItem.attr('data-status', 'false')
                }
            }
        },
        // 应用
        apply(pId) {
            Vue.loading.open('裁切中')
            const cropElement = this.getCropElement()
            const sceneWidth = this.eqxScene.sceneJson.width
            const sceneHeight = this.eqxScene.sceneJson.height
            let cropWidth, cropHeight, cropTop, cropLeft
            const width = parseInt(cropElement.elementJson.css.width)
            const height = parseInt(cropElement.elementJson.css.height)
            const top = parseInt(cropElement.elementJson.css.top)
            const left = parseInt(cropElement.elementJson.css.left)
            if (top < 0) {
                cropTop = 0
                cropHeight = height + top
                if (cropHeight > sceneHeight) {
                    cropHeight = sceneHeight
                }
            } else {
                cropTop = top
                if (cropTop + height > sceneHeight) {
                    cropHeight = sceneHeight - cropTop
                } else {
                    cropHeight = height
                }
            }
            if (left < 0) {
                cropLeft = 0
                cropWidth = width + left
                if (cropWidth > sceneWidth) {
                    cropWidth = sceneWidth
                }
            } else {
                cropLeft = left
                if (cropLeft + width > sceneWidth) {
                    cropWidth = sceneWidth - cropLeft
                } else {
                    cropWidth = width
                }
            }
            // 验证两个矩形是否重叠
            const checkCropResult = this.checkCrop({
                x: 0,
                y: 0,
                width: sceneWidth,
                height: sceneHeight
            }, {
                x: cropLeft,
                y: cropTop,
                width: cropWidth,
                height: cropHeight
            })
            if (!checkCropResult) {
                this.notifier.warn('请选择正确的区域')
                Vue.loading.close()
                return
            }
            // this.addHistory()
            if (this.cropType === 'base') {
                this.eqxPage.clearCrop()
                this.doCrop(this.curBackgroundCanvas(), cropLeft, cropTop, cropWidth, cropHeight)
            } else if (this.cropType === 'advanced') {
                const { pageJson, eqxScene } = this.eqxPage
                const eqxSceneNew = new EqxScene(JSON.parse(JSON.stringify(eqxScene.sceneJson)))
                const eqxPageNew = new EqxPage(JSON.parse(JSON.stringify(pageJson)), eqxSceneNew)
                eqxPageNew.page2CanvasWithOutBackground()
                    .then(res => {
                        this.eqxPage.clearCrop()
                        this.doCrop(res, cropLeft + 2, cropTop + 2, cropWidth, cropHeight)
                    })
                    .catch(err => {
                        err && this.logger.error(err)
                    })
            }
        },
        // 验证裁切面积是否大于0
        checkCrop(rect1, rect2) {
            const l1 = { x: rect1.x, y: rect1.y }
            const r1 = { x: rect1.x + rect1.width, y: rect1.y + rect1.height }
            const l2 = { x: rect2.x, y: rect2.y }
            const r2 = { x: rect2.x + rect2.width, y: rect2.y + rect2.height }
            if (l1.x > r2.x || l2.x > r1.x || l1.y > r2.y || l2.y > r1.y) {
                return false
            }
            return true
        },
        // 做裁切替换当前背景
        doCrop(bgCanvas, cropLeft, cropTop, cropWidth, cropHeight) {
            const bgCanvasCtx = bgCanvas.getContext('2d')
            const bgCropImgData = bgCanvasCtx.getImageData(cropLeft, cropTop, cropWidth, cropHeight)
            const newBgCanvas = document.createElement('canvas')
            newBgCanvas.width = cropWidth
            newBgCanvas.height = cropHeight
            const ctx = newBgCanvas.getContext('2d')
            ctx.putImageData(bgCropImgData, 0, 0)
            const background = {
                src: newBgCanvas.toDataURL(),
                width: cropWidth,
                height: cropHeight
            }
            this.eqxPage.eqxBackground.setBackgroundPromise(background).then(() => {
                this.addHistory()
            })
            // 更新页面大小为图片大小
            Vue.store.commit('PHOTO_SCENE_SIZE_CHANGE', { width: cropWidth, height: cropHeight })
            const $elWorkspace = this.eqxPage.$el.parentElement
            this.eqxPage.setScale('fit', $elWorkspace.offsetWidth, $elWorkspace.offsetHeight)
            // 关闭所有菜单
            this.closeAllMenu()
            Vue.loading.close()
        },
        setSideBar(show) {
            Vue.store.commit('PHOTO_SIDE_BAR', { show })
        },
        curBackgroundCanvas() {
            return document.querySelector('.eqc-photo-background-image')
        },
        addHistory() {
            const bgCanvas = this.curBackgroundCanvas()
            this.photoHistory.history.insert({ width: bgCanvas.width, height: bgCanvas.height }, bgCanvas.toDataURL(), this.historyType.crop, false)
        },
        onScrollMove(e, info) {
        }
    }
}
</script>

<style lang="scss">
.eqc-photo-nav-crop {
    ul.module {
        list-style: none;
        font-size: 14px;
        font-weight: 500;
        color: rgba(29, 32, 37, 1);
        overflow: auto;
        li.module-item {
            height: auto;
            border-bottom: 1px solid rgba(230, 233, 236, 1);
            .title {
                height: 60px;
                padding-left: 24px;
                cursor: pointer;
                line-height: 60px;
                font-weight: bold;
                i.arrow {
                    font-size: 20px;
                    color: #4f5d69;
                    position: relative;
                    float: right;
                    right: 20px;
                    top: 20px;
                }
                &:hover {
                    background: #f7f8f9;
                }
            }
            .content {
                height: 0px;
                transition: all 0.3s;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                .setting {
                    flex: 1;
                    &.base-crop {
                        padding: 0px 24px 0px 24px;
                        .row {
                            width: 100%;
                        }
                        .row1 {
                            height: 32px;
                            .base-drop-down {
                                position: relative;
                                cursor: pointer;
                                background: white;
                                border-radius: 3px;
                                width: auto;
                                display: flex;
                                padding-left: 12px;
                                justify-content: space-between;
                                align-items: center;
                                height: 32px;
                                border: 1px solid #ccd5db;
                                font-size: 13px;
                                color: #2f3c4d;
                                .triangle {
                                    display: block;
                                    width: 36px;
                                    height: 36px;
                                    font-size: 20px;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    transition: all 0.3s;
                                    i {
                                        color: #76838f;
                                    }
                                }
                                .eqc-drop-dwon {
                                    position: fixed;
                                    left: 92px !important;
                                    top: 92px !important;
                                    padding-bottom: 10px !important;
                                    width: 239px !important;
                                    z-index: 99 !important;
                                    .wrap {
                                        min-height: 250px !important;
                                    }
                                }
                            }
                        }
                        .row2 {
                            height: 32px;
                            margin-top: 12px;
                            position: relative;
                            .base-crop-size {
                                display: inline-block;
                                width: 112px;
                                input {
                                    border-radius: 3px;
                                    height: 32px;
                                    text-indent: 32px;
                                }
                            }
                            .base-crop-size-height {
                                margin-left: 11px;
                            }
                            .inptu-left {
                                width: 32px;
                                height: 32px;
                                display: block;
                                position: absolute;
                                background: #f7f8f9;
                                border-radius: 3px 0px 0px 3px;
                                border: 1px solid rgba(204, 213, 219, 1);
                                z-index: 1;
                                line-height: 32px;
                                text-align: center;
                                color: #666666;
                            }
                            .input-height-left {
                                left: 127px;
                            }
                        }
                        .row3 {
                            height: 16px;
                            margin-top: 12px;
                            .lock-scale {
                                cursor: pointer;
                                font-size: 13px;
                                font-weight: 400;
                                color: rgba(79, 93, 105, 1);
                                .eqc-base-checkbox {
                                    vertical-align: text-bottom;
                                    margin-right: 4px;
                                    position: relative;
                                    display: inline-flex;
                                    align-items: center;
                                    justify-content: center;
                                    width: 16px;
                                    height: 16px;
                                    border: 1px solid #ccd5db;
                                    border-radius: 3px;
                                    cursor: pointer;
                                    transition: all 0.3s;
                                    &.active {
                                        border: 1px solid #1593ff;
                                        background: #1593ff;
                                        .icon {
                                            opacity: 1;
                                        }
                                    }
                                    .icon {
                                        color: #fff;
                                        opacity: 0;
                                        transition: all 0.3s;
                                    }
                                    input {
                                        position: absolute;
                                        left: 0;
                                        top: 0;
                                        width: 100%;
                                        height: 100%;
                                        opacity: 0;
                                        cursor: pointer;
                                        pointer-events: none;
                                    }
                                }
                            }
                        }
                    }
                    &.advanced-crop {
                        position: relative;
                        overflow: hidden;
                        ul.svg-list {
                            list-style: none;
                            height: auto;
                            padding: 0px 24px 0px 24px;
                            position: relative;
                            display: flex;
                            flex-wrap: wrap;
                            justify-content: space-between;
                            overflow: overlay;
                            li {
                                width: 54px;
                                height: 54px;
                                margin-top: 5px;
                                border: none;
                                &:hover {
                                    box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.16);
                                    border-radius: 3px;
                                    background: #ffffff center/contain no-repeat;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
