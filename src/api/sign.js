import { host } from '../config/env'

export default {
    createSubscribe,
    updateSubscribe,
    getSubscribe,
    unsubscribe,
    followWechat,
    getSignImage
}

/**
 * 创建订阅日签
 */
function createSubscribe(parms) {
    return axios.post(`${host.p1_sign}/print/daySign/addSubscibe`, parms)
}

/**
 * 更新订阅日签
 */
function updateSubscribe(parms) {
    return axios.post(`${host.p1_sign}/print/daySign/updateSubscibe`, parms)
}

/**
 * 获取订阅信息
 */
function getSubscribe(parms) {
    return axios.post(`${host.p1_sign}/print/daySign/findSubscibe`, parms)
}

/**
 * 取消订阅
 */
function unsubscribe(parms) {
    return axios.post(`${host.p1_sign}/print/daySign/cancleSubscibe`, parms)
}

/**
 * 是否已关注公众号
 */
function followWechat(openId) {
    return axios.get(`${host.p1_sign}/print/daySign/isAttentionMp?openId=${openId}`)
}

/**
 * 获取日签（往微信公众号里发送一张日签作品）
 */
function getSignImage(openId) {
    return axios.post(`${host.p1_sign}/print/daySign/getDaySign?openId=${openId}`)
}
