<template>
    <div class="eqc-ruler-bar">
        <canvas
            ref="rulerTop"
            class="top"
            @mousedown.stop.prevent="rulerTopMouseDown"
            @mouseover="rulerTopMouseEnter"
        />
        <canvas
            ref="rulerLeft"
            class="left"
            @mousedown.stop.prevent="rulerLeftMouseDown"
            @mouseover="rulerLeftMouseEnter"
        />
        <div
            class="square"
            @mousedown.stop
        />
        <div
            v-show="rulerTopLine.show"
            :style="{left: rulerTopLine.left + 'px'}"
            class="line y"
        />
        <div
            v-show="rulerLeftLine.show"
            :style="{top: rulerLeftLine.top + 'px'}"
            class="line x"
        />
        <div
            v-show="tip.show"
            :style="tip"
            class="tip"
        >
            {{ tip.value }}
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            tip: {
                left: 0,
                top: 0,
                value: 0,
                show: false
            },
            rulerTopLine: {
                left: 0,
                show: false
            },
            rulerLeftLine: {
                top: 0,
                show: false
            },
            rulerWidth: 20,
            fontSize: 12 * devicePixelRatio,
            fontTop: 2 * devicePixelRatio, // 字体和刻度间的距离
            fontWidth: 50 * devicePixelRatio,
            lineWidth: 1 * devicePixelRatio,
            isDraggingTop: false,
            isDraggingLeft: false
        }
    },
    computed: {
        scene() {
            return Vue.store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        eqxScene() {
            return this.scene.eqxScene
        },
        navPanel() {
            return Vue.store.state.layout.navPanel
        },
        scale() {
            return this.eqxPage.scale
        },
        px1() {
            return devicePixelRatio === 1 ? 0.5 : 0 // 解决canvas画1px模糊的问题
        },
        unit() {
            const unit = 10 // 10个像素为1个刻度
            let base = 1
            if (this.scale < 0.25) {
                base = 8
            } else if (this.scale < 0.5) {
                base = 4
            } else if (this.scale < 0.75) {
                base = 2
            } else if (this.scale < 1) {
                base = 1
            } else if (this.scale < 2) {
                base = 0.5
            } else {
                base = 0.25
            }
            return unit * base * devicePixelRatio
        },
        unitScale() {
            return this.unit * this.scale
        }
    },
    watch: {
        'eqxPage.moveX'() {
            this.$nextTick(() => this.renderRulerTop())
        },
        'eqxPage.moveY'() {
            this.$nextTick(() => this.renderRulerLeft())
        },
        'eqxPage.scale'() {
            this.$nextTick(() => {
                this.renderRulerTop()
                this.renderRulerLeft()
            })
        },
        'navPanel.show'() {
            // 需要等到动画时间结束，才能获得准确的值
            setTimeout(() => {
                this.renderRulerTop()
                this.renderRulerLeft()
            }, 300)
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.renderRulerTop()
            this.renderRulerLeft()
        })
    },
    methods: {
        rulerTopMouseDown() {
            this.isDraggingTop = true
            document.body.css({
                cursor: 'col-resize'
            })
            // 避免按住拖动时，线会显示在另一条标尺上，以及出现另外一条参考线的问题
            this.$refs.rulerLeft.css({
                zIndex: 1,
                pointerEvents: 'none'
            })
        },
        rulerLeftMouseDown() {
            this.isDraggingLeft = true
            document.body.css({
                cursor: 'row-resize'
            })
            // 避免按住拖动时，线会显示在另一条标尺上，以及出现另外一条参考线的问题
            this.$refs.rulerTop.css({
                zIndex: 1,
                pointerEvents: 'none'
            })
        },
        rulerTopMouseEnter() {
            const workspaceRect = this.$parent.$el.getBoundingClientRect()
            const pageRect = this.eqxPage.$el.getBoundingClientRect()
            this.rulerTopLine.show = true
            this.tip.show = true

            const mouseup = e => {
                this.addXLine(e)
                this.isDraggingTop = false
                document.body.css({
                    cursor: ''
                })
                this.$refs.rulerLeft.css({
                    zIndex: '',
                    pointerEvents: ''
                })
                // 按住拖动添加时，已经离开了标尺，所以需要处理一下
                if (e.target !== this.$refs.rulerTop) {
                    mouseleave()
                }
            }

            const mousemove = e => {
                this.rulerTopLine.left = e.clientX - workspaceRect.left
                this.tip = {
                    left: this.rulerTopLine.left + 10 + 'px',
                    top: '30px',
                    value: Math.round((e.clientX - pageRect.left) / this.eqxPage.scale),
                    show: true
                }
            }

            const mouseleave = () => {
                // 按住并移动时，线要一直存在
                if (this.isDraggingTop) {
                    return
                }
                this.rulerTopLine.show = false
                this.tip.show = false
                document.removeEventListener('mouseup', mouseup)
                document.removeEventListener('mousemove', mousemove)
                this.$refs.rulerTop.removeEventListener('mouseleave', mouseleave)
            }

            document.addEventListener('mouseup', mouseup)
            document.addEventListener('mousemove', mousemove)
            this.$refs.rulerTop.addEventListener('mouseleave', mouseleave)
        },
        rulerLeftMouseEnter() {
            const workspaceRect = this.$parent.$el.getBoundingClientRect()
            const pageRect = this.eqxPage.$el.getBoundingClientRect()
            this.rulerLeftLine.show = true
            this.tip.show = true

            const mouseup = e => {
                this.addYLine(e)
                this.isDraggingLeft = false
                document.body.css({
                    cursor: ''
                })
                this.$refs.rulerTop.css({
                    zIndex: '',
                    pointerEvents: ''
                })
                // 按住拖动添加时，已经离开了标尺，所以需要处理一下
                if (e.target !== this.$refs.rulerLeft) {
                    mouseleave()
                }
            }

            const mousemove = e => {
                this.rulerLeftLine.top = e.clientY - workspaceRect.top
                this.tip = {
                    left: '30px',
                    top: this.rulerLeftLine.top + 10 + 'px',
                    value: Math.round((e.clientY - pageRect.top) / this.eqxPage.scale),
                    show: true
                }
            }

            const mouseleave = () => {
                // 按住并移动时，线要一直存在
                if (this.isDraggingLeft) {
                    return
                }
                this.rulerLeftLine.show = false
                this.tip.show = false
                document.removeEventListener('mouseup', mouseup)
                document.removeEventListener('mousemove', mousemove)
                this.$refs.rulerLeft.removeEventListener('mouseleave', mouseleave)
            }

            document.addEventListener('mouseup', mouseup)
            document.addEventListener('mousemove', mousemove)
            this.$refs.rulerLeft.addEventListener('mouseleave', mouseleave)
        },
        addXLine(e) {
            const pageRect = this.eqxPage.$el.getBoundingClientRect()
            const workspaceRect = this.$parent.$el.getBoundingClientRect()
            const left = e.clientX - pageRect.left
            if (e.clientX > workspaceRect.left + this.rulerWidth && e.clientX < workspaceRect.right) {
                Vue.store.commit('RULER_TOP_ADD', { xLine: { id: 'rule_line_' + Date.now(), left: left / this.eqxPage.scale } })
            }
        },
        addYLine(e) {
            const pageRect = this.eqxPage.$el.getBoundingClientRect()
            const workspaceRect = this.$parent.$el.getBoundingClientRect()
            const top = e.clientY - pageRect.top
            if (e.clientY > workspaceRect.top + this.rulerWidth && e.clientY < workspaceRect.bottom) {
                Vue.store.commit('RULER_LEFT_ADD', { yLine: { id: 'rule_line_' + Date.now(), top: top / this.eqxPage.scale } })
            }
        },
        initCtx(canvas, width, height) {
            const ctx = canvas.getContext('2d')
            canvas.width = width
            canvas.height = height
            Object.assign(canvas.style, {
                width: width / devicePixelRatio + 'px',
                height: height / devicePixelRatio + 'px'
            })

            // 画背景
            ctx.fillStyle = '#fff'
            ctx.fillRect(0, 0, width, height)

            // 设置画刻度的样式
            ctx.font = `${this.fontSize}px sans-serif`
            ctx.textBaseline = 'top'
            ctx.lineWidth = this.lineWidth
            ctx.fillStyle = '#A3AFB7'
            ctx.strokeStyle = '#CCD5DB'

            return ctx
        },
        renderRulerTop() {
            const canvas = this.$refs.rulerTop
            const workspaceRect = this.$parent.$el.getBoundingClientRect()
            const pageRect = this.getEqxPageBoundingClientRect()
            const height = 20 * devicePixelRatio
            const width = workspaceRect.width * devicePixelRatio - height
            const origin = (pageRect.left - workspaceRect.left) * devicePixelRatio - height
            const ctx = this.initCtx(canvas, width, height)

            // 画底部的横线
            ctx.moveTo(0, height - devicePixelRatio + 1 - this.px1)
            ctx.lineTo(width, height - devicePixelRatio + 1 - this.px1)

            const renderRuler = i => {
                const x = Math.round(origin + i * this.unitScale)
                if (i % 10 === 0) { // 大刻度
                    ctx.moveTo(x - this.px1, 0)
                    ctx.lineTo(x - this.px1, height)

                    ctx.fillText(i * this.unit / devicePixelRatio, x + this.fontTop, this.fontTop, this.fontWidth)
                } else if (i % 5 === 0) { // 中刻度
                    ctx.moveTo(x - this.px1, height * 0.5)
                    ctx.lineTo(x - this.px1, height)
                } else { // 小刻度
                    ctx.moveTo(x - this.px1, height * 0.75)
                    ctx.lineTo(x - this.px1, height)
                }
            }
            // 画正刻度
            for (let i = 0; i <= (workspaceRect.right - pageRect.left) * devicePixelRatio / this.unitScale; i++) {
                renderRuler(i)
            }
            // 画负刻度
            for (let i = 0; i >= (workspaceRect.left - pageRect.left) * devicePixelRatio / this.unitScale; i--) {
                renderRuler(i)
            }
            ctx.stroke()
        },
        renderRulerLeft() {
            const canvas = this.$refs.rulerLeft
            const workspaceRect = this.$parent.$el.getBoundingClientRect()
            const pageRect = this.getEqxPageBoundingClientRect()
            const width = 20 * devicePixelRatio
            const height = workspaceRect.height * devicePixelRatio - width
            const origin = (pageRect.top - workspaceRect.top) * devicePixelRatio - width
            const ctx = this.initCtx(canvas, width, height)

            // 画右边的竖线
            ctx.moveTo(width - devicePixelRatio + 1 - this.px1, 0)
            ctx.lineTo(width - devicePixelRatio + 1 - this.px1, height)

            const renderRuler = i => {
                const y = Math.round(origin + i * this.unitScale)
                if (i % 10 === 0) {
                    ctx.moveTo(0, y - this.px1)
                    ctx.lineTo(width, y - this.px1)

                    // 旋转文字
                    ctx.save()
                    ctx.translate(this.fontTop - 4, y - 4 + this.fontTop)
                    ctx.rotate(Math.PI / 180 * 270)
                    ctx.translate(-(this.fontTop - 4), -(y - 4 + this.fontTop))
                    ctx.fillText(i * this.unit / devicePixelRatio, this.fontTop, y + this.fontTop, this.fontWidth)
                    ctx.restore()
                } else if (i % 5 === 0) {
                    ctx.moveTo(width * 0.5, y - this.px1)
                    ctx.lineTo(width, y - this.px1)
                } else {
                    ctx.moveTo(width * 0.75, y - this.px1)
                    ctx.lineTo(width, y - this.px1)
                }
            }
            // 画正刻度
            for (let i = 0; i <= (workspaceRect.bottom - pageRect.top) * devicePixelRatio / this.unitScale; i++) {
                renderRuler(i)
            }
            // 画负刻度
            for (let i = 0; i >= (workspaceRect.top - pageRect.top) * devicePixelRatio / this.unitScale; i--) {
                renderRuler(i)
            }
            ctx.stroke()
        },
        getEqxPageBoundingClientRect() {
            if (this.eqxPage.$el !== null) {
                return this.eqxPage.$el.getBoundingClientRect()
            } else {
                const pages = this.eqxScene.eqxPages.filter((item, index, arr) => {
                    return item.$el !== null
                })
                if (pages.length <= 0) {
                    return
                }
                return pages[0].$el.getBoundingClientRect()
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-ruler-bar {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    canvas {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: auto;
        &.top {
            left: 20px;
            cursor: col-resize;
        }
        &.left {
            top: 20px;
            cursor: row-resize;
        }
    }
    .square {
        position: absolute;
        left: 0;
        top: 0;
        width: 20px;
        height: 20px;
        border-right: 1px solid #ccd5db;
        border-bottom: 1px solid #ccd5db;
        background: #fff;
        pointer-events: auto;
        z-index: 1;
    }
    .line {
        position: absolute;
        &.y {
            top: 0;
            width: 1px;
            height: 100%;
            background: #53ebef;
        }
        &.x {
            left: 0;
            height: 1px;
            width: 100%;
            background: #53ebef;
        }
    }
    .tip {
        position: absolute;
        width: 36px;
        height: 20px;
        line-height: 20px;
        text-align: center;
        font-size: 12px;
        color: #fff;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 3px;
    }
}
</style>
