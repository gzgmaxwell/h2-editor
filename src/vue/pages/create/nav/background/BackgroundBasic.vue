<template>
    <div class="eqc-background-basic">
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
            tab="bottom"
        />
        <color-linear
            v-if="!isPurity"
            tab="bottom"
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
    data() {
        return {
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
            return this.eqxPage.pageJson.properties.background.bottom
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
            this.eqxPage.eqxBackground.setBackgroundBottom(this.background)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        backToPure() {
            // 默认回到纯色
            this.typeSelected = this.colorTypeList[0]
        }
    }
}
</script>
<style lang="scss">
.eqc-background-basic {
    padding: 0 16px;
    .color-type {
        display: inline-block;
        margin-top: 6px;
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
                color: white !important;
            }
            &:hover {
                color: #1593ff;
            }
        }
    }
}
</style>
