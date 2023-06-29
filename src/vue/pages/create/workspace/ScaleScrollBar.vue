<template>
    <div
        :class="{active: showScrollBar}"
        class="eqc-scale-scroll-bar"
    >
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
            showScrollBar: false
        }
    },
    computed: {
        scene() {
            return this.$store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        sceneJson() {
            return this.scene.eqxScene.sceneJson
        },
        ratioPage() {
            return this.maxSizeCover / this.sceneJson.width
        }
    },
    watch: {
        'eqxPage.scale'() {
            this.setBarRect()
        },
        'eqxPage.moveX'() {
            this.setBarRect()
        },
        'eqxPage.moveY'() {
            this.setBarRect()
        }
    },
    methods: {
        setBarRect() {
            const { moveX } = this.eqxPage
            const { offsetWidth: workspaceWidth } = this.$parent.$el
            this.$refs.box.css({
                width: workspaceWidth * 2 - (this.eqxPage.width) + 'px',
                transform: `translate(${-moveX}px, 0px)`
            })
            if (this.eqxPage.width <= workspaceWidth) {
                this.showScrollBar = false
                this.$refs.box.css({
                    transform: ''
                })
            } else {
                this.showScrollBar = true
            }
        },
        drag(e) {
            e.preventDefault()
            e.stopPropagation()
            const { offsetWidth: workspaceWidth } = this.$parent.$el
            const { moveX: tranlsateX, moveY } = this.eqxPage
            const initX = e.pageX
            const $streachBar = this.$parent.$el.querySelector('.eqc-stretch-bar')

            this.$refs.box.css({ cursor: '-webkit-grabbing' }) // 手抓

            const mousemove = e => {
                // 画布总移动距离
                const moveX = tranlsateX - (e.pageX - initX)
                const maxDis = parseInt((workspaceWidth - parseFloat(this.$refs.box.style.width)) / 2)
                if (Math.abs(moveX) > maxDis) {
                    return
                }
                this.eqxPage.setMove(moveX, moveY)
                $streachBar && $streachBar.css({
                    marginLeft: moveX + 'px',
                    marginTop: moveY + 'px'
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
.eqc-scale-scroll-bar {
    position: absolute;
    right: 0;
    bottom: 52px;
    width: 100%;
    height: 8px;
    transform: scale(0);
    background: transparent;
    transition: all 0.3s;
    &.active {
        transform: scale(1);
    }
    .container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        .box {
            height: 100%;
            background: rgba(206, 206, 206, 1);
            cursor: -webkit-grab;
            border-radius: 10px;
        }
    }
}
</style>
