import elementType from '../../../../../config/enum.element.type'
import authority from '../../../../../config/authority'
import combineInitor from '../workspace/combine.box.js'

export default function renderDisplay() {
    const eqxElementsSelected = Vue.store.state.photoScene.eqxElementsSelected
    const allEqxElements = Vue.store.state.photoScene.eqxPage.eqxElements
    // 实现思路：选中的组件只负责展现  遍历剩下的组件哪些该隐藏
    eqxElementsSelected.map(element => {
        // 选中的组件要展示出来，分为：combine组件 普通组件 组合内的组件 锁定的组件 组合内的锁定组件
        let showElementBoxFlag = true
        if (element.elementJson.type === elementType.gif) {
            const gifAuthority = authority.type.gifUploadUsing
            const userType = Vue.store.state.user.userInfo.type
            // 只有秀客和超级用户 可以拖动
            if (!gifAuthority.includes(userType)) {
                showElementBoxFlag = false
            }
        } else if (element.elementJson.type === elementType.combine) {
            // combine被选中 展示combine的elementBox 且组合内的元素都用蓝色虚线border标识 若该combine是锁定了的 组合内的元素都用红色虚线border标识
            element.addChildBorderStyle()
            if (element.combineBox) {
                showElementBoxFlag = false // 组合框被包含在临时组合框中点击不展示elementBox
            }
        } else if (element.combineBox) {
            // 选中组合内的组件 展示该组件（虚线展示）和其combineBox
            const { lock } = element.combineBox.elementJson.property
            const borderCss = lock ? { border: '1px dashed #ff5448' } : { border: '1px dashed #1593ff' }
            element.updateCss(borderCss)
            showElementBoxFlag = false // 组合内的元素是不能展示elementBox
            hideOrtherElementBorderInCombineBox(element) // 隐藏该组合内其余元素的border
            // element.combineBox.elementBox.$el.css({ display: 'block' })
            !element.combineBox.combineBox && showElementBox(element.combineBox, true)
        }
        if (showElementBoxFlag) {
            // element.elementBox.$el.css({ display: 'block' })
            showElementBox(element, true)
        }

        // 锁定之后 展示锁定样式 锁定之后 cursor也要跟着变
        if (element.combineBox) {
            const lock = element.combineBox.elementJson.property.lock ? element.combineBox.elementJson.property.lock : false
            element.combineBox.elementBox.showLock = !!lock
            lock ? element.combineBox.removeCombineDragCursor() : element.combineBox.addCombineDragCursor()
        } else {
            const lock = element.elementJson.property.lock
            element.elementBox.showLock = !!lock
            if (element.elementJson.type === elementType.combine) {
                lock ? element.removeCombineDragCursor() : element.addCombineDragCursor()
            } else {
                const cursor = lock ? { cursor: 'default' } : { cursor: 'move' }
                element.updateCss(cursor)
            }
        }
    })

    allEqxElements.map(element => {
        if (!element.isSelected) {
            // 没有选中的 都要隐藏 但是要区别combineBox里面的组件是不是有选中的
            if (!(element.elementJson.type === elementType.combine && checkCombineIsSelected(element))) {
                if (element.elementJson.type === elementType.combine) {
                    if (element.isCombine) {
                        // 已经组合了的
                        element.removeChildBorderStyle()
                    } else {
                        element.deleteCombineRefernce(element, element.eqxPage) // 临时组合的删除组合
                    }
                } else if (!element.combineBox && element.$el.style.border !== '') {
                    element.updateCss({ border: '1px dashed transparent' })
                }
                // 字体双击编辑时的鼠标样式要还原
                if (element.elementJson.type === elementType.text && !element.elementJson.property.lock) {
                    if (element.elementJson.css.cursor === 'text') {
                        element.updateCss({ cursor: 'move' })
                    }
                    // 文字编辑之后 可能会改变宽高
                    if (element.combineBox && element.elementJson.origin && (element.elementJson.origin.height !== element.elementJson.css.height ||
                        element.elementJson.origin.width !== element.elementJson.css.width)) {
                        combineInitor.reCalculateCombineBox(element.combineBox)
                    }
                }

                // element.elementBox.$el.css({ display: 'none' })
                showElementBox(element, false)

                // 移除文字设置面板
                Vue.textStyleSetting.close()
            }
        }

        // 展示combine元素是否是组合了 还是临时组合
        if (element.elementJson.type === elementType.combine) {
            element.isCombine ? element.elementBox.isCombine = true : element.elementBox.isCombine = false
        }
    })

    // 加一重保险
    if (eqxElementsSelected.length === 0) {
        // 把所有组件的border 都置为透明 保证不会出现元素边框线的issue
        allEqxElements.map(element => {
            if (element.$el.style.border !== '') {
                element.updateCss({ border: '1px dashed transparent' })
            }
        })
    }
}
function showElementBox(element, flag) {
    const display = flag ? 'block' : 'none'
    element.elementBox.$el.css({ display })
}
function hideOrtherElementBorderInCombineBox(element) {
    // 隐藏组合框中其余组件的border
    element.combineBox.childElements.map(item => {
        if (item.elementJson.id !== element.elementJson.id) {
            item.updateCss({ border: '1px solid transparent' })
        }
    })
}
function checkCombineIsSelected(combineElement) {
    let pass = false
    combineElement.childElements.map(item => {
        if (item.elementJson.type === elementType.combine) {
            const flag = checkCombineIsSelected(item)
            if (flag) {
                pass = true
            }
        }
        if (item.isSelected) {
            pass = true
        }
    })
    return pass
}
