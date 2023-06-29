import ArrowNotifier from './ArrowNotifier.vue'
import storageLocal from '../../utils/storageLocal'

function install(Vue) {
    Vue.arrowNotifier = Vue.prototype.arrowNotifier = {
        open,
        close
    }
}

function open(option) {
    const type = option.type
    if (check(type)) {
        const UiNotifier = Vue.extend(ArrowNotifier)
        const vm = new UiNotifier({
            propsData: { option }
        }).$mount()
        document.body.appendChild(vm.$el)
    }
}
function close() {
    document.body.querySelectorAll('.eqc-arrow-notifier').forEach(dom => dom.remove())
}
// 该提示框 一天提醒一次 每个用户提醒一次
function check(type) {
    const key = storageLocal.key.arrowNotifier
    const res = storageLocal.getItem(key)
    if (res && JSON.parse(res)[type]) {
        // let currentTime = new Date().getTime()
        // let obj = JSON.parse(res)
        // let lastTime = obj[type]
        // let oneDay = 1000 * 60 * 60 * 24
        // if (currentTime - lastTime < oneDay) {
        //     return false
        // } else {
        //     obj[type] = new Date().getTime()
        //     storageLocal.setItem(key, JSON.stringify(obj))
        // }
        return false
    } else {
        let obj = {}
        if (res) {
            obj = JSON.parse(res)
        }
        obj[type] = new Date().getTime()
        storageLocal.setItem(key, JSON.stringify(obj))
    }
    return true
}
Vue.use(install)

export default install
