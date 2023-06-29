<template>
    <div class="eqc-filter-slider">
        <div class="slider-header">
            <span>强度</span>
            <span>{{ num+'%' }}</span>
        </div>
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
                class="big-circle"
            />
        </div>
    </div>
</template>

<script>
import filterHelper from '../../../../../util/filterHelper'
export default {
    props: {
        option: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            num: 100, // 展示参数
            glCanvas: null,
            texture: null
        }
    },
    computed: {
        photoFilter() {
            return Vue.store.state.photoFilter
        },
        primaryImgData() {
            return this.photoFilter.primaryImgData
        }
    },
    watch: {
        option: {
            handler() {
                if (!this.option.state) {
                    this.reset()
                    document.onmousemove = null
                    document.onmouseup = null
                } else {
                    this.initMove()
                }
            },
            deep: true
        }
    },
    mounted() {
        this.initMove()
    },
    methods: {
        reset() {
            this.num = 100
            this.$refs.blueLine.style.width = '240px'
            this.$refs.bigCircle.style.left = '240px'
        },
        choosePosition(e) {
            // 92 - 332 //减去最左边的导航条 再减去小圆圈的半径
            const x = e.x - 92 - 8
            this.initCircle(x)
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
                    var ev = event || window.event
                    that.initCircle(ev.clientX - disX)
                }
            }
            document.body.onmouseup = function () {
                document.onmousemove = null
                document.onmouseup = null
                this.glCanvas = null
                this.texture = null
            }
        },
        initCircle(val) {
            const bigCircle = this.$refs.bigCircle
            if (val < 0) {
                bigCircle.style.left = '0'
            } else if (val > 240) {
                bigCircle.style.left = '240px'
            } else {
                bigCircle.style.left = `${val}px`
            }
            // 计算百分比
            const left = parseInt(bigCircle.style.left)
            this.num = parseInt(left / 240 * 100)
            this.initBlueLine(left)
            this.setEffectByConfig()
        },
        initBlueLine(val) {
            const blueLine = this.$refs.blueLine.style
            blueLine.left = '0'
            blueLine.width = `${val}px`
        },
        setEffectByConfig() {
            // 根据配置调整 主画布
            if (!this.glCanvas) {
                this.glCanvas = document.getElementsByClassName('eqc-photo-background-image-webgl')[0]
            }
            const effect = {}
            for (const key in this.option.effect) {
                effect[key] = this.option.effect[key] * this.num / 100
            }
            if (this.texture) {
                filterHelper.getEffectWithTexture(this.glCanvas, this.texture, effect)
            } else {
                const imgNode = new Image()
                imgNode.src = this.primaryImgData
                const that = this
                imgNode.onload = function () {
                    that.texture = that.glCanvas.texture(imgNode)
                    filterHelper.getEffectWithTexture(that.glCanvas, that.texture, effect)
                }
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-filter-slider {
    font-size: 13px;
    color: #252b3f;
    width: 256px;
    height: 52px;
    margin-top: 8px;
    position: relative;
    .slider-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #2f3c4d;
        font-size: 12px;
        font-weight: 400;
    }
    .content-line {
        position: relative;
        width: 256px;
        height: 30px;
        padding-top: 14px;
        display: flex;
        justify-content: center;
        margin-top: 4px;
        .line {
            width: 256px;
            height: 2px;
            cursor: pointer;
            background: #ccd5db;
        }
        .line-blue {
            position: absolute;
            height: 2px;
            left: 0;
            width: 240px;
            top: 14px;
            cursor: pointer;
            background: #1593ff;
        }
        .big-circle {
            position: absolute;
            top: 6px;
            height: 6px;
            left: 240px;
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
