<template>
    <div
        :class="{active: showPreview}"
        class="eqc-photo-scale-preview"
    >
        <div
            ref="cover"
            :style="{width: sceneJson.width * ratioPage + 'px', height: sceneJson.height * ratioPage + 'px'}"
            class="cover"
        />
        <div class="container">
            <div
                ref="box"
                class="box"
                @mousedown="drag"
            />
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            maxSizeCover: 150,
            maxSizeMask: 150 + 20 * 2,
            showPreview: false
        }
    },
    computed: {
        photoScene() {
            return Vue.store.state.photoScene
        },
        eqxPage() {
            return this.photoScene.eqxPage
        },
        sceneJson() {
            return this.photoScene.eqxScene.sceneJson
        },
        ratioPage() {
            return this.maxSizeCover / Math.max(this.sceneJson.width, this.sceneJson.height)
        }
    },
    watch: {
        'eqxPage.scale'() {
            this.setBoxRect()
        },
        'eqxPage.moveX'() {
            this.setBoxRect()
        },
        'eqxPage.moveY'() {
            this.setBoxRect()
        }
    },
    methods: {
        setBoxRect() {
            const { scale, moveX, moveY } = this.eqxPage
            const { offsetWidth: workspaceWidth, offsetHeight: workspaceHeight } = this.$parent.$el
            this.$refs.box.css({
                width: workspaceWidth * this.ratioPage / scale + 'px',
                height: workspaceHeight * this.ratioPage / scale + 'px',
                transform: `translate(${-moveX * this.ratioPage / scale}px, ${-moveY * this.ratioPage / scale}px)`
            })
            if (this.eqxPage.width <= workspaceWidth && this.eqxPage.height <= workspaceHeight) {
                this.showPreview = false
                this.$refs.box.css({
                    transform: ''
                })
            } else {
                this.showPreview = true
            }
        },
        drag(e) {
            e.preventDefault()
            e.stopPropagation()

            const { offsetWidth: workspaceWidth, offsetHeight: workspaceHeight } = this.$parent.$el
            const { offsetTop: pageTop, offsetLeft: pageLeft } = this.eqxPage.$el
            const { scale, moveX: tranlsateX, moveY: tranlsateY, width: pageWidth, height: pageHeight } = this.eqxPage
            const initX = e.pageX
            const initY = e.pageY
            const margin = 400 // 上下留出的距离
            const $streachBar = this.$parent.$el.querySelector('.eqc-stretch-bar')

            this.$refs.box.css({ cursor: '-webkit-grabbing' }) // 手抓

            const mousemove = e => {
                // 画布总移动距离
                let moveX = tranlsateX - (e.pageX - initX) * scale / this.ratioPage
                let moveY = tranlsateY - (e.pageY - initY) * scale / this.ratioPage

                // 画布比较小时无法滚动
                if (pageHeight + margin * 2 < workspaceHeight) {
                    return
                }
                if (pageWidth + margin * 2 < workspaceWidth) {
                    return
                }
                // 画布上方只能留一定的距离
                if (moveY > -(pageTop - margin)) {
                    moveY = -(pageTop - margin)
                }
                // 画布下方只能留一定的距离
                if (moveY < -((pageHeight - workspaceHeight) / 2 + margin)) {
                    moveY = pageTop - margin
                }
                // 画布左方只能留一定的距离
                if (moveX > -(pageLeft - margin)) {
                    moveX = -(pageLeft - margin)
                }
                // 画布右方只能留一定的距离
                if (moveX < -((pageWidth - workspaceWidth) / 2 + margin)) {
                    moveX = pageLeft - margin
                }

                this.eqxPage.setMove(moveX, moveY)
                $streachBar && $streachBar.css({
                    transform: `translate(${moveX}px,${moveY}px)`
                })
            }

            const mouseup = e => {
                document.removeEventListener('mousemove', mousemove)
                document.removeEventListener('mouseup', mouseup)
                this.$refs.box.css({ cursor: '' }) // 手掌
            }

            document.addEventListener('mousemove', mousemove)
            document.addEventListener('mouseup', mouseup)
        }
    }
}
</script>

<style lang="scss">
.eqc-scale-preview {
    position: absolute;
    right: 10px;
    bottom: 10px;
    background: #eceef0;
    border-radius: 4px;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.16);
    transform: scale(0);
    transform-origin: bottom right;
    transition: all 0.3s;
    z-index: 3;
    &.active {
        transform: scale(1);
    }
    .cover {
        margin: 20px;
        background: #fff;
    }
    .container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        .box {
            flex: none;
            border: 1px solid $blue-normal;
            background: rgba(21, 147, 255, 0.1);
            cursor: -webkit-grab;
        }
    }
}
</style>
