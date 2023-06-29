<template>
    <transition name="rotate-y-left">
        <div
            v-if="materialMoreConfig.show"
            class="eqc-material-more-condition"
        >
            <div class="condition-box">
                <!-- 价格 -->
                <div class="title box">
                    <span>价格</span>
                    <span
                        class="close"
                        @click="close"
                    ><i class="eqf-no" /></span>
                </div>
                <div class="content">
                    <span
                        v-for="item in priceArr"
                        :key="item.key"
                        class="item"
                    >
                        <base-radio
                            v-model="condition.price"
                            :value="item.key"
                            name="price"
                            @change="conditionClick"
                        />
                        <label :style="{color:item.color?item.color:''}">{{ item.name }}</label>
                    </span>
                </div>
                <!-- 排序 -->
                <div class="title last">
                    <span>排序</span>
                </div>
                <div class="content">
                    <span
                        v-for="item in sortArr"
                        :key="item.key"
                        class="item"
                    >
                        <base-radio
                            v-model="condition.sort"
                            :value="item.key"
                            name="sort"
                            @change="conditionClick"
                        />
                        <label for="create_page">{{ item.name }}</label>
                    </span>
                </div>
            </div>
        </div>
    </transition>
</template>
<script>
export default {
    data() {
        return {
            priceArr: [{
                name: '全部',
                key: 'all'
            }, {
                name: '免费',
                key: 'free'
            }, {
                name: '付费',
                key: 'pay'
            }, {
                name: '会员免费',
                key: 'memberFree',
                color: '#A1783C'
            }],
            sortArr: [{
                name: '最新',
                key: 'latest'
            }, {
                name: '最热',
                key: 'hot'
            }],
            condition: {
                price: 'all',
                sort: 'latest'
            }
        }
    },
    computed: {
        materialMoreConfig() {
            return Vue.store.state.layout.materialMoreConfig
        }
    },
    watch: {
        'materialMoreConfig.show'(newVal) {
            if (!newVal) {
                this.condition.price = 'all'
                this.condition.sort = 'latest'
            }
        }
    },
    methods: {
        // 关闭弹窗
        close() {
            Vue.store.commit('MATERIAL_MORE_CHANGE', { show: false })
        },
        // 选择条件筛选
        conditionClick(v) {
            const price = this.condition.price
            const sort = this.condition.sort
            Vue.store.commit('MATERIAL_MORE_CHANGE', { show: true, price, sort })
        }
    }
}
</script>
<style lang="scss">
.eqc-material-more-condition {
    position: absolute;
    left: 230px;
    top: 10px;
    transition: all 0.3s;
    background: #ffffff;
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
    border-radius: 2px;
    z-index: 4;
    font-size: 13px;
    transform-origin: left;
    .condition-box {
        width: 312px;
        height: 136px;
        padding: 16px;
        .title {
            color: #111111;
            font-weight: bold;
            line-height: 18px;
            .close {
                float: right;
                font-size: 16px;
                cursor: pointer;
            }
        }

        .last {
            margin-top: 16px;
        }
        .content {
            margin-top: 8px;
            color: #252b3f;
            line-height: 15px;
            .item {
                margin-right: 16px;
                label {
                    margin-top: -2px;
                }
            }
        }
    }
}
</style>
