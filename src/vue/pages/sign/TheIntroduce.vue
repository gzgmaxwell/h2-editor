<template>
    <div class="eqc-sign-intro">
        <div class="wrap">
            <img
                :src="signStep1"
                class="intro-icon"
            >
            <div class="intro-text">
                <p>你还在为每天做日签而苦恼？</p>
                <p>每天苦想文案而挠头</p>
                <p>敢不敢想</p>
                <p>每天有人把做好的日签送到你面前</p>
                <p>登登登～</p>
                <p>小易日签来啦！</p>
                <p> 仅需两步完成日签订阅</p>
            </div>
            <img
                :src="signStep2"
                style="margin: 40px 0 10px 0;"
                class="intro-icon"
            >
            <img
                :src="signStep3"
                class="intro-icon"
            >
            <img
                :src="signStep4"
                style="margin-bottom: 60px;"
                class="intro-icon"
            >
            <div
                class="btn"
                @click="subscribe"
            >
                {{ isSubscribe ? '查看订阅':'立即订阅' }}
            </div>
        </div>
    </div>
</template>
<script>
import signStep1 from '../../../img/sign/sign_intro_1.png'
import signStep2 from '../../../img/sign/sign_intro_2.png'
import signStep3 from '../../../img/sign/sign_intro_3.png'
import signStep4 from '../../../img/sign/sign_intro_4.png'

export default {
    components: {

    },
    props: {

    },
    data() {
        return {
            signStep1,
            signStep2,
            signStep3,
            signStep4,
            isSubscribe: false
        }
    },
    computed: {
        user() {
            return Vue.store.state.sign.user
        }
    },
    mounted() {

    },
    created() {
        this.getSubInfo()
        this.getAttentionInfo()
    },
    methods: {
        getAttentionInfo() {
            Vue.api.sign.followWechat(this.user.mpOpenId)
                .then(res => {
                    if (res.data && res.data.obj) {
                        Vue.store.commit('SIGN_ATTENTION', 1)
                    } else {
                        Vue.store.commit('SIGN_ATTENTION', 0)
                    }
                })
                .catch(err => {
                    console.log(err)
                })
        },
        getSubInfo() {
            const parms = {
                subscibeStatus: 1
            }
            if (this.user.mpOpenId !== '') {
                parms.mpOpenId = this.user.mpOpenId
            } else {
                parms.userId = this.user.userId
            }
            Vue.api.sign.getSubscribe(parms)
                .then(res => {
                    if (res.data && res.data.list && res.data.list.length > 0) {
                        Vue.store.commit('SIGN_INFO', res.data.list[0])
                        this.isSubscribe = true
                    } else {
                        this.isSubscribe = false
                    }
                })
                .catch(err => {
                    console.log(err)
                })
        },
        subscribe() {
            window.scrollTo(0, 0)
            if (this.isSubscribe) {
                Vue.store.commit('SIGN_SUBSCRIBE_STATUS', { layout: 'INFO' })
            } else {
                Vue.store.commit('SIGN_SUBSCRIBE_STATUS', { layout: 'EDIT' })
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-sign-intro {
    > .wrap {
        background: url("../../../img/sign/bg.png") repeat-y;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: center;
        .intro-icon {
            width: calc(100% - 50px);
        }
        .intro-icon:first-child {
            width: 100%;
        }
        .intro-text {
            font-size: 16px;
            color: rgba(34, 34, 34, 1);
            line-height: 28px;
            background: rgba(233, 245, 255, 0.6);
            border-radius: 10px;
            width: calc(100% - 50px);
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
            justify-content: center;
            align-items: center;
            padding: 20px 0;
            margin-top: -25px;
        }
        .btn {
            width: 100%;
            height: 49px;
            line-height: 49px;
            text-align: center;
            background: rgba(21, 147, 255, 1);
            font-size: 16px;
            color: #ffffff;
            position: fixed;
            bottom: 0;
            left: 0;
        }
    }
}
</style>
