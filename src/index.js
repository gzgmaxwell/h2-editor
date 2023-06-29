import './scss/reset.scss'
import './scss/common.scss'
import './scss/animation.scss'

import './utils'
import './config/http'
import router from './config/router'
import store from './vue/store'
import App from './vue/App.vue'
import './vue/plugins'
import './photo/vue/plugins'
import './vue/directives'
import './photo/vue/directives'
import './vue/filters'
import './vue/comps'

import * as Sentry from '@sentry/browser'
import * as Integrations from '@sentry/integrations'

if (['pre', 'pro'].includes(Vue.env.name)) {
    Sentry.init({
        dsn: 'https://d44e2872b8864557802ff6fd56fca94f@sentry-api.eqxiu.com/31',
        whitelistUrls: [Vue.env.host.cdn],
        integrations: [new Integrations.Vue({ Vue, attachProps: true })],
        release: `h2-editor@${Vue.env.name}${Vue.env.version}`
    })
}

const vm = new Vue({
    router,
    store,
    el: '#app',
    render: h => h(App)
})

Vue.use({ vm })
