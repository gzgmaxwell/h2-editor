<template>
    <div class="eqc-header">
        <div
            :class="{'hint--bottom': !isSettingProTitle, 'hint--rounded': !isSettingProTitle}"
            data-hint="点击修改标题"
            class="config"
        >
            <input
                ref="productTitle"
                v-model="config.title"
                type="text"
                class="product-title"
                placeholder="未命名轻设计作品"
                maxlength="16"
                @blur="saveProTitle"
                @focus="setProTitle"
                @mouseover="showProTitleHover"
                @mouseleave="hideProTitleHover"
            >
        </div>
        <ul
            v-if="isBatch"
            class="list"
        >
            <li
                class="batch-complete"
                @click="batchComplate"
            >
                完成
            </li>
        </ul>
        <ul
            v-if="!expressMode&&!isBatch"
            class="list"
        >
            <li
                v-if="!userInfo.id"
                data-hint="登录后永久保存作品"
                class="btn hint--bottom hint--rounded"
                @click="openLogin"
            >
                <i
                    class="icon eqf-userface-f"
                />&nbsp;
                <span>游客登录</span>
            </li>
            <li
                v-if="!userInfo.id"
                class="line"
            />
            <li
                v-if="buyMemberAuth"
                class="btn members"
                :class="{watermark:bannnerImgSrc===''}"
                :style="{backgroundImage: bannnerImgSrc}"
                @click="toMembers"
            />
            <li
                v-if="buyMemberAuth"
                class="line"
            />
            <li
                class="btn"
                @mouseover="showDailySign = true"
                @mouseleave="showDailySign = false"
            >
                订阅日签
                <div
                    class="menu-down-top"
                />
                <DailySign
                    v-if="showDailySign"
                />
            </li>
            <li class="line" />
            <li
                v-if="cooperationAuth"
                class="btn cooper"
                @click="openCooperation"
            >
                协作
            </li>
            <li
                v-if="cooperationAuth"
                class="line"
            />
            <li
                :class="[{'hint--bottom': showPublishTip}, {'hint--rounded':showPublishTip}, {'hint--always':showPublishTip}]"
                data-hint="内容有更新，请重新发布"
                class="btn share"
                @click="openPreview"
            >
                分享
            </li>
            <li
                v-if="hideGifControl"
                class="line"
            />
            <li
                v-if="hideGifControl"
                class="btn edit-btn"
                @mouseover="showEdit = true"
                @mouseleave="showEdit = false"
            >
                <span class="edit">功能</span>

                <div
                    v-if="showEdit"
                    class="menu-down"
                >
                    <div
                        class="menu-down-top"
                    />
                    <div class="menu-down-content">
                        <div @click="openChangeSize">
                            <i
                                class="icon eqf-writerin-l"
                            />
                            <span>更改尺寸</span>
                        </div>
                        <div @click="openMessProduction">
                            <i
                                class="icon eqf-copy-l"
                            />
                            <span>批量生成</span>
                        </div>
                        <div @click="openExpandSize">
                            <i
                                class="icon eqf-layout-l"
                            />
                            <span>扩展作品尺寸</span>
                        </div>
                    </div>
                </div>
            </li>
            <li
                class="line"
            />
            <li
                v-if="!isSaving"
                class="btn save"
                @click="save"
            >
                保存
            </li>
            <li
                v-if="isSaving"
                class="save-loading"
            >
                <i
                    class="eqf-loadingroll"
                />
            </li>
            <li
                class="line"
            />
            <li
                class="btn export-btn"
                @mouseover="showExport = true"
                @mouseleave="showExport = false"
            >
                <span
                    class="export"
                    @click="openExport"
                >下载</span>
                <div
                    v-if="showExport"
                    class="menu-down"
                >
                    <div
                        class="menu-down-top"
                    />
                    <div class="menu-down-content">
                        <div
                            v-if="hideGifControl"
                            @click="openExport"
                        >
                            <i
                                class="icon eqf-download"
                            />
                            <span>去水印下载</span>
                        </div>
                        <div
                            v-if="hideGifControl"
                            @click="openExportGIF('gif')"
                        >
                            <img
                                :src="gifTag"
                                class="icon gif-tag"
                            >
                            <span style="margin-left: 8px;">合并导出GIF</span>
                            <span class="vip">VIP</span>
                        </div>
                        <div
                            v-if="hideGifControl"
                            @click="openExportGIF('video')"
                        >
                            <img
                                :src="videoTag"
                                class="icon gif-tag"
                            >
                            <span style="margin-left: 8px;">合并导出小视频</span>
                            <span class="vip r10">VIP</span>
                        </div>
                        <div
                            v-if="!hideGifControl"
                            @click="openExport"
                        >
                            <img
                                :src="gifTag"
                                class="icon gif-tag"
                            >
                            <span style="margin-left: 8px;">导出GIF</span>
                        </div>
                        <div
                            v-if="!hideGifControl"
                            @click="openExport($event,false,2)"
                        >
                            <img
                                :src="videoTag"
                                class="icon gif-tag"
                            >
                            <span style="margin-left: 8px;">导出小视频</span>
                            <span class="flag">hot</span>
                        </div>
                    </div>
                </div>
            </li>
            <li
                class="exit hint--bottom-left hint--rounded"
                data-hint="回到我的作品"
                @click="exit"
            >
                退出
            </li>
        </ul>
        <head-express
            v-if="expressMode"
            ref="headExpress"
            @pageSaving="pageSaving"
        />
    </div>
</template>

<script>
import HeadExport from './head/HeadExport.vue'
import HeadCreate from './head/HeadCreate.vue'
import HeadBatchCreate from './head/HeadBatchCreate.vue'
import HeadExpand from './head/HeadExpand.vue'
import HeadExportGIF from './head/HeadExportGIF.vue'
import HeadChangeSize from './head/HeadChangeSize.vue'
import HeadExpress from './head/HeadExpress.vue'
import SidebarPreview from './sidebar/SidebarPreview.vue'
import DailySign from './head/DailySign.vue'

import gifIcon from '../../../img/gif_icon.gif'
import videoTag from '../../../img/video_icon.gif'

import storageLocal from '../../../utils/storageLocal'
import storageSession from '../../../utils/storageSession'
import util from '../../../utils/util'
import message from '../../../utils/message'

import elementType from '../../../config/enum.element.type'
import statistic from '../../../config/statistic'
import EnumSceneType from '../../../config/enum.scene.type'
import expressType from '../../../config/enum.express.type'
import waterAuthor from '../../../config/watermarkAuthor'

export default {
    components: {
        HeadExpress, DailySign
    },
    data() {
        return {
            width: 0,
            height: 0,
            maxSize: 5000,
            timer: null,
            showList: false,
            timeoutId: 0,
            hasText: false,
            exportKey: storageLocal.key.newExport,
            advanceKey: storageLocal.key.newAdvance,
            categories: [],
            showCategories: false,
            gifTag: gifIcon,
            videoTag,
            config: {
                title: ''// 作品标题
            },
            hideGifControl: true,
            isSettingProTitle: false,
            showExport: false,
            showEdit: false,
            expressType,
            showDailySign: false,
            showPublishTip: false,
            cooperationAuth: false, // 是否显示互拉按钮
            bannnerImgSrc: '' // 配置运营位banner的src

        }
    },
    computed: {
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
        expressMode() {
            return this.$store.state.scene.expressMode
        },
        name() {
            return this.$store.state.product.productType[this.sceneJson.type]
        },
        filterCategories() {
            return this.categories.filter(item => item.type !== this.sceneJson.type)
        },
        isSaving() {
            return this.scene.isSaving
        },
        userInfo() {
            return this.$store.state.user.userInfo
        },
        buyMemberAuth() {
            return !(this.userInfo.members && this.userInfo.members.some(item => [14].includes(item.memberId))) && this.user.allow('buyMember')
        },
        pageJson() {
            return this.eqxPage.pageJson
        },
        elements() {
            return this.pageJson.elements
        },
        type() {
            return this.eqxPage.eqxScene.sceneJson.type
        },
        isBatch() {
            return util.getIsBatchCreate()
        },
        vipMemberAuth() { // 7,8,9 企业会员（基础，标准，高级）
            return this.userInfo && ([7, 8, 9].includes(this.userInfo.memberType) || (this.userInfo.members && this.userInfo.members.some(item => [7, 8, 9].includes(item.memberId))))
        }
    },
    watch: {
        'sceneJson.width'(newVal) {
            this.width = Vue.filter('px2mm')(newVal, this.sceneJson.unit)
        },
        'sceneJson.height'(newVal) {
            this.height = Vue.filter('px2mm')(newVal, this.sceneJson.unit)
        },
        type(newVal) {
            // 如果是gif场景的话 隐藏size切换
            if (EnumSceneType.isAllowAddGifToScene(newVal)) {
                this.hideGifControl = false
            } else {
                this.hideGifControl = true
            }
        },
        isSaving: {
            handler(newVal, oldVal) {
                if (oldVal === true && newVal === false) {
                    this.checkNeedPublish()
                }
            }
        },
        userInfo: {
            handler(newVal, oldVal) {
                // 从游客模式登录时执行
                !oldVal.id && this.checkCooperationAuth()
            }
        }
    },
    created() {
        this.initBannerInfo()
        window.addEventListener('message', this.onMessage)

        const { width, height, unit, title } = this.sceneJson
        this.width = Vue.filter('px2mm')(width, unit)
        this.height = Vue.filter('px2mm')(height, unit)
        this.config.title = title || ''
        this.autoSave()
        this.hideGifControl = !EnumSceneType.isAllowAddGifToScene(this.eqxPage.eqxScene.sceneJson.type)

        this.api.banner.getSceneBanners()
            .then(res => {
                // 将所有的分类取出来
                const list = [].concat(...res.data.list.slice(1).map(item => item.list))
                list.forEach(item => {
                    this.categories.push({
                        type: item.type,
                        name: `${item.name}: ${item.width}*${item.height} ${item.unit === 'mm' ? '毫米' : '像素'}`,
                        width: item.width,
                        height: item.height,
                        bleed: item.bleed,
                        unit: item.unit || 'px'
                    })
                })
            })
            .catch(err => err && this.logger.error(err))

        this.checkCooperationAuth()
    },
    destroyed() {
        clearInterval(this.timeoutId)
        window.removeEventListener('message', this.onMessage)
    },
    methods: {
        // 初始化运营配置
        initBannerInfo() {
            const bannerType = Vue.env.banner.headBannerType
            Vue.api.product.getPrintBannerByType(bannerType).then(data => {
                this.bannnerImgSrc = Vue.filter('backgroundImage')(data.data.obj.cover)
            })
        },
        // 接收创意工具集的消息，保存页面数据
        onMessage(e) {
            const data = e.data
            if (data.eventType && data.eventType === 'savePageData') {
                this.save()
            }
        },
        // 批量创建完成按钮
        batchComplate() {
            this.loading.open('正在保存')
            this.clearWorkspace().then(() => {
                this.save1()
                    .then(res => {
                        this.loading.close()
                        this.slide.show()
                        this.$store.commit('SCENE_EDIT_COMPLETE_EVENT', { eqxSceneEditCompleteEvent: new Date().getTime() })
                    })
                    .catch(err => {
                        this.loading.close()
                        err && Vue.logger.error(err)
                    })
            })
        },
        toMembers(bid) {
            if (this.buyMemberAuth) {
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.MBTN])

                const options = {}
                if (bid) { options.benefitId = bid }
                this.dialog.openMember(options).then(res => {
                    if (res.success) {
                        this.notifier.success('支付成功，请刷新页面')
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
        funMouseOver() {
            if (this.timer !== null) {
                clearTimeout(this.timer)
            }
            this.showList = true
        },
        funMouseOut() {
            this.timer = setTimeout(() => {
                this.showList = false
            }, 200)
        },
        changeCategory({ type, width, height, bleed, unit }) {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.SC])

            // 如果是毫米时，统一转换为像素处理
            if (unit === 'mm') {
                width = Vue.filter('mm2px')(width)
                height = Vue.filter('mm2px')(height)
            }
            this.showCategories = false
            const sceneJson = this.sceneJson
            const info = {
                id: sceneJson.id,
                type,
                width,
                height,
                bleed,
                unit
            }
            this.api.scene.updateScene(info)
                .then(res => {
                    sceneJson.type = type
                    sceneJson.width = width
                    sceneJson.height = height
                    sceneJson.bleed = bleed
                    sceneJson.unit = unit
                    const $elWorkspace = this.eqxPage.$el.parentElement
                    this.eqxPage.setScale('fit', $elWorkspace.offsetWidth, $elWorkspace.offsetHeight)
                })
                .catch(err => err && this.logger.error(err))
        },
        customSize() {
            const { width, height, unit } = this.eqxScene.sceneJson
            let newWidth = this.width
            let newHeight = this.height
            const maxSize = Vue.filter('px2mm')(this.maxSize, unit)
            const reg = /^[1-9]\d*$/
            if (!(reg.test(this.width) && reg.test(this.height))) {
                this.notifier.warn('请输入有效的尺寸信息')
                return
            }
            // 如果是毫米时，统一转换为像素处理
            if (unit === 'mm') {
                newWidth = Vue.filter('mm2px')(newWidth)
                newHeight = Vue.filter('mm2px')(newHeight)
            }
            // 未修改时不做处理
            if (newWidth === width && newHeight === height) {
                return
            }
            if (newWidth > this.maxSize || newHeight > this.maxSize) {
                this.notifier.warn('宽高最大值为' + maxSize)
                return
            }
            const info = {
                type: 0,
                width: this.width,
                height: this.height,
                unit
            }
            this.changeCategory(info)
        },
        openLogin() {
            this.dialog.openLogin()
                .then(() => this.user.auth())
                .then(() => this.api.scene.transferScene(this.eqxScene.sceneJson.id, this.userInfo.loginName, true))
                .catch(err => err && this.logger.error(err))
        },
        // 这样会触发清除组件的选中状态，能让修改中的文字即时生效
        clearWorkspace() {
            return new Promise((resolve, reject) => {
                this.eqxPage.$el.parentElement.trigger('mousedown')
                document.trigger('mouseup')
                const allElements = this.eqxPage.eqxElements
                allElements.map(item => {
                    const { border } = item.elementJson.css
                    if (border) { // 只有组合模式下 预览的时候边框来不及去掉  现在强制去掉
                        delete item.elementJson.css.border
                        item.updateCss(item.elementJson.css) // 解决临时组合预览之后留下的边框问题
                    }
                })
                // 骚操作1：等待mousedown异步执行完毕 才去执行保存操作
                setTimeout(() => {
                    resolve()
                }, 100)
            })
        },
        autoSave() {
            if (this.env.name !== 'local') {
                this.timeoutId = setInterval(() => {
                    if (this.eqxPage.isModified) {
                        this.$store.dispatch('PAGE_SAVE', { eqxPage: this.eqxPage, needCover: true })
                            .catch(err => err && this.logger.error(err))
                    }
                }, 300000)
            }
        },
        save1() {
            Vue.arrowNotifier.close() // 清除提示框
            if (this.eqxPage.isModified) {
                clearInterval(this.timeoutId)
                return this.$store.dispatch('PAGE_SAVE', { eqxPage: this.eqxPage, needCover: true })
                    .then(() => this.autoSave())
                    .catch(() => {
                        this.autoSave()
                        return Promise.reject()
                    })
            }
            return Promise.resolve()
        },
        save() {
            this.openMessNotifer()

            if (this.isSaving) {
                return
            }
            // 产品需求当页面没有需要保存的时候
            // 也给用户一个提示，告知已保存
            if (!this.eqxPage.isModified) {
                this.notifier.info('已保存')
                return
            }
            this.loading.open('正在保存')
            this.clearWorkspace().then(() => {
                this.save1()
                    .then(res => {
                        this.loading.close()
                    })
                    .catch(err => {
                        this.loading.close()
                        err && Vue.logger.error(err)
                    })
            })
        },
        openPreview(way) {
            if (!way) { // 分享
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.SESBTN])
            }
            const infoObj = {
                currentCover: '',
                coverList: [],
                width: this.eqxPage.width / this.eqxPage.scale,
                height: this.eqxPage.height / this.eqxPage.scale,
                title: this.eqxScene.sceneJson.title,
                description: this.eqxScene.sceneJson.description,
                scale: this.eqxPage.scale,
                printId: this.eqxScene.sceneJson.id,
                userId: this.userInfo.id,
                bindPhone: this.userInfo.phone,
                type: this.userInfo.type,
                share: this.eqxScene.sceneJson.isShare,
                way: way || '',
                code: this.eqxScene.sceneJson.code
            }
            if (this.isSaving) {
                return
            }
            this.clearWorkspace().then(() => {
                this.loading.open('正在保存')
                this.save1().then(res => {
                    this.loading.close()
                    const eqxPages = this.eqxPage.eqxScene.eqxPages
                    eqxPages.forEach(element => {
                        infoObj.coverList.push(element.pageJson.cover)
                    })
                    infoObj.currentCover = this.eqxPage.pageJson.cover
                    storageSession.setItem(storageSession.key.shareInfo, infoObj)
                    storageSession.setItem(storageSession.key.userInfo, Vue.store.state.user.userInfo)
                    storageSession.setItem(storageSession.key.isKeepWatermark, waterAuthor.checkWaterAuthor() ? 1 : 0)
                    const options = {
                        component: SidebarPreview
                    }
                    this.slide.open(options)
                        .then((res) => {
                            this.notifier.info(res)
                        })
                        .catch(err => {
                            err && this.logger.error(err)
                            this.checkNeedPublish()
                        })
                })
            }).catch(err => {
                this.loading.close()
                err && Vue.logger.error(err)
            })
        },
        openExport(event, expressEdition = false, type) {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.NOWMDOWNLOAD,
                statistic.opt_label.NOWMDOWNLOAD.click])

            if (this.isSaving) {
                return
            }
            if (type === 2) {
                // 导出小视频 如果没有gif元素 不让其导出小视频  因为一帧导出小视频会报错
                const state = Vue.store.state.scene.eqxPage.eqxElements.some(ele => ele.elementJson.type === elementType.gif)
                if (!state) {
                    this.notifier.info('导出到小视频必须包含gif元素')
                    return
                }
            }
            this.clearWorkspace().then(() => {
                if (this.userInfo.id) {
                    let promise = Promise.resolve()
                    const options = {
                        component: HeadExport,
                        data: {
                            userId: this.userInfo.id,
                            type: type
                        }
                    }
                    // 用户需要绑定手机（type=21,22 不检测）
                    if (!([21, 22].includes(this.userInfo.type)) && !this.userInfo.phone) {
                        promise = this.dialog.openBindPhone()
                    }
                    promise
                        .then(() => {
                            this.loading.open('正在保存')
                            this.save1().then(res => {
                                this.loading.close()
                                if (expressEdition) {
                                    this.$refs.headExpress.openMenu()
                                } else {
                                    this.slide.open(options)
                                        .catch(err => err && this.logger.error(err))
                                }
                            }).catch(err => {
                                this.loading.close()
                                err && Vue.logger.error(err)
                            })
                        })
                        .catch(err => err && this.logger.error(err))
                } else {
                    this.notifier.info('导出功能需登录后才能使用')
                }
            })
        },
        exit() {
            if (this.isSaving) {
                return
            }
            this.clearWorkspace().then(() => {
                if (this.eqxPage.isModified) {
                    clearInterval(this.timeoutId)
                    this.$store.dispatch('PAGE_SAVE', { eqxPage: this.eqxPage, needCover: true })
                        .then(() => this.exitGo())
                        .catch(err => err && this.logger.error(err))
                } else {
                    this.exitGo()
                }
            })
        },
        exitGo(openNewTab) {
            if (this.userInfo.id) {
                // 工作台
                const path = `${Vue.env.host.auth}/eip/scene?type=h2`
                if (openNewTab) {
                    window.open(path, '_blank')
                } else {
                    window.location.href = path
                }
            } else {
                // 游客模式
                if (openNewTab) {
                    const routeData = this.$router.resolve({ path: '/visit' })
                    window.open(routeData.href, '_blank')
                } else {
                    this.$router.push({ path: '/visit' })
                }
            }

            // 退出时给父页面发消息
            message.exit(window.scene.id)
        },
        // 更改尺寸
        openChangeSize() {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.SE,
                statistic.opt_label.SE.in])

            if (this.userInfo.id) {
                this.loading.open('正在保存')
                this.save1().then(res => {
                    this.loading.close()
                    const options = {
                        component: HeadChangeSize,
                        data: JSON.parse(JSON.stringify(this.pageJson))
                    }
                    this.slide.open(options)
                        .then((res) => {
                            this.exitGo(true)
                        })
                        .catch((err) => {
                            err && this.logger.error(err)
                        })
                })
            } else {
                this.notifier.info('更改尺寸功能需登录后才能使用')
                this.showList = false
            }
        },
        openBatchCreate() {
            if (this.userInfo.id) {
                this.loading.open('正在保存')
                this.save1().then(res => {
                    this.loading.close()
                    const options = {
                        component: HeadBatchCreate
                    }
                    this.slide.open(options)
                        .then((res) => {
                            if (res.go) {
                                this.exitGo(true)
                            }
                        })
                        .catch((err) => {
                            err && this.logger.error(err)
                        })
                })
            } else {
                this.notifier.info('批量创建功能需登录后才能使用')
                this.showList = false
            }
        },
        //  批量生成
        openMessProduction() {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.BC,
                statistic.opt_label.BC.in])

            if (this.userInfo.id) {
                const hasText = this.elements.some(function (ele) {
                    return [elementType.text, elementType.image, elementType.qrcode, elementType.frame].includes(ele.type)
                })
                if (hasText) {
                    Vue.helpnotifier.close()
                    const sceneJSON = this.eqxScene.sceneJson
                    const eleObj = {}
                    eleObj.eleArr = []
                    eleObj.otherEle = []
                    eleObj.pageJson = JSON.parse(JSON.stringify(this.pageJson))
                    const copyObj = {
                        width: sceneJSON.width,
                        height: sceneJSON.height,
                        unit: sceneJSON.unit,
                        type: sceneJSON.type
                    }
                    eleObj.pageJson = Object.assign(eleObj.pageJson, copyObj)
                    eleObj.value = 10
                    this.elements.forEach(ele => {
                        if ([elementType.text, elementType.image, elementType.qrcode, elementType.frame].includes(ele.type)) {
                            eleObj.eleArr.push(ele)
                        } else {
                            eleObj.otherEle.push(ele)
                        }
                    })
                    this.loading.open('正在保存')
                    this.save1().then(res => {
                        this.loading.close()
                        const options = {
                            component: HeadCreate,
                            data: eleObj
                        }
                        this.slide.open(options)
                            .then((res) => {
                                if (res.go) {
                                    this.exitGo(true)
                                }
                            })
                            .catch((err) => {
                                err && this.logger.error(err)
                            })
                    }).catch(err => {
                        this.loading.close()
                        err && Vue.logger.error(err)
                    })
                } else {
                    this.notifier.warn('画布中没有可更改项')
                }
            } else {
                this.notifier.info('批量生成功能需登录后才能使用')
                this.showList = false
            }
        },
        // 扩展尺寸
        openExpandSize() {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.SE,
                statistic.opt_label.SE.in])

            if (this.userInfo.id) {
                this.loading.open('正在保存')
                this.save1().then(res => {
                    this.loading.close()
                    const options = {
                        component: HeadExpand,
                        data: JSON.parse(JSON.stringify(this.pageJson))
                    }
                    this.slide.open(options)
                        .then((res) => {
                            this.exitGo(true)
                        })
                        .catch((err) => {
                            err && this.logger.error(err)
                        })
                })
            } else {
                this.notifier.info('扩展尺寸功能需登录后才能使用')
                this.showList = false
            }
        },
        openExportGIF(type) {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.GIF,
                statistic.opt_label.GIF.in])

            if (this.isSaving) {
                return
            }

            this.clearWorkspace().then(() => {
                if (this.userInfo.id) {
                    let promise = Promise.resolve()
                    if (!this.vipMemberAuth) { // 除7，8，9默认有权益，其他类型需要获取用户权益信息
                        promise = new Promise((resolve, reject) => {
                            let benId = Vue.env.benefits.buildGif
                            if (type === 'video') {
                                benId = Vue.env.benefits.buildVideo
                            }
                            this.api.user.getUserBenefits(benId)
                                .then(res => {
                                // 返回权益list不为空则有权益
                                    if (res.data && res.data.list.length > 0) {
                                        resolve()
                                    } else {
                                        reject(benId)
                                    }
                                })
                                .catch(err => {
                                    err && this.logger.error(err)
                                    reject(benId)
                                })
                        })
                    }
                    promise.then(res => {
                        const options = {
                            component: HeadExportGIF,
                            data: {
                                userId: this.userInfo.id,
                                type: type
                            }
                        }
                        const eqxPages = this.eqxPage.eqxScene.eqxPages
                        // 小于2张时弹出提示框
                        if (eqxPages.length < 2) {
                            this.dialog.openGifNotice({ link: '//qingsheji.help.eqxiu.com/gif.html', type })
                            return
                        }
                        this.loading.open('正在保存')
                        this.save1() // 保存当前作品
                            .then(() => {
                                this.loading.close()
                                this.slide.open(options)// 滑动到导出Gif页面
                                    .catch(err => err && this.logger.error(err))
                            })
                            .catch(err => {
                                this.loading.close()
                                err && Vue.logger.error(err)
                            })
                    })
                        .catch(err => {
                            this.toMembers(err)
                        })
                } else {
                    this.notifier.info(`合成${type}功能需登录后才能使用`)
                }
            })
        },
        // 更新作品标题信息
        saveProTitle() {
            this.isSettingProTitle = false
            if (this.sceneJson.title === this.config.title) {
                return
            }
            const sceneJson = this.eqxScene.sceneJson
            this.config.id = sceneJson.id
            this.api.scene.updateScene(this.config)
                .then(res => {
                    Object.assign(sceneJson, this.config)
                })
                .catch(err => err && this.logger.error(err))
        },
        // 编辑作品标题信息
        setProTitle() {
            const $pTitle = this.$refs.productTitle
            $pTitle.css({ backgroundColor: 'rgba(255, 255, 255, 1)' })
            this.isSettingProTitle = true
        },
        // 鼠标移到作品标题时触发
        showProTitleHover() {
            const $pTitle = this.$refs.productTitle
            if (!this.isSettingProTitle) {
                $pTitle.css({ backgroundColor: 'rgba(236, 238, 240, 1)' })
            }
        },
        // 鼠标移出作品标题时触发
        hideProTitleHover() {
            const $pTitle = this.$refs.productTitle
            $pTitle.css({ backgroundColor: 'rgba(255, 255, 255, 1)' })
        },
        // 打开帮助提示框，以下分类场景才弹提示框
        // 朋友圈邀请函、新名片、证书（竖版）、证书（横版）
        // 邀请函（纸质）、工作证、祝福贺卡
        openMessNotifer() {
            const scenceType = [15, 26, 32, 43, 42, 46, 55]
            if (scenceType.includes(this.sceneJson.type)) {
                this.helpnotifier.open('mess',
                    '【批量生成】可以帮助您快速替换图片中的姓名等信息，批量生成多张图片',
                    { top: '60px', right: '112px' },
                    { width: '324px', height: '256px' },
                    true,
                    { distance: '220px', type: 'top' })
            }
        },
        // 保存页面
        pageSaving() {
            this.openExport(null, true)
        },
        /**
         * 检验是否需重新发布
         */
        checkNeedPublish() {
            const pub = storageLocal.getItem(storageLocal.key.publishTime)
            const sav = storageLocal.getItem(storageLocal.key.saveTime)

            if (!pub) {
                // 从未发布过
                this.showPublishTip = false
            } else {
                const pubArr = JSON.parse(pub)
                let found = false
                let pubTime = 0
                pubArr.map((v, i) => {
                    if (v.printId === this.sceneJson.id) {
                        pubTime = v.pubTime
                        found = true
                    }
                })
                if (!found) {
                    // 从未发布过
                    this.showPublishTip = false
                } else {
                    const savArr = JSON.parse(sav)
                    let savTime = 0
                    savArr.map((v, i) => {
                        if (v.printId === this.sceneJson.id) {
                            savTime = v.saveTime
                        }
                    })
                    if (pubTime > savTime) {
                        // 发布过，内容未更新
                        this.showPublishTip = false
                    } else {
                        // 发布过，内容有更新，提示需重新发布
                        this.showPublishTip = true
                    }
                }
            }
        },
        /**
         * check 互拉按钮是否显示
         */
        checkCooperationAuth() {
            if (this.userInfo.id) {
                // 登录后才能调接口
                this.api.banner.getCooperationAuth()
                    .then(res => {
                        if (res && res.data.obj) {
                            this.cooperationAuth = true
                        } else {
                            this.cooperationAuth = false
                        }
                    })
                    .catch(err => err && this.logger.error(err))
            }
        },
        /**
         * 互拉弹窗
         */
        openCooperation() {
            Vue.dialog.openCooperation()
                .then(res => {})
                .catch(err => {
                    err && this.logger.error(err)
                })
        }
    }
}
</script>

<style lang="scss">
.eqc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    height: 60px;
    font-size: 13px;
    color: #4f5d69;
    background: #fff;
    box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.16);
    z-index: 2; // 需要在标尺之上才有阴影
    cursor: default;
    .divider {
        color: #ccd5db;
    }
    .info {
        position: relative;
        display: flex;
        align-items: center;
        padding-left: 24px;
        .size {
            width: 36px;
            height: 20px;
            color: #fff;
            background: #76838f;
            border-radius: 3px;
            text-align: center;
            font-size: 12px;
        }
        .link {
            font-size: 14px;
            margin: 0 6px;
        }
        .unit {
            margin: 0 12px 0 6px;
        }
        .name {
            position: relative;
            margin-left: 12px;
            display: flex;
            align-items: center;
            transition: all 0.3s;
            .icon {
                font-size: 22px;
                transition: all 0.3s;
            }
            &.active {
                color: $blue-normal;
                .icon {
                    transform: rotate(180deg);
                }
            }
        }
    }
    > .list {
        display: flex;
        align-items: center;
        .line {
            width: 1px;
            height: 20px;
            background: rgba(230, 235, 237, 1);
        }
        .save-loading {
            width: 66px;
            text-align: center;
            animation: rotate-infinite 3s linear infinite;
        }
        .btn {
            border-radius: 3px;
            padding: 11px 20px;
            font-size: 13px;
            font-weight: 400;
            color: #252b3f;
            text-align: center;
            cursor: pointer;
            position: relative;
            &:hover {
                color: $blue-normal;
            }

            .menu-down {
                position: absolute;
                top: 35px;
                left: -53px;
                z-index: 1;
                color: #2f3c4d;
                background: transparent;
                width: 172px;
                display: flex;
                flex-direction: column;
                transform-origin: top;
                .menu-down-top {
                    height: 13px;
                }
                .menu-down-content {
                    flex: 1;
                    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
                    border-radius: 0 0 3px 3px;
                    padding: 8px 0;
                    background: #ffffff;
                    > div {
                        position: relative;
                        height: 48px;
                        display: flex;
                        align-items: center;
                        color: #2f3c4d;
                        font-size: 14px;
                        padding: 0 16px;
                        transition: all 0.3s;
                        span {
                            margin-left: 14px;
                        }
                        &:hover {
                            color: $blue-normal;
                        }
                        .gif-tag {
                            width: 22px;
                        }
                        &:hover .gif-tag {
                            color: $blue-normal;
                        }
                    }
                }
            }
        }
        .daily-sign-wrapper {
            width: 78px;
            height: 20px;
            background: url("../../../img/sign_btn.png") center center/cover;
            color: white;
            line-height: 20px;
            text-align: center;
            position: relative;
            display: flex;
            flex-direction: column;
            .menu-down-top {
                padding-top: 40px;
                height: 13px;
            }
        }
        .flag {
            width: 32px;
            height: 16px;
            color: rgba(255, 41, 106, 1);
            border-radius: 3px;
            line-height: 16px;
            position: absolute;
            top: 4px;
            right: 16px;
            text-align: center;
            font-size: 12px;
        }
        .vip {
            width: 32px;
            height: 16px;
            color: rgba(192, 150, 89, 1);
            border-radius: 3px;
            line-height: 16px;
            position: absolute;
            top: 6px;
            right: 20px;
            text-align: center;
            font-size: 12px;
        }
        .r10 {
            right: 3px;
        }
        .batch-complete {
            margin-right: 24px;
            color: rgba(21, 147, 255, 1);
            width: 70px;
            height: 36px;
            border-radius: 3px;
            border: 1px solid rgba(21, 147, 255, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            cursor: pointer;
            &:hover {
                color: #fff;
                border: 1px solid rgba(21, 147, 255, 1);
                background: rgba(21, 147, 255, 1);
            }
        }
        .members {
            margin-left: 20px;
            color: #c09659;
            width: 124px;
            height: 60px;
            border-radius: 3px;
            background-size: cover;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            cursor: pointer;
            &:hover {
                color: #3f362f;
            }
        }
        .watermark {
            background: url("../../../img/removeWater.png") center center/cover;
        }
        .export-btn {
            width: 92px;
            padding: 0;
            height: 40px;
            color: #ffffff;
            background: $blue-normal;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            cursor: pointer;
            &:hover {
                color: #ffffff;
                background: $blue-normal;
            }
        }
        .exit {
            margin: 0 24px 0 12px;
            width: 36px;
            height: 36px;
            color: #252b3f;
            border-radius: 3px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            &:hover {
                color: #ff2a6a;
            }
        }
    }
    .config {
        .product-title {
            width: 224px;
            height: 36px;
            background: rgba(255, 255, 255, 1);
            border-radius: 3px;
            margin-left: 16px;
            padding-left: 8px;
            border: 1px solid #ffffff;
            cursor: pointer;
            &:focus {
                border: 1px solid rgba(204, 213, 219, 1);
                cursor: auto;
            }
        }
    }
}
</style>
