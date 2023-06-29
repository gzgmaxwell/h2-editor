<template>
    <div class="eqc-dialog-base">
        <div
            :style="{background: params.maskBackground}"
            class="mask"
            @click="close()"
        />
        <div class="content">
            <component
                :is="dialog"
                :data="data"
                :close="close"
            />
        </div>
    </div>
</template>

<script>
// data和close将会传给子组件，或者子组件通过$parent访问
export default {
    props: {
        // 用于传数据到子组件
        data: {
            type: Object,
            default: undefined // 不能用null，否则子组件的默认值会失效
        },
        // 用于通用框的一些设置
        params: {
            type: Object,
            default: undefined // 不能用null，否则子组件的默认值会失效
        }
    },
    data() {
        return {
            dialog: 'cDialog', // 用于接收组件
            value: null // 用于将数据传到调用方
        }
    },
    methods: {
        close(value) {
            const dialog = this.$el
            dialog.addEventListener('animationend', () => {
                document.body.removeChild(dialog)
                this.$destroy()
            })
            dialog.className = 'eqc-dialog-base close'
            if (value) {
                this.value = value
            }
        }
    }
}
</script>

<style lang="scss">
%pos {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
}

.eqc-dialog-base {
    @extend %pos;
    z-index: 100;
    animation: fade-in 0.3s;
    > .mask {
        @extend %pos;
        background: rgba(0, 0, 0, 0.6);
    }
    > .content {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        .dialog {
            position: relative;
            background: #fff;
            box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
            border-radius: 4px;
            > .head {
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 60px;
                padding: 0 28px;
                font-size: 18px;
                font-weight: bold;
                color: #111;
                > .close {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 16px;
                    height: 16px;
                    font-size: 22px;
                    color: #666;
                    cursor: pointer;
                    transition: all 0.3s;
                    &:hover {
                        color: #ff2a6a;
                    }
                }
            }
        }
    }
    &.close {
        animation: fade-out 0.3s;
    }
}
</style>
