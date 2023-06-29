import elementType from '../../config/enum.element.type'
import authority from '../../config/authority'

export default function () {
    const $el = this.$el
    let deleteCombineFlag = true
    let copyFlag = false

    $el.addEventListener('mousedown', e => {
        const { lock } = this.elementJson.property

        e.stopPropagation()

        if (this.elementJson.type === elementType.table) {
            if (e.target.className.indexOf('bar') !== -1 || e.target.className.indexOf('line') !== -1) {
                return
            }
        }
        // 关闭颜色选择框
        // 因为阻止冒泡了，如果颜色选择框是打开的，点击组件虽然组件设置项变了，但颜色选择框还在
        Vue.colorPicker.close()

        // 如果处于编辑状态，则返回
        if (this.isEditing) {
            return
        }
        if (!lock) {
            select.call(this, e)
        }
        contextMenu(e, this)

        const eqxElementsSelected = Vue.store.state.scene.eqxElementsSelected
        const scale = this.eqxPage.scale
        const guideLine = Vue.store.state.guideLine.instance
        const elementsStartPos = []
        const initX = e.pageX
        const initY = e.pageY
        const moveObj = {
            left: 0,
            top: 0
        }
        const mousemove = e => {
            // 锁定的时候 不允许拖拽复制
            const parent = findParent(this)
            const parentLock = parent.elementJson.property.lock

            if (!parentLock) {
                if (this.elementJson.type !== elementType.table) {
                    // 如果不是表格、3D立体字允许拖拽复制
                    ctrlCopy.call(this, e)
                }
            }

            const { lock } = this.elementJson.property
            if (lock) { // 若是锁定状态则不允许拖动，直接返回
                document.removeEventListener('mousemove', mousemove)
                document.removeEventListener('mouseup', mouseup)
                return
            }

            if (this.elementJson.type === elementType.gif) {
                const gifAuthority = authority.type.gifUploadUsing
                const userType = Vue.store.state.user.userInfo.type
                // 只有秀客和超级用户 可以拖动
                if (!gifAuthority.includes(userType)) {
                    return
                }
            }
            if (this.combineBox && this.combineBox.elementJson.property.lock) {
                return // 若是combine被锁定了 子元素也不能拖动
            }
            this.$el.css({ cursor: 'move' })
            moveObj.left = e.pageX - initX
            moveObj.top = e.pageY - initY
            let moveFlag = true
            if (moveObj.left === 0 && moveObj.top === 0) {
                moveFlag = false
            }
            guideLine.setBigRect()
            guideLine.clearGuideLine()
            guideLine.showGuideLine()
            moveFlag && eqxElementsSelected.forEach((eqxElement, i) => {
                // issue： 组合内 先选中一个  然后按住ctrl 拖动另一个乱跑的bug
                if (!(eqxElement === this || eqxElement === this.combineBox)) {
                    return
                }
                const { left, top } = elementsStartPos[i]
                if (this.combineBox) {
                    // 保存原来的初始位置
                    this.elementJson.property.left = this.elementJson.css.left
                    this.elementJson.property.top = this.elementJson.css.top
                }
                eqxElement.updateCss({
                    left: parseFloat(left) + parseFloat(moveObj.left / scale) + 'px',
                    top: parseFloat(top) + parseFloat(moveObj.top / scale) + 'px'
                })

                if (eqxElement.combineBox) {
                    eqxElement.isDrag = true
                    deleteCombineFlag = false
                    // 如果是在编组中 要带中其他元素一起动
                    const addX = parseFloat(left) + parseFloat(moveObj.left / scale) - eqxElement.combineBox.transferPxtoNum(eqxElement.elementJson.property.left)
                    const addY = parseFloat(top) + parseFloat(moveObj.top / scale) - eqxElement.combineBox.transferPxtoNum(eqxElement.elementJson.property.top)
                    const parent = findParent(eqxElement)
                    parent.moveTogether(addX, addY)
                }
            })
        }

        const mouseup = () => {
            const { lock } = this.elementJson.property
            if (lock) {
                select.call(this, e)
            }
            document.removeEventListener('mousemove', mousemove)
            document.removeEventListener('mouseup', mouseup)

            if (this.elementJson.type === elementType.combine) {
                this.childElements.map(item => {
                    item.isDrag = false
                })
                this.isDrag = false
            } else if (this.combineBox) {
                this.combineBox.childElements.map(item => {
                    item.isDrag = false
                })
            }
            this.$el.css({ cursor: '' })
            const isNoHistoryState = Vue.store.state.scene.isNoHistory
            if (!isNoHistoryState) {
                // 批量添加组合的时候 这儿不能生成历史记录
                this.eqxPage.eqxHistory.add(this.eqxPage)
            } else {
                Vue.store.commit('HISTORY_NO_FLAG', false)
            }
            Vue.user.allow('showComponentWarning') && showHoverLabelDirection.call(this)
            guideLine.clearGuideLine()
            copyFlag = false
            Vue.store.commit('CTRL_STATE_CHANGE', false)

            if (this.elementJson.type === elementType.textThreeD) {
                // 如果是3D文字，让3DCanvas失去焦点
                document.activeElement.blur()
            }
        }

        guideLine.start(moveObj)

        eqxElementsSelected.forEach(eqxElement => {
            const { left, top } = eqxElement.elementJson.css
            elementsStartPos.push({ left, top })
            guideLine.setBigRectStart(eqxElement)
        })
        document.addEventListener('mousemove', mousemove)
        document.addEventListener('mouseup', mouseup)
    })

    function showHoverLabelDirection() {
        const eleType = this.elementJson.type
        if ([elementType.shape, elementType.frame].includes(eleType)) {
            const $el = this.$el
            const top = parseInt(this.elementJson.css.top)
            const left = parseInt(this.elementJson.css.left)
            const height = parseInt(this.elementJson.css.height)
            const width = parseInt(this.elementJson.css.width)
            const { sceneHeight, sceneWidth } = Vue.store.state.scene.eqxPage
            if (top < 0 || left < 0 || top > (sceneHeight - height) || left > (sceneWidth - width)) {
                // 判断极值条件  是否增加哪个class
                if (top < 0) {
                    clearOtherStyle($el)
                    $el.classList.add('hint--bottom')
                }
                if (left < 0) {
                    clearOtherStyle($el)
                    $el.classList.add('hint--right')
                }
                if (top > (sceneHeight - height)) {
                    clearOtherStyle($el)
                    $el.classList.add('hint--top')
                }
                if (left > (sceneWidth - width)) {
                    clearOtherStyle($el)
                    $el.classList.add('hint--left')
                }
            } else {
                if (!$el.classList.contains('hint--top')) {
                    clearOtherStyle($el)
                    $el.classList.add('hint--top')
                }
            }
        }
    }
    function clearOtherStyle($el) {
        // 先把之前存在的class 全部删除
        $el.classList.remove('hint--left')
        $el.classList.remove('hint--right')
        $el.classList.remove('hint--top')
        $el.classList.remove('hint--bottom')
        $el.classList.add('hint--rounded')
        $el.classList.add('eqc-hint-lbl')
    }
    function contextMenu(e, that) {
        // 鼠标右键，不使用contextMenu的方式，因为在mac下ctrl+鼠标左键也是右键功能
        if (e.button === 2) {
            // 打开table 合并菜单
            if (that.elementJson.type === elementType.table && that.checkTableCanShowMergeMenu()) {
                Vue.store.commit('SCENE_TABLE_TABLE_MENU_IN_CHANGE', { left: e.pageX, top: e.pageY, isShow: true })
            } else {
                Vue.store.commit('LAYOUT_CONTEXT_MENU', { pageX: e.pageX, pageY: e.pageY })
            }
        }
        // 鼠标左键 如果是临时组合 则取消组合 需求描述： 生成临时组合 单击临时组合框
        if (e.button === 0 && that.combineBox && !that.combineBox.isCombine && !e.ctrlKey) {
            setTimeout(() => {
                if (deleteCombineFlag && that.combineBox && that.combineBox.isCombine === false && !that.combineBox.elementJson.property.lock) {
                    that.combineBox.removeChildBorderStyle()
                    that.combineBox.deleteCombineRefernce(that.combineBox, Vue.store.state.scene.eqxPage)
                    that.isSelected = true
                    Vue.store.commit('ELEMENT_SELECT', { eqxElements: [that] })
                } else {
                    deleteCombineFlag = true
                }
            }, 200)
        }
    }
    function ctrlCopy(e) {
        // 用户按住ctrl键拖动放开 等于粘贴复制
        if (e.ctrlKey && !copyFlag) {
            copyFlag = true
            // copy
            Vue.store.commit('CTRL_STATE_CHANGE', true)
            Vue.store.commit('ELEMENT_COPY')
            // 通过复制别的内容来清空剪切板
            const $input = document.querySelector('#input_copy')
            $input.select()
            document.execCommand('copy', false, null)
            $input.blur()
            // paste
            Vue.store.commit('ELEMENT_PASTE')
            // 复制了之后要对图层重新排序
            Vue.store.state.scene.eqxPage.sortCombineElement()
        }
    }
    function select(e) {
        const eqxElements = Vue.store.state.scene.eqxElementsSelected.slice()
        if (e.ctrlKey || e.shiftKey) {
            // 只让左键点击时才可操作
            if (e.button !== 0) {
                return
            }
            const index = eqxElements.indexOf(this)
            if (index >= 0) {
                // eqxElements.splice(index, 1)
                // this.isSelected = false
            } else {
                // 判断上个元素是不是已经被锁定了的
                if (eqxElements.length > 0 && eqxElements[0].elementJson.property.lock) {
                    eqxElements.length = 0
                }
                eqxElements.push(this)
                this.isSelected = true
            }
            // }
        } else {
            // 如果是选中状态，则返回
            if (this.isSelected) {
                return
            }
            this.eqxPage.clearElementsSelected()
            eqxElements.length = 0
            eqxElements.push(this)
            this.isSelected = true
        }
        // 选中时 去掉hover 的边框
        this.updateCss({ border: '1px dashed transparent' })
        Vue.store.commit('ELEMENT_SELECT', { eqxElements })
    }
    function findParent(element) {
        let parent = null
        if (element.combineBox) {
            if (element.combineBox.combineBox) {
                parent = element.combineBox.combineBox // 组合最多只能嵌套一层
            } else {
                parent = element.combineBox
            }
        } else {
            parent = element
        }
        return parent
    }
}
