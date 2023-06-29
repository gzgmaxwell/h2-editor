import elementType from '../../config/enum.element.type'
import statistic from '../../config/statistic'
import authority from '../../config/authority'

let keydownHandler = null
export default {
    bind($el, binding, vnode) {
        keydownHandler = e => {
            const scene = Vue.store.state.scene
            const eqxPage = scene.eqxPage
            const eqxElementsSelected = scene.eqxElementsSelected
            const width = $el.offsetWidth
            const height = $el.offsetHeight
            if (Vue.colorPicker.getState().isOpenSucker) {
                return
            }
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
                        Vue.store.commit('ELEMENT_SELECT', { eqxElements: [] })
                        eqxPage.eqxHistory.add(eqxPage)
                        break
                    case 37: // left
                        // eqxPage.moveElements(eqxElementsSelected, { x: -1, y: 0 })
                        moveAction(eqxPage, eqxElementsSelected, { x: -1, y: 0 })
                        break
                    case 38: // up
                        // eqxPage.moveElements(eqxElementsSelected, { x: 0, y: -1 })
                        moveAction(eqxPage, eqxElementsSelected, { x: 0, y: -1 })
                        break
                    case 39: // right
                        // eqxPage.moveElements(eqxElementsSelected, { x: 1, y: 0 })
                        moveAction(eqxPage, eqxElementsSelected, { x: 1, y: 0 })
                        break
                    case 40: // down
                        // eqxPage.moveElements(eqxElementsSelected, { x: 0, y: 1 })
                        moveAction(eqxPage, eqxElementsSelected, { x: 0, y: 1 })
                        break
                }
                if ([37, 38, 39, 40].includes(e.keyCode)) {
                    document.onkeyup = () => {
                        document.onkeyup = null
                        eqxPage.eqxHistory.add(eqxPage)
                    }
                }
            }

            if (e.ctrlKey || e.metaKey) {
                switch (e.keyCode) {
                    // case 67: // ctrl + c
                    //     eqxElementsSelected.length && Vue.store.commit('ELEMENT_COPY')
                    //     break
                    // case 86: // ctrl + v
                    //     Vue.store.commit('ELEMENT_PASTE')
                    //     break
                    case 71: // ctrl + G
                        e.preventDefault()
                        eqxElementsSelected.map(item => {
                            let chooseCombine = null
                            if (item.combineBox) {
                                if (item.combineBox.combineBox) {
                                    chooseCombine = item.combineBox.combineBox
                                } else {
                                    chooseCombine = item.combineBox
                                }
                            } else if (item.elementJson.type === elementType.combine) {
                                chooseCombine = item
                            }
                            const { property: { lock }, css: { display } } = chooseCombine.elementJson
                            if (!lock && display === 'block') {
                                // 只有非锁定的情况下 组合快捷键才能使用
                                chooseCombine.isCombine = !chooseCombine.isCombine
                                chooseCombine.buildConnecttionWidthElements()
                                chooseCombine.elementBox.isCombine = chooseCombine.isCombine // 改变选中框的样式
                                chooseCombine.isCombine && chooseCombine.flatCombine(chooseCombine, eqxPage)
                                Vue.store.commit('ELEMENT_SELECT', { eqxElements: [chooseCombine] })
                            }
                        })
                        break
                    case 65: { // ctrl + a
                        e.preventDefault()
                        const selectElements = []
                        eqxPage.eqxElements.forEach(eqxElement => {
                            const { property: { lock }, css: { display } } = eqxElement.elementJson
                            if (!lock && ['block', 'flex'].includes(display)) {
                                if (eqxElement.elementJson.type === elementType.gif) {
                                    const gifAuthority = authority.type.gifUploadUsing
                                    const userType = Vue.store.state.user.userInfo.type
                                    // 只有秀客和超级用户 可以拖动
                                    if (gifAuthority.includes(userType)) {
                                        eqxElement.isSelected = true
                                        selectElements.push(eqxElement)
                                    }
                                } else if (eqxElement.combineBox) {
                                    // 全选的模式下 如果是组合的lock  则不让其选中
                                    const combineBoxLock = eqxElement.combineBox.elementJson.property.lock
                                    const combineBoxDisplay = eqxElement.combineBox.elementJson.css.display
                                    if (!combineBoxLock && combineBoxDisplay === 'block') {
                                        eqxElement.isSelected = true
                                        selectElements.push(eqxElement)
                                    }
                                } else {
                                    eqxElement.isSelected = true
                                    selectElements.push(eqxElement)
                                }
                            }
                        })
                        Vue.store.commit('ELEMENT_SELECT', { eqxElements: selectElements })
                        break
                    }
                    case 83: { // ctrl + s
                        e.preventDefault()
                        if (eqxPage.isModified) {
                            Vue.store.dispatch('PAGE_SAVE', { eqxPage, needCover: true })
                                .catch(err => err && this.logger.error(err))
                        }
                        break
                    }
                    case 90: // ctrl + z
                        e.preventDefault()
                        Vue.store.commit('HISTORY_BACK')
                        break
                    case 89: // ctrl + y
                        e.preventDefault()
                        Vue.store.commit('HISTORY_FORWORD')
                        break
                    case 189: // ctrl + -
                        e.preventDefault()
                        eqxPage.setScale('-', width, height)
                        break
                    case 187: // ctrl + +
                        e.preventDefault()
                        eqxPage.setScale('+', width, height)
                        break
                    case 76: { // ctrl + l
                        e.preventDefault()
                        // 更新lock状态
                        eqxPage.eqxElements.forEach(eqxElement => {
                            let chooseElement = eqxElement
                            if (eqxElement.combineBox) {
                                if (eqxElement.combineBox.combineBox) {
                                    chooseElement = eqxElement.combineBox.combineBox
                                } else {
                                    chooseElement = eqxElement.combineBox
                                }
                            }
                            const { property: { lock } } = chooseElement.elementJson
                            if (eqxElement.isSelected) {
                                if (!lock) {
                                    window._hmt.push(['_trackEvent',
                                        statistic.category.F,
                                        statistic.action.LLAUL,
                                        statistic.opt_label.LLAUL.lock])
                                } else {
                                    window._hmt.push(['_trackEvent',
                                        statistic.category.F,
                                        statistic.action.LLAUL,
                                        statistic.opt_label.LLAUL.unlock])
                                }

                                chooseElement.elementJson.property.lock = !lock
                                chooseElement.updateProperty(chooseElement.elementJson.property)
                                // 重新选定组件用以显示锁定框
                                const eqxElements = Vue.store.state.scene.eqxElementsSelected.slice()
                                chooseElement.eqxPage.clearElementsSelected()
                                eqxElements.length = 0
                                chooseElement.isSelected = true
                                eqxElements.push(chooseElement)
                                Vue.store.commit('ELEMENT_SELECT', { eqxElements })
                                // 如果锁定时，combine还是临时组合 则直接组合
                                if (chooseElement.elementJson.property.lock && chooseElement.elementJson.type === elementType.combine && !chooseElement.isCombine) {
                                    chooseElement.isCombine = true
                                    chooseElement.flatCombine(chooseElement, chooseElement.eqxPage)
                                }
                                if (chooseElement.elementJson.property.lock && chooseElement.combineBox) {
                                    chooseElement.combineBox.isCombine = true
                                    chooseElement.combineBox.elementJson.property.lock = !lock
                                }
                            }
                        })
                    }
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
