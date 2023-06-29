<template>
    <div class="eqc-logo">
        <div class="circle">
            <div class="loader">
                <div class="dot" />
                <div class="dot" />
                <div class="dot" />
                <div class="dot" />
                <div class="dot" />
                <div class="dot" />
                <div class="dot" />
                <div class="dot" />
                <div class="dot" />
                <div class="spec" />
                <div class="shadow" />
            </div>
            <i class="logo eqf-airdesign" />
        </div>
        <div class="title">
            <span class="text">设计从未如此简单</span>
        </div>
        <div class="desc">
            小提示：{{ randomTip }}
        </div>
    </div>
</template>

<script>
import util from '../../../utils/util'

export default {
    data() {
        return {
            tips: [
                '素材里除了图片还有形状，形状放大不失真且可以任意换颜色',
                '养成设置标题的好习惯，以后作品多了方便管理',
                '拖拽素材到画布上，可快速替换已有素材',
                '按住“空格”，可使用鼠标拖拽画布',
                '使用CTRL+C、CTRL+V可实现跨页复制粘贴',
                '点击左上角的箭头可以收起侧边栏，尽情享受创作的乐趣吧',
                '文字复制一层，两层文字位置错开，会有意想不到的效果哦'
            ]
        }
    },
    computed: {
        randomTip() {
            const index = util.getRandom(0, 6)
            return this.tips[index]
        }
    }
}
</script>

<style lang="scss">
.eqc-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: #fff;
    z-index: 98;
    transition: all 0.3s;
    .circle {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 200px;
        height: 200px;
        .logo {
            position: relative;
            font-size: 96px;
            color: #fff;
        }
    }
    .title {
        position: relative;
        width: 480px;
        height: 36px;
        margin-top: 58px;
        line-height: 36px;
        text-align: center;
        .text {
            position: relative;
            padding: 0 16px;
            font-size: 24px;
            color: #2f3c4d;
            background: #fff;
        }
        &::before {
            content: "";
            position: absolute;
            left: 0;
            top: 50%;
            width: 100%;
            height: 1px;
            background: #ccd5db;
        }
    }
    .desc {
        width: 480px;
        height: 36px;
        line-height: 36px;
        font-size: 14px;
        font-weight: lighter;
        color: #ccd5db;
        text-align: center;
    }

    // https://codepen.io/zzo900/pen/zWQKZa，复制如下代码
    /* The loader */
    .loader {
        position: absolute;
        top: 50%;
        left: 50%;

        width: 200px;
        height: 200px;

        border-radius: 200px;

        margin-top: -100px;
        margin-left: -100px;

        background: linear-gradient(#00beff, transparent), linear-gradient(90deg, #1593ff, transparent), linear-gradient(-90deg, #5d61ff, transparent);
        background-blend-mode: screen;
        clip-path: circle(50%, 50%, 10%);
        -webkit-clip-path: circle(50%, 50%, 10%);
        animation: loader 3s cubic-bezier(0.55, 0.3, 0.24, 0.99) infinite;
    }

    .loader:after {
        content: "";

        position: absolute;
        bottom: -30px;
        left: 0;

        width: 100%;
        height: 100%;

        border-radius: 999px;

        transform-origin: 50% 100%;
        transform: scaleX(0.7) scaleY(0.1);
    }

    /* The spec */
    .spec {
        position: absolute;
        top: 50%;
        right: 50%;

        width: 1px;
        height: 1px;

        border-radius: 20px;

        transform: rotateZ(30deg) translateY(-65px) scaleY(0.75);
    }

    /* The shadow */
    .shadow {
        position: absolute;
        top: 50%;
        right: 50%;

        width: 10px;
        height: 10px;

        border-radius: 20px;

        transform: rotateZ(-140deg) translateY(-70px) scaleY(0.5);
    }

    /* The dot */
    .dot {
        position: absolute;
        bottom: 0px;
        left: 50%;
        opacity: 0;

        width: 20px;
        height: 20px;

        border-radius: 20px;

        margin-left: -10px;

        background: linear-gradient(rgba(255, 255, 255, 0.6), transparent), linear-gradient(90deg, #00beff, transparent), linear-gradient(-90deg, #6bb2cd, transparent);
        background-blend-mode: screen;

        animation: dot5 3s cubic-bezier(0.8, 0.1, 0.9, 0.5) infinite;
    }

    .dot:nth-child(1) {
        margin-left: -80px;
        bottom: 34px;
        animation-name: dot1;
        animation-delay: 750ms;
    }
    .dot:nth-child(2) {
        margin-left: -63px;
        bottom: 18px;
        animation-name: dot2;
        animation-delay: 1750ms;
    }
    .dot:nth-child(3) {
        margin-left: -50px;
        bottom: 10px;
        animation-name: dot3;
        animation-delay: 250ms;
    }
    .dot:nth-child(4) {
        margin-left: -27px;
        bottom: 2px;
        animation-name: dot4;
        animation-delay: 1500ms;
    }
    .dot:nth-child(5) {
        margin-left: -10px;
        bottom: 0;
        animation-name: dot5;
        animation-delay: 0ms;
    }
    .dot:nth-child(6) {
        margin-left: 8px;
        bottom: 3px;
        animation-name: dot6;
        animation-delay: 1000ms;
    }
    .dot:nth-child(7) {
        margin-left: 30px;
        bottom: 10px;
        animation-name: dot7;
        animation-delay: 2000ms;
    }
    .dot:nth-child(8) {
        margin-left: 42px;
        bottom: 19px;
        animation-name: dot8;
        animation-delay: 500ms;
    }
    .dot:nth-child(9) {
        margin-left: 60px;
        bottom: 34px;
        animation-name: dot9;
        animation-delay: 1250ms;
    }

    @keyframes dot1 {
        0% {
            transform: translateY(0) scale(0.1);
            opacity: 0;
            animation-timing-function: cubic-bezier(0.39, 0.13, 0.71, 0.6);
        }
        50% {
            transform: translateY(-60px) scale(0.3);
            opacity: 0.4;
            animation-timing-function: cubic-bezier(0.29, 0.4, 0.69, 0.68);
        }
        100% {
            opacity: 0;
            transform: translateY(-120px) scale(0.1);
        }
    }

    @keyframes dot2 {
        0% {
            transform: translateY(0) scale(0.2);
            opacity: 0;
            animation-timing-function: cubic-bezier(0.39, 0.13, 0.71, 0.6);
        }
        50% {
            transform: translateY(-70px) scale(0.4);
            opacity: 0.9;
            animation-timing-function: cubic-bezier(0.29, 0.4, 0.69, 0.68);
        }
        100% {
            opacity: 0;
            transform: translateY(-140px) scale(0.2);
        }
    }

    @keyframes dot3 {
        0% {
            transform: translateY(0) scale(0.2);
            opacity: 0;
            animation-timing-function: cubic-bezier(0.39, 0.13, 0.71, 0.6);
        }
        50% {
            transform: translateY(-80px) scale(0.5);
            opacity: 0.8;
            animation-timing-function: cubic-bezier(0.29, 0.4, 0.69, 0.68);
        }
        100% {
            opacity: 0;
            transform: translateY(-160px) scale(0.2);
        }
    }

    @keyframes dot4 {
        0% {
            transform: translateY(0) scale(0.1);
            opacity: 0;
            animation-timing-function: cubic-bezier(0.39, 0.13, 0.71, 0.6);
        }
        50% {
            transform: translateY(-90px) scale(0.3);
            opacity: 0.5;
            animation-timing-function: cubic-bezier(0.29, 0.4, 0.69, 0.68);
        }
        100% {
            opacity: 0;
            transform: translateY(-180px) scale(0.1);
        }
    }

    @keyframes dot5 {
        0% {
            transform: translateY(0) scale(0.3);
            opacity: 0;
            animation-timing-function: cubic-bezier(0.39, 0.13, 0.71, 0.6);
        }
        50% {
            transform: translateY(-90px) scale(0.5);
            opacity: 0.85;
            animation-timing-function: cubic-bezier(0.29, 0.4, 0.69, 0.68);
        }
        100% {
            opacity: 0;
            transform: translateY(-180px) scale(0.3);
        }
    }

    @keyframes dot6 {
        0% {
            transform: translateY(0) scale(0.2);
            opacity: 0;
            animation-timing-function: cubic-bezier(0.39, 0.13, 0.71, 0.6);
        }
        50% {
            transform: translateY(-60px) scale(0.4);
            opacity: 0.8;
            animation-timing-function: cubic-bezier(0.29, 0.4, 0.69, 0.68);
        }
        100% {
            opacity: 0;
            transform: translateY(-120px) scale(0.2);
        }
    }

    @keyframes dot7 {
        0% {
            transform: translateY(0) scale(0.1);
            opacity: 0;
            animation-timing-function: cubic-bezier(0.39, 0.13, 0.71, 0.6);
        }
        50% {
            transform: translateY(-75px) scale(0.3);
            opacity: 0.6;
            animation-timing-function: cubic-bezier(0.29, 0.4, 0.69, 0.68);
        }
        100% {
            opacity: 0;
            transform: translateY(-150px) scale(0.1);
        }
    }

    @keyframes dot8 {
        0% {
            transform: translateY(0) scale(0.2);
            opacity: 0;
            animation-timing-function: cubic-bezier(0.39, 0.13, 0.71, 0.6);
        }
        50% {
            transform: translateY(-50px) scale(0.5);
            opacity: 0.8;
            animation-timing-function: cubic-bezier(0.29, 0.4, 0.69, 0.68);
        }
        100% {
            opacity: 0;
            transform: translateY(-100px) scale(0.2);
        }
    }

    @keyframes dot9 {
        0% {
            transform: translateY(0) scale(0.1);
            opacity: 0;
            animation-timing-function: cubic-bezier(0.39, 0.13, 0.71, 0.6);
        }
        50% {
            transform: translateY(-60px) scale(0.3);
            opacity: 0.5;
            animation-timing-function: cubic-bezier(0.29, 0.4, 0.69, 0.68);
        }
        100% {
            opacity: 0;
            transform: translateY(-120px) scale(0.1);
        }
    }
}
</style>
