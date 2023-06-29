import App from './preview.vue'
import '../vue/filters'
import upload from './directive/upload'
import BaseButton from '../vue/comps/BaseButton.vue'
import BaseCheckbox from '../vue/comps/BaseCheckbox.vue'
import api from './api/api.js'
import file from '../../src/api/file'
import page from '../../src/api/page'
import '../utils'
import '../vue/plugins/notifier'
import '../vue/plugins/dialog'
import '../vue/plugins/user'
import '../scss/animation.scss'
import store from '../vue/store'
const env = require('env')
const plugin = require('../../env/pro.js').plugin
const type = 'application/x-www-form-urlencoded'
axios.defaults.headers['Content-Type'] = type
axios.defaults.headers['Access-Control-Allow-Origin'] = '*'

axios.defaults.withCredentials = true
Vue.component('BaseButton', BaseButton)
Vue.component('BaseCheckbox', BaseCheckbox)
Vue.directive('upload', upload)
Vue.env = env
Vue.plugin = plugin
Vue.api = api
Vue.api.file = file
Vue.api.page = page
const vm = new Vue({
    store,
    el: '#app',
    render: h => h(App)
})
Vue.use({ vm })
