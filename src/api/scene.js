import { host } from '../config/env'
import { apiCache } from '../utils/apiCache'
export default {
    addScene,
    addSceneByTemplate,
    getScene,
    getScenes,
    transferScene,
    copyScene,
    deleteScene,
    applyTpl,
    getDictionaryCategory,
    updateScene,
    massProduction,
    massProductionMultipage,
    operation,
    getLabelListByBannerId,
    getPriceByBannerId,
    getCategoryForTpl,
    getpurchasedScene,
    saveWorkUseInfo,
    getNewShortURL,
    getAnalyseDataFromPdf
}

/**
 * 添加新作品
 * @param scene
 * @param createStyle 创建模式 1:模板创建、2:空白创建、3:批量创建、4:日签订阅、5:作品分享海报/二维码、6：复制创建、7：图片编辑创建 8:艺术二维码创建 9 ：长页素材库在线创建
 * @returns {*}
 */
function addScene(scene, isVistor, createStyle = 2) {
    const url = isVistor
        ? `${host.p1}/print/create/v1`
        : `${host.p1}/m/print/create/v1`
    return axios.post(url, Object.assign(scene, { createStyle }), {
        headers: { 'Content-Type': 'text/plain; charset=UTF-8' }
    })
}

/**
 * 从模创建新作品
 * @param productId
 * @returns {*}
 */
function addSceneByTemplate(productId, isVistor, createStyle) {
    const url = isVistor
        ? `${host.p1}/print/workbench/create/v1`
        : `${host.p1}/m/print/workbench/create/v1`
    return axios.post(url, { productId, createStyle })
}

/**
 * 获取作品信息
 * @param {*} id
 * @param {*} needPages
 */
function getScene(id, needPages, pageId = 1) {
    let apiVersion = ''
    if (typeof (id) === 'string' && id.indexOf('_') > -1) {
        // id 值若为 id_code 形式则用v1新版本
        apiVersion = '/v1'
    } else {
        console.warn('路由未更新，请及时联系lirui')
    }
    let url = !Vue.store.state.user.userInfo.id
        ? `/print/info${apiVersion}?id=${id}`
        : `/m/print/info${apiVersion}?id=${id}`
    if (needPages) {
        url += `&page=${pageId}`
    }
    return axios.get(host.p1 + url)
}

/**
 * 获取已购模板信息
 * @param {*} id
 * @param {*} page
 */
function getpurchasedScene(id, page) {
    let apiVersion = ''
    if (typeof (id) === 'string' && id.indexOf('_') > -1) {
        // id 值若为 id_code 形式则用v1新版本
        apiVersion = '/v1'
    } else {
        console.warn('路由未更新，请及时联系lirui')
    }
    const url = `/m/print/findPurchasePrintListForUser${apiVersion}?id=${id}&page=${page}`
    return axios.get(host.p1 + url)
}

/**
 * 获取作品列表
 * @param {*} pageNo
 * @param {*} pageSize
 * @param {*} keyWords
 */
function getScenes(pageNo = 1, pageSize = 15, keyWords = '') {
    return axios.post(`${host.p1}/m/print/list`, {
        pageNo,
        pageSize,
        title: keyWords
    })
}

/**
 * 转赠物料
 * @param id
 * @param loginName
 * @returns {*}
 */
function transferScene(id, loginName, isVisitor) {
    const url = isVisitor
        ? `${host.p1}/print/transfer`
        : `${host.p1}/m/print/transfer`
    return axios.post(url, {
        loginName,
        id
    })
}

/**
 * 复制物料
 * @param idcode  id_code 形式
 * @returns {*}
 */
function copyScene(idcode) {
    return axios.get(`${host.p1}/m/print/copy/v1?id=${idcode}&createStyle=6`)
}

/**
 * 删除物料
 * @param idcode  id_code 形式
 * @returns {*}
 */
function deleteScene(idcode) {
    return axios.get(`${host.p1}/m/print/delete/v1?id=${idcode}`)
}

/**
 * 申请为模板
 * @param data
 * @returns {*}
 */
function applyTpl(data) {
    return axios.post(`${host.p1}/print/tpl/applyTpl`, data)
}

/**
 * 获取场景分类
 */
function getDictionaryCategory() {
    return apiCache({
        method: 'GET',
        url: `${host.p1}/print/dictionary/print_size_list`
    })
}

/**
 * 更新作品信息
 * @param info 所有的字段都能更新
 * @returns {*}
 */
function updateScene(info) {
    const url = !Vue.store.state.user.userInfo.id
        ? `${host.p1}/print/update`
        : `${host.p1}/m/print/update`
    return axios.post(url, info, {
        headers: { 'Content-Type': 'text/plain; charset=UTF-8' }
    })
}

/**
 * 批量生成单页
 * @param info 所有的字段都能更新
 * @returns {*}
 */
function massProduction(data) {
    const url = `${host.p1}/m/print/batch/create`
    data.map((v, i) => {
        v.createStyle = 3
    })
    return axios.post(url, data, {
        headers: { 'Content-Type': 'text/plain; charset=UTF-8' }
    })
}

/**
 * 批量生成多页
 * @param info 所有的字段都能更新
 * @returns {*}
 */
function massProductionMultipage(data) {
    const url = `${host.p1}/m/print/batch/batchMultipageCreate`
    data.map((v, i) => {
        v.createStyle = 3
    })
    return axios.post(url, data, {
        headers: { 'Content-Type': 'text/plain; charset=UTF-8' }
    })
}

/**
 * 弹窗运营位数据
 * @returns {*}
 */
function operation() {
    return axios({
        method: 'GET',
        url: `${host.s2}/eqs/banners?pageCode=print_editor_banner`,
        withCredentials: false
    })
}

/**
 * 根据BANNER的ID获取组件标签列表
 * @returns {*}
 */
function getLabelListByBannerId(bannerId) {
    const url = `${host.p1}/m/print/findBannerById?id=${bannerId}`
    return axios({
        method: 'GET',
        url: url
    })
}

/**
 * 根据BANNER的ID获取模板价格列表
 * @returns {*}
 */
function getPriceByBannerId(bannerId) {
    const url = `${host.p1}/print/getPriceByBannerId?type=${bannerId}`
    return axios({
        method: 'GET',
        url: url
    })
}

/**
 * 根据BANNER的ID获取模板价格列表
 * @returns {*}
 */
function getCategoryForTpl(bannerId) {
    const url = `${host.p1}/print/tpl/getCategoryForTpl?type=${bannerId}`
    return axios({
        method: 'GET',
        url: url
    })
}

/**
 * 作品操作记录
 * resolutionType:分辨率类型 原图：3  2——5倍图：4——7 10倍图：8
 * watermarkType： 水印类型 1：有 2：无
 * fileFormat： 文件格式
 */
function saveWorkUseInfo(data) {
    const url = `${host.p1}/print/saveWorksUseInfo`
    return axios.post(url, {
        printId: data.printId,
        operateType: 1, // 1:下载
        resolutionType: data.resolutionType,
        watermarkType: data.watermarkType,
        fileFormat: data.fileFormat
    })
}

/**
 * 根据长连接获取短连接
 * @returns {*}
 */
function getNewShortURL(longUrl) {
    const url = `${host.p1}/print/matting/getNewShortURL`
    return axios.post(url, {
        sourceURL: longUrl
    })
}

/**
 * 传入key 解析pdf
 * @returns {*}
 */
function getAnalyseDataFromPdf(pdfUrl) {
    const url = `${host.p1}/print/pdf/extract`
    return axios.post(url, {
        url: pdfUrl
    })
}
