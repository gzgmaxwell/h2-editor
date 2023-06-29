<template>
    <div class="eqc-nav-material">
        <!-- 头部：【素材库、已购买、已收藏】 -->
        <div
            v-if="showHeader"
            :style="{height:showHeader?'60px':0}"
            class="header"
        >
            <span
                v-for="(item,i) in headerList"
                :key="i"
                :class="{active:tabSelected===item}"
                class="menu"
                @click="selectTab(item)"
            >{{ item.name }}</span>
            <span
                class="config"
                @mousemove="mousemove"
            >
                <i class="eqf-setting-l" />
            </span>
        </div>
        <!-- 素材库 -->
        <material-menu
            v-if="tabSelected === headerList[0]"
            :category="category"
            @showAll="showAll"
        />
        <!-- 已购买 -->
        <material-purchased
            v-if="tabSelected === headerList[1]"
            type="purchase"
            :category="category"
        />
        <!-- 已收藏 -->
        <material-purchased
            v-if="tabSelected === headerList[2]"
            type="collect"
            :category="category"
        />
        <!-- tips -->
        <material-foot-tips />
        <!-- footer -->
        <material-footer :category="category" />
    </div>
</template>

<script>

import MaterialMenu from './material/MaterialMenu.vue'
import MaterialFooter from './material/MaterialFooter.vue'
import MaterialFootTips from './material/MaterialFootTips.vue'
import MaterialPurchased from './material/MaterialPurchased.vue'
export default {
    components: {
        MaterialMenu,
        MaterialFooter,
        MaterialFootTips,
        MaterialPurchased
    },
    props: {
        category: {
            type: String,
            default: 'h2'
        }
    },
    data() {
        return {
            tabSelected: null,
            showHeader: true,
            headerList: [
                {
                    name: '素材库',
                    type: 'materialMenu'
                }, {
                    name: '已购买',
                    type: 'purchased'
                }, {
                    name: '已收藏',
                    type: 'collected'
                }
            ]
        }
    },
    computed: {
        userId() {
            return Vue.store.state.user.userInfo.id
        }
    },
    watch: {

    },
    mounted() {
        // 默认选中素材库
        this.tabSelected = this.headerList[0]
    },
    methods: {
        // 打开配置
        showAll(state) {
            this.showHeader = !state
            Vue.store.commit('MATERIAL_PREVIEW_AUTHOR_CHANGE', { show: false })
        },
        // 切换tab
        selectTab(item) {
            // 如果切换的是 已购买和已收藏 需要先登录
            if (['purchased', 'collected'].includes(item.type)) {
                if (!this.userId) {
                    // 游客模式 弹窗购买
                    this.dialog.openLogin()
                        .then(() => this.user.auth())
                        .then(() => { this.tabSelected = item })
                        .catch(err => err && this.logger.error(err))
                }
            }
            this.tabSelected = item
        },
        mousemove() {
            Vue.store.commit('MATERIAL_PREVIEW_AUTHOR_CHANGE', { show: true })
        }
    }
}
</script>

<style lang="scss">
.eqc-nav-material {
    position: relative;
    background-color: #ffffff;
    .header {
        margin: 0 16px;
        display: flex;
        align-items: center;
        height: 60px;
        color: #252b3f;
        box-sizing: content-box;
        transition: all 0.3s;
        .menu {
            font-size: 14px;
            font-weight: 600;
            height: 58px;
            line-height: 56px;
            margin-right: 20px;
            cursor: pointer;
            border-top: 2px solid transparent;
            margin-top: -2px;
            &.active {
                color: #1593ff;
                border-top: 2px solid #1593ff;
            }
            &:hover {
                color: #1593ff;
            }
        }
        .config {
            cursor: pointer;
            font-size: 16px;
            line-height: 18px;
            position: absolute;
            right: 16px;
            top: 21px;
            &:hover {
                color: #1593ff;
            }
        }
    }
}
</style>
