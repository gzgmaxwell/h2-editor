<template>
    <div
        :style="getPositionStyle"
        class="eqc-help-notifier"
    >
        <div
            :style="boxStyle"
            class="box"
        >
            <span
                v-show="hasArrow"
                ref="arrow"
                class="arrow"
            />
            <img
                v-if="type !== 'copy'"
                :src="getCover()"
                class="cover"
            >
            <div
                v-if="type === 'copy'"
                class="copyBox"
            >
                <img :src="getCover()">
            </div>
            <p class="tip">
                {{ tip }}
            </p>
            <a
                class="close"
                @click="close()"
            >知道了</a>
        </div>
    </div>
</template>

<script>
import GifPic from '../../img/help_pic.gif'
import GifFrame from '../../img/help_frame.gif'
import GifText from '../../img/help_text.png'
import GifMess from '../../img/help_mess.gif'
import pngCopy from '../../img/help_copy.png'
import CtrlGif from '../../img/ctrl_gif.gif'
export default {
    props: {
        // 提示文本
        tip: {
            type: String,
            default: ''
        },
        // 类型 pic:图片  frame:嵌入框  text:文本 mess:批量 ctrl:图层ctrl批量拖动
        type: {
            type: String,
            default: 'pic'
        },
        // 提示框位置
        positionStyle: {
            type: Object,
            default: () => {
                return {
                    top: '60px',
                    left: '356px'
                }
            }
        },
        // 提示框大小
        boxStyle: {
            type: Object,
            default: () => {
                return {
                    width: '240px',
                    height: '224px'
                }
            }
        },
        // 是否显示箭头
        hasArrow: {
            type: Boolean,
            default: false
        },
        // 箭头样式
        // distance：离左上角(0,0)的距离
        // type: 四边：上:top下:bottom左:left右:right
        arrowStyle: {
            type: Object,
            default: () => {
                return {
                    distance: '220px',
                    type: 'top'
                }
            }
        }
    },
    data() {
        return {
            pic: GifPic,
            frame: GifFrame,
            text: GifText,
            mess: GifMess,
            copy: pngCopy,
            ctrl: CtrlGif
        }
    },
    computed: {
        getPositionStyle() {
            return this.positionStyle
        }
    },
    mounted() {
        if (this.hasArrow) {
            this.setArrowUI()
        }
    },
    methods: {
        setArrowUI() {
            const $arrow = this.$refs.arrow
            const arrowSize = '-16px'
            if (this.arrowStyle.type === 'top') {
                $arrow.css({
                    left: this.arrowStyle.distance,
                    top: arrowSize,
                    borderColor: 'transparent transparent rgba(204, 213, 219, 1) transparent'
                })
            } else if (this.arrowStyle.type === 'bottom') {
                $arrow.css({
                    left: this.arrowStyle.distance,
                    bottom: arrowSize,
                    borderColor: 'rgba(204, 213, 219, 1) transparent transparent transparent'
                })
            } else if (this.arrowStyle.type === 'left') {
                $arrow.css({
                    top: this.arrowStyle.distance,
                    left: arrowSize,
                    borderColor: 'transparent rgba(204, 213, 219, 1) transparent transparent'
                })
            } else if (this.arrowStyle.type === 'right') {
                $arrow.css({
                    top: this.arrowStyle.distance,
                    right: arrowSize,
                    borderColor: 'transparent transparent transparent rgba(204, 213, 219, 1)'
                })
            }
        },
        getCover() {
            if (this.type === 'pic') {
                return this.pic
            } else if (this.type === 'frame') {
                return this.frame
            } else if (this.type === 'text') {
                return this.text
            } else if (this.type === 'mess') {
                return this.mess
            } else if (this.type === 'copy') {
                return this.copy
            } else if (this.type === 'ctrl') {
                return this.ctrl
            }
        },
        close() {
            const helpNotifier = this.$el
            document.body.removeChild(helpNotifier)
            this.$destroy()
        }
    }
}
</script>

<style lang="scss">
.eqc-help-notifier {
    position: fixed;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    z-index: 100; //与错误提示层级一样
    .box {
        position: relative;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: center;
        border-radius: 4px;
        background: rgba(255, 255, 255, 1);
        box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
        .arrow {
            width: 0;
            height: 0;
            border-width: 8px;
            border-style: solid;
            // border-color: transparent transparent rgba(204, 213, 219, 1) transparent;
            position: absolute;
            // top: -20px;
            // left: auto;
        }
        .cover {
            width: 100%;
            height: 116px;
            border-radius: 4px 4px 0px 0px;
        }
        .copyBox {
            display: flex;
            align-items: center;
            justify-content: center;
            background: #ccd5db;
            width: 240px;
            height: 116px;
        }
        .tip {
            padding: 12px 16px;
            height: 40px;
            font-size: 14px;
            font-weight: 400;
            color: rgba(51, 51, 51, 1);
            line-height: 20px;
        }
        .close {
            width: 80px;
            height: 32px;
            background: rgba(255, 255, 255, 1);
            border-radius: 3px;
            border: 1px solid rgba(204, 213, 219, 1);
            font-size: 12px;
            font-weight: 400;
            color: rgba(79, 93, 105, 1);
            line-height: 32px;
            text-align: center;
            position: absolute;
            right: 16px;
            bottom: 16px;
            &:hover {
                color: #1593ff;
                border: 1px solid #1593ff;
            }
        }
    }
}
</style>
