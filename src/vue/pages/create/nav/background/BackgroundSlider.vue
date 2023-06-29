<template>
    <div class="eqc-background-slider">
        <div class="content-line">
            <div
                class="line"
                @click="choosePosition"
            />
            <div
                ref="blueLine"
                class="line-blue"
                @click="choosePosition"
            />
            <div
                ref="bigCircle"
                :style="{background:disable?'#ccd5db':'#1593ff'}"
                data-hint="双击复位"
                class="big-circle hint--top hint--rounded"
                @dblclick="reset"
            />
        </div>
        <div
            :style="{color:disable?'#ccd5db':'#252b3f'}"
            class="value"
        >
            {{ num }}
        </div>
    </div>
</template>

<script>
export default {
    props: {
        option: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            num: 0, // 展示参数
            color: null,
            dragState: false
        }
    },
    computed: {
        eqxPage() {
            return this.$store.state.scene.eqxPage
        },
        background() {
            return this.eqxPage.pageJson.properties.background
        },
        blur() {
            return this.eqxPage.pageJson.properties.background.blur
        },
        src() {
            return Vue.store.state.scene.eqxPage.pageJson.properties.background.middle.src
        },
        disable() {
            return this.src.length === 0
        }
    },
    watch: {
        background(newVal) {
            const newNum = newVal.blur
            if (this.num !== newNum) {
                const left = Math.ceil(newNum / 100 * 176)
                this.initCircle(left)
                this.num = newNum
            }
        },
        // blur(newVal) {
        //     if (this.num !== newVal) {
        //         let left = Math.ceil(newVal / 100 * 176)
        //         this.initCircle(left)
        //         this.num = newVal
        //     }
        // },
        disable(newVal) {
            if (newVal) {
                this.initCircle(0)
                this.num = 0
            }
        }
    },
    mounted() {
        this.initMove()
    },
    methods: {
        reset() {
            // 复位
            this.num = 0
            this.initCircle(0)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        choosePosition(e) {
            // 92 - 332 //减去最左边的导航条 再减去小圆圈的半径
            if (!this.disable) {
                const x = e.x - 92 - 8
                this.initCircle(x)
                this.eqxPage.eqxHistory.add(this.eqxPage)
            }
        },
        initMove() {
            const bigCircle = this.$refs.bigCircle
            const that = this
            bigCircle.onmousedown = function (event) {
                event.stopPropagation()
                event.preventDefault()
                const ev = event || window.event
                var disX = ev.clientX - bigCircle.offsetLeft
                document.onmousemove = function (event) {
                    if (!that.disable) {
                        var ev = event || window.event
                        that.initCircle(ev.clientX - disX)
                        that.dragState = true
                    }
                }
            }
            document.body.onmouseup = function () {
                document.onmousemove = null
                document.onmouseup = null
                // 拖拽完毕 添加历史记录
                if (that.dragState) {
                    that.eqxPage.eqxHistory.add(this.eqxPage)
                }
                that.dragState = false
            }
            if (this.blur !== 0) {
                const left = this.blur / 100 * 176 + 8
                this.initCircle(left, true)
            }
        },
        initCircle(val, noNeedSetBlur) {
            const bigCircle = this.$refs.bigCircle
            if (val < 0) {
                bigCircle.style.left = '8px'
            } else if (val > 176) {
                bigCircle.style.left = '184px'
            } else {
                bigCircle.style.left = `${val + 8}px`
            }
            // 计算百分比
            const left = parseInt(bigCircle.style.left)
            this.num = parseInt((left - 8) / 176 * 100)
            this.initBlueLine(left)
            if (!noNeedSetBlur) {
                this.setBackgroundBlur()
            }
        },
        initBlueLine(val) {
            const blueLine = this.$refs.blueLine.style
            blueLine.left = '16px'
            blueLine.width = `${val}px`
        },
        setBackgroundBlur() {
            this.eqxPage.eqxBackground.setBackgroundBlur(this.num)
        }
    }
}
</script>

<style lang="scss">
.eqc-background-slider {
    font-size: 13px;
    color: #252b3f;
    width: 256px;
    height: 30px;
    border: 1px solid #ccd5db;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 12px;
    .content-line {
        position: relative;
        width: 208px;
        height: 30px;
        padding-top: 14px;
        display: flex;
        justify-content: center;
        .line {
            width: 176px;
            height: 2px;
            cursor: pointer;
            background: #ccd5db;
        }
        .line-blue {
            position: absolute;
            height: 2px;
            width: 10px;
            left: 8px;
            top: 14px;
            cursor: pointer;
            background: #1593ff;
        }
        .big-circle {
            position: absolute;
            left: 8px;
            top: 6px;
            height: 6px;
            width: 6px;
            border-radius: 50%;
            border: 5px solid white;
            background: #1593ff;
            box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.08);
            box-sizing: content-box;
            cursor: pointer;
        }
    }
    .value {
        width: 48px;
        border-left: 1px solid #ccd5db;
        height: 100%;
        text-align: center;
        line-height: 28px;
    }
}
</style>
