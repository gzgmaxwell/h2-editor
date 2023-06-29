<template>
    <div class="eqc-head-expand">
        <div
            class="bar-top"
        >
            <span class="title">
                扩展尺寸
                <label>（点击要扩展的尺寸）</label>
            </span>
            <div class="tools">
                <span
                    class="auto-change-size"
                    @click="autoChangeSizeClick"
                >
                    <base-checkbox
                        id="checkbox-auto-change-size"
                        v-model="autoChangeSize"
                    />
                    <label class="lbl_txt">智能调整元素大小与位置</label>
                    <label class="new">限时免费</label>
                </span>
                <span class="btn-help">
                    <base-button
                        class="white white-blue w96 h36"
                        target="blank"
                        href="//qingsheji.help.eqxiu.com/produce.html"
                    >帮助</base-button>
                </span>
                <span class="btn-create">
                    <base-button
                        :class="{disable: imgSizeArr.length===0||creating}"
                        class="blue w96 h36"
                        @click.native="create"
                    >{{ creating?'生成中...':' 生成' }}{{ '【'+imgSizeArr.length+'】' }}</base-button>
                </span>
                <span class="btn-close">
                    <i
                        class="close eqf-no"
                        @click="cancel"
                    />
                </span>
            </div>
        </div>
        <div class="content">
            <div
                v-show="sizeTipShow && false"
                class="size-tips"
            >
                <i
                    class="tip-icon eqf-alert-f"
                />
                <label class="line-one">自定义尺寸范围为40px*40px至</label>
                <label class="line-two">5000px*5000px</label>
            </div>
            <div class="picture-content">
                <div>
                    <div>
                        <div class="title">
                            自定义尺寸
                        </div>
                        <ul class="template">
                            <li
                                class="item item-create item-create-add"
                            >
                                <div>
                                    <div
                                        v-show="!customSizeInputShow"
                                        class="cover add-size-a"
                                        @click="addCustomSize"
                                    >
                                        <i class="icon eqf-plus" />
                                        添加自定义尺寸
                                    </div>
                                    <div
                                        v-show="customSizeInputShow"
                                        class="cover add-size-b"
                                    >
                                        <span class="inptu-left input-width-left">宽</span>
                                        <span class="inptu-left input-height-left">高</span>
                                        <base-input
                                            :model="defaultSizeModel"
                                            :min="0"
                                            :max="5000"
                                            class="input-width"
                                            model-key="width"
                                        />
                                        <base-input
                                            :model="defaultSizeModel"
                                            :min="0"
                                            :max="5000"
                                            class="input-height"
                                            model-key="height"
                                        />
                                        <label class="tips tips-line-one">范围：40px*40px至</label>
                                        <label class="tips tips-line-tow">5000px*5000px</label>
                                        <base-button
                                            class="blue w48 h30 btn-submit"
                                            @click.native="submitAddCustomSize"
                                        >
                                            添加
                                        </base-button>
                                    </div>
                                </div>
                                <div class="name" />
                                <div class="size" />
                            </li>
                            <li
                                v-for="(item,index) of customBanners[0].list"
                                :key="item.id"
                                class="item item-create animation-fade-scale"
                            >
                                <div class="conver-container">
                                    <div
                                        :id="'cover_' + item.id"
                                        :style="{
                                            backgroundRepeat: 'no-repeat',
                                            backgroundImage: 'url(' + getConverBgImg(item.id) + ')',
                                            width: item.width > item.height ? '160px' : `${item.width / item.height * 160}px`,
                                            height: item.width < item.height ? '160px' : `${item.height / item.width * 160}px`
                                        }"
                                        :class="{'active': item.check}"
                                        class="cover"
                                    />
                                </div>
                                <i
                                    :style="{
                                        top:(160-(item.width < item.height ? 160 : `${item.height / item.width * 160}`)-8)+'px',
                                        right:((160-(item.width > item.height ? 160 : `${item.width / item.height * 160}`))/2-8)+'px'}"
                                    class="close eqf-no"
                                    @click="delCustomSize(item,index)"
                                />
                                <div class="name">
                                    {{ item.name }}
                                </div>
                                <div class="size">
                                    {{ `${item.width}*${item.height} ${item.unit === 'mm' ? '毫米' : '像素'}` }}
                                </div>
                            </li>
                        </ul>
                    </div>
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
                                        :style="{
                                            backgroundRepeat: 'no-repeat',
                                            backgroundImage: 'url(' + getConverBgImg(item.id) + ')',
                                            width: item.width > item.height ? '160px' : `${item.width / item.height * 160}px`,
                                            height: item.width < item.height ? '160px' : `${item.height / item.width * 160}px`
                                        }"
                                        :class="{'active': item.check}"
                                        class="cover"
                                        @click="chooseSize(item.type, item.width, item.height, item.unit, item)"
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
        <transition name="fade">
            <div
                v-show="tipShow"
                class="scale-tip"
            >
                <i class="icon eqf-info-f fl" />
                <span>{{ tipText }}</span>
            </div>
        </transition>
    </div>
</template>

<script>
import statistic from '../../../../config/statistic'
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
            // 提示信息显示与否
            tipShow: false,
            // 提示信息文本
            tipText: '',
            // 用户自定义尺寸范围外提示信息显示与否
            sizeTipShow: false,
            // 显示用户自定义输入面板
            customSizeInputShow: true,
            // 用户自定义尺寸 当前输入
            defaultSizeModel: {
                width: '800px',
                height: '800px'
            },
            // 用户自定义尺寸数组
            customBanners: [{
                name: '用户自定义尺寸',
                list: []
            }],
            // 系统尺寸对象数组
            banners: [],
            // 当前选中的尺寸数组
            imgSizeArr: [],
            // 创建状态
            creating: false,
            // 当前是否自动改变尺寸
            autoChangeSize: true,
            // 用于存储已经加载过的预览图
            coverBackGroundImageArray: []
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
        },
        // 获取预览图 从缓存当中
        getConverBgImg() {
            return function (pCoverId) {
                const result = this.coverBackGroundImageArray.filter((item, index, arr) => {
                    return item.item.id === pCoverId
                })
                if (result.length === 0) {
                    return ''
                } else {
                    result[0].bgImg = this.autoChangeSize ? result[0].autoImgBase64Str : result[0].imgBase64Str
                    return result[0].bgShow ? result[0].bgImg : ''
                }
            }
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
        this.showTips('点击选择要生成的尺寸即可预览', 5000)
    },
    methods: {
        // 显示提示信息
        showTips(pText, pDelay) {
            this.tipShow = true
            this.tipText = pText
            setTimeout(() => {
                this.tipShow = false
            }, pDelay)
        },
        // 关闭
        cancel() {
            this.close()
        },
        // 生成到服务器
        create() {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.SE,
                statistic.opt_label.SE.gen])
            this.loading.open('正在生成...')
            this.creating = true
            const subArr = []
            let totalSizeArr = []
            totalSizeArr = this.imgSizeArr
            totalSizeArr.forEach((item, index) => {
                // 深拷贝当前数据
                const curData = JSON.parse(JSON.stringify(this.data))
                // 更新尺寸信息
                const oldWidth = this.eqxPage.sceneWidth
                const oldHeight = this.eqxPage.sceneHeight
                const newWidth = item.unit === 'mm' ? Vue.filter('mm2px')(item.width) : item.width
                const newHeight = item.unit === 'mm' ? Vue.filter('mm2px')(item.height) : item.height
                this.updatePageElementCssForSave(curData, oldWidth, oldHeight, newWidth, newHeight, this.autoChangeSize)
                // 更新页面信息
                curData.width = newWidth
                curData.height = newHeight
                curData.type = item.type
                curData.unit = item.unit
                curData.cover = ''
                subArr.push(curData)
            })
            // 保存
            subArr.map((v, i) => {
                v.centerId = Vue.store.state.product.centerId
            })
            this.api.scene.massProduction(subArr)
                .then(res => {
                    this.loading.close()
                    this.close({})
                    this.creating = false
                }).catch(err => {
                    this.loading.close()
                    this.creating = false
                    err && this.logger.error(err)
                })
        },
        // 选择尺寸 选中或者不选中
        chooseSize(type, width = 0, height = 0, unit = 'px', item) {
            if (!item.check) {
                if (this.imgSizeArr.length === 10) {
                    this.showTips('一次最多扩展10个尺寸', 5000)
                    return
                }
                this.imgSizeArr.push({
                    id: item.id,
                    type: type,
                    width: width,
                    height: height,
                    unit: unit,
                    item: item
                })
                // 查询当前预览图是否已经存在
                const previewImg = this.coverBackGroundImageArray.filter((curItem, index, arr) => {
                    const bgImg = this.autoChangeSize ? curItem.autoImgBase64Str : curItem.imgBase64Str
                    if (curItem.item.id === item.id && bgImg !== '') {
                        curItem.bgShow = true
                        curItem.bgImg = bgImg
                    }
                    return curItem.item.id === item.id && bgImg !== ''
                })
                // 如果不存在预览图则生成
                if (previewImg.length === 0) {
                    this.createPreviewImg(type, width, height, unit, item)
                }
            } else {
                this.imgSizeArr.splice(this.imgSizeArr.findIndex(ele => ele.id === item.id), 1)
                this.coverBackGroundImageArray.forEach((curItem, index) => {
                    if (curItem.item.id === item.id) {
                        curItem.bgShow = false
                        curItem.bgImg = ''
                    }
                })
            }
            item.check = !item.check
        },
        // 删除用户自定义尺寸
        delCustomSize(item, index) {
            this.customBanners[0].list.splice(index, 1)
            this.imgSizeArr.splice(this.imgSizeArr.findIndex(ele => ele.id === item.id), 1)
        },
        // 新增用户自定义尺寸
        addCustomSize() {
            this.customSizeInputShow = true
        },
        // 取消用户自定义尺寸的添加
        cancleAddCustomSize() {
            this.customSizeInputShow = false
        },
        // 提交用户自定义尺寸
        submitAddCustomSize() {
            if (this.sizeTipShow) {
                return
            }
            if (this.imgSizeArr.length === 10) {
                this.showTips('一次最多扩展10个尺寸', 5000)
                return
            }
            const inputWidth = parseInt(this.defaultSizeModel.width)
            const inputHeight = parseInt(this.defaultSizeModel.height)
            const item = {
                bleed: null,
                check: false,
                componentTagName: null,
                cover: null,
                height: inputHeight,
                id: new Date().getTime(),
                imageName: null,
                isRecommend: null,
                name: '自定义图',
                position: null,
                sorts: null,
                status: null,
                type: 0,
                unit: null,
                uploadTime: null,
                url: null,
                width: inputWidth
            }
            this.customBanners[0].list.push(item)
            this.chooseSize(item.type, item.width, item.height, item.unit, item)
        },
        // 智能调整尺寸复选框
        autoChangeSizeClick() {
            this.autoChangeSize = !this.autoChangeSize
            this.updateAllChooseSize(this.autoChangeSize)
        },
        // 智能调整复选框选中更新选中的所有尺寸
        updateAllChooseSize(pAutoChangeSize) {
            this.coverBackGroundImageArray.forEach((item, index) => {
                const itemIndex = this.imgSizeArr.findIndex(ele => ele.id === item.item.id)
                if (itemIndex >= 0) {
                    if (pAutoChangeSize) {
                        if (item.autoImgBase64Str !== '') {
                            item.bgImg = item.autoImgBase64Str
                        } else {
                            item.bgImg = ''
                            this.createPreviewImg(item.item.type, item.item.width, item.item.height, item.item.unit, item.item)
                        }
                    } else {
                        if (item.imgBase64Str !== '') {
                            item.bgImg = item.imgBase64Str
                        } else {
                            item.bgImg = ''
                            this.createPreviewImg(item.item.type, item.item.width, item.item.height, item.item.unit, item.item)
                        }
                    }
                }
            })
        },
        // 创建预览图
        createPreviewImg(type, width = 0, height = 0, unit = 'px', item) {
            this.getPreviewImg(
                width, height, unit,
                width > height ? 160 : (width / height * 160),
                width < height ? 160 : (height / width * 160),
                this.autoChangeSize
            ).then(res => {
                this.loading.close()
                const result = this.coverBackGroundImageArray.filter((curItem, index, arr) => {
                    if (curItem.item.id === item.id) {
                        if (res.autoChangeSize) {
                            curItem.autoImgBase64Str = res.imgBase64
                        } else {
                            curItem.imgBase64Str = res.imgBase64
                        }
                    }
                    return curItem.item.id === item.id
                })
                if (result.length === 0) {
                    this.coverBackGroundImageArray.push({
                        item: item,
                        bgShow: true,
                        autoImgBase64Str: res.autoChangeSize ? res.imgBase64 : '',
                        imgBase64Str: res.autoChangeSize ? '' : res.imgBase64,
                        bgImg: ''
                    })
                }
            })
        },
        // 更新页面元素的css样式仅仅是为了保存
        updatePageElementCssForSave(data, oldWidth, oldHeight, newWidth, newHeight, autoChangeSize) {
            if (autoChangeSize) {
                let elementScale
                let topDiff = 0
                let leftDiff = 0
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
                data.elements.forEach((item, index) => {
                    const top = parseInt(item.css.top)
                    const left = parseInt(item.css.left)
                    const width = parseInt(item.css.width)
                    const height = parseInt(item.css.height)
                    if (elementScale !== 1 || topDiff !== 0 || leftDiff !== 0 || isNaN(topDiff) || isNaN(leftDiff)) {
                        topDiff = isNaN(topDiff) ? 0 : topDiff
                        leftDiff = isNaN(leftDiff) ? 0 : leftDiff
                        item.css.top = Math.round(parseInt(top) * elementScale + topDiff) + 'px'
                        item.css.left = Math.round(parseInt(left) * elementScale + leftDiff) + 'px'
                        item.css.width = Math.round(parseInt(width) * elementScale) + 'px'
                        item.css.height = Math.round(parseInt(height) * elementScale) + 'px'
                        if (item.type === 101) {
                            const fontSize = parseInt(item.css.fontSize)
                            item.css.fontSize = parseInt(fontSize) * elementScale + 'px'
                        }
                    }
                })
            }
        },
        // 获取预览图
        getPreviewImg(width, height, unit, pPreviewWidth, pPreviewHeight, pAutoChangeSize) {
            this.loading.open('正在生成预览图')
            return new Promise((resolve, reject) => {
                // 修改自定义宽度和高度
                width = unit === 'mm' ? Vue.filter('mm2px')(width) : width
                height = unit === 'mm' ? Vue.filter('mm2px')(height) : height
                if (pAutoChangeSize) {
                    // lodash 为了不报错 添加lenght属性
                    this.eqxPage.eqxElements.forEach((item, index) => {
                        item.elementBox.length = 0
                    })
                    const colneCurPage = cloneDeep(this.eqxPage)
                    // lodash 为了不报错 移除length属性
                    this.eqxPage.eqxElements.forEach((item, index) => {
                        delete item.elementBox.length
                    })
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
                            const areaWidth = pPreviewWidth
                            const areaHeight = pPreviewHeight
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
                                resolve({
                                    imgBase64: url,
                                    autoChangeSize: pAutoChangeSize
                                })
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
                        const areaWidth = pPreviewWidth
                        const areaHeight = pPreviewHeight
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
                            resolve({
                                imgBase64: url,
                                autoChangeSize: pAutoChangeSize
                            })
                        }
                    }
                }
            })
        }
    }
}
</script>

<style lang="scss">
$width: 100%;
$barTopHeight: 68px;
$contentHeight: calc(100% - 68px);
.eqc-head-expand {
    position: relative;
    .scale-tip {
        position: absolute;
        top: 100px;
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
    .content {
        width: $width;
        height: $contentHeight;
        float: left;
        .size-tips {
            position: absolute;
            top: 117px;
            left: 4px;
            width: 206px;
            height: 49px;
            background: white;
            box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
            border-radius: 3px;
            line-height: 17px;
            z-index: 1;
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
        .picture-content {
            overflow: auto;
            position: relative;
            padding: 0 24px;
            height: 100%;
            width: 100%;
            background: #ccd5db;
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
                    // pointer-events: none;
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
                        // border: 2px solid #eceef0;
                        position: relative;
                        // border-radius: 4px;
                        background: #eceef0;
                        background-repeat: no-repeat;
                        &.active {
                            // border: 2px solid $blue-normal;
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
                .item-create {
                    position: relative;
                    &:hover {
                        .cover {
                            box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
                            transform: translateY(-4px);
                        }
                        .close {
                            display: flex;
                            transform: translateY(-4px);
                        }
                    }
                    .conver-container {
                        position: relative;
                    }
                    .cover {
                        border: none;
                        width: 160px;
                        height: 160px;
                        background-repeat: no-repeat;
                    }
                    .add-size-a {
                        text-align: center;
                        font-size: 12px;
                        font-weight: 400;
                        color: rgba(79, 93, 105, 1);
                        line-height: 138px;
                        i {
                            display: block;
                            font-size: 28px;
                            position: relative;
                            top: 58px;
                            color: #9099a4;
                        }
                    }
                    .add-size-b {
                        background-color: #ffffff;
                        cursor: default;
                        height: 212px;
                        max-height: 212px;
                        display: table;
                        input {
                            width: 128px;
                            height: 36px;
                            padding-left: 35px;
                            border-radius: 3px 0px 0px 3px;
                        }
                        .unit {
                            height: 36px;
                            line-height: 33px;
                        }
                        .inptu-left {
                            width: 32px;
                            height: 36px;
                            display: block;
                            position: absolute;
                            background: #f7f8f9;
                            border-radius: 3px 0px 0px 3px;
                            border: 1px solid rgba(204, 213, 219, 1);
                            left: 16px;
                            z-index: 1;
                            line-height: 33px;
                        }
                        .input-width-left {
                            top: 20px;
                        }
                        .input-height-left {
                            top: 68px;
                        }
                        .input-width {
                            margin-top: 20px;
                        }
                        .input-height {
                            margin-top: 12px;
                            margin-bottom: 8px;
                        }
                        .tips {
                            font-size: 12px;
                            display: block;
                            color: #9099a4;
                            text-align: left;
                            padding-left: 16px;
                            letter-spacing: 1px;
                        }
                        .tips-line-one {
                            margin-bottom: 4px;
                        }
                        .tips-line-tow {
                            margin-bottom: 16px;
                        }
                        .btn-cancle {
                            width: 48px;
                            height: 30px;
                            margin-right: 6px;
                        }
                        .btn-submit {
                            width: 128px;
                            height: 36px;
                            // margin-left: 6px;
                        }
                    }
                    .close {
                        display: none;
                        position: absolute;
                        top: -8px;
                        right: -8px;
                        justify-content: center;
                        align-items: center;
                        width: 16px;
                        height: 16px;
                        font-size: 14px;
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
                .item-create-add {
                    &:hover {
                        .cover {
                            box-shadow: none;
                            transform: none;
                        }
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
    .bar-top {
        height: $barTopHeight;
        width: $width;
        background: rgba(247, 248, 249, 1);
        .title {
            height: $barTopHeight;
            width: 300px;
            font-size: 22px;
            font-weight: 600;
            color: #111111;
            line-height: 67px;
            display: inline-block;
            text-indent: 24px;
            label {
                font-size: 17px;
                color: #333333;
                font-weight: normal;
                letter-spacing: 1px;
            }
        }
        .tools {
            width: 525px;
            height: $barTopHeight;
            display: flex;
            float: right;
            font-size: 0px;
            span {
                height: $barTopHeight;
            }
            .auto-change-size {
                width: 233px;
                .eqc-base-checkbox {
                    position: relative;
                    top: 26px;
                    font-size: 14px;
                }
                label.lbl_txt {
                    font-size: 12px;
                    font-weight: 400;
                    color: rgba(79, 93, 105, 1);
                    position: relative;
                    top: 24px;
                    left: 6px;
                }
                label.new {
                    font-size: 12px;
                    font-weight: 400;
                    color: rgba(255, 41, 106, 1);
                    position: relative;
                    top: 20px;
                    left: 10px;
                }
            }
            .btn-help {
                width: 112px;
                a {
                    position: relative;
                    top: 16px;
                }
            }
            .btn-create {
                width: 112px;
                a {
                    position: relative;
                    top: 16px;
                }
            }
            .btn-close {
                width: 68px;
                background: rgba(236, 238, 240, 1);
                .close {
                    position: relative;
                    top: 20px;
                    left: 20px;
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
    }
    .bar-right {
        height: 100%;
        width: 256px;
        float: right;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        background: #eceef0;
        padding: 24px 24px 24px;
        .right-top {
            height: 36px;
            width: 208px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .right-custom {
            min-height: 34px;
            width: 206px;
            color: #2f3c4d;
            margin-top: 10%;
            border: 1px solid #ccd5db;
            display: flex;
            border-radius: 3px;
            justify-content: center;
            align-items: center;
            background: white;
            transition: all 0.3s;
            cursor: pointer;
            &:hover {
                border: 1px solid $blue-normal;
                background: $blue-normal;
                color: white;
            }
        }
        .right-content {
            width: 100%;
            height: 80%;
            margin-top: 10%;
            position: relative;
            .ulTitle {
                font-weight: bold;
                color: #111;
                font-size: 14px;
                margin-bottom: 12px;
            }
            .li-size {
                display: flex;
                justify-content: space-between;
                height: 36px;
                font-size: 12px;
                align-items: center;
                background: white;
                padding: 0px 12px;
                margin-bottom: 12px;
                cursor: pointer;
                border-radius: 3px;
                transition: all 0.3s;
                border: 2px solid $blue-normal;
                .icon {
                    font-size: 16px;
                    opacity: 0;
                }
                &:hover {
                    border: 2px solid white;
                    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
                    color: #111;
                    .icon {
                        opacity: 1;
                    }
                }
            }
        }
        .right-bottom {
            height: 60px;
            width: 100%;
            display: flex;
            padding-top: 24px;
            margin-top: 20%;
            justify-content: space-between;
            border-top: 1px solid #ccd5db;
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
