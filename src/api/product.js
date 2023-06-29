import { host } from '../config/env'
import { apiCache } from '../utils/apiCache'

const category = {}

export default {
    getCategoryListByTopId,
    getTemplatesBought,
    getOrderStatus,
    getH5Product,
    getEFormAndLongPage,
    getInteractH5,
    getCombineElementDetail,
    getFontDetailInfo,
    getFontStyleDataList,
    getVideoProduct,
    defaultPropertiesSearch,
    getNewProducts,
    getCategoryListByFatherId,
    getAttributeMallDTOById,
    getBenefitOrderStatus,
    updatePrintOrders,
    createPrintOrders,
    getTemplateIdByPrintId,
    addFavoriteOrHasBuy,
    deleteFavorite,
    getFavoriteList,
    getMyProducts,
    hasFavoriteOrHasBuy,
    getTemplateCategory,
    getFavoritePrintByAttrGroupid,
    getPrintBannerByType
}

/**
 * 根据分类id获取所有的子孙分类，并将串形格式整理成树形格式
 * @param id 不同环境id不同
 */
function getCategoryListByTopId(id) {
    return apiCache({
        method: 'GET',
        url: `${host.mall}/api/category/getCategoryListByTopId`,
        params: { id }
    })
        .then(res => {
            if (!category[id]) {
                category[id] = [{ id, name: '全部' }]
                const firstCategory = {}
                res.data.list.forEach(item => {
                    if (item.parentId === id) {
                        category[id].push(item)
                    } else {
                        if (!firstCategory[item.parentId]) {
                            firstCategory[item.parentId] = []
                        }

                        firstCategory[item.parentId].push(item)
                    }
                })

                category[id].forEach(item => {
                    item.list = firstCategory[item.id] || []
                })
            }
            return category[id]
        })
}

/**
 * 获取搜索新模板的新接口
 * @param {*} param0
 */
function getNewProducts(params) {
    if (params.keyWord === '') {
        delete params.keyWord
    }
    if (!params.mostType) {
        params.mostType = 'sort'
    }

    return apiCache({
        method: 'GET',
        url: `${host.p1}/print/mallSearch/listProdByMall`, // 新search查询模板数据
        params
    })
}

/**
 * 获取购买的模板
 * @param {*} type
 */
function getTemplatesBought({ type, pageNo = 1, pageSize = 18 }) {
    const params = { type, pageNo, pageSize }
    return axios.get(`${host.p1}/m/print/page/myPurchase`, { params })
}

/**
 * 根据业务订单号轮询业务订单生成状态
 * @param payId
 * @returns {Promise}
 */
function getOrderStatus(payId, pageId, printId) {
    let count = 0
    const defer = window.Defer()
    const loop = () => {
        // 执行15次后停止
        if (++count > 15) {
            defer.reject()
            return
        }

        axios.post(`${host.p1}/m/charge/query`, { payId, pageId, printId })
            .then(res => {
                const status = res.data.map.status
                if (status === 0 || // 未处理
                    status === 2) { // 处理中
                    setTimeout(() => {
                        loop(payId)
                    }, 1000)
                } else if (status === 1) { // 已处理
                    defer.resolve(res)
                } else if (status === 3) { // 失败
                    defer.reject()
                } else {
                    defer.reject()
                }
            })
            .catch(() => {
                defer.reject()
            })
    }
    loop(payId)
    return defer.promise
}

/**
 * 获取我的作品H5
 * @param {*} type
 */
function getH5Product({ pageNumber = 1, pageSize = 8 }) {
    const params = { pageNumber, pageSize }
    return axios({
        method: 'GET',
        url: `${host.service}/m/v1/workbench/getMySceneList`,
        params
    })
}

/**
 * 获取我的作品易表单或者获取我的作品长页面
 * @param {*} type
 */
function getEFormAndLongPage(params) {
    return axios({
        method: 'GET',
        url: `${host.lpservice}/m/lp/my`,
        params
    })
}

/**
 * 获取我的作品互动H5
 * @param {*} type
 */
function getInteractH5(params) {
    return axios({
        method: 'GET',
        url: `${host.hdcapi}/m/hd/activity/query/activityList`,
        params
    })
}

/**
 * 获取组合元素详情
 * @param {*} sourceId
 */
function getCombineElementDetail(sourceId) {
    return axios.get(`${host.p1}/print/getCombineElements`, {
        params: {
            sourceId
        }
    })
}

/**
 * 获取字体详情(支持查多个)
 * @param {*} family {"fontFamily":[]}
 */
function getFontDetailInfo(familys) {
    return axios.get(`${host.p1}/print/getFontListByFamily`, {
        params: {
            family: JSON.stringify(familys)
        }
    })
}

/**
 * 获取文字样式数据
 */
function getFontStyleDataList() {
    return axios.get(`${host.p1}/print/getComponentStyles`, {
        params: {
            styleStatus: 1,
            pageSize: 100
        }
    })
}

/**
 * 获取我的作品视频
 * @param {*} type
 */
function getVideoProduct(params) {
    return axios({
        method: 'GET',
        url: `${host.videoservice}/video/user/video/my`,
        params
    })
}

/**
 * 默认查询
 * @returns {*}
 */
function defaultPropertiesSearch(type, pageSize = 3) {
    return axios.get(`${host.p1}/print/mallSearch/defaultPropertiesSearch`, {
        params: {
            type: type,
            pageNo: 1,
            pageSize: pageSize
        }
    })
}

/**
 * 根据分类id获取子分类（新）
 * 只返回该分类下的第一层子分类
 * @param categoryId
 */
function getCategoryListByFatherId(categoryId) {
    return apiCache({
        method: 'GET',
        url: `${host.p1}/print/tpl/getChildCategoryListByCategoryId`,
        params: { categoryId }
    })
}

/**
 * 根据属性ID获取属性对象
 * @param {属性ID} id
 */
function getAttributeMallDTOById(id) {
    return apiCache({
        method: 'GET',
        url: `${host.p1}/print/config/getAttributeMallDTOById`,
        params: { id },
        ignoreInterceptor: true
    })
}

/**
 * 根据业务订单号轮询业务订单生成状态
 * @param payId
 * @returns {Promise}
 */
function getBenefitOrderStatus(payId) {
    let count = 0
    const defer = window.Defer()
    const loop = () => {
        // 执行15次后停止
        if (++count > 15) {
            defer.reject()
            return
        }

        axios.post(`${host.p1}/m/charge/queryOrderStatus`, { payId })
            .then(res => {
                const status = res.data.map.status
                if (status === 0 || // 未处理
                    status === 2) { // 处理中
                    setTimeout(() => {
                        loop(payId)
                    }, 1000)
                } else if (status === 1) { // 已处理
                    defer.resolve(res)
                } else if (status === 3) { // 失败
                    defer.reject()
                } else {
                    defer.reject()
                }
            })
            .catch(() => {
                defer.reject()
            })
    }
    loop(payId)
    return defer.promise
}

/**
 * 更新订单
 * @param {订单id} pOrderId
 * @param {模板id} pTemplateId
 * @param {轻设计id} isPrintId
 */
function updatePrintOrders(pOrderId, pTemplateId, isPrintId) {
    return axios.post(`${host.p1}/m/charge/updatePrintOrders`, { outOrderId: pOrderId, sourceId: pTemplateId, isPrintId })
}

/**
 * 创建订单
 */
function createPrintOrders(info) {
    return axios.post(`${host.p1}/m/charge/insertPrintOrders `, {
        name: info.name,
        productId: info.id,
        totalFee: info.price,
        outOrderId: info.orderId,
        sourceId: info.templateId,
        status: info.status, // 购买会员（购买完成） 1  下载（预购买） 2
        sourceUser: info.sourceUser // 秀客id
    })
}

/**
 * 查询商品id（模板id）
 */
function getTemplateIdByPrintId(printId) {
    return axios.get(`${host.p1}/print/getProductByPrintId`, {
        params: {
            printId
        }
    })
}

/**
 * 添加收藏
 */
function addFavoriteOrHasBuy({ productId, categoryId, type }) {
    return axios.post(`${host.p1}/m/print/commercialize/addFavoriteOrHasBuy `, {
        productId: productId,
        categoryId: categoryId,
        type: type
    })
}
/**
 * 删除收藏
 */
function deleteFavorite(productId) {
    return axios.post(`${host.p1}/m/print/commercialize/deleteFavorite `, {
        productIds: productId
    })
}

/**
 * 查询收藏列表
 */
function getFavoriteList(info) {
    return axios.get(`${host.p1}/m/print/commercialize/getFavoriteByAttrGroupid`, {
        params: {
            pageNo: info.pageNo,
            pageSize: info.pageSize
        }
    })
}

/**
 * 查询我的购买列表
 */
function getMyProducts(info) {
    return axios.get(`${host.p1}/m/print/commercialize/getMyProducts`, {
        params: {
            pageNo: info.pageNo,
            pageSize: info.pageSize
        }
    })
}
/**
 * 添加收藏
 */
function hasFavoriteOrHasBuy(productId, type) {
    return axios.get(`${host.p1}/m/print/commercialize/hasFavoriteOrHasBuy`, {
        params: {
            productId: productId,
            type: type
        }
    })
}

/**
 * 获取模板分类列表
 * @param {尺寸类型} pType
 */
function getTemplateCategory(pType) {
    return axios.get(`${host.p1}/print/tpl/getAttributeByType`, {
        params: {
            type: pType
        }
    })
}

/**
 * 获取我的模板收藏列表
 */
function getFavoritePrintByAttrGroupid(info) {
    return axios.get(`${host.p1}/m/print/commercialize/getFavoritePrintByAttrGroupid`, {
        params: {
            pageNo: info.pageNo,
            pageSize: info.pageSize,
            groupId: 7
        }
    })
}

/**
 * 运营位banner配置
 */
function getPrintBannerByType(type) {
    return axios.get(`${host.p1}/print/getPrintBannerByType`, {
        params: {
            type: type
        }
    })
}
