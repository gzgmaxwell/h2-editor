import ScrollBar from '@eqxiu/eqx.scrollBar/dist/index'
import util from '../../utils/util'

export default {
    bind(el, binding) {
        binding.value = binding.value || {}

        el.style.overflow = 'hidden'

        const options = {}

        if (util.isFunction(binding.value.onScrollMove)) {
            options.onScrollMove = binding.value.onScrollMove
        }
        if (util.isFunction(binding.value.onScrollEnd)) {
            options.onScrollEnd = binding.value.onScrollEnd
        }

        el.myScroll = new ScrollBar(el, options)

        Vue.nextTick(() => el.myScroll.refresh())
    },
    componentUpdated(el) {
        Vue.nextTick(() => el.myScroll.refresh())
    },
    unbind(el) {
        el.myScroll.destroy()
        el.myScroll = null
        delete el.myScroll
    }
}
