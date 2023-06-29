<template>
    <div
        :style="css"
        class="eqc-stretch-bar"
    >
        <div
            ref="rightBar"
            class="bar right"
        >
            <div
                class="slide"
                @mousedown.stop.prevent="mousedown($event, 'right')"
            >
                <span
                    v-show="isDragRight"
                    class="tip right"
                >{{ realWidth + ' | ' + realHeight }}</span>
            </div>
        </div>
        <div
            ref="bottomBar"
            class="bar bottom"
        >
            <div
                class="slide"
                @mousedown.stop.prevent="mousedown($event, 'bottom')"
            >
                <span
                    v-show="isDragBottom"
                    class="tip bottom"
                >{{ realWidth + ' | ' + realHeight }}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            realWidth: 0,
            realHeight: 0,
            isDragRight: false,
            isDragBottom: false
        }
    },
    computed: {
        eqxPage() {
            return this.$store.state.scene.eqxPage
        },
        css() {
            return {
                width: this.eqxPage.width + 'px',
                height: this.eqxPage.height + 'px'
            }
        }
    },
    methods: {
        mousedown(e, type) {
            const { width, height, scale, eqxRange, eqxBackground } = this.eqxPage
            const $elRange = eqxRange.$el
            const $elBg = eqxBackground.$el
            const sceneJson = this.eqxPage.eqxScene.sceneJson
            const minSize = 50
            const maxSize = 5000
            const initX = e.pageX
            const initY = e.pageY
            const transform = /-?\d+/.exec(this.$refs[type + 'Bar'].css('transform')) || [0]
            const startDistance = Number(transform[0])
            let moveX = 0
            let moveY = 0
            let newWidth = width
            let newHeight = height

            this.realWidth = sceneJson.width
            this.realHeight = sceneJson.height

            const mousemove = e => {
                if (type === 'right') {
                    this.isDragRight = true
                    moveX = e.pageX - initX
                    const minDistance = (sceneJson.width - minSize) * scale
                    const maxDistance = (maxSize - sceneJson.width) * scale
                    let distance = startDistance + moveX
                    // 限制移动的范围
                    if (distance < -minDistance) {
                        distance = -minDistance
                    } else if (distance > maxDistance) {
                        distance = maxDistance
                    }
                    newWidth = width + distance
                    this.$refs.rightBar.css({ transform: `translateX(${distance}px)` })
                    this.$refs.bottomBar.css({ width: newWidth + 'px' })
                    $elRange.css({ width: newWidth + 'px' })
                    $elBg.css({ width: newWidth + 'px' })
                } else if (type === 'bottom') {
                    this.isDragBottom = true
                    moveY = e.pageY - initY
                    const minDistance = (sceneJson.height - minSize) * scale
                    const maxDistance = (maxSize - sceneJson.height) * scale
                    let distance = startDistance + moveY
                    // 限制移动的范围
                    if (distance < -minDistance) {
                        distance = -minDistance
                    } else if (distance > maxDistance) {
                        distance = maxDistance
                    }
                    newHeight = height + distance
                    this.$refs.bottomBar.css({ transform: `translateY(${distance}px)` })
                    this.$refs.rightBar.css({ height: newHeight + 'px' })
                    $elRange.css({ height: newHeight + 'px' })
                    $elBg.css({ height: newHeight + 'px' })
                }
                this.realWidth = Math.round(newWidth / scale)
                this.realHeight = Math.round(newHeight / scale)
            }
            const mouseup = e => {
                document.removeEventListener('mousemove', mousemove)
                document.removeEventListener('mouseup', mouseup)

                this.isDragRight = false
                this.isDragBottom = false

                const info = {
                    id: sceneJson.id,
                    type: 0,
                    width: this.realWidth,
                    height: this.realHeight
                }
                // 尺寸未变化时不调用接口
                if (info.width === sceneJson.width && info.height === sceneJson.height) {
                    // 重置width和height，避免缩放画布时bar未跟着变的问题
                    this.$refs.rightBar.css({ height: '' })
                    this.$refs.bottomBar.css({ width: '' })
                    // 重置被bar拖拽时影响的位置
                    $elRange.css({ width: '100%', height: '100%' })
                    $elBg.css({ width: '100%', height: '100%' })
                    return
                }
                this.api.scene.updateScene(info)
                    .then(res => {
                        sceneJson.type = info.type
                        sceneJson.width = info.width
                        sceneJson.height = info.height
                        const $elWorkspace = this.$el.parentElement
                        this.eqxPage.setScale('fit', $elWorkspace.offsetWidth, $elWorkspace.offsetHeight)
                        this.$refs.rightBar.css({
                            transform: '',
                            height: ''
                        })
                        this.$refs.bottomBar.css({
                            transform: '',
                            width: ''
                        })
                        // 重置被bar拖拽时影响的位置
                        $elRange.css({ width: '100%', height: '100%' })
                        $elBg.css({ width: '100%', height: '100%' })
                        // 重置被画布拖拽时影响的位置
                        this.$el.css({ transform: '' })
                    })
                    .catch(err => err && this.logger.error(err))
            }

            document.addEventListener('mousemove', mousemove)
            document.addEventListener('mouseup', mouseup)
        }
    }
}
</script>

<style lang="scss">
.eqc-stretch-bar {
    position: absolute;
    pointer-events: none;
    .bar {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        .slide {
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            background: #fff;
            box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.16);
            border-radius: 1px;
            pointer-events: auto;
            transition: all 0.3s;
            .tip {
                position: absolute;
                height: 20px;
                line-height: 20px;
                padding: 0 6px;
                text-align: center;
                white-space: nowrap;
                font-size: 12px;
                color: #fff;
                background: rgba(0, 0, 0, 0.7);
                border-radius: 3px;
                pointer-events: none;
                &.right {
                    right: 20px;
                }
                &.bottom {
                    bottom: 20px;
                }
            }
            &::after {
                content: "";
                display: block;
                transition: all 0.3s;
            }
            &:hover {
                background: $blue-normal;
                &::after {
                    border-color: #fff !important;
                }
            }
        }
        &.right {
            top: 0;
            right: -12px;
            height: 100%;
            width: 1px;
            border-left: 1px solid #76838f;
            .slide {
                width: 12px;
                height: 32px;
                cursor: ew-resize;
                &::after {
                    border-left: 1px solid #76838f;
                    border-right: 1px solid #76838f;
                    width: 4px;
                    height: 10px;
                }
            }
        }
        &.bottom {
            left: 0;
            bottom: -12px;
            width: 100%;
            height: 1px;
            border-top: 1px solid #76838f;
            .slide {
                height: 12px;
                width: 32px;
                cursor: ns-resize;
                &::after {
                    border-top: 1px solid #76838f;
                    border-bottom: 1px solid #76838f;
                    height: 4px;
                    width: 10px;
                }
            }
        }
    }
}
</style>
