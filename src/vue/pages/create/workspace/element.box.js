import ElementBox from './ElementBox.vue'

export default function initElementBox(css, scale, value, id, elementType) {
    // 只有文字有padding
    const wrap = parseInt(css.padding || 0) * 2 + parseInt(css.borderWidth) * 2
    const width = parseInt(css.width) + wrap
    const height = parseInt(css.height) + wrap
    const UiElementBox = Vue.extend(ElementBox)
    return new UiElementBox({
        propsData: {
            css: {
                left: Math.round(parseInt(css.left) * scale) + 'px',
                top: Math.round(parseInt(css.top) * scale) + 'px',
                width: Math.round(width * scale) + 'px',
                height: Math.round(height * scale) + 'px',
                zIndex: css.zIndex,
                transform: css.transform
            },
            value,
            id,
            elementType
        }
    })
}
