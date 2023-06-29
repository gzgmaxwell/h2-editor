import { host } from '../config/env'
import { apiCache } from '../utils/apiCache'

export default {
    getSceneBanners,
    getBanners,
    getCooperationAuth
}

/**
 * 获取作品分类展示
 */
function getSceneBanners() {
    return apiCache({
        method: 'GET',
        url: `${host.p1}/print/category`
    })
}

/**
 * 获取banners
 * @param {*} position 1,2,3
 */
function getBanners(position) {
    return apiCache({
        method: 'GET',
        url: `${host.p1}/print/position`,
        params: {
            position
        }
    })
}

/**
 * 获取互拉按钮显示权限
 */
function getCooperationAuth() {
    return axios.get(host.iwork + '/m/cooperate/gray/checkUserGray')
}
