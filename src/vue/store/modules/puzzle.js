import types from '../mutationTypes'
import puzzleMode from '../../../config/enum.puzzleMode.type'

const state = {
    // 拼图编辑器左侧菜单
    nav: {
        list: [{
            name: '拼图',
            type: 'group',
            icon: 'eqf-shape-f'
        }, {
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
    mode: puzzleMode.independent
}

const mutations = {
    // 保存当前用户选择分类
    [types.PUZZLE_NAV](state, { item }) {
        state.nav.itemClickEvent = {
            type: state.nav.selectedItem.type === item.type ? 'noSwitch' : 'switch',
            timeStamp: new Date().getTime()
        }
        state.nav.selectedItem = item
    },
    // 是否显示仪表盘
    [types.PUZZLE_NAV_PANEL](state, { show }) {
        state.navPanel.show = show
    },
    [types.PUZZLE_LAYOUT_MODE](state, mode) {
        state.mode = mode
    }
}

export default {
    state,
    mutations
}
