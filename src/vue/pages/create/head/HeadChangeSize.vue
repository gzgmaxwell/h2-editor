<template>
    <div class="eqc-head-changesize">
        <div
            class="content"
        >
            <div
                class="picture-content"
            >
                <transition name="fade">
                    <div
                        v-show="tipShow"
                        class="scale-tip"
                    >
                        <i class="icon eqf-info-f fl" />
                        <span>更改尺寸预览</span>
                    </div>
                </transition>
                <div>
                    <div
                        v-for="(banner, index1) of banners.slice(1)"
                        :key="banner.name"
                    >
                        <div
                            class="title"
                        >
                            {{ banner.name }}
                        </div>
                        <ul
                            class="template"
                        >
                            <li
                                v-for="(item, index2) of banner.list"
                                :key="item.id"
                                :style="{animationDelay: (index1 * banner.list.length + index2) * 50 + 'ms'}"
                                class="item animation-fade-scale"
                            >
                                <div>
                                    <div
                                        :style="{width: item.width > item.height ? '160px' : `${item.width / item.height * 160}px`,height: item.width < item.height ? '160px' : `${item.height / item.width * 160}px`}"
                                        :class="{'active': item.check}"
                                        class="cover"
                                        @click="chooseSize(item.type, item.width, item.height, item.unit, item, false)"
                                    />
                                </div>
                                <div class="name">
                                    {{ item.name }}
                                </div>
                                <div class="size">
                                    {{ `${item.width}*${item.height} ${item.unit === 'mm' ? '毫米' : '像素'}` }}
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="bar-right">
            <div class="right-top">
                <span
                    ref="pContent"
                    class="title"
                >更改尺寸预览</span>
                <i
                    class="close eqf-no"
                    @click="cancel"
                />
            </div>
            <div
                :style="{backgroundImage: 'url('+curPreviewImgBase64Str+')'}"
                class="right-center"
            />
            <div class="right-bottom">
                <div
                    v-show="sizeTipShow"
                    class="size-tips"
                >
                    <i class="tip-icon eqf-alert-f" />
                    <label class="line-one">自定义尺寸范围为40px*40px至</label>
                    <label class="line-two">5000px*5000px</label>
                </div>
                <div
                    class="setSize"
                >
                    <base-input
                        :model="defaultSizeModel"
                        :min="0"
                        :max="5000"
                        model-key="width"
                    />
                    <i
                        class="size-and"
                    />
                    <base-input
                        :model="defaultSizeModel"
                        :min="0"
                        :max="5000"
                        model-key="height"
                    />
                    <base-button
                        class="white white-blue w44 h30"
                        @click.native="customChooseSize"
                    >
                        确定
                    </base-button>
                </div>
                <div
                    class="autoChangeSize"
                    @click="autoChangeSizeClick"
                >
                    <base-checkbox
                        id="checkbox-auto-change-size"
                        v-model="autoChangeSize"
                    />
                    <label class="lbl_txt">智能调整元素大小与位置</label>
                    <label class="new">限免</label>
                </div>
                <!-- <div
                    class="splitLine"
                /> -->
                <div
                    class="bottons"
                >
                    <base-button
                        :class="{disable: changeing || curImgSize === null}"
                        class="create-btn blue"
                        @click.native="create"
                    >
                        {{ changeing ? '调整中...' : '确定' }}
                    </base-button>
                    <a
                        class="help-btn"
                        target="blank"
                        href="//qingsheji.help.eqxiu.com/produce.html"
                    >
                        <i
                            :class="[{'eqf-why-l':!isHelpHover},{'eqf-why-f':isHelpHover}]"
                            @mouseover="isHelpHover = true"
                            @mouseleave="isHelpHover = false"
                        />
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import EqxScene from '../../../../core/scene'
import EqxPage from '../../../../core/html/page'
import EnumSceneType from '../../../../config/enum.scene.type'
const cloneDeep = require('lodash.clonedeep')

export default {
    props: {
        close: {
            type: Function,
            default: null
        },
        data: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            isHelpHover: false,
            tipShow: false,
            sizeTipShow: false,
            banners: [],
            changeing: false,
            defaultSizeModel: {
                width: '40px',
                height: '40px'
            },
            curPreviewImgBase64Str: '',
            curImgSize: null,
            autoChangeSize: true
        }
    },
    computed: {
        host() {
            return this.env.host
        },
        scene() {
            return Vue.store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        eqxScene() {
            return this.scene.eqxScene
        },
        sceneJson() {
            return this.eqxScene.sceneJson
        }
    },
    watch: {
        defaultSizeModel: {
            handler: function (newval, oldval) {
                const inputWidth = parseInt(newval.width)
                const inputHeight = parseInt(newval.height)
                if (inputWidth < 40 || inputHeight < 40 || inputWidth > 5000 || inputHeight > 5000) {
                    this.sizeTipShow = true
                } else {
                    this.sizeTipShow = false
                }
            },
            deep: true
        }
    },
    created() {
        this.api.banner.getSceneBanners()
            .then(res => {
                this.banners = res.data.list
                this.banners.forEach(obj => {
                    obj.list = obj.list.filter((item, index) => {
                        Vue.set(item, 'check', false)
                        Vue.set(item, 'id', obj.name + index)
                        return !EnumSceneType.isAllowAddGifToScene(item.type) && item.width !== null && item.height !== null
                    })
                })
            })
            .catch(err => err && this.logger.error(err))
    },
    mounted() {
        this.tipShow = true
        setTimeout(() => {
            this.tipShow = false
        }, 5000)
        this.getBackgroundImage(this.eqxPage.pageJson.cover)
        this.defaultSizeModel = {
            width: this.eqxPage.sceneWidth,
            height: this.eqxPage.sceneHeight
        }
    },
    methods: {
        cancel() {
            this.close()
        },
        create() {
            const sceneJson = this.sceneJson
            const type = this.curImgSize.type
            let width = this.curImgSize.width
            let height = this.curImgSize.height
            const bleed = this.curImgSize.bleed
            const unit = this.curImgSize.unit
            if (unit === 'mm') {
                width = Vue.filter('mm2px')(width)
                height = Vue.filter('mm2px')(height)
            }
            const info = {
                id: sceneJson.id,
                type: type,
                width: width,
                height: height,
                bleed: bleed,
                unit: unit
            }
            this.api.scene.updateScene(info)
                .then(res => {
                    if (this.autoChangeSize) {
                        sceneJson.oldWidth = sceneJson.width
                        sceneJson.oldHeight = sceneJson.height
                    }
                    sceneJson.type = type
                    sceneJson.width = width
                    sceneJson.height = height
                    sceneJson.bleed = bleed
                    sceneJson.unit = unit
                    this.updatePages()
                })
                .catch(err => err && this.logger.error(err))
        },
        updatePages(pPageIndex = 0) {
            const promist = new Promise((resolve, reject) => {
                this.loading.open('正在调整' + (pPageIndex + 1) + '/' + this.eqxScene.eqxPages.length + '页')
                const page = this.eqxScene.eqxPages[pPageIndex]
                const $elWorkspace = this.eqxPage.$el.parentElement
                Vue.store.commit('PAGE_CHANGE', { eqxPage: page })
                setTimeout(() => {
                    if (this.autoChangeSize) {
                        page.setScale('changeCategoryFit', $elWorkspace.offsetWidth, $elWorkspace.offsetHeight)
                    } else {
                        page.setScale('fit', $elWorkspace.offsetWidth, $elWorkspace.offsetHeight)
                    }
                    Vue.store.dispatch('PAGE_SAVE', { eqxPage: page, needCover: true })
                    this.loading.close()
                    resolve()
                }, 200)
            })
            promist.then((res) => {
                if (pPageIndex + 1 === this.eqxScene.eqxPages.length) {
                    this.close()
                    return
                }
                this.updatePages(pPageIndex + 1)
            })
        },
        getImage(src) {
            return this.host.file + Vue.filter('qiniuZoom')(src, 208)
        },
        getBackgroundImage(src) {
            // 显示区域宽高
            const areaWidth = 208
            const areaHeight = document.body.clientHeight - 76 - 175
            // 当前页面宽高
            const pageWidth = this.eqxPage.sceneWidth
            const pageHeight = this.eqxPage.sceneHeight
            // 显示区域宽高比
            const areaRatio = areaWidth / areaHeight
            // 当前页面宽高比
            const pageRatio = pageWidth / pageHeight
            let imgSizeWidth, imgSizeHeight, mode
            if (areaRatio < pageRatio) {
                mode = 'width'
                imgSizeWidth = areaWidth
                imgSizeHeight = imgSizeWidth / (pageWidth / pageHeight)
            } else {
                mode = 'height'
                imgSizeHeight = areaHeight
                imgSizeWidth = areaHeight * (pageWidth / pageHeight)
            }
            const imgSrc = this.host.file + Vue.filter('qiniuZoom')(src, imgSizeWidth > imgSizeHeight ? imgSizeWidth : imgSizeHeight)
            const canvas = document.createElement('canvas')
            const pixelRatio = window.devicePixelRatio || 1
            canvas.width = areaWidth * pixelRatio
            canvas.height = areaHeight * pixelRatio
            const ctx = canvas.getContext('2d')
            const img = new Image()
            img.crossOrigin = 'Anonymous'
            img.src = imgSrc
            const _self = this
            img.onload = function () {
                if (mode === 'equal') {
                    ctx.drawImage(img, 0, 0, this.width, this.height, 0, 0, this.width, this.height)
                } else if (mode === 'width') {
                    ctx.drawImage(img, 0, 0, this.width, this.height, 0, (areaHeight * pixelRatio - this.height) / 2, this.width, this.height)
                } else if (mode === 'height') {
                    ctx.drawImage(img, 0, 0, this.width, this.height, (areaWidth * pixelRatio - this.width) / 2, 0, this.width, this.height)
                }
                const url = canvas.toDataURL()
                _self.curPreviewImgBase64Str = url
            }
        },
        chooseSize(type, width = 0, height = 0, unit = 'px', item, forceUpdate) {
            this.loading.open('正在' + (this.autoChangeSize ? '智能' : '') + '调整')
            this.changeing = true
            const _self = this
            // 修改自定义宽度和高度
            if (unit === null || unit === '') {
                unit = 'px'
            }
            if (unit !== 'px') {
                width = Vue.filter('mm2px')(width)
                height = Vue.filter('mm2px')(height)
            }
            this.defaultSizeModel.width = width + 'px'
            this.defaultSizeModel.height = height + 'px'
            if (this.curImgSize !== null) {
                if (item === null || this.curImgSize.type !== item.type) {
                    this.curImgSize.check = false
                } else {
                    if (!forceUpdate) {
                        this.changeing = false
                        this.loading.close()
                        return
                    }
                }
            }
            if (item !== null) {
                item.check = !item.check
                this.curImgSize = item
            } else {
                this.curImgSize = {
                    type: type,
                    width: width,
                    height: height,
                    bleed: null,
                    unit: unit
                }
            }
            if (this.autoChangeSize) {
                // lodash 为了不报错 添加lenght属性
                this.eqxPage.eqxElements.forEach((item, index) => {
                    item.elementBox.length = 0
                })
                const colneCurPage = cloneDeep(this.eqxPage)
                // lodash 为了不报错 移除length属性
                this.eqxPage.eqxElements.forEach((item, index) => {
                    delete item.elementBox.length
                })
                // 拿到当前的page
                let elementScale
                let topDiff = 0
                let leftDiff = 0
                const oldWidth = colneCurPage.sceneWidth
                const oldHeight = colneCurPage.sceneHeight
                const newWidth = width
                const newHeight = height
                const oldEditorRatio = oldWidth / oldHeight
                const newEditorRatio = newWidth / newHeight
                if (oldEditorRatio === newEditorRatio) {
                    elementScale = newWidth / oldWidth
                    leftDiff = NaN
                    topDiff = NaN
                } else if (oldEditorRatio < newEditorRatio) {
                    elementScale = newHeight / oldHeight
                    leftDiff = (newWidth - (oldWidth * elementScale)) / 2
                } else {
                    elementScale = newWidth / oldWidth
                    topDiff = (newHeight - (oldHeight * elementScale)) / 2
                }
                colneCurPage.eqxScene.sceneJson.width = newWidth
                colneCurPage.eqxScene.sceneJson.height = newHeight
                colneCurPage.eqxElements.forEach((eqxElement) => {
                    if (eqxElement.combineBox === null) {
                        eqxElement.setScale(elementScale, topDiff, leftDiff)
                    }
                })
                const { pageJson, eqxScene } = colneCurPage
                // 调整当前page的参数
                const eqxSceneNew = new EqxScene(JSON.parse(JSON.stringify(eqxScene.sceneJson)))
                const eqxPageNew = new EqxPage(JSON.parse(JSON.stringify(pageJson)), eqxSceneNew)
                const canvasPromise = eqxPageNew.page2Canvas()
                Promise.all([canvasPromise])
                    .then(res => {
                        // 重新渲染当前页面
                        this.eqxPage.renderPage(this.eqxPage.pageJson)
                        const newCanvas = res[0]
                        // 将生成更改后的图放到显示区域
                        // 显示区域宽高
                        const areaWidth = 208
                        const areaHeight = document.body.clientHeight - 76 - 175
                        // 当前页面宽高
                        const pageWidth = width
                        const pageHeight = height
                        // 显示区域宽高比
                        const areaRatio = areaWidth / areaHeight
                        // 当前页面宽高比
                        const pageRatio = pageWidth / pageHeight
                        let imgSizeWidth, imgSizeHeight, mode
                        if (areaRatio === pageRatio) {
                            mode = 'equal'
                            imgSizeWidth = areaWidth
                            imgSizeHeight = areaHeight
                        } else if (areaRatio < pageRatio) {
                            mode = 'width'
                            imgSizeWidth = areaWidth
                            imgSizeHeight = imgSizeWidth / pageRatio
                        } else {
                            mode = 'height'
                            imgSizeHeight = areaHeight
                            imgSizeWidth = areaHeight * pageRatio
                        }
                        // 调整新的canvas大小
                        const newCanvasCtx = newCanvas.getContext('2d')
                        const newCanvasImg = new Image()
                        newCanvasImg.src = newCanvas.toDataURL()
                        newCanvasImg.width = imgSizeWidth
                        newCanvasImg.height = imgSizeHeight
                        newCanvasImg.onload = function () {
                            newCanvas.width = imgSizeWidth
                            newCanvas.height = imgSizeHeight
                            newCanvasCtx.drawImage(newCanvasImg, 0, 0, imgSizeWidth, imgSizeHeight)
                            // 创建用于预览的canvas
                            const canvas = document.createElement('canvas')
                            canvas.width = areaWidth
                            canvas.height = areaHeight
                            const ctx = canvas.getContext('2d')
                            // 将新的canva放到预览的canvas上面去
                            if (mode === 'equal') {
                                ctx.drawImage(newCanvas, 0, 0, newCanvas.width, newCanvas.height, 0, 0, newCanvas.width, newCanvas.height)
                            } else if (mode === 'width') {
                                ctx.drawImage(newCanvas, 0, 0, newCanvas.width, newCanvas.height, 0, (areaHeight - newCanvas.height) / 2, newCanvas.width, newCanvas.height)
                            } else if (mode === 'height') {
                                ctx.drawImage(newCanvas, 0, 0, newCanvas.width, newCanvas.height, (areaWidth - newCanvas.width) / 2, 0, newCanvas.width, newCanvas.height)
                            }
                            const url = canvas.toDataURL()
                            _self.curPreviewImgBase64Str = url
                            _self.changeing = false
                            _self.loading.close()
                        }
                    })
            } else {
                // 当前页面宽高
                const pageWidth = this.eqxPage.sceneWidth
                const pageHeight = this.eqxPage.sceneHeight
                let qiniuImageSize = pageWidth > pageHeight ? pageWidth : pageHeight
                // 解决七牛area is out of range [1, 24999999]
                if (qiniuImageSize * qiniuImageSize >= 24999999) {
                    while (qiniuImageSize * qiniuImageSize >= 24999999) {
                        qiniuImageSize = qiniuImageSize - 1
                    }
                }
                const imgSrc = this.host.file + Vue.filter('qiniuZoom')(this.eqxPage.pageJson.cover, qiniuImageSize)
                const newCanvas = document.createElement('canvas')
                newCanvas.width = width
                newCanvas.height = height
                const newCanvasCtx = newCanvas.getContext('2d')
                newCanvasCtx.fillStyle = '#ffffff'
                newCanvasCtx.fillRect(0, 0, width, height)
                const img = new Image()
                img.crossOrigin = 'Anonymous'
                img.src = imgSrc
                img.onload = function () {
                    // 将当前的图片画到目标尺寸的画布上
                    newCanvasCtx.drawImage(
                        img,
                        0, 0,
                        pageWidth < width ? pageWidth : width, pageHeight < height ? pageHeight : height,
                        0, 0,
                        pageWidth < width ? pageWidth : width, pageHeight < height ? pageHeight : height
                    )
                    // 显示区域宽高
                    const areaWidth = 208
                    const areaHeight = document.body.clientHeight - 76 - 175
                    // 显示区域宽高比
                    const areaRatio = areaWidth / areaHeight
                    // 当前页面宽高比
                    const pageRatio = width / height
                    let imgSizeWidth, imgSizeHeight, mode
                    if (areaRatio === pageRatio) {
                        mode = 'equal'
                        imgSizeWidth = areaWidth
                        imgSizeHeight = areaHeight
                    } else if (areaRatio < pageRatio) {
                        mode = 'width'
                        imgSizeWidth = areaWidth
                        imgSizeHeight = imgSizeWidth / pageRatio
                    } else {
                        mode = 'height'
                        imgSizeHeight = areaHeight
                        imgSizeWidth = areaHeight * pageRatio
                    }
                    // 将目标尺寸的画布缩小到当前预览区域
                    const newCanvasImg = new Image()
                    newCanvasImg.crossOrigin = 'Anonymous'
                    newCanvasImg.src = newCanvas.toDataURL()
                    newCanvasImg.width = imgSizeWidth
                    newCanvasImg.height = imgSizeHeight
                    newCanvasImg.onload = function () {
                        newCanvas.width = imgSizeWidth
                        newCanvas.height = imgSizeHeight
                        newCanvasCtx.drawImage(newCanvasImg, 0, 0, imgSizeWidth, imgSizeHeight)
                        // 创建用于预览的canvas
                        const canvas = document.createElement('canvas')
                        canvas.width = areaWidth
                        canvas.height = areaHeight
                        const ctx = canvas.getContext('2d')
                        // 将新的canva放到预览的canvas上面去
                        if (mode === 'equal') {
                            ctx.drawImage(newCanvas, 0, 0, newCanvas.width, newCanvas.height, 0, 0, newCanvas.width, newCanvas.height)
                        } else if (mode === 'width') {
                            ctx.drawImage(newCanvas, 0, 0, newCanvas.width, newCanvas.height, 0, (areaHeight - newCanvas.height) / 2, newCanvas.width, newCanvas.height)
                        } else if (mode === 'height') {
                            ctx.drawImage(newCanvas, 0, 0, newCanvas.width, newCanvas.height, (areaWidth - newCanvas.width) / 2, 0, newCanvas.width, newCanvas.height)
                        }
                        const url = canvas.toDataURL()
                        _self.curPreviewImgBase64Str = url
                        _self.changeing = false
                        _self.loading.close()
                    }
                }
            }
        },
        // 自定义尺寸确定
        customChooseSize() {
            if (this.sizeTipShow) {
                return
            }
            const inputWidth = parseInt(this.defaultSizeModel.width)
            const inputHeight = parseInt(this.defaultSizeModel.height)
            if (this.curImgSize !== null) {
            // 如果尺寸无变化则不作任何的改动
                let curImgSizeWidth = this.curImgSize.width
                let curImgSizeHeight = this.curImgSize.height
                if (this.curImgSize.unit === 'mm') {
                    curImgSizeWidth = Vue.filter('mm2px')(curImgSizeWidth)
                    curImgSizeHeight = Vue.filter('mm2px')(curImgSizeHeight)
                }
                if (
                    inputWidth === curImgSizeWidth &&
                    inputHeight === curImgSizeHeight
                ) {
                    return
                }
            }
            this.chooseSize(
                0,
                inputWidth,
                inputHeight,
                'px',
                null,
                true
            )
        },
        // 智能调整尺寸
        autoChangeSizeClick() {
            this.autoChangeSize = !this.autoChangeSize
            if (this.curImgSize !== null) {
                this.chooseSize(
                    this.curImgSize.type,
                    this.curImgSize.width,
                    this.curImgSize.height,
                    this.curImgSize.unit,
                    this.curImgSize,
                    true
                )
            }
        }
    }
}
</script>

<style lang="scss">
$width: calc(100% - 256px);
.eqc-head-changesize {
    position: relative;
    .content {
        width: $width;
        height: 100%;
        float: left;
        .picture-content {
            overflow: auto;
            position: relative;
            padding: 0 24px;
            height: 100%;
            width: 100%;
            background: #ccd5db;
            .scale-tip {
                position: absolute;
                top: 10px;
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
            .template {
                display: flex;
                flex-wrap: wrap;
                align-items: flex-end;
                border-bottom: 1px solid transparent;
                &.border {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.4);
                }
                .item {
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    width: 160px;
                    height: 212px;
                    margin: 0 38px 24px 0;
                    text-align: center;
                    pointer-events: none;
                    &:hover {
                        .cover {
                            box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
                            transform: translateY(-4px);
                        }
                    }
                    .cover {
                        margin: 0 auto;
                        max-width: 160px;
                        max-height: 160px;
                        vertical-align: top;
                        transition: all 0.3s;
                        pointer-events: auto;
                        cursor: pointer;
                        height: 160px;
                        width: 160px;
                        border: 2px solid #eceef0;
                        position: relative;
                        border-radius: 4px;
                        background: #eceef0;
                        &.active {
                            border: 2px solid $blue-normal;
                            background: white;
                        }
                        .triangle {
                            width: 0;
                            height: 0;
                            border-top: 18px solid $blue-normal;
                            border-right: 18px solid transparent;
                            position: relative;
                            .icon-yes {
                                color: white;
                                position: absolute;
                                transition: all 0.3s;
                                left: -1px;
                                bottom: 6px;
                            }
                        }
                    }
                    .name {
                        height: 36px;
                        color: #111;
                        line-height: 36px;
                    }
                    .size {
                        height: 16px;
                        line-height: 16px;
                        font-size: 12px;
                    }
                }
            }
            .title {
                height: 84px;
                padding: 24px 0;
                line-height: 36px;
                font-size: 18px;
                color: #111;
                font-weight: bold;
            }
        }
        .picture-content::-webkit-scrollbar {
            width: 8px;
            height: 8px;
            background-color: none;
        }

        .picture-content::-webkit-scrollbar-thumb {
            border-radius: 4px;
            background-color: rgba(0, 0, 0, 0.3);
        }

        .picture-content::-webkit-scrollbar-corner {
            display: none;
        }
    }
    .bar-right {
        height: 100%;
        width: 256px;
        float: right;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        background: #ffffff;
        padding: 24px 24px 24px;
        .right-top {
            height: 36px;
            width: 208px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .right-center {
            width: 208px;
            height: calc(100% - 175px - 76px);
            background-repeat: no-repeat;
            background-position: center;
            position: absolute;
            top: 76px;
            left: 24px;
            background: no-repeat center/contain;
            background-color: rgba(247, 248, 249, 1);
            border: 1px solid rgba(204, 213, 219, 1);
        }
        .right-bottom {
            height: 135px;
            width: 100%;
            display: flex;
            padding-top: 0px;
            margin-top: 0%;
            justify-content: flex-start;
            border: none;
            flex-direction: column;
            .size-tips {
                position: absolute;
                bottom: 165px;
                width: 206px;
                height: 49px;
                background: rgba(255, 255, 255, 1);
                box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
                border-radius: 3px;
                line-height: 17px;
                i {
                    color: rgba(255, 84, 72, 1);
                    position: relative;
                    left: 8px;
                    top: 10px;
                }
                label.line-one {
                    font-size: 12px;
                    font-weight: 400;
                    color: rgba(255, 84, 72, 1);
                    position: relative;
                    top: 8px;
                    left: 10px;
                }
                label.line-two {
                    font-size: 12px;
                    font-weight: 400;
                    color: rgba(255, 84, 72, 1);
                    position: relative;
                    top: 6px;
                    left: 27px;
                }
            }
            .setSize {
                height: 30px;
                width: 100%;
                display: flex;
                .eqc-base-input {
                    width: 68px;
                    border-radius: 3px;
                    .unit {
                        line-height: 27px;
                    }
                    input {
                        border-radius: 3px;
                    }
                }
                .eqc-btn {
                    width: 44px;
                    height: 30px;
                    margin-left: 4px;
                }
                .size-and {
                    width: 16px;
                    height: 16px;
                    background: url("../../../../img/no.svg");
                    background-repeat: no-repeat;
                    background-position: center;
                    margin-left: 4px;
                    margin-right: 4px;
                    margin-top: 8px;
                }
            }
            .autoChangeSize {
                height: 45px;
                width: 100%;
                line-height: 44px;
                .eqc-base-checkbox {
                    vertical-align: middle;
                }
                label.lbl_txt {
                    font-size: 12px;
                    font-weight: 400;
                    color: rgba(79, 93, 105, 1);
                    margin-left: 3px;
                }
                label.new {
                    font-size: 12px;
                    font-weight: 400;
                    background: rgba(255, 41, 106, 1);
                    line-height: 17px;
                    position: relative;
                    bottom: 7px;
                    color: #ffffff;
                    border-radius: 8px;
                    padding: 1px 2px;
                }
            }
            .splitLine {
                width: 100%;
                height: 0px;
                border-top: 1px solid rgba(204, 213, 219, 1);
            }
            .bottons {
                width: 256px;
                height: 60px;
                position: absolute;
                bottom: 0;
                left: 0;
                .create-btn {
                    width: 100%;
                    height: 100%;
                    border-radius: 0px;
                    font-size: 13px;
                }
                .help-btn {
                    position: absolute;
                    top: calc(50% - 7px);
                    left: calc(50% - 7px + 26px);
                    color: #ffffff;
                }
            }
        }
        .title {
            font-size: 18px;
            color: #111;
            font-weight: bold;
        }
        .close {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 24px;
            height: 24px;
            font-size: 16px;
            color: #fff;
            background: #2f3c4d;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s;
            &:hover {
                background: #ff2a6a;
            }
        }
    }
}
</style>
