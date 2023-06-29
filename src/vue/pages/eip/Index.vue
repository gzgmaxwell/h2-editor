<template>
    <div
        id="container"
        class="eqc-eip"
    >
        <div class="content">
            <ul class="menu">
                <li class="item">
                    <a :href="host.client + '/eip/' + (isScene ? 'scene' : 'template')">H5</a>
                </li>
                <li class="item">
                    <a class="active">轻设计</a>
                </li>
                <li
                    class="item"
                >
                    <a :href="host.client + '/eip/' + (isScene ? 'scene' : 'template') + '?type=lc'">长页</a>
                    <span class="red">hot</span>
                </li>
                <li
                    class="item"
                >
                    <a :href="host.client + '/eip/' + (isScene ? 'scene' : 'template') + '?type=lf'">易表单</a>
                    <span class="red">new</span>
                </li>
                <li
                    class="item"
                >
                    <a :href="host.client + (isScene ? '/eip/scene?type=GC' : '/scene/gc/template')">互动</a>
                </li>
                <li
                    class="item"
                >
                    <a :href="host.client + '/video/' + (isScene ? 'scene' : 'index')">视频</a>
                    <span class="red">new</span>
                </li>
                <!-- <li
                    v-if="isScene"
                    class="item">
                    <a
                        :href="host.xiutui + '/xiutui/dial'"
                        target="_blank">秀推</a>
                </li> -->
                <li
                    v-if="isScene"
                    class="item"
                >
                    <a
                        :href="host.xz + '/hideLogin.html'"
                        target="_blank"
                    >秀站</a>
                </li>
            </ul>
            <ul class="user-oper">
                <li
                    v-if="isScene"
                    class="investigate"
                >
                    <a
                        :href="host.h5 + '/ls/XhbraL3x'"
                        target="_blank"
                    >
                        <i class="comment eqf-comment-l" />
                        <span>用户调研</span>
                    </a>
                </li>
            </ul>
            <router-view />
        </div>
    </div>
</template>

<script>
import delayLoad from '../../../utils/delayLoad'

export default {
    data() {
        return {
            sidebarNav: null
        }
    },
    computed: {
        host() {
            return this.env.host
        },
        isScene() {
            return this.$route.name === 'scene'
        },
        userInfo() {
            return this.$store.state.user.userInfo
        },
        vedioAuth() {
            return ([1, 99].includes(this.userInfo.type) && this.userInfo.identityType !== '1') || (this.userInfo.members && this.userInfo.members.some(item => [14].includes(item.memberId)))
        }
    },
    watch: {
        '$route.name': function (newVal) {
            this.setSidebarActive(newVal)
        }
    },
    beforeRouteEnter(to, from, next) {
        // 异步加载layout
        const hostLayout = Vue.env.host.layout.replace(/https?:/, '')
        const file = /lib.eqh5.com/.test(hostLayout) ? '1.5.4/eqx.layout.min' : 'eqx.layout'
        delayLoad.delayLoadJS(Vue.env.plugin.jquery)
            .then(() => Promise.all([
                delayLoad.delayLoadCSS(`${hostLayout}/eqx.layout/${file}.css`),
                delayLoad.delayLoadJS(`${hostLayout}/eqx.layout/${file}.js`)
            ]))
            .then(() => next())
            .catch(err => err && Vue.logger.error(err))
    },
    mounted() {
        const eqxLayout = new window.EqxLayout({
            root: 'container', // 容器元素ID
            user: this.userInfo // 用户信息
            // userMap: data && data.map || {} // eqs/login接口中获取map信息(用于判断小会员)
        })

        eqxLayout.render('header')
        this.sidebarNav = eqxLayout.render('sidebar-nav')
        eqxLayout.setMoudleStr(this.host.client + '/h2/eip/', '')
        this.setSidebarActive(this.$route.name)
        const list = [{
            name: '我的作品',
            handle: e => {
                e && typeof e.preventDefault === 'function' && e.preventDefault()
                this.$router.push({ name: 'scene' })
            }
        }]
        // 有些账号的工作台没有“创意模板”需要判断
        const $items = this.sidebarNav.sideBarNavDom.querySelectorAll('[data-name="创意模板"]')
        if ($items && $items.length > 0) {
            list.push({
                name: '创意模板',
                handle: e => {
                    e && typeof e.preventDefault === 'function' && e.preventDefault()
                    this.$router.push({ name: 'template' })
                }
            })
        }
        this.sidebarNav.customNavHandle(list)
    },
    methods: {
        setSidebarActive(name) {
            this.sidebarNav.setActiveTab(name === 'scene' ? '我的作品' : '创意模板')
        }
    }
}
</script>

<style lang="scss">
.eqc-eip {
    > .content {
        position: fixed;
        top: 44px;
        left: 200px;
        width: calc(100% - 200px);
        height: calc(100% - 44px);
        > .menu {
            display: flex;
            height: 60px;
            padding: 0 24px;
            border-bottom: 1px solid #e6ebed;
            background: #fff;
            position: relative;
            > .item {
                position: relative;
                margin-right: 8px;
                min-width: 74px;
                text-align: center;
                color: #333;
                a {
                    position: relative;
                    display: block;
                    width: 100%;
                    height: 100%;
                    line-height: 60px;
                    text-align: center;
                    transition: all 0.16s;
                    padding: 0 16px;
                    &::after {
                        content: "";
                        position: absolute;
                        width: 100%;
                        height: 2px;
                        bottom: 0;
                        left: 0;
                        background: $blue-normal;
                        transform: scaleX(0);
                        transition: transform 0.16s ease;
                    }
                    &:hover,
                    &.active {
                        color: $blue-normal;
                        &::after {
                            transform: scaleX(1);
                        }
                    }
                }
                .red {
                    position: absolute;
                    top: 10px;
                    right: 0;
                    font-size: 12px;
                    color: $red-normal;
                }
            }
        }
        > .user-oper {
            height: 60px;
            position: absolute;
            top: 0;
            right: 30px;
            display: flex;
            line-height: 60px;
            .comment {
                position: absolute;
                top: 40%;
                left: -16px;
            }
        }
    }
}
</style>
