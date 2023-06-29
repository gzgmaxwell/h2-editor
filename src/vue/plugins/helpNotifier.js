import HelpNotifier from './HelpNotifier.vue'
import storageLocal from '../../utils/storageLocal'

function install(Vue) {
    Vue.helpnotifier = Vue.prototype.helpnotifier = {
        open,
        close
    }
}

/**
 * 检测是否需要显示帮助提示框
 * 规则：每种类型提示框每天指弹1次，
 * 累计3次后不再提示
 */
function check(type) {
    const key = storageLocal.key.helpNotifier
    const res = storageLocal.getItem(key)
    const dateStr = new Date().format('yyyy-MM-dd') + ''
    if (!res) {
        const obj = { [type]: [dateStr] }
        storageLocal.setItem(key, JSON.stringify(obj))
        return true
    } else {
        let notifier = JSON.parse(res)
        if (!notifier[type]) {
            notifier = Object.assign({}, notifier, { [type]: [dateStr] })
            storageLocal.setItem(key, JSON.stringify(notifier))
            return true
        } else {
            if (notifier[type].length < 3) {
                if (notifier[type].indexOf(dateStr) > -1) {
                    return false
                } else {
                    notifier[type].push(dateStr)
                    storageLocal.setItem(key, JSON.stringify(notifier))
                    return true
                }
            } else {
                return false
            }
        }
    }
}

function open(type, tip, positionStyle, boxStyle, hasArrow, arrowStyle) {
    if (check(type)) {
        const UiLoading = Vue.extend(HelpNotifier)
        const vm = new UiLoading({
            propsData: {
                type,
                tip,
                positionStyle,
                boxStyle,
                hasArrow,
                arrowStyle
            }
        }).$mount()
        document.body.appendChild(vm.$el)
    }
}

function close() {
    document.body.querySelectorAll('.eqc-help-notifier').forEach(dom => dom.remove())
}

Vue.use(install)

export default install
