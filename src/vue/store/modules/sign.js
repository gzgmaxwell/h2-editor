import types from '../mutationTypes'

//  INTRO 介绍页面
//  EDIT 创建/修改页面
//  INFO  查看订阅信息页面
//  NOTICE  提示页面
const state = {
    subscribe: {
        layout: 'INTRO' // 订阅页面
    },
    showCrop: false, // 显示裁剪
    info: null, // 订阅信息
    user: {
        userId: '', // 轻设计用户id
        unionId: '', //
        mpOpenId: '' // 创意云公号openid
    },
    result: 0, // 0 未订阅 1 已订阅 -1 订阅失败
    attention: 0 // 0 未关注  1 已关注

}

const mutations = {
    [types.SIGN_SUBSCRIBE_STATUS](state, { layout }) {
        state.subscribe.layout = layout
    },
    [types.SIGN_SHOW_CROP](state, show) {
        state.showCrop = show
    },
    [types.SIGN_INFO](state, info) {
        state.info = info
    },
    [types.SIGN_USER](state, { userId, unionId, mpOpenId }) {
        state.user.mpOpenId = mpOpenId
        state.user.unionId = unionId
        state.user.userId = userId
    },
    [types.SIGN_RESULT](state, result) {
        state.result = result
    },
    [types.SIGN_ATTENTION](state, attention) {
        state.attention = attention
    }
}

export default {
    state,
    mutations
}
