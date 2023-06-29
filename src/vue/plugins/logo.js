import Logo from './Logo.vue'

function install(Vue) {
    Vue.logo = Vue.prototype.logo = {
        open,
        close
    }
}
function open() {
    const UiLoading = Vue.extend(Logo)
    const vm = new UiLoading({
        propsData: {
        }
    }).$mount()
    document.body.appendChild(vm.$el)
}

function close() {
    document.body.querySelectorAll('.eqc-logo').forEach(dom => dom.remove())
}

Vue.use(install)

export default install
