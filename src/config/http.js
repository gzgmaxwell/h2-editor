import qs from 'qs'
import util from '../utils/util'

const type = 'application/x-www-form-urlencoded'
axios.defaults.headers['Content-Type'] = type
axios.defaults.withCredentials = true

// 在发送请求之前做某件事
axios.interceptors.request.use(config => {
    // 不需要拦截器统一处理
    if (config.ignoreInterceptor) {
        return config
    }

    if (config.method === 'post' && config.headers['Content-Type'] === type && !util.isString(config.data)) {
        // 默认是{arrayFormat: 'indices'}，jquery默认是brackets，ng默认是repeat
        // 参考https://www.npmjs.com/package/qs
        config.data = qs.stringify(config.data)
    }
    return config
}, err => {
    return Promise.reject(err)
})

// 在发送响应之前做某件事
axios.interceptors.response.use(res => {
    // 不需要拦截器统一处理
    if (res.config.ignoreInterceptor) {
        return res
    }

    // 如果是字符串则不处理data，比如取svg内容时
    if (util.isString(res.data)) {
        return res
    }

    if (!res.data) {
        res.data = {}
    }

    const data = res.data

    if ('list' in data) {
        data.list = data.list || []
    }

    // true正常返回，根据code单独处理
    if (data.success) {
        return res
    }

    // 1001 未登录，刷新的时候会进来
    if (data.code === 1001) {
        return showLogin(res)
    } else {
        Vue.notifier.fail(data.msg || '未提供错误信息')
        return Promise.reject(res)
    }
}, err => {
    // 网络请求失败
    if (!err.response) {
        Vue.notifier.fail('网络请求失败，请稍后重试')
        return Promise.reject(err)
    }

    const status = err.response.status

    // 1002 登录超时，操作的时候会进来
    if (status === 401) {
        return showLogin(err.response)
    } else if (status === 403) {
        Vue.notifier.fail('暂无权限查看此内容')
    } else if (status === 404) {
        Vue.notifier.fail('接口未找到')
    }

    return Promise.reject(err)
})

let promiseLogin = null

function showLogin(res) {
    if (!promiseLogin) {
        promiseLogin = Vue.dialog.openLogin()
            .then(() => {
                promiseLogin = null
                return axios(res.config) // 登录之后重新发起之前的请求
            })
            .catch(err => {
                promiseLogin = null
                return Promise.reject(err)
            })
    }
    return promiseLogin
}
