<template>
    <div class="eqc-create-auto">
        <the-editor />
    </div>
</template>

<script>
import TheEditor from './TheEditor.vue'
import EqxScene from '../../../core/scene'
import EqxPage from '../../../core/html/page'

export default {
    components: {
        TheEditor
    },
    data() {
        return {
        }
    },
    computed: {
    },
    watch: {
    },
    beforeRouteEnter(to, from, next) {
        // 在渲染该组件的对应路由被 confirm 前调用
        // 不！能！获取组件实例 `this`
        // 因为当守卫执行前，组件实例还没被创建
        const id = to.params.id
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
            Vue.store.commit('SCENE_INIT', { eqxScene, eqxPage })
        }

        // 初始化场景信息
        const promiseInfo = Vue.api.scene.getScene(id, true)
            .then(res => {
                const obj = res.data.obj
                if (obj) {
                    return obj
                } else {
                    Vue.notifier.fail('当前作品不存在')
                    return Promise.reject()
                }
            })
        // 处理logo的显示时间
        Promise.all([promiseInfo])
            .then(([res]) => {
                Vue.store.commit('LAYOUT_LOGO', { show: false })
                // 日签默认不带水印
                Vue.store.commit('USER_WATER_RIGHT', true)
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
    },
    destroyed() {
    },
    methods: {
    }
}
</script>

<style lang="scss">
.eqc-create-auto {
    display: flex;
    height: 100%;
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
</style>
