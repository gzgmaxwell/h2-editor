<template>
    <div
        class="eqc-express"
        @click="listening($event)"
    >
        <div class="express-mask" />
        <div class="express-content">
            <the-nav />
            <the-nav-panel />
            <div class="right">
                <the-head />
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
            <transition name="rotate-y-left">
                <sidebar-layer v-if="layer.show" />
            </transition>
            <transition name="rotate-y-left">
                <setting-font-style v-if="fontStyleLayer.show" />
            </transition>
        </div>
    </div>
</template>

<script>
import TheHead from './TheHead.vue'
import TheNav from './TheNav.vue'
import TheNavPanel from './TheNavPanel.vue'
import TheWorkspace from './TheWorkspace.vue'
import TheSidebar from './TheSidebar.vue'
import SidebarLayer from './sidebar/SidebarLayer.vue'
import ThePage from './ThePage.vue'
import TheSettingComp from './TheSettingComp.vue'
import EqxScene from '../../../core/scene'
import EqxPage from '../../../core/html/page'
import { apiClearExpired } from '../../../utils/apiCache'
import storageSession from '../../../utils/storageSession'
import uploadDrag from './index/uploadDrag'
import expressAdd from './index/expressAdd'
import storageLocal from '../../../utils/storageLocal'
import SettingFontStyle from './setting/SettingFontStyle.vue'
import textType from '../../../config/enum.text.type'
import defaultFontStyleImg from '../../../img/default_fontstyle.png'
import expressType from '../../../config/enum.express.type'
import statistic from '../../../config/statistic'

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
        SettingFontStyle
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
        }
    },
    watch: {
        eqxElementsSelected: {
            handler(newVal) {
                if (newVal.length === 0) { // 选中组件个数为0时，隐藏右边设置
                    this.showSetting = false
                    // 右边设置隐藏同时也隐藏字体样式管理框
                    this.$store.commit('FONT_STYLE_LAYER', { show: false })
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

        const id = to.params.id
        const { materialId } = Vue.env.mall

        if (id.indexOf('_') > -1) {
            // 添加埋点作品id对象 id_code 形式需要分离id
            window.scene = { id: id.split('_')[0] }
        } else {
            console.warn('路由未更新，请及时联系lirui')
            window.scene = { id }
        }

        // 是否需要创建图片组件
        const expressMaterial = storageSession.getItem(storageSession.key.expressMaterial) || ''
        // 是否是第三方开放平台
        const expressReferrer = storageSession.getItem(storageSession.key.expressReferrer) || ''

        // 初始化场景信息
        const initScene = (sceneJson) => {
            sceneJson.title = sceneJson.title || '易企秀轻设计制作'
            sceneJson.description = sceneJson.description || '轻松制作海报、邀请函、微信公号头图'

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

            // 添加图片组件到画布
            if (expressMaterial !== '') {
                setTimeout(() => {
                    storageSession.removeItem(storageSession.key.expressMaterial)
                    const { width, height } = sceneJson
                    const imageJson = expressAdd.getImageJson(width, height, expressMaterial)
                    eqxPage.addElement(imageJson)
                    eqxPage.eqxBackground.setBackgroundBottom({ color: '', colors: ['', ''], rotate: 0, type: 0 })
                    window._hmt.push(['_trackEvent',
                        statistic.category.F,
                        statistic.action.EXPRESS,
                        statistic.opt_label.EXPRESS.openImg])
                })
            } else if (expressReferrer !== '') {
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.EXPRESS,
                    statistic.opt_label.EXPRESS.openThird])
            } else {
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.EXPRESS,
                    statistic.opt_label.EXPRESS.openProduct])
            }

            // 创建的空作品创建的作品都保存一次，使其有封面
            if (!eqxPage.pageJson.cover) {
                setTimeout(() => {
                    Vue.store.dispatch('PAGE_SAVE', { eqxPage, needCover: true })
                        .then(() => {
                        })
                        .catch(err => {
                            err && Vue.logger.error(err)
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
        const pageId = storageSession.getItem(storageSession.key.expressPageId)
        let promiseInfo = Promise.resolve()
        if (pageId) {
            promiseInfo = Vue.api.scene.getpurchasedScene(id, pageId)
                .then(res => {
                    const obj = res.data.obj
                    if (obj) {
                        return obj
                    } else {
                        Vue.notifier.fail('当前作品不存在')
                        return Promise.reject()
                    }
                })
        } else {
            promiseInfo = Vue.api.scene.getScene(id, true)
                .then(res => {
                    const obj = res.data.obj
                    if (obj) {
                        return obj
                    } else {
                        Vue.notifier.fail('当前作品不存在')
                        return Promise.reject()
                    }
                })
        }

        const setNavList = () => {
            const list = [{
                name: '模板',
                type: 'template',
                icon: 'eqf-template-l'
            }, {
                name: '文字',
                type: 'text',
                icon: 'eqf-fontmall'
            }, {
                name: '素材',
                type: 'image',
                icon: 'eqf-image-l'
            }, {
                name: '背景',
                type: 'background',
                icon: 'eqf-background-l'
            }, {
                name: '上传',
                type: 'upload',
                icon: 'eqf-cloudupload-l'
            }]
            if (expressMaterial) {
                list.splice(0, 1)
                list.splice(2, 1)
                Vue.store.commit('EXPRESS_MODE', expressType.image)
            } else {
                Vue.store.commit('EXPRESS_MODE', expressType.product)
            }
            Vue.store.commit('LAYOUT_NAV_LIST', { list })
        }

        Promise.all([promiseInfo, promiseDict, promiseMaterialLevel1])
            .then(([res]) => {
                setNavList()
                Vue.store.commit('LAYOUT_NAV_PANEL', { show: false })
                // 弹窗编辑器默认不带水印
                Vue.store.commit('USER_WATER_RIGHT', true)
                Vue.loading.close()
                initScene(res)
                next()
            })
            .catch(err => err && Vue.logger.error(err))
    },
    beforeRouteLeave(to, from, next) {
        // 导航离开该组件的对应路由时调用
        // 可以访问组件实例 `this`
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

        // 请求文字样式库数据
        this.fontStyleDataRequest()
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
        storageSession.removeItem(storageSession.key.expressPageId)
    },
    methods: {
        listening(event) {
            if (event && event.target.nodeName !== 'INPUT') { // 排除gif速度滑动条input事件
                Vue.store.commit('EXPRESS_HEAD_MENU', { showImgMenu: false, showGifMenu: false })
            }
        },
        setVisitorMode() {
            // 当游客登录时执行
            if (this.userInfo.id) {
                uploadDrag.bind(this.$el, { value: { upload: this.nav.list[4] } })
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
.eqc-express {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    .express-mask {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.6);
    }
    .express-content {
        position: relative;
        width: 1150px;
        height: 100%; // 600px;
        cursor: default;
        background: #fff;
        box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
        display: flex;
        overflow: hidden;
        > .right {
            flex: 1;
            > .content {
                display: flex;
                position: relative;
                height: calc(100% - 60px);
            }
        }
    }
}
</style>
