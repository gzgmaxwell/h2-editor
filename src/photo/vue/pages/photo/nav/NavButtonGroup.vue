<template>
    <div class="eqc-photo-botton-group">
        <button
            class="cancle"
            @click="cancleEvent"
        >
            取消
        </button>
        <button
            class="apply hint--top hint--rounded hint--always"
            data-hint="裁剪后需点击生效"
            @click="applyEvent"
        >
            应用
        </button>
    </div>
</template>

<script>
export default {
    props: {
        id: {
            type: String,
            default: ''
        },
        cancle: {
            type: Function,
            default: () => {}
        },
        apply: {
            type: Function,
            default: () => {}
        }
    },
    methods: {
        cancleEvent() {
            this.cancle(this.id)
        },
        applyEvent() {
            this.apply(this.id)
        }
    }
}
</script>

<style lang="scss">
.eqc-photo-botton-group {
    height: 68px;
    width: 288px;
    padding: 16px 0px 16px 0px;
    text-align: center;
    line-height: 0px;
    button {
        width: 112px;
        height: 36px;
        border-radius: 3px;
        font-size: 14px;
        font-weight: 400;
        border-radius: 3px;
    }
    button.cancle {
        background: rgba(255, 255, 255, 1);
        border: 1px solid rgba(204, 213, 219, 1);
        color: rgba(79, 93, 105, 1);
        margin-right: 10px;
        &:hover {
            border-color: #1593ff;
            color: #1593ff;
        }
    }
    button.apply {
        background: rgba(21, 147, 255, 1);
        border: 1px solid rgba(21, 147, 255, 1);
        color: rgba(255, 255, 255, 1);
    }
}
</style>
