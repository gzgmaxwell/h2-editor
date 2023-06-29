import util from '../../../../utils/util'
import elementType from '../../../../config/enum.element.type'
import combineInitor from '../workspace/combine.box.js'
export default {
    bind($el, binding) {
        const { target, container, eqxElement, onMouseUp } = binding.value || {}
        $el.addEventListener('mousedown', e => {
            // 阻止mousemove默认会选中其它元素的情况
            e.preventDefault()

            const $target = document.querySelector(target) || $el
            const $container = document.querySelector(container)
            const $ul = $target.parentElement
            const targetRect = $target.getBoundingClientRect()
            const containerRect = $container.getBoundingClientRect()
            const ulRect = $ul.getBoundingClientRect()
            const top = parseInt($target.css('top')) || (targetRect.top - ulRect.top)
            const scrollHeight = containerRect.top - ulRect.top
            const initY = e.pageY
            let moveY = 0
            const threshold = 2
            const liHeight = 36
            let targetIndex = 0
            let isMoved = false
            let lastTargetIndex = -1 // 最近一次的目标li
            const $lis = Array.from($ul.children) // 全部的子元素 包括隐藏的
            let $showLis = [] // 展示有效的
            let showElementArr = [] // 展示的元素 combine 和非组合的元素
            let selectIndex = 0
            // let openCombineArr = [] // 保存拖动之前打开的组合元素 拖动的时候关闭 拖动完成之后打开 优化体验 避免元素过多拖动不便
            let executeFlag = true // 避免执行多次
            const transition = 'transform 0.3s'
            const allElements = eqxElement.eqxPage.eqxElements
            let originalState = false // combine元素原来的状态
            const mutiSelectElementNodeArr = [] // 保存多选的元素 便于批量拖拽
            filterShowElement()
            selectIndex = $showLis.indexOf($target)
            let moveExecuteState = true // 确保每次move 都只执行一次
            const mousemove = e => {
                // 拖动的那个默认选中
                if (moveExecuteState) {
                    moveExecuteState = false
                    const eqxElements = Vue.store.state.scene.eqxElementsSelected.slice()
                    if (e.ctrlKey) {
                        // 多选
                        if (eqxElements.indexOf(eqxElement) === -1) {
                            eqxElements.push(eqxElement)
                            eqxElement.isSelected = true
                            Vue.store.commit('SCENE_IS_NEED_INIT_COMBINE_BOX', false)
                            Vue.store.commit('ELEMENT_SELECT', { eqxElements })
                        }
                    } else {
                        // 单个
                        eqxElements.length = 0
                        eqxElement.eqxPage.clearElementsSelected()
                        eqxElements.push(eqxElement)
                        eqxElement.isSelected = true
                        Vue.store.commit('SCENE_IS_NEED_INIT_COMBINE_BOX', false)
                        Vue.store.commit('ELEMENT_SELECT', { eqxElements })
                    }
                    initMutiSelectData()
                }

                // 只有combineBox 关闭
                if (eqxElement.elementJson.type === elementType.combine) {
                    openOrCloseCombineBox(false) // 关闭全部的combineBox
                }

                moveY = e.pageY - initY
                if (Math.abs(moveY) <= threshold) {
                    return
                }

                isMoved = true

                const css = {
                    top: top + moveY
                }

                if ($container) {
                    const activeRect = {
                        top: scrollHeight,
                        bottom: containerRect.height - targetRect.height + scrollHeight
                    }
                    if (css.top < activeRect.top) {
                        css.top = activeRect.top
                    }
                    if (css.top > activeRect.bottom) {
                        css.top = activeRect.bottom
                    }
                }
                if (e.ctrlKey) {
                    mutiSelectElementNodeArr.map($node => {
                        $node.css({
                            transform: `translateY(${moveY}px)`,
                            boxShadow: '0 0 8px 0 rgba(0, 0, 0, 0.16)',
                            cursor: 'move',
                            zIndex: 1000,
                            transition: ''
                        })
                    })
                } else {
                    $target.css({
                        transform: `translateY(${moveY}px)`,
                        boxShadow: '0 0 8px 0 rgba(0, 0, 0, 0.16)',
                        cursor: 'move',
                        zIndex: 1000
                    })
                }

                if (!$lis.length) {
                    return
                }
                // 计算当前移动到哪个li上面，移动超过liHeight/2距离才算有效
                targetIndex = Math.min(Math.round((css.top) / liHeight), $showLis.length)
                // 在同一个li上move未超过有效距离不做处理
                if (lastTargetIndex === targetIndex) {
                    return
                }
                // 鼠标停止后，先还原除target的li位置，再计算需要上移或下移的li进行移动
                for (const $el of $lis) {
                    if ($el !== $target) {
                        $el.css({
                            transform: '',
                            transition
                        })
                    }
                }
                // 最终鼠标停留在的li的index大于当前拖拽的这个li的index，
                // 则把它们之间的li统一向上移动，注意动画顺序，从小到大
                if (targetIndex > selectIndex) {
                    for (let i = selectIndex; i <= targetIndex; i++) {
                        const $tli = $showLis[i]
                        if ($tli && $tli !== $target && !mutiSelectElementNodeArr.includes($tli)) {
                            if ($tli.style.transform === '') {
                                // 如果拖动的是combine下面的子组件 则只能子组件动 其余的包括combine都不能动
                                $tli.css({
                                    transform: `translateY(-${liHeight}px)`,
                                    transition
                                })
                            }
                        }
                    }
                } else if (targetIndex < selectIndex) {
                    // 最终鼠标停留在的li的index小于当前拖拽的这个li的index，
                    // 则把它们之间的li统一向下移动，注意动画顺序，从大到小
                    for (let i = selectIndex; i >= targetIndex; i--) {
                        const $tli = $showLis[i]
                        if ($tli !== $target && !mutiSelectElementNodeArr.includes($tli)) {
                            if ($tli.style.transform === '') {
                                $tli.css({
                                    transform: `translateY(${liHeight}px)`,
                                    transition
                                })
                            }
                        }
                    }
                }
                lastTargetIndex = targetIndex
            }

            const mouseup = () => {
                document.removeEventListener('mousemove', mousemove)
                document.removeEventListener('mouseup', mouseup)
                moveExecuteState = true // 下次move的时候可以继续执行
                if (util.isFunction(onMouseUp)) {
                    onMouseUp(isMoved)
                }

                if (!isMoved) {
                    return
                }

                targetIndex = targetIndex > showElementArr.length - 1 ? showElementArr.length - 1 : targetIndex
                const allSelectElements = Vue.store.state.scene.eqxElementsSelected
                const replaceElement = showElementArr[targetIndex]
                const upDownFlag = selectIndex > targetIndex // 判断是往上拖 还是往下拖
                if (allSelectElements.length === 1) {
                    // 单个操作 判断替换组件是不是在编组内 如果在编组内 需要重新生成combineBox
                    let check = true
                    if (eqxElement === replaceElement) {
                        // 不能和自己交换
                        check = false
                    } else if (eqxElement.elementJson.type === elementType.combine &&
                        ((replaceElement.elementJson.type === elementType.combine && replaceElement.elementJson.property.open && !upDownFlag) ||
                            (replaceElement.combineBox && replaceElement.combineBox.isCombine))) {
                        Vue.notifier.fail('组合不能嵌套！')
                        check = false
                    } else if (replaceElement.combineBox !== eqxElement.combineBox && replaceElement.combineBox && replaceElement.combineBox.isCombine) {
                        // 编组外组件拖到编组内 或者编组内组件拖到另一个编组
                        if (eqxElement.combineBox) {
                            if (eqxElement.combineBox.childElements.length === 2) {
                                eqxElement.combineBox.deleteCombineRefernce(eqxElement.combineBox, Vue.store.state.scene.eqxPage)
                            } else {
                                const index = eqxElement.combineBox.childElements.indexOf(eqxElement)
                                eqxElement.combineBox.childElements.splice(index, 1)
                            }
                        }
                        eqxElement.combineBox = replaceElement.combineBox
                        replaceElement.combineBox.childElements.push(eqxElement)
                        // 新加编组组件之后要重新计算combineBox
                        regenerateCombineBox(replaceElement.combineBox)
                    } else if (replaceElement.elementJson.type === elementType.combine && !upDownFlag && replaceElement.elementJson.property.open) {
                        // 拖拽combine元素的下面 也算是拖入编组 往下拖入 往上就是正常拖出
                        // 刚拖入到组合中仅此于combine 是层级最高的
                        eqxElement.elementJson.css.zIndex = eqxElement.elementJson.css.zIndex + replaceElement.childElements.length
                        eqxElement.combineBox = replaceElement
                        replaceElement.childElements.push(eqxElement)
                        // 新加编组组件之后要重新计算combineBox
                        regenerateCombineBox(replaceElement)
                    } else if (eqxElement.combineBox && (!replaceElement.combineBox || (replaceElement.combineBox && !replaceElement.combineBox.isCombine))) {
                        // 编组内组件拖到外面  组件为编组外组件（临时编组也算编组外）
                        const index = eqxElement.combineBox.childElements.indexOf(eqxElement)
                        eqxElement.combineBox.childElements.splice(index, 1)
                        regenerateCombineBox(eqxElement.combineBox)
                        eqxElement.combineBox = null
                        eqxElement.elementJson.combineBoxId = null
                    }
                    check && eqxElement.eqxPage.setMutiZIndex([eqxElement], replaceElement, upDownFlag)
                } else {
                    // 批量操作
                    const eqxElements = Vue.store.state.scene.eqxElementsSelected.slice()
                    eqxElement.eqxPage.setMutiZIndex(eqxElements, replaceElement, upDownFlag)
                }

                eqxElement.eqxPage.eqxHistory.add(eqxElement.eqxPage)
                executeFlag = true
                openOrCloseCombineBox(true) // 打开之前折叠的组合
                for (const $li of $lis) {
                    $li.css({
                        transform: '',
                        transition: '',
                        boxShadow: '',
                        cursor: '',
                        zIndex: ''
                    })
                }
            }

            document.addEventListener('mousemove', mousemove)
            document.addEventListener('mouseup', mouseup)
            // 根据拖拽情况 重新生成combineBox
            function regenerateCombineBox(combineBox) {
                // 如果编组内元素少于2个则直接取消编组
                if (combineBox.childElements.length < 2) {
                    combineBox.deleteCombineRefernce(combineBox, Vue.store.state.scene.eqxPage)
                }
                // 把combine 的child里面的combineid 都指为combineid  不然保存之后 组合找不到元素
                combineBox.childElements.map(child => {
                    child.elementJson.combineBoxId = combineBox.elementJson.id
                })
                combineInitor.reCalculateCombineBox(combineBox)
            }
            function openOrCloseCombineBox(openFlag) {
                if (!executeFlag) return
                const display = openFlag ? '' : 'none'
                if (!openFlag) {
                    executeFlag = false
                    originalState = eqxElement.elementJson.property.open
                    if (originalState) { // 拖动的元素 如果是打开的才做如下操作
                        eqxElement.elementJson.property.open = openFlag
                        if (eqxElement.elementJson.type === elementType.combine) {
                            eqxElement.childElements.map(item => {
                                const index = getIndexById(allElements, item)
                                if (index !== -1) {
                                    $lis[index].css({ display })
                                    filterShowElement() // 重新计算有效元素
                                }
                            })
                        }
                    }
                } else {
                    // 打开的时候 如果原来的是关闭的则不用打开
                    if (originalState) {
                        eqxElement.elementJson.property.open = openFlag
                        if (eqxElement.elementJson.type === elementType.combine) {
                            eqxElement.childElements.map(item => {
                                const index = getIndexById(allElements, item)
                                if (index !== -1) {
                                    $lis[index].css({ display })
                                }
                            })
                        }
                    }
                    executeFlag = true
                }
            }
            function getIndexById(allElements, item) {
                let retrunIndex = -1
                for (let i = 0; i < allElements.length; i++) {
                    if (allElements[i].elementJson.id === item.elementJson.id) {
                        retrunIndex = i
                    }
                }
                return retrunIndex
            }
            function filterShowElement() {
                showElementArr = []
                $showLis = []
                allElements.map((element, i) => {
                    if (element.combineBox && element.combineBox.isCombine && !element.combineBox.elementJson.property.open) {
                        // 去掉组合元素
                    } else {
                        showElementArr.push(element)
                        $showLis.push($lis[i])
                        selectIndex = $showLis.indexOf($target)// 重新计算选中元素的index
                    }
                })
            }
            // 初始化多选数据
            function initMutiSelectData() {
                allElements.map((element, i) => {
                    if (element.combineBox && element.combineBox.isCombine && !element.combineBox.elementJson.property.open) {
                        // 去掉组合元素
                    } else {
                        // 选中
                        if (element.isSelected) {
                            mutiSelectElementNodeArr.push($lis[i])
                        }
                    }
                })
            }
        })
    }
}
