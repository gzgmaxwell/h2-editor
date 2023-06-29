import types from '../mutationTypes'

const state = {
    nav: {
        list: [{
            name: '基础',
            type: 'base',
            icon: 'eqf-tune'
        }, {
            name: '裁剪',
            type: 'crop',
            icon: 'eqf-cutpic'
        }, {
            name: '旋转',
            type: 'rotate',
            icon: 'eqf-rotate-cw'
        }, {
            name: '滤镜',
            type: 'filter',
            icon: 'eqf-magic'
        }, {
            name: '贴纸',
            type: 'paster',
            icon: 'eqf-image-l'
        }, {
            name: '文字',
            type: 'text',
            icon: 'eqf-t'
        }],
        selectedItem: {},
        itemClickEvent: {}
    },
    navPanel: {
        show: true
    },
    toobarOriginal: {
        show: false
    },
    toolCropChangeEvent: {
        action: null,
        params: null
    },
    sideBar: {
        show: true
    }
}

const mutations = {
    [types.PHOTO_NAV_LIST](state, { list }) {
        state.nav.list = list
    },
    [types.PHOTO_NAV](state, { item }) {
        state.nav.itemClickEvent = {
            type: state.nav.selectedItem.type === item.type ? 'noSwitch' : 'switch',
            timeStamp: new Date().getTime()
        }
        state.nav.selectedItem = item
    },
    [types.PHOTO_NAV_PANEL](state, { show }) {
        state.navPanel.show = show
    },
    [types.PHOTO_TOOBAR_ORIGINAL](state, { show }) {
        state.toobarOriginal.show = show
    },
    [types.PHOTO_TOOL_CROP_CHANGE_EVENT](state, { action, params }) {
        state.toolCropChangeEvent.action = action
        state.toolCropChangeEvent.params = params
    },
    [types.PHOTO_SIDE_BAR](state, { show }) {
        state.sideBar.show = show
    }
}

export default {
    state,
    mutations
}
