import elementType from '../../../../../config/enum.element.type'
// 根据选中的元素 计算新组合框的矩形坐标
function initCombine(eqxElementsSelected, eqxPage) {
    let res = null
    if (checkCondition(eqxElementsSelected)) {
        // 先计算坐上角 最极致的点
        let leftX = transferPxtoNum(eqxElementsSelected[0].elementJson.css.left) // 选中组件中最左边的点 坐标
        let leftY = transferPxtoNum(eqxElementsSelected[0].elementJson.css.top) // 选中组件中最高的点 也就是top值最小的点
        let rightX = leftX // 选中组件中最右边的点
        let rightY = leftY // 选中组件中最下边的点 也就是top值最大的点
        let chooseElementArr = []
        eqxElementsSelected.map(element => {
            if (element.elementJson.type === elementType.gif) {
                Vue.notifier.warn('gif组件不可参与编组哦！')
            } else if (element.elementJson.type === elementType.combine && !element.isCombine) {
                // 如果是临时组合的不予考虑
                chooseElementArr = chooseElementArr.concat(element.childElements)
            } else if (element.combineBox) {
                chooseElementArr = chooseElementArr.concat(element.combineBox.childElements)
                chooseElementArr.push(element.combineBox)
            } else {
                chooseElementArr.push(element)
            }
        })
        // 过滤锁定的元素
        chooseElementArr = chooseElementArr.filter(element => (!element.elementJson.property.lock))
        // 过滤掉临时组合的元素
        chooseElementArr = chooseElementArr.filter(item => !(item.elementJson.type === elementType.combine && !item.isCombine))
        // 数组去重
        chooseElementArr = [...new Set(chooseElementArr)]
        if (chooseElementArr.length < 2) {
            return
        }
        for (let i = 0; i < chooseElementArr.length; i++) {
            const { minLeft, maxLeft, minTop, maxTop } = calculateCordinate(chooseElementArr[i])
            leftX = leftX > minLeft ? minLeft : leftX
            leftY = leftY > minTop ? minTop : leftY
            rightX = rightX > maxLeft ? rightX : maxLeft
            rightY = rightY > maxTop ? rightY : maxTop
        }
        const elementJson = {
            type: elementType.combine,
            css: {
                left: Math.round(parseFloat(leftX)) + 'px', // -1 是因为组合内元素都加了1px的透明border
                top: Math.round(parseFloat(leftY)) + 'px',
                width: Math.round(parseFloat(rightX - leftX)) - 2 + 'px',
                height: Math.round(parseFloat(rightY - leftY)) - 2 + 'px'
            }
        }

        const combineElement = eqxPage.addElement(elementJson)
        combineElement.fixedScale = Math.round(rightX - leftX) / Math.round(rightY - leftY)
        combineElement.isSelected = true
        combineElement.initCss = elementJson.css // 保存初始化的css 便于组件放大缩小时的比较
        for (let i = 0; i < chooseElementArr.length; i++) {
            chooseElementArr[i].updateCss({ border: '1px dashed #1593ff' })
            if (!chooseElementArr[i].combineBox || (chooseElementArr[i].combineBox && !chooseElementArr[i].combineBox.isCombine)) {
                chooseElementArr[i].combineBox = combineElement
                combineElement.childElements.push(chooseElementArr[i])
            }
            // 保存id和组合状态是为了粘贴复制 这个是保持组件原有的组合层级  防止粘贴复制的时候 组合被打散
            if (!chooseElementArr[i].combineBox) {
                chooseElementArr[i].elementJson.combineBoxId = combineElement.elementJson.id
            }
            chooseElementArr[i].elementJson.isCombine = false
            chooseElementArr[i].isSelected = false
        }

        combineElement.dbCheckCombine(combineElement)
        res = combineElement
    }
    return res
}

function reCalculateCombineBox(combineElement) {
    // 先计算坐上角 最极致的点
    let leftX = transferPxtoNum(combineElement.childElements[0].elementJson.css.left) // 选中组件中最左边的点 坐标
    let leftY = transferPxtoNum(combineElement.childElements[0].elementJson.css.top) // 选中组件中最高的点 也就是top值最小的点
    let rightX = leftX // 选中组件中最右边的点
    let rightY = leftY // 选中组件中最下边的点 也就是top值最大的点
    for (let i = 0; i < combineElement.childElements.length; i++) {
        const { minLeft, maxLeft, minTop, maxTop } = calculateCordinate(combineElement.childElements[i])
        leftX = leftX > minLeft ? minLeft : leftX
        leftY = leftY > minTop ? minTop : leftY
        rightX = rightX > maxLeft ? rightX : maxLeft
        rightY = rightY > maxTop ? rightY : maxTop
    }
    combineElement.fixedScale = Math.round(rightX - leftX) / Math.round(rightY - leftY)
    combineElement.updateSelfCss({
        left: Math.round(parseFloat(leftX)) - 1 + 'px',
        top: Math.round(parseFloat(leftY)) - 1 + 'px',
        width: Math.round(parseFloat(rightX - leftX)) + 1 + 'px',
        height: Math.round(parseFloat(rightY - leftY)) + 1 + 'px'
    })
}
// 判断是不是生成临时组合框 还是展示现有的
function checkCondition(eqxElementsSelected) {
    // 以下场景不允许出现临时组合框
    // 1. 选中的元素<2
    // 2. 选中的元素都是同一个组合中的（例如： A、B 都是同一个组合C下的）
    // 3. 选中的元素中 A B C （a和b 都在c组合中）
    // 4. 选中一个combine元素和一个普通元素  （普通元素在另外一个组合中且这个组合在这个临时combine元素内）
    // 5. 被锁定的元素不能组合进去
    // 以下场景展现新的临时组合框
    // 1. 单独的一个元素和一个组合框
    // 过滤锁定的元素
    const chooseArr = eqxElementsSelected.filter(element => (!element.elementJson.property.lock))
    if (chooseArr.length < 2) {
        return false
    }
    const combineBoxArr = []
    let outFlag = false // 是不是有元素在外
    chooseArr.map(item => {
        if (item.elementJson.type === elementType.combine) {
            if (combineBoxArr.indexOf(item) === -1) {
                combineBoxArr.push(item)
            }
        } else {
            if (item.combineBox) {
                if (combineBoxArr.indexOf(item.combineBox) === -1) {
                    combineBoxArr.push(item.combineBox)
                }
            } else {
                outFlag = true
            }
        }
    })
    // 是同一个
    if (combineBoxArr.length === 1 && !outFlag) {
        return false
    } else if (checkCombineRelation(combineBoxArr)) {
        return true
    }
}
// 检查包含的俩个combine元素有没有父子关系
function checkCombineRelation(combineBoxArr) {
    let count = 0
    if (combineBoxArr.length === 1) {
        return true
    }
    combineBoxArr.forEach(element => {
        if (element.combineBox) {
            if (combineBoxArr.indexOf(element.combineBox) !== -1) {
                count++
            }
        }
    })
    if (combineBoxArr.length - count === 1) {
        return false // 有父子关系 不能生成临时框
    } else {
        return true // 不满足条件
    }
}

function calculateCordinate(element) {
    // 得到元素的中心点
    let { width, height, left, top } = element.elementJson.css
    width = transferPxtoNum(width) + 4 // 多余的4 是因为添加border
    height = transferPxtoNum(height) + 4
    left = transferPxtoNum(left)
    top = transferPxtoNum(top)
    if (Object.prototype.hasOwnProperty.call(element.elementJson.css, 'padding')) {
        const padding = transferPxtoNum(element.elementJson.css.padding)
        width += padding * 2
        height += padding * 2
    }
    if (Object.prototype.hasOwnProperty.call(element.elementJson.css, 'borderWidth')) {
        const borderWidth = transferPxtoNum(element.elementJson.css.borderWidth)
        width += borderWidth * 2
        height += borderWidth * 2
    }
    const centerPoint = {
        x: left + width / 2,
        y: top + height / 2
    }
    element.fixedScale = width / height // 保存原始宽高比
    const angle = element.elementJson.css.transform.replace(/\D/g, '')
    // 任意点(x,y)，绕一个坐标点(x1,y1)逆时针旋转a角度后的新的坐标设为(x0, y0)，有公式：
    // x0= (x - x1)*cos(a) - (y - y1)*sin(a) + x1 ;
    // y0= (x - x1)*sin(a) + (y - y1)*cos(a) + y1;
    // 算出第一个点的坐标  原坐标(left,top)
    const x1 = calculatePosition(left, centerPoint.x, top, centerPoint.y, angle, 'x')
    const y1 = calculatePosition(left, centerPoint.x, top, centerPoint.y, angle, 'y')
    // 算出第二个的坐标 (left+width,top)
    const x2 = calculatePosition(left + width, centerPoint.x, top, centerPoint.y, angle, 'x')
    const y2 = calculatePosition(left + width, centerPoint.x, top, centerPoint.y, angle, 'y')
    // 算出第三个的坐标 (left+width,top+height)
    const x3 = calculatePosition(left + width, centerPoint.x, top + height, centerPoint.y, angle, 'x')
    const y3 = calculatePosition(left + width, centerPoint.x, top + height, centerPoint.y, angle, 'y')
    // 算出第四个的坐标 (left,top+height)
    const x4 = calculatePosition(left, centerPoint.x, top + height, centerPoint.y, angle, 'x')
    const y4 = calculatePosition(left, centerPoint.x, top + height, centerPoint.y, angle, 'y')

    const leftArr = [x1, x2, x3, x4]
    const topArr = [y1, y2, y3, y4]
    // 返回匹配的数组中 最左边的点 最右边的点 最下边的点 最上边的点
    return {
        minLeft: Math.min(...leftArr),
        maxLeft: Math.max(...leftArr),
        minTop: Math.min(...topArr),
        maxTop: Math.max(...topArr)
    }
}

function calculatePosition(x, x1, y, y1, angle, type) {
    if (type === 'x') {
        return (x - x1) * Math.cos(angle / 180 * Math.PI) - (y - y1) * Math.sin(angle / 180 * Math.PI) + x1
    } else if (type === 'y') {
        return (x - x1) * Math.sin(angle / 180 * Math.PI) + (y - y1) * Math.cos(angle / 180 * Math.PI) + y1
    }
}
function transferPxtoNum(pxValue) {
    if (pxValue !== '' && pxValue !== undefined) { return Number(pxValue.toString().replace('px', '')) }
}

export default {
    initCombine,
    reCalculateCombineBox
}
