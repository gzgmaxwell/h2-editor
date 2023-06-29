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
        }
    },
    computed: {
        value() {
            return this.model2view(this.model[this.modelKey])
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
                this.applyValue()
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
        })
    },
    methods: {
        view2model(val) {
            val = val + this.unit
            return val
        },
        model2view(val) {
            val = parseInt(val)
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
            this.$refs.input.value = this.model2view(modelValue)
        },
        applyValue() {
            if (['size', 'offsetX', 'offsetY'].includes(this.modelKey)) {
                this.model.changeTexture = true
            } else {
                this.model.change = true
            }
            this.model.modelKey = this.modelKey
            this.model[this.modelKey] = parseInt(this.view2model(this.$refs.input.value))
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
