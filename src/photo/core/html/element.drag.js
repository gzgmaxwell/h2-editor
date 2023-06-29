import elementType from '../../../config/enum.element.type'
import historyType from '../../../config/enum.photoHistory.type'

export default function () {
    const $el = this.$el

    $el.addEventListener('mousedown', e => {
        e.stopPropagation()
        if (this.elementJson.type !== elementType.crop) {
            // 如果页面存在裁切组件就return
            const elementCropArr = this.eqxPage.pageJson.elements.filter(item => {
                return item.type === elementType.crop
            })
            if (elementCropArr.length > 0) {
                return
            }
        }
        // 如果是编辑状态就return
        if (this.isEditing) {
            return
        }
        // 如果没有锁定就选中
        if (!this.elementJson.property.lock) {
            select.call(this, e)
        }
        const scale = this.eqxPage.scale
        const eqxElementsSelected = Vue.store.state.photoScene.eqxElementsSelected
        const guideLine = Vue.store.state.guideLine.instance
        const elementsStartPos = []
        const initX = e.pageX
        const initY = e.pageY
        const moveObj = { left: 0, top: 0 }
        let isMove = false
        const mousemove = e => {
            if (this.elementJson.property.lock) {
                // 若是锁定状态则不允许拖动，直接返回
                document.removeEventListener('mousemove', mousemove)
                document.removeEventListener('mouseup', mouseup)
                return
            }
            // 首次移动添加一条历史记录
            if (!isMove) {
                if (this.elementJson.type === elementType.photoText) {
                    Vue.store.state.photoHistory.history.insert(JSON.parse(JSON.stringify(this.eqxPage.pageJson.elements)), null, historyType.text, false)
                } else if (this.elementJson.type === elementType.photoShape || this.elementJson.type === elementType.photoImage) {
                    Vue.store.state.photoHistory.history.insert(JSON.parse(JSON.stringify(this.eqxPage.pageJson.elements)), null, historyType.paster, false)
                }
                isMove = true
            }
            this.$el.css({ cursor: 'move' })
            moveObj.left = e.pageX - initX
            moveObj.top = e.pageY - initY
            let moveFlag = true
            if (moveObj.left === 0 && moveObj.top === 0) {
                moveFlag = false
            }
            guideLine && guideLine.setBigRect()
            guideLine && guideLine.clearGuideLine()
            guideLine && guideLine.showGuideLine()
            moveFlag && eqxElementsSelected.forEach((eqxElement, i) => {
                const { left, top } = elementsStartPos[i]
                eqxElement.updateCss({
                    left: parseFloat(left) + parseFloat(moveObj.left / scale) + 'px',
                    top: parseFloat(top) + parseFloat(moveObj.top / scale) + 'px'
                })
            })
        }

        const mouseup = () => {
            if (this.elementJson.property.lock) {
                select.call(this, e)
            }
            document.removeEventListener('mousemove', mousemove)
            document.removeEventListener('mouseup', mouseup)
            guideLine && guideLine.clearGuideLine()
            this.$el.css({ cursor: '' })
            const $canvas = document.getElementsByClassName('eqc-photo-background-image')[0]
            if (this.elementJson.type === elementType.crop) {
                // 裁切组件设置裁切样式
                this.setMoveStyle(false)
            } else if (this.elementJson.type === elementType.photoText) {
                Vue.store.state.photoHistory.history.insert(JSON.parse(JSON.stringify(this.eqxPage.pageJson.elements)), $canvas.toDataURL(), historyType.text, false)
            } else if (this.elementJson.type === elementType.photoShape || this.elementJson.type === elementType.photoImage) {
                Vue.store.state.photoHistory.history.insert(JSON.parse(JSON.stringify(this.eqxPage.pageJson.elements)), $canvas.toDataURL(), historyType.paster, false)
            }
        }

        guideLine && guideLine.start(moveObj)
        eqxElementsSelected.forEach(eqxElement => {
            const { left, top } = eqxElement.elementJson.css
            elementsStartPos.push({ left, top })
            guideLine && guideLine.setBigRectStart(eqxElement)
        })
        if (this.elementJson.type === elementType.crop) {
            // 裁切组件设置裁切样式
            this.setMoveStyle(true)
        }
        document.addEventListener('mousemove', mousemove)
        document.addEventListener('mouseup', mouseup)
    })

    function select(e) {
        // 如果是选中状态，则返回
        if (this.isSelected) {
            return
        }
        this.eqxPage.clearElementsSelected()
        const eqxElements = Vue.store.state.photoScene.eqxElementsSelected.slice()
        eqxElements.length = 0
        eqxElements.push(this)
        // 设置当前组件选中状态为true
        this.isSelected = true
        // 选中时 去掉hover 的边框
        this.updateCss({ border: '1px dashed transparent' })
        // 存储当前选中的组件
        Vue.store.commit('PHOTO_ELEMENT_SELECT', { eqxElements })
    }
}
