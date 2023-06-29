import types from '../mutationTypes'

const state = {
    nav: {
        list: [{
            name: '模板',
            type: 'template',
            icon: 'eqf-template-f'
        }, {
            name: '文字',
            type: 'text',
            icon: 'eqf-t-new'
        }, {
            name: '素材',
            type: 'image',
            icon: 'eqf-image-f'
        }, {
            name: '背景',
            type: 'background',
            icon: 'eqf-background-l'
        },
        {
            name: '工具箱',
            type: 'tool',
            icon: 'eqf-widgets-f'
        }, {
            name: '上传',
            type: 'upload',
            icon: 'eqf-cloudupload-f'
        }],
        selectedItem: {},
        itemClickEvent: {}
    },
    navPanel: {
        show: true
    },
    material: {
        selectedItemType: 'image'
    },
    preview: {
        show: false,
        width: 0,
        height: 0,
        timeoutId: 0, // 预览时使用的计时器
        pageInfo: null // 在hover时保存页面信息
    },
    editorSize: {
        show: false
    },
    uploadReload: {
        random: 0
    },
    uploadQrcode: {
        show: false
    },
    uploadManage: {
        show: false
    },
    layer: {
        show: false
    },
    contextMenu: {
        pageX: 0,
        pageY: 0
    },
    logo: {
        show: false
    },
    workSpaceScroll: {
        x: 0,
        y: 0
    },
    expressHeadMenu: {
        showImgMenu: false,
        showGifMenu: false
    },
    // 从工具箱打开艺术二维码/抠图/美化时设为false
    mainEditorView: {
        show: true // 当前是否是主编辑区视图
    },
    materialConfig: {
        show: false, // 是否展示权限panel
        previewAuthor: true // 放大预览权限
    },
    materialItem: {
        show: false, // 是否预览素材
        item: null, // 预览的item数据
        height: 0 // 预览的定位高度
    },
    materialMoreConfig: {
        show: false,
        price: 'all',
        sort: 'latest'
    },
    refreshCollectListState: '', // 是不是立即刷新收藏列表
    // 模板颜色面板信息
    templateColorPanel: {
        // 是否预显示
        show: false,
        // 位置信息
        position: {
            top: 60,
            left: 281
        },
        // 选中的颜色索引
        colorSelectedIndex: 0,
        // 选中的颜色
        colorSelectedVal: ''
    },
    // 模板设置信息
    templateConfig: {
        // 是否展示权限panel
        show: false,
        // 放大预览权限
        previewAuthor: true,
        // 推荐权限
        recommendAuthor: true
    },
    // 模板分类信息
    templateCateogry: {
        // 是否展示权限panel
        show: false,
        // 选中的分类项
        selectedCategoryItem: {
            id: null
        }
    },
    // 是不是立即刷新收藏列表
    refreshTemplateCollectListState: ''
}

const mutations = {
    [types.LAYOUT_NAV_LIST](state, { list }) {
        state.nav.list = list
    },
    [types.LAYOUT_NAV](state, { item }) {
        state.nav.itemClickEvent = {
            type: state.nav.selectedItem.type === item.type ? 'noSwitch' : 'switch',
            timeStamp: new Date().getTime()
        }
        state.nav.selectedItem = item
    },
    [types.LAYOUT_NAV_PANEL](state, { show }) {
        state.navPanel.show = show
    },
    [types.LAYOUT_MATERIAL](state, { type }) {
        state.material.selectedItemType = type
    },
    [types.LAYOUT_NAV_UPLOAD_RELOAD](state) {
        state.uploadReload.random = Math.random()
    },
    [types.LAYOUT_NAV_UPLOAD_QRCODE](state, { show }) {
        state.uploadQrcode.show = show
    },
    [types.LAYOUT_NAV_UPLOAD_MANAGE](state, { show }) {
        state.uploadManage.show = show
    },
    [types.LAYOUT_EDITOR_SIZE](state, { show }) {
        state.editorSize.show = show
    },
    [types.LAYOUT_LAYER](state, { show }) {
        state.layer.show = show
    },
    [types.LAYOUT_CONTEXT_MENU](state, { pageX, pageY }) {
        state.contextMenu = {
            pageX,
            pageY
        }
    },
    [types.LAYOUT_LOGO](state, { show }) {
        state.logo.show = show
    },
    [types.LAYOUT_PREVIEW](state, { show, src, width, height, price, pageInfo }) {
        state.preview.show = show
        if (show) {
            state.preview.width = width
            state.preview.height = height
            state.preview.pageInfo = pageInfo
        }
    },
    [types.LAYOUT_WORKSPACESCROLL](state, { x, y }) {
        state.workSpaceScroll.x = x
        state.workSpaceScroll.y = y
    },
    [types.EXPRESS_HEAD_MENU](state, { showImgMenu, showGifMenu }) {
        state.expressHeadMenu = {
            showImgMenu,
            showGifMenu
        }
    },
    [types.MAIN_EDITOR_VIEW](state, { show }) {
        state.mainEditorView.show = show
    },
    [types.MATERIAL_PREVIEW_AUTHOR_CHANGE](state, { previewAuthor, show }) {
        if (previewAuthor !== undefined) {
            state.materialConfig.previewAuthor = previewAuthor
        }
        if (show !== undefined) {
            state.materialConfig.show = show
        }
    },
    [types.MATERIAL_ITEM_PREVIEW](state, { show, item, height }) {
        state.materialItem.show = show
        state.materialItem.item = item
        state.materialItem.height = height
    },
    [types.MATERIAL_MORE_CHANGE](state, { show, price, sort }) {
        state.materialConfig.show = false
        state.materialMoreConfig.show = show
        if (price) {
            state.materialMoreConfig.price = price
        }
        if (sort) {
            state.materialMoreConfig.sort = sort
        }
        if (!show) {
            // 关闭的时候 还原
            state.materialMoreConfig.price = 'all'
            state.materialMoreConfig.sort = 'latest'
        }
    },
    [types.MATERIAL_COLLECT_LIST_CHANGE](state) {
        state.refreshCollectListState = new Date().getTime()
    },
    // 模板颜色面板信息
    [types.TEMPLATE_COLOR_PANEL](state, { show, position }) {
        state.templateColorPanel.show = show
        if (position && position !== null) {
            state.templateColorPanel.position = position
        }
    },
    [types.TEMPLATE_COLOR_PANEL_COLOR_SELECTED](state, { colorSelectedIndex, colorSelectedVal, colorSelectedColor }) {
        state.templateColorPanel.colorSelectedIndex = colorSelectedIndex
        state.templateColorPanel.colorSelectedVal = colorSelectedVal
        state.templateColorPanel.colorSelectedColor = colorSelectedColor
    },
    // 模板设置
    [types.TEMPLATE_CONFIG](state, { show, previewAuthor, recommendAuthor }) {
        if (show !== undefined && show !== null) {
            state.templateConfig.show = show
        }
        if (previewAuthor !== undefined && previewAuthor !== null) {
            state.templateConfig.previewAuthor = previewAuthor
        }
        if (recommendAuthor !== undefined && recommendAuthor !== null) {
            state.templateConfig.recommendAuthor = recommendAuthor
        }
    },
    // 模板分类
    [types.TEMPLATE_CATEGORY](state, { show, selectedCategoryItem }) {
        if (show !== undefined && show !== null) {
            state.templateCateogry.show = show
        }
        if (selectedCategoryItem !== undefined && selectedCategoryItem !== null) {
            state.templateCateogry.selectedCategoryItem = selectedCategoryItem
        }
    },
    // 模板收藏列表改变
    [types.TEMPLATE_COLLECT_LIST_CHANGE](state) {
        state.refreshTemplateCollectListState = new Date().getTime()
    }
}

export default {
    state,
    mutations
}
