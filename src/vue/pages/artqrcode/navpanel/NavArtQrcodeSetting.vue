<template>
    <div class="eqc-nav-artqrcode-setting">
        <nav-panel-builder
            ref="qrcodeBuilder"
            :status-out="201"
            :qrcode-key-out="qrcodeKeyOut"
            :qrcode-key-str-out="qrcodeKeyStrOut"
            class="builder"
        />
        <div
            class="create-setting"
        >
            <!-- <button
                class="complete"
                @click="complete(null)"
            >完成</button> -->
        </div>
    </div>
</template>

<script>
import NavPanelBuilder from './panel/NavPanelBuilder.vue'
import statistic from '../../../../config/statistic'

export default {
    components: {
        NavPanelBuilder
    },
    props: {
        item: {
            type: Object,
            default: null
        },
        mode: {
            type: Number,
            default: null
        },
        close: {
            type: Function,
            default: null
        },
        qrcodeKeyOut: {
            type: String,
            default: null
        },
        qrcodeKeyStrOut: {
            type: String,
            default: null
        },
        qrcodeTextOut: {
            type: String,
            default: null
        },
        qrcodeElementOut: {
            type: Object,
            default: null
        },
        qrcodeCompleteOut: {
            type: Function,
            default: null
        }
    },
    data() {
        return {
        }
    },
    computed: {
        qrcode() {
            return Vue.store.state.artQrcode
        },
        nav() {
            return this.qrcode.qrcodeNav
        },
        // 当前左侧选中的二维码的类型
        selectedItem() {
            return this.nav.selectedItem
        },
        qrcodeTemplateUse() {
            return this.qrcode.qrcodeTemplateUse
        }
    },
    created() {

    },
    methods: {
        complete() {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.ARTQRCODE,
                statistic.opt_label.ARTQRCODE.complete])
            if (this.qrcodeTemplateUse === null) {
                this.close()
            } else {
                this.qrcodeElementOut.elementJson.css.borderWidth = this.qrcodeTemplateUse.elementJson.css.borderWidth
                this.qrcodeElementOut.elementJson.property.isArt = true
                this.qrcodeElementOut.elementJson.property.art = this.qrcodeTemplateUse.elementJson.property.art
                this.qrcodeElementOut.elementJson.property.src = this.selectedItem.qrcodeKey
                this.qrcodeElementOut.elementJson.property.cover = this.selectedItem.qrcodeKey
                this.qrcodeElementOut.updateProperty()
                this.qrcodeCompleteOut()
                this.close()
            }
        },
        // 生成二维码
        createQrcode(pStyle) {
            this.$refs.qrcodeBuilder.create(this.qrcodeTextOut, pStyle)
        },
        // 清除样式
        clear() {
            this.applyStyle = null
            this.$refs.qrcodeBuilder.setStatus()
        }
    }
}
</script>

<style lang="scss">
.eqc-nav-artqrcode-setting {
    .art-qrcode-title {
        width: 100%;
        height: 20px;
        font-size: 14px;
        font-weight: 600;
        color: rgba(17, 17, 17, 1);
        line-height: 20px;
        :nth-child(2) {
            font-size: 14px;
            font-weight: 400;
            color: rgba(118, 131, 143, 1);
            float: right;
            cursor: pointer;
        }
    }
    .create-setting {
        margin-top: 16px;
        width: 100%;
        height: 100%;
        position: relative;
        button.complete {
            width: 100%;
            height: 36px;
            background: rgba(21, 147, 255, 1);
            border-radius: 3px;
            display: block;
            text-align: center;
            line-height: 36px;
            color: #fff;
            font-size: 14px;
            cursor: pointer;
            position: relative;
            margin-top: 16px;
        }
    }
}
</style>
