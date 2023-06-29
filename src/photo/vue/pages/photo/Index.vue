<template>
    <div class="eqc-photo">
        <the-nav />
        <the-nav-panel
            :mode="data.mode"
        />
        <div class="right">
            <the-head
                :mode="data.mode"
                :close="close"
            />
            <div class="content">
                <the-workspace
                    :mode="data.mode"
                />
                <the-sidebar
                    v-show="isUploadImage && sideBar.show"
                />
            </div>
        </div>
    </div>
</template>

<script>
import TheNav from './TheNav.vue'
import TheHead from './TheHead.vue'
import TheNavPanel from './TheNavPanel.vue'
import TheWorkspace from './TheWorkspace.vue'
import EqxScene from '../../../core/scene'
import PhotoHistory from '../../../core/history'
import EqxPage from '../../../core/html/page'
import TheSidebar from './TheSidebar.vue'
import PhotoMode from '../../../../config/enum.photoMode.type'
// import uploadDrag from './index/uploadDrag'

export default {
    components: {
        TheNav,
        TheHead,
        TheNavPanel,
        TheWorkspace,
        TheSidebar
    },
    props: {
        data: {
            type: Object,
            default: () => {
                return {
                    mode: PhotoMode.independent
                }
            }
        },
        close: {
            type: Function,
            default: null
        }
    },
    data() {
        return {
            wheel: e => e.preventDefault(),
            dragstart: e => e.preventDefault(),
            contextmenu: e => e.preventDefault()
        }
    },
    computed: {
        photoLayout() {
            return Vue.store.state.photoLayout
        },
        photoScene() {
            return Vue.store.state.photoScene
        },
        isUploadImage() {
            return this.photoScene.isUploadImage
        },
        sideBar() {
            return this.photoLayout.sideBar
        }
    },
    watch: {
    },
    created() {
        const sceneJson = { title: '轻设计_照片编辑器', pages: [], width: 640, height: 1008 }
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
        Vue.store.commit('PHOTO_SCENE_INIT', { eqxScene, eqxPage })
        // 初始化历史记录
        const photoHistory = new PhotoHistory()
        Vue.store.commit('PHOTO_HISTORY_INIT', { photoHistory })
    },
    beforeRouteEnter(to, from, next) {
        next()
    },
    beforeRouteLeave(to, from, next) {
        // 导航离开该组件的对应路由时调用
        // 可以访问组件实例 `this
        next()
    },
    mounted() {
        document.title = '轻设计|图片美化'

        this.setVisitorMode()

        // 阻止firefox默认的拖拽，比如拖动文字到其它地方，拖动图片打开新窗口
        document.addEventListener('dragstart', this.dragstart)
        // 禁用鼠标右键的默认功能
        document.addEventListener('contextmenu', this.contextmenu)
        // 阻止mac触摸板会缩放浏览器的问题
        this.$el.addEventListener('wheel', this.wheel)
    },
    destroyed() {
        document.removeEventListener('dragstart', this.dragstart)
        document.removeEventListener('contextmenu', this.contextmenu)
        this.$el.removeEventListener('wheel', this.wheel)
    },
    methods: {
        setVisitorMode() {
            // if (this.userInfo.id) {
            //     uploadDrag.bind(this.$el, { value: { upload: this.nav.list[5] } })
            // }
        }
    }
}
</script>

<style lang="scss">
.eqc-photo {
    display: flex;
    height: 100%;
    overflow: hidden;
    > .right {
        flex: 1;
        > .content {
            display: flex;
            position: relative;
            height: 100%;
            z-index: 1;
        }
    }
}
</style>
