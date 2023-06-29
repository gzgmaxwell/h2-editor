import elementType from '../../../../config/enum.element.type'

export default function () {
    // hover 的时候展示虚线框
    this.$el.addEventListener('mouseover', () => {
        // 如果页面存在裁切组件就return
        const elementCropArr = Vue.store.state.photoScene.eqxPage.pageJson.elements.filter(item => {
            return item.type === elementType.crop
        })
        if (elementCropArr.length > 0) {
            return
        }
        // 当前选中元素
        const eqxElementsSelected = Vue.store.state.photoScene.eqxElementsSelected
        // 判断mouseover的元素和当前选中的元素是否是同一个
        const exist = eqxElementsSelected.find(ele => ele.elementJson.id === this.elementJson.id) // 选中的元素 hover不生效
        if (exist) {
            return
        }
        this.updateCss({ border: '1px dashed #1593FF' })
    })

    this.$el.addEventListener('mouseleave', () => {
        this.updateCss({ border: '1px dashed transparent' })
    })
}
