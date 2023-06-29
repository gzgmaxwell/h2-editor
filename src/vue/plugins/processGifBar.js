import ProcessGifBar from './ProcessGifBar.vue'

function install(Vue) {
    Vue.processGifBar = Vue.prototype.processGifBar = {
        open,
        close
    }
}

let vm = null
function open(data) {
    const UiProcessBar = Vue.extend(ProcessGifBar)
    vm = new UiProcessBar({
        propsData: { text: data }
    }).$mount()
    vm.running()
    document.body.appendChild(vm.$el)
}

function close() {
    vm.close()
    // 延迟一下等动画结束 再删除
    setTimeout(() => {
        document.body.querySelectorAll('.process-gif-bar').forEach(dom => dom.remove())
    }, 600)
}

Vue.use(install)

export default install
