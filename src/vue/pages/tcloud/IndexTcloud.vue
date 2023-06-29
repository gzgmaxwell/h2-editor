<template>
    <div class="eqc-tcloud">
        <the-tcloud-nav />
        <the-tcloud-nav-panel />
        <div class="right">
            <the-tcloud-head
                ref="theHead"
                :mode="data.mode"
                :close="close"
            />
            <div
                class="content"
            >
                <the-tcloud-preview :mode="data.mode" />
                <the-tcloud-setting :mode="data.mode" />
            </div>
        </div>
    </div>
</template>

<script>
import TheTcloudHead from './TheTcloudHead.vue'
import TheTcloudNav from './TheTcloudNav.vue'
import TheTcloudNavPanel from './TheTcloudNavPanel.vue'
import TheTcloudPreview from './TheTcloudPreview.vue'
import TheTcloudSetting from './TheTcloudSetting.vue'
import TcloudMode from '../../../config/enum.tcloudMode.type'
import uploadDrag from '../create/index/uploadDrag'

export default {
    components: {
        TheTcloudNav,
        TheTcloudNavPanel,
        TheTcloudHead,
        TheTcloudPreview,
        TheTcloudSetting
    },
    props: {
        data: {
            type: Object,
            default: () => {
                return {
                    mode: TcloudMode.independent
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

        }
    },
    computed: {
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        tcloud() {
            return Vue.store.state.tcloud
        },
        nav() {
            return this.tcloud.nav
        },
        navList() {
            return this.nav.list
        }
    },
    watch: {

    },
    created() {
        const { tcloudId } = Vue.env.mall
        // 处理素材分类
        Vue.api.product.getCategoryListByTopId(tcloudId)
            .then(res => {
                res = res.filter(v => v.name === '文字云')[0]
                // 传入[]清除已存在的分类
                Vue.store.commit('PRODUCT_CATEGORY_TCOULD_LIST', { categoryList: [] })
                const categoryList = []
                res.list.forEach(category => {
                    categoryList.push(category)
                })
                Vue.store.commit('PRODUCT_CATEGORY_TCOULD_LIST', { categoryList })
            })
            .catch(err => err)
    },
    beforeRouteEnter(to, from, next) {
        // 在渲染该组件的对应路由被 confirm 前调用
        // 不！能！获取组件实例 `this`
        // 因为当守卫执行前，组件实例还没被创建
        next()
    },
    beforeRouteLeave(to, from, next) {
        // 导航离开该组件的对应路由时调用
        // 可以访问组件实例 `this`

        next()
    },
    mounted() {
        document.title = '轻设计|字云'
        if (this.userInfo.id) {
            uploadDrag.bind(this.$el, { value: { tcloud: { navItem: this.navList[1] } } })
        }
    },
    destroyed() {
        document.title = '易企秀|轻设计'
        uploadDrag.unbind()
    },
    methods: {

    }
}
</script>

<style lang="scss">
.eqc-tcloud {
    display: flex;
    height: 100%;
    overflow: hidden;
    > .right {
        flex: 1;
        > .content {
            display: flex;
            position: relative;
            height: 100%;
        }
    }
}
</style>
