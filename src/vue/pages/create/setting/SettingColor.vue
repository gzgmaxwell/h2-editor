<template>
    <div
        class="eqc-setting-color"
        @mousedown.stop
        @click="showColorPanel"
    >
        <div
            :style="[{backgroundColor: backgroundColor}]"
            :class="[{border:showBorder},{ellipsis: showEllipsis}]"
            class="color"
        >
            {{ showEllipsis?'...':'' }}
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
        modelKeyType: {
            type: String,
            default: ''
        },
        showBorder: {
            type: Boolean,
            default: false
        },
        isMuti: {
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
        scene() {
            return this.$store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        showEllipsis() {
            // 多文字组件同时ctrol选中时val为’...‘
            // 显示样式
            return this.model[this.modelKey] === '...'
        },
        backgroundColor() {
            if (this.model[this.modelKey] === '...') {
                // 多文字组件同时ctrol选中时val为’...‘
                // 此时背景色设置为白色
                return '#ffffff'
            }
            let val = ''
            switch (this.modelKey) {
                case 'shake':
                case 'gradient':
                    val = this.model[this.modelKey]
                        ? this.model[this.modelKey].colors[this.modelKeyType]
                        : '#ffffff'
                    break
                case 'shadow':
                case 'stroke':
                    val = this.model[this.modelKey]
                        ? this.model[this.modelKey].color
                        : '#ffffff'
                    break
                case 'cube':
                    val = this.model[this.modelKey]
                        ? this.model[this.modelKey][0].color
                        : '#ffffff'
                    break
                case 'dropShadow':
                    val = this.model[this.modelKey]
                        ? this.model[this.modelKey].color
                        : 'rgba(0,0,0,0.2)'
                    break
                default : val = this.model[this.modelKey]
            }

            return val
        }
    },
    methods: {
        showColorPanel(e) {
            document.addEventListener('mousedown', this.hideColorPanel)
            let model = ''
            let modelKey = ''
            switch (this.modelKey) {
                case 'dropShadow':
                case 'shadow':
                case 'stroke':
                    model = this.model[this.modelKey]
                    modelKey = this.modelKeyType
                    break
                case 'gradient':
                case 'shake':
                    model = this.model[this.modelKey].colors
                    modelKey = this.modelKeyType
                    break
                case 'cube':
                    model = this.model[this.modelKey][0]
                    modelKey = 'color'
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
                this.eqxPage.eqxHistory.add(this.eqxPage)
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
        display: flex;
        align-items: center;
        padding-left: 12px;
    }
    .ellipsis {
        line-height: 28px;
        color: #2f3c4d;
        font-size: 13px;
        padding-left: 4px;
    }
}
</style>
