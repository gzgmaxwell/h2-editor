import types from '../mutationTypes'

const state = {
    type: 'rotate',
    revise: { val: 0 }, // 拖拽旋转角度值
    index: -1,
    executeGenerateImg: null, // 这个值一旦改变立马去生成真正的img
    rotateConfig: {}, // 历史回退之后刷新此配置，页面监听该配置，然后按照配置旋转
    firstShot: null,
    record: {}, // 当前的旋转配置 下载到电脑的时候使用
    isBackToOriginState: null // 标志是否点击 回退到原图
}

const mutations = {
    [types.PHOTO_ROTATE_REVISE_CHANGE](state, val) {
        state.revise = val
    },
    [types.PHOTO_ROTATE_GENERATE_IMG](state) {
        state.executeGenerateImg = new Date().getTime()
    },
    [types.PHOTO_ROTATE_HISTORY_RENDER](state, config) {
        state.firstShot = config.firstShot
        state.rotateConfig = config.config
        state.record = config.config
    },
    [types.PHOTO_ROTATE_BACK_TO_ORIGIN](state) {
        state.isBackToOriginState = new Date().getTime()
    },
    [types.PHOTO_ROTATE_KEEP_CONFIG](state, config) {
        state.record = config
    }
}

export default {
    state,
    mutations
}
