<template>
    <div class="eqc-background-high">
        <div>
            <label class="title top">背景模糊</label>
            <slider />
        </div>
        <div>
            <label class="title">背景蒙层</label>
            <div class="color-type">
                <span
                    v-for="(item,i) in colorTypeList"
                    :key="i"
                    :class="{active:typeSelected===item}"
                    class="type-item"
                    @click="selectColorType(item)"
                >{{ item.name }}</span>
            </div>
            <color-purity
                v-if="isPurity"
                tab="top"
            />
            <color-linear
                v-if="!isPurity"
                tab="top"
            />
        </div>
    </div>
</template>
<script>
import slider from './BackgroundSlider.vue'
import ColorPurity from './ColorPurity.vue'
import ColorLinear from './ColorLinear.vue'
export default {
    components: {
        slider,
        ColorPurity,
        ColorLinear
    },
    data() {
        return {
            val: 0,
            colorTypeList: [
                {
                    name: '纯色',
                    type: 0
                }, {
                    name: '渐变色',
                    type: 1
                }
            ],
            typeSelected: null
        }
    },
    computed: {
        eqxPage() {
            return this.$store.state.scene.eqxPage
        },
        background() {
            return this.eqxPage.pageJson.properties.background.top
        },
        isPurity() {
            return this.typeSelected === this.colorTypeList[0]
        }
    },
    mounted() {
        // 默认选中纯色
        this.typeSelected = this.colorTypeList[0]
    },
    methods: {
        // 颜色类型选择
        selectColorType(item) {
            this.typeSelected = item
            this.background.type = item.type
            this.eqxPage.eqxBackground.setBackgroundTop(this.background)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        }
    }
}
</script>
<style lang="scss">
.eqc-background-high {
    padding: 0 16px;
    .title {
        font-weight: 600;
        line-height: 18px;
        margin: 20px 0 12px 0;
        display: block;
        margin: 20px 0 12px 0;
        font-size: 13px;
        color: #111;
    }
    .top {
        margin-top: 0;
    }
    .color-type {
        display: inline-block;
        .type-item {
            height: 28px;
            font-size: 12px;
            line-height: 17px;
            font-weight: 400;
            padding: 5px 8px;
            background: #f0f3f4;
            margin-right: 12px;
            cursor: pointer;
            border-radius: 2px;
            &.active {
                background: #1593ff;
                color: white;
            }
        }
    }
}
</style>
