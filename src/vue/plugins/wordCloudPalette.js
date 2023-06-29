import WordCloudPalette from './WordCloudPalette.vue'

function install(Vue) {
    Vue.wordcloudpalette = Vue.prototype.wordcloudpalette = {
        open,
        close
    }
}

function open() {
    const UiLoading = Vue.extend(WordCloudPalette)
    const vm = new UiLoading({
        propsData: {
        }
    }).$mount()
    document.body.appendChild(vm.$el)
}

function close() {
    document.body.querySelectorAll('.eqc-wordcloud-palette').forEach(dom => dom.remove())
}

Vue.use(install)

export default install
