import qs from 'qs'
import logger from './logger'
import storageLocal from './storageLocal'

// 一小时
const EXPIRES = 60 * 60 * 1000

const PREFIX = storageLocal.key.api

/**
 * 缓存api接口
 * @param {*} httpConfig
 */
function apiCache(httpConfig) {
    const { method, url, params } = httpConfig
    if (method !== 'GET') {
        logger.warn(`api cache does not support ${method}`)
        return axios(httpConfig)
    }

    let key = PREFIX + url
    if (params) {
        key += key.indexOf('?') > -1 ? '&' : '?' + qs.stringify(params)
    }

    const result = storageLocal.getItem(key)

    if (result && result.value && result.expires) {
        const now = Date.now()
        // 过期策略
        // 超过过期时间, 或者重新发版
        if (now > result.expires) {
            return update(httpConfig, key)
        } else {
            return Promise.resolve(result.value)
        }
    } else {
        return update(httpConfig, key)
    }
}

/**
 * 正常请求api接口
 */
function update(httpConfig, key) {
    return axios(httpConfig)
        .then(res => {
            storageLocal.setItem(key, {
                expires: Date.now() + EXPIRES,
                value: res
            })

            return res
        }, error => {
            storageLocal.removeItem(key)
            return Promise.reject(error)
        })
}

/**
 * 初始化时，清理过期的api接口，避免占用的空间越来越大
 */
function apiClearExpired() {
    for (const key in window.localStorage) {
        if (Object.prototype.hasOwnProperty.call(window.localStorage, key)) {
            if (key.indexOf(PREFIX) === 0) {
                const obj = storageLocal.getItem(key)
                if (Date.now() > obj.expires) {
                    storageLocal.removeItem(key)
                }
            }
        }
    }
}

export default {
    apiCache,
    apiClearExpired
}

export {
    apiCache,
    apiClearExpired
}
