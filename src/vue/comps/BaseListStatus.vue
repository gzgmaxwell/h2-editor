<template>
    <div class="eqc-list-status">
        <img
            v-if="isEmpty"
            :src="icon"
        >
        <span
            v-if="isEmpty"
            :style="msgCss"
        >{{ msgResult }}</span>
        <span v-if="isBusy">{{ msgLoading }}</span>
        <a
            v-if="isEmpty && showBtn"
            :href="url"
            :style="btnCss"
            class="btn"
            target="_blank"
        >{{ btnName }}</a>
    </div>
</template>

<script>
import icon from '../../img/emptybox.svg'
export default {
    props: {
        isBusy: {
            type: Boolean,
            default: false
        },
        isEmpty: {
            type: Boolean,
            default: false
        },
        msgCss: {
            type: Object,
            default: null
        },
        msgLoading: {
            type: String,
            default: '加载中…'
        },
        msgResult: {
            type: String,
            default: '暂无数据'
        },
        showBtn: {
            type: Boolean,
            default: false
        },
        btnName: {
            type: String,
            default: '跳转'
        },
        url: {
            type: String,
            default: ''
        },
        btnCss: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            icon
        }
    }
}
</script>

<style lang="scss">
.eqc-list-status {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    img {
        width: 160px;
    }
    span {
        font-size: 14px;
        color: rgba(102, 102, 102, 1);
    }
    .btn {
        width: 160px;
        height: 36px;
        background: rgba(21, 147, 255, 1);
        border-radius: 3px;
        margin-top: 53px;
        font-size: 14px;
        color: #ffffff;
        text-align: center;
        line-height: 36px;
    }
}
</style>
