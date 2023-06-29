export default function (elementBox, value) {
    const self = this
    const $lock = elementBox.$refs.lock
    const $lockLine = elementBox.$refs.lockLine
    const $rotate = elementBox.$refs.rotate
    const $rotateLine = elementBox.$refs.rotateLine

    $lock.addEventListener('mousedown', e => {
        // 阻止workspace上的点击
        e.stopPropagation()

        // 关闭颜色选择框
        // 因为阻止冒泡了，如果颜色选择框是打开的，点击组件虽然组件设置项变了，但颜色选择框还在
        Vue.colorPicker.close()

        const lock = self.elementJson.property.lock
        const type = self.elementJson.type
        if (lock) {
            // 解锁
            elementBox.$el.classList.remove('locked') // 去掉红线框
            $lock.css({ display: 'none' })// 隐藏锁
            $lockLine.css({ display: 'none' })// 隐藏锁的线
            // 显示操作框
            const display = 'block'
            // 非table
            if (type !== 114) {
                $rotate.css({ display })
                $rotateLine.css({ display })
            }

            if ((value | 2) === value) { // 可调宽度
                if (type !== 114) {
                    elementBox.$refs.barE.css({ display })
                    elementBox.$refs.barW.css({ display })
                }
            }
            if ((value | 4) === value) { // 可调高度
                if (type !== 114) {
                    elementBox.$refs.barS.css({ display })
                    elementBox.$refs.barN.css({ display })
                }
            }
            if ((value | 8) === value) { // 可调四个角
                elementBox.$refs.barNE.css({ display })
                elementBox.$refs.barSE.css({ display })
                elementBox.$refs.barSW.css({ display })
                elementBox.$refs.barNW.css({ display })
            }
        }
        // 更新锁定状态
        self.elementJson.property.lock = !lock
        self.updateProperty(self.elementJson.property)
        // 只更新lock状态不能触发eqxElementsSelected监听回调，
        // 因为eqxElementsSelected不能deep监听(deep时报maximum call stack size exceeded)
        // 所有需要重新将自己添加进eqxElementsSelected数组一次
        const eqxElements = Vue.store.state.scene.eqxElementsSelected.slice()
        this.eqxPage.clearElementsSelected()
        eqxElements.length = 0
        this.isSelected = true
        eqxElements.push(this)
        Vue.store.commit('ELEMENT_SELECT', { eqxElements })
    })

    $lock.addEventListener('mousemove', e => {
        const elementClass = $lock.classList
        elementClass.remove('eqf-lock-l')
        elementClass.add('eqf-unlock-l')
    })
    $lock.addEventListener('mouseout', e => {
        const elementClass = $lock.classList
        elementClass.remove('eqf-unlock-l')
        elementClass.add('eqf-lock-l')
    })
}
