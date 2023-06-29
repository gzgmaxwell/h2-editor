const obj = {}

/**
 * 根据key获取缓存里的对象信息
 * @param {*} key
 */
function getInfo(key) {
    if (!obj[key]) {
        obj[key] = {
            isBusy: false,
            isEnd: false,
            pageNo: 1,
            pageSize: 30,
            count: -1,
            list: []
        }
    }
    return obj[key]
}

/**
 * 根据key获取下一页的数据
 * @param {*} key
 */
function getMoreItems(key, params) {
    const obj = getInfo(key)
    params = Object.assign({
        pageNo: obj.pageNo,
        pageSize: obj.pageSize
    }, JSON.parse(key), params)
    let promise = null

    if (obj.isBusy || obj.isEnd) {
        return Promise.reject()
    }

    obj.isBusy = true

    switch (params.tab) {
        case 'sys':
            promise = Vue.api.product.getNewProducts(params)
            break
        case 'new':
            promise = Vue.api.product.getNewProducts(params)
            break
        case 'buy-template':
            promise = Vue.api.product.getTemplatesBought(params)
            break
        case 'collect-template':
            promise = Vue.api.product.getFavoritePrintByAttrGroupid(params)
            break
        case 'upload':
            promise = Vue.api.file.getUploadFiles(params)
            break
        case 'material-purchase':
            promise = Vue.api.product.getMyProducts(params)
            break
        case 'material-collect':
            promise = Vue.api.product.getFavoriteList(params)
            break
        default:
            // recently reject
            promise = Promise.reject()
    }

    return promise
        .then(res => {
            const data = res.data
            obj.count = (data.map && data.map.count) || data.list.length
            obj.pageNo++

            // 去除可能重复的值
            if (!obj.list.length) {
                obj.list.push(...data.list)
            } else {
                data.list.forEach((item, i) => {
                    if (!findSameItem(obj.list, item, i)) {
                        obj.list.push(item)
                    }
                })
            }

            obj.isBusy = false
            obj.isEnd = obj.list.length === obj.count || !data.list.length
        })
        .catch(err => {
            obj.isBusy = false
            return Promise.reject(err)
        })
}

/**
 * 查找相同的对象
 * @param {*} list
 * @param {*} item
 */
function findSameItem(list, item, index) {
    for (let i = 0; i < list.length; i++) {
        if (list[i].id === item.id) {
            // Vue.logger.warn(`重复数据，id:${item.id}，sourceIndex:${i}，targetIndex:${index}`)
            return true
        }
    }
    return false
}

/**
 * 根据参数设置key
 * @param {*} params
 */
function setKey(params) {
    return JSON.stringify(sortObj(params))
}

/**
 * 根据参数删除相应的对象信息
 * @param {*} params
 */
function clearKey(params) {
    delete obj[setKey(params)]
}

/**
 * 将对象的属性排序后，重新返回，避免将对象转成字符串后不一致的问题
 * @param {*} params
 */
function sortObj(params) {
    const obj = {}
    const arr = []
    for (const key in params) {
        arr.push(key)
    }
    arr.sort().forEach(key => {
        obj[key] = params[key]
    })
    return obj
}

function install() {
    Vue.infiniteScroll = Vue.prototype.infiniteScroll = {
        getInfo,
        getMoreItems,
        setKey,
        clearKey
    }
}

Vue.use(install)

export default install
