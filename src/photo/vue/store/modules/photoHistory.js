import types from '../mutationTypes'
import historyType from '../../../../config/enum.photoHistory.type'

const state = {
    // 历史记录
    history: null,
    // 禁止后退
    disableBack: true,
    // 禁止前进
    disableForward: true
}

const executeHistory = (hisData) => {
    const actionInner = hisData.actionInner
    const actionType = hisData.actionType
    const snapshot = hisData.actionObject
    switch (actionType) {
        case historyType.base: {
            Vue.store.dispatch('PHOTO_BASE_HISTORY_RENDER', { snapshot, baseState: hisData.actionParams, actionInner })
            break
        }
        case historyType.crop:
            Vue.store.dispatch('PHOTO_CROP_HISTORY_RENDER', { snapshoot: hisData.actionObject, operating: hisData.actionParams })
            break
        case historyType.rotate:
            Vue.store.commit('PHOTO_ROTATE_HISTORY_RENDER', {
                config: hisData.actionParams,
                firstShot: hisData.actionObject
            })
            break
        case historyType.filter:
            Vue.store.commit('PHOTO_FILTER_HISTORY_RENDER', {
                // 效果图的截图快照
                snapshot: hisData.actionParams.snapshot,
                // 底图的快照
                snapshoot: hisData.actionObject
            })
            break
        case historyType.defaultElement:
        case historyType.text:
        case historyType.paster:
            Vue.store.dispatch('PHOTO_ELEMENTS_HISTORY_RENDER', { elemetsState: hisData.actionParams, base64Data: hisData.actionObject })
            break
        case historyType.defaultImage:
            Vue.store.dispatch('PHOTO_BASE_HISTORY_RENDER', { snapshot, baseState: hisData.actionParams, actionInner })
            break
    }
}

const operateHistory = (hisData) => {
    if (!hisData) {
        return
    }
    // 执行组件历史记录
    executeHistory(hisData.historyElement)
    // 执行背景历史记录
    executeHistory(hisData.historyImage)
    // 回退到某项操作时，切换到对应菜单，文字/贴纸 不需要切换
    if (Vue.store.state.photoLayout.nav.selectedItem.type !== hisData.menuType &&
        hisData.menuType !== historyType.text &&
        hisData.menuType !== historyType.paster) {
        const navs = Vue.store.state.photoLayout.nav.list.filter((v, i) => v.type === hisData.menuType)
        if (navs && navs.length > 0) {
            const item = navs[0]
            Vue.store.commit('PHOTO_SCENE_IS_HISTORY_CHANGE_NAV', true)
            Vue.store.commit('PHOTO_NAV', { item })
            Vue.store.commit('PHOTO_NAV_PANEL', { show: true })
        }
    }
}
const mutations = {
    // 初始化
    [types.PHOTO_HISTORY_INIT](state, { photoHistory }) {
        state.history = photoHistory
    },
    // 设置后退、前进按钮状态
    [types.PHOTO_HISTORY_SET](state, { disableBack, disableForward }) {
        state.disableBack = disableBack
        state.disableForward = disableForward
    },
    // 点击后退按钮
    [types.PHOTO_HISTORY_BACK](state) {
        if (!state.disableBack) {
            const hisData = state.history.back()
            if (hisData && hisData !== '') {
                operateHistory(JSON.parse(hisData))
            }
        }
    },
    // 点击前进按钮
    [types.PHOTO_HISTORY_FORWORD](state) {
        if (!state.disableForward) {
            const hisData = state.history.forward()
            if (hisData && hisData !== '') {
                operateHistory(JSON.parse(hisData))
            }
        }
    },
    // 撤回到原图
    [types.PHOTO_HISTORY_UNDO_TO_ORIGINAL](state, { all }) {
        state.disableBack = true
        state.disableForward = true
        state.history.clear(all)
    }
}

const actions = {

}

export default {
    state,
    mutations,
    actions
}
