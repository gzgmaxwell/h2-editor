<template>
    <div class="eqc-nav-artqrcode-link">
        <div class="art-qrcode-title">
            <label>链接</label>
            <nav-panel-tools
                :data="{type:'link'}"
                :clear="clear"
            />
        </div>
        <nav-panel-builder
            ref="qrcodeBuilder"
            :mode="mode"
            :status-out="showBuilderQrcode() ? 201 : 100"
            :qrcode-key-out="showBuilderQrcode() ? qrcodeKeyOut : null"
            :qrcode-key-str-out="showBuilderQrcode() ? qrcodeKeyStrOut : null"
            class="builder"
        />
        <div
            class="create-setting"
        >
            <input
                v-model="inputContent"
                maxlength="150"
                type="text"
                placeholder="请先输入连接，如：www.eqxiu.com"
                class="content"
            >
            <button
                :class="getCreateButtonClass"
                @click="createQrcodeClick(null)"
            >
                生成
            </button>
        </div>
    </div>
</template>

<script>
import artQrcodeMode from '../../../../config/enum.artQrcodeMode.type'
import NavPanelBuilder from './panel/NavPanelBuilder.vue'
import NavPanelTools from './panel/NavPanelTools.vue'
import qrcodeType from '../../../../config/enum.qrcode.type'

export default {
    components: {
        NavPanelBuilder,
        NavPanelTools
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
            artQrcodeMode,
            inputContent: '', // 输入内容
            applyContent: '', // 应用内容
            applyStyle: null // 当前样式
        }
    },
    computed: {
        getCreateButtonClass() {
            if (this.inputContent !== '') {
                return 'create is-enable'
            } else {
                return 'create is-disable'
            }
        }
    },
    created() {
        if (this.mode === this.artQrcodeMode.setting &&
            this.qrcodeElementOut.elementJson.property.qcType !== qrcodeType.link) {
            return
        }
        if (this.qrcodeTextOut !== null && this.qrcodeTextOut !== '') {
            this.inputContent = this.qrcodeTextOut
            this.applyContent = this.qrcodeTextOut
        }
    },
    methods: {
        showBuilderQrcode() {
            return this.mode === this.artQrcodeMode.setting && this.qrcodeElementOut.elementJson.property.qcType === qrcodeType.link
        },
        createQrcodeClick() {
            if (this.inputContent === '') {
                this.notifier.warn('请输入二维码内容')
                return
            }
            // 格式化链接内容
            this.inputContent = this.formatUrl(this.inputContent)
            // 将当前的值保存下来
            this.applyContent = this.inputContent
            // 生成二维码
            this.createQrcode(null)
        },
        // 生成二维码
        createQrcode(pStyle) {
            if (this.applyContent === '') {
                this.notifier.warn('请先生成普通二维码')
                return
            }
            // 如果样式参数不为空则保存
            if (pStyle !== null) {
                this.applyStyle = pStyle
                this.inputContent = this.applyContent
            }
            this.$refs.qrcodeBuilder.create(this.applyContent, this.applyStyle)
        },
        formatUrl(url) {
            return /https?:/.test(url) ? url : 'http://' + url
        },
        // 清除样式
        clear() {
            this.applyStyle = null
            this.applyContent = ''
            this.inputContent = ''
            this.$refs.qrcodeBuilder.setStatus()
        }
    }
}
</script>

<style lang="scss">
.eqc-nav-artqrcode-link {
    .art-qrcode-title {
        width: 100%;
        height: 20px;
        font-size: 14px;
        font-weight: 600;
        color: rgba(17, 17, 17, 1);
        line-height: 20px;
        :nth-child(2) {
            float: right;
        }
    }
    .builder {
        margin-top: 21px;
    }
    .create-setting {
        margin-top: 16px;
        width: 100%;
        height: 100%;
        input.content {
            width: 100%;
            height: 36px;
            background: rgba(255, 255, 255, 1);
            border-radius: 3px;
            border: 1px solid rgba(204, 213, 219, 1);
            padding: 0px 12px;
        }
        button.create {
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
            &.is-disable {
                background: rgba(204, 213, 219, 1);
                color: rgba(255, 255, 255, 1);
            }
        }
    }
}
</style>
