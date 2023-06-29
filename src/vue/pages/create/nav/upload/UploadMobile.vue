<template>
    <div class="eqc-image-upload-mobile">
        <base-button
            v-if="isInit"
            :style="showHovsrCss ? hoverCss : css"
            class="eqc-btn blue h36"
            @click.native="switchQrcode($event)"
            @mouseover.native="showHovsrCss = true"
            @mouseleave.native="showHovsrCss = false"
        >
            <i
                v-if="showIcon"
                class="icon eqf-phone-l"
            />
            {{ closeUpload ? '关闭上传':'手机上传' }}
        </base-button>
        <div
            v-show="!['qrcode','background'].includes(useType) || isShowQRcode"
            ref="qrcode"
            :style="qrcodeCss"
            :class="{qrcodeBottom:useType === 'qrcode',backgroundBottom:useType === 'background'}"
            class="qrcode"
        >
            <span
                ref="qrcodeTip"
                :class="{text2:useType === 'qrcode'}"
                class="text-1"
            >{{ useType === 'qrcode' ? '-- 手机扫描二维码上传 --':'微信“扫一扫”上传手机图片' }}</span>
            <i
                v-if="useType !== 'qrcode'"
                class="close eqf-no"
                @click="switchQrcode"
            />
        </div>
    </div>
</template>

<script>
import delayLoad from '../../../../../utils/delayLoad'
import util from '../../../../../utils/util'
import websocket from '../../index/websocket'

export default {
    props: {
        css: {
            type: Object,
            default: null
        },
        hoverCss: {
            type: Object,
            default: null
        },
        qrcodeCss: {
            type: Object,
            default: null
        },
        showIcon: {
            type: Boolean,
            default: false
        },
        useType: {
            type: String,
            default: ''
        },
        category: {
            type: String,
            default: 'h2'
        }
    },
    data() {
        return {
            isInit: false,
            isShowQRcode: false,
            showHovsrCss: false,
            uuid: '', // 手机上传需要的uuid
            uploadAuthCode: '' // 手机上传需要的安全验证code
        }
    },
    computed: {
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        layout() {
            return Vue.store.state.layout
        },
        nav() {
            return this.layout.nav
        },
        navType() {
            return this.nav.selectedItem.type
        },
        showUploadQrcode() {
            return this.layout.uploadQrcode.show
        },
        closeUpload() {
            return ['qrcode', 'background'].includes(this.useType) ? this.isShowQRcode : this.showUploadQrcode
        },
        tcloud() {
            return Vue.store.state.tcloud
        },
        puzzle() {
            return Vue.store.state.puzzle
        }
    },
    watch: {
        navType: {
            handler(newVal) {
                if (newVal !== 'upload' && this.closeUpload) {
                    this.switchQrcode()
                }
                if (newVal !== 'background' && this.useType === 'background' && this.closeUpload) {
                    this.switchQrcode()
                }
            }
        }
    },
    created() {
        delayLoad.delayLoadJS(this.env.plugin.jquery)
            .then(() => delayLoad.delayLoadJS(this.env.plugin.qrcode))
            .then(() => {
                this.isInit = true
            })
            .catch(err => err && this.logger.error(err))
    },
    methods: {
        showQrcode() {
            this.renderQrcode()
            if (this.useType === 'qrcode' || this.useType === 'background') {
                this.isShowQRcode = true
            } else {
                Vue.store.commit('LAYOUT_NAV_UPLOAD_QRCODE', { show: true })
            }
        },
        hideQrcode() {
            if (this.useType === 'qrcode' || this.useType === 'background') {
                this.isShowQRcode = false
            } else {
                Vue.store.commit('LAYOUT_NAV_UPLOAD_QRCODE', { show: false })
            }
        },
        renderQrcode() {
            let fileLimit = 10
            if (Vue.store.state.user.userInfo.rights && Vue.store.state.user.userInfo.rights.uploadLimit) {
                fileLimit = Vue.store.state.user.userInfo.rights.uploadLimit
            }
            let num = 10
            if (this.useType === 'qrcode') {
                fileLimit = 5
                num = 1
            } else if (this.useType === 'background') {
                num = 1
            } else if (this.useType === 'tcloud') {
                num = 1
                fileLimit = 2
            }

            const textStr = `${this.env.host.client}/h2/upload.html?code=${this.uploadAuthCode}&p=h2&uuid=${this.uuid}&fl=${fileLimit}&num=${num}`
            const $image = window.$('<div>').qrcode({
                render: 'image',
                ecLevel: 'H',
                text: textStr,
                size: this.useType === 'qrcode' ? 228 : 160,
                background: '#fff'
            }).children().get(0)
            $image.classList.add('qrcode-image')
            this.$refs.qrcode.querySelectorAll('.qrcode-image').forEach(dom => dom.remove())
            if (this.useType === 'qrcode') {
                this.$refs.qrcode.insertBefore($image, this.$refs.qrcodeTip)
            } else {
                this.$refs.qrcode.appendChild($image)
            }
        },
        switchQrcode(event) {
            event && event.stopPropagation()
            if (['qrcode', 'background'].includes(this.useType)) {
                if (this.isShowQRcode) {
                    this.unbindWebsoket()
                    this.hideQrcode()
                } else {
                    this.bindWebsoket().then(() => {
                        this.showQrcode()
                    })
                }
            } else {
                if (this.showUploadQrcode) {
                    this.unbindWebsoket()
                    this.hideQrcode()
                } else {
                    this.bindWebsoket().then(() => {
                        this.showQrcode()
                    })
                }
            }
        },
        bindWebsoket() {
            return new Promise((resolve, reject) => {
                this.getUploadCode().then(res => {
                    this.uploadAuthCode = res
                    const uuid = util.getUUID()
                    this.uuid = uuid
                    if (this.useType === 'qrcode') {
                        websocket.bind(this.$el, { value: { artqrcode: true, uuid } })
                    } else if (this.useType === 'background') {
                        websocket.bind(this.$el, { value: { background: true, uuid } })
                    } else if (this.useType === 'tcloud') {
                        websocket.bind(this.$el, { value: { tcloud: this.tcloud.nav.list[1], uuid } })
                    } else if (this.useType === 'puzzle') {
                        websocket.bind(this.$el, { value: { puzzle: this.puzzle.nav.list[2], uuid } })
                    } else {
                        websocket.bind(this.$el, { value: { upload: this.nav.list[5], uuid } })
                    }
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
        closeQrcode() {
            this.unbindWebsoket()
            this.hideQrcode()
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
.eqc-image-upload-mobile {
    position: relative;
    // margin: 0 16px;
    .eqc-btn {
        width: 88px;
        font-size: 12px;
        cursor: pointer;
        margin: 0 16px;
    }
    .qrcode {
        position: absolute;
        bottom: 82px;
        right: -64px;
        width: 288px;
        height: 288px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        font-size: 12px;
        border-top: 1px solid #ccd5db;
        background: #fff;
        .text-1 {
            margin-bottom: 10px;
        }
        .text-2 {
            margin-top: 10px;
        }
        .close {
            position: absolute;
            top: 16px;
            right: 16px;
            font-size: 16px;
        }
    }
    .qrcodeBottom {
        border-top: 0;
        box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.16);
        width: 268px;
        height: 306px;
        top: 48px;
        left: 0px;
    }
    .backgroundBottom {
        width: 288px;
        height: 306px;
        top: -315px;
        left: -98px;
    }
    .text2 {
        margin-top: 20px;
        font-size: 13px;
        line-height: 18px;
        margin-bottom: 0 !important;
    }
    .icon {
        margin: 0 4px 0 0;
    }
}
</style>
