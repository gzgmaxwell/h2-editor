export default class EqxRange {
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
            height: '100%'
        }
        this.$el = document.createElement('div')
            .attr({ class: 'eqc-range mask' })
            .css(css)
            .css({
                outline: '10000px solid rgba(236,238,240,0.9)',
                zIndex: 1000, // 需要设置一个比较大的值，在所有组件之上，但在选择框之下
                pointerEvents: 'none'
            })
        this.$shadow = document.createElement('div')
            .css(css)
            .css({
                display: 'flex',
                boxShadow: '0 0 4px 0 rgba(0, 0, 0, 0.16)'
            })
        this.$bleed = document.createElement('div')
            .css({
                width: '100%',
                border: '1px dashed #76838F'
            })
        this.$shadow.appendChild(this.$bleed)
        this.$el.appendChild(this.$shadow)
        this.setScale()
    }

    setScale() {
        const { scale, eqxScene: { sceneJson } } = this.eqxPage
        const bleed = (sceneJson.bleed || 3) / 25.4 * 300 * scale // 毫米转换为像素，默认为3毫米
        if (sceneJson.unit === 'mm') {
            this.$shadow
                .css({
                    padding: bleed + 'px'
                })
            this.$bleed.css({
                position: 'relative',
                display: '',
                outline: `${bleed + 1}px solid rgba(236, 238, 240, 0.9)`
            }).innerHTML = createBleedLine(bleed)
        } else {
            this.$bleed.css({
                display: 'none'
            })
        }
    }
}

function createBleedLine(bleed) {
    const lineDistance = 20
    const sizeDistance = 12 // 修改尺寸时的拖拽条的距离，这里用这个只是为了好看
    bleed += lineDistance + sizeDistance
    return `
        <div class="top-left" style="position: absolute; top: ${-bleed}px; left: -1px; width: 1px; height: ${lineDistance}px; background: #76838F"></div>
        <div class="top-right" style="position: absolute; top: ${-bleed}px; right: -1px; width: 1px; height: ${lineDistance}px; background: #76838F""></div>
        <div class="right-top" style="position: absolute; right: ${-bleed}px; top: -1px; width: ${lineDistance}px; height: 1px; background: #76838F""></div>
        <div class="right-bottom" style="position: absolute; right: ${-bleed}px; bottom: -1px; width: ${lineDistance}px; height: 1px; background: #76838F""></div>
        <div class="bottom-right" style="position: absolute; bottom: ${-bleed}px; right: -1px; width: 1px; height: ${lineDistance}px; background: #76838F""></div>
        <div class="bottom-left" style="position: absolute; bottom: ${-bleed}px; left: -1px; width: 1px; height: ${lineDistance}px; background: #76838F""></div>
        <div class="left-bottom" style="position: absolute; left: ${-bleed}px; bottom: -1px; width: ${lineDistance}px; height: 1px; background: #76838F""></div>
        <div class="left-top" style="position: absolute; left: ${-bleed}px; top: -1px; width: ${lineDistance}px; height: 1px; background: #76838F""></div>
    `
}
