import enumer from '../../config/enum'

function install(Vue) {
    Vue.enum = Vue.prototype.enum = enumer
}

Vue.use(install)

export default install
