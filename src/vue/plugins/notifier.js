import Notifier from './Notifier.vue'

function install(Vue) {
    Vue.notifier = Vue.prototype.notifier = {
        success,
        fail,
        info,
        warn
    }
}

function open(type, msg, time) {
    const UiNotifier = Vue.extend(Notifier)
    const vm = new UiNotifier({
        propsData: { type, msg, time }
    }).$mount()
    document.body.appendChild(vm.$el)
}

function success(msg, time) {
    open('success', msg, time)
}

function fail(msg, time) {
    open('fail', msg, time)
}

function info(msg, time) {
    open('info', msg, time)
}

function warn(msg, time) {
    open('warn', msg, time)
}

Vue.use(install)

export default install
