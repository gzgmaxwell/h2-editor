import TableWrapper from './TableWrapper.vue'

export default function initTableWrapper(eqxElement) {
    // 只有文字有padding
    const UiTableWrapper = Vue.extend(TableWrapper)
    return new UiTableWrapper({
        propsData: {
            eqxElement
        }
    })
}
