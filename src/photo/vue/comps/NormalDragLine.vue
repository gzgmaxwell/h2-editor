<template>
    <div class="eqc-normal-drag-line">
        <div
            v-if="option.type !== 3"
            class="head"
        >
            <span>{{ option.name }}</span>
            <span>{{ num }}</span>
        </div>
        <div
            :class="{'h16':option.type === 3}"
            class="content-line"
        >
            <div
                :style="option.css"
                class="line"
                @click="choosePosition"
            />
            <div
                v-if="option.type === 1 || option.type === 4"
                ref="blueLine"
                class="line-blue"
                @click="choosePosition"
            />
            <div
                ref="bigCircle"
                :data-hint="option.type === 4?'':'双击复位'"
                class="big-circle hint--top hint--rounded"
                @dblclick="reset"
            />
        </div>
        <div
            v-if="option.type === 3"
            class="head tail h16"
        >
            <span>{{ option.nameLeft }}</span>
            <span>{{ option.nameRight }}</span>
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
            dragState: false,
            isHistory: false
        }
    },
    computed: {
        selectType() {
            return Vue.store.state.photoLayout.nav.selectedItem.type
        },
        photoScene() {
            return Vue.store.state.photoScene
        },
        eqxPage() {
            return this.photoScene.eqxPage
        },
        photoBase() {
            return Vue.store.state.photoBase.base
        },
        photoRotate() {
            return Vue.store.state.photoRotate
        }
    },
    watch: {
        num(newVal) {
            if (this.option.type === 4) {
                Vue.store.commit('PHOTO_ROTATE_REVISE_CHANGE', { val: this.num })
            } else {
                if (!this.isHistory) {
                    Vue.store.commit('PHOTO_BASE_CHANGE', { name: this.option.key, val: this.num, color: this.color, range: this.option.range })
                }
            }
        },
        photoBase: {
            handler() {
                if (this.photoBase[this.option.key] && this.num !== this.photoBase[this.option.key].val) {
                    this.isHistory = true
                    this.num = this.photoBase[this.option.key].val
                    const maxNum = this.option.maxNum ? this.option.maxNum : 100
                    this.initCircle(this.num / maxNum * 120 + 120) // 回退到单位1  然后模拟px
                }
            },
            deep: true
        },
        photoRotate: {
            handler() {
                if (this.photoRotate[this.option.key] && this.num !== this.photoRotate[this.option.key].val) {
                    this.num = this.photoRotate[this.option.key].val
                    const maxNum = this.option.maxNum ? this.option.maxNum : 100
                    this.initCircle(this.num / maxNum * 120 + 120) // 回退到单位1  然后模拟px
                }
            },
            deep: true
        },
        selectType(newVal) {
            if (newVal === 'base' || newVal === 'rotate') {
                this.initMove() // 重新初始化
            }
        }
    },
    mounted() {
        this.initMove()
        this.initColor(0)
    },
    methods: {
        setBackgroundAndHistory() {
            const canvasNode = document.getElementsByClassName('eqc-photo-background-image')[0]
            const background = {
                src: canvasNode.toDataURL(),
                width: canvasNode.width,
                height: canvasNode.height
            }
            this.eqxPage.eqxBackground.setBackground(background)
            // this.eqxPage.eqxHistory.add('base') // 加入history
        },
        reset() {
            if (this.option.type === 4) {
                return
            }
            // 复位
            this.num = 0
            if (this.option.isSingle) {
                this.initCircle(0)
            } else {
                this.initCircle(120)
            }
            // 给渲染留时间之后 再去保存
            setTimeout(() => {
                this.setBackgroundAndHistory()
            }, 100)
        },
        updateDragState(flag) {
            if (this.dragState !== flag) {
                Vue.store.commit('PHOTO_PARAM_DRAG_STATE', flag)
            }
            this.dragState = flag
        },
        choosePosition(e) {
            if (this.option.type === 4) {
                return
            }
            this.isHistory = false
            // 92 - 332 //减去最左边的导航条 再减去小圆圈的半径
            const x = e.x - 92 - 8
            this.initCircle(x)
            setTimeout(() => {
                this.setBackgroundAndHistory()
            }, 100)
        },
        initMove() {
            const bigCircle = this.$refs.bigCircle
            const that = this
            bigCircle.onmousedown = function (event) {
                event.stopPropagation()
                event.preventDefault()
                const ev = event || window.event
                var disX = ev.clientX - bigCircle.offsetLeft
                that.dragState = false
                that.updateDragState(true)
                document.onmousemove = function (event) {
                    var ev = event || window.event
                    that.isHistory = false
                    that.initCircle(ev.clientX - disX)
                }
            }
            document.body.onmouseup = function () {
                if ((Vue.store.state.photoLayout.nav.selectedItem.type === 'base' || Vue.store.state.photoLayout.nav.selectedItem.type === 'rotate') && Vue.store.state.photoScene.isUploadImage) {
                    that.dragState = true
                    that.updateDragState(false)
                    document.onmousemove = null
                    document.onmouseup = null
                }
            }
        },
        initCircle(val) {
            const bigCircle = this.$refs.bigCircle
            if (val < 0) {
                bigCircle.style.left = 0
            } else if (val > 240) {
                bigCircle.style.left = '240px'
            } else {
                bigCircle.style.left = `${val}px`
            }
            // 计算百分比
            const left = parseInt(bigCircle.style.left)
            this.initColor(parseInt((left - 120) / 1.2))
            if (this.option.maxNum || this.option.isSingle) {
                // 如果配置了最大拖动范围
                if (this.option.isSingle) {
                    // 单向
                    this.num = parseInt(left / 240 * this.option.maxNum)
                } else {
                    this.num = parseInt((left - 120) / 120 * this.option.maxNum) // 双向
                }
            } else {
                this.num = parseInt((left - 120) / 1.2)
            }

            this.initBlueLine(left)
            if (this.option.type === 3) {
                this.$emit('onchange', this.option.key, this.num)
            }
        },
        initBlueLine(val) {
            if (this.option.type === 1 || this.option.type === 4) {
                const blueLine = this.$refs.blueLine.style
                if (val > 120) {
                    blueLine.left = '120px'
                    blueLine.width = `${val - 120 + 10}px`
                } else {
                    blueLine.left = `${val}px`
                    blueLine.width = `${120 - val}px`
                }
            }
        },
        initColor(percent) {
            if (this.option.type === 2 || this.option.type === 3) {
                const bigCircle = this.$refs.bigCircle
                const colorObj = this.getColorByPercent(percent)
                bigCircle.style.background = `rgb(${colorObj.r},${colorObj.g},${colorObj.b})`
                this.color = '#' + colorObj.r.toString(16) + colorObj.g.toString(16) + colorObj.b.toString(16)
            }
        },
        getColorByPercent(percent) {
            // 得到对应百分比的color值
            if (this.option.colorConfig) {
                const newPercent = (percent + 100) / 2 // 因为num的范围是从-100 到100
                const matchIndex = this.option.colorConfig.indexOf(this.option.colorConfig.find(item => item.percent >= newPercent))
                const big = this.option.colorConfig[matchIndex]
                let small = { r: 0, g: 0, b: 0, percent: 0 }
                if (matchIndex > 0) {
                    small = this.option.colorConfig[matchIndex - 1]
                }
                const percentEnd = (newPercent - small.percent) / (big.percent - small.percent)
                return {
                    r: this.calculateColor(small.r, big.r, percentEnd),
                    g: this.calculateColor(small.g, big.g, percentEnd),
                    b: this.calculateColor(small.b, big.b, percentEnd)
                }
            }
        },
        calculateColor(val1, val2, percent) {
            if (val1 < val2) {
                return parseInt(val2 - (val2 - val1) * (1 - percent))
            } else {
                return parseInt(val2 + (val1 - val2) * (1 - percent))
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-normal-drag-line {
    font-size: 12px;
    color: #222222;
    .head {
        display: flex;
        justify-content: space-between;
        height: 20px;
        line-height: 20px;
        margin-top: 4px;
    }
    .tail {
        color: #999999;
    }
    .h16 {
        height: 16px !important;
        line-height: 16px;
    }
    .content-line {
        position: relative;
        height: 24px;
        padding-top: 12px;
        .line {
            width: 240px;
            height: 2px;
            cursor: pointer;
            background: #ccd5db;
        }
        .line-blue {
            position: absolute;
            height: 2px;
            width: 10px;
            left: 120px;
            top: 12px;
            cursor: pointer;
            background: #1593ff;
        }
        .big-circle {
            position: absolute;
            left: 50%;
            top: 5px;
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
}
</style>
