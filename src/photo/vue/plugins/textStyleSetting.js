import TextStyleSettingPanel from './TextStyleSettingPanel.vue'

/**
 * close
 */
function close() {
    document.body.querySelectorAll('.eqc-photo-text-style-setting-panel').forEach(dom => dom.remove())
}

/**
 * 通用打开窗口
 * @param {Object} options
 */
function open(options) {
    const UiTextStyleSettingPanel = Vue.extend(TextStyleSettingPanel)
    const vm = new UiTextStyleSettingPanel({
        propsData: options.propsData
    }).$mount()

    const editorDom = document.querySelector('.eqc-photo-editor')
    editorDom.insertBefore(vm.$el, editorDom.children[0])
}

function install(Vue) {
    Vue.textStyleSetting = Vue.prototype.textStyleSetting = {
        close,
        open
    }
}

Vue.use(install)

export default install
