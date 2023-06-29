<template>
    <div class="eqc-background-top">
        <ul class="category">
            <li
                :class="{active: isPurity}"
                class="item"
                @click="selectCategory(0)"
            >
                纯色
            </li>
            <li
                :class="{active: !isPurity}"
                class="item"
                @click="selectCategory(1)"
            >
                渐变色
            </li>
        </ul>
        <color-purity
            v-if="isPurity"
            tab="top"
        />
        <color-linear
            v-if="!isPurity"
            tab="top"
        />
    </div>
</template>

<script>
import ColorPurity from './ColorPurity.vue'
import ColorLinear from './ColorLinear.vue'

export default {
    components: {
        ColorPurity,
        ColorLinear
    },
    computed: {
        eqxPage() {
            return this.$store.state.scene.eqxPage
        },
        background() {
            return this.eqxPage.pageJson.properties.background.top
        },
        isPurity() {
            return this.background.type === 0
        }
    },
    methods: {
        selectCategory(type) {
            this.background.type = type
            this.eqxPage.eqxBackground.setBackgroundTop(this.background)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        }
    }
}
</script>

<style lang="scss">
.eqc-background-top {
    .category {
        display: flex;
        height: 40px;
        .item {
            position: relative;
            flex: 1;
            line-height: 40px;
            font-size: 12px;
            border-bottom: 1px solid #ccd5db;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
            &:hover,
            &.active {
                color: #1593ff;
                &::after {
                    opacity: 1;
                }
            }
            &::after {
                content: "";
                position: absolute;
                left: 0;
                bottom: -1px;
                width: 100%;
                height: 2px;
                background: #1593ff;
                opacity: 0;
                transition: all 0.3s;
            }
        }
    }
}
</style>
