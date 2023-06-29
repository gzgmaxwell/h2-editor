<template>
    <div class="eqc-ruler-line">
        <div
            :style="{width: eqxPage.width + 'px', height: eqxPage.height + 'px', transform: `translate(${eqxPage.moveX}px, ${eqxPage.moveY}px)`}"
            class="ruler-line"
        >
            <div
                v-for="item of ruler.xLines"
                :id="item.id"
                :key="item.id"
                :style="{left: item.left * eqxPage.scale - 1 + 'px'}"
                class="line y"
                @dblclick="deleteXline"
                @mousedown.stop.prevent="dragXLine"
            />
            <div
                v-for="item of ruler.yLines"
                :id="item.id"
                :key="item.id"
                :style="{top: item.top * eqxPage.scale - 1 + 'px'}"
                class="line x"
                @dblclick="deleteYline"
                @mousedown.stop.prevent="dragYLine"
            />
        </div>
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
import storageLocal from '../../../../utils/storageLocal'

export default {
    data() {
        return {
            tip: {
                left: 0,
                top: 0,
                value: 0,
                show: false
            },
            rulerWidth: 20
        }
    },
    computed: {
        ruler() {
            return this.$store.state.guideLine.ruler
        },
        eqxPage() {
            return this.$store.state.scene.eqxPage
        }
    },
    methods: {
        dragXLine(e) {
            const workspaceRect = this.$parent.$el.getBoundingClientRect()
            const initX = e.clientX
            const xLines = this.ruler.xLines
            const i = xLines.findIndex(item => item.id === e.target.id)
            const initLeft = xLines[i].left

            document.body.css({
                cursor: 'col-resize'
            })
            // 避免移到标尺上时，出现另外一条参考线
            this.$parent.$refs.rulerBar.$refs.rulerLeft.css({
                pointerEvents: 'none'
            })
            this.$parent.$refs.rulerBar.$refs.rulerTop.css({
                pointerEvents: 'none'
            })

            const mousemove = e => {
                const moveX = e.clientX - initX
                xLines[i].left = initLeft + moveX / this.eqxPage.scale
                this.tip = {
                    left: e.clientX - workspaceRect.left + 10 + 'px',
                    top: e.clientY - workspaceRect.top - 10 + 'px',
                    value: Math.round(xLines[i].left),
                    show: true
                }
            }

            const mouseup = e => {
                if (e.clientX < workspaceRect.left + this.rulerWidth || e.clientX > workspaceRect.right) {
                    this.deleteXline(e)
                }
                this.tip.show = false
                document.body.css({
                    cursor: ''
                })
                this.$parent.$refs.rulerBar.$refs.rulerLeft.css({
                    pointerEvents: ''
                })
                this.$parent.$refs.rulerBar.$refs.rulerTop.css({
                    pointerEvents: ''
                })
                document.removeEventListener('mousemove', mousemove)
                document.removeEventListener('mouseup', mouseup)
            }

            document.addEventListener('mousemove', mousemove)
            document.addEventListener('mouseup', mouseup)
        },
        dragYLine(e) {
            const workspaceRect = this.$parent.$el.getBoundingClientRect()
            const initY = e.clientY
            const yLines = this.ruler.yLines
            const i = yLines.findIndex(item => item.id === e.target.id)
            const initTop = yLines[i].top

            document.body.css({
                cursor: 'row-resize'
            })
            this.$parent.$refs.rulerBar.$refs.rulerTop.css({
                pointerEvents: 'none'
            })
            this.$parent.$refs.rulerBar.$refs.rulerLeft.css({
                pointerEvents: 'none'
            })

            const mousemove = e => {
                const moveY = e.clientY - initY
                yLines[i].top = initTop + moveY / this.eqxPage.scale
                this.tip = {
                    left: e.clientX - workspaceRect.left - 18 + 'px',
                    top: e.clientY - workspaceRect.top - 30 + 'px',
                    value: Math.round(yLines[i].top),
                    show: true
                }
            }

            const mouseup = e => {
                if (e.clientY < workspaceRect.top + this.rulerWidth || e.clientY > workspaceRect.bottom) {
                    this.deleteYline(e)
                }
                this.tip.show = false
                document.body.css({
                    cursor: ''
                })
                this.$parent.$refs.rulerBar.$refs.rulerTop.css({
                    pointerEvents: ''
                })
                this.$parent.$refs.rulerBar.$refs.rulerLeft.css({
                    pointerEvents: ''
                })
                document.removeEventListener('mousemove', mousemove)
                document.removeEventListener('mouseup', mouseup)
            }

            document.addEventListener('mousemove', mousemove)
            document.addEventListener('mouseup', mouseup)
        },
        deleteXline(e) {
            this.$store.commit('RULER_TOP_DELETE', { id: e.target.id })
            this.setConfigHistory()
        },
        deleteYline(e) {
            this.$store.commit('RULER_LEFT_DELETE', { id: e.target.id })
            this.setConfigHistory()
        },
        setConfigHistory() {
            const key = storageLocal.key.rulerConfigHistory
            storageLocal.setItem(key, this.ruler)
        }
    }
}
</script>

<style lang="scss">
.eqc-ruler-line {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    .ruler-line {
        position: absolute;
        .line {
            position: absolute;
            pointer-events: auto;
            // 横线
            &.x {
                left: -40000px;
                width: 100000px; // 用100%不符合需求
                height: 3px;
                background: linear-gradient(to bottom, transparent 33.3%, #53ebef 0, #53ebef 66.6%, transparent 0);
                cursor: row-resize;
            }
            // 竖线
            &.y {
                top: -40000px;
                width: 3px;
                height: 100000px;
                background: linear-gradient(to right, transparent 33.3%, #53ebef 0, #53ebef 66.6%, transparent 0);
                cursor: col-resize;
            }
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
