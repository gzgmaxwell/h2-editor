import types from '../mutationTypes'

const state = {
    background: null
}

const mutations = {
}

const actions = {
    [types.PHOTO_CROP_HISTORY_RENDER](state, { snapshoot, operating }) {
        state.state.background = {
            base64Str: snapshoot,
            width: operating.width,
            height: operating.height,
            timestamp: new Date().getTime()
        }
    }
}

export default {
    state,
    mutations,
    actions
}
