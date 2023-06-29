import types from '../mutationTypes'

const state = {
    userInfo: {}
}

const mutations = {
    [types.USER_SET](state, { userInfo }) {
        state.userInfo = userInfo
    },
    [types.USER_PHONE_CHANGE](state, { phone }) {
        state.userInfo.phone = phone
    },
    [types.USER_WATER_RIGHT](state, rightState) {
        if (state.userInfo.rights) {
            state.userInfo.rights.shareWithoutWatermark = rightState
        } else {
            state.userInfo.rights = {}
            state.userInfo.rights.shareWithoutWatermark = rightState
        }
    },
    [types.USER_UPLOAD_LIMIT_RIGHT](state, val) {
        if (state.userInfo.rights) {
            state.userInfo.rights.uploadLimit = val
        } else {
            state.userInfo.rights = {}
            state.userInfo.rights.uploadLimit = val
        }
    }
}

export default {
    state,
    mutations
}
