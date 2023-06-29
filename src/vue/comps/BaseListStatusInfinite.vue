<template>
    <div class="eqc-list-status-infinite">
        <span
            v-show="isBusy"
            :style="{background:bgColorNew}"
            class="text"
        >{{ msgLoading }}</span>
        <span
            v-show="isEnd"
            :style="{background:bgColorNew}"
            class="text"
        >{{ msgResult }}</span>
    </div>
</template>

<script>
export default {
    props: {
        isBusy: {
            type: Boolean,
            default: false
        },
        isEnd: {
            type: Boolean,
            default: false
        },
        msgLoading: {
            type: String,
            default: '加载中…'
        },
        msgResult: {
            type: String,
            default: '没有更多了'
        },
        bgColor: {
            type: String,
            default: '#f7f8f9'
        }
    },
    computed: {
        bgColorNew() {
            return this.bgColor + ' !important'
        }
    }
}
</script>

<style lang="scss">
.eqc-list-status-infinite {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    background: #f7f8f9;
    &::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 200px;
        margin-left: -100px;
        border-bottom: 1px solid #ccd5db;
    }
    .text {
        position: relative;
        display: inline-block;
        padding: 0 12px;
        background: #f7f8f9;
    }
}
</style>
