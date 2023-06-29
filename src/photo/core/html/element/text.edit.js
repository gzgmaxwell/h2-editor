import elementType from '../../../../config/enum.element.type'

export default function () {
    // 双击进入编辑状态，并选中所有文字
    this.$el.addEventListener('dblclick', () => {
        // 如果页面存在裁切组件就return
        const elementCropArr = Vue.store.state.photoScene.eqxPage.pageJson.elements.filter(item => {
            return item.type === elementType.crop
        })
        if (elementCropArr.length > 0) {
            return
        }
        const { lock } = this.elementJson.property
        if (lock) {
            return// 文本图层锁定时，图片禁止编辑
        }
        const $text = this.$text
        const $elBox = this.elementBox.$el
        const css = this.elementJson.css
        const eqxElementsSelected = Vue.store.state.photoScene.eqxElementsSelected
        // 在组合中双击 更改文字的时候 保存原始的宽高
        if (this.combineBox) {
            this.elementJson.origin = {
                width: this.elementJson.css.width,
                height: this.elementJson.css.height
            }
        }

        // 换行或复制时，计算高度
        const setHeight = () => {
            if (css.writingMode && css.writingMode === 'vertical-rl') {
                // 竖的时候 计算宽度
                $text.css('width', '')
                const boxWidth = $text.offsetWidth
                const textWidth = $text.offsetWidth - parseInt(css.padding) * 2 - parseInt(css.borderWidth) * 2
                $elBox.css('width', boxWidth + 'px')
                $text.css('width', textWidth + 'px')
                this.updateCss({ width: textWidth + 'px' })
            } else {
                // 横排的时候 计算高度
                $text.css('height', '')
                const boxHeight = $text.offsetHeight
                const textHeight = $text.offsetHeight - parseInt(css.padding) * 2 - parseInt(css.borderWidth) * 2
                $elBox.css('height', boxHeight + 'px')
                $text.css('height', textHeight + 'px')
                this.updateCss({ height: textHeight + 'px' })
            }
        }

        // 选中多个组件时，不能编辑文字
        if (eqxElementsSelected.length > 1) {
            return
        }
        this.isEditing = true
        $text.attr({ contenteditable: true })
        selectAllContent($text)
        // 光标由move变为text
        setTimeout(() => {
            eqxElementsSelected[0].updateCss({ cursor: 'text' })
        })
        // 如果使用removeEventListener，移除时不方便传方法名，包括下面的的几个事件
        $text.oninput = () => {
            setHeight()
        }

        $text.onpaste = () => {
            setTimeout(() => {
                $text.innerHTML = this.formatContent($text.innerText)
                setHeight()
                // todo 控制光标的位置
                positionToEnd($text)
            })
        }

        setTimeout(() => {
            // 显示文字样式面板
            Vue.textStyleSetting.open({
                propsData: {
                    inFontFamily: null,
                    inFontSize: 0,
                    inFontColor: '',
                    inFontAlign: 0,
                    inFontFormat: 0
                }
            })
        }, 100)
    })
}

/**
 * 选中所有文字
 * @param {*}
 */
function selectAllContent($text) {
    setTimeout(function () {
        if (getSelection && document.createRange) {
            const range = document.createRange()
            range.selectNodeContents($text)
            range.collapse(true)
            range.setEnd($text, $text.childNodes.length)
            range.setStart($text, 0)
            const sel = getSelection()
            sel.removeAllRanges()
            sel.addRange(range)
        } else if (document.body.createTextRange) {
            const range = document.body.createTextRange()
            range.moveToElementText($text)
            range.collapse(true)
            range.select()
        }
        $text.focus()
    }, 1)
}

/**
 * 移动光标到文字结尾
 */
function positionToEnd(obj) {
    if (window.getSelection) {
        obj.focus()
        const range = window.getSelection()
        range.selectAllChildren(obj)
        range.collapseToEnd()
    } else if (document.selection) {
        const range = document.selection.createRange()
        range.moveToElementText(obj)
        range.collapse(false)
        range.select()
    }
}
