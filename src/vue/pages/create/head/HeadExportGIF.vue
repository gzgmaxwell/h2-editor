<template>
    <div class="eqc-head-export-gif">
        <div
            class="content"
        >
            <div
                id="container"
                class="picture-content"
            >
                <p class="title">
                    选择要合成的图片（{{ pages.length }}）
                </p>
                <ul
                    class="eqc-ul"
                >
                    <li
                        v-for="(item, index) in pages"
                        :id="`li${index}`"
                        :key="item.id"
                        :class="['li-style', {active: item.check}, {'hint--top hint--rounded':urlArr.length <= 2 && item.check}]"
                        data-hint="不能少于2张图片"
                        class="li-margin"
                        @click="beChecked(item, index)"
                    >
                        <div
                            :style="{backgroundImage: getBackgroundImage(item.cover)}"
                            class="cover"
                        />
                        <i
                            class="check eqf-yes"
                        />
                        <div class="num">
                            {{ index + 1 }}
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="preview">
            <p class="name">
                预览
            </p>
            <div
                :style="{height:getGifPreivewHegiht}"
                class="gif"
            >
                <ul
                    v-show="previewShow"
                    ref="fakeList"
                    class="fake"
                >
                    <li
                        v-for="(item, index) in urlArr"
                        :id="`li${index}`"
                        :key="item.index"
                    >
                        <div
                            :style="{backgroundImage: getPreviewImage(item.path)}"
                            class="img"
                        />
                    </li>
                    <div
                        v-if="showAdviceLineState"
                        :class="{'line-up-down':showUpDownLine,'line-left-right':showLeftRightLine,'normal-line-up-down':normalLineUpDown,'normal-line-left-right':normalLineLeftRight}"
                    />
                </ul>
            </div>
            <div class="speed-bar">
                <span>慢</span>
                <div
                    class="speed-bg"
                />
                <input
                    v-model="speed"
                    :style="{backgroundSize: progressPoint*100/sppedDuration +'% 100%'}"
                    :max="sppedDuration"
                    type="range"
                    min="1"
                >
                <span>快</span>
            </div>
            <a
                class="help"
                @click="help"
            >
                <p>怎么做 一个酷炫的GIF</p>
                <i
                    class="why eqf-why-f"
                />
            </a>
            <i
                class="close eqf-no"
                @click="cancel"
            />
            <div class="footer">
                <div class="box">
                    <div
                        :class="{active:chooseItem==='gif'}"
                        class="btn"
                        @click="switchClick('gif')"
                    >
                        导出GIF
                    </div>
                    <div
                        :class="{active:chooseItem==='video'}"
                        class="btn"
                        @click="switchClick('video')"
                    >
                        导出小视频
                    </div>
                </div>
                <div class="line" />
                <div class="btn-group">
                    <head-export-gif-seting-quality v-if="chooseItem==='gif'" />
                    <base-button
                        v-if="chooseItem==='gif'"
                        class="white export"
                        @click.native="exportToImg"
                    >
                        <span>导出到图片库</span>
                        <i
                            class="icon why eqf-why-f"
                            @mouseover="showNotice(0)"
                            @mouseleave="hideNotice"
                        />
                    </base-button>
                    <div
                        v-if="chooseItem==='video'"
                        class="check-box"
                        @click="showLineCLick"
                    >
                        <base-checkbox v-model="showAdviceLineState" />
                        <span>朋友圈默认播放参考线</span>
                        <i
                            class="icon why eqf-why-f"
                            @mouseover="showNotice(2)"
                            @mouseleave="hideNotice"
                        />
                    </div>
                    <base-button
                        v-if="chooseItem==='video'"
                        :class="{disable: urlArr.length < 2 || exportingVideo}"
                        class="white export"
                        @click.native="exportToVideo"
                    >
                        <span>{{ exportingVideo ? "导出中...":"导出到视频库" }}</span>
                        <i
                            v-if="!exportingVideo"
                            class="icon why eqf-why-f"
                            @mouseover="showNotice(1)"
                            @mouseleave="hideNotice"
                        />
                    </base-button>
                    <div
                        rdt="3"
                        cat="editor"
                        act="duration"
                    >
                        <base-button
                            :class="{disable: urlArr.length < 2 || exporting}"
                            class="blue export"
                            rdt="3"
                            cat="pc_print"
                            act="编辑器_导出到电脑"
                            @click.native="pcDownload(1)"
                        >
                            {{ exporting ? "导出中请等候":"导出到电脑" }}
                        </base-button>
                    </div>
                </div>
            </div>
        </div>
        <head-notice
            v-show="showNoticeState"
            :type="noticeType"
        />
    </div>
</template>

<script>
import statistic from '../../../../config/statistic'
import gifParse from '../../../../utils/gifParsing'
import HeadExportGifSetingQuality from './HeadExportGifSetingQuality.vue'
import HeadNotice from './HeadNotice.vue'
import { host } from '../../../../config/env'
export default {
    components: {
        HeadExportGifSetingQuality, HeadNotice
    },
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
            maxInterval: 2, // 最大播放间隔 s
            speed: 10, // 滑动条值
            sppedDuration: 20, // 速度总份数
            exporting: false, // 是否正在导出
            urlArr: [], // 存储用户选择的需要合并的图片信息
            allBeSelected: false, // 是否全选
            timer: null, // gif预览动画timer
            num: 0, // gif预览动画计数
            previewShow: false, // 是否显示预览,
            canvasArray: [], // 下载的canvas
            chooseItem: 'gif',
            showAdviceLineState: false,
            showNoticeState: false,
            normalLineUpDown: false,
            normalLineLeftRight: false,
            noticeType: 0,
            showUpDownLine: false,
            showLeftRightLine: false,
            requestCount: 0, // 轮询次数  达到10次之后 强制结束
            lastRecord: '', // 上次的记录 用来判断是否再次生成gif
            lastVideoRecord: '', // 上次的记录 用来判断是否再次生成video
            gifCache: '', // 缓存gif
            videoCache: '', // 缓存video
            exportingVideo: false
        }
    },
    computed: {
        sceneJson() {
            return JSON.parse(JSON.stringify(Vue.store.state.scene.eqxScene.sceneJson))
        },
        pages() {
            return this.sceneJson.pages
        },
        progressPoint() { // 用于显示滑动条进度颜色
            return this.speed
        },
        realSpeed() {
            return this.maxInterval / this.speed
        },
        getGifPreivewHegiht() {
            return document.body.clientHeight - 77 - 124 - 64 + 'px'
        },
        useCache() {
            return JSON.stringify(this.urlArr) === this.lastRecord
        },
        useVideoCache() {
            return JSON.stringify(this.urlArr) === this.lastVideoRecord
        }
    },
    watch: {
        urlArr: {
            handler(newVal) {
                // 用户选择page改变时，重置预览动画
                this.setPreviewAni(true)
            },
            deep: true
        },
        speed: function (newVal) {
            // 用户设置速度改变时，重置预览动画
            this.setPreviewAni(false)
        }
    },
    mounted() {
        this.chooseItem = this.data.type
        this.selectAll()
        this.preLoadImgs()
        this.calculateCropLine()
    },
    methods: {
        calculateCropLine() {
            const { width, height } = this.sceneJson
            const scale = width / height
            if (scale < 0.45) {
                // 特别高
                this.showUpDownLine = true
            } else if (scale > 2.2) {
                // 特别宽
                this.showLeftRightLine = true
            } else if (scale <= 1) {
                this.normalLineLeftRight = true
            } else {
                this.normalLineUpDown = true
            }
        },
        showLineCLick() {
            this.showAdviceLineState = !this.showAdviceLineState
        },
        showNotice(type) {
            this.noticeType = type
            this.showNoticeState = true
        },
        hideNotice() {
            this.showNoticeState = false
        },
        getVideoByGif(url, cb) {
            // 后台接口根据gif 生成视频需要时间  所以这个接口需要轮训，当返回的state为4的时候 说明生成完毕
            return new Promise((resolve, reject) => {
                Vue.api.file.getVideoByGif([url]).then((data) => {
                    const mp4Url = data.data.obj[url].mp4Url
                    const state = data.data.obj[url].status
                    if (this.requestCount >= 10) {
                        this.requestCount = 0
                        resolve(false)
                    }
                    if (state !== 4) {
                        setTimeout(() => {
                            this.requestCount++
                            if (cb) {
                                this.getVideoByGif(url, cb)
                            } else {
                                this.getVideoByGif(url, resolve)
                            }
                        }, 1000)// 隔1s 再轮训这个接口
                    } else {
                        if (mp4Url) {
                            this.requestCount = 0
                            if (cb) {
                                const url = host.videoFile + mp4Url
                                cb(url)
                            } else {
                                resolve(host.videoFile + mp4Url)
                            }
                        } else {
                            Vue.notifier.fail('生成视频失败，请稍后重试')
                        }
                    }
                }).catch(err => {
                    this.requestCount = 0
                    err && Vue.logger.error(err)
                    Vue.loading.close()
                    Vue.notifier.fail('服务器异常，请稍后重试')
                })
            })
        },
        exportToVideo() {
            this.tracker('lib', true)
            this.exportingVideo = true
            if (this.useVideoCache) {
                this.uploadVedio(this.videoCache)
            } else {
                this.downloadGifLessThan2M().then(data => {
                    this.uploadImg(data).then(res => {
                        const gifUrl = Vue.env.host.file + res
                        this.getVideoByGif(gifUrl).then(url => {
                            this.lastVideoRecord = JSON.stringify(this.urlArr)
                            this.videoCache = url
                            this.uploadVedio(url)
                        })
                    }).catch(err => {
                        err && Vue.logger.error(err)
                        Vue.loading.close()
                        Vue.notifier.fail('服务器异常，请稍后重试')
                    })
                })
            }
        },
        uploadVedio(videoUrl) {
            const dateStr = new Date().format('yyyyMMddhhmmss')
            const fileName = '轻设计gif_' + dateStr + '.gif'
            Vue.api.file.uploadVideo(videoUrl, fileName).then((data) => {
                Vue.notifier.info('导出成功，刷新视频库可查看')
                this.exportingVideo = false
            }).catch(err => {
                err && Vue.logger.error(err)
                Vue.loading.close()
                this.exportingVideo = false
                Vue.notifier.fail('服务器异常，请稍后重试')
            })
        },
        exportToImg() {
            this.tracker('lib')
            this.downloadGifLessThan2M().then(data => {
                this.uploadImg(data).then(res => {
                    this.lastRecord = JSON.stringify(this.urlArr)
                    const urlArr = [{
                        extName: 'gif',
                        path: res,
                        name: res,
                        tmbPath: res
                    }]
                    Vue.api.file.saveToH5(Vue.env.h5TagId, urlArr, this.sceneJson.id)
                        .then((res) => {
                            Vue.loading.close()
                            Vue.notifier.info('导出成功，刷新素材库可查看')
                        })
                        .catch(err => {
                            err && this.logger.error(err)
                            Vue.loading.close()
                            Vue.notifier.fail('服务器异常，请稍后重试')
                        })
                }).catch(err => {
                    err && Vue.logger.error(err)
                    Vue.loading.close()
                    Vue.notifier.fail('服务器异常，请稍后重试')
                })
            })
        },
        downloadGifLessThan2M(pPercent = 1) {
            return new Promise((resolve, reject) => {
                this.addPointer()
                this.createGIF(pPercent).then((pBlob) => {
                    const blob = pBlob
                    this.blobToDataUrl(blob, resolve)
                    this.exporting = false
                    this.canvasArray = []
                }).catch(err => {
                    this.exporting = false
                    this.loading.close()
                    this.notifier.fail('导出失败，请稍后重试')
                    console.log(err)
                })
            })
        },
        blobToDataUrl(blob, cb) {
            var a = new FileReader()
            a.readAsDataURL(blob)
            a.onload = function (e) {
                cb(e.target.result)
            }
        },
        // 上传到七牛
        uploadImg(data) {
            return new Promise((resolve, reject) => {
                Vue.api.file.getUploadToken().then(token => {
                    Vue.api.file.uploadBase64(data.split(',')[1], token)
                        .then(res => {
                            resolve(res.data.key)
                        }).catch(err => {
                            err && Vue.logger.error(err)
                            reject(err)
                        })
                }).catch(err => {
                    err && Vue.logger.error(err)
                    reject(err)
                })
            })
        },
        switchClick(type) {
            this.chooseItem = type
        },
        urlArrPush(pageJson, order) {
            const obj = {
                index: pageJson.id,
                path: pageJson.cover,
                order
            }
            this.urlArr.push(obj)
            // 需要按照升序排序
            this.urlArr.sort((a1, a2) => a1.order - a2.order)
        },
        // 全选
        selectAll() {
            if (!this.exporting) {
                if (!this.allBeSelected) {
                    this.pages.forEach((pageJson, i) => {
                        if (!pageJson.check) {
                            pageJson.check = true
                            this.urlArrPush(pageJson, i)
                        }
                    })
                } else {
                    this.urlArr = []
                    this.imgCount = 0

                    this.pages.forEach((pageJson, i) => {
                        pageJson.check = false
                    })
                }
                this.allBeSelected = !this.allBeSelected
            }
        },
        // 选中状态
        beChecked(pageJson, index) {
            // 当选择数量等于2个且当前已被选中，则不能再取消，直接返回
            if (this.urlArr.length <= 2 && pageJson.check) {
                return
            }
            if (!this.exporting) {
                pageJson.check = !pageJson.check
                // 新增一个数组保存选中图片的url
                if (pageJson.check) {
                    this.urlArrPush(pageJson, index)
                } else {
                    // 根据下标找到没有被选中的图片并删除
                    this.urlArr.forEach((item, i) => {
                        if (item.index === pageJson.id) {
                            this.urlArr.splice(i, 1)
                        }
                    })
                }

                // 每次点击完毕后判断是否已经全部选中
                this.urlArr.length === this.pages.length ? this.allBeSelected = true : this.allBeSelected = false
            }
        },
        /**
         * 下载作品积分埋点
         */
        addPointer() {
            const params = { point_need: '1', e_t: 'element_click', product: 'print', b_t: 'default' }
            window._tracker_api_ && window._tracker_api_.report(params)
        },
        tracker(opType = 'local', videoFlag) {
            const q = Vue.store.state.scene.gifQuality
            let resolution = '原尺寸'
            if (!videoFlag && q === 40) {
                resolution = '用于微信公众号(<2M)'
            } else if (!videoFlag && q === 80) {
                resolution = '用于聊天群(<1M)'
            }
            const fileType = videoFlag ? 'video' : 'image'
            const extension = videoFlag ? 'MP4' : 'GIF'
            const ed = `op_type=${opType}&file_type=${fileType}&extension=${extension}&resolution=${resolution}&is_watermark=0&order_id=null`
            let loc = opType === 'local' ? '合成GIF-导出到电脑' : '合成GIF-导出到H5素材库'
            if (videoFlag) {
                loc = opType === 'local' ? '导出视频-导出到电脑' : '导出视频-导出到视频库'
            }
            const params = {
                // 产品线缩写
                product: 'print',
                // 业务线类型
                b_t: 'download',
                // 事件分类
                cat: 'download',
                // 图片类型
                img_type: extension,
                // 用户id
                u_i: this.data.userId,
                // 元素事件
                e_t: 'element_click',
                // 作品id
                works_id: this.sceneJson.id + '',
                // 作品创建者id
                w_u: this.data.userId,
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

            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.GIF,
                statistic.opt_label.GIF.gen])

            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.PE,
                statistic.opt_label.PE.gif])

            const useData = {
                printId: this.sceneJson.id,
                operateType: 1, // 1:下载
                resolutionType: 3,
                watermarkType: 2,
                fileFormat: extension.toLocaleLowerCase()
            }
            Vue.api.scene.saveWorkUseInfo(useData)
        },
        // 电脑下载GIF
        pcDownload(pPercent = 1) {
            this.addPointer()
            this.exporting = true
            this.loading.close()
            this.loading.open('导出中，请稍等')
            this.exporting = true
            if (this.chooseItem === 'gif') {
                this.tracker()
                this.createGIF(pPercent)
                    .then((pBlob) => {
                        const gifQuality = Vue.store.state.scene.gifQuality
                        if (gifQuality === 40) {
                            if (pBlob.size / 1024 > 2048) {
                                let sizePercent
                                if (pPercent === 1) {
                                    sizePercent = Math.floor(2048 / (pBlob.size / 1024) * 100) / 100
                                } else {
                                    sizePercent = pPercent * 0.9
                                }
                                this.pcDownload(sizePercent)
                                return
                            }
                        } else if (gifQuality === 80) {
                            if (pBlob.size / 1024 > 1024) {
                                let sizePercent
                                if (pPercent === 1) {
                                    sizePercent = Math.floor(1024 / (pBlob.size / 1024) * 100) / 100
                                } else {
                                    sizePercent = pPercent * 0.9
                                }
                                this.pcDownload(sizePercent)
                                return
                            }
                        }
                        const blob = pBlob
                        const url = URL.createObjectURL(blob)
                        const dateStr = new Date().format('yyyyMMddhhmmss')
                        this.downloadFile('轻设计gif_' + dateStr + '.gif', url)
                        this.exporting = false
                        this.canvasArray = []
                        // 还原gif质量的参数
                        Vue.store.commit('GIG_QUALITY_CHOOSE', 50)
                        this.loading.close()
                        this.close()
                    })
                    .catch(err => {
                        this.exporting = false
                        this.loading.close()
                        this.notifier.fail('导出失败，请稍后重试')
                        console.log(err)
                    })
            } else {
                this.tracker('local', true)
                if (this.useVideoCache) {
                    const dateStr = new Date().format('yyyyMMddhhmmss')
                    this.loading.close()
                    this.exporting = false
                    this.close()
                    this.downloadFile('轻设计gif_' + dateStr + '.gif', this.videoCache)
                } else {
                    this.downloadGifLessThan2M().then(data => {
                        this.uploadImg(data).then(res => {
                            const gifUrl = Vue.env.host.file + res
                            this.getVideoByGif(gifUrl).then(url => {
                                this.lastVideoRecord = JSON.stringify(this.urlArr)
                                this.videoCache = url
                                const dateStr = new Date().format('yyyyMMddhhmmss')
                                this.downloadFile('轻设计gif_' + dateStr + '.gif', url)
                                this.loading.close()
                                this.close()
                            })
                        }).catch(err => {
                            err && Vue.logger.error(err)
                            Vue.loading.close()
                            Vue.notifier.fail('服务器异常，请稍后重试')
                        })
                    })
                }
            }
        },
        downloadFile(fileName, url) {
            // 判断浏览器
            const a = document.createElement('a')
            a.download = fileName
            a.href = url
            a.trigger('click')
        },
        getBackgroundImage(src) {
            src = Vue.filter('qiniuZoom')(src, 120)
            return Vue.filter('backgroundImage')(src)
        },
        getPreviewImage(src) {
            src = Vue.filter('qiniuZoom')(src, 480, this.getGifPreivewHegiht)
            return Vue.filter('backgroundImage')(src)
        },
        createGIF(pPercent) {
            return new Promise((resolve, reject) => {
                if (this.useCache) {
                    const gifCache = this.gifCache
                    resolve(gifCache)
                } else {
                    let gifWidth = this.sceneJson.width || 488
                    let gifHeight = this.sceneJson.height || 402
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
                            const gifWorkerNum = Vue.store.state.scene.gifWorikerNum
                            const gifQuality = Vue.store.state.scene.gifQuality
                            try {
                                gifParse.getGifByGifJs(canvasArray, gifWorkerNum, gifQuality)
                                    .then((res) => {
                                        this.lastRecord = JSON.stringify(this.urlArr)
                                        this.gifCache = res
                                        resolve(res)
                                    })
                            } catch (error) {
                                this.notifier.fail('导出失败，请稍后重试')
                            }
                        })
                }
            })
        },
        createCanvas(gifWidth, gifHeight) {
            if (this.canvasArray.length === 0) {
                return new Promise((resolve, reject) => {
                    const imgReqs = []
                    const imgLoad = url => {
                        return new Promise((resolve, reject) => {
                            var img = new Image()
                            img.crossOrigin = 'anonymous' // 这个跨域的坑  这个crossOrigin 一定要排到src上面 不然会有跨域的问题
                            img.src = url + '?' + Number(new Date())

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
                    for (const item of this.urlArr) {
                        const url = Vue.env.host.file + item.path
                        imgReqs.push(imgLoad(url))
                    }
                    Promise.all(imgReqs).then((res) => {
                        this.canvasArray = res
                        resolve(res)
                    }).catch((error) => { reject(error) })
                })
            } else {
                return new Promise((resolve, reject) => {
                    const canvasConvertArray = []
                    this.canvasArray.forEach((item, index) => {
                        const newCanvas = document.createElement('canvas')
                        const newCanvasCtx = newCanvas.getContext('2d')
                        newCanvas.width = gifWidth
                        newCanvas.height = gifHeight
                        newCanvasCtx.drawImage(item, 0, 0, gifWidth, gifHeight)
                        canvasConvertArray.push(newCanvas)
                    })
                    resolve(canvasConvertArray)
                })
            }
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
                $fakeList = this.$refs.fakeList
                if ($fakeList) {
                    $lis = $fakeList.children
                }
            }
            if ($lis) {
                for (const $li of $lis) {
                    $li.css({ display: '' })
                }
                $lis[this.num].css({ display: 'block' })
                this.num++
                if (this.num === this.urlArr.length) {
                    this.num = 0
                }
            }
        },
        clearPreviewAni() {
            clearInterval(this.timer)
            this.timer = null
        },
        cancel() {
            // 还原gif质量的参数
            Vue.store.commit('GIG_QUALITY_CHOOSE', 50)
            this.clearPreviewAni()
            this.close()
        },
        uploadGif(gif) {
            return new Promise((resolve, reject) => {
                Vue.api.file.getUploadToken()
                    .then((token) => {
                        Vue.api.file.uploadBase64(gif.split(',')[1], token)
                            .then(res => {
                                resolve(res.data.key)
                            }).catch(err => {
                                err && Vue.logger.error(err)
                                reject(err)
                            })
                    }).catch(err => {
                        err && Vue.logger.error(err)
                        reject(err)
                    })
            })
        },
        help() {
            window.open('//qingsheji.help.eqxiu.com/gif.html', '_blank')
        },
        dataURItoBlob(base64Data) {
            let byteString
            if (base64Data.split(',')[0].indexOf('base64') >= 0) { byteString = atob(base64Data.split(',')[1]) } else { byteString = unescape(base64Data.split(',')[1]) }
            const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0]
            const ia = new Uint8Array(byteString.length)
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i)
            }
            return new Blob([ia], {
                type: mimeString
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
        preLoadImgs() {
            // 首次加载时会因图片张数和大小有加载延迟
            // 所以先一次性将预览图片资源加载完毕再显示
            this.loading.open('预览生成中')
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
            for (const item of this.urlArr) {
                const url = Vue.env.host.file + Vue.filter('qiniuZoom')(item.path, 488, 402)
                imgReqs.push(imgLoad(url))
            }
            Promise.all(imgReqs).then((res) => {
                this.previewShow = true
                this.loading.close()
            }).catch(err => {
                this.loading.close()
                err && Vue.logger.error(err)
            })
        }

    }
}
</script>

<style lang="scss">
$width: calc(100% - 552px);
.eqc-head-export-gif {
    position: relative;
    .content {
        width: $width;
        height: 100%;
        float: left;
        background-color: #ccd5db;
        .picture-content {
            position: relative;
            padding: 0 24px;
            height: 100%;
            width: 100%;
            background: #ccd5db;
            min-width: 368px;
            overflow-y: auto;
            .title {
                width: 80%;
                height: 25px;
                font-size: 17px;
                font-weight: 600;
                color: rgba(51, 51, 51, 1);
                line-height: 25px;
                margin-top: 30px;
            }
            .eqc-ul {
                padding-bottom: 24px;
                min-width: 492px;
            }
            .li-margin {
                margin-top: 24px;
            }
            .li-style {
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                position: relative;
                height: 148px;
                width: 148px;
                float: left;
                background: #eceef0;
                transition: all 0.3s;
                .check {
                    position: absolute;
                    right: 6px;
                    top: 6px;
                    width: 16px;
                    height: 16px;
                    font-style: normal;
                    display: inline-flex;
                    justify-content: center;
                    align-items: center;
                    border-radius: 50%;
                    font-size: 14px;
                    color: #fff;
                    background: #2f3c4d;
                    transition: all 0.3s;
                    &:hover {
                        background: $blue-hover;
                        opacity: 0.6;
                    }
                    &.active {
                        background: $blue-normal;
                    }
                }
                &:hover {
                    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
                }
                &.active {
                    background: #eceef0;
                    .check {
                        background: $blue-normal;
                    }
                }
                .cover {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    background: no-repeat center/contain;
                }
                .num {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 24px;
                    height: 24px;
                    font-size: 12px;
                    line-height: 24px;
                    text-align: center;
                    color: #a3afb7;
                }
            }
            @media screen and (max-width: 1279px) {
                .li-margin {
                    &:not(:nth-child(3n + 1)) {
                        margin-left: calc((100% - 148px * 3) / 2);
                    }
                }
            }
            @media screen and (min-width: 1280px) and (max-width: 1499px) {
                .li-margin {
                    &:not(:nth-child(4n + 1)) {
                        margin-left: calc((100% - 148px * 4) / 3);
                    }
                }
            }
            @media screen and (min-width: 1500px) and (max-width: 1919px) {
                .li-margin {
                    &:not(:nth-child(5n + 1)) {
                        margin-left: calc((100% - 148px * 5) / 4);
                    }
                }
            }
            @media screen and (min-width: 1920px) {
                .li-margin {
                    &:not(:nth-child(6n + 1)) {
                        margin-left: calc((100% - 148px * 6) / 5);
                    }
                }
            }
        }
    }
    .preview {
        width: 552px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        float: left;
        position: relative;
        background: #eceef0;
        border-right: 1px solid #ccd5db;
        .name {
            font-weight: 600;
            color: #111111;
            font-size: 18px;
            margin: 34px 0 25px;
            width: 100%;
            text-indent: 36px;
        }
        .gif {
            width: 480px;
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
                .line-up-down {
                    position: relative;
                    width: 100%;
                    height: calc(100% - 100px);
                    left: 0;
                    border-top: 1px dashed #ff5448;
                    border-bottom: 1px dashed #ff5448;
                    margin-top: 50px;
                }
                .line-left-right {
                    position: relative;
                    width: calc(100% - 80px);
                    height: 100%;
                    left: 0;
                    border-left: 1px dashed #ff5448;
                    border-right: 1px dashed #ff5448;
                    margin-left: 40px;
                }
                .normal-line-up-down {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    left: 0;
                    border-left: 1px dashed #ff5448;
                    border-right: 1px dashed #ff5448;
                }
                .normal-line-left-right {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    left: 0;
                    border-top: 1px dashed #ff5448;
                    border-bottom: 1px dashed #ff5448;
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
            margin-top: 36px;
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: center;
            align-items: center;
            text-align: center;
            position: absolute;
            bottom: 146px;
            span {
                width: 14px;
                height: 20px;
                font-size: 14px;
                font-weight: 400;
                color: rgba(102, 102, 102, 1);
                line-height: 20px;
            }
            .speed-bg {
                width: 260px;
                margin: 0 16px;
                height: 2px;
                background-color: #ffffff;
                border-radius: 3px;
            }
            input[type="range"] {
                width: 260px;
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
        .footer {
            background: white;
            width: 100%;
            height: 124px;
            padding: 17px 36px 24px 36px;
            // margin-top: 70px;
            position: absolute;
            bottom: 0;
            left: 0;
            .line {
                background: #ccd5db;
                height: 1px;
                margin-top: -1px;
            }
            .box {
                width: 100%;
                display: flex;
                justify-content: center;

                .btn {
                    width: 157px;
                    height: 28px;
                    text-align: center;
                    line-height: 28px;
                    font-size: 13px;
                    cursor: pointer;
                    &.active {
                        border-bottom: 2px solid #1593ff;
                    }
                }
            }
            .btn-group {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: 24px 0;
                i {
                    font-size: 14px;
                    color: #76838f;
                }
                .export {
                    width: 136px;
                    height: 36px;
                    font-size: 14px;
                    font-weight: 400;
                    span {
                        margin-right: 6px;
                    }
                }
                .check-box {
                    cursor: pointer;
                    font-size: 13px;
                    color: #2f3c4d;
                    display: flex;
                    align-items: center;
                    line-height: 20px;
                    .eqc-base-checkbox {
                        margin-right: 3px;
                        i {
                            color: white;
                        }
                    }
                    span {
                        margin-right: 3px;
                    }
                }
                .white {
                    color: #2f3c4d;
                }
            }
        }
        .help {
            position: absolute;
            top: 54%;
            left: 0;
            width: 36px;
            height: 183px;
            background: #ffffff;
            border-top-right-radius: 2px;
            border-bottom-right-radius: 2px;
            z-index: 1;
            cursor: pointer;
            p {
                width: 20px;
                font-size: 12px;
                font-weight: 400;
                color: rgba(102, 102, 102, 1);
                line-height: 16px;
                margin: 8px;
                text-align: center;
            }
            .why {
                font-size: 14px;
                margin: 0 10px;
            }
        }
        .close {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 28px;
            height: 28px;
            font-size: 22px;
            color: #fff;
            background: #2f3c4d;
            border-radius: 50%;
            position: absolute;
            top: 28px;
            right: 36px;
            cursor: pointer;
            transition: all 0.3s;
            &:hover {
                background: #ff2a6a;
            }
        }
        .blue {
            width: 100%;
            height: 36px;
            .count-box {
                width: 100px;
                display: flex;
                align-items: center;
                justify-content: space-around;
                .img-count {
                    font-size: 12px;
                    color: $blue-normal;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 100%;
                    background: white;
                }
            }
            &.disable {
                pointer-events: none;
                color: #999;
                background: #f7f8f9;
            }
            &.w96 {
                width: 96px;
            }
        }
    }
}
</style>
