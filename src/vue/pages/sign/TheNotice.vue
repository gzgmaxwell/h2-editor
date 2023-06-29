<template>
    <div
        :style="{height:screenHeight}"
        class="eqc-sign-notice"
    >
        <div class="wrap">
            <img
                :src="signSuccess"
                class="msg-icon"
            >
            <p class="msg">
                {{ isSignSuccess ? '恭喜你日签订阅成功':'很遗憾日签订阅失败' }}
            </p>
            <p
                v-if="isFollow"
                class="msg-2"
            >
                点击下方按钮，立即获取一枚日签
            </p>
            <div
                v-if="!isFollow"
                class="box"
            >
                <img
                    :src="qrcode"
                    class="qrcode"
                >
                <p class="tip-1">
                    长按识别二维码，关注【易企秀创意云】公众号
                </p>
                <p class="tip-2">
                    才能每天收到为您准备的日签
                </p>
            </div>
            <div
                v-if="isFollow && !alreadyGet"
                class="sign"
                @click="getSignImage"
            >
                立即获取
            </div>
            <p
                v-if="alreadyGet"
                class="tip-3"
            >
                请前往【易企秀创意云】公众号查看
            </p>
        </div>
    </div>
</template>

<script>
import signSuccess from '../../../img/sign/sign_success.png'
import qrcode from '../../../img/sign/sign_qrcode.jpg'

export default {
    components: {

    },
    props: {

    },
    data() {
        return {
            signSuccess,
            qrcode,
            alreadyGet: false
        }
    },
    computed: {
        screenHeight() {
            return document.body.clientHeight + 'px'
        },
        isSignSuccess() {
            return Vue.store.state.sign.result === 1
        },
        sign() {
            return Vue.store.state.sign
        },
        user() {
            return this.sign.user
        },
        isFollow() {
            return this.sign.attention === 1
        }
    },
    methods: {
        getSignImage() {
            Vue.api.sign.getSignImage(this.user.mpOpenId)
                .then(res => {
                    if (res.data && res.data.code === 200) {
                        Vue.notifier.warn('获取成功')
                        this.alreadyGet = true
                    } else {
                        Vue.notifier.warn('获取失败')
                    }
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }
}
</script>

<style lang="scss">
.eqc-sign-notice {
    position: relative;
    width: 100%;
    > .wrap {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: center;
        .msg-icon {
            width: 54%;
            margin: 40px 0 20px 0;
        }
        .msg {
            font-size: 19px;
            color: rgba(34, 34, 34, 1);
            line-height: 25px;
        }
        .msg-2 {
            font-size: 15px;
            color: rgba(153, 153, 153, 1);
            line-height: 25px;
            margin: 10px 0 100px 0;
        }
        .box {
            background: rgba(246, 245, 250, 1);
            border-radius: 3px;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            width: 90%;
            margin-top: 54px;
            .qrcode {
                margin: 20px 0 16px 0;
                width: 100px;
            }
            .tip-1 {
                font-size: 13px;
                color: rgba(110, 125, 157, 1);
                line-height: 18px;
            }
            .tip-2 {
                font-size: 13px;
                font-family: PingFangSC;
                font-weight: 400;
                color: rgba(110, 125, 157, 1);
                line-height: 18px;
                padding-bottom: 20px;
            }
        }
        .sign {
            width: 140px;
            height: 40px;
            background: linear-gradient(270deg, rgba(79, 172, 254, 1) 0%, rgba(21, 147, 255, 1) 100%);
            border-radius: 20px;
            font-size: 15px;
            color: rgba(255, 255, 255, 1);
            line-height: 40px;
            text-align: center;
        }
    }
}
</style>
