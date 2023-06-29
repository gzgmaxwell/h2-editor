<template>
    <div class="eqc-head-express">
        <ul
            class="express-head"
        >
            <li
                v-if="expressMode === expressType.product && !isGIFScene"
                :class="[{'hint--bottom hint--rounded':pages.length === 1}]"
                data-hint="至少需要2页以上"
                class="btn"
            >
                <div
                    :class="[{disable: pages.length === 1}]"
                    class="exp-gif"
                    style="width:100%;height:100%"
                    @click="switchMenu($event,'gif',true)"
                >
                    合成GIF
                </div>
                <div
                    v-if="showGIFMenu"
                    class="gif-menu"
                >
                    <div
                        @click="switchMenu($event,'gif',false)"
                    >
                        <i
                            class="close eqf-no"
                        />
                    </div>
                    <div class="left">
                        <p class="title">
                            选择要合成的图片（{{ selectedPage.length }}）
                        </p>
                        <div
                            class="select-all"
                            @click="selectAll($event,'gif')"
                        >
                            <base-checkbox
                                id="express-gif-all"
                                v-model="isSelectedAll"
                                :class="[{'active': isSelectedAll}]"
                            />
                            <span>全选</span>
                        </div>
                        <div
                            v-scroll-bar
                            class="page-list-box"
                        >
                            <ul
                                class="page-list"
                            >
                                <li
                                    v-for="(item, index) in pageList"
                                    :key="index"
                                    class="page-li"
                                    @click="pageChecked($event, item, index)"
                                >
                                    <base-checkbox
                                        v-model="item.check"
                                        :class="[{'active': item.check}]"
                                    />
                                    <span class="page-value">第{{ (index + 1) }}页</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="right">
                        <p class="title">
                            预览
                        </p>
                        <div class="preview-box">
                            <div class="gif">
                                <ul
                                    v-show="previewShow"
                                    id="fakeList"
                                    class="fake"
                                >
                                    <li
                                        v-for="(item, index) in selectedPage"
                                        :id="`li${index}`"
                                        :key="item.index"
                                    >
                                        <div
                                            :style="{backgroundImage: getPreviewImage(item.path)}"
                                            class="img"
                                        />
                                    </li>
                                </ul>
                            </div>
                            <div class="speed-bar">
                                <span>慢</span>
                                <div class="speed-bg" />
                                <input
                                    v-model="speed"
                                    :style="{backgroundSize: progressPoint*100/sppedDuration +'% 100%'}"
                                    :max="sppedDuration"
                                    type="range"
                                    min="1"
                                >

                                <span>快</span>
                            </div>
                        </div>
                        <ul class="btns">
                            <li
                                class="cancel-btn"
                                @click="switchMenu($event,'gif',false)"
                            >
                                取消
                            </li>
                            <li
                                :class="{disable: selectedPage.length < 2 || exporting}"
                                class="export-gif-btn"
                                @click="exportGif($event)"
                            >
                                合成GIF
                            </li>
                        </ul>
                    </div>
                </div>
            </li>
            <li
                v-if="expressMode === expressType.product"
                class="btn"
            >
                <div
                    class="exp-img"
                    style="width:100%;height:100%"
                    @click="switchMenu($event,'img',true)"
                >
                    导出图片
                </div>
                <div
                    v-if="showImgMenu"
                    class="img-menu"
                >
                    <div
                        style="width:100%"
                        @click="switchMenu($event,'img',false)"
                    >
                        <i
                            class="close eqf-no"
                        />
                    </div>
                    <div
                        class="select-all"
                        @click="selectAll($event,'img')"
                    >
                        <base-checkbox
                            id="express-img-all"
                            v-model="isSelectedAll"
                            :class="[{'active': isSelectedAll}]"
                        />
                        <span>全选</span>
                    </div>
                    <div
                        v-scroll-bar
                        class="page-list-box"
                    >
                        <ul class="page-list">
                            <li
                                v-for="(item, index) in pageList"
                                :key="index"
                                class="page-li"
                                @click="pageChecked($event, item, index)"
                            >
                                <base-checkbox
                                    v-model="item.check"
                                    :class="[{'active': item.check}]"
                                />
                                <span class="page-value">第{{ (index + 1) }}页</span>
                            </li>
                        </ul>
                    </div>
                    <div
                        :class="{disable: selectedPage.length === 0 || exporting}"
                        class="img-export-btn"
                        @click="exportImg($event)"
                    >
                        导出{{ selectedPage.length }}张图片
                    </div>
                </div>
            </li>
            <li
                v-if="expressMode === expressType.image"
                class="btn"
            >
                <div
                    class="exp-img"
                    style="width:100%;height:100%"
                    @click="switchMenu($event,'exp',true)"
                >
                    导出图片
                </div>
            </li>
            <li
                class="close hint--bottom-left hint--rounded"
                data-hint="关闭"
                @click="closeExpress"
            >
                <i class="icon eqf-power-l" />
            </li>
        </ul>
    </div>
</template>
<script>
import expressType from '../../../../config/enum.express.type'
import gifParse from '../../../../utils/gifParsing'
import util from '../../../../utils/util'
import message from '../../../../utils/message'
import sceneType from '../../../../config/enum.scene.type'
import statistic from '../../../../config/statistic'
import storageSession from '../../../../utils/storageSession'

export default {
    props: {
        canOpen: {
            type: Boolean,
            default: false
        },
        close: {
            type: Function,
            default: null
        }
    },
    data() {
        return {
            showGIFMenu: false,
            showImgMenu: false,
            isSelectedAny: false, // 是否有选中的
            isSelectedAll: false, // 是否全部选中
            pageList: [],
            expressType,
            selectedPage: [], // 已选页面
            ops: null,
            maxInterval: 2, // 最大播放间隔 s
            speed: 10, // 滑动条值
            sppedDuration: 20, // 速度总份数
            exporting: false, // 是否正在导出
            timer: null, // gif预览动画timer
            num: 0, // gif预览动画计数
            previewShow: false // 是否显示预览
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.user.userInfo
        },
        scene() {
            return this.$store.state.scene
        },
        eqxScene() {
            return this.scene.eqxScene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        sceneJson() {
            return this.eqxScene.sceneJson
        },
        pages() {
            return this.sceneJson.pages
        },
        expressMode() {
            return this.$store.state.scene.expressMode
        },
        expressHeadMenu() {
            return this.$store.state.layout.expressHeadMenu
        },
        progressPoint() { // 用于显示滑动条进度颜色
            return this.speed
        },
        realSpeed() {
            return this.maxInterval / this.speed
        },
        isGIFScene() {
            return sceneType.isAllowAddGifToScene(this.eqxPage.eqxScene.sceneJson.type)
        }
    },
    watch: {
        expressHeadMenu: {
            handler(newVal) {
                this.showGIFMenu = newVal.showGifMenu
                this.showImgMenu = newVal.showImgMenu
            }
        },
        showGIFMenu: {
            handler(newVal) {
                if (newVal) {
                    this.isSelectedAll = false
                    this.isSelectedAny = false
                    this.initPageList()
                    this.selectAll()
                    this.preLoadImgs()
                } else {
                    this.clearPreviewAni()
                }
            }
        },
        showImgMenu: {
            handler(newVal) {
                if (newVal) {
                    this.isSelectedAll = false
                    this.isSelectedAny = false
                    this.initPageList()
                    this.selectAll()
                }
            }
        },
        selectedPage: {
            handler(newVal) {
                if (this.showGIFMenu) {
                    // 用户选择page改变时，重置预览动画
                    this.setPreviewAni(true)
                }
            }
        },
        pageList: {
            handler(newVal) {
                this.isSelectedAny = false
                this.isSelectedAll = false
                this.selectedPage = []

                if (newVal && newVal.length) {
                    this.isSelectedAll = true
                }
                newVal.forEach(item => {
                    if (item.check) {
                        this.isSelectedAny = true
                        this.selectedPage.push(item)
                    } else {
                        this.isSelectedAll = false
                    }
                })

                // 需要按照升序排序
                this.selectedPage.sort((a1, a2) => a1.order - a2.order)
            },
            deep: true
        },
        speed: function (newVal) {
            // 用户设置速度改变时，重置预览动画
            this.setPreviewAni(false)
        },
        pages: {
            handler(newVal) {
                this.initPageList()
            }
        }
    },
    methods: {
        /**
         * opType: local:下载到本地 lib:导出到素材库
         * enableResolution: 是否获取分辨率设置
         */
        tracker(downloadType = 'PNG') {
            const ed = `op_type=lib&file_type=image&extension=${downloadType}&resolution=原图&is_watermark=0&order_id=null`
            const loc = downloadType === 'PNG' ? 'PNG' : 'GIF'
            const params = {
                // 产品线缩写
                product: 'print',
                // 业务线类型
                b_t: 'download',
                // 事件分类
                cat: 'download',
                // 图片类型
                img_type: downloadType,
                // 用户id
                u_i: this.userInfo.id,
                // 元素事件
                e_t: 'element_click',
                // 作品id
                works_id: this.sceneJson.id + '',
                // 作品创建者id
                w_u: this.userInfo.id,
                // 下载位置
                loc,
                // 来源端
                f_p: 'PC',
                // 其他参数
                e_d: ed,
                // 新增act 与opType 相同
                act: 'lib',
                // 时长 固定传0
                dur: 0
            }
            window._tracker_api_ && window._tracker_api_.report(params)
        },
        initPageList() {
            this.pageList = []
            this.pages.map((v, i) => {
                const obj = {
                    index: v.id,
                    path: v.cover,
                    order: i,
                    check: false
                }
                this.pageList.push(obj)
            })
        },
        pageChecked(event, item, index) {
            event && event.stopPropagation()
            item.check = !item.check
        },
        setItemsSelected(isSelected) {
            this.pageList.forEach(item => this.$set(item, 'check', isSelected))
        },
        selectAll(event) {
            event && event.stopPropagation()
            this.setItemsSelected(!this.isSelectedAll)
        },
        switchMenu(event, type, open) {
            event.stopPropagation()
            this.ops = { type, open }
            if (open) {
                this.$emit('pageSaving')
            } else {
                this.openMenu()
            }
        },
        openMenu() {
            if (this.ops.type === 'img') {
                this.showImgMenu = this.ops.open
                this.showGIFMenu = false
            } else if (this.ops.type === 'gif') {
                this.showGIFMenu = this.ops.open
                this.showImgMenu = false
            } else if (this.ops.type === 'exp') {
                this.exportImg(null, true)
            }
        },
        closeMenu(event) {
            event && event.stopPropagation()
            this.showImgMenu = false
            this.showGIFMenu = false
        },
        getPreviewImage(src) {
            src = Vue.filter('qiniuZoom')(src, 284, 224)
            return Vue.filter('backgroundImage')(src)
        },
        preLoadImgs() {
            // 首次加载时会因图片张数和大小有加载延迟
            // 所以先一次性将预览图片资源加载完毕再显示
            const imgReqs = []
            const imgLoad = url => {
                return new Promise((resolve, reject) => {
                    let img = new Image()
                    img.src = url
                    img.onload = () => {
                        img = null
                        resolve()
                    }
                })
            }
            for (const item of this.selectedPage) {
                const url = Vue.env.host.file + Vue.filter('qiniuZoom')(item.path, 284, 224)
                imgReqs.push(imgLoad(url))
            }
            Promise.all(imgReqs).then((res) => {
                this.previewShow = true
            }).catch(err => {
                err && Vue.logger.error(err)
            })
        },
        setPreviewAni(restart) {
            if (restart) {
                this.num = 0
            }
            const t = Math.round(this.realSpeed * 1000)
            clearInterval(this.timer)
            this.timer = setInterval(this.fakeGif, t)
        },
        fakeGif() {
            let $fakeList
            let $lis
            if (!$fakeList || !$lis) {
                $fakeList = document.getElementById('fakeList')
                if ($fakeList) {
                    $lis = $fakeList.children
                }
            }
            if ($lis) {
                for (const $li of $lis) {
                    $li.css({ display: '' })
                }
                $lis[this.num] && $lis[this.num].css({ display: 'block' })
                this.num++
                if (this.num === this.selectedPage.length) {
                    this.num = 0
                }
            }
        },
        clearPreviewAni() {
            clearInterval(this.timer)
            this.timer = null
            this.num = 0
        },
        exportGif(event) {
            event && event.stopPropagation()
            this.tracker('GIF')
            if (this.exporting) {
                return
            }
            this.buildingGIF()
        },
        exportImg(event, single = false) {
            event && event.stopPropagation()
            this.tracker()
            if (this.exporting) {
                return
            }
            const imgs = []
            this.exporting = true
            if (single) {
                this.pages.map(v => imgs.push(v.cover))
            } else {
                this.selectedPage.map(v => imgs.push(v.path))
            }
            message.success({
                url: imgs.join(','),
                type: 'image',
                msg: 'export'
            })
            this.notifier.success('导出成功')
            this.showImgMenu = false
            this.exporting = false
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.EXPRESS,
                statistic.opt_label.EXPRESS.expPic])
        },
        buildingGIF(pPercent = 1) {
            this.exporting = true
            Vue.loading.open('GIF合成中...')
            this.createGIF(pPercent)
                .then((pBlob) => {
                    if (pBlob.size / 1024 > 2048) { // gif文件是否<2M
                        let sizePercent
                        if (pPercent === 1) {
                            sizePercent = Math.floor(2048 / (pBlob.size / 1024) * 100) / 100
                        } else {
                            sizePercent = pPercent * 0.9
                        }
                        this.buildingGIF(sizePercent)
                        return
                    }
                    const blob = pBlob
                    // upload to qiniu
                    this.uploadGif(blob).then(res => {
                        this.exporting = false
                        message.success({
                            url: res,
                            type: 'gif',
                            msg: 'export'
                        })
                        this.notifier.success('导出成功')
                        Vue.loading.close()
                        this.showGIFMenu = false

                        window._hmt.push(['_trackEvent',
                            statistic.category.F,
                            statistic.action.EXPRESS,
                            statistic.opt_label.EXPRESS.expGif])
                    })
                })
                .catch(err => {
                    this.exporting = false
                    this.notifier.fail('导出失败，请稍后重试')
                    console.log(err)
                    Vue.loading.close()
                    message.fail({
                        url: '',
                        type: 'gif',
                        msg: 'export'
                    })
                })
        },
        createGIF(pPercent) {
            return new Promise((resolve, reject) => {
                let gifWidth = this.sceneJson.width || 284
                let gifHeight = this.sceneJson.height || 224
                if (pPercent < 1) {
                    const area = gifWidth * gifHeight * pPercent
                    let coefficient = 0.99
                    let convertArea = gifWidth * gifHeight
                    while (convertArea >= area) {
                        coefficient = coefficient - 0.01
                        convertArea = gifWidth * coefficient * gifHeight * coefficient
                    }
                    gifWidth = gifWidth * coefficient
                    gifHeight = gifHeight * coefficient
                }
                this.createCanvas(gifWidth, gifHeight)
                    .then((res) => {
                        this.clearPreviewAni()
                        const canvasArray = []
                        res.forEach((item, index) => {
                            canvasArray.push({
                                canvas: item,
                                delay: this.realSpeed * 1000
                            })
                        })
                        try {
                            gifParse.getGifByGifJs(canvasArray)
                                .then((res) => {
                                    resolve(res)
                                })
                        } catch (error) {
                            this.notifier.fail('导出失败，请稍后重试')
                        }
                    })
            })
        },
        fixImgSize(maxWidth, maxHeight, imgWidth, imgHeight) {
            // 图片原始尺寸
            const originWidth = imgWidth
            const originHeight = imgHeight
            // 目标尺寸
            let targetWidth = originWidth
            let targetHeight = originHeight
            // 图片尺寸超过限制
            if (originWidth > maxWidth || originHeight > maxHeight) {
                if (originWidth / originHeight > maxWidth / maxHeight) {
                    targetWidth = maxWidth
                    targetHeight = Math.floor(maxWidth * (originHeight / originWidth))
                } else {
                    targetHeight = maxHeight
                    targetWidth = Math.floor(maxHeight * (originWidth / originHeight))
                }
            }

            return { targetWidth, targetHeight }
        },
        createCanvas(gifWidth, gifHeight) {
            return new Promise((resolve, reject) => {
                const imgReqs = []
                const imgLoad = url => {
                    return new Promise((resolve, reject) => {
                        var img = new Image()
                        img.src = url
                        img.crossOrigin = 'anonymous'
                        img.onload = () => {
                            const { targetWidth, targetHeight } = this.fixImgSize(gifWidth, gifHeight, img.width, img.height)
                            const canvas = document.createElement('canvas')
                            canvas.width = gifWidth
                            canvas.height = gifHeight
                            const ctx = canvas.getContext('2d')
                            ctx.clearRect(0, 0, canvas.width, canvas.height)
                            ctx.fillStyle = '#ffffff'
                            ctx.fillRect(0, 0, canvas.width, canvas.height)
                            ctx.drawImage(img, (gifWidth - targetWidth) / 2, (gifHeight - targetHeight) / 2, targetWidth, targetHeight)
                            resolve(canvas)
                        }
                    })
                }
                for (const item of this.selectedPage) {
                    const url = Vue.env.host.file + item.path
                    imgReqs.push(imgLoad(url))
                }
                Promise.all(imgReqs).then((res) => {
                    resolve(res)
                }).catch((error) => { reject(error) })
            })
        },
        uploadGif(gif) {
            return new Promise((resolve, reject) => {
                Vue.api.file.getUploadToken()
                    .then((token) => {
                        util.blobToDataURL(gif, (dataUrl) => {
                            Vue.api.file.uploadBase64(dataUrl.split(',')[1], token)
                                .then(res => {
                                    resolve(res.data.key)
                                }).catch(err => {
                                    err && Vue.logger.error(err)
                                    reject(err)
                                })
                        })
                    }).catch(err => {
                        err && Vue.logger.error(err)
                        reject(err)
                    })
            })
        },
        closeExpress() {
            this.closeMenu()
            // 是否是第三方开放平台
            const expressReferrer = storageSession.getItem(storageSession.key.expressReferrer) || ''
            if (expressReferrer !== '') {
                window.location.href = expressReferrer
            } else {
                message.success({
                    url: '',
                    type: '',
                    msg: 'close'
                })
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-head-express {
    > .express-head {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: center;
        .btn {
            width: 72px;
            height: 36px;
            background: rgba(25, 138, 231, 1);
            border-radius: 3px;
            font-size: 12px;
            color: rgba(255, 255, 255, 1);
            line-height: 36px;
            text-align: center;
            cursor: pointer;
        }
        .exp-gif {
            &.disable {
                pointer-events: none;
                color: #999;
                background: #f7f8f9;
            }
        }
        .btn:nth-child(2) {
            margin-left: 8px;
        }
        > .close {
            width: 36px;
            height: 36px;
            line-height: 36px;
            text-align: center;
            margin: 0 12px;
            color: #2f3c4d;
            border: 1px solid #ccd5db;
            border-radius: 3px;
            .icon {
                margin: 0;
            }
            &:hover {
                background: #ff2a6a;
                color: #fff;
                border: 1px solid #ff2a6a;
            }
        }
        .gif-menu {
            width: 590px;
            height: 393px;
            background: rgba(255, 255, 255, 1);
            box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
            margin-top: 4px;
            overflow: hidden;
            position: relative;
            float: right;
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: flex-start;
            align-items: center;
            .close {
                width: 20px;
                height: 20px;
                font-size: 12px;
                color: #76838f;
                position: absolute;
                top: 20px;
                right: 20px;
                text-align: center;
                line-height: 20px;
            }
            > .left {
                width: 266px;
                height: 100%;
                background: rgba(236, 238, 240, 1);
                text-align: left;
                color: #000000;
                .title {
                    font-size: 14px;
                    color: rgba(17, 17, 17, 1);
                    line-height: 14px;
                    margin: 24px 20px 10px;
                }
                .select-all {
                    margin: 0 0 0 33px;
                    span {
                        padding-left: 10px;
                    }
                }
                .page-list-box {
                    position: relative;
                    width: 226px;
                    height: 254px;
                    margin-left: 20px;
                    .page-list {
                        width: 100%;
                        background: #f7f8f9;
                        border-radius: 2px;
                        margin: 0 auto;
                        .page-li {
                            width: auto;
                            display: flex;
                            justify-content: flex-start;
                            align-items: center;
                            color: #2f3c4d;
                            height: 36px;
                            cursor: pointer;
                            margin-left: 13px;
                            .page-value {
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                                padding-left: 10px;
                            }
                        }
                    }
                }
            }
            > .right {
                width: 324px;
                height: 100%;
                background: rgba(247, 248, 249, 1);
                text-align: left;
                color: #000000;
                .title {
                    font-size: 14px;
                    color: rgba(17, 17, 17, 1);
                    line-height: 14px;
                    margin: 24px 20px 10px;
                }
                .gif {
                    width: 284px;
                    height: 224px;
                    background: rgba(0, 0, 0, 0.4);
                    margin: 0 auto;
                    .fake {
                        width: 100%;
                        height: 100%;
                        overflow: hidden;
                        position: relative;
                        li {
                            width: 100%;
                            height: 100%;
                            position: absolute;
                            top: 0;
                            left: 0;
                            display: none;
                        }
                        .img {
                            position: relative;
                            width: 100%;
                            height: 100%;
                            background: no-repeat center/contain;
                        }
                    }
                }
                .speed-bar {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: nowrap;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    margin: 18px 24px;
                    position: absolute;
                    span {
                        width: 14px;
                        height: 20px;
                        font-size: 14px;
                        font-weight: 400;
                        color: rgba(102, 102, 102, 1);
                        line-height: 20px;
                    }
                    .speed-bg {
                        width: 220px;
                        margin: 0 16px;
                        height: 2px;
                        background-color: #ffffff;
                        border-radius: 3px;
                    }
                    input[type="range"] {
                        width: 220px;
                        height: 2px;
                        font-size: 14px;
                        color: #2f3c4d;
                        -webkit-appearance: none !important;
                        background: -webkit-linear-gradient(#059cfa, #059cfa) no-repeat;
                        background-size: 0% 100%;
                        position: absolute;
                        left: 30px;
                        top: 9px;
                    }
                    input[type="range"]::-webkit-slider-thumb {
                        // 滑块
                        -webkit-appearance: none;
                        cursor: pointer;
                        width: 20px;
                        height: 20px;
                        background: #1593ff;
                        border: 6px solid #ffffff;
                        border-radius: 50%;
                    }
                    input[type="range"]::-moz-range-thumb {
                        // 滑块
                        -webkit-appearance: none;
                        cursor: pointer;
                        width: 8px;
                        height: 8px;
                        background: #1593ff;
                        border: 6px solid #ffffff;
                        border-radius: 50%;
                    }
                }
                .btns {
                    margin: 62px 36px 0 36px;
                    display: flex;
                    justify-content: space-between;
                    text-align: center;
                    .cancel-btn {
                        width: 118px;
                        height: 36px;
                        background: rgba(255, 255, 255, 1);
                        border-radius: 3px;
                        border: 1px solid rgba(204, 213, 219, 1);
                    }
                    .export-gif-btn {
                        width: 118px;
                        height: 36px;
                        background: rgba(21, 147, 255, 1);
                        border-radius: 3px;
                        border: 1px solid rgba(21, 147, 255, 1);
                        color: #ffffff;
                        &.disable {
                            pointer-events: none;
                            color: #999;
                            background: #f7f8f9;
                            border: 1px solid rgba(204, 213, 219, 1);
                        }
                    }
                }
            }
        }
        .img-menu {
            width: 120px;
            max-height: 332px;
            height: auto;
            background: rgba(255, 255, 255, 1);
            box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
            margin-top: 4px;
            overflow: hidden;
            position: relative;
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
            justify-content: flex-start;
            align-items: center;
            .close {
                width: 20px;
                height: 20px;
                font-size: 12px;
                color: #76838f;
                margin: 10px 0 0 70%;
                text-align: center;
                line-height: 20px;
            }
            .select-all {
                width: 90%;
                color: #2f3c4d;
                text-align: left;
                margin: 0 5%;
                font-size: 14px;
                height: 36px;
                cursor: pointer;
                display: flex;
                justify-content: flex-start;
                align-items: center;
                span {
                    padding-left: 10px;
                }
            }
            .page-list-box {
                position: relative;
                width: 90%;
                max-height: 210px;
                .page-list {
                    position: relative;
                    font-size: 14px;
                    .page-li {
                        width: auto;
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                        color: #2f3c4d;
                        height: 36px;
                        cursor: pointer;
                        .page-value {
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            padding-left: 10px;
                        }
                    }
                }
            }

            .img-export-btn {
                width: 120px;
                height: 36px;
                background: rgba(21, 147, 255, 1);
                font-size: 14px;
                color: #fff;
                line-height: 36px;
                margin-top: 10px;
                cursor: pointer;
                &.disable {
                    pointer-events: none;
                    color: #999;
                    background: #f7f8f9;
                }
            }
        }
    }
}
</style>
