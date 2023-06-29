<template>
    <div class="eqc-create">
        <the-nav />
        <the-nav-panel />
        <div class="right">
            <the-head
                ref="theHead"
            />
            <div
                class="content"
            >
                <the-workspace />
                <the-sidebar />
                <the-page />
                <transition name="move">
                    <the-setting-comp v-if="showSetting" />
                </transition>
            </div>
        </div>
        <sidebar-menu />
        <!--图层面板-->
        <transition name="rotate-y-left">
            <sidebar-layer v-if="layer.show" />
        </transition>
        <!--艺术字样式面板-->
        <transition name="rotate-y-left">
            <setting-font-style v-if="fontStyleLayer.show" />
        </transition>
        <!--字体面板-->
        <transition name="rotate-y-left">
            <setting-text-font v-if="textLayer.show" />
        </transition>
        <!--表格样式面板-->
        <transition name="rotate-y-left">
            <setting-table-style v-if="tableStyleLayer.show" />
        </transition>
        <!--3D字样式面板-->
        <transition name="rotate-y-left">
            <setting-text-three-d-style v-if="textThreeDStyleLayer.show" />
        </transition>
        <!--3D文字贴图面板-->
        <transition name="rotate-y-left">
            <setting-text-three-d-texture-panel v-if="textThreeDTextureLayer.show" />
        </transition>
        <!--3D字体面板-->
        <transition name="rotate-y-left">
            <setting-text-three-d-font v-if="textThreeDTextFontLayer.show" />
        </transition>
    </div>
</template>

<script>
import TheHead from './TheHead.vue'
import TheNav from './TheNav.vue'
import TheNavPanel from './TheNavPanel.vue'
import TheWorkspace from './TheWorkspace.vue'
import TheSidebar from './TheSidebar.vue'
import SidebarLayer from './sidebar/SidebarLayer.vue'
import SidebarMenu from './sidebar/SidebarMenu.vue'
import ThePage from './ThePage.vue'
import TheSettingComp from './TheSettingComp.vue'
import EqxScene from '../../../core/scene'
import EqxPage from '../../../core/html/page'
import { apiClearExpired } from '../../../utils/apiCache'
import storageSession from '../../../utils/storageSession'
import message from '../../../utils/message'
import uploadDrag from './index/uploadDrag'
import markAdd from './index/markAdd'
import storageLocal from '../../../utils/storageLocal'
import SettingFontStyle from './setting/SettingFontStyle.vue'
import SettingTextFont from './setting/SettingTextFont.vue'
import SettingTextThreeDFont from './setting/SettingTextThreeDFont.vue'
import SettingTableStyle from './setting/SettingTableStyle.vue'
import SettingTextThreeDStyle from './setting/SettingTextThreeDStyle.vue'
import SettingTextThreeDTexturePanel from './setting/SettingTextThreeDTexturePanel.vue'
import textType from '../../../config/enum.text.type'
import defaultFontStyleImg from '../../../img/default_fontstyle.png'
import util from '../../../utils/util'
import { host } from '../../../config/env'
import delayLoad from '../../../utils/delayLoad'
import elementType from '../../../config/enum.element.type'

export default {
    components: {
        TheHead,
        TheNav,
        TheNavPanel,
        TheWorkspace,
        TheSidebar,
        SidebarLayer,
        ThePage,
        TheSettingComp,
        SettingFontStyle,
        SettingTextFont,
        SettingTextThreeDFont,
        SettingTableStyle,
        // 3D文字样式框
        SettingTextThreeDStyle,
        // 3D文字贴图框
        SettingTextThreeDTexturePanel,
        SidebarMenu
    },
    data() {
        return {
            showSetting: false,
            defaultFontStyleCover: defaultFontStyleImg,
            wheel: e => e.preventDefault(),
            dragstart: e => e.preventDefault(),
            contextmenu: e => e.preventDefault()
        }
    },
    computed: {
        layout() {
            return this.$store.state.layout
        },
        nav() {
            return this.layout.nav
        },
        layer() {
            if (this.layout.layer.show) {
                // 重新初始化图层
                Vue.store.state.scene.eqxPage.sortCombineElement()
            }
            return this.layout.layer
        },
        scene() {
            return this.$store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        eqxElementsSelected() {
            return this.scene.eqxElementsSelected
        },
        userInfo() {
            return this.$store.state.user.userInfo
        },
        fontStyle() {
            return this.$store.state.fontStyle
        },
        fontStyleLayer() {
            return this.fontStyle.layer
        },
        textLayer() {
            return this.fontStyle.text
        },
        textThreeDTextFontLayer() {
            return this.fontStyle.textThreeDTextFont
        },
        textThreeDStyleLayer() {
            return this.fontStyle.textThreeDStyle
        },
        textThreeDTextureLayer() {
            return this.fontStyle.textThreeDTextTexture
        },
        mainEditorView() {
            return this.layout.mainEditorView
        },
        tableStyleLayer() {
            return this.scene.tableStyleLayer
        }
    },
    watch: {
        mainEditorView: {
            handler(newVal) {
                // 回到主编辑区视图时，如果是登录用户需要重新监听uploadDrag
                if (newVal.show) {
                    if (this.userInfo.id) {
                        uploadDrag.bind(this.$el, { value: { upload: this.nav.list[5] } })
                    }
                }
            },
            deep: true
        },
        eqxElementsSelected: {
            handler(newVal) {
                // 如果是裁切元素则不显示
                if (newVal.length === 0 || newVal[0].elementJson.type === elementType.crop) { // 选中组件个数为0时，隐藏右边设置
                    this.showSetting = false
                    // 右边设置隐藏同时也隐藏字体样式管理框 也影藏table的样式管理框
                    this.$store.commit('FONT_STYLE_LAYER', { show: false })
                    this.$store.commit('FONT_TEXT_LAYER', { show: false })
                    this.$store.commit('SCENE_TABLE_STYLE_LAYER_CHANGE', { show: false })
                    this.$store.commit('TEXT_THREED_STYLE_LAYER', { show: false })
                    this.$store.commit('TEXT_THREED_FONT_LAYER', { show: false })
                    this.$store.commit('TEXT_THREED_TEXTURE_LAYER', { show: false })
                } else {
                    newVal.forEach(eqxElement => { // 选中组件为非锁定状态时才显示右边设置
                        this.showSetting = eqxElement.isSelected && !eqxElement.elementJson.property.lock
                    })
                }
            },
            immediate: true
        },
        userInfo: {
            handler(newVal, oldVal) {
                // 从游客模式登录时执行
                !oldVal.id && this.setVisitorMode()
            }
            // 不能使用，否则拿不到this.$el
            // immediate: true

        }
    },
    beforeRouteEnter(to, from, next) {
        // 在渲染该组件的对应路由被 confirm 前调用
        // 不！能！获取组件实例 `this`
        // 因为当守卫执行前，组件实例还没被创建

        // 异步加载ad
        const hostAd = Vue.env.host.layout.replace(/https?:/, '')
        const ad = /lib.eqh5.com/.test(hostAd) ? '1.2.1/index' : 'index'
        const adCss = delayLoad.delayLoadCSS(`${hostAd}/eqx.sdk.ad/${ad}.css`)
        const adJs = delayLoad.delayLoadJS(`${hostAd}/eqx.sdk.ad/${ad}.js`)

        const id = to.params.id
        if (id.indexOf('_') > -1) {
            // 添加埋点作品id对象 id_code 形式需要分离id
            window.scene = { id: id.split('_')[0] }
        } else {
            console.warn('路由未更新，请及时联系lirui')
            window.scene = { id }
        }
        const { materialId } = Vue.env.mall

        // 设置通过H5预览生成的轻设计信息
        const settingH5Info = (info, parms) => {
            const qrcodeUrl = parms.qrcodeUrl || ''
            const qrcodeLogo = parms.qrcodeLogo || ''
            const qrcodeDes = parms.qrcodeDes || '扫码查看详情'
            const pTitle = parms.pTitle || '轻设计作品'
            const pImg = parms.pImg || ''
            const tpl = pImg !== '' ? 'IMG_TPL' : 'QR_TPL'
            const newTitle = pImg !== '' ? `${pTitle}分享海报` : `${pTitle}创意二维码`

            if (info.pages && info.pages.length > 0) {
                const pageJson = info.pages[0]
                if (pageJson.elements) {
                    pageJson.elements.map((v, i, arr) => {
                        if (tpl === 'QR_TPL') {
                            if (v.type === 103 && v.property.markLabel && v.property.markLabel === '二维码') {
                                v.property.text = qrcodeUrl
                                v.property.src = qrcodeLogo
                            } else if (v.type === 101 && v.property.markLabel && v.property.markLabel === '二维码描述') {
                                v.property.content = qrcodeDes
                            }
                        } else if (tpl === 'IMG_TPL') {
                            if (v.type === 102 && v.property.markLabel && v.property.markLabel === 'H5封面') {
                                v.property.src = pImg
                            } else if (v.type === 103 && v.property.markLabel && v.property.markLabel === '二维码') {
                                v.property.text = `${host.h5}/s/` + qrcodeUrl
                                v.property.src = qrcodeLogo
                            } else if (v.type === 101 && v.property.markLabel && v.property.markLabel === '标题') {
                                v.property.content = pTitle
                            } else if (v.type === 101 && v.property.markLabel && v.property.markLabel === '二维码描述') {
                                v.property.content = qrcodeDes
                            }
                        }
                    })
                }
            }

            // 更新作品标题
            Vue.api.scene.updateScene({ id: info.id, title: newTitle })
                .then(res => {})
                .catch(err => err && this.logger.error(err))
        }

        // 初始化场景信息
        const initScene = (sceneJson) => {
            const h5store = storageSession.getItem('' + id)
            if (h5store) {
                // H5预览美化图片或美化二维码的数据替换
                settingH5Info(sceneJson, JSON.parse(h5store))
            }

            sceneJson.title = sceneJson.title || '易企秀轻设计制作'
            sceneJson.description = sceneJson.description || '轻松制作海报、邀请函、微信公号头图'
            const qrcodeUrl = storageSession.getItem(storageSession.key.qrcodeUrl) || ''
            const qrcodeLogo = storageSession.getItem(storageSession.key.qrcodeLogo)
            const mark = storageSession.getItem(storageSession.key.mark)
            const eqxScene = new EqxScene(sceneJson)
            const pages = sceneJson.pages
            if (pages && pages.length) {
                // 如果是打开已有有场景
                pages.forEach(page => {
                    const eqxPage = new EqxPage(page, eqxScene)
                    eqxScene.addPage(eqxPage)
                })
            } else {
                // 如果是新创建的场景
                const eqxPage = new EqxPage(null, eqxScene)
                eqxScene.addPage(eqxPage, true)
            }
            const eqxPage = eqxScene.eqxPages[0]
            storageLocal.setItem(storageLocal.key.mainCover, sceneJson.cover)
            Vue.store.commit('SCENE_INIT', { eqxScene, eqxPage })

            if (mark) {
                setTimeout(() => {
                    storageSession.removeItem(storageSession.key.mark)
                    const { width, height, title } = sceneJson
                    const marks = markAdd.getMark(mark)
                    const textJson1 = marks.getTextJson1(width, height, title)
                    const textJson2 = marks.getTextJson2(width, height)
                    const shapeJson = marks.getShapeJson(width, height)
                    const qrcodeJson = marks.getQrcodeJson(width, height, qrcodeUrl, qrcodeLogo)
                    eqxPage.addElement(shapeJson)
                    eqxPage.addElement(textJson1)
                    eqxPage.addElement(textJson2)
                    eqxPage.addElement(qrcodeJson)

                    // 清除最后一个组件的选中状态
                    eqxPage.$el.parentElement.trigger('mousedown')
                    document.trigger('mouseup')
                })
            }

            // 创建的空作品和从美化二维码创建的作品都保存一次，使其有封面
            if (!eqxPage.pageJson.cover || qrcodeUrl || mark || h5store) {
                setTimeout(() => {
                    Vue.store.dispatch('PAGE_SAVE', { eqxPage, needCover: true })
                        .then(() => {
                            if (h5store) {
                                const h5store = storageSession.getItem('' + id)
                                const msgType = JSON.parse(h5store).msgType
                                message.success({
                                    url: eqxPage.pageJson.cover,
                                    pid: id,
                                    type: msgType || ''
                                })
                                storageSession.removeItem('' + id)
                            } else if (mark) {
                                message.success({
                                    url: eqxPage.pageJson.cover
                                })
                            }
                        })
                        .catch(err => {
                            err && Vue.logger.error(err)
                            if (mark || h5store) {
                                message.fail({})
                                if (h5store) {
                                    storageSession.removeItem('' + id)
                                }
                            }
                        })
                }, 100)
            }
        }

        // 获取模板分类
        const promiseDict = Vue.api.scene.getDictionaryCategory()
            .then(res => {
                const productType = {}
                res.data.list.forEach(item => {
                    productType[item.value] = item.name
                    productType[item.name] = item.value
                })
                Vue.store.commit('PRODUCT_TYPE', productType)
            })

        // 处理素材分类
        const promiseMaterialLevel1 = Vue.api.product.getCategoryListByTopId(materialId)
            .then(res => {
                // 传入[]清除已存在的分类
                Vue.store.commit('PRODUCT_CATEGORY_LEVEL1_LIST', { categoryList: [] })
                const categoryList = []
                res.forEach(category => {
                    // 将所有的素材一级分类放入一个list
                    if (category.topId === 0) {
                        categoryList.push(category)
                    }
                })
                Vue.store.commit('PRODUCT_CATEGORY_LEVEL1_LIST', { categoryList })
            })
            .catch(err => err)

        // 初始化场景信息
        const promiseInfo = Vue.api.scene.getScene(id, true)
            .then(res => {
                const obj = res.data.obj
                if (obj) {
                    if (obj.sourceId) {
                        Vue.api.product.getTemplateIdByPrintId(obj.sourceId)
                            .then(res => {
                                if (res && res.data && res.data.map) {
                                    const map = res.data.map
                                    Vue.store.commit('PRODUCT_ID', { productId: map.id, sourceUser: map.sourceUser, centerId: obj.centerIdStr })
                                } else {
                                    Vue.store.commit('PRODUCT_ID', { productId: obj.sourceId, needUpdate: false, isSourceId: true, centerId: obj.centerIdStr })
                                }
                            })
                            .catch(err => {
                                err && Vue.logger.error(err)
                                Vue.store.commit('PRODUCT_ID', { productId: obj.sourceId, needUpdate: false, isSourceId: true, centerId: obj.centerIdStr })
                            })
                    } else {
                        Vue.store.commit('PRODUCT_ID', { productId: null, needUpdate: true, isSourceId: false, centerId: obj.centerIdStr })
                    }
                    return obj
                } else {
                    Vue.notifier.fail('当前作品不存在')
                    return Promise.reject()
                }
            })
        let getWaterAuthor = Promise.resolve()
        if (Vue.store.state.user.userInfo.id) {
            // 处理logo的显示时间// 拿到用户分享的权益 用于判断是不是加水印
            const shareId = Vue.env.benefits.shareWithoutWM
            getWaterAuthor = Vue.api.user.getUserBenefits(shareId).then(data => {
                if (data.data.list.length > 0) {
                // 有这个权益
                    Vue.store.commit('USER_WATER_RIGHT', true)
                } else {
                    Vue.store.commit('USER_WATER_RIGHT', false)
                }
            })
        } else {
            // 游客模式默认添加水印
            Vue.store.commit('USER_WATER_RIGHT', false)
        }
        Promise.all([promiseInfo, promiseDict, promiseMaterialLevel1, adCss, adJs, getWaterAuthor])
            .then(([res]) => {
                Vue.store.commit('LAYOUT_LOGO', { show: false })
                initScene(res)
                next()
            })
            .catch(err => err && Vue.logger.error(err))
    },

    beforeRouteLeave(to, from, next) {
        // 导航离开该组件的对应路由时调用
        // 可以访问组件实例 `this`

        storageSession.removeItem(storageSession.key.qrcodeUrl)
        storageSession.removeItem(storageSession.key.qrcodeLogo)
        next()
    },
    mounted() {
        apiClearExpired()

        this.setVisitorMode()

        document.body.css({
            overflow: 'hidden'
        })

        // 阻止firefox默认的拖拽，比如拖动文字到其它地方，拖动图片打开新窗口
        document.addEventListener('dragstart', this.dragstart)

        // 禁用鼠标右键的默认功能
        document.addEventListener('contextmenu', this.contextmenu)

        // 阻止mac触摸板会缩放浏览器的问题
        this.$el.addEventListener('wheel', this.wheel)

        this.operationCheck()

        // 请求文字样式库数据
        this.fontStyleDataRequest()

        // 如果是批量创建模式则默认打开批量创建窗口
        if (util.getIsBatchCreate()) {
            this.$refs.theHead.openBatchCreate()
        }
    },
    destroyed() {
        uploadDrag.unbind()
        document.body.css({
            overflow: ''
        })
        document.removeEventListener('dragstart', this.dragstart)
        document.removeEventListener('contextmenu', this.contextmenu)
        this.$el.removeEventListener('wheel', this.wheel)
        this.$store.commit('LAYOUT_NAV_PANEL', { show: true })
    },
    methods: {
        updatePage() {
            this.eqxPage.eqxWatermark.drawWaterMarkClose()
            this.eqxPage.eqxWatermark.drawWaterMark()
        },
        setVisitorMode() {
            if (this.userInfo.id) {
                uploadDrag.bind(this.$el, { value: { upload: this.nav.list[5] } })
                if (!this.userInfo.rights) {
                    // 获取水印权限
                    const shareId = Vue.env.benefits.shareWithoutWM
                    Vue.api.user.getUserBenefits(shareId).then(data => {
                        if (data.data.list.length > 0) {
                            Vue.store.commit('USER_WATER_RIGHT', true)
                        } else {
                            Vue.store.commit('USER_WATER_RIGHT', false)
                        }
                        this.updatePage()
                    })
                }
            }
        },
        operationCheck() {
            const key = storageLocal.key.operation
            const dateStr = new Date().format('yyyy-MM-dd')
            const res = storageLocal.getItem(key)
            if (!res || res !== dateStr) {
                window.eqxAdSDK.banner({ mediaId: 69 }).then(res => {
                    if (res && res.data && res.data[0]) {
                        const url = res.data[0].linkUrl
                        const path = res.data[0].picSrc
                        const htmlStr = res.htmlStr[0]
                        this.dialog.openOperation({ url, path, htmlStr })
                            .then((res) => { storageLocal.setItem(key, dateStr) })
                            .catch(err => err && this.logger.error(err))
                    }
                })
            }
        },
        fontStyleDataRequest() {
            const key = storageSession.key.fontStyle
            const res = storageSession.getItem(key)
            if (!res) {
                Vue.api.product.getFontStyleDataList()
                    .then((res) => {
                        if (res.data.success && res.data.map) {
                            const data = res.data.map.rows
                            this.formatFontStyleData(data)
                        }
                    })
                    .catch(err => err && this.logger.error(err))
            } else {
                let data = res
                if (!Array.isArray(data)) {
                    data = JSON.parse(data)
                }
                Vue.store.commit('FONT_STYLE_INIT', data)
            }
        },
        formatFontStyleData(list) {
            const formatList = []
            const normal = {
                name: '无样式',
                cover: this.defaultFontStyleCover,
                flag: '',
                property: {
                    type: textType.text,
                    src: '',
                    dropShadow: {
                        color: 'rgba(0,0,0,0)',
                        x: 0,
                        y: 0,
                        blur: 0,
                        transparency: 100
                    },
                    angle: 45,
                    cube: [{ size: 0, color: '#FFFFFF' }],
                    stroke: {
                        size: 0,
                        color: '#5D61FF',
                        distance: 0
                    },
                    borderRadius: {
                        lt: true,
                        rt: true,
                        lb: true,
                        rb: true,
                        val: 0
                    }
                },
                css: {
                    color: '#000000',
                    fontFamily: ''
                }
            }
            formatList.push(normal)
            if (list && list.length > 0) {
                list.map((v, i) => {
                    const item = {}
                    item.name = v.styleName || ''
                    item.cover = v.styleCover || ''
                    item.flag = v.styleLable || ''
                    item.property = {}
                    item.css = {}
                    item.property.type = textType.text
                    item.property.dropShadow = {
                        color: 'rgba(0,0,0,0)',
                        x: 0,
                        y: 0,
                        blur: 0,
                        transparency: 100
                    }
                    item.property.borderRadius = {
                        lt: true,
                        rt: true,
                        lb: true,
                        rb: true,
                        val: 0
                    }
                    item.property.angle = 45
                    item.property.cube = [{ size: 0, color: '#FFFFFF' }]
                    item.property.stroke = {
                        size: 0,
                        color: '#5D61FF',
                        distance: 0
                    }
                    item.css.color = '#000000'

                    const property = v.property
                    for (const key in property) {
                        if (key === 'fontColor') {
                            item.css.color = property[key] || '#000000'
                        }
                        if (key === 'fontinfo') {
                            item.fontinfo = {
                                name: property[key].name,
                                fontFamily: property[key].font_family + '_pre',
                                fontFamilyReal: property[key].font_family,
                                src: property[key].woff_path
                            }
                            item.css.fontFamily = property[key].font_family
                        }
                        if (key === 'gradient') { // 渐变
                            item.property.type = textType.gradient
                            item.property.gradient = {
                                angle: parseInt(property[key].angle) || 0,
                                colors: { 0: property[key].colors.left, 1: property[key].colors.right }
                            }
                        }
                        if (key === 'shake') { // 颤抖
                            item.property.type = textType.shake
                            item.property.shake = {
                                size: parseInt(property[key].size) || 0,
                                colors: { 0: property[key].colors.left, 1: property[key].colors.right }
                            }
                            item.property.angle = parseInt(property[key].angle) || 0
                            item.property.shadow = {
                                color: '#000000',
                                h: 0,
                                v: 0,
                                blur: 0
                            }
                        }
                        if (key === 'chartlet') { // 贴图
                            item.property.type = textType.chartlet
                            item.property.backgroundImage = property[key].cover
                        }

                        if (key === 'cube') { // 立体
                            item.property.type = textType.cube
                            item.property.angle = parseInt(property[key].angle) || 0
                            item.property.cube = [{ size: parseInt(property[key].size) || 0, color: property[key].color }]
                        }

                        if (key === 'dropshow') { // 投影
                            item.property.dropShadow = {
                                color: property[key].color || 'rgba(0,0,0,1)',
                                x: parseInt(property[key].x) || 0,
                                y: parseInt(property[key].y) || 0,
                                blur: parseInt(property[key].blur) || 0,
                                transparency: parseInt(property[key].transparency) || 0
                            }
                        }

                        if (key === 'stroke') { // 描边
                            item.property.stroke = {
                                size: parseInt(property[key].size) || 0,
                                color: property[key].color || '#000000',
                                distance: parseInt(property[key].distance) || 0
                            }
                        }
                    }
                    // 特殊处理贴图和渐变的字体颜色为透明
                    if (item.property.type === textType.gradient ||
                    item.property.type === textType.chartlet) {
                        item.css.color = 'transparent'
                    }
                    formatList.push(item)
                })
            }
            const key = storageSession.key.fontStyle
            sessionStorage.setItem(key, JSON.stringify(formatList))
            Vue.store.commit('FONT_STYLE_INIT', formatList)
        }
    }
}
</script>

<style lang="scss">
.eqc-create {
    display: flex;
    height: 100%;
    overflow: hidden;
    align-items: flex-end;
    justify-content: center;
    > .right {
        flex: 1;
        height: 100%;
        overflow: hidden;
        > .content {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            height: calc(100% - 60px);
            overflow: hidden;
        }
    }
}
</style>
