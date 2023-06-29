import waterAuthor from '../../config/watermarkAuthor'
import waterMarker from '../../utils/watermarker'
import eqxiuMaskImg from '../../img/wm/eqxiumask.svg'
import eqxiuMaskCloseImg from '../../img/wm/close.svg'
export default class EqxWaterMark {
    constructor(eqxPage) {
        this.eqxPage = eqxPage
        this.pageJson = eqxPage.pageJson
        this.$el = null
        this.render()
    }

    render() {
        const css = {
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            zIndex: 1000, // 需要设置一个比较大的值，在所有组件之上，但在选择框之下
            pointerEvents: 'none'
        }
        this.$el = document.createElement('div')
            .attr({ class: 'eqc-watermark' })
            .css(css)

        const closeCss = {
            position: 'absolute',
            background: `url(${eqxiuMaskCloseImg}) no-repeat center/contain`,
            pointerEvents: 'auto',
            cursor: 'pointer'
        }

        this.$close = document.createElement('div')
            .attr({ class: 'eqc-wm-close' })
            .css(closeCss)
        this.$el.appendChild(this.$close)

        this.drawWaterMarkClose()
        this.drawWaterMark()
    }

    setScale() {
        this.drawWaterMarkClose()
        this.drawWaterMark()
    }

    drawWaterMarkClose() {
        if (!waterAuthor.checkWaterAuthor() && !Vue.store.state.scene.isGetCoverWithoutWatermark) {
            const { width, eqxScene: { sceneJson }, scale } = this.eqxPage
            const bleedpx = Vue.filter('mm2px')(sceneJson.bleed) * scale
            const realWidth = parseInt(12 * width / 640)
            const markWidth = parseInt(128 * 2 * width / 640)
            const markHeight = parseInt(24 * 2 * markWidth / 256)
            const sizeCss = {
                right: (bleedpx + 4) + 'px',
                bottom: (markHeight + 14 + bleedpx - realWidth * 0.5) + 'px',
                width: realWidth + 'px',
                height: realWidth + 'px'
            }
            this.$close.css(sizeCss)
        } else {
            this.$close.remove()
        }
    }

    drawWaterMark() {
        if (!waterAuthor.checkWaterAuthor() && !Vue.store.state.scene.isGetCoverWithoutWatermark) {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.src = eqxiuMaskImg
            img.onload = () => {
                const { eqxScene: { sceneJson } } = this.eqxPage
                const bgimg = waterMarker.logoMark(img, sceneJson.width, sceneJson.height, sceneJson.bleed)
                this.$el.css({
                    background: `url(${bgimg}) no-repeat center/contain`
                })
            }
        } else {
            this.$el.css({
                background: ''
            })
        }
    }
}
