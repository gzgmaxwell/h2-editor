import layout from './modules/layout'
import guideLine from './modules/guideLine'
import scene from './modules/scene'
import product from './modules/product'
import user from './modules/user'
import fontStyle from './modules/fontStyle'
import sign from './modules/sign'
import artQrcode from './modules/artQrcode'
import aiMatting from './modules/aiMatting'
import tcloud from './modules/tcloud'
import puzzle from './modules/puzzle'

import photoLayout from '../../photo/vue/store/modules/photoLayout'
import photoScene from '../../photo/vue/store/modules/photoScene'
import photoBase from '../../photo/vue/store/modules/photoBase'
import photoRotate from '../../photo/vue/store/modules/photoRotate'
import photoFilter from '../../photo/vue/store/modules/photoFilter'
import photoElements from '../../photo/vue/store/modules/photoElements'
import photoCrop from '../../photo/vue/store/modules/photoCrop'
import photoHistory from '../../photo/vue/store/modules/photoHistory'

// 将store挂在Vue上，方便在非Vue实例上调用
Vue.store = new Vuex.Store({
    modules: {
        layout,
        guideLine,
        scene,
        product,
        user,
        fontStyle,
        sign,
        artQrcode,
        aiMatting,
        tcloud,
        puzzle,

        photoLayout,
        photoScene,
        photoBase,
        photoRotate,
        photoFilter,
        photoElements,
        photoCrop,
        photoHistory
    }
})

export default Vue.store
