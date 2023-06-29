import threeDUtil from './../../utils/threeDUtil'
import * as THREE from 'three'

export default function (elementBox) {
    const _self = this
    const $threeD = elementBox.$refs.threeD
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

        // 启用3D旋转
        _self.$orbitControls.enabled = true
        _self.$axesHelper.visible = true
        if (!Vue.env.debug3DText) {
            // 旋转时隐藏box框
            _self.elementBox.$el.css({ display: 'none' })
        }
        // 旋转时显示所有画布
        _self.updateCss({
            overflow: 'visible'
        })
        // 手动触发3D旋转
        const mouseEvents = document.createEvent('MouseEvents')
        mouseEvents.initMouseEvent('mousedown', false, true, window, 0, event.screenX, event.screenY, event.clientX, event.clientY, false, false, false, false, 0, null)
        _self.$el.querySelector('canvas').dispatchEvent(mouseEvents)

        const mouseup = () => {
            _self.$orbitControls.enabled = false
            _self.$axesHelper.visible = false
            _self.elementBox.$el.css({ display: 'block' })
            // 计算3D像素大小
            const boxInfo = threeDUtil.getBoxInfo(_self, _self.$renderer.getSize(new THREE.Vector2()))
            // 调整canvas的位置
            const maxX2centerX = boxInfo.maxX - boxInfo.centerX
            const minX2centerX = boxInfo.centerX - boxInfo.minX
            const maxY2centerY = boxInfo.maxY - boxInfo.centerY
            const minY2centerY = boxInfo.centerY - boxInfo.minY
            const marginleft = minX2centerX - maxX2centerX
            const marginTop = minY2centerY - maxY2centerY
            // 更新canvas的位置，保证文字不漏到elementBox外面去
            _self.$el.querySelector('canvas').css({
                marginLeft: marginleft + 'px',
                marginTop: marginTop + 'px'
            })
            // 更新元素大小
            const css = _self.elementJson.css
            const centerPoint = {
                x: parseFloat(css.left) + parseFloat(css.width) / 2,
                y: parseFloat(css.top) + parseFloat(css.height) / 2
            }
            const padding = 10
            _self.updateCss({
                left: (centerPoint.x - (boxInfo.width + padding * 2) / 2) + 'px',
                top: (centerPoint.y - (boxInfo.height + padding * 2) / 2) + 'px',
                width: boxInfo.width + padding * 2 + 'px',
                height: boxInfo.height + padding * 2 + 'px',
                overflow: Vue.env.debug3DText ? 'visible' : 'hidden'
            })
            _self.updateProperty({
                // 相机位置
                cameraPosition: {
                    fov: _self.$camera.fov,
                    x: _self.$camera.position.x,
                    y: _self.$camera.position.y,
                    z: _self.$camera.position.z
                },
                // 画布样式
                canvasStyle: {
                    // 宽度
                    width: _self.$renderer.getSize(new THREE.Vector2()).x,
                    // 高度
                    height: _self.$renderer.getSize(new THREE.Vector2()).y,
                    // 左边距
                    marginLeft: marginleft + 'px',
                    // 上边距
                    marginTop: marginTop + 'px'
                }
            })
            // _self.eqxPage.eqxHistory.add(_self.eqxPage)
            document.removeEventListener('mouseup', mouseup)
        }

        document.addEventListener('mouseup', mouseup)
    })
}
