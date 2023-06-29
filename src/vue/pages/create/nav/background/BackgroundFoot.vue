<template>
    <div
        :style="{height:height+'px'}"
        class="eqc-background-foot"
    >
        <div
            v-if="!isMember"
            class="notice"
        >
            <span class="info">单张图大小必须小于10M</span>
            <span
                class="upgrade"
                @click="bugMember"
            >升级到20M>></span>
        </div>
        <div class="btn-box">
            <pc-upload />
            <span class="split-line" />
            <upload-mobile
                ref="mobileUploadBtn"
                :css="phoneBtnCss"
                :hover-css="phoneBtnHoverCss"
                use-type="background"
            />
            <span class="split-line" />
            <span
                class="btn-item"
                @click="clearImg"
            >清除图片</span>
        </div>
    </div>
</template>
<script>
import PcUpload from './ImageUpload.vue'
import UploadMobile from '../upload/UploadMobile.vue'

export default {
    components: {
        PcUpload, UploadMobile
    },
    data() {
        return {
            info: {},
            phoneBtnCss: {
                background: 'white',
                fontSize: '13px',
                border: '0px',
                color: '#252b3f',
                margin: 0
            },
            phoneBtnHoverCss: {
                background: 'white',
                color: '#1593ff',
                fontSize: '13px',
                border: '0px',
                margin: 0
            },
            isMember: false,
            height: 0
        }
    },
    computed: {
        eqxPage() {
            return this.$store.state.scene.eqxPage
        },
        background() {
            return this.eqxPage.pageJson.properties.background
        },
        userInfo() {
            return this.$store.state.user.userInfo
        },
        buyMemberAuth() {
            return !(this.userInfo.members && this.userInfo.members.some(item => [14].includes(item.memberId))) && this.user.allow('buyMember')
        },
        isPhoneUploadFinish() {
            return this.$store.state.scene.isPhoneUploadFinish
        }
    },
    watch: {
        isPhoneUploadFinish(newVal) {
            if (newVal) {
                this.getBackGroundImageList()
                Vue.store.commit('SCENE_BACKGROUND_PHONE_UPLOAD_FINISH', false)
            }
        },
        'info.list'(newList) {
            if (newList.length > 0) {
                const src = newList[0].tmbPath
                this.crop(src)
                this.info.list = []
            }
        }
    },
    created() {
        this.getUploadBenefit()
    },
    methods: {
        // 只清楚背景图片 其余都保留
        clearImg() {
            const orginBackground = {
                opacity: 1,
                size: 0.2,
                src: '',
                type: 0
            }
            this.eqxPage.eqxBackground.setBackgroundMiddle(orginBackground)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        initMember(state) {
            if (state) {
                // 是会员
                this.isMember = true
                this.height = 48
            } else {
                this.isMember = false
                this.height = 80
            }
        },
        getUploadBenefit() {
            if (Vue.store.state.user.userInfo && ([7, 8, 9].includes(Vue.store.state.user.userInfo.memberType) || (Vue.store.state.user.userInfo.members && Vue.store.state.user.userInfo.members.some(item => [7, 8, 9].includes(item.memberId))))) {
                Vue.store.commit('USER_UPLOAD_LIMIT_RIGHT', 20)
                this.initMember(true)
            } else {
                const benefitId = Vue.env.benefits.uploadLimit
                Vue.api.user.getUserBenefits(benefitId).then(data => {
                    if (data.data.list.length > 0) {
                        // 有这个权益
                        const val = data.data.list[0].surplusAmount
                        Vue.store.commit('USER_UPLOAD_LIMIT_RIGHT', val)
                        if (Number(val) > 10) {
                            this.initMember(true)
                        }
                    } else {
                        Vue.store.commit('USER_UPLOAD_LIMIT_RIGHT', 10)
                        this.initMember(false)
                    }
                })
            }
        },
        bugMember() {
            if (this.buyMemberAuth) {
                const options = {
                    benefitId: Vue.env.benefits.uploadLimit
                }
                this.dialog.openMember(options).then(res => {
                    if (res.success) {
                        this.notifier.success('支付成功，请刷新页面')
                    } else {
                        this.notifier.fail('支付失败，请稍后重试')
                    }
                }).catch(err => {
                    err && this.logger.error(err)
                })
            } else {
                this.notifier.info('该功能为创意云会员和营销云会员专属权益')
            }
        },
        getBackGroundImageList() {
            const key = Vue.infiniteScroll.setKey({
                tab: 'upload',
                tagId: '-1'
            })
            this.info = Vue.infiniteScroll.getInfo(key)
            if (!this.info.list.length) {
                Vue.infiniteScroll.getMoreItems(key)
                    .catch(err => err && this.logger.error(err))
            }
        },
        crop(src) {
            const { width, height } = this.eqxPage.eqxScene.sceneJson
            const options = {
                ratio: width / height,
                src,
                crop: this.background.crop,
                hideOptions: true,
                type: 'background'
            }
            return this.dialog.openImageCrop(options)
                .then(result => {
                    const crop = result.crop
                    const background = {
                        type: 1,
                        src,
                        crop,
                        size: 1,
                        opacity: 1
                    }
                    this.eqxPage.eqxBackground.setBackgroundMiddle(background)
                    this.eqxPage.eqxHistory.add(this.eqxPage)
                })
                .catch(err => err && this.logger.error(err))
        }
    }
}
</script>
<style lang="scss">
.eqc-background-foot {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 80px;
    width: 100%;
    background: white;
    border-top: 1px solid #ccd5db;
    .notice {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #333333;
        height: 32px;
        width: 100%;
        padding: 17px 16px 0 16px;
        .upgrade {
            color: #c09659;
            cursor: pointer;
        }
    }
    .btn-box {
        display: flex;
        align-items: center;
        height: 48px;
        .btn-item {
            width: 96px;
            text-align: center;
            line-height: 24px;
            height: 24px;
            font-size: 13px;
            color: #252b3f;
            transition: all 0.3s;
            cursor: pointer;
            &:hover {
                color: #1593ff;
            }
        }
        .split-line {
            width: 1px;
            height: 24px;
            background: #ccd5db;
        }
    }
}
</style>
