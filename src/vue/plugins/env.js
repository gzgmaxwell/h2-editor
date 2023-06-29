import env from '../../config/env'

function install(Vue) {
    Vue.env = Vue.prototype.env = env
}

Vue.use(install)

export default install
