<template>
    <div
        data-hint="左右拖动改变大小"
        class="eqc-base-input hint--top hint--rounded"
    >
        <input
            ref="input"
            :value="value"
            type="text"
        >
        <div
            v-show="unitView"
            class="unit"
        >
            {{ unitView }}
        </div>
    </div>
</template>
<script>

import historyType from '../../config/enum.photoHistory.type'

export default {
    props: {
        model: {
            type: Object,
            default: null
        },
        modelKey: {
            type: String,
            default: ''
        },
        modelKeyType: {
            type: String,
            default: ''
        },
        // 最小值
        min: {
            type: Number,
            default: -9999
        },
        // 最大值
        max: {
            type: Number,
            default: 9999
        },
        // 保存数据库的单位
        unit: {
            type: String,
            default: 'px'
        },
        // 显示用的单位
        unitView: {
            type: String,
            default: 'px'
        },
        // 增减量
        step: {
            type: Number,
            default: 1
        },
        // 反过来计算，比如透明度
        reverse: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            historyType
        }
    },
    computed: {
        scene() {
            return Vue.store.state.photoScene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        value() {
            return this.model2view(this.model[this.modelKey])
        },
        // 历史记录
        photoHistory() {
            return Vue.store.state.photoHistory
        },
        selectType() {
            return Vue.store.state.photoLayout.nav.selectedItem.type
        }
    },
    mounted() {
        const { step } = this
        const $input = this.$refs.input

        $input.addEventListener('mousedown', e => {
            const initX = e.pageX
            const initValue = parseInt(e.target.value)

            const mousemove = e => {
                const moveX = e.pageX - initX
                const val = initValue + moveX * step
                this.setValue(val)
            }
            const mouseup = () => {
                document.removeEventListener('mousemove', mousemove)
                document.removeEventListener('mouseup', mouseup)
            }

            document.addEventListener('mousemove', mousemove)
            document.addEventListener('mouseup', mouseup)
        })
        $input.addEventListener('input', e => {
            const val = parseInt(e.target.value) || 0
            this.setValue(val)
        })
        $input.addEventListener('blur', e => {
            if (this.eqxPage) {
                this.photoHistory.history.insert(JSON.parse(JSON.stringify(this.eqxPage.pageJson.elements)), null, this.historyType.text, false)
            }
        })
    },
    methods: {
        view2model(val) {
            if (this.modelKey === 'transform') {
                val = `rotateZ(${val}deg)`
            } else if (['shadow', 'stroke', 'shake', 'dropShadow'].includes(this.modelKey)) {
                val = Object.assign(
                    this.model[this.modelKey],
                    { [this.modelKeyType]: val }
                )
            } else if (this.modelKey === 'cube') {
                val = [Object.assign(
                    this.model[this.modelKey][0],
                    { [this.modelKeyType]: val }
                )]
            } else if (this.unitView === '%') {
                val = this.reverse
                    ? Number((1 - val / 100).toFixed(2))
                    : Number((val / 100).toFixed(2))
            } else if (this.unit) {
                val = val + this.unit
            }
            return val
        },
        model2view(val) {
            if (this.modelKey === 'transform') {
                val = /rotateZ?\((.*)deg\)/.exec(val)[1]
            } else if (['shadow', 'stroke', 'shake', 'dropShadow'].includes(this.modelKey)) {
                if (val) {
                    val = val[this.modelKeyType]
                }
            } else if (this.modelKey === 'cube' && this.modelKeyType === 'size') {
                val = val ? val[0][this.modelKeyType] : ''
            } else if (this.unitView === '%') {
                val = this.reverse
                    ? parseInt(100 - val * 100)
                    : parseInt(val * 100)
            } else {
                val = parseInt(val)
            }
            return val
        },
        setValue(val) {
            const { min, max } = this
            if (val < min) {
                val = min
            } else if (val > max) {
                val = max
            }
            const modelValue = this.view2model(val)
            this.model[this.modelKey] = modelValue
            this.$refs.input.value = this.model2view(modelValue)
        }
    }
}
</script>

<style lang="scss">
.eqc-base-input {
    position: relative;
    font-size: 12px;
    background: #fff;
    input {
        width: 100%;
        height: 30px;
        padding: 0 18px 0 6px;
        line-height: 28px;
        color: #2f3c4d;
        border: 1px solid #ccd5db;
        background: transparent;
        cursor: col-resize;
    }
    .unit {
        position: absolute;
        right: 4px;
        top: 0;
        width: 20px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        color: #ccd5db;
        pointer-events: none;
    }
}
</style>
