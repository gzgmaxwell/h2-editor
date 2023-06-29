<template>
    <div class="eqc-puzzle">
        <the-puzzle-nav />
        <the-puzzle-nav-panel />
        <div class="right">
            <the-puzzle-head
                ref="theHead"
            />
            <div
                class="content"
            >
                <the-workspace />
                <the-sidebar />
            </div>
        </div>
    </div>
</template>

<script>
import ThePuzzleHead from './ThePuzzleHead.vue'
import ThePuzzleNav from './ThePuzzleNav.vue'
import ThePuzzleNavPanel from './ThePuzzleNavPanel.vue'
import uploadDrag from '../create/index/uploadDrag'
import TheWorkspace from '../create/TheWorkspace.vue'
import TheSidebar from '../create/TheSidebar.vue'
import EqxScene from '../../../core/scene'
import EqxPage from '../../../core/html/page'
import storageLocal from '../../../utils/storageLocal'

export default {
    components: {
        ThePuzzleNav,
        ThePuzzleNavPanel,
        ThePuzzleHead,
        TheWorkspace,
        TheSidebar
    },
    data() {
        return {
            wheel: e => e.preventDefault(),
            dragstart: e => e.preventDefault(),
            contextmenu: e => e.preventDefault()
        }
    },
    computed: {
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        puzzle() {
            return Vue.store.state.puzzle
        },
        nav() {
            return this.puzzle.nav
        },
        navList() {
            return this.nav.list
        },
        scene() {
            return Vue.store.state.scene
        },
        eqxScene() {
            return this.scene.eqxScene
        },
        eqxPage() {
            return this.scene.eqxPage
        }
    },
    watch: {
        userInfo: {
            handler(newVal, oldVal) {
                // 从游客模式登录时执行
                !oldVal.id && this.setVisitorMode()
            }
        }
    },
    created() {

    },
    beforeRouteEnter(to, from, next) {
        // 在渲染该组件的对应路由被 confirm 前调用
        // 不！能！获取组件实例 `this`
        // 因为当守卫执行前，组件实例还没被创建
        // 通过分类创建作品
        const id = to.params.id
        if (id.indexOf('_') > -1) {
            // 添加埋点作品id对象 id_code 形式需要分离id
            window.scene = { id: id.split('_')[0] }
        }
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

            // 创建的空作品保存一次，使其有封面
            if (!eqxPage.pageJson.cover) {
                setTimeout(() => {
                    Vue.store.dispatch('PAGE_SAVE', { eqxPage, needCover: true })
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

        const { materialId } = Vue.env.mall
        // 处理素材分类
        const promiseMaterial = Vue.api.product.getCategoryListByTopId(materialId)
            .then(res => {
                res = res.filter(v => v.name === '图片')[0]
                // 传入[]清除已存在的分类
                Vue.store.commit('PRODUCT_CATEGORY_PUZZLE_LIST', { categoryList: [] })
                const categoryList = []
                res.list.forEach(category => {
                    categoryList.push(category)
                })
                Vue.store.commit('PRODUCT_CATEGORY_PUZZLE_LIST', { categoryList })
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

        // 获取用户是否有无水印权益
        let getWaterAuthor = Promise.resolve()
        if (Vue.store.state.user.userInfo.id) {
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

        Promise.all([promiseInfo, promiseDict, promiseMaterial, getWaterAuthor])
            .then(([res]) => {
                Vue.store.commit('LAYOUT_LOGO', { show: false })
                initScene(res)
                Vue.store.commit('PUZZLE_MODE', true)
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
        document.title = '轻设计|拼图'
        // 游客模式弹出登录框
        if (!this.userInfo.id) {
            this.openLogin()
        }
        // 阻止firefox默认的拖拽，比如拖动文字到其它地方，拖动图片打开新窗口
        document.addEventListener('dragstart', this.dragstart)
        // 禁用鼠标右键的默认功能
        document.addEventListener('contextmenu', this.contextmenu)
        // 阻止mac触摸板会缩放浏览器的问题
        this.$el.addEventListener('wheel', this.wheel)
    },
    destroyed() {
        document.title = '易企秀|轻设计'
        uploadDrag.unbind()
        document.removeEventListener('dragstart', this.dragstart)
        document.removeEventListener('contextmenu', this.contextmenu)
        this.$el.removeEventListener('wheel', this.wheel)
    },
    methods: {
        openLogin() {
            this.dialog.openLogin()
                .then(() => this.user.auth())
                .then(() => {
                    Vue.api.scene.transferScene(this.eqxScene.sceneJson.id, this.userInfo.loginName, true)
                })
                .catch(err => err && this.logger.error(err))
        },
        updatePage() {
            this.eqxPage.eqxWatermark.drawWaterMarkClose()
            this.eqxPage.eqxWatermark.drawWaterMark()
        },
        setVisitorMode() {
            if (this.userInfo.id) {
                uploadDrag.bind(this.$el, { value: { puzzle: { navItem: this.navList[2] } } })
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
        }
    }
}
</script>

<style lang="scss">
.eqc-puzzle {
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
