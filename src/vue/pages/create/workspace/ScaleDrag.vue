<template>
    <div class="eqc-scale-drag" />
</template>

<script>
export default {
    computed: {
        eqxPage() {
            return this.$store.state.scene.eqxPage
        }
    },
    mounted() {
        this.$el.addEventListener('mousedown', e => {
            const { offsetHeight: workspaceHeight, offsetWidth: workspaceWidth } = this.$parent.$el
            const { offsetTop: pageTop, offsetLeft: pageLeft } = this.eqxPage.$el
            const { moveX: tranlsateX, moveY: tranlsateY, width: pageWidth, height: pageHeight } = this.eqxPage
            const initX = e.pageX
            const initY = e.pageY
            const margin = 400 // 上下留出的距离
            const $streachBar = this.$parent.$el.querySelector('.eqc-stretch-bar')

            this.$el.css({ cursor: '-webkit-grabbing' }) // 手抓

            const mousemove = e => {
                // 画布总移动距离
                let moveX = tranlsateX + (e.pageX - initX)
                let moveY = tranlsateY + (e.pageY - initY)

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
                if ($streachBar) {
                    $streachBar.css({
                        marginLeft: moveX + 'px',
                        marginTop: moveY + 'px'
                    })
                }
            }

            const mouseup = e => {
                document.removeEventListener('mousemove', mousemove)
                document.removeEventListener('mouseup', mouseup)
                this.$el.css({ cursor: '-webkit-grab' }) // 手掌
            }

            document.addEventListener('mousemove', mousemove)
            document.addEventListener('mouseup', mouseup)
        })
    }

}
</script>

<style lang="scss">
.eqc-scale-drag {
    display: none;
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: auto;
}
</style>
