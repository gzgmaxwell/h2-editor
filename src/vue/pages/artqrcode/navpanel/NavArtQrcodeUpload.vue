<template>
    <div
        class="eqc-nav-artqrcode-upload"
        @click="closeQrcode"
    >
        <div class="head">
            <p class="title">
                上传
            </p>
            <nav-panel-tools
                :data="{type:'upload'}"
                :clear="clear"
            />
        </div>
        <div
            v-show="isShowUpload"
            class="create-upload"
        >
            <div class="upload-pc">
                <upload-pc
                    v-bind="uploadOptions"
                    :show-icon="true"
                    :css="pcBtnCss"
                    :hover-css="pcBtnHoverCss"
                />
            </div>
            <div class="upload-phone">
                <upload-mobile
                    ref="mobileUploadBtn"
                    :show-icon="true"
                    :css="phoneBtnCss"
                    :hover-css="phoneBtnHoverCss"
                    use-type="qrcode"
                />
            </div>
            <div class="upload-keyboard">
                <i class="icon eqf-print-l" />
                <span class="text">粘贴上传</span>
            </div>
            <div class="upload-tips">
                <p>1、图片中包含清晰的二维码</p>
                <p>2、仅支持jpg、png格式，小于5M </p>
                <p>3、可截图粘贴（control+c,control+v）上传</p>
            </div>
        </div>
        <div
            v-show="isShowResult"
            class="create-result"
        >
            <div class="builder">
                <nav-panel-builder
                    ref="qrcodeBuilder"
                />
            </div>
            <div
                class="redo"
                @click="redo"
            >
                重新上传
            </div>
        </div>
    </div>
</template>

<script>
import uploadPc from '../../create/nav/upload/UploadPc.vue'
import UploadMobile from '../../create/nav/upload/UploadMobile.vue'
import uploadDrag from '../../create/index/uploadDrag'
import artQrcodeMode from '../../../../config/enum.artQrcodeMode.type'
import NavPanelBuilder from './panel/NavPanelBuilder.vue'
import NavPanelTools from './panel/NavPanelTools.vue'

export default {
    components: {
        uploadPc,
        UploadMobile,
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
            created: false, // 是否已经生成二维码
            inputContent: '', // 输入内容
            applyContent: '', // 应用内容
            applyStyle: null, // 当前样式
            pcBtnCss: {
                width: '268px',
                height: '36px',
                fontSize: '13px',
                background: '#FFFFFF',
                color: '#2F3C4D',
                border: '1px solid #CCD5DB'
            },
            pcBtnHoverCss: {
                width: '268px',
                height: '36px',
                fontSize: '13px',
                background: '#1593ff',
                color: '#FFFFFF',
                border: '1px solid #CCD5DB'
            },
            phoneBtnCss: {
                width: '268px',
                height: '36px',
                fontSize: '13px',
                background: '#FFFFFF',
                color: '#2F3C4D',
                border: '1px solid #CCD5DB',
                margin: 0
            },
            phoneBtnHoverCss: {
                width: '268px',
                height: '36px',
                fontSize: '13px',
                background: '#1593ff',
                color: '#FFFFFF',
                border: '1px solid #CCD5DB',
                margin: 0
            }
        }
    },
    computed: {
        qrcode() {
            return Vue.store.state.artQrcode
        },
        qrcodeNav() {
            return this.qrcode.qrcodeNav
        },
        uploadByPhoneAndKeyboard() {
            return this.qrcode.uploadByPhoneAndKeyboard
        },
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        uploadOptions() {
            return {
                type: 'customUploadQrcode',
                onComplete: this.onCustomQrcodeComplete
            }
        },
        isShowUpload() {
            return !this.created && this.mode !== artQrcodeMode.setting
        },
        isShowResult() {
            return this.created || this.mode === artQrcodeMode.setting
        }
    },
    watch: {
        'uploadByPhoneAndKeyboard.random': {
            handler() {
                if (this.uploadByPhoneAndKeyboard.type === 'phone') {
                    // 获取我的上传第一张图片key
                    this.$refs.mobileUploadBtn.switchQrcode()
                    this.getCustomQrcodeList()
                } else if (this.uploadByPhoneAndKeyboard.type === 'keyboard') {
                    const url = Vue.env.host.file + this.uploadByPhoneAndKeyboard.key
                    this.decodeQrcodeImage(url)
                }
            }
        },
        'qrcodeNav.selectedItem': {
            handler(newVal) {
                if (newVal.type === 'upload') {
                    // 建立监听
                    this.setUploadListen(true)
                } else {
                    // 删除监听
                    this.setUploadListen(false)
                    const $mob = this.$refs.mobileUploadBtn
                    if ($mob.isShowQRcode) {
                        $mob.switchQrcode()
                    }
                }
            }
        }
    },
    created() {
        if (this.qrcodeTextOut !== null && this.qrcodeTextOut !== '') {
            this.inputContent = this.qrcodeTextOut
        }
    },
    mounted() {
        if (this.qrcodeNav.selectedItem.type === 'upload') {
            // 建立监听
            this.setUploadListen(true)
        } else {
            // 删除监听
            this.setUploadListen(false)
        }
    },
    destroyed() {
        uploadDrag.unbind()
    },
    methods: {
        closeQrcode() {
            const $mob = this.$refs.mobileUploadBtn
            if ($mob.isShowQRcode) {
                $mob.switchQrcode()
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
            this.$refs.qrcodeBuilder.create(this.applyContent, this.applyStyle)
            this.created = true
        },
        // 电脑上传二维码图片完成
        onCustomQrcodeComplete(tagIdAll, data) {
            setTimeout(() => {
                const { key } = data
                const url = Vue.env.host.file + key
                this.decodeQrcodeImage(url)
            }, 300)
        },
        // 获取我的上传列表第一张图（手机上传成功后）
        getCustomQrcodeList() {
            Vue.api.file.getUploadFiles({ pageNo: 1, pageSize: 5, tagId: -1 }).then(res => {
                if (res.data && res.data.list && res.data.list.length > 0) {
                    Vue.notifier.success('上传成功')
                    const url = Vue.env.host.file + res.data.list[0].path
                    this.decodeQrcodeImage(url)
                } else {
                    Vue.notifier.fail('上传失败')
                }
            })
        },
        setUploadListen(bind) {
            if (this.userInfo.id) {
                if (bind) {
                    uploadDrag.bind(this.$el, { value: { upload: null, artqrcode: true } })
                } else {
                    uploadDrag.unbind()
                }
            }
        },
        showUploadResult(qrcontent) {
            this.inputContent = qrcontent
            // 将当前的值保存下来
            this.applyContent = this.inputContent
            this.createQrcode(null)
        },
        // 识别二维码内容
        decodeQrcodeImage(filePath) {
            if (filePath) {
                this.loading.open('正在识别二维码')
                Vue.api.file.qrcodeReader(filePath).then((res) => {
                    if (res.data && res.data.success) {
                        this.showUploadResult(res.data.obj)
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
        // 重新上传
        redo() {
            this.created = false
            this.inputContent = ''
            this.applyContent = ''
            this.applyStyle = null
        },
        // 清除样式
        clear() {
            this.applyStyle = null
            this.applyContent = ''
            this.redo()
            this.$refs.qrcodeBuilder.setStatus()
        }
    }
}
</script>

<style lang="scss">
$buttonHeight: 40px;
.eqc-nav-artqrcode-upload {
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
    .create-upload {
        > div {
            margin-bottom: 16px;
        }
        input {
            display: none;
        }

        .upload-keyboard {
            width: 268px;
            height: 268px;
            background: rgba(255, 255, 255, 1);
            border-radius: 3px;
            border: 1px dashed rgba(204, 213, 219, 1);
            color: #9099a4;
            font-size: 13px;
            line-height: 268px;
            text-align: center;
            .icon {
                margin: 4px 4px 0 0;
            }
        }
        .upload-tips {
            width: 268px;
            height: 54px;
            font-size: 13px;
            color: rgba(102, 102, 102, 1);
            line-height: 18px;
        }
    }
    .create-result {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        // padding: 2px;
        .builder {
            width: 268px;
            height: 268px;
        }
        .redo {
            width: 268px;
            height: 36px;
            background: rgba(255, 255, 255, 1);
            border-radius: 3px;
            border: 1px solid rgba(204, 213, 219, 1);
            margin-top: 16px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 400;
            color: rgba(47, 60, 77, 1);
            text-align: center;
            line-height: 36px;
            &:hover {
                background: rgba(21, 147, 255, 1);
                color: #ffffff;
            }
        }
    }
}
</style>
