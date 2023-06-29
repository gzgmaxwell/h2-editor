<template>
    <div class="eqc-nav-artqrcode-card">
        <div class="header">
            <span class="title">名片</span>
            <nav-panel-tools
                :data="{type:'card'}"
                :clear="clear"
            />
        </div>
        <div class="code-area">
            <nav-panel-builder
                ref="qrcodeBuilder"
                :mode="mode"
                :status-out="showBuilderQrcode() ? 201 : 100"
                :qrcode-key-out="showBuilderQrcode() ? qrcodeKeyOut : null"
                :qrcode-key-str-out="showBuilderQrcode() ? qrcodeKeyStrOut : null"
                class="builder"
            />
        </div>
        <div class="wrapper">
            <label
                for="name"
                class="title"
            >姓名</label>
            <span
                v-if="nameErr"
                class="err-info"
            >姓名不能为空</span>
            <input
                id="name"
                v-model="name"
                :class="{err:nameErr}"
                placeholder="请输入姓名"
                type="text"
                @blur="inputCheck('name')"
            >
        </div>
        <div class="wrapper">
            <label
                for="phone"
                class="title"
            >手机号</label>
            <span
                v-if="phoneErr"
                class="err-info"
            >手机号不能为空</span>
            <input
                id="phone"
                v-model="phone"
                :class="{err:phoneErr}"
                placeholder="请输入手机号"
                type="number"
                @blur="inputCheck('phone')"
            >
        </div>
        <div class="footer">
            <base-button
                :class="{disable:!buttonState}"
                :style="{background:buttonState?'#1593ff':'#CCD5DB',color:'white'}"
                class="blue w268 h36"
                @click.native="getCode"
            >
                生成
            </base-button>
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
            name: null,
            phone: null,
            nameErr: false,
            phoneErr: false,
            content: '',
            buttonState: false // false 表示禁用 true 表示可以提交
        }
    },
    computed: {

    },
    watch: {

    },
    created() {
        if (this.mode === this.artQrcodeMode.setting &&
            this.qrcodeElementOut.elementJson.property.qcType !== qrcodeType.card) {
            return
        }
        if (this.qrcodeTextOut !== null && this.qrcodeTextOut !== '') {
            this.name = this.qrcodeElementOut.elementJson.property.card.name
            this.phone = this.qrcodeElementOut.elementJson.property.card.phone
            this.content = this.qrcodeElementOut.elementJson.property.text
        }
    },
    methods: {
        showBuilderQrcode() {
            return this.mode === this.artQrcodeMode.setting && this.qrcodeElementOut.elementJson.property.qcType === qrcodeType.card
        },
        // 生成二维码
        getCode() {
            // 生成二维码
            this.createQrcode(null)
        },
        // 校验输入是不是合法
        inputCheck(type) {
            if (!this[type]) {
                this[`${type}Err`] = true
            } else {
                this[`${type}Err`] = false
            }
            if (this.name && this.phone) {
                this.buttonState = true
            } else {
                this.buttonState = false
            }
        },
        // 生成二维码
        createQrcode(pStyle) {
            if (pStyle && !this.content) {
                this.notifier.warn('请先生成普通二维码')
                return
            }
            // 如果样式参数不为空则保存
            if (pStyle !== null) {
                this.applyStyle = pStyle
            }
            this.content = 'BEGIN:VCARD   \r\nFN:' + this.name + ' \r\nTEL;CELL;VOICE:' + this.phone + ' \r\nEND:VCARD'
            this.$refs.qrcodeBuilder.create(this.content, this.applyStyle)
        },
        // 清除样式
        clear() {
            this.applyStyle = null
            this.content = ''
            this.name = ''
            this.phone = ''
            this.$refs.qrcodeBuilder.setStatus()
        }
    }
}
</script>

<style lang="scss">
.eqc-nav-artqrcode-card {
    // padding: 19px 24px;
    font-size: 14px;

    .header {
        display: flex;
        justify-content: space-between;
        line-height: 20px;
        .info {
            font-weight: 400;
            color: #76838f;
            cursor: pointer;
        }
    }
    .title {
        font-weight: 600;
        color: #111;
    }
    .code-area {
        width: 268px;
        height: 268px;
        margin-top: 21px;
    }
    .wrapper {
        margin: 16px 0;
        position: relative;
        label {
            display: inline-block;
            margin-bottom: 8px;
        }
        .err-info {
            float: right;
            font-size: 13px;
            color: #ff4b4b;
        }
        input {
            border: 1px solid #ccd5db;
            border-radius: 3px;
            width: 268px;
            height: 36px;
            padding: 9px 12px;
            background: white;
            font-size: 14px;
            color: rgb(79, 93, 105);
            &.err {
                border: 1px solid #ff4b4b;
            }
        }
    }
}
</style>
