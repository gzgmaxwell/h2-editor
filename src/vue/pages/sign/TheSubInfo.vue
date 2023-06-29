<template>
    <div
        class="eqc-sign-sub-info"
    >
        <div class="wrap">
            <div class="title">
                <div class="tag" /><p class="text">
                    订阅信息
                </p>
            </div>
            <div class="box">
                <div class="logo">
                    <p class="title">
                        logo
                    </p>
                    <div
                        :style="{background: `${logoImage} no-repeat center/contain`}"
                        class="preview"
                    />
                </div>
                <div class="company-name">
                    <p class="title">
                        公司/产品名称
                    </p>
                    <p class="info-text">
                        {{ info.name }}
                    </p>
                </div>
                <div class="company-addr">
                    <p class="title">
                        地址
                    </p>
                    <p class="info-text">
                        {{ info.address }}
                    </p>
                </div>
                <div class="company-tel">
                    <p class="title">
                        电话
                    </p>
                    <p class="info-text">
                        {{ info.telphone }}
                    </p>
                </div>
                <div class="qrcode">
                    <p class="title">
                        二维码
                    </p>
                    <div
                        :style="{background: `${qrcodeImage} no-repeat center/contain`}"
                        class="preview"
                    />
                </div>
            </div>
            <div class="btns">
                <div
                    class="btn"
                    @click="unsubscribe"
                >
                    取消订阅
                </div>
                <div
                    class="btn"
                    @click="gotoLink"
                >
                    意见和建议
                </div>
            </div>
            <div
                class="edit"
                @click="edit"
            >
                修改
            </div>
            <div
                v-if="showDialog"
                class="mask"
            >
                <div class="dialog">
                    <p>取消订阅后，</p>
                    <p>将不会再收到每日推送的日签</p>
                    <div class="ops">
                        <div
                            class="ok"
                            @click="ok"
                        >
                            取消订阅
                        </div>
                        <div
                            class="cancel"
                            @click="cancel"
                        >
                            再考虑下
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import defaultImage from '../../../img/sign/default.png'

export default {
    components: {

    },
    props: {

    },
    data() {
        return {
            defaultImage,
            showDialog: false
        }
    },
    computed: {
        info() {
            return Vue.store.state.sign.info
        },
        user() {
            return Vue.store.state.sign.user
        },
        screenHeight() {
            return document.body.clientHeight + 'px'
        },
        thumbSize() {
            return 80
        },
        logoImage() {
            return (this.info.logo && this.info.logo !== '') ? this.getBackgroundImage(this.getQiniuImage(this.info.logo)) : this.getBackgroundImage(this.defaultImage)
        },
        qrcodeImage() {
            return (this.info.qrcode && this.info.qrcode !== '') ? this.getBackgroundImage(this.getQiniuImage(this.info.qrcode)) : this.getBackgroundImage(this.defaultImage)
        }
    },
    methods: {
        getQiniuImage(src) {
            return Vue.filter('qiniuZoom')(src, this.thumbSize)
        },
        getBackgroundImage(src) {
            return Vue.filter('backgroundImage')(src)
        },
        edit() {
            Vue.store.commit('SIGN_SUBSCRIBE_STATUS', { layout: 'EDIT' })
        },
        gotoLink() {
            window.location = 'https://h5.eqxiu.com/ls/t5nxBZdx'
        },
        unsubscribe() {
            this.showDialog = true
        },
        cancel() {
            this.showDialog = false
        },
        ok() {
            this.showDialog = false
            const parms = {
                // userId: this.user.userId,
                id: this.info.id,
                subscibeStatus: 0
            }
            Vue.api.sign.unsubscribe(parms)
                .then(res => {
                    if (res.data && res.data.code === 200) {
                        Vue.store.commit('SIGN_RESULT', 0)
                        Vue.notifier.success('取消成功')
                    }
                    Vue.store.commit('SIGN_SUBSCRIBE_STATUS', { layout: 'INTRO' })
                })
                .catch(err => {
                    console.log(err)
                })
        }

    }
}
</script>

<style lang="scss">
.eqc-sign-sub-info {
    position: relative;
    width: 100%;
    > .wrap {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: flex-start;
        > .title {
            margin: 16px 0 18px 20px;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            .tag {
                width: 5px;
                height: 17px;
                background: rgba(21, 147, 255, 1);
                border-radius: 4px;
                margin-right: 8px;
            }
            .text {
                font-size: 17px;
            }
        }
        .box {
            background: rgba(255, 255, 255, 1);
            box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            width: calc(100% - 40px);
            margin: 0 auto;
            padding: 0 20px 20px 20px;
            .title {
                font-size: 15px;
                color: rgba(153, 153, 153, 1);
                line-height: 17px;
                margin: 24px 0 10px 0;
            }
            .info-text {
                font-size: 15px;
                color: rgba(34, 34, 34, 1);
                line-height: 18px;
            }
            .preview {
                width: 80px;
                height: 80px;
            }
        }
        .btns {
            display: flex;
            justify-content: space-between;
            height: 47px;
            align-items: center;
            margin: 0 20px 60px 20px;
            width: calc(100% - 40px);
        }
        .edit {
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
        .mask {
            width: 100%;
            height: 100%;
            position: fixed;
            top: 0;
            left: 0;
            background: rgba(0, 0, 0, 0.6);
            .dialog {
                width: 72%;
                height: 130px;
                background: #fff;
                position: absolute;
                top: 30%;
                left: 14%;
                border-radius: 4px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                p {
                    font-size: 15px;
                    line-height: 22px;
                }
                p:first-child {
                    margin-top: 18px;
                }
                .ops {
                    display: flex;
                    justify-content: space-between;
                    height: 50px;
                    align-items: center;
                    width: 100%;
                    margin-top: 18px;
                    border-top: 1px solid #dddddd;
                    .ok {
                        width: 50%;
                        height: 100%;
                        text-align: center;
                        line-height: 50px;
                        border-right: 1px solid #dddddd;
                    }
                    .cancel {
                        height: 100%;
                        text-align: center;
                        line-height: 50px;
                        width: calc(50% - 1px);
                        color: #1593ff;
                    }
                }
            }
        }
    }
}
</style>
