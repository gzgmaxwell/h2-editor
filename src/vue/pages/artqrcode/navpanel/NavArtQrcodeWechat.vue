<template>
    <div class="eqc-nav-artqrcode-wechat">
        <div class="head">
            <p class="title">
                微信公众号
            </p>
            <nav-panel-tools
                :data="{type:'wechat'}"
                :clear="clear"
            />
        </div>
        <div
            class="create-result"
        >
            <div class="builder">
                <nav-panel-builder
                    ref="qrcodeBuilder"
                    :mode="mode"
                    :status-out="showBuilderQrcode() ? 201 : 100"
                    :qrcode-key-out="showBuilderQrcode() ? qrcodeKeyOut : null"
                    :qrcode-key-str-out="showBuilderQrcode() ? qrcodeKeyStrOut : null"
                />
            </div>
        </div>
        <div
            class="create-wechat"
        >
            <input
                v-model.trim="text"
                :class="[{error: showTip}]"
                type="text"
                placeholder="请输入公众号微信号，如：eqshow"
                @keydown.enter="ok(true)"
            >
            <p
                v-show="showTip"
                class="tip"
            >
                请输入正确的公众号微信号，不要输入公众号名称
            </p>
            <div class="foot">
                <base-button
                    :class="{disabled:text.length === 0}"
                    class="btn ok blue h36"
                    @click.native="ok(true)"
                >
                    生成
                </base-button>
                <p
                    v-if="created"
                    class="redo-tip"
                >
                    重新生成会替换当前二维码
                </p>
            </div>
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
            text: '',
            showTip: false,
            created: false, // 是否已经生成二维码
            inputContent: '', // 输入内容
            applyContent: '', // 应用内容
            applyStyle: null, // 当前样式
            userInput: null// 用户输入的值
        }
    },
    computed: {
    },
    watch: {

    },
    created() {
        if (this.mode === this.artQrcodeMode.setting &&
            this.qrcodeElementOut.elementJson.property.qcType !== qrcodeType.wechat) {
            return
        }
        if (this.qrcodeTextOut !== null && this.qrcodeTextOut !== '') {
            this.text = this.qrcodeElementOut.elementJson.property.name
            this.userInput = this.qrcodeElementOut.elementJson.property.name
            this.inputContent = this.qrcodeTextOut
            this.applyContent = this.qrcodeTextOut
        }
    },
    mounted() {
    },
    methods: {
        showBuilderQrcode() {
            return this.mode === this.artQrcodeMode.setting && this.qrcodeElementOut.elementJson.property.qcType === qrcodeType.wechat
        },
        ok() {
            this.checkWeChatCode()
                .then((res) => {
                    this.showTip = false
                    this.decodeQrcodeImage(res, this.text)
                })
                .catch(() => {
                    this.showTip = true
                })
        },
        checkWeChatCode() {
            return new Promise((resolve, reject) => {
                const qrcodeImg = new Image()
                const url = `https://open.weixin.qq.com/qr/code?username=${this.text}`
                qrcodeImg.src = url
                qrcodeImg.onload = res => {
                    resolve(url)
                }
                qrcodeImg.onerror = err => {
                    console.log(err.type === 'error')
                    reject()
                }
            })
        },
        // 识别二维码内容
        decodeQrcodeImage(filePath, pUserInput) {
            if (filePath) {
                this.loading.open('正在识别二维码')
                Vue.api.file.qrcodeReader(filePath).then((res) => {
                    if (res.data && res.data.success) {
                        this.inputContent = res.data.obj
                        // 将当前的值保存下来
                        this.applyContent = this.inputContent
                        this.userInput = pUserInput
                        this.createQrcode(null)
                    } else {
                        Vue.notifier.fail('未能检测到二维码内容')
                    }
                    this.loading.close()
                }).catch(err => {
                    err && Vue.logger.error(err)
                    this.loading.close()
                    Vue.notifier.fail('未能检测到二维码内容')
                })
            }
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
            this.$refs.qrcodeBuilder.create(this.applyContent, this.applyStyle, this.userInput)
            this.created = true
        },
        // 清除样式
        clear() {
            this.applyStyle = null
            this.applyContent = ''
            this.text = ''
            this.$refs.qrcodeBuilder.setStatus()
        }
    }
}
</script>

<style lang="scss">
.eqc-nav-artqrcode-wechat {
    .head {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 21px;
        height: 20px;
        line-height: 20px;
        .title {
            font-size: 14px;
            font-weight: 600;
            color: rgba(17, 17, 17, 1);
        }
    }
    .create-result {
        display: flex;
        flex-direction: column;
        .builder {
            width: 268px;
            height: 268px;
        }
    }
    .create-wechat {
        margin-top: 16px;
        width: 268px;
        input {
            width: 100%;
            height: 36px;
            padding: 0 12px;
            color: #333;
            border: 1px solid #ccd5db;
            border-radius: 3px;
        }
        .error {
            border: 1px solid rgba(255, 84, 72, 1);
        }
        .tip {
            font-size: 13px;
            font-weight: 400;
            color: rgba(255, 84, 72, 1);
            line-height: 20px;
            margin-top: 8px;
        }
        .foot {
            margin-top: 16px;
            .btn {
                width: 100%;
            }
            .redo-tip {
                height: 18px;
                font-size: 13px;
                color: rgba(102, 102, 102, 1);
                line-height: 18px;
                margin-top: 8px;
            }
        }
        .disabled {
            background: rgba(204, 213, 219, 1);
            border: 1px solid rgba(204, 213, 219, 1);
            pointer-events: none;
        }
    }
}
</style>
