const env = require('env')
/**
 * 更新作品信息
 * @param info 所有的字段都能更新
 * @returns {*}
 */
function updateScene(info, userId) {
    const url = !userId
        ? `${env.host.p1}/print/update`
        : `${env.host.p1}/m/print/update`
    return axios.post(url, info, {
        headers: { 'Content-Type': 'text/plain; charset=UTF-8' }
    })
}
// 发布预览
function previewRelease(params) {
    return axios.post(`${env.host.p1}/m/print/share/check`, params, {
        headers: {
            'Content-Type': 'text/plain; charset=UTF-8'
        }
    })
}
function getShareInfo(id) {
    let apiVersion = ''
    if (typeof (id) === 'string' && id.indexOf('_') > -1) {
        // id 值若为 id_code 形式则用v1新版本
        apiVersion = '/v1'
    } else {
        console.warn('路由未更新，请及时联系lirui')
    }
    const url = `${env.host.p1}/print/covers${apiVersion}?printId=${id}`

    return axios.get(url, {
        headers: {
            'Content-Type': 'text/plain; charset=UTF-8'
        }
    })
}
function getUserInfoByPrintId(id) {
    let apiVersion = ''
    if (typeof (id) === 'string' && id.indexOf('_') > -1) {
        // id 值若为 id_code 形式则用v1新版本
        apiVersion = '/v1'
    } else {
        console.warn('路由未更新，请及时联系lirui')
    }
    const url = `${env.host.p1}/print/getUserInfoByPrintId${apiVersion}?printId=${id}`

    return axios.get(url, {
        headers: {
            'Content-Type': 'text/plain; charset=UTF-8'
        }
    })
}
function getCoversBySourceId(sid) {
    let apiVersion = ''
    if (typeof (sid) === 'string' && sid.indexOf('_') > -1) {
        // id 值若为 id_code 形式则用v1新版本
        apiVersion = '/v1'
    } else {
        console.warn('路由未更新，请及时联系lirui')
    }

    const url = `${env.host.p1}/print/getPrintPageCovers${apiVersion}?sourceIds=${sid}`
    return axios.get(url, {
        headers: {
            'Content-Type': 'text/plain; charset=UTF-8'
        }
    })
}
export default {
    updateScene,
    previewRelease,
    getShareInfo,
    getUserInfoByPrintId,
    getCoversBySourceId
}
