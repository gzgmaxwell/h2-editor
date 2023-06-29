import types from '../mutationTypes'

const state = {
}

const mutations = {
}

const actions = {
    [types.PHOTO_ELEMENTS_HISTORY_RENDER](state, { elemetsState, base64Data }) {
        const eqxPage = Vue.store.state.photoScene.eqxPage
        // 移除颜色选择
        Vue.colorPicker.close()
        // 移除文字设置面板
        Vue.textStyleSetting.close()
        // 清除所有组件
        eqxPage.clearElements()
        // 清除选中组件
        Vue.store.commit('PHOTO_ELEMENT_SELECT', { eqxElements: [] })
        // 重新渲染所有元素
        eqxPage.addElements(elemetsState)
        // 重新生成新的canvas

        if (base64Data) {
            const $canvas = document.getElementsByClassName('eqc-photo-background-image')[0]
            const ctx = $canvas.getContext('2d')
            const img = new Image()
            img.src = base64Data
            img.onload = function () {
                ctx.drawImage(img, 0, 0)
            }
        }
    }
}

export default {
    state,
    mutations,
    actions
}
