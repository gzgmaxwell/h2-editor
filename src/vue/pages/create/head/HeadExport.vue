<template>
    <div class="eqc-head-export">
        <div
            :class="['content',pages.length===1?'single':'']"
        >
            <div
                v-if="pages.length!==1"
                id="container"
                v-scroll-bar
                :style="{height:isGIFMode?'100%':'calc(100% - 60px)'}"
                class="picture-content"
            >
                <ul class="clearfix eqc-ul">
                    <li
                        v-for="(item, index) in pages"
                        :id="`li${index}`"
                        :key="item.id"
                        :class="['li-style', {active: isGIFMode ? (urlArr.length <= 10 && item.check):(item.check) }, {'hint--top hint--rounded':isGIFMode && urlArr.length > 9 && !item.check}]"
                        data-hint="gif导出一次不能超过10张"
                        class="li-margin"
                        @click="beChecked(item, index)"
                    >
                        <div
                            :style="{backgroundImage: getBackgroundImage(item.cover)}"
                            class="cover"
                        >
                            <div
                                v-if="userInfo.type === 4"
                                :style="{background: `url(${getWaterMarkImage()}) no-repeat center/contain`}"
                                style="width: 100%;height: 100%;"
                            />
                        </div>
                        <i
                            :class="{'eqf-yes': !item.check}"
                            class="check"
                        >
                            <span v-show="item.check">{{ beCheckedArr[index] }}</span>
                        </i>
                        <div class="num">
                            {{ index + 1 }}
                        </div>
                    </li>
                </ul>
            </div>
            <div
                v-if="!isGIFMode && pages.length!==1"
                class="bottom"
            >
                <div
                    :class="['opt', 'all', {disable: exporting}]"
                    @click="selectAll"
                >
                    <base-checkbox
                        id="checkbox_upload_all"
                        v-model="allBeSelected"
                    />
                    <label>全选</label>
                </div>
            </div>
            <img
                v-if="pages.length===1"
                :src="getSingleImgUrl"
                class="single-img"
            >
            <div
                v-if="userInfo.type === 4 && pages.length===1"
                :style="{background: `url(${getWaterMarkImage()}) no-repeat center/contain`}"
                style="width: 100%;height: 100%; position:absolute;"
            />
        </div>
        <div class="right-bar">
            <div class="right-bar-top">
                <div
                    :style="{marginBottom: data.type === 2 ? '14px':'0px'}"
                    class="rb-top"
                >
                    <span class="title">作品下载</span>
                    <i
                        class="close eqf-no"
                        @click="close"
                    />
                </div>
                <div class="right-bar-content">
                    <div
                        v-if="data.type !== 2"
                        class="right-bar-oper"
                    >
                        <p class="oper-title">
                            下载电脑设置
                        </p>
                        <div class="oper-box">
                            <div
                                v-if="puzzleMode"
                                class="radio-box"
                            >
                                <div
                                    v-for="(item,index) of puzzleModelist.list"
                                    :key="index"
                                    class="radio-item"
                                >
                                    <base-radio
                                        v-model="puzzleRadioValue"
                                        :class="{'disabled': exporting}"
                                        :value="item.type"
                                        name="exportFormat"
                                        @change="choosePuzzleFormat(item)"
                                    />
                                    <p class="name">
                                        {{ item.name }}
                                    </p>
                                </div>
                            </div>
                            <div
                                :class="{'disabled':mode.selectedItem.name === 'PDF'}"
                                :style="{marginBottom: isGIFMode ? '14px':'0px'}"
                                class="chose-size"
                                @mouseover="showDropDown = true"
                                @mouseleave="showDropDown = false"
                            >
                                <span ref="sizeContent">{{ sizeTag.selectedItem.name }}</span>
                                <div
                                    :class="{roate: showDropDown}"
                                    class="triangle"
                                >
                                    <i class="eqf-menu-down" />
                                </div>
                                <base-drop-down
                                    v-if="showDropDown"
                                    :list="sizeTag.list"
                                    :css="isGIFMode ? {left: '0px', top:'35px', paddingBottom: '10px', width: '100%', zIndex: 3}:
                                        {left: '0px', top:'35px', paddingBottom: '10px', width: '100%', zIndex: 3}"
                                    item-key="num"
                                    @choose="chooseTag"
                                />
                            </div>
                            <div
                                v-if="!isGIFMode && !puzzleMode"
                                class="radio-box"
                            >
                                <div
                                    v-for="(item,index) of mode.list"
                                    :key="index"
                                    class="radio-item"
                                >
                                    <base-radio
                                        v-model="radioValue"
                                        :class="{'disabled': exporting}"
                                        :value="item.name"
                                        name="exportFormat"
                                        @change="chooseFormat(item)"
                                    />
                                    <p class="name">
                                        {{ item.name }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        v-if="!puzzleMode"
                        class="price-box"
                    >
                        <price-card ref="priceCard" />
                    </div>
                </div>
            </div>

            <div class="right-bar-bottom">
                <div class="wrapper">
                    <div
                        :class="{show: mode.selectedItem.name === 'PDF' && urlArr.length > 1, hide: mode.selectedItem.name !== 'PDF' || urlArr.length <= 1}"
                        class="export-pdf"
                    >
                        <base-button
                            :class="{disable: urlArr.length === 0 || exporting}"
                            class="blue w96"
                            style="border-right:1px solid rgba(255,255,255,1);"
                            @click.native="exportPDFToPC(1)"
                        >
                            {{ respectively ? '下载中...' : '分别下载' }}
                        </base-button>
                        <base-button
                            :class="{disable: urlArr.length === 0 || exporting}"
                            class="blue w96"
                            @click.native="exportPDFToPC(2)"
                        >
                            {{ merge ? '下载中...' : '合并下载' }}
                        </base-button>
                    </div>
                    <div
                        rdt="3"
                        cat="editor"
                        act="duration"
                    >
                        <div
                            v-if="!isPuzzleSplitMode"
                            class="exp-other-btns"
                        >
                            <base-button
                                :class="{disable: urlArr.length === 0 || exporting}"
                                class="white h20"
                                style="border-right: 1px solid rgba(230,235,237,1);border-top-left-radius: 0px;border-bottom-left-radius: 0px;"
                                rdt="3"
                                cat="pc_print"
                                act="编辑器_导出到手机"
                                @click.native="openExportToPhone"
                            >
                                下载到手机
                            </base-button>
                            <base-button
                                v-if="data.type === 2"
                                :class="{'disable': urlArr.length === 0 || exporting}"
                                class="white h20"
                                style="border-top-right-radius: 0px;border-bottom-right-radius: 0px;"
                                rdt="3"
                                cat="pc_print"
                                act="编辑器_导出到视频库"
                                @click.native="exportToVideo"
                            >
                                <span>视频库</span>
                                <i
                                    :class="{'disable': urlArr.length === 0 || exporting}"
                                    class="icon why eqf-why-f"
                                    @mouseover="showNotice(3)"
                                    @mouseleave="hideNotice"
                                />
                                <div
                                    class="time-limit-free"
                                >
                                    限免
                                </div>
                            </base-button>
                            <base-button
                                v-if="data.type !== 2"
                                :class="{disable: urlArr.length === 0 || (exporting && exportingH5)}"
                                class="white h20"
                                style="border-top-right-radius: 0px;border-bottom-right-radius: 0px;"
                                rdt="3"
                                cat="pc_print"
                                act="编辑器_导出到图片库"
                                @click.native="toH5"
                            >
                                <span>图片库</span>
                                <i
                                    :class="{'disable': urlArr.length === 0 || (exporting && exportingH5)}"
                                    class="icon why eqf-why-f"
                                    @mouseover="showNotice(0)"
                                    @mouseleave="hideNotice"
                                />
                                <div
                                    v-if="!puzzleMode"
                                    class="time-limit-free"
                                >
                                    限免
                                </div>
                            </base-button>
                        </div>
                        <base-button
                            :class="{disable: urlArr.length === 0 || exporting}"
                            class="blue"
                            rdt="3"
                            cat="pc_print"
                            act="编辑器_导出到电脑"
                            @click.native="pcDownload"
                        >
                            <div class="count-box">
                                <span
                                    v-show="urlArr.length !== 0 || exporting"
                                    class="img-count"
                                >
                                    {{ urlArr.length }}
                                </span>
                                {{ isGIFMode && data.type !== 2?'下载GIF到电脑':'下载到电脑' }}
                            </div>
                        </base-button>
                    </div>
                </div>
            </div>
        </div>
        <head-notice
            v-show="showNoticeState"
            :option="noticeOption"
            :type="noticeType"
        />
        <!-- 手机导出打开期间，电脑导出和手机导出都置灰，只有H5导出能用，关闭手机导出，恢复 -->
        <export-to-phone
            ref="exportToPhone"
            :url-arr="urlArr"
            @onClose="phoneClose"
        />
    </div>
</template>

<script>
import delayLoad from '../../../../utils/delayLoad'
import EqxScene from '../../../../core/scene'
import EqxPage from '../../../../core/html/page'
import { dataURL2Blob } from '../../../../utils/blob'
import util from '../../../../utils/util'
import statistic from '../../../../config/statistic'
import { host } from '../../../../config/env'
import storageLocal from '../../../../utils/storageLocal'
import EnumSceneType from '../../../../config/enum.scene.type'
import HeadNotice from './HeadNotice.vue'
import elementType from '../../../../config/enum.element.type'
import ExportToPhone from './ExportToPhone.vue'
import priceCard from '../../../plugins/priceCard.vue'
import waterAuthor from '../../../../config/watermarkAuthor.js'
import user from '../../../../api/user'
import waterMarker from '../../../../utils/watermarker'
import eqxiuMaskImg from '../../../../img/wm/eqxiumask.svg'
import JSZip from 'jszip'
import puzzle2Canvas from '../../puzzle/puzzle.canvas.js'

export default {
    components: {
        HeadNotice, ExportToPhone, priceCard
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
            exporting: false,
            respectively: false,
            merge: false,
            processFlag: true,
            mode: {
                list: [
                    {
                        name: 'JPG',
                        type: 'jpeg'
                    },
                    {
                        name: 'PNG',
                        type: 'png'
                    },
                    {
                        name: 'PDF',
                        type: 'pdf'
                    }
                ],
                selectedItem: null
            },
            beCheckedArr: [],
            imgCount: 0,
            // 菜单选项
            sizeTag: {
                list: [],
                selectedItem: null
            },
            // 多尺寸菜单
            showDropDown: false,
            // 提示框
            shareDialogShow: false,
            countDown: 0,
            // 只有一个页面
            onlyOnePage: false,
            // 没有生成过二维码
            hasCreated: false,
            qrcodeKey: '',
            urlArr: [],
            allBeSelected: false,
            downLoadUrl: [],
            radioValue: 'PNG',
            requestCount: 0, //  轮询次数  达到10次之后 强制结束
            isGIFMode: false, // 是否是导出gif模式
            showNoticeState: false,
            noticeType: 3,
            noticeOption: {
                right: 70,
                bottom: 100
            },
            exportingH5: true,
            gifProcessOpen: false,
            finish: null, // 下载完成之后权益的回调函数
            waterMark: false, // 是否带水印
            merchantOrderNo: '', // 订单id
            eqxiuLogoImage: null,
            zip: null,
            downloadBlob: [], // 多张下载时存放生成好的blob
            puzzleModelist: {
                list: [{
                    name: '合并下载',
                    type: 'together'
                },
                {
                    name: '分别下载',
                    type: 'split'
                }],
                selectedItem: null

            },
            puzzleRadioValue: 'together'

        }
    },
    computed: {
        sceneJson() {
            return JSON.parse(JSON.stringify(Vue.store.state.scene.eqxScene.sceneJson))
        },
        pages() {
            return this.sceneJson.pages
        },
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        // 7,8,9 Vip
        vipMemberAuth() {
            return this.userInfo && ([7, 8, 9].includes(this.userInfo.memberType) || (this.userInfo.members && this.userInfo.members.some(item => [7, 8, 9].includes(item.memberId))))
        },
        // 营销云 vip
        yinxiaoVipMemberAuth() {
            return this.userInfo.members && this.userInfo.members.some(item => [202, 203, 204].includes(item.memberId))
        },
        // 创意 vip
        chuangyiVipMemberAuth() {
            return this.userInfo.members && this.userInfo.members.some(item => [14].includes(item.memberId))
        },
        // 是否是会员
        isMember() {
            return this.vipMemberAuth || this.yinxiaoVipMemberAuth || this.chuangyiVipMemberAuth
        },
        buyMemberAuth() {
            return this.user.allow('buyMember')
        },
        // 返回单张图片地址
        getSingleImgUrl() {
            return `${Vue.env.host.file + this.pages[0].cover}`
        },
        puzzleMode() {
            return Vue.store.state.scene.puzzleMode
        },
        isPuzzleSplitMode() {
            return this.puzzleModelist.selectedItem && this.puzzleModelist.selectedItem.type === 'split'
        }

    },
    watch: {
        urlArr: {
            handler(newVal) {
                // 刷新权益
                if (this.$refs.priceCard) {
                    this.$refs.priceCard.setExportCount(newVal.length)
                }
            },
            deep: true
        },
        'mode.selectedItem.name': {
            handler(newVal) {
                if (newVal === 'PDF') {
                    this.chooseTag(this.sizeTag.list[this.sizeTag.list.length - 1])
                }
            }
        }
    },
    created() {
        this.getEqxiuLogoImage().then(() => {})
        this.mode.selectedItem = this.mode.list[1] // 默认导出为png格式
        this.checkContainGifElement() // 判断是不是gif场景
        this.getTag()
        if (this.puzzleMode) {
            this.puzzleModelist.selectedItem = this.puzzleModelist.list[0]
        }
    },
    mounted() {
        if (this.isGIFMode) {
            // 第一次进入导出页面的时候，将这个开关设置成true
            if (this.pages.length === 1) {
                this.onlyOnePage = true
                this.pages[0].check = true
                this.allBeSelected = true
                this.urlArrPush(this.pages[0])
                ++this.imgCount
                this.beCheckedArr.splice(0, 1, 1)
            }
            if (this.$refs.priceCard) {
                this.$refs.priceCard.setExportCount(0) // 不选中 默认为0
            }
        } else {
            // 全选
            this.selectAll()
        }
    },
    methods: {
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
        checkNoWatermarkDownload(type, phoneType) {
            return new Promise((resolve, reject) => {
                // 判断是不是会员 如果是会员则正常走 和之前一样
                const down = resolve
                if (waterAuthor.checkWaterAuthor()) {
                    down()
                } else {
                    const execution = (opposite = false) => {
                        if (this.isGIFMode) {
                            // 判断gif满足下载条件不  如果满足下载条件则重新生成无水印的gif 如果不满足则设置全局无水印标识，再重新生成无水印gif
                            const index = 0
                            const num = this.sizeTag.selectedItem.num
                            this.gifProcessOpen = true
                            if (this.data.type === 2) {
                                Vue.processGifBar.open('视频导出中...')
                            } else if (phoneType) {
                                Vue.processGifBar.open('GIF导出中...')
                            } else {
                                Vue.processGifBar.open()
                            }

                            const getNoWatermarkGifCover = index => {
                                return new Promise((resolve, reject) => {
                                    let reCreate = false
                                    const fileSizeObj = JSON.parse(storageLocal.getItem(storageLocal.key.gifFileSize))
                                    const gifFileSize = parseInt(fileSizeObj[this.urlArr[index].obj.cover]) / (1024 * 1024)
                                    if (num === 1) {
                                        // 原尺寸 需要重新生成
                                        reCreate = true
                                    } else if (num === 2) {
                                        //  用于微信工作号 < 2M
                                        if (gifFileSize <= 2) {
                                            reCreate = true
                                        }
                                    } else if (num === 3) {
                                        //  用于聊天群 < 1M
                                        if (gifFileSize <= 1) {
                                            reCreate = true
                                        }
                                    }
                                    if (reCreate) {
                                        const pageId = this.urlArr[index].obj.id
                                        const choosePage = Vue.store.state.scene.eqxScene.eqxPages.find(page => page.pageJson.id === pageId)
                                        Vue.store.dispatch('GET_NO_WATERMARK_COVER', { eqxPage: choosePage, opposite }).then(data => {
                                            this.urlArr[index].noWaterPath = data.data.key
                                            if (index === this.urlArr.length - 1) {
                                                down()
                                            } else {
                                                index++
                                                getNoWatermarkGifCover(index)
                                            }
                                        })
                                    } else {
                                        if (index === this.urlArr.length - 1) {
                                            down()
                                        } else {
                                            index++
                                            getNoWatermarkGifCover(index)
                                        }
                                    }
                                })
                            }
                            getNoWatermarkGifCover(index)
                        } else {
                            const tipStr = opposite ? '生成中' : '水印去除中'
                            this.loading.open(tipStr)
                            if (this.mode.selectedItem.name === 'PDF' || phoneType) {
                                // 遍历
                                this.exporting = true
                                type === 1 ? this.respectively = true : this.merge = true
                                const index = 0
                                const getNoWatermarkCover = index => {
                                    return new Promise((resolve, reject) => {
                                        const pageId = this.urlArr[index].obj.id
                                        const choosePage = Vue.store.state.scene.eqxScene.eqxPages.find(page => page.pageJson.id === pageId)
                                        Vue.store.dispatch('GET_NO_WATERMARK_COVER', { eqxPage: choosePage, opposite }).then(data => {
                                            this.urlArr[index].noWaterPath = data.data.key
                                            if (index === this.urlArr.length - 1) {
                                                down()
                                            } else {
                                                index++
                                                getNoWatermarkCover(index)
                                            }
                                        })
                                    })
                                }
                                getNoWatermarkCover(index)
                            } else if (['JPG', 'PNG'].includes(this.mode.selectedItem.name)) {
                                if (!opposite) {
                                    // 设置全局无水印变量变量
                                    Vue.store.commit('WATERMARK_COVER_CHANGE', true)
                                }
                                down()
                            }
                        }
                    }
                    if (phoneType === 'video') { // 导出到视频库都是无水印的限免，直接走去水印流程
                        this.waterMark = false
                        execution()
                    } else {
                        if (this.puzzleMode) { // 拼图默认无水印,不用判断是否支付
                            this.waterMark = false
                            execution()
                        } else {
                            this.$refs.priceCard.pay().then(res => {
                                if (res.success) {
                                    if (res.waterMark) { // 用户选择下载带水印的
                                        this.waterMark = true
                                        if (this.userInfo.type === 4) {
                                            execution(true)
                                        } else {
                                            down()
                                        }
                                    } else {
                                        this.merchantOrderNo = res.merchantOrderNo
                                        this.waterMark = false
                                        this.finish = res.callback
                                        execution()
                                    }
                                }
                            })
                        }
                    }
                }
            })
        },
        getVideoByGif(url, cb, fail) {
            // 后台接口根据gif 生成视频需要时间  所以这个接口需要轮训，当返回的state为4的时候 说明生成完毕
            return new Promise((resolve, reject) => {
                let timer = null
                Vue.api.file.getGifVideo([{ url, loopCount: 2 }]).then((data) => {
                    const mp4Url = data.data.list[0].mp4Url
                    const state = data.data.list[0].status
                    if (this.requestCount >= 10) {
                        this.requestCount = 0
                        fail()
                        return
                    }
                    if (state !== 4) {
                        timer = setTimeout(() => {
                            this.requestCount++
                            if (cb) {
                                this.getVideoByGif(url, cb, fail) // 隔1s 再轮训这个接口
                            } else {
                                this.getVideoByGif(url, resolve, reject) // 隔1s 再轮训这个接口
                            }
                        }, 1000)
                    } else {
                        clearTimeout(timer)
                        if (mp4Url) {
                            this.requestCount = 0
                            const url = host.videoFile + mp4Url
                            if (cb) {
                                cb(url)
                            } else {
                                resolve(url)
                            }
                        } else {
                            Vue.notifier.fail('生成视频失败，请稍后重试')
                        }
                    }
                }).catch(err => {
                    clearTimeout(timer)
                    this.requestCount = 0
                    err && Vue.logger.error(err)
                    Vue.loading.close()
                    Vue.store.commit('WATERMARK_COVER_CHANGE', false)
                    Vue.notifier.fail('服务器异常，请稍后重试')
                })
            })
        },
        exportToVideo() {
            // 导出到视频库
            this.checkNoWatermarkDownload(null, 'video').then(() => {
                this.tracker('lib')
                if (this.gifProcessOpen) {
                    Vue.processGifBar.close()
                    this.gifProcessOpen = false
                }
                setTimeout(() => {
                    this.downloadVideoFile(false)
                }, 200)
            })
        },
        checkContainGifElement() {
            const sceneType = Vue.store.state.scene.eqxScene.sceneJson.type
            if (EnumSceneType.isAllowAddGifToScene(sceneType)) {
                // gif场景
                this.isGIFMode = true
            } else {
                this.isGIFMode = false
            }
        },
        chooseFormat(item) {
            this.radioValue = item.name
            this.mode.selectedItem = item
        },
        choosePuzzleFormat(item) {
            this.puzzleRadioValue = item.type
            this.puzzleModelist.selectedItem = item
        },
        urlArrPush(pageJson) {
            this.urlArr.push({
                index: pageJson.id,
                extName: 'png',
                path: pageJson.cover,
                name: pageJson.cover,
                tmbPath: pageJson.cover,
                obj: pageJson
            })
        },
        // 全选
        selectAll() {
            if (!this.exporting) {
                if (!this.allBeSelected) {
                    // 遍历数组，将所有没被选中的图片选中 ----- 可能有更好的解决方法
                    this.pages.forEach((pageJson, i) => {
                        if (!pageJson.check) {
                            pageJson.check = true
                            this.beCheckedArr.splice(i, 1, ++this.imgCount)
                            this.urlArrPush(pageJson)
                        }
                    })
                } else {
                    this.urlArr = []
                    this.hasCreated = false
                    this.imgCount = 0
                    this.pages.forEach((pageJson, i) => {
                        this.beCheckedArr.splice(i, 1, 0)
                        pageJson.check = false
                    })
                }
                this.allBeSelected = !this.allBeSelected
                this.onlyOnePage = false
            }
        },
        // 选中状态
        beChecked(pageJson, index) {
            // gif模式下当选择数量大于10个且当前已被选中，则不能再选中，直接返回
            if (this.urlArr.length > 9 && !pageJson.check && this.isGIFMode) {
                return
            }
            if (!this.exporting) {
                // 已经不是刚进入组件时的状态了
                this.onlyOnePage = false
                // 如果已经生成过二维码的话
                pageJson.check = !pageJson.check
                // 新增一个数组保存选中图片的url
                // const checkList = this.$el.querySelectorAll('.check')
                if (pageJson.check) {
                    ++this.imgCount
                    this.beCheckedArr[index] = this.imgCount
                    this.urlArrPush(pageJson)
                } else {
                    --this.imgCount
                    Vue.nextTick(() => {
                        this.beCheckedArr.forEach((item, i) => {
                            if (item > this.beCheckedArr[index]) {
                                this.beCheckedArr.splice(i, 1, item - 1)
                            }
                        })
                    })
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
        /**
         * opType: local:下载到本地(导出到手机也是本地) lib:导出到素材库
         * enableResolution: 是否获取分辨率设置
         */
        tracker(opType = 'local', enableResolution = false) {
            if (this.puzzleMode) {
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.PUZZLE,
                    statistic.opt_label.PUZZLE.download])
                return
            }
            let downloadType = this.isGIFMode ? statistic.opt_label.PE.gif : this.mode.selectedItem.name
            const resolution = (enableResolution && this.data.type !== 2) ? this.sizeTag.selectedItem.name : '原图'
            let loc = opType === 'local' ? '导出作品-导出到电脑' : '导出作品-导出到H5素材库'
            if (opType === 'phone') {
                loc = '导出作品-导出到手机'
                opType = 'local'
            }
            if (this.data.type === 2) {
                loc = opType === 'local' ? '导出视频-导出到电脑' : '导出视频-导出到视频库'
                downloadType = 'MP4'
            }
            const fileType = this.data.type === 2 ? 'video' : 'image'
            const watermark = this.waterMark ? 1 : 0
            const orderId = this.watermark ? 'null' : this.merchantOrderNo
            const ed = `op_type=${opType}&file_type=${fileType}&extension=${downloadType}&resolution=${resolution}&is_watermark=${watermark}&order_id=${orderId}`
            const params = {
                // 产品线缩写
                product: 'print',
                // 业务类型
                b_t: 'download',
                // 事件分类
                cat: 'download',
                // 图片类型
                img_type: downloadType,
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
                statistic.action.PE,
                downloadType])

            const useData = {
                printId: this.sceneJson.id,
                operateType: 1, // 1:下载
                resolutionType: resolution === '原图' ? 3 : parseInt(this.sizeTag.selectedItem.num) === 10 ? 8 : parseInt(this.sizeTag.selectedItem.num) + 2,
                watermarkType: this.waterMark ? 1 : 2,
                fileFormat: downloadType.toLocaleLowerCase()
            }
            Vue.api.scene.saveWorkUseInfo(useData)
        },
        /**
         * 拼图分别下载
         */
        getSplitPuzzleCanvas() {
            const ele = Vue.store.state.scene.eqxPage.eqxElements[0]
            const puzzleJson = Vue.store.state.scene.eqxPage.pageJson.elements[0]
            const multiples = this.sizeTag.selectedItem.num
            const size = this.sceneJson.width
            return new Promise((resolve, reject) => {
                if (!puzzleJson) {
                    reject()
                } else {
                    puzzle2Canvas({ data: puzzleJson, ele: ele, multiples, size })
                        .then(canvas => {
                            const blob = []
                            for (let i = 0; i < canvas.length; i++) {
                                const data = canvas[i].toDataURL()
                                const item = dataURL2Blob(data)
                                blob.push(item)
                            }
                            resolve(blob)
                        })
                        .catch(err => {
                            err && this.logger.error(err)
                            reject()
                        })
                }
            })
        },
        // 电脑下载
        pcDownload() {
            if (this.puzzleMode && this.puzzleModelist.selectedItem.type === 'split') {
                // 拼图分开下载
                this.loading.open('生成中')
                this.getSplitPuzzleCanvas().then(res => {
                    // 多张blob全部生成完毕，组装zip
                    this.zip = new JSZip()
                    res.forEach((itme, i) => {
                        const fileName = '轻设计_' + new Date().format('yyyyMMddhhmmss') + '_' + (i + 1) + '.png'
                        this.zip.file(fileName, itme)
                    })
                    this.zip.generateAsync({ type: 'blob' })
                        .then((content) => {
                            delayLoad.delayLoadJS(Vue.env.plugin.fileSaver)
                                .then(() => {
                                    // eslint-disable-next-line
                                        saveAs(content, `易企秀|轻设计_导出拼图.zip`)
                                    this.loading.close()
                                    setTimeout(() => {
                                        this.close()
                                        window._hmt.push(['_trackEvent',
                                            statistic.category.F,
                                            statistic.action.PUZZLE,
                                            statistic.opt_label.PUZZLE.split])
                                    }, 550)
                                })
                        })
                }).catch(err => err && this.logger.error(err))
            } else {
                // 常规下载
                this.downloadBlob = []
                this.checkNoWatermarkDownload().then(() => {
                    if (this.mode.selectedItem.name !== 'PDF') {
                        this.tracker('local', true)
                        this.addPointer()
                        if (!this.isGIFMode) {
                            this.sceneJson.height *= this.sizeTag.selectedItem.num
                            this.sceneJson.width *= this.sizeTag.selectedItem.num
                        } else {
                            if (this.data.type !== 2) {
                                Vue.processGifBar.open() // 打开gif加载框  视频模式下不生效
                                this.gifProcessOpen = true
                            }
                        }
                        if (this.isGIFMode) {
                            if (this.data.type === 2) {
                            // video
                                this.downloadVideoFile(true)
                            } else {
                            // GIF
                                this.downloadGif()
                            }
                        } else {
                        // PNG JPG
                            this.pcMultiDownloadNotGif()
                        }
                    } else {
                        this.exportPDFToPC(1, true)
                    }
                    if (!this.isGIFMode) { // 非gif模式
                        this.close()
                    }
                })
            }
        },
        downloadVideoFile(state, pIndex = 0) {
            Vue.loading.open('导出中')
            if (state) {
                // 下载到电脑
                if (this.urlArr.length === 1) {
                    // 1个直接下载
                    const item = this.urlArr[0]
                    const fileName = (this.sceneJson.title || '无标题') + '_' + new Date().format('yyyyMMddhhmmss') + '_' + 1 + '.mp4'
                    let url = host.file + (item.noWaterPath ? item.noWaterPath : item.path)
                    if (this.waterMark && this.userInfo.type !== 4) { // 非秀客用户需要水印
                        url = host.file + item.path
                    }
                    const promise = this.getVideoByGif(url)
                    promise.then(url => {
                        this.downloadFile(fileName, url)
                        this.loading.close()
                        this.closeGifLoading()// 扣除权益
                    }).catch(err => err && this.logger.error(err))
                    promise.catch(function (value) {
                        Vue.loading.close()
                        Vue.notifier.fail('导出失败，请重试')
                    })
                } else {
                    // 大于1个下载压缩包
                    const promise = this.getDownloadVideoFileBlob(pIndex)
                    promise.then(res => {
                        Vue.loading.close()
                        this.downloadBlob.push(res)
                        if (pIndex + 1 === this.urlArr.length) {
                            this.zip = new JSZip()
                            this.downloadBlob.forEach((itme, i) => {
                                const fileName = (this.sceneJson.title || '无标题') + '_' + new Date().format('yyyyMMddhhmmss') + '_' + (i + 1) + '.mp4'
                                this.zip.file(fileName, itme)
                            })
                            this.zip.generateAsync({ type: 'blob' })
                                .then((content) => {
                                    delayLoad.delayLoadJS(Vue.env.plugin.fileSaver)
                                        .then(() => {
                                            // eslint-disable-next-line
                                    saveAs(content, `易企秀|轻设计_导出小视频.zip`)
                                            this.loading.close()
                                            this.closeGifLoading()// 扣除权益
                                        })
                                })
                            return
                        }
                        this.downloadVideoFile(state, pIndex + 1)
                    }).catch(err => err && this.logger.error(err))
                    promise.catch(function (value) {
                        Vue.loading.close()
                        Vue.notifier.fail('导出失败，请重试')
                    })
                }
            } else {
                // 转到视频库
                for (let i = 0; i < this.urlArr.length; i++) {
                    const item = this.urlArr[i]
                    const fileName = (this.sceneJson.title || '无标题') + '_' + new Date().format('yyyyMMddhhmmss') + '_' + i + '.mp4'
                    const url = host.file + (item.noWaterPath ? item.noWaterPath : item.path)
                    Vue.api.file.uploadVideo(url, fileName).then((data) => {
                        Vue.notifier.info('导出成功，刷新视频库可查看')
                    }).catch(err => {
                        err && Vue.logger.error(err)
                        Vue.loading.close()
                        Vue.notifier.fail('服务器异常，请稍后重试')
                    })
                }
            }
        },
        // 获取视频文件的blob
        getDownloadVideoFileBlob(index) {
            const item = this.urlArr[index]
            let url = host.file + (item.noWaterPath ? item.noWaterPath : item.path)
            if (this.waterMark && this.userInfo.type !== 4) { // 非秀客用户需要水印
                url = host.file + item.path
            }
            return new Promise((resolve, reject) => {
                const promise = this.getVideoByGif(url)
                promise.then(url => {
                    util.ajax2Blob(url).then(res => {
                        resolve(res)
                    })
                }).catch(err => err && this.logger.error(err))
                promise.catch(function (value) {
                    reject()
                })
            })
        },
        downloadGif(pIndex = 0) {
            Vue.loading.open('导出中')
            if (this.urlArr.length === 1) { // 1个直接下载
                this.getGifBase64(this.urlArr[0]).then(res => {
                    const fileName = (this.sceneJson.title || '无标题') + '_' + new Date().format('yyyyMMddhhmmss') + '_1.gif'
                    // download here
                    this.downloadGifFile(fileName, res)
                    Vue.loading.close()
                    this.closeGifLoading()// 扣除权益
                })
            } else { // 大于1个下载压缩包
                const item = this.urlArr[pIndex]
                this.getGifBase64(item).then(res => {
                    Vue.loading.close()
                    this.downloadBlob.push(res)

                    if (pIndex + 1 === this.urlArr.length) {
                        const promiseArr = []
                        this.downloadBlob.forEach((itme, i) => {
                            promiseArr.push(util.ajax2Blob(itme))
                        })
                        Promise.all(promiseArr).then((res) => {
                            this.zip = new JSZip()
                            res.forEach((itme, i) => {
                                const fileName = (this.sceneJson.title || '无标题') + '_' + new Date().format('yyyyMMddhhmmss') + '_' + (i + 1) + '.gif'
                                this.zip.file(fileName, itme)
                            })
                            this.zip.generateAsync({ type: 'blob' })
                                .then((content) => {
                                    delayLoad.delayLoadJS(Vue.env.plugin.fileSaver)
                                        .then(() => {
                                        // eslint-disable-next-line
                                        saveAs(content, `易企秀|轻设计_导出GIF.zip`)
                                            this.loading.close()
                                            this.closeGifLoading()// 扣除权益
                                        })
                                })
                        })
                        return
                    }
                    this.downloadGif(pIndex + 1)
                })
            }
        },
        /**
         * 同步导出图片非gif
         */
        pcMultiDownloadNotGif(pIndex = 0) {
            Vue.loading.open('导出中')
            const item = this.urlArr[pIndex]
            const promise = new Promise((resolve, reject) => {
                const num = this.sizeTag.selectedItem.num
                this.formatPageElementByScale(item.obj, num)
                const eqxScene = new EqxScene(this.sceneJson)
                const eqxPage = new EqxPage(item.obj, eqxScene)
                const format = this.mode.selectedItem.type || 'png'
                // 生成图片时，默认背景是透明
                const options = format === 'png' ? undefined : { backgroundColor: '#ffffff' }
                eqxPage.page2Canvas(options)
                    .then(res => {
                        const data = res.toDataURL(`image/${format}`, 1.0)
                        const blob = dataURL2Blob(data)
                        resolve(blob)
                    })
                    .catch(err => err && this.logger.error(err))
            })
            promise.then(res => {
                Vue.loading.close()
                if (this.urlArr.length === 1) {
                    const fileName = (this.sceneJson.title || '无标题') + '_' + new Date().format('yyyyMMddhhmmss') + '_' + pIndex + `.${this.mode.selectedItem.name.toLowerCase()}`
                    const url = URL.createObjectURL(res)
                    this.downloadFile(fileName, url)
                    Vue.store.commit('WATERMARK_COVER_CHANGE', false)
                    this.finishAll()// 扣除权益
                } else {
                    this.downloadBlob.push(res)
                    if (pIndex + 1 === this.urlArr.length) {
                        // 多张blob全部生成完毕，组装zip
                        this.zip = new JSZip()
                        this.downloadBlob.forEach((itme, i) => {
                            const fileName = (this.sceneJson.title || '无标题') + '_' + new Date().format('yyyyMMddhhmmss') + '_' + (i + 1) + `.${this.mode.selectedItem.name.toLowerCase()}`
                            this.zip.file(fileName, itme)
                        })
                        this.zip.generateAsync({ type: 'blob' })
                            .then((content) => {
                                delayLoad.delayLoadJS(Vue.env.plugin.fileSaver)
                                    .then(() => {
                                        // eslint-disable-next-line
                                        saveAs(content, `易企秀|轻设计_导出${this.mode.selectedItem.name.toLowerCase()}.zip`)
                                        Vue.store.commit('WATERMARK_COVER_CHANGE', false)
                                        this.finishAll()// 扣除权益
                                    })
                            })
                        return
                    }
                    this.pcMultiDownloadNotGif(pIndex + 1)
                }
            })
        },
        finishAll() {
            this.finish && this.finish() // 扣除权益
            this.finish = null // 扣除之后置为空
            this.loading.close()
            this.exporting = false
            if (this.gifProcessOpen) {
                Vue.processGifBar.close() // gif 场景关闭提示框
                this.gifProcessOpen = false
            }
        },
        exportPDFToPC(type, flag) {
            if (flag) {
                this.exportPDF(type)
            } else {
                this.checkNoWatermarkDownload(type).then(() => {
                    this.exportPDF(type)
                })
            }
        },
        // 导出pdf type: 1 分别导出 2 合并导出
        exportPDF(type) {
            this.tracker('local')
            this.addPointer()
            delayLoad.delayLoadJS(this.env.plugin.jsPDF).then(() => {
                const dataObj = []
                this.exporting = true
                type === 1 ? this.respectively = true : this.merge = true
                setTimeout(() => {
                    const promise = new Promise((resolve, reject) => {
                        this.createCanvas()
                            .then((res) => {
                                res.map((v, i) => {
                                    const obj = {
                                        order: i,
                                        height: this.sceneJson.height,
                                        width: this.sceneJson.width,
                                        fileName: (this.sceneJson.title || '无标题') + '_' + new Date().format('yyyyMMddhhmmss') + '_' + (i + 1) + '.pdf',
                                        data: v.toDataURL('image/jpeg', 1.0)
                                    }
                                    dataObj.push(obj)
                                })

                                if (dataObj.length === this.urlArr.length) {
                                    Vue.store.commit('WATERMARK_COVER_CHANGE', false)
                                    this.finishAll()// 扣除权益
                                    resolve(dataObj)
                                }
                            })
                    })
                    promise.then(items => {
                        items.sort((a, b) => { return a.order - b.order })
                        if (type === 1 && items.length > 1) {
                            // 分别导出 大于1张才生成压缩包
                            // 1 分别导出，生成多个pdf，放入一个压缩包
                            this.zip = new JSZip()
                            items.forEach((item, index) => {
                                const pdf = this.pdfInstance(item)
                                pdf.addImage(item.data, 'jpg', 0, 0)
                                this.zip.file(item.fileName, pdf.output('blob'))
                            })
                            this.zip.generateAsync({ type: 'blob' }).then((content) => {
                                delayLoad.delayLoadJS(Vue.env.plugin.fileSaver)
                                    .then(() => {
                                    // eslint-disable-next-line
                                    saveAs(content, `易企秀|轻设计_导出PDF.zip`)
                                        this.loading.close()
                                        this.closeGifLoading()// 扣除权益
                                    })
                            })
                            this.exporting = false
                            this.close()
                        } else {
                            // 2 合并导出 直接生成一个pdf
                            const pdf = this.pdfInstance(items[0])
                            items.forEach((item, i) => {
                                pdf.addImage(item.data, 'jpg', 0, 0)
                                if (i + 2 <= items.length) {
                                    pdf.addPage()
                                }
                            })
                            pdf.save(items[0].fileName)
                            this.exporting = false
                            this.close()
                        }
                        this.waterMark = false
                    })
                }, 200)
            })
        },
        createCanvas() {
            return new Promise((resolve, reject) => {
                const imgReqs = []
                const imgLoad = url => {
                    return new Promise((resolve, reject) => {
                        var img = new Image()
                        img.crossOrigin = 'Anonymous'
                        img.src = url
                        img.onload = (res) => {
                            let canvas = document.createElement('canvas')
                            canvas.width = res.path[0].width
                            canvas.height = res.path[0].height
                            const ctx = canvas.getContext('2d')
                            ctx.clearRect(0, 0, canvas.width, canvas.height)
                            ctx.fillStyle = '#ffffff'
                            ctx.fillRect(0, 0, canvas.width, canvas.height)
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                            resolve(canvas)
                            canvas = null
                        }
                    })
                }
                for (const item of this.urlArr) {
                    let url = Vue.env.host.file + (item.noWaterPath ? item.noWaterPath : item.path)

                    if (this.waterMark && this.userInfo.type !== 4) { // 非秀客用户需要水印
                        url = host.file + item.path
                    }
                    imgReqs.push(imgLoad(url))
                }
                Promise.all(imgReqs).then((res) => {
                    resolve(res)
                }).catch((error) => { reject(error) })
            })
        },
        pdfInstance({ width, height }) {
            const direction = width > height ? 'l' : 'p'
            // eslint-disable-next-line new-cap
            const pdf = new jsPDF(direction, 'mm', [width / 3.78, height / 3.78])
            return pdf
        },
        downloadFile(fileName, url) {
            // 判断浏览器
            const a = document.createElement('a')
            a.download = fileName
            a.href = url
            a.trigger('click')
        },
        downloadGifFile(fileName, url) {
            var x = new XMLHttpRequest()
            x.open('GET', url, true)
            x.responseType = 'blob'
            x.onload = function (e) {
                var url = window.URL.createObjectURL(x.response)
                var a = document.createElement('a')
                a.href = url
                a.download = fileName
                a.click()
            }
            x.send()
        },
        getWaterMarkImage() {
            return waterMarker.logoMark(this.eqxiuLogoImage, this.sceneJson.width, this.sceneJson.height)
        },
        getBackgroundImage(src) {
            src = Vue.filter('qiniuZoom')(src, 136)
            return Vue.filter('backgroundImage')(src)
        },
        toH5() {
            if (this.urlArr.length !== 0) {
                if (this.data.userId) {
                    if (waterAuthor.checkWaterAuthor()) {
                        // 会员 无水印
                        this.exportToH5(this.urlArr)
                    } else {
                        const index = 0
                        const getNoWatermarkCover = index => {
                            return new Promise((resolve, reject) => {
                                const pageId = this.urlArr[index].obj.id
                                const choosePage = Vue.store.state.scene.eqxScene.eqxPages.find(page => page.pageJson.id === pageId)
                                Vue.store.dispatch('GET_NO_WATERMARK_COVER', { eqxPage: choosePage }).then(data => {
                                    this.urlArr[index].noWaterPath = data.data.key
                                    if (index === this.urlArr.length - 1) {
                                        this.loading.close()
                                        // 数据准备完毕
                                        this.urlArrCopy = JSON.parse(JSON.stringify(this.urlArr))
                                        this.urlArrCopy.map(item => {
                                            item.path = item.noWaterPath
                                            item.name = item.noWaterPath
                                            item.tmbPath = item.noWaterPath
                                        })
                                        this.exportToH5(this.urlArrCopy)
                                    } else {
                                        index++
                                        getNoWatermarkCover(index)
                                    }
                                })
                            })
                        }
                        getNoWatermarkCover(index)
                        this.loading.open('水印去除中')
                    }
                } else {
                    this.notifier.info('导出到H5功能需登录后才能使用')
                }
            }
        },
        exportToH5(urlArr) {
            this.tracker('lib')
            // 不能传id，否则后端会认为是更新操作
            // 将id字段修改为index， 如果这里把id删掉的话会影响到选择的功能
            if (this.isGIFMode) {
                urlArr.map(v => {
                    const allElements = v.obj.elements
                    const state = allElements.some(ele => ele.type === elementType.gif)
                    if (state) {
                        v.extName = 'gif'
                    }
                })
            }
            this.api.file.saveToH5(Vue.env.h5TagId, urlArr, this.sceneJson.id)
                .then((res) => {
                    this.notifier.info('导出成功，刷新图片库可查看')
                })
                .catch(err => err && this.logger.error(err))
        },
        getTag() {
            if (this.isGIFMode) { // gif模式下
                this.sizeTag.list = [{ num: 1, name: '原尺寸', width: 0, height: 0 },
                    { num: 2, name: '用于微信公众号(<2M)', width: 0, height: 0 },
                    { num: 3, name: '用于聊天群(<1M)', width: 0, height: 0 }]
                this.sizeTag.selectedItem = this.sizeTag.list[0]
            } else {
                const { height, width, unit } = this.sceneJson
                const px2mm = Vue.filter('px2mm')
                let count = parseInt(5000 / Math.max(height, width))
                this.sizeTag.list = [{
                    num: 1,
                    name: `原尺寸：${px2mm(width, unit)}*${px2mm(height, unit)} ${unit === 'mm' ? 'mm' : 'px'}`,
                    width,
                    height,
                    showFlag: false
                }]
                this.sizeTag.selectedItem = this.sizeTag.list[0]
                if (count > 5) {
                    count = count > 10 ? 5 : 4
                    const countArr = [2, 3, 4, 5, 10]
                    for (let i = 0; i < count; i++) {
                        this.sizeTag.list.unshift({
                            num: countArr[i],
                            name: `${countArr[i]}倍图：${px2mm(width * countArr[i], unit)}*${px2mm(height * countArr[i], unit)} ${unit === 'mm' ? 'mm' : 'px'}`,
                            width: width * countArr[i],
                            height: height * countArr[i],
                            showFlag: true
                        })
                    }
                } else {
                    for (let i = 2; i < count + 1; i++) {
                        this.sizeTag.list.unshift({
                            num: i,
                            name: `${i}倍图：${px2mm(width * i, unit)}*${px2mm(height * i, unit)} ${unit === 'mm' ? 'mm' : 'px'}`,
                            width: width * i,
                            height: height * i,
                            showFlag: true
                        })
                    }
                }
            }
        },
        chooseTag(item) {
            const opeart = () => {
                this.sizeTag.selectedItem = item
                this.showDropDown = false
                if (this.isGIFMode) {
                    if (item.num === 1) {
                        Vue.store.commit('GIG_QUALITY_CHOOSE', 10)
                    } else if (item.num === 2) {
                        Vue.store.commit('GIG_QUALITY_CHOOSE', 40)
                    } else if (item.num === 3) {
                        Vue.store.commit('GIG_QUALITY_CHOOSE', 100)
                    }
                } else {
                    this.$refs.sizeContent.innerHTML = item.name
                }
            }
            if (!this.isMember && item.showFlag) {
                // 如果不是会员且尺寸是VIP专享，弹出会员购买页面
                this.memberRePay().then(res => {
                    if (res) {
                        opeart()
                    }
                }).catch(err => {
                    err && this.logger.error(err)
                })
            } else {
                if (!this.vipMemberAuth && item.showFlag) { // 不是789,且是多倍图才查询权益
                    this.loading.open('正在查询权益...')
                    user.getUserBenefits(Vue.env.benefits.multiSizeDownload).then(res => {
                        this.loading.close()
                        if (res && res.data && res.data.list && res.data.list.length > 0) {
                            opeart()
                        } else {
                            this.notifier.warn('请联系客服核对权益')
                        }
                    })
                } else {
                    opeart()
                }
            }
        },
        formatPageElementByScale(pageJson, num) {
            if (num === 1) {
                return
            }
            pageJson.elements.forEach(ele => {
                const property = ele.property
                const cssKey = ['width', 'height', 'top', 'left', 'bottom', 'right', 'fontSize', 'letterSpacing', 'borderWidth', 'padding']
                for (const key in ele.css) {
                    if (cssKey.includes(key)) {
                        ele.css[key] = parseFloat(ele.css[key]) * num + 'px'
                    }
                }
                for (const key in ele.property) {
                    switch (key) {
                        case 'dropShadow': {
                            const dropShadow = property.dropShadow
                            dropShadow.x = dropShadow.x * num
                            dropShadow.y = dropShadow.y * num
                            dropShadow.blur = dropShadow.blur * num
                            break
                        }
                        case 'shadow': {
                            const shadow = property.shadow
                            shadow.h = shadow.h * num
                            shadow.v = shadow.v * num
                            shadow.blur = shadow.blur * num
                            break
                        }
                        case 'cube': {
                            const cube = property.cube
                            cube[0].size = cube[0].size * num
                            break
                        }
                        case 'stroke': {
                            const stroke = property.stroke
                            stroke.size = stroke.size * num
                            stroke.distance = stroke.distance * num
                            break
                        }
                        case 'shake': {
                            const shake = property.shake
                            shake.size = shake.size * num
                            break
                        }
                        case 'borderRadius': {
                            // 圆角
                            const borderRadius = property.borderRadius
                            borderRadius.val = `${parseInt(borderRadius.val) * num}px`
                            break
                        }
                    }
                }
                if (ele.type === elementType.textThreeD) {
                    // 3D文字多倍处理
                    for (const key in ele.property.canvasStyle) {
                        switch (key) {
                            case 'width': {
                                ele.property.canvasStyle.width = ele.property.canvasStyle.width * num
                                break
                            }
                            case 'height': {
                                ele.property.canvasStyle.height = ele.property.canvasStyle.height * num
                                break
                            }
                            case 'marginLeft': {
                                ele.property.canvasStyle.marginLeft = `${parseInt(ele.property.canvasStyle.marginLeft) * num}px`
                                break
                            }
                            case 'marginTop': {
                                ele.property.canvasStyle.marginTop = `${parseInt(ele.property.canvasStyle.marginTop) * num}px`
                                break
                            }
                        }
                    }
                } else if (ele.type === elementType.table) {
                    // 更新表格cell的fontSize
                    ele.property.tableData.map(cell => {
                        cell.css.fontSize = parseFloat(cell.css.fontSize) * num + 'px'
                    })
                    // 多倍图 会引起表格的最高最宽的限制 添加一个特殊配置 更新的时候不走这个限制
                    ele.property.isMultiple = true
                }
            })
        },
        closeGifLoading() {
            Vue.store.commit('WATERMARK_COVER_CHANGE', false)
            this.finishAll()// 扣除权益
            setTimeout(() => {
                this.close()
            }, 550)
        },
        /**
         * 压缩GIF
         */
        compresseGif(item) {
            if (!this.waterMark) {
                Vue.store.commit('WATERMARK_COVER_CHANGE', true)
            } else {
                Vue.store.commit('WATERMARK_COVER_CHANGE', false)
            }
            const num = this.sizeTag.selectedItem.num
            const rightSize = num === 2 ? 2 * 1024 * 1024 : 1 * 1024 * 1024
            const standard = 0.9
            this.formatPageElementByScale(item.obj, 1)
            const eqxScene = new EqxScene(this.sceneJson)
            const eqxPage = new EqxPage(item.obj, eqxScene)
            let compWidth = this.sceneJson.width
            let compHeight = this.sceneJson.height
            return new Promise((resolve, reject) => {
                const compress = (item, gifOption) => {
                    eqxPage.generateCanvasToGif(gifOption).then(res => {
                        const { data, gifOption } = res
                        const getSize = data.size
                        if (rightSize > getSize && getSize > standard * rightSize) {
                            const url = URL.createObjectURL(data)
                            if (!this.waterMark) {
                                Vue.store.commit('WATERMARK_COVER_CHANGE', false)
                            }
                            resolve(url)
                        } else {
                            // 不合格 比较差值  找出一个近视值
                            const scale = getSize / rightSize
                            const transScale = 1 / Math.sqrt(scale)
                            compWidth *= transScale
                            compHeight *= transScale
                            gifOption.width = compWidth
                            gifOption.height = compHeight

                            // 递归
                            compress.call(this, item, gifOption)
                        }
                    })
                }
                compress(item)
            })
        },
        /**
         * GIF 大小检测 符合则返回true
         * cover: 当前封面作为localstorage key取大小
         * sizeNum: 用户选择的目标大小
         */
        checkSizeOfGif(cover, sizeNum) {
            const fileSizeObj = JSON.parse(storageLocal.getItem(storageLocal.key.gifFileSize))
            if (fileSizeObj) {
                const size = parseInt(fileSizeObj[cover]) / (1024 * 1024)
                return (sizeNum === 2 && size < 2) ? true : !!((sizeNum === 3 && size < 1))
            } else {
                return true
            }
        },
        getGifBase64(item) {
            const sizeNum = this.sizeTag.selectedItem.num
            return new Promise((resolve, reject) => {
                if (sizeNum === 1 || this.checkSizeOfGif(item.obj.cover, sizeNum)) { // 原尺寸或不压缩就符合所选大小
                    let url = host.file + (item.noWaterPath ? item.noWaterPath : item.obj.cover)
                    if (this.waterMark && this.userInfo.type !== 4) { // 非秀客用户需要水印
                        url = host.file + item.obj.cover
                    }
                    resolve(url)
                } else { // 需压缩处理
                    this.compresseGif(item).then(res => {
                        resolve(res)
                    })
                }
            })
        },
        openExportToPhone() {
            if (waterAuthor.checkWaterAuthor()) {
                // 是会员
                this.$refs.exportToPhone.open()
                this.tracker('phone')
            } else {
                this.checkNoWatermarkDownload(null, true).then(() => {
                    this.tracker('phone')
                    this.finishAll()// 扣除权益
                    this.$refs.exportToPhone.open(this.waterMark, this.isGIFMode)
                    this.exporting = true
                    this.exportingH5 = false
                })
            }
        },
        phoneClose() {
            this.exporting = false
            this.exportingH5 = true
        },
        showNotice(type) {
            this.noticeType = type
            this.showNoticeState = true
        },
        hideNotice() {
            this.showNoticeState = false
        },
        // 会员续费
        memberRePay() {
            return new Promise((resolve, reject) => {
                if (this.buyMemberAuth) {
                    window._hmt.push(['_trackEvent',
                        statistic.category.F,
                        statistic.action.MBTN])
                    const options = {
                        benefitId: Vue.env.benefits.multiSizeDownload
                    }
                    this.dialog.openMember(options).then(res => {
                        if (res.success) {
                            this.notifier.success('支付成功，请刷新页面')
                            resolve(true)
                        } else {
                            this.notifier.fail('支付失败，请稍后重试')
                            resolve(false)
                        }
                    }).catch(err => {
                        reject()
                        err && this.logger.error(err)
                    })
                } else {
                    reject()
                    this.notifier.fail('当前账号不支持购买会员')
                }
            })
        }
    }
}
</script>

<style lang="scss">
$width: calc(100% - 256px);
$height: calc(100% - 60px);
.eqc-head-export {
    position: relative;
    .content {
        width: $width;
        height: 100%;
        float: left;
        .picture-content {
            overflow: auto;
            position: relative;
            padding: 0 24px;
            height: $height;
            width: 100%;
            background: #ccd5db;
            .eqc-ul {
                padding-bottom: 24px;
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
                height: 184px;
                width: 184px;
                float: left;
                background: #eceef0;
                transition: all 0.3s;
                .check {
                    position: absolute;
                    right: 6px;
                    top: 6px;
                    width: 24px;
                    height: 24px;
                    font-style: normal;
                    display: inline-flex;
                    justify-content: center;
                    align-items: center;
                    border-radius: 50%;
                    font-size: 14px;
                    color: #fff;
                    background: #2f3c4d;
                    transition: all 0.3s;
                    &:hover,
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
                    width: 136px;
                    height: 136px;
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
            @media screen and (max-width: 685px) {
                .li-margin {
                    &:not(:nth-child(n + 1)) {
                        margin-left: calc(100% - 184px);
                    }
                }
            }
            @media screen and (min-width: 686px) and (max-width: 890px) {
                .li-margin {
                    &:not(:nth-child(2n + 1)) {
                        margin-left: calc((100% - 184px * 2) / 1);
                    }
                }
            }
            @media screen and (min-width: 892px) and (max-width: 1049px) {
                .li-margin {
                    &:not(:nth-child(3n + 1)) {
                        margin-left: calc((100% - 184px * 3) / 2);
                    }
                }
            }
            @media screen and (min-width: 1050px) and (max-width: 1279px) {
                .li-margin {
                    &:not(:nth-child(4n + 1)) {
                        margin-left: calc((100% - 184px * 4) / 3);
                    }
                }
            }
            @media screen and (min-width: 1280px) and (max-width: 1499px) {
                .li-margin {
                    &:not(:nth-child(5n + 1)) {
                        margin-left: calc((100% - 184px * 5) / 4);
                    }
                }
            }
            @media screen and (min-width: 1500px) and (max-width: 1919px) {
                .li-margin {
                    &:not(:nth-child(6n + 1)) {
                        margin-left: calc((100% - 184px * 6) / 5);
                    }
                }
            }
            @media screen and (min-width: 1920px) {
                .li-margin {
                    &:not(:nth-child(8n + 1)) {
                        margin-left: calc((100% - 184px * 8) / 7);
                    }
                }
            }
        }
        .bottom {
            width: $width;
            height: 60px;
            position: absolute;
            bottom: 0;
            padding: 12px 0px 12px 24px;
            display: flex;
            justify-content: flex-start;
            border-top: 1px solid rgba(204, 213, 219, 1);
            background: #fdfdfd;
            .opt {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s;
                border: 1px solid #ccd5db;
                &:hover {
                    color: $blue-normal;
                    border: 1px solid $blue-normal;
                }
                &.all {
                    justify-content: flex-start;
                    width: 76px;
                    height: 36px;
                    padding-left: 12px;
                    border-radius: 3px;
                    label {
                        padding-left: 6px;
                        cursor: pointer;
                    }
                    &.disable {
                        pointer-events: none;
                        color: #999;
                    }
                }
            }
            .btl {
                margin-left: 16px;
            }
            .pdf-tips {
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 14px;
                color: #666;
                margin-left: 16px;
            }
        }
        &.single {
            display: flex;
            align-items: center;
            justify-content: center;
            background: #303030;
            position: relative;
            .single-img {
                max-width: 100%;
                max-height: 100%;
            }
        }
    }
    .right-bar {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        height: 100%;
        width: 256px;
        float: right;
        background: #ffffff;
        padding: 8px 24px 0px 24px;
        .right-bar-top {
            width: 208px;
        }
        .rb-top {
            height: 36px;
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .right-bar-content {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            .qrcode-unchoose,
            .right-bar-middle,
            .qecode-haschose {
                height: 240px;
                position: relative;
                width: 100%;
                background: white;
            }
            .price-box {
                // height: 189px;
                width: 100%;
            }
            .qrcode-unchoose {
                padding: 24px;
                .qrcode-unchoose-title {
                    font-size: 14px;
                    font-weight: bold;
                    color: #111111;
                }
                .qrcode-unchoose-ins {
                    margin-top: 18px;
                    color: #666;
                    line-height: 20px;
                }
                .qrcode-unchoose-button {
                    color: $blue-normal;
                    margin-top: 106px;
                    .creatButton {
                        &.disable {
                            pointer-events: none;
                            color: #999;
                            background: none;
                            border: none;
                        }
                    }
                }
            }
            .right-bar-middle {
                border-top-left-radius: 3px;
                border-top-right-radius: 3px;
                .qrcode {
                    width: 160px;
                    height: 160px;
                    margin: 24px auto;
                }
                .wechat {
                    background: url("../../../../img/qrcode_wechat.png") center;
                    background-size: 100% 100%;
                    width: 34px;
                    height: 34px;
                    position: absolute;
                    top: 86px;
                    left: 86px;
                    border: 2px solid #ffffff;
                }
                .qr-code-text {
                    width: 100%;
                    text-align: center;
                }
            }
            .right-bar-share {
                position: relative;
                border-bottom-left-radius: 3px;
                border-bottom-right-radius: 3px;
                width: 208px;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 14px 20px;
                background: white;
                color: #2f3c4d;
                cursor: pointer;
                transition: all 0.3s;
                border-top: 1px solid #ccd5db;
                &:hover {
                    color: $blue-normal;
                }
                .tips {
                    width: 14px;
                    height: 14px;
                    margin-left: 10px;
                    color: #76838f;
                    &:hover {
                        color: $blue-normal;
                    }
                }
                &:hover .tips {
                    color: $blue-normal;
                }

                &.disabled {
                    color: #999;
                    cursor: default;
                }
            }
            .right-bar-oper {
                width: 100%;
                margin-top: 8px;
                .oper-title {
                    font-size: 14px;
                    font-weight: bold;
                    color: #111111;
                    line-height: 20px;
                    margin-bottom: 10px;
                }
                .oper-box {
                    width: 100%;
                    position: relative;
                    border-radius: 3px;
                    .chose-size {
                        border-radius: 3px;
                        position: relative;
                        cursor: pointer;
                        background: white;
                        display: flex;
                        padding-left: 12px;
                        justify-content: space-between;
                        align-items: center;
                        height: 36px;
                        border: 1px solid #ccd5db;
                        .triangle {
                            display: block;
                            width: 36px;
                            height: 36px;
                            font-size: 20px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            transition: all 0.3s;
                            &.roate {
                                transform: rotateZ(180deg);
                            }
                        }
                    }
                    .disabled {
                        color: #999;
                        background: #fff;
                        pointer-events: none;
                    }
                    .radio-box {
                        height: 50px;
                        display: flex;
                        flex-direction: row;
                        flex-wrap: nowrap;
                        justify-content: flex-start;
                        align-items: center;
                        font-size: 13px;
                        padding-right: 12px;
                        .radio-item {
                            display: flex;
                            margin-right: 18px;
                            .name {
                                height: 16px;
                                line-height: 14px;
                                margin-left: 3px;
                            }
                        }
                    }
                }
            }
        }
        .right-bar-bottom {
            position: relative;
            width: 100%;
            .wrapper {
                left: -24px;
                width: calc(100% + 48px) !important;
                position: relative;
                height: auto;
                width: 100%;
                .exp-title {
                    font-size: 14px;
                    font-weight: bold;
                    color: rgba(17, 17, 17, 1);
                    line-height: 20px;
                    margin-bottom: 12px;
                }
                .eqc-btn {
                    border-radius: 0px;
                }
                .blue {
                    width: 100%;
                    height: 60px;
                    margin: 0px;
                    border: none;
                }
            }
            .export-pdf {
                z-index: 10;
                height: 60px;
                width: 100%;
                position: absolute;
                left: 0;
                top: 49px;
                transition: all 0.3s;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #1593ff;
                &.show {
                    transform: translateX(0);
                    display: flex;
                    padding: 18px 0px 18px 0px;
                }
                &.hide {
                    transform: translateX(100%);
                    display: none;
                }
                > a {
                    margin: 0px;
                }
                .blue {
                    height: 24px;
                    &:hover {
                        background: #1593ff;
                    }
                }
            }
        }
        .exp-other-btns {
            width: 100%;
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid rgba(230, 235, 237, 1);
            padding: 14px 0px 14px 0px;
            a:hover {
                color: $blue-normal;
            }
        }
        .white {
            width: 100%;
            color: #2f3c4d;
            position: relative;
            border: 0px;
            border-radius: 0;
            span {
                margin-right: 8px;
            }
            i {
                &.disable {
                    pointer-events: none;
                    color: #999;
                    background: #f7f8f9;
                }
            }
            &.disable {
                pointer-events: none;
                color: #999;
                background: #f7f8f9;
            }
        }
        .blue {
            width: 100%;
            height: 36px;
            margin: 12px 0 0;
            .count-box {
                display: flex;
                align-items: center;
                justify-content: space-around;
                .img-count {
                    margin-right: 8px;
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
                background: #1593ff;
            }
            &.w96 {
                width: 96px;
            }
        }
        .title {
            font-size: 17px;
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
        .time-limit-free {
            font-size: 12px;
            background: #ff2a6a;
            color: #fff;
            padding: 2px 4px;
            border-radius: 10px;
            text-align: center;
            position: absolute;
            top: -23px;
            right: 6px;
        }
    }
}
</style>
