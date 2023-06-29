import { host } from '../config/env'

export default {
    getPage,
    savePage,
    deletePage,
    catchQrCode,
    batchSave,
    updatePageSort,
    copyPage,
    getPurchasedPage,
    getServerTimestamp
}

/**
 * 获取模板里其中的一页
 * @param pageId
 * @param printIdCode id_code 形式 日签系统是id
 * @param productId
 * @returns {*}
 */
function getPage(pageId, printIdCode, productId) {
    let v = ''
    if (typeof (printIdCode) === 'string' && printIdCode.indexOf('_') > -1) {
        // id_code 形式则用v1新版本
        v = '/v1'
    }
    const url = !Vue.store.state.user.userInfo.id
        ? `${host.p1}/print/page/hasPurchase${v}`
        : `${host.p1}/m/print/page/hasPurchase${v}`
    return axios.get(url, {
        params: {
            pageId,
            printId: printIdCode,
            productId
        }
    })
}

/**
 * 保存页
 * @param {*} page
 */
function savePage(page) {
    const url = !Vue.store.state.user.userInfo.id
        ? `${host.p1}/print/page/save`
        : `${host.p1}/m/print/page/save`
    return axios.post(url, page, {
        headers: {
            'Content-Type': 'text/plain; charset=UTF-8'
        }
    })
}

/**
 * 复制页
 * @param {*} page
 */
function copyPage(page) {
    const url = !Vue.store.state.user.userInfo.id
        ? `${host.p1}/print/page/copy`
        : `${host.p1}/m/print/page/copy`
    return axios.post(url, page, {
        headers: {
            'Content-Type': 'text/plain; charset=UTF-8'
        }
    })
}

/**
 * 批量保存页
 * @param {*} pages
 */
function batchSave(pages) {
    const url = `${host.p1}/m/print/page/batch/save`
    return axios.post(url, pages, {
        headers: {
            'Content-Type': 'text/plain; charset=UTF-8'
        }
    })
}

/**
 * 删除页
 * @param pageId
 * @param printId
 * @returns {*}
 */
function deletePage(pageId, printId) {
    const url = !Vue.store.state.user.userInfo.id
        ? `${host.p1}/print/page/delete`
        : `${host.p1}/m/print/page/delete`
    return axios.get(url, {
        params: {
            id: pageId,
            printId
        }
    })
}

/**
 * 上传封面图返回唯一code码，用于小程序分享页面获取数据
 * @param cover
 */
function catchQrCode(covers) {
    const url = `${host.p1}/print/sort/encode`
    return axios.get(url, {
        params: {
            cover: covers
        }
    })
}

/**
 * 修改页面顺序
 * @param printIdCode id_code 形式
 * @param pageId
 * @param targetPageSort
 */
function updatePageSort(printIdCode, pageId, targetPageSort) {
    const url = !Vue.store.state.user.userInfo.id
        ? `${host.p1}/print/pageSort/v1`
        : `${host.p1}/m/print/pageSort/v1`
    return axios.get(url, {
        params: {
            printId: printIdCode,
            pageId,
            targetPageSort
        }
    })
}

/**
 * 获取已购模板里其中的一页
 * @param pageId
 * @param printId
 * @returns {*}
 */
function getPurchasedPage(pageId, printId) {
    const url = !Vue.store.state.user.userInfo.id
        ? `${host.p1}/print/page/getMyPurchaseById`
        : `${host.p1}/m/print/page/getMyPurchaseById`
    return axios.get(url, {
        params: {
            pageId,
            printId
        }
    })
}

/**
 * 获取服务器时间
 * @returns {*}
 */
function getServerTimestamp(bannerId) {
    const url = `${host.p1}/print/getPrintServerTimestamp`
    return axios({
        method: 'GET',
        url: url
    })
}
