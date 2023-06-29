<template>
    <div
        class="eqc-loading"
    >
        <div class="loading">
            <img
                :src="cover"
                class="mask"
            >
            <div
                ref="logo"
                class="logo"
            />
            <p class="desc">
                {{ tip }}......
            </p>
        </div>
    </div>
</template>

<script>
import mask from '../../img/loadingcover.svg'

export default {
    props: {
        tip: {
            type: String,
            default: '请稍等'
        }
    },
    data() {
        return {
            cover: mask
        }
    }
}
</script>

<style lang="scss">
.eqc-loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    z-index: 100; //与错误提示层级一样
    .loading {
        position: relative;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
        width: 210px;
        height: 130px;
        border-radius: 6px;
        .mask {
            border-radius: 6px;
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 0;
        }
        .logo {
            width: 70px;
            height: 40px;
            background: url("../../img/loading.gif") no-repeat;
            background-size: 100% 100%;
            z-index: 1;
        }
        .desc {
            width: 136px;
            height: 20px;
            font-size: 14px;
            font-weight: 400;
            color: rgba(255, 255, 255, 1);
            line-height: 20px;
            text-align: center;
            margin-top: 15px;
            z-index: 1;
        }
    }
}
</style>
