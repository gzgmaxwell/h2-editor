import Loading from './Loading.vue'

function install(Vue) {
    Vue.loading = Vue.prototype.loading = {
        open,
        close
    }
}

function open(tip) {
    const UiLoading = Vue.extend(Loading)
    const vm = new UiLoading({
        propsData: { tip }
    }).$mount()
    document.body.appendChild(vm.$el)
}

function close() {
    document.body.querySelectorAll('.eqc-loading').forEach(dom => dom.remove())
}

Vue.use(install)

export default install
