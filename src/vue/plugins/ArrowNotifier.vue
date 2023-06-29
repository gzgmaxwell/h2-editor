<template>
    <div
        :style="notifyStyle"
        :class="notifyClass"
        class="eqc-arrow-notifier"
    >
        <div
            :style="arrowStyle"
            class="arrow"
        />
        <div class="content">
            <div
                v-if="option.title"
                class="title"
            >
                <span>{{ option.title }}</span>
            </div>
            <div
                v-if="option.subTitle"
                class="sub-title"
            >
                <span>
                    <i
                        :class="iconClass"
                        class="icon"
                    />
                    {{ option.subTitle }}
                </span>
            </div>
        </div>
        <base-button
            class="btn white h32 cancel"
            @click.native="close"
        >
            我知道了
        </base-button>
    </div>
</template>

<script>
export default {
    props: {
        option: {
            type: Object,
            default: () => ({
                title: '秀客可以在这里上传本地的gif素材，用于制作gif模本',
                subTitle: '一个作品中只能存在一个gif素材哦！',
                iconType: 'warn',
                arrowDirection: 'left',
                arrowDistance: '0', // 箭头与头部的距离
                width: '378px',
                height: '128px',
                distance: '', // 箭头与头部的距离
                showButton: true
            })
        }
    },
    computed: {
        notifyStyle() {
            return {
                left: this.option.left ? this.option.left : 'auto',
                top: this.option.top ? this.option.top : 'auto',
                bottom: this.option.bottom,
                right: this.option.right,
                width: this.option.width,
                height: this.option.height,
                data: this.option.moveDistance
            }
        },
        notifyClass() {
            return 'animation-' + this.option.arrowDirection
        },
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
        },
        arrowStyle() {
            let top = 0
            let left = 0
            const arrowWidth = 8
            let borderColor = ''
            const arrowDistance = parseInt(this.option.arrowDistance ? this.option.arrowDistance : 0)
            switch (this.option.arrowDirection) {
                case 'left':
                    top = arrowDistance === 0 ? parseInt(this.option.height) / 2 - arrowWidth : arrowDistance
                    left = -arrowWidth * 2
                    borderColor = 'transparent white transparent transparent'
                    break
                case 'up':
                    left = arrowDistance === 0 ? parseInt(this.option.width) / 2 - arrowWidth : arrowDistance
                    borderColor = 'transparent transparent white transparent'
                    top = -arrowWidth * 2
                    break
                case 'right':
                    top = arrowDistance === 0 ? parseInt(this.option.height) / 2 - arrowWidth : arrowDistance
                    left = parseInt(this.option.width)
                    borderColor = 'transparent transparent transparent white'
                    break
                case 'bottom':
                    top = parseInt(this.option.height)
                    left = arrowDistance === 0 ? parseInt(this.option.width) / 2 - arrowWidth : arrowDistance
                    borderColor = 'white transparent transparent transparent'
            }
            return {
                top: top + 'px',
                left: left + 'px',
                borderColor: borderColor
            }
        }
    },
    methods: {
        close() {
            const dialog = this.$el
            dialog.className = 'eqc-arrow-notifier close'
            dialog.addEventListener('animationend', () => {
                this.option.okClick && this.option.okClick()
                document.body.removeChild(dialog)
                this.$destroy()
            })
        }
    }
}
</script>

<style lang="scss">
.eqc-arrow-notifier {
    position: fixed;
    padding: 24px 16px 16px 16px;
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
    border-radius: 3px;
    background: #fff;
    z-index: 94; // 层级最高 确保文字云的层级在上面
    animation: fade-in 0.3s;
    $left: attr(left);
    $right: attr(right);
    $top: attr(top);
    $bottom: attr(bottom);
    $height: attr(height);
    $width: attr(width);
    $distance: 150px;
    .content {
        display: flex;
        flex-direction: column;
        div {
            height: 24px;
        }
    }
    .icon {
        margin: 0;
        font-size: 14px;
    }
    .title {
        font-size: 14px;
        line-height: 22px;
        color: #111;
    }
    .sub-title {
        font-size: 12px;
        color: #333;
        line-height: 22px;
        .success {
            color: #1bc7b1;
        }
        .fail {
            color: #ff296a;
        }
        .info {
            color: #1593ff;
        }
        .warn {
            color: #f89300;
        }
    }
    .cancel {
        padding: 7px 15px;
        font-size: 12px;
        color: #4f5d69;
        position: absolute;
        bottom: 16px;
        right: 16px;
    }

    &.close {
        animation: fade-out 0.3s;
    }
    .arrow {
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 8px;
        position: absolute;
    }
    &.animation-left {
        animation: move-left 0.5s linear infinite alternate;
    }
    &.animation-up {
        animation: move-up 0.5s ease-in-out infinite alternate;
    }
    @keyframes move-left {
        to {
            transform: translateX(10px);
        }
    }
    @keyframes move-up {
        to {
            transform: translateY(10px);
        }
    }
}
</style>
