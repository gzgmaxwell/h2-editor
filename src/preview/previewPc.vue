<template>
    <div class="platform">
        <div
            ref="picContainer"
            :style="{width:isFullScreen ? '100%':'calc(100% - 256px)'}"
            class="pic-container"
        >
            <div class="list">
                <div
                    class="reveal"
                >
                    <div
                        ref="slides"
                        class="slides"
                    />
                </div>
            </div>
            <div class="action-bar">
                <div
                    :class="[{'eqf-bigger':!isFullScreen},{'eqf-smaller':isFullScreen}]"
                    class="full-screen-btn"
                    @click="fullScreen"
                />
                <div
                    class="overview-btn eqf-menu-l"
                    @click="overview"
                />
            </div>
        </div>
        <div
            v-if="!isSetting"
            v-show="!isFullScreen"
            class="preview-info"
        >
            <div class="right-top">
                <div
                    class="right-title"
                >
                    <span>作品分享</span>
                    <i
                        :style="{visibility: `${hasShare ? 'hidden' : 'visible'}`}"
                        class="close eqf-no"
                        @click="closePreview"
                    />
                </div>
                <div class="product-info">
                    <span
                        class="product-title"
                    >标题描述</span>
                    <span
                        v-if="hasShare"
                        class="product-name"
                    >{{ dataObj.title }}</span>
                    <span
                        v-if="hasShare"
                        class="product-describe"
                    >{{ dataObj.description }}</span>
                    <div
                        v-if="!hasShare"
                        class="hint--left hint--rounded"
                        data-hint="点击修改作品标题"
                    >
                        <input
                            v-model="config.title"
                            class="product-name"
                            type="text"
                            maxlength="16"
                            placeholder="易企秀轻设计制作"
                            @blur="saveConfig(false)"
                        >
                    </div>
                    <div
                        v-if="!hasShare"
                        class="hint--left hint--rounded"
                        data-hint="点击修改作品描述"
                    >
                        <textarea
                            v-model="config.desc"
                            class="product-describe"
                            maxlength="32"
                            placeholder="轻松制作海报、邀请函、微信公号图，快使用轻设计吧！"
                            @blur="saveConfig(false)"
                        />
                    </div>
                </div>
                <div class="rb-top">
                    <p
                        v-show="isNeverPublished || isShowTip"
                        class="share-tip"
                    >
                        编辑过的作品需发布后才能<br>使用分享二维码和网址连接
                    </p>
                    <div
                        :style="{filter: `${isNeverPublished || isShowTip ? 'blur(4px)':''}`}"
                        class="right-middle"
                    >
                        <div
                            v-show="isNeverPublished || isShowTip"
                            class="share-mask"
                        />
                        <div class="qrcode">
                            <div
                                ref="qrcode"
                                class="qrcode-container"
                            />
                            <div
                                class="wechat"
                            />
                            <div class="share">
                                <span
                                    class="qq"
                                    @click="shareToOtherPlatform('qq')"
                                />
                                <span
                                    class="sina"
                                    @click="shareToOtherPlatform('sina')"
                                />
                                <span
                                    class="qq-zone"
                                    @click="shareToOtherPlatform('qq-zone')"
                                />
                            </div>
                        </div>
                        <div
                            v-if="!hasShare"
                            class="share-link"
                        >
                            <p class="link">
                                {{ preview.shareUrl }}
                            </p>
                            <i
                                class="copy-btn eqf-copy-l"
                                @click="copyHandle"
                            />
                        </div>
                        <a
                            v-if="hasShare"
                            href="//store.eqxiu.com/h2/"
                        >
                            <img
                                :src="bannerSrc"
                                class="banner"
                            >
                        </a>
                    </div>
                </div>
                <div
                    v-if="waterAuthorState && !hasShare"
                    class="share-area"
                    @click="shareClick"
                >
                    <base-checkbox v-model="shareWithoutWatermark" />
                    <span class="label">无水印分享</span>
                    <span class="vip">VIP</span>
                </div>
            </div>

            <div
                v-if="hasShare"
                class="banner-box"
            >
                <base-button
                    class="blue banner-btn"
                    href="//store.eqxiu.com/h2/"
                >
                    我也要做
                </base-button>
            </div>
            <div :class="['right-bottom', {visualization: !hasShare}]">
                <base-button
                    :class="[{disable: isPublished},{'hint--top':isShowTip},{'hint--rounded':isShowTip},{'hint--always':isShowTip}]"
                    :data-hint="showTip"
                    class="blue pub-btn"
                    @click.native="release"
                >
                    {{ isPublished ? '已发布' : '发布' }}
                </base-button>
            </div>
        </div>
        <div
            v-if="isSetting"
            v-show="!isFullScreen"
            ref="settings"
            class="preview-setting"
        >
            <div class="config-top">
                <div class="title">
                    <span>预览和设置</span>
                    <i
                        id="configClose"
                        class="close eqf-no"
                        @click="closePreview"
                    />
                </div>
                <span class="info">作品封面</span>
                <div
                    :style="{background: `${uploadCover !== '' ? getBackgroundImage(uploadCover): getBackgroundImage(productCover)} no-repeat center/contain`}"
                    class="config-cover"
                />
                <div
                    v-if="previewAllowUpload.includes(userType)"
                    class="upload"
                >
                    <span>建议尺寸：300px*300px</span>
                    <upload-btn v-bind="uploadOptions" />
                </div>
                <div class="config-info">
                    <span class="info">作品标题</span>
                    <input
                        v-model="config.title"
                        type="text"
                        maxlength="16"
                        placeholder="易企秀轻设计制作"
                    >
                </div>
                <div class="config-info h112">
                    <span class="info">作品描述</span>
                    <textarea
                        v-model="config.desc"
                        placeholder="轻松制作海报、邀请函、微信公号图，快使用轻设计吧！"
                        maxlength="32"
                    />
                </div>
            </div>
            <div :class="['right-bottom', {visualization: !hasShare}]">
                <base-button
                    class="blue save-btn"
                    @click.native="saveConfig"
                >
                    保存
                </base-button>
            </div>
        </div>
    </div>
</template>

<script>
import delayLoad from '../utils/delayLoad'
import statistic from '../config/statistic'
import storageLocal from '../utils/storageLocal'
import bannerImg from '../img/sharebanner.png'
import UploadBtn from './UploadBtn.vue'
import authority from '../config/authority.js'
import qiniuWatermark from '../utils/qiniuWatermark'
import waterMarker from '../utils/watermarker'
import eqxiuMaskImg from '../img/wm/eqxiumask.svg'
import * as Reveal from '../utils/reveal.min.js'
import '../scss/reveal.scss'

export default {
    components: {
        UploadBtn
    },
    data() {
        return {
            hasFullScreen: false,
            // 判断是否在全屏状态下
            isFullScreen: false,
            // 判断当前操作为进入全屏还是退出全屏
            enterOrExit: false,
            // 储存数据的对象
            dataObj: {},
            // 初始化宽高
            picBox: {
                width: 0,
                height: 0
            },
            // 是否是设置页
            isSetting: false,
            // 是否是分享页
            hasShare: false,
            preview: {
                shareUrl: '',
                wxMiniProShareUrl: ''
            },
            config: {
                title: '',
                desc: ''
            },
            // 需要提交的设置信息
            submitInfo: {},
            isPublished: false, // 是否已发布过
            isShowTip: false,
            showTip: '',
            isNeverPublished: false, // 从未发布过
            publishTimeKey: storageLocal.key.publishTime,
            saveTimeKey: storageLocal.key.saveTime,
            bannerSrc: bannerImg,
            productCover: '', // 作品封面
            uploadCover: '', // 上传的封面（秀客才能上传）
            shareWithoutWatermark: false,
            coversWithWatermark: [], // 秀客模式下存放的带水印图片
            eqxiuLogoImage: null
        }
    },
    computed: {
        uploadOptions() {
            return {
                onComplete: this.onComplete
            }
        },
        userInfo() {
            return JSON.parse(sessionStorage.getItem('H2-USER-INFO'))
        },
        userType() {
            if (this.userInfo) {
                return this.userInfo.type
            } else {
                return 1
            }
        },
        previewAllowUpload() {
            return authority.type.previewAllowUpload
        },
        vipMemberAuth() { // 7,8,9 企业会员（基础，标准，高级）
            return this.userInfo && ([7, 8, 9].includes(this.userInfo.memberType) || (this.userInfo.members && this.userInfo.members.some(item => [7, 8, 9].includes(item.memberId))))
        },
        buyMemberAuth() {
            return !(this.userInfo.members && this.userInfo.members.some(item => [14].includes(item.memberId))) && [1, 2, 99].includes(this.userInfo.type)
        },
        waterAuthorState() {
            const waterState = sessionStorage.getItem('H2-KEEP-WATERMARK')
            return waterState === '0' && this.userInfo.type !== 4
        }
    },
    created() {
        this.getEqxiuLogoImage().then(() => {
            this.getData()
        })
    },
    mounted() {
        this.bindingAndRemoveEvents('add')
    },
    destroyed() {
        this.bindingAndRemoveEvents('remove')
    },
    methods: {
        overview() {
            Reveal.addEventListener('overviewshown', (event) => {
                // console.log('overviewshown')
            })
            Reveal.addEventListener('overviewhidden', (event) => {
                // console.log('overviewhidden')
            })

            // Toggle the overview mode programmatically
            Reveal.toggleOverview()
        },
        initReveal() {
            // add <section>s
            const $slides = this.$refs.slides
            let sectionHtml = '<section>'
            for (let i = 0; i < this.dataObj.coverList.length; i++) {
                const cover = this.dataObj.coverList[i]
                const wmHtml = this.dataObj.userType === 4 ? `<div style="background: url(${this.getWaterMarkImage()}) no-repeat center/contain;width: 100%;height: 100%;position: absolute;top: 0;left: 0;"/>` : ''
                sectionHtml += `<section data-background-color="#333333"><div class="box">
                <img data-src="${this.getImageUrl(cover)}" style="width:${this.picBox.width};height:${this.picBox.height}">${wmHtml}</div></section>`
            }
            sectionHtml += '</section>'
            $slides.innerHTML = sectionHtml

            Reveal.initialize({
                controls: true,
                progress: true,
                center: true,
                hash: true,
                width: '100%',
                height: '100%',
                margin: 0,
                minScale: 1,
                maxScale: 1
            })
            // move to current index
            Reveal.addEventListener('ready', (event) => {
                const currentIndex = this.dataObj.coverList.indexOf(this.dataObj.currentCover)
                Reveal.slide(currentIndex)
            })
        },
        getEqxiuLogoImage() {
            return new Promise((resolve, reject) => {
                const img = new Image()
                img.crossOrigin = 'anonymous'
                img.src = eqxiuMaskImg
                img.onload = () => {
                    this.eqxiuLogoImage = img
                    resolve()
                }
            })
        },
        shareClick() {
            if (this.buyMemberAuth) {
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.MBTN])
                const options = {
                    benefitId: Vue.env.benefits.shareWithoutWM
                }
                this.dialog.openMember(options).then(res => {
                    if (res.success) {
                        this.notifier.success('支付成功，请刷新页面')
                        // 刷新该页面
                        window.location.reload()
                    } else {
                        this.notifier.fail('支付失败，请稍后重试')
                    }
                }).catch(err => {
                    err && this.logger.error(err)
                })
            } else {
                this.notifier.info('该功能为创意云会员和营销云会员专属权益')
            }
        },
        onComplete(data) {
            const { key } = data
            this.uploadCover = key
            this.dataObj.coverChange = true
            storageLocal.setItem(storageLocal.key.mainCover, key)
            // 封面上传完毕之后要更新预览并且展示
        },
        // 绑定事件
        bindingAndRemoveEvents(type) {
            document.addEventListener('fullscreenchange', this.fullScreenChange)
            document.addEventListener('mozfullscreenchange', this.fullScreenChange)
            document.addEventListener('webkitfullscreenchange', this.fullScreenChange)
            document.addEventListener('msfullscreenchange', this.fullScreenChange)
        },
        // 设置or分享
        setPreviewOrSetting() {
            if (this.dataObj && this.dataObj.way === 'setting') {
                // 作品设置页面
                this.isSetting = true
            } else {
                // 作品分享页面
                this.isSetting = false
                this.checkNeedPublish()
            }
        },
        // 作品封面
        setProductCover() {
            const mainCover = storageLocal.getItem(storageLocal.key.mainCover)
            this.productCover = mainCover && mainCover !== '' ? mainCover : this.dataObj.coverList[0]
        },
        // 基本信息
        setMainInfo() {
            this.dataObj.title = this.dataObj.title || '易企秀轻设计制作'
            this.dataObj.description = this.dataObj.description || '轻松制作海报、邀请函、微信公号图，快使用轻设计吧！'
            this.config.title = this.dataObj.title
            this.config.desc = this.dataObj.description
        },
        setUserType(userType) {
            this.dataObj.userType = userType
        },
        setGIFMode() {
            Vue.api.file.getImageInfo(this.dataObj.coverList[0]).then(imageInfo => {
                if (imageInfo.data.format === 'gif') {
                    this.dataObj.isGifScene = true
                } else {
                    this.dataObj.isGifScene = false
                }
            })
        },
        // 埋点作品id对象
        setScenceId() {
            let id = location.href.split('?')[0].split('/q/')[1]
            if (!id) {
                id = this.dataObj.printId
            } else if (id.split('_')[0]) {
                id = id.split('_')[0] // id_code 形式需要分离id
            }
            window.scene = { id }
        },
        setPicsList() {
            if (this.dataObj.userType === 4) {
                this.appendWatermark().then(newArr => {
                    this.coversWithWatermark = newArr
                    Vue.api.page.catchQrCode(`${newArr.join(',')}`).then(res => {
                        if (!this.isSetting) {
                            this.initQrcode(res.data.obj.code)
                        }
                        this.initReveal()
                    })
                })
            } else {
                if (!this.isSetting) {
                    this.initQrcode()
                }
                this.initReveal()
            }
        },
        // 图片宽高
        setImageWidthHeight(containerWidth, containerHeight) {
            const height = Number(this.dataObj.height)
            const width = Number(this.dataObj.width)
            const scale = width / height
            let boxWidth, boxHeight
            if (width > height) {
                boxWidth = `${width > containerWidth ? containerWidth : width}`
                boxHeight = boxWidth / scale
            } else if (width < height) {
                boxHeight = `${height > containerHeight ? containerHeight : height}`
                boxWidth = boxHeight * scale
            } else {
                boxWidth = `${width > containerWidth ? containerWidth : width}`
                boxHeight = boxWidth
            }
            // 屏幕适配
            const windowHeight = window.screen.height
            const windowWidth = window.screen.width
            const windowScale = windowWidth / windowHeight

            if (scale < windowScale) {
                // 预览作品的尺寸宽高比  比屏幕的宽高比 大 也就是说 作品的高度比屏幕的高度占比要多
                if (height >= windowHeight) {
                    boxHeight = window.document.body.offsetHeight
                    boxWidth = boxHeight * scale
                }
                if (Number(boxWidth) + 256 > windowWidth) {
                    if (boxWidth > windowWidth - 256) {
                        boxWidth = windowWidth - 256
                        boxHeight = boxWidth / scale
                    }
                }
            } else {
                // 左边有个‘作品预览’是256px 如果该预览图比屏幕整个都宽 右边就会被遮盖一部分
                if (Number(width) + 256 > windowWidth) {
                    boxWidth = windowWidth - 256
                    boxHeight = boxWidth / scale
                }
            }
            this.picBox = {
                width: `${parseInt(boxWidth)}px`,
                height: `${parseInt(boxHeight)}px`
            }
        },
        // 获取数据
        getData() {
            let promise = Promise.resolve()
            const shareInfo = sessionStorage.getItem('SHARE-INFO')
            if (!shareInfo) {
                // pc分享出去的连接访问
                const id = location.href.split('?')[0].split('/q/')[1]
                const code = id.split('_')[1]
                if (code) {
                    this.dataObj.code = code
                }
                const getshareInfo = id => {
                    return new Promise((resolve, reject) => {
                        Vue.api.getShareInfo(id).then(res => {
                            resolve(res.data.obj)
                        })
                    })
                }
                const getUserInfoByPrintId = id => {
                    return new Promise((resolve, reject) => {
                        Vue.api.getUserInfoByPrintId(id).then(res => {
                            resolve(res.data.map.type)
                        })
                    })
                }
                promise = Promise.all([getshareInfo(id), getUserInfoByPrintId(id)]).then(([data, userType]) => {
                    return new Promise((resolve, reject) => {
                        resolve({ data, userType })
                    })
                })
            }
            promise.then((res) => {
                if (res && res.data) {
                    this.dataObj = res.data
                    this.$emit('showTp', this.dataObj.share)
                    this.hasShare = true
                } else {
                    // 从编辑器作品分享、设置按钮
                    this.dataObj = JSON.parse(shareInfo)
                }
                if (res && res.userType) {
                    this.setUserType(Number(res.userType))
                } else {
                    this.setUserType(this.userInfo.type)
                }
                this.setData()
            }).catch(err => { err && Vue.logger.err(err) })
        },
        setData() {
            const width = this.$refs.picContainer.offsetWidth
            const height = this.$refs.picContainer.offsetHeight

            if (!this.hasShare) {
                this.setPreviewOrSetting()
            } else {

            }
            this.setGIFMode()
            this.setScenceId()
            this.setMainInfo()
            this.setProductCover()
            this.setImageWidthHeight(width, height)
            this.setPicsList()
        },
        // 监听全屏状态变化
        fullScreenChange() {
            this.hasFullScreen = !this.hasFullScreen
            if (this.enterOrExit) {
                this.isFullScreen = false
            } else {
                this.isFullScreen = true
            }
            this.enterOrExit = !this.enterOrExit
        },
        // 全屏展示
        fullScreen() {
            const el = this.$el
            const rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen
            if (!this.isFullScreen) {
                if (rfs) {
                    rfs.call(el)
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen()
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen()
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen()
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen()
                }
            }
            this.isFullScreen = !this.isFullScreen
        },
        appendWatermark() {
            return new Promise((resolve, reject) => {
                // 秀客模式下添加水印后缀
                const newArr = []
                this.dataObj.coverList.map(cover => {
                    newArr.push(qiniuWatermark.getLogoWaterMark(cover))
                })
                resolve(newArr)
            })
        },
        // 生成二维码
        initQrcode(code) {
            this.preview.shareUrl = Vue.env.host.shareUrl + '/q/' + this.dataObj.printId + (this.dataObj.code ? '_' + this.dataObj.code : '')
            if (code) {
                this.preview.wxMiniProShareUrl = (Vue.env.host.wxMiniProShareUrl + '/view/photo?id=' + this.dataObj.printId + '&appletCode=poster&code=' + code).replace('http://', 'https://')
            } else {
                this.preview.wxMiniProShareUrl = (Vue.env.host.wxMiniProShareUrl + '/view/photo?id=' + this.dataObj.printId + '&appletCode=poster').replace('http://', 'https://')
            }

            delayLoad.delayLoadJS(Vue.plugin.qrcode).then(() => {
                this.$refs.qrcode.innerHTML = ''
                const $image = window.$('<div>').qrcode({
                    render: 'canvas',
                    ecLevel: 'H',
                    text: this.preview.wxMiniProShareUrl,
                    size: 160,
                    fill: '#000',
                    background: '#fff'
                }).children().get(0)
                this.$refs.qrcode.appendChild($image)
            })
        },
        // 生成图片src
        createSrc(index) {
            if (this.dataObj.userType === 4) {
                return /base64|http/.test(this.coversWithWatermark[index]) ? this.coversWithWatermark[index] : Vue.env.host.file + this.coversWithWatermark[index]
            } else {
                return /base64|http/.test(this.dataObj.coverList[index]) ? this.dataObj.coverList[index] : Vue.env.host.file + this.dataObj.coverList[index]
            }
        },
        // qq、微博、qq空间分享
        shareToOtherPlatform(name) {
            let shareUrl = ''
            let params = {}

            if (name === 'qq') {
                shareUrl = '//connect.qq.com/widget/shareqq/index.html?'
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.ST,
                    statistic.opt_label.ST.qqfriend])
                this.tracker(name, '分享-qq按钮')
            }
            if (name === 'qq-zone') {
                shareUrl = '//sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?'
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.ST,
                    statistic.opt_label.ST.qqzone])
                this.tracker(name, '分享-qq空间按钮')
            }
            if (name === 'qq-zone' || name === 'qq') {
                params = {
                    url: Vue.env.host.shareUrl + '/q/' + this.dataObj.printId,
                    title: this.dataObj.title,
                    desc: this.dataObj.description,
                    summary: this.dataObj.description,
                    pics: this.createSrc(0),
                    site: '易企秀'
                }
            }
            if (name === 'sina') {
                shareUrl = '//service.weibo.com/share/share.php?'
                params = {
                    url: Vue.env.host.shareUrl + '/q/' + this.dataObj.printId,
                    title: this.dataObj.title,
                    pic: this.createSrc(0)
                }
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.ST,
                    statistic.opt_label.ST.webo])
                this.tracker(name, '分享-微博按钮')
            }
            const paramsArr = []
            for (var i in params) {
                if (i !== 'pics') {
                    paramsArr.push(i + '=' + encodeURIComponent(params[i] || ''))
                } else {
                    paramsArr.push(i + '=' + params[i])
                }
            }
            const url = shareUrl + paramsArr.join('&')
            window.open(url)
        },
        getImageUrl(src) {
            return Vue.env.host.file + src
        },
        // 获取背景图片
        getBackgroundImage(src, flag) {
            return Vue.filter('backgroundImage')(src)
        },
        getWaterMarkImage() {
            return waterMarker.logoMark(this.eqxiuLogoImage, this.dataObj.width, this.dataObj.height)
        },
        // 保存设置
        saveConfig(close = true) {
            if (this.isChanged()) {
                this.submitInfo.id = this.dataObj.printId
                // 若是有上传封面则更新到服务器
                if (this.uploadCover !== '') {
                    this.submitInfo.cover = this.uploadCover
                }

                Vue.api.updateScene(this.submitInfo, this.dataObj.userId)
                    .then(res => {
                        parent.postMessage({ type: 'updateConfig', params: this.submitInfo }, '*')
                        Object.assign(this.dataObj, this.submitInfo)
                        if (close) {
                            this.closePreviewSuccess()
                        }
                    })
                    .catch(err => {
                        err && this.logger.error(err)
                    })
            } else {
                if (close) {
                    this.closePreview()
                }
            }
        },
        // 判断设置是否被修改过
        isChanged() {
            const sceneJson = this.dataObj
            const info = this.config
            const submitInfo = {}
            if (info.title !== sceneJson.title) {
                submitInfo.title = info.title
            }
            if (info.desc !== sceneJson.description) {
                submitInfo.description = info.desc
            }
            this.submitInfo = submitInfo
            return !!Object.keys(submitInfo).length || sceneJson.coverChange
        },
        // 发布
        release() {
            if (!this.dataObj.userId) {
                this.showTip = '发布功能需登录后才能使用'
                this.isShowTip = true
                return
            }
            let promise = Promise.resolve()
            // 用户需要绑定手机（type=21,22 不检测）
            if (!([21, 22].includes(this.userInfo.type)) && !this.userInfo.phone) {
                promise = this.dialog.openBindPhone()
            }
            promise.then(() => {
                const params = {
                    printId: this.dataObj.printId,
                    title: this.config.title,
                    width: this.dataObj.width.toString(),
                    height: this.dataObj.height.toString(),
                    scale: this.dataObj.scale.toString(),
                    description: this.config.desc,
                    coverList: this.dataObj.coverList,
                    share: 3
                }
                if (this.dataObj.share === 4) {
                    params.share = 5
                }
                Vue.api.previewRelease(params).then(() => {
                    this.isNeverPublished = false
                    this.isPublished = true
                    this.isShowTip = false
                    this.showTip = ''
                    // 更新当前作品发布时间
                    this.setPublishTime()
                    window._hmt.push(['_trackEvent',
                        statistic.category.F,
                        statistic.action.PUBLISH,
                        statistic.opt_label.PUBLISH.click])
                    this.tracker()
                })
            }).catch(err => err && Vue.logger.err(err))
        },
        // 关闭
        closePreview() {
            parent.postMessage({ type: 'close' }, '*')
        },
        // 保存成功后关闭
        closePreviewSuccess() {
            parent.postMessage({ type: 'close', params: '保存成功' }, '*')
        },
        setPublishTime() {
            const pubIds = storageLocal.getItem(this.publishTimeKey)
            let pubArr = []
            if (pubIds) {
                pubArr = JSON.parse(pubIds)
            }
            let found = false
            pubArr.map((v, i) => {
                if (v.printId === this.dataObj.printId) {
                    v.pubTime = new Date().getTime()
                    found = true
                }
            })
            if (!found) {
                const t = new Date().getTime()
                pubArr.push({ printId: this.dataObj.printId, pubTime: t })
            }
            storageLocal.setItem(this.publishTimeKey, JSON.stringify(pubArr))
        },
        checkNeedPublish() {
            const pub = storageLocal.getItem(this.publishTimeKey)
            const sav = storageLocal.getItem(this.saveTimeKey)

            if (!pub) {
                // 从未发布过
                this.isNeverPublished = true
                this.isPublished = false
                this.isShowTip = false
            } else {
                const pubArr = JSON.parse(pub)
                let found = false
                let pubTime = 0
                pubArr.map((v, i) => {
                    if (v.printId === this.dataObj.printId) {
                        pubTime = v.pubTime
                        found = true
                    }
                })
                if (!found) {
                    // 从未发布过
                    this.isNeverPublished = true
                    this.isPublished = false
                    this.isShowTip = false
                } else {
                    const savArr = JSON.parse(sav)
                    let savTime = 0
                    savArr.map((v, i) => {
                        if (v.printId === this.dataObj.printId) {
                            savTime = v.saveTime
                        }
                    })
                    if (pubTime > savTime) {
                        this.isNeverPublished = false
                        this.isPublished = true
                        this.isShowTip = false
                        this.showTip = ''
                    } else {
                        this.isNeverPublished = false
                        this.isPublished = false
                        this.isShowTip = true
                        this.showTip = '内容有更新，须重新发布'
                    }
                }
            }
        },
        tracker(opType = 'share', loc = '分享-发布按钮') {
            const userId = this.dataObj.userId ? this.dataObj.userId : ''
            const pid = this.dataObj.printId ? this.dataObj.printId : ''
            const watermark = this.dataObj.userType === 4 || (this.waterAuthorState && !this.hasShare) ? 1 : 0
            const downloadType = this.dataObj.isGifScene ? 'GIF' : 'PNG'
            const ed = `op_type=${opType}&file_type=image&extension=${downloadType}&resolution=原图&is_watermark=${watermark}&order_id=null`
            const params = {
                // 产品线缩写
                product: 'print',
                // 业务类型
                b_t: 'share',
                // 事件分类
                cat: 'share',
                // 图片类型
                img_type: downloadType,
                // 用户id
                u_i: userId,
                // 元素事件
                e_t: 'element_click',
                // 作品id
                works_id: pid + '',
                // 作品创建者id
                w_u: userId,
                // 下载位置
                loc,
                // 来源端
                f_p: 'PC',
                // 其他参数
                e_d: ed,
                // 新增act 与opType 相同
                act: opType,
                // 时长 固定传0
                dur: 0
            }
            window._tracker_api_ && window._tracker_api_.report(params)
        },
        copyHandle() {
            const copy = (e) => {
                e.preventDefault()
                e.clipboardData.setData('text/plain', this.preview.shareUrl)
                this.notifier.success('复制成功')
                document.removeEventListener('copy', copy)
            }
            document.addEventListener('copy', copy)
            document.execCommand('Copy')
        }
    }
}
</script>

<style lang="scss">
.platform {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-around;

    .preview-info,
    .preview-setting {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: 256px;
        height: 100%;
        padding-top: 18px;
        background: #ffffff;
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
            transition: background-color 0.3s;
            &:hover {
                background: #ff2a6a;
            }
        }
        .right-top,
        .config-top {
            padding: 0 24px;
        }
        .right-bottom {
            visibility: hidden;
            width: 100%;
            position: absolute;
            bottom: 0;
            left: 0;
            &.visualization {
                visibility: visible;
            }

            .pub-btn,
            .save-btn {
                width: 100%;
                height: 60px;
                line-height: 60px;
                border-radius: 0;
            }
            &.disable {
                background: rgba(238, 238, 238, 1);
                border: 1px solid rgba(204, 213, 219, 1);
                pointer-events: none;
            }
        }
    }
    .preview-info {
        position: relative;
        .right-title {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 18px;
            font-weight: bold;
            color: #111;
        }
        .rb-top {
            position: relative;
        }
        .share-area {
            margin-top: 12px;
            font-size: 12px;
            position: relative;
            color: #4f5d69;
            .label {
                margin-left: 6px;
            }
            .vip {
                width: 32px;
                height: 16px;
                color: rgba(192, 150, 89, 1);
                border-radius: 3px;
                line-height: 16px;
                position: absolute;
                top: -7px;
                right: 95px;
                text-align: center;
                font-size: 12px;
            }
        }
        .product-info {
            width: 100%;
            margin: 18px 0 16px 0;
            span {
                display: block;
            }
        }
        .product-title {
            font-size: 14px;
            color: #111;
            font-weight: bold;
        }
        .product-name {
            outline: none;
            border: 0;
            height: 28px;
            width: 208px;
            margin-top: 10px;
            padding: 0 0 10px 0;
            font-size: 14px;
            color: #252b3f;
            border-bottom: 1px solid #ccd5db;
        }
        .product-describe {
            width: 208px;
            height: 48px;
            outline: none;
            resize: none;
            color: #252b3f;
            font-size: 13px;
            border: 0;
            margin-top: 16px;
            border-bottom: 1px solid #ccd5db;
            font-family: HelveticaNeue;
            line-height: 15px;
        }
        .qrcode {
            width: 208px;
            height: 280px;
            background: #fff;
            padding: 24px 24px 0;
            box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.16);
            .qrcode-container {
                width: 160px;
                height: 160px;
            }
            .wechat {
                background: url("../img/qrcode_wechat.png") center;
                background-size: 100% 100%;
                width: 34px;
                height: 34px;
                position: absolute;
                top: 86px;
                left: 86px;
                border: 2px solid #ffffff;
            }
            .share {
                width: 100%;
                height: 48px;
                margin-top: 23px;
                border-top: 1px solid #ccd5db;
                display: flex;
                justify-content: space-between;
                .qq {
                    background: url("../img/QQ.svg") center;
                }
                .sina {
                    background: url("../img/weibo.svg") center;
                }
                .qq-zone {
                    background: url("../img/QQzone.svg") center;
                }
                span {
                    width: 36px;
                    height: 36px;
                    margin-top: 16px;
                    cursor: pointer;
                }
            }
        }
        .share-link {
            margin-top: 16px;
            width: 100%;
            height: 36px;
            padding: 10px;
            background: rgba(240, 243, 244, 1);
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 14px;
            .link {
                width: 90%;
                overflow: hidden;
                text-overflow: ellipsis;
                font-family: HelveticaNeue;
                color: rgba(102, 102, 102, 1);
            }
            .copy-btn {
                cursor: pointer;
            }
        }
        .share-tip {
            font-weight: 600;
            color: rgba(17, 17, 17, 1);
            line-height: 22px;
            text-align: center;
            width: 100%;
            position: absolute;
            top: 52%;
            left: 0;
            z-index: 1;
            font-size: 14px;
            font-family: PingFangSC-Semibold, PingFang SC;
        }
        .right-middle {
            position: relative;
            .share-mask {
                width: 100%;
                height: 100%;
                background: #fff;
                background: rgba(255, 255, 255, 0.7);
                position: absolute;
                top: 0;
                left: 0;
            }
            .banner {
                margin: 16px 0;
                width: 100%;
            }
        }
        .banner-box {
            width: 100%;
            position: absolute;
            bottom: 0;
            left: 0;
            .banner-btn {
                width: 100%;
                height: 60px;
                border-radius: 0;
                text-decoration: none;
            }
        }
    }
    .preview-setting {
        position: relative;
        .config-top {
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-start;
            .upload {
                font-size: 12px;
                color: #666666;
                height: 48px;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .title {
                font-size: 18px;
                width: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: bold;
                color: #111;
            }
            .config-cover {
                width: 208px;
                height: 208px;
                background: url("../img/cover.png") center center;
                background-size: cover;
                box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.16);
                position: relative;
                margin-top: 16px;
                .config-update {
                    position: absolute;
                    right: 8px;
                    bottom: 8px;
                    font-size: 12px;
                    color: #fff;
                    padding: 6px;
                    background: #000;
                    cursor: pointer;
                    border-radius: 3px;
                    transition: all 0.3s;
                    &:hover {
                        background: #1593ff;
                    }
                }
            }
            .info {
                font-size: 14px;
                color: #111;
                font-weight: bold;
                margin: 12px 0 -4px 0;
            }
        }
        .config-info {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            .info {
                font-size: 14px;
                color: #111;
                font-weight: bold;
                margin: 16px 0 8px 0;
            }
            input {
                width: 208px;
                outline: none;
                height: 36px;
                border: 1px solid #ccd5db;
                padding: 10px;
                border-radius: 3px;
                color: #111;
            }
            textarea {
                width: 208px;
                height: 64px;
                padding: 10px;
                outline: none;
                border: 1px solid #ccd5db;
                resize: none;
                border-radius: 3px;
                font-family: "Helvetica Neue", "Microsoft YaHei", arial, sans-serif;
                color: #111;
                line-height: 20px;
            }
            &.h92 {
                height: 92px;
            }
            &.h112 {
                height: 112px;
            }
        }
    }

    .pic-container {
        // width: calc(100% - 256px);
        height: 100%;
        position: relative;
        .list {
            width: 100%;
            height: 100%;
            .reveal {
                background: #333333;
                section {
                    padding: 0;
                }
            }
            .reveal .progress {
                background: rgba(0, 0, 0, 0.2);
                span {
                    background-color: #1593ff;
                }
            }
            .box {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                position: relative;
                overflow: hidden;
            }
        }
        .action-bar {
            font-size: 22px;
            position: absolute;
            top: 18px;
            right: 18px;
            color: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            z-index: 10;
        }
        .full-screen-btn,
        .overview-btn {
            cursor: pointer;
            margin-bottom: 10px;
            opacity: 0.2;
            &:hover {
                opacity: 1;
            }
        }
    }
}
</style>
