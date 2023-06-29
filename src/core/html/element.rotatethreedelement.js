
export default function (elementBox) {
    const _self = this
    const $threeD = elementBox.$refs.elementThreed

    $threeD.addEventListener('dblclick', e => {
        // 双击归0
        _self.updateProperty({
            rotateX: 0,
            rotateY: 0
        })
    })

    $threeD.addEventListener('mousedown', e => {
        // 阻止workspace上的点击
        e.stopPropagation()
        // 阻止mousemove默认会选中其它元素的情况
        e.preventDefault()
        // 关闭颜色选择框
        // 因为阻止冒泡了，如果颜色选择框是打开的，点击组件虽然组件设置项变了，但颜色选择框还在
        Vue.colorPicker.close()
        // 锁定是不允许旋转
        if (_self.elementJson.property.lock) {
            return
        }
        let lastX = e.clientX
        let lastY = e.clientY
        let nowX = 0
        let nowY = 0
        let desX = 0
        let desY = 0
        let rotX = _self.elementJson.property.rotateX || 0
        let rotY = _self.elementJson.property.rotateY || 0
        const mousemove = (e) => {
            nowX = e.clientX
            nowY = e.clientY
            desX = nowX - lastX
            desY = nowY - lastY
            rotX -= (desY * 1) % 360
            rotY += (desX * 1) % 360
            lastX = nowX
            lastY = nowY
            _self.updateProperty({
                rotateX: rotX,
                rotateY: rotY
            })
        }

        const mouseup = (e) => {
            document.removeEventListener('mousemove', mousemove)
            document.removeEventListener('mouseup', mouseup)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        }

        document.addEventListener('mousemove', mousemove)
        document.addEventListener('mouseup', mouseup)
    })
}
