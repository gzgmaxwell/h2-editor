import { elementType } from '../../../config/enum'
export default function () {
    // hover 的时候展示虚线框
    this.$el.addEventListener('mouseover', () => {
        /**
         * 需求： 1. 如果组件已经选定
         */
        const allElement = Vue.store.state.scene.eqxElementsSelected
        const exist = allElement.find(ele => ele.elementJson.id === this.elementJson.id) // 选中的元素 hover不生效
        const type = this.elementJson.type
        const lock = checkParentIsLock.call(this)
        if (!exist && type !== elementType.combine) { // 组合框元素没有hover
            if (lock) {
                this.$el.css({ border: '1px dashed #ff5448' })
            } else {
                if (type !== elementType.table) {
                    this.$el.css({ border: '1px dashed #1593FF' })
                }
            }
        }
    })

    this.$el.addEventListener('mouseleave', () => {
        const type = this.elementJson.type
        if (type !== elementType.combine && type !== elementType.table) {
            this.$el.css({ border: '1px dashed transparent' })
        }
    })

    function checkParentIsLock() {
        let pass = false
        if (this.combineBox) { // 判断parent 有没有lock
            const { lock } = this.combineBox.elementJson.property
            if (lock) {
                pass = true
            } else {
                if (this.combineBox.combineBox) { // 判断grandParent 有没有lock
                    const { lock } = this.combineBox.combineBox.elementJson.property
                    if (lock) {
                        pass = true
                    }
                }
            }
        } else {
            const { lock } = this.elementJson.property // 判断自己 有没有lock
            if (lock) {
                pass = true
            }
        }
        return pass
    }
}
