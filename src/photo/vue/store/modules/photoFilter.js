import types from '../mutationTypes'

const state = {
    type: 'filter',
    glCanvas: null,
    snapshot: '', // 生成的快照
    primaryImgData: '', // 切换过来时保存的原图 点击应用时保存的原图
    width: '', // 主画布宽度
    height: '', // 主画布高度
    isBackToOriginState: null, // 是不是回到了原图
    intensity: 0, // 强度
    firstAddHistory: true,
    executeFilter: null // 立即执行
}

const mutations = {
    [types.PHOTO_FILTER_HISTORY_RENDER](state, { snapshoot, snapshot }) {
        state.primaryImgData = snapshoot
        state.executeFilter = new Date().getTime()
        // state.snapshot = snapshot
    },
    [types.PHOTO_FILTER_FIRST_ADD_HISTORY](state, flag) {
        state.firstAddHistory = flag
    },
    [types.PHOTO_FILTER_IS_BACK_TO_ORIGIN](state, flag) {
        state.isBackToOriginState = new Date().getTime()
    },
    [types.PHOTO_FILTER_PRIMARY_IMG_CHANGE](state, data) {
        state.primaryImgData = data
        const { width, height } = Vue.store.state.photoScene.eqxScene.sceneJson
        state.width = width
        state.height = height
    },
    [types.PHOTO_FILTER_SNAPSHOT_CHANGE](state, data) {
        state.snapshot = data
    },
    [types.PHOTO_FILTER_INTENSITY_CHANGE](state, { val }) {
        state.intensity = val
    }

}

export default {
    state,
    mutations
}
