import { host } from '../config/env'

export default {
    getUserInfo,
    logout,
    login,
    getUserBenefits,
    benefitSign,
    useUserBenefits,
    productSign
}

/**
 * 获取当前用户信息
 */
function getUserInfo(ignoreInterceptor = false) {
    return axios.get(`${host.passport}/account/info?t=${Date.now()}`, {
        ignoreInterceptor
    })
}

/**
 * 退出登录
 */
function logout() {
    return axios.get(`${host.passport}/logout`)
}

/**
 * 用户登录
 * 日签系统使用
 */
function login(parms) {
    return axios.post(`${host.passport}/login`, parms, {
        headers: {
            'Device-Number': 'h2signsystem13882274172',
            'Device-Sig': '19d2633060dc6931900ecf543760db8a', // '2eca96f057b7894f065530839529d5d9',
            'Eqxiu-User-Agent': 'EQXiuApplet-h2autosign'
        }
    })
}

/**
 * 得用户指定生效中的权益列表(到期时间降序排列)，适用于查询用户单个权益信息/权益余量
 * @param {权益类别ID  参考常量类 BenefitCategoryId} pCategoryIds
 */
function getUserBenefits(pCategoryIds) {
    return axios.get(`${host.p1}/m/print/userBenefits/getUserBenefits?categoryIds=${pCategoryIds}`)
}

/**
 * 获取签名
 */
function benefitSign(parms) {
    return axios.post(`${host.p1}/m/charge/benefitSign`, parms)
}

/**
 * 权益-消耗权益
 */
function useUserBenefits(pCategoryId, pTimes) {
    return axios.get(`${host.p1}/m/print/userBenefits/consumeUserBenefit?categoryId=${pCategoryId}&times=${pTimes}`)
}

/**
 * 获取素材购买签名
 */
function productSign(parms) {
    return axios.post(`${host.p1}/m/charge/signatureMaterial`, parms)
}
