import logger from '../../utils/logger'

function install(Vue) {
    Vue.logger = Vue.prototype.logger = logger
}

Vue.use(install)

export default install
