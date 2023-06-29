import scene from '../../api/scene'
import page from '../../api/page'
import product from '../../api/product'
import file from '../../api/file'
import tag from '../../api/tag'
import user from '../../api/user'
import banner from '../../api/banner'
import matting from '../../api/matting'
import sign from '../../api/sign'

function install(Vue) {
    Vue.api = Vue.prototype.api = {
        scene,
        page,
        product,
        file,
        tag,
        user,
        banner,
        matting,
        sign
    }
}

Vue.use(install)

export default install
