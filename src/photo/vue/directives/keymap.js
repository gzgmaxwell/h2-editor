import elementType from '../../../config/enum.element.type'

let keydownHandler = null
export default {
    bind($el, binding, vnode) {
        keydownHandler = e => {
            const scene = Vue.store.state.photoScene
            const eqxPage = scene.eqxPage
            const eqxElementsSelected = scene.eqxElementsSelected
            const width = $el.offsetWidth
            const height = $el.offsetHeight

            // 如果别的地方为激活元素，则不执行，比如text、input
            if (document.activeElement !== document.body) {
                return
            }

            if (eqxElementsSelected.length) {
                switch (e.keyCode) {
                    case 8: // backspace
                    case 46: // delete
                        e.preventDefault()
                        eqxElementsSelected.map(item => {
                            if (item.combineBox) {
                                if (item.combineBox.combineBox) {
                                    item.combineBox.combineBox.deleteCombineElement(item.combineBox.combineBox)
                                } else {
                                    item.combineBox.deleteCombineElement(item.combineBox)
                                }
                            } else if (item.elementJson.type === elementType.combine) {
                                item.deleteCombineElement(item)
                            }
                        })
                        eqxPage.deleteElements(eqxElementsSelected)
                        Vue.store.commit('PHOTO_ELEMENT_SELECT', { eqxElements: [] })
                        break
                    case 37: // left
                        moveAction(eqxPage, eqxElementsSelected, { x: -1, y: 0 })
                        break
                    case 38: // up
                        moveAction(eqxPage, eqxElementsSelected, { x: 0, y: -1 })
                        break
                    case 39: // right
                        moveAction(eqxPage, eqxElementsSelected, { x: 1, y: 0 })
                        break
                    case 40: // down
                        moveAction(eqxPage, eqxElementsSelected, { x: 0, y: 1 })
                        break
                }
                if ([37, 38, 39, 40].includes(e.keyCode)) {
                    document.onkeyup = () => {
                        document.onkeyup = null
                    }
                }
            }

            if (e.ctrlKey || e.metaKey) {
                switch (e.keyCode) {
                    case 189: // ctrl + -
                        e.preventDefault()
                        eqxPage.setScale('-', width, height)
                        break
                    case 187: // ctrl + +
                        e.preventDefault()
                        eqxPage.setScale('+', width, height)
                        break
                }
            }

            switch (e.keyCode) {
                case 32: { // 空格
                    const context = vnode.context
                    const $scaleDrag = $el.querySelector('.eqc-scale-drag')
                    if (context.isDragging) {
                        return
                    }
                    context.isDragging = true // 拖拽中，workspace需要这个变量禁止点击相关的操作
                    $scaleDrag.css({
                        display: 'block',
                        cursor: '-webkit-grab'
                    }) // 手掌
                    document.onkeyup = () => {
                        document.onkeyup = null
                        context.isDragging = false
                        $scaleDrag.css({
                            display: '',
                            cursor: ''
                        })
                    }
                    break
                }
            }
        }
        document.addEventListener('keydown', keydownHandler)
    },
    unbind() {
        document.removeEventListener('keydown', keydownHandler)
    }
}

function moveAction(eqxPage, eqxElementsSelected, moveCss) {
    eqxElementsSelected.map(eqxElement => {
        if (eqxElement.combineBox) {
            if (eqxElement.combineBox.combineBox) {
                eqxPage.moveElements([eqxElement.combineBox.combineBox], moveCss)
            } else {
                eqxPage.moveElements([eqxElement.combineBox], moveCss)
            }
        } else {
            eqxPage.moveElements([eqxElement], moveCss)
        }
    })
}
