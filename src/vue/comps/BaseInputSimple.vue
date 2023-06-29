<template>
    <div
        class="eqc-base-input"
    >
        <input
            ref="input"
            :value="val"
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
        change: {
            type: Function,
            default: () => {}
        }
    },
    data() {
        return {
            val: 0,
            minVal: -9999,
            maxVal: 9999
        }
    },
    mounted() {
        const _self = this
        const { step } = this
        const $input = this.$refs.input

        $input.addEventListener('mousedown', e => {
            const initX = e.pageX
            const initValue = parseInt(e.target.value)

            const mousemove = e => {
                const moveX = e.pageX - initX
                const val = initValue + moveX * step
                if (val >= _self.minVal && val <= _self.maxVal) {
                    // _self.change(val)
                    // _self.setValue(val)
                }
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
            if (val >= _self.minVal && val <= _self.maxVal) {
                // _self.change(val)
                // _self.setValue(val)
            }
        })
        $input.addEventListener('blur', e => {
            const val = parseInt(e.target.value) || 0
            if (val >= _self.minVal && val <= _self.maxVal) {
                _self.change(val)
                _self.setValue(val)
            }
        })
        $input.addEventListener('keydown', e => {
            if (e.keyCode === 13) {
                const val = parseInt(e.target.value) || 0
                if (val >= _self.minVal && val <= _self.maxVal) {
                    _self.change(val)
                    _self.setValue(val)
                }
            }
        })
    },
    methods: {
        setValue(pVal) {
            this.val = pVal
        },
        setValueRange(pMin, pMax) {
            this.minVal = pMin
            this.maxVal = pMax
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
        cursor: text;
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
