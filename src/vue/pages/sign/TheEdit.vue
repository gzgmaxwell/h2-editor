<template>
    <div class="eqc-sign-edit">
        <div class="wrap">
            <div class="tips">
                <p class="tip-1">
                    以下作为订阅日签的默认替换内容，请填写
                </p>
                <p class="tip-2">
                    不输入信息将在日签呈现中默认为空
                </p>
                <p class="tip-3">
                    【易企秀创意云】公众号每天7点将会为你推送日签
                </p>
                <div
                    class="more-btn"
                    @click="gotoIntro"
                >
                    <span>了解更多</span>
                    <i
                        class="eqf-right"
                        style="font-size: 20px;"
                    />
                </div>
            </div>
            <div class="edit-box">
                <div class="logo">
                    <p class="title">
                        logo
                    </p>
                    <upload v-bind="logoUploadOptions" />
                </div>
                <div class="company-name">
                    <p class="title">
                        公司/产品名称
                    </p>
                    <input
                        v-model="name"
                        type="text"
                        class="info"
                        name="company-name"
                    >
                </div>
                <div class="company-addr">
                    <p class="title">
                        地址
                    </p>
                    <input
                        v-model="address"
                        type="text"
                        class="info"
                        name="company-addr"
                    >
                </div>
                <div class="company-tel">
                    <p class="title">
                        电话
                    </p>
                    <input
                        v-model="telphone"
                        type="text"
                        class="info"
                        name="company-tel"
                    >
                </div>
                <div class="qrcode">
                    <p class="title">
                        二维码
                    </p>
                    <upload v-bind="qrcodeUploadOptions" />
                </div>
            </div>
            <div
                class="submit"
                @click="submit"
            >
                {{ !info ? '确定订阅':'保存修改' }}
            </div>
        </div>
        <image-crop
            v-if="showCrop"
            v-bind="cropOptions"
        />
    </div>
</template>

<script>
import Upload from './upload/Upload.vue'
import ImageCrop from './upload/ImageCrop.vue'

export default {
    components: {
        Upload,
        ImageCrop
    },
    props: {

    },
    data() {
        return {
            name: '',
            address: '',
            telphone: '',
            logoImage: '',
            qrcodeImage: '',
            cropImage: '' // 待裁剪的图片
        }
    },
    computed: {
        user() {
            return Vue.store.state.sign.user
        },
        info() {
            return Vue.store.state.sign.info
        },
        showCrop() {
            return Vue.store.state.sign.showCrop
        },
        logoUploadOptions() {
            return {
                type: 'sign',
                onDelete: this.onDeleteLogo,
                onComplete: this.onCompleteLogo,
                previewImage: this.logoImage
            }
        },
        qrcodeUploadOptions() {
            return {
                type: 'sign',
                onDelete: this.onDeleteQrcode,
                onComplete: this.onCompleteQrcode,
                previewImage: this.qrcodeImage
            }
        },
        cropOptions() {
            return {
                data: {
                    src: this.cropImage
                },
                onComplete: this.onCompleteCropImage
            }
        }
    },
    created() {
        if (this.info) {
            this.name = this.info.name
            this.address = this.info.address
            this.telphone = this.info.telphone
            this.qrcodeImage = this.info.qrcode
            this.logoImage = this.info.logo
        }
    },
    methods: {
        createSubscribe() {
            if (this.name.indexOf('<script>') > -1 || this.address.indexOf('<script>') > -1 || this.telphone.indexOf('<script>') > -1) {
                return Vue.notifier.fail('非法输入')
            }
            const parms = {
                userId: this.user.userId,
                unionId: this.user.unionId,
                mpOpenId: this.user.mpOpenId,
                subscibeStatus: 1,
                logo: this.logoImage,
                qrcode: this.qrcodeImage,
                name: this.name,
                address: this.address,
                telphone: this.telphone
            }
            Vue.api.sign.createSubscribe(parms)
                .then(res => {
                    if (res.data && res.data.code === 200) {
                        Vue.store.commit('SIGN_RESULT', 1)
                        Vue.store.commit('SIGN_INFO', parms)
                    } else {
                        Vue.store.commit('SIGN_RESULT', -1)
                    }
                    this.gotoNotice()
                })
                .catch(err => {
                    console.log(err)
                })
        },
        updateSubscribe() {
            const parms = {
                userId: this.user.userId,
                unionId: this.user.unionId,
                mpOpenId: this.user.mpOpenId,
                subscibeStatus: 1,
                logo: this.logoImage,
                qrcode: this.qrcodeImage,
                name: this.name,
                address: this.address,
                telphone: this.telphone
            }
            Vue.api.sign.updateSubscribe(parms)
                .then(res => {
                    if (res.data && res.data.code === 200) {
                        Vue.store.commit('SIGN_RESULT', 1)
                        Vue.store.commit('SIGN_INFO', parms)
                    } else {
                        Vue.store.commit('SIGN_RESULT', -1)
                    }
                    this.gotoNotice()
                })
                .catch(err => {
                    console.log(err)
                })
        },
        onDeleteLogo() {
            this.logoImage = ''
        },
        onDeleteQrcode() {
            this.qrcodeImage = ''
        },
        onCompleteLogo(data) {
            setTimeout(() => {
                const { key } = data
                this.logoImage = key
            }, 300)
        },
        onCompleteQrcode(data) {
            setTimeout(() => {
                const { key, w, h } = data
                this.qrcodeImage = key
                if (w !== h) {
                    this.cropImage = key
                    Vue.store.commit('SIGN_SHOW_CROP', true)
                }
            }, 300)
        },
        onCompleteCropImage(res) {
            setTimeout(() => {
                if (res.data) {
                    this.qrcodeImage = res.data.key
                }
                Vue.store.commit('SIGN_SHOW_CROP', false)
            }, 300)
        },
        gotoIntro() {
            window.scrollTo(0, 0)
            Vue.store.commit('SIGN_SUBSCRIBE_STATUS', { layout: 'INTRO' })
        },
        submit() {
            this.createSubscribe()
        },
        gotoNotice() {
            window.scrollTo(0, 0)
            Vue.store.commit('SIGN_SUBSCRIBE_STATUS', { layout: 'NOTICE' })
        }
    }
}
</script>

<style lang="scss">
.eqc-sign-edit {
    position: relative;
    width: 100%;
    > .wrap {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: flex-start;
        .tips {
            width: calc(100% - 40px);
            background: #fff;
            height: 119px;
            background: rgba(246, 245, 250, 1);
            border-radius: 4px;
            margin: 20px 20px 0 20px;
            position: relative;
            text-align: center;
            .tip-1 {
                font-size: 14px;
                color: rgba(73, 93, 135, 1);
                line-height: 15px;
                padding: 20px 0 8px 0;
            }
            .tip-2 {
                font-size: 12px;
                color: rgba(110, 125, 157, 1);
                line-height: 18px;
            }
            .tip-3 {
                font-size: 12px;
                color: rgba(110, 125, 157, 1);
                line-height: 18px;
            }
            .more-btn {
                font-size: 14px;
                color: rgba(110, 125, 157, 1);
                line-height: 14px;
                margin: 8px;
                width: 30%;
                text-align: center;
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: flex-end;
                align-items: center;
                position: absolute;
                right: 0;
                bottom: 0;
            }
        }
        .edit-box {
            width: calc(100% - 40px);
            margin: 0 auto 60px;
            position: relative;
            .title {
                font-size: 15px;
                color: rgba(34, 34, 34, 1);
                line-height: 17px;
                margin: 30px 0 14px 0;
            }
            input[type="text"] {
                height: 44px;
                background: rgba(255, 255, 255, 1);
                border-radius: 4px;
                border: 1px solid rgba(204, 204, 204, 1);
                width: 100%;
            }
        }
        .submit {
            height: 49px;
            background: rgba(21, 147, 255, 1);
            line-height: 49px;
            width: 100%;
            text-align: center;
            font-size: 16px;
            color: #ffffff;
            position: fixed;
            bottom: 0;
            left: 0;
        }
    }
}
</style>
