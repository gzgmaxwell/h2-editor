import types from '../mutationTypes'

const state = {
    // 字云工具左侧菜单
    nav: {
        list: [{
            name: '素材',
            type: 'image',
            icon: 'eqf-image-f'
        }, {
            name: '上传',
            type: 'upload',
            icon: 'eqf-cloudupload-f'
        }],
        // 当前选择的菜单
        selectedItem: {},
        itemClickEvent: {}
    },
    navPanel: {
        show: true
    },
    instance: null // 字云类实例
}

const mutations = {
    // 保存当前用户选择分类
    [types.TCLOUD_NAV](state, { item }) {
        state.nav.itemClickEvent = {
            type: state.nav.selectedItem.type === item.type ? 'noSwitch' : 'switch',
            timeStamp: new Date().getTime()
        }
        state.nav.selectedItem = item
    },
    // 是否显示仪表盘
    [types.TCLOUD_NAV_PANEL](state, { show }) {
        state.navPanel.show = show
    },
    [types.TCLOUD_INIT](state, { instance }) {
        state.instance = instance
    }
}

export default {
    state,
    mutations
}
