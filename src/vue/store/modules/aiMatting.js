import types from '../mutationTypes'

const state = {
    src: '', // 图
    scale: 1, // 缩放比例
    isOpenDrag: false, // 开启拖拽
    penMode: 'keep',
    penWidth: '20',
    smoothness: 0,
    undo: { random: 0 },
    redo: { random: 0 },
    filledColor: 'transparent',
    status: false // 可操作状态
}

const mutations = {
    [types.AIMATTING_MATTING_IMAGE](state, src) {
        state.src = src
    },
    [types.AIMATTING_MATTING_SCALE](state, scale) {
        state.scale = scale
    },
    [types.AIMATTING_MATTING_OPEN_DRAG](state, isOpenDrag) {
        state.isOpenDrag = isOpenDrag
    },
    [types.AIMATTING_MATTING_PEN_MODE](state, penMode) {
        state.penMode = penMode
    },
    [types.AIMATTING_MATTING_UNDO](state) {
        state.undo.random = Math.random()
    },
    [types.AIMATTING_MATTING_REDO](state) {
        state.redo.random = Math.random()
    },
    [types.AIMATTING_MATTING_PEN_WIDTH](state, penWidth) {
        state.penWidth = penWidth
    },
    [types.AIMATTING_MATTING_SMOOTHNESS](state, smoothness) {
        state.smoothness = smoothness
    },
    [types.AIMATTING_MATTING_FILL_COLOR](state, filledColor) {
        state.filledColor = filledColor
    },
    [types.AIMATTING_MATTING_STATUS](state, status) {
        state.status = status
    }
}

export default {
    state,
    mutations
}
