<template>
    <div
        :style="{right:right+'px'}"
        class="eqc-daily-sign"
    >
        <div class="header">
            <div class="imgBox">
                <img :src="xiaoyi">
            </div>
            <div class="contentBox">
                <span>一次订阅，每天自动推送 </span>
                <span>精美日签，每天均不同， </span>
                <span>还可以自动带上您的个性化信息</span>
                <a
                    href="#"
                    class="link"
                    @click="openDetailPage"
                >详情介绍 ></a>
            </div>
        </div>
        <div class="liner" />
        <div class="qrcode">
            <img :src="qrcode">
        </div>
        <div class="footer">
            <span>微信扫码订阅</span>
        </div>
    </div>
</template>

<script>
import xiaoyi from '../../../../img/xiaoyi.png'
import qrcode from '../../../../img/qrcode-eqx.png'

export default {
    props: {
        right: {
            type: Number,
            default: 42
        }
    },
    data() {
        return {
            xiaoyi,
            qrcode
        }
    },
    methods: {
        openDetailPage() {
            window.open('http://yqxiuairdesign.eqxiuzhan.com/riqian')
        }
    }
}
</script>

<style lang="scss">
.eqc-daily-sign {
    position: absolute;
    top: 40px;
    left: -100px;
    z-index: 1;
    width: 274px;
    height: 329px;
    padding: 16px 17px;
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
    border-radius: 3px;
    background: #fff;
    animation: fade-in 0.3s;
    .header {
        height: 68px;
        display: flex;
        .imgBox {
            width: 62px;
            height: 68px;
            img {
                margin-top: 2px;
                width: 62px;
                height: 68px;
            }
        }
        .contentBox {
            margin-left: 10px;
            font-size: 12px;
            height: 68px;
            display: flex;
            flex-direction: column;
            line-height: 17px;
            color: #2e3339;
            text-align: left;
            .link {
                color: #1593ff;
                line-height: 21px;
            }
        }
    }
    .liner {
        width: 100%;
        border: 1px dashed #ccd5db;
        margin: 16px 0 7px 0;
    }
    .qrcode {
        display: flex;
        justify-content: center;
        img {
            width: 181px;
            height: 181px;
        }
    }
    .footer {
        text-align: center;
        color: #4f5d69;
        font-size: 13px;
        margin-top: 4px;
        line-height: 13px;
    }
}
</style>
