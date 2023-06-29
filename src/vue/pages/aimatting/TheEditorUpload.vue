<template>
    <div
        class="eqc-editor-upload"
        @click="closeMobileUpload"
    >
        <div
            v-if="isReady"
            class="inner"
        >
            <div
                v-if="closeBtn"
                class="closeUpload"
                @click="closeUpload"
            >
                <i class="eqf-no" />
            </div>
            <div class="btns">
                <div
                    v-upload="pcOptions"
                    :class="{disabled: isShowQRcode}"
                    class="btn pc"
                >
                    <i
                        :class="{'eqf-pc-l':!isPcUploading, 'eqf-loadingroll':isPcUploading, 'save-loading':isPcUploading}"
                        :style="{color: isShowQRcode ? '#CCD5DB':(isPcUploading?'#1593FF':'#2f3c4d')}"
                        class="icon"
                    />
                    <p :style="{color: isShowQRcode ? '#CCD5DB':(isPcUploading?'#1593FF':'#2f3c4d')}">
                        {{ isPcUploading ? '上传中…':'电脑上传' }}
                    </p>
                </div>
                <div
                    :class="{disabled: isPcUploading}"
                    class="btn mobile"
                    @click="switchQrcode($event)"
                >
                    <i class="icon eqf-phone-l" />
                    <p>{{ isShowQRcode ? '关闭上传':'手机上传' }}</p>
                </div>
            </div>
            <div class="tips">
                仅支持上传一张图片，格式jpg、png，图片小于{{ fileSizeLimit }}M<br>可截图直接粘贴上传
            </div>
            <div
                v-show="isShowQRcode"
                ref="qrcodeBox"
                class="qrcode-box"
            >
                <p
                    ref="qrcodeTip"
                    class="phone-tip"
                >
                    微信“扫一扫”上传手机图片
                </p>
            </div>
        </div>
        <div
            v-if="isOpenPasteConf"
            class="pasteConfirm"
        >
            <div
                class="close"
                @click="pasteConfirmStatus = 1"
            >
                <i class="eqf-no" />
            </div>
            <p class="title">
                是否粘贴图片?
            </p>
            <div class="foot">
                <base-button
                    class="btn blue h36 ok"
                    @click.native="pasteConfirmStatus = 2"
                >
                    粘贴
                </base-button>
                <base-button
                    class="btn white h36"
                    @click.native="pasteConfirmStatus = 1"
                >
                    取消
                </base-button>
            </div>
        </div>
    </div>
</template>

<script>
import delayLoad from '../../../utils/delayLoad'
import util from '../../../utils/util'
import websocket from '../create/index/websocket'
import uploadDrag from '../create/index/uploadDrag'

export default {
    props: {
        // 上传图片大小限制 默认为6M
        fileSizeLimit: {
            type: Number,
            default: 6
        },
        // 上传图片张数限制 默认为1张
        fileNumLimit: {
            type: Number,
            default: 1
        },
        // 使用编辑器类型 默认为抠图编辑器
        editorType: {
            type: String,
            default: 'aimatting'
        },
        // 剪切粘贴上传完成
        pasteUploadCompleted: {
            type: Function,
            default: null
        },
        // 手机上传完成
        mobileUploadCompleted: {
            type: Function,
            default: null
        },
        // PC上传完成
        pcUploadCompleted: {
            type: Function,
            default: null
        },
        // 关闭
        closeEditorUpload: {
            type: Function,
            default: null
        },
        closeBtn: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isPcUploading: false,
            isReady: false,
            uuid: '', // 手机上传需要的uuid
            uploadAuthCode: '', // 手机上传需要的安全验证code
            isShowQRcode: false, // 是否显示上传二维码
            pasteConfirmStatus: -1,
            isOpenPasteConf: false,
            pasteOptions: {
                editorType: this.editorType,
                fileSizeLimit: this.fileSizeLimit,
                fileNumLimit: this.fileNumLimit,
                pasteConfirm: this.pasteConfirm,
                pasteCompleted: this.pasteCompleted
            },
            mobileOptions: {
                fileSizeLimit: this.fileSizeLimit,
                fileNumLimit: this.fileNumLimit,
                uploadCompleted: this.mobileComplete
            },
            pcOptions: {
                onFilesAdded: this.onPcFilesAdded,
                onUploadComplete: this.onPcUploadComplete,
                type: this.editorType

            }
        }
    },
    computed: {
        userInfo() {
            return Vue.store.state.user.userInfo
        }
    },
    watch: {

    },
    created() {
        delayLoad.delayLoadJS(this.env.plugin.jquery)
            .then(() => delayLoad.delayLoadJS(this.env.plugin.qrcode))
            .then(() => {
                this.isReady = true
            })
            .catch(err => err && this.logger.error(err))
    },
    mounted() {
        this.setDragUploadListen(true)
    },
    destory() {
        this.setDragUploadListen(false)
    },
    methods: {
        closeUpload() {
            this.setDragUploadListen(false)
            this.unbindWebsoket()
            if (typeof this.closeEditorUpload === 'function') {
                this.closeEditorUpload()
            }
        },
        onPcFilesAdded(up, files) {
            this.isPcUploading = true
        },
        onPcUploadComplete(res) {
            this.isPcUploading = false
            if (typeof this.pcUploadCompleted === 'function') {
                this.pcUploadCompleted({ key: res.key, type: 'pc' })
            }
        },
        // 获取我的上传列表第一张图（手机上传成功后）
        getMyUploadList() {
            return new Promise((resolve, reject) => {
                Vue.api.file.getUploadFiles({ pageNo: 1, pageSize: 5, tagId: -1 }).then(res => {
                    if (res.data && res.data.list && res.data.list.length > 0) {
                        Vue.notifier.success('上传成功')
                        resolve({ key: res.data.list[0].path })
                    } else {
                        Vue.notifier.fail('上传失败')
                        reject()
                    }
                })
            })
        },
        mobileComplete(res) {
            this.closeMobileUpload()
            this.getMyUploadList().then(res => {
                if (typeof this.mobileUploadCompleted === 'function') {
                    this.mobileUploadCompleted({ key: res.key, type: 'mobile' })
                }
            })
        },
        pasteCompleted(res) {
            this.setDragUploadListen(false)
            if (typeof this.pasteUploadCompleted === 'function') {
                this.pasteUploadCompleted({ key: res.key, type: 'paste' })
            }
        },
        pasteConfirm() {
            this.isOpenPasteConf = true
            return new Promise((resolve, reject) => {
                let timer
                const check = (start) => {
                    if (start) {
                        timer = setInterval(() => {
                            if (this.pasteConfirmStatus === 2) {
                                this.isOpenPasteConf = false
                                check.call(this, false)
                                resolve(true)
                            } else if (this.pasteConfirmStatus === 1) {
                                this.isOpenPasteConf = false
                                check.call(this, false)
                                reject()
                            }
                        }, 100)
                    } else {
                        clearInterval(timer)
                        timer = null
                        this.pasteConfirmStatus = -1
                    }
                }
                check(true)
            })
        },
        setDragUploadListen(bind) {
            if (this.userInfo.id) {
                if (bind) {
                    uploadDrag.bind(this.$el, { value: { editor: this.pasteOptions } })
                } else {
                    uploadDrag.unbind()
                }
            }
        },
        closeMobileUpload() {
            if (this.isShowQRcode) {
                this.unbindWebsoket()
                this.hideQrcode()
            }
        },
        switchQrcode(event) {
            event && event.stopPropagation()
            if (this.isShowQRcode) {
                this.unbindWebsoket()
                this.hideQrcode()
            } else {
                this.bindWebsoket().then(() => {
                    this.showQrcode()
                })
            }
        },
        showQrcode() {
            this.renderQrcode()
            this.isShowQRcode = true
        },
        hideQrcode() {
            this.isShowQRcode = false
        },
        renderQrcode() {
            const textStr = `${this.env.host.client}/h2/upload.html?code=${this.uploadAuthCode}&p=h2&uuid=${this.uuid}&fl=${this.fileSizeLimit}&num=${this.fileNumLimit}`
            const $image = window.$('<div>').qrcode({
                render: 'image',
                ecLevel: 'H',
                text: textStr,
                size: 160,
                background: '#fff'
            }).children().get(0)
            $image.classList.add('qrcode-image')
            this.$refs.qrcodeBox.querySelectorAll('.qrcode-image').forEach(dom => dom.remove())
            this.$refs.qrcodeBox.insertBefore($image, this.$refs.qrcodeTip)
        },
        bindWebsoket() {
            return new Promise((resolve, reject) => {
                this.getUploadCode().then(res => {
                    this.uploadAuthCode = res
                    const uuid = util.getUUID()
                    this.uuid = uuid
                    websocket.bind(this.$el, { value: { editor: this.mobileOptions, uuid } })
                    resolve()
                }).catch(err => {
                    err && Vue.logger.error(err)
                    reject()
                })
            })
        },
        unbindWebsoket() {
            websocket.unbind()
        },
        uploadPc(event) {
            event && event.stopPropagation()
        },
        getUploadCode() {
            return new Promise((resolve, reject) => {
                Vue.api.file.getWSUploadCode().then((res) => {
                    if (res.data && res.data.obj) {
                        resolve(res.data.obj)
                    } else {
                        reject()
                    }
                }).catch(err => {
                    err && Vue.logger.error(err)
                    reject()
                })
            })
        }
    }
}
</script>

<style lang="scss">
.eqc-editor-upload {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    .inner {
        width: 440px;
        height: 200px;
        background: #fff;
        position: relative;
        box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
        &:hover {
            box-shadow: 2px 2px 30px 0px rgba(0, 0, 0, 0.16);
        }
        .closeUpload {
            width: 24px;
            height: 24px;
            position: absolute;
            right: 16px;
            top: 16px;
            text-align: center;
            line-height: 24px;
            font-size: 24px;
            cursor: pointer;
        }
        .save-loading {
            animation: rotate-infinite 3s linear infinite;
        }
        .btns {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: center;
            align-items: center;
            .disabled {
                color: #ccd5db;
                pointer-events: none;
            }
            .btn {
                width: 50%;
                height: 128px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                > p {
                    font-size: 17px;
                    font-weight: 600;
                    color: #2f3c4d;
                    line-height: 24px;
                    margin-top: 13px;
                }
                > .icon {
                    font-size: 36px;
                    color: #2f3c4d;
                }
                &:hover {
                    p,
                    i {
                        color: #1593ff !important;
                    }
                }
            }
        }
        .tips {
            font-size: 13px;
            font-weight: 400;
            color: rgba(118, 131, 143, 1);
            line-height: 18px;
            text-align: center;
            margin: 0 48px;
            border-top: 1px solid #ccd5db;
            padding-top: 11px;
        }
        .qrcode-box {
            width: 192px;
            height: 226px;
            background: #fff;
            position: absolute;
            top: -226px;
            right: 0;
            z-index: 99;
            box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
            justify-content: center;
            align-items: center;
            .phone-tip {
                margin-top: 16px;
                font-size: 13px;
                font-weight: 400;
                color: rgba(51, 51, 51, 1);
                line-height: 18px;
            }
        }
    }
    .pasteConfirm {
        width: 320px;
        height: 180px;
        background: rgba(255, 255, 255, 1);
        box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
        border-radius: 4px;
        position: absolute;
        left: calc(50% + 258px);
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
        .close {
            width: 24px;
            height: 24px;
            position: absolute;
            right: 16px;
            top: 16px;
            text-align: center;
            line-height: 24px;
            font-size: 24px;
            cursor: pointer;
        }
        .title {
            font-size: 16px;
            font-weight: 600;
            color: rgba(17, 17, 17, 1);
            line-height: 22px;
        }
        .foot {
            margin-top: 30px;
            .btn {
                width: 96px;
            }
            .ok {
                margin-right: 16px;
            }
        }
    }
}
</style>
