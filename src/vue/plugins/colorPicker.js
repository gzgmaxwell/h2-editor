import ColorPicker from './ColorPicker.vue'

let vm = null

function install(Vue) {
    Vue.colorPicker = Vue.prototype.colorPicker = {
        open,
        close,
        getState
    }
}

function open(model, modelKey, css, suckerEnable = true) {
    if (vm) {
        close()
    }
    const UiColorPicker = Vue.extend(ColorPicker)
    vm = new UiColorPicker({
        propsData: { model, modelKey, css, suckerEnable }
    }).$mount()
    document.body.appendChild(vm.$el)
}

function close() {
    if (vm) {
        document.body.removeChild(vm.$el)
        vm.$destroy()
        vm = null
    }
}

function getState() {
    return {
        isOpenSucker: (vm || {}).isOpenSucker
    }
}

Vue.use(install)

export default install
