import Dialog from './Slide.vue'

/**
 * 显示dialog
 */
function show() {
    const $create = document.body.children[0]
    $create.insertBefore($create.children[1], $create.children[0])
    $create.css({
        transition: 'all 0.3s',
        transform: 'translateY(100%)'
    })
}

/**
 * 删除所有的dialog，在切换路由时用到
 */
function close() {
    document.body.children[0].css({
        transition: '',
        transform: ''
    })
    document.body.querySelectorAll('.eqc-slide-base').forEach(dom => dom.remove())
}

/**
 * 通用打开窗口
 * @param {Object} options
 */
function open(options) {
    const defaultOptions = {
        component: null,
        data: null,
        params: {}
    }
    options = Object.assign(defaultOptions, options)

    return new Promise((resolve, reject) => {
        const UiDialog = Vue.extend(Dialog)
        const vm = new UiDialog({
            components: {
                cDialog: options.component
            },
            propsData: { data: options.data, params: options.params },
            destroyed() {
                this.value ? resolve(JSON.parse(JSON.stringify(this.value))) : reject()
            }
        }).$mount()
        let $create = null
        // 遍历并验证得到正确的dom节点
        for (let i = 0; i < document.body.children.length; i++) {
            const item = document.body.children[i]
            if (item.nodeName && item.className && item.nodeName === 'DIV' && item.className === 'eqc-app') {
                $create = item
                break
            }
        }
        $create.insertBefore(vm.$el, $create.children[0])
        $create.css({
            transition: 'all 0.3s',
            transform: 'translateY(100%)'
        })
    })
}

function install(Vue) {
    Vue.slide = Vue.prototype.slide = {
        show,
        close,
        open
    }
}

Vue.use(install)

export default install
