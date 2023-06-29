<template>
    <ul class="eqc-setting-text-align">
        <li
            :class="{active: !isMuti&&(value === 'left' || value==='flex-start'),rotateLeft:updownState}"
            class="icon fl eqf-align-left"
            @click="setAlign('left')"
        />
        <li
            :class="{active: !isMuti&&(value === 'center'),rotateCenter:updownState}"
            class="icon fl eqf-align-center"
            @click="setAlign('center')"
        />
        <li
            :class="{active: !isMuti&&(value === 'right'|| value==='flex-end'),rotateRight:updownState}"
            class="icon fl eqf-align-right"
            @click="setAlign('right')"
        />
        <li
            v-if="state"
            data-hint="文字方向"
            class=" hint--top hint--rounded icon"
            @click="updownClick"
        >
            <i
                :class="{active: updownState}"
                class="icon fl eqf-fontway"
            />
        </li>
    </ul>
</template>

<script>
import bindResize from '../../../../core/html/element.resize'
import combineInitor from '../workspace/combine.box.js'
export default {
    props: {
        model: {
            type: Object,
            default: null
        },
        modelKey: {
            type: String,
            default: null
        },
        state: {
            type: Number,
            default: 1
        },
        isMuti: {
            type: Boolean,
            default: false // 多选控制样式 如果多选 样式不统一则为true
        }
    },
    data() {
        return {
            updownState: false
        }
    },
    computed: {
        scene() {
            return this.$store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        element() {
            return this.scene.eqxElementsSelected[0]
        },
        value() {
            return this.model[this.modelKey]
        }
    },
    watch: {
        model(newValue) {
            this.updownState = newValue.writingMode && newValue.writingMode === 'vertical-rl'
        }
    },
    mounted() {
        this.updownState = this.model.writingMode && this.model.writingMode === 'vertical-rl'
    },
    methods: {
        setAlign(align) {
            // table 模式下
            if (!this.state) {
                if (align === 'left') {
                    align = 'flex-start'
                } else if (align === 'right') {
                    align = 'flex-end'
                }
            }
            this.model[this.modelKey] = align
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        updownClick() {
            // 交换宽高 必须要是文字元素才行
            if (this.element.elementJson.type === 101 || this.element.elementJson.type === 107) {
                const width = this.model.width
                const height = this.model.height

                this.model.width = height
                this.model.height = width

                if (this.model.writingMode && this.model.writingMode === 'vertical-rl') {
                // 横向
                    this.model.writingMode = 'lr'
                    this.element.elementBox.value = 11
                    this.updownState = false
                    if (this.element.combineBox) {
                        combineInitor.reCalculateCombineBox(this.element.combineBox)
                    }
                } else {
                // 竖向
                    this.model.writingMode = 'vertical-rl'
                    this.element.elementBox.value = 13
                    bindResize.call(this.element, this.element.elementBox, this.element.elementBox.value)
                    this.updownState = true
                    // 如果该元素在组合中 要重新计算组合框
                    if (this.element.combineBox) {
                        combineInitor.reCalculateCombineBox(this.element.combineBox)
                    }
                }
                this.eqxPage.eqxHistory.add(this.eqxPage)
            } else {
                // 组合里面批量设置
                if (this.model.writingMode && this.model.writingMode === 'vertical-rl') {
                // 横向
                    this.model.writingMode = 'lr'
                } else {
                // 竖向
                    this.model.writingMode = 'vertical-rl'
                }
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-setting-text-align {
    display: flex;
    position: relative;
    width: 100%;
    height: 30px;
    margin-top: 12px;
    border: 1px solid #ccd5db;
    background: #f7f8f9;
    cursor: pointer;
    .icon {
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-grow: 1;
        color: #76838f;
        transition: all 0.3s;
        &:not(:last-child) {
            border-right: 1px solid #ccd5db;
        }
        &:hover,
        &.active {
            color: #1593ff;
            background: #fff;
        }
    }
    .active {
        color: #1593ff;
        background: red;
    }
    i {
        height: 100%;
    }

    .rotateLeft:before {
        content: "\e952";
        transform: rotateZ(90deg);
    }
    .rotateCenter:before {
        content: "\e950";
        transform: rotateZ(90deg);
    }
    .rotateRight:before {
        content: "\e953";
        transform: rotateZ(90deg);
    }
}
</style>
