<template>
    <div class="eqc-condition-bar">
        <div class="sort-list">
            <span
                v-for="(item,i) in sortList"
                :key="i"
                :class="{active:item.val===condition.mostType}"
                class="sort-item pointer"
                @click="sortClick(item)"
            >{{ item.name }}</span>
            <span
                v-if="templateColorPanel.colorSelectedIndex===0"
                :class="['sort-item','pointer','colorful']"
                @mouseover="openColorPanel"
            />
            <span
                v-if="templateColorPanel.colorSelectedIndex!==0"
                :style="`background-color:${templateColorPanel.colorSelectedColor};border:6px solid #F0F3F4;'}`"
                :class="['sort-item','pointer','color']"
                @mouseover="openColorPanel"
            />
        </div>
    </div>
</template>

<script>
export default {
    props: {
        condition: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            sortList: [{
                name: '综合排序',
                val: 'composite'
            }, {
                name: '最新',
                val: 'newest'
            }, {
                name: '最热',
                val: 'hottest'
            }]
        }
    },
    computed: {
        templateColorPanel() {
            return Vue.store.state.layout.templateColorPanel
        }
    },
    methods: {
        sortClick(item) {
            this.condition.mostType = item.val
        },
        openColorPanel() {
            Vue.store.commit('TEMPLATE_COLOR_PANEL', {
                show: true,
                position: {
                    top: event.target.getBoundingClientRect().top - 14,
                    left: 281
                }
            })
        }

    }
}
</script>

<style lang="scss">
.eqc-condition-bar {
    width: 256px;
    font-size: 12px;
    .pointer {
        cursor: pointer;
    }
    .sort-list {
        height: auto;
        margin: 0px 0px;
        span {
            line-height: 28px;
            text-align: center;
            border-radius: 2px;
            height: 28px;
            display: inline-block;
            padding: 0px 8px;
            background: rgba(240, 243, 244, 1);
            &.active {
                background: #1593ff;
                color: white;
            }
            &.colorful {
                float: right;
                width: 28px;
                background: url("../../../../../img/color_bg.png") center center/cover;
                background-color: #f0f3f4;
                background-size: 16px;
                background-repeat: no-repeat;
            }
            &.color {
                float: right;
                width: 28px;
            }
            &:hover:not(.active) {
                color: rgba(21, 147, 255, 1);
            }
        }
        :not(:nth-child(1)) {
            margin-left: 12px;
        }
    }
}
</style>
