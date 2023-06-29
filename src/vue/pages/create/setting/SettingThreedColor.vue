<template>
    <div
        class="eqc-setting-color"
        @mousedown.stop
        @click="showColorPanel"
    >
        <div
            :style="{backgroundColor: backgroundColor}"
            :class="{border:showBorder}"
            class="color"
        />
    </div>
</template>

<script>

import color from '../../../../utils/color'

export default {
    props: {
        eqxElement: {
            type: Object,
            default: null
        },
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
        showBorder: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            clientHeight: document.documentElement.clientHeight || document.body.clientHeight
        }
    },

    computed: {
        backgroundColor() {
            let val = ''
            switch (this.modelKey) {
                case 'textGradient':
                    val = this.model[this.modelKey]
                        ? this.model[this.modelKey].colors[this.modelKeyType]
                        : '#ffffff'
                    break
                default : val = this.model[this.modelKey]
            }
            return val
        }
    },
    watch: {
        model: {
            handler(newVal) {
                if (['textColor', 'textShadowColor'].includes(this.modelKey) && newVal[this.modelKey].indexOf('rgb') === 0) {
                    const rgba = newVal[this.modelKey].match(/(\d(\.\d+)?)+/g)
                    this.model[this.modelKey] = color.rgb2hex({
                        r: rgba[0],
                        g: rgba[1],
                        b: rgba[2]
                    })
                    this.eqxElement.updateColor(newVal)
                } else if (this.modelKey === 'textGradient') {
                    newVal.textGradient.change = true
                }
            },
            deep: true
        }
    },
    methods: {
        showColorPanel(e) {
            document.addEventListener('mousedown', this.hideColorPanel)
            let model, modelKey
            switch (this.modelKey) {
                case 'textGradient':
                    model = this.model[this.modelKey].colors
                    modelKey = this.modelKeyType
                    break
                default :
                    model = this.model
                    modelKey = this.modelKey
            }
            const maxTop = this.clientHeight - 338
            let top = e.pageY
            if (top >= maxTop) {
                top = maxTop
            }
            this.colorPicker.open(model, modelKey, { right: '184px', top: top + 'px' })
        },
        hideColorPanel() {
            if (!this.colorPicker.getState().isOpenSucker) {
                this.colorPicker.close()
                document.removeEventListener('mousedown', this.hideColorPanel)
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-setting-color {
    position: relative;
    width: 100%;
    height: 30px;
    // padding-right: 28px;
    border: 1px solid #ccd5db;
    background: url("../../../../img/opacity.png") center;
    cursor: pointer;
    .border {
        border: 2px solid #1593ff !important;
    }
    .color {
        height: 100%;
    }
}
</style>
