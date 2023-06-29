<template>
    <div
        :class="type"
        class="eqc-notifier"
    >
        <i
            :class="iconClass"
            class="icon fl"
        />
        <div style="white-space: nowrap">
            {{ msg }}
        </div>
    <!-- <span class="close fr eqf-no" @click="close"></span> -->
    </div>
</template>

<script>
export default {
    props: {
        type: {
            type: String,
            default: ''
        },
        msg: {
            type: String,
            default: ''
        },
        time: {
            type: Number,
            default: 4
        }
    },
    computed: {
        iconClass() {
            switch (this.type) {
                case 'success':
                    return 'eqf-info-f'
                case 'fail':
                    return 'eqf-no-f'
                case 'info':
                    return 'eqf-info-f'
                case 'warn':
                    return 'eqf-alert-f'
                default:
                    return 'eqf-alert-f'
            }
        }
    },
    mounted() {
        setTimeout(() => this.close(), this.time * 1000)
    },
    methods: {
        close() {
            const dialog = this.$el
            let cancelFlag = false
            dialog.addEventListener('animationend', () => {
                cancelFlag = true
                document.body.removeChild(dialog)
                this.$destroy()
            })
            dialog.className = `${this.type} eqc-notifier close`
            // 预览页面 这个弹窗提示关不掉 这儿设置一个settimeout 强制关掉
            setTimeout(() => {
                if (!cancelFlag) {
                    document.body.removeChild(dialog)
                    this.$destroy()
                }
            }, 1500)
        }
    }
}
</script>

<style lang="scss">
.eqc-notifier {
    position: fixed;
    top: 68px;
    left: 50%;
    height: 36px;
    padding-right: 10px;
    line-height: 36px;
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
    border-radius: 3px;
    background: #fff;
    z-index: 100; // 层级最高
    transform: translateX(-50%);
    animation: fade-in 0.3s;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    .icon {
        margin: 10px;
        font-size: 16px;
    }
    .close {
        margin: 8px;
        font-size: 20px;
        color: #666;
        transition: all 0.3s;
        cursor: pointer;
        &:hover {
            color: #ff296a;
        }
    }
    &.success {
        color: #1bc7b1;
    }
    &.fail {
        color: #ff296a;
    }
    &.info {
        color: #1593ff;
    }
    &.warn {
        color: #f89300;
    }
    &.close {
        animation: fade-out 0.3s;
    }
}
</style>
