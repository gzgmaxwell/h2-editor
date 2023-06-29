import logger from '../../utils/logger'
import storageSession from '../../utils/storageSession'
import authority from '../../config/authority'

/**
 * 进入页面时，验证用户是否登录
 */
function auth() {
    return new Promise((resolve, reject) => {
        Vue.api.user.getUserInfo()
            .then(res => {
                storageSession.removeItem(storageSession.key.visit)
                Vue.store.commit('USER_SET', { userInfo: res.data.obj })
                resolve(res.data)
            })
            .catch(err => {
                err && logger.error(err)
                reject()
            })
    })
}

/**
 * 根据用户类型判断用户是否有访问某个功能的权限
 * @param {*} key
 */
function allow(key) {
    const user = Vue.store.state.user.userInfo
    const type = user.type
    return authority.type[key].includes(type)
}

/**
 * 根据用户角色判断用户是否有访问某个功能的权限
 * @param {*} key
 */
function allowByRole(key) {
    const user = Vue.store.state.user.userInfo
    return user.roleIdList.includes(authority.role[key])
}

function install() {
    Vue.user = Vue.prototype.user = {
        auth,
        allow,
        allowByRole
    }
}

Vue.use(install)

export default install
