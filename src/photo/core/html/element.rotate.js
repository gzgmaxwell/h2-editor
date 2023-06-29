import elementType from '../../../config/enum.element.type'
import historyType from '../../../config/enum.photoHistory.type'

export default function (elementBox) {
    const $el = this.$el
    const $elBox = elementBox.$el
    const $rotate = elementBox.$refs.rotate
    const $barLine = elementBox.$refs.lineMiddle
    const css = this.elementJson.css
    let angle = css.transform.replace(/\D/g, '')
    cursorStyle($elBox, angle)
    $rotate.addEventListener('mousedown', e => {
        // 阻止workspace上的点击
        e.stopPropagation()
        // 阻止mousemove默认会选中其它元素的情况
        e.preventDefault()
        // 关闭颜色选择框 因为阻止冒泡了，如果颜色选择框是打开的，点击组件虽然组件设置项变了，但颜色选择框还在
        Vue.colorPicker.close()
        // let startAngle = /\d+/.exec(css.transform)
        const { left, top, width, height } = $el.getBoundingClientRect()
        const center = {
            x: left + width / 2,
            y: top + height / 2
        }

        const mousemove = e => {
            const movePoint = {
                x: e.pageX,
                y: e.pageY
            }
            let display = ''
            angle = setAngle(center, movePoint)
            const guideAngle = 45 * Math.round(angle / 45)
            if (Math.abs(guideAngle - angle) <= 1) {
                angle = guideAngle
                display = 'block'
            } else {
                display = ''
            }
            angle = angle === 360 ? 0 : angle
            const css = {
                transform: `rotateZ(${angle}deg)`
            }
            $barLine.css({ display })
            $el.css(css)
            $elBox.css(css)
            this.updateCss(css)
        }
        const mouseup = () => {
            document.removeEventListener('mousemove', mousemove)
            document.removeEventListener('mouseup', mouseup)
            cursorStyle($elBox, angle)
            $barLine.css({ display: '' })
            if (this.elementJson.type === elementType.photoText) {
                Vue.store.state.photoHistory.history.insert(JSON.parse(JSON.stringify(this.eqxPage.pageJson.elements)), null, historyType.text, false)
                // Vue.store.state.photoHistory.history.add(JSON.parse(JSON.stringify(this.eqxPage.pageJson.elements)), null, historyType.text, false, Vue.store.state.photoLayout.nav.selectedItem.type)
            } else if (this.elementJson.type === elementType.photoShape || this.elementJson.type === elementType.photoImage) {
                Vue.store.state.photoHistory.history.insert(JSON.parse(JSON.stringify(this.eqxPage.pageJson.elements)), null, historyType.paster, false)
                // Vue.store.state.photoHistory.history.add(JSON.parse(JSON.stringify(this.eqxPage.pageJson.elements)), null, historyType.paster, false, Vue.store.state.photoLayout.nav.selectedItem.type)
            }
        }

        document.addEventListener('mousemove', mousemove)
        document.addEventListener('mouseup', mouseup)
    })
}
function cursorStyle($elBox, angle) {
    let cursorStyleArray = ['nwse-resize', 'ns-resize', 'nesw-resize', 'ew-resize', 'nwse-resize', 'ns-resize', 'nesw-resize', 'ew-resize']
    const STEP = 45
    let startIndex = 0
    if (angle) {
        startIndex = Math.floor(angle / STEP)
        // 当旋转角度取余数，大于22.5度时
        if (angle % STEP > (STEP / 2)) {
            startIndex += 1
        }
    }
    if (startIndex > 1) {
        cursorStyleArray = (cursorStyleArray.slice(startIndex))
            .concat(cursorStyleArray.slice(0, startIndex))
    }
    for (let i = 0; i < 8; i++) {
        if ($elBox.children[i].style.cursor !== cursorStyleArray[i]) {
            $elBox.children[i].style.cursor = cursorStyleArray[i]
        }
    }
}
function setAngle(center, movePoint) {
    const ox = movePoint.x - center.x
    const oy = movePoint.y - center.y
    const to = Math.abs(ox / oy)
    let angle = Math.atan(to) / (2 * Math.PI) * 360

    if (ox > 0 && oy < 0) { // 右上角，1象限
        // angle = 360 + angle
    } else if (ox >= 0 && oy > 0) { // 右下角，4象限，>=可解决180度时反转的问题
        angle = 180 - angle
    } else if (ox < 0 && oy > 0) { // 左下角，3象限
        angle = 180 + angle
    } else if (ox < 0 && oy < 0) { // 左上角，2象限
        angle = 360 - angle
    }
    return Math.floor(angle)
}
