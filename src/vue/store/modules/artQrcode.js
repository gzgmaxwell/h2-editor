import types from '../mutationTypes'
import qrcodeType from '../../../config/enum.qrcode.type'

const state = {
    // 艺术二维码左侧菜单
    qrcodeNav: {
        list: [{
            name: '上传',
            type: 'upload',
            icon: 'eqf-cloudupload-f',
            qrcodeType: qrcodeType.text,
            qrcodeText: null, // 二维码文本内容
            qrcodeKey: null, // 二维码key
            qrcodeTemplate: null, // 二维码模板 如果不为null则为艺术二维码，反之为普通二维码
            qrcodeSceneJson: null // 二维码保存作品的场景json
        }, {
            name: '链接',
            type: 'link',
            icon: 'eqf-linkline',
            qrcodeType: qrcodeType.link,
            qrcodeText: null,
            qrcodeKey: null,
            qrcodeTemplate: null,
            qrcodeSceneJson: null
        }, {
            name: '文本',
            type: 'text',
            icon: 'eqf-fontmall',
            qrcodeType: qrcodeType.text,
            qrcodeText: null,
            qrcodeKey: null,
            qrcodeTemplate: null,
            qrcodeSceneJson: null
        }, {
            name: '微信公众号',
            type: 'wechat',
            icon: 'eqf-wechat',
            qrcodeType: qrcodeType.wechat,
            qrcodeText: null,
            qrcodeKey: null,
            qrcodeTemplate: null,
            qrcodeSceneJson: null
        }, {
            name: '名片',
            type: 'card',
            icon: 'eqf-idcrad-f',
            qrcodeType: qrcodeType.card,
            qrcodeText: null,
            qrcodeKey: null,
            qrcodeTemplate: null,
            qrcodeSceneJson: null
        }, {
            name: '作品',
            type: 'work',
            icon: 'eqf-box-f',
            qrcodeType: qrcodeType.work,
            qrcodeText: null,
            qrcodeKey: null,
            qrcodeTemplate: null,
            qrcodeSceneJson: null
        }, {
            name: '地图',
            type: 'map',
            icon: 'eqf-earth',
            qrcodeType: qrcodeType.map,
            qrcodeText: null,
            qrcodeKey: null,
            qrcodeTemplate: null,
            qrcodeSceneJson: null
        }],
        // 当前选择的二维码分类
        selectedItem: {},
        itemClickEvent: {}
    },
    // 当前选择的模板类型
    selectedTemplateType: '',
    // 艺术二维码模板列表过滤条件
    qrcodeTemplateListFilter: null,
    // 二维码模板
    qrcodeTemplateUse: null,
    // 上传结果（手机和键盘）
    uploadByPhoneAndKeyboard: {
        success: false,
        type: '',
        key: '',
        random: 0
    }
}

const mutations = {
    // 保存当前用户选择的艺术二维码模板类型  普通||动态||立体
    [types.QRCODE_SELECTED_TEMPLATE_TYPE](state, type) {
        state.selectedTemplateType = type
    },
    // 保存当前用户选择二维码分类
    [types.QRCODE_NAV](state, { item }) {
        state.qrcodeNav.itemClickEvent = {
            type: state.qrcodeNav.selectedItem.type === item.type ? 'noSwitch' : 'switch',
            timeStamp: new Date().getTime()
        }
        state.qrcodeNav.selectedItem = state.qrcodeNav.list.filter(item2 => { return item2.name === item.name })[0]
    },
    // 保存当前艺术二维码模板过滤器
    [types.QRCODE_TEMPLATE_LIST_FILTER](state, { filter }) {
        state.qrcodeTemplateListFilter = filter
    },
    // 保存当前用户选择的艺术二维码模板
    [types.QRCODE_TEMPLATE_USE](state, { elementJson, template, templateType, pageJson }) {
        state.qrcodeTemplateUse = {
            pageJson,
            elementJson,
            template,
            templateType,
            timeStamp: new Date().getTime()
        }
        state.qrcodeNav.list.forEach(item => {
            if (item.name === state.qrcodeNav.selectedItem.name) {
                item.qrcodeTemplate = state.qrcodeTemplateUse
                state.qrcodeNav.selectedItem = item
            }
        })
    },
    // 清除当前用户选择的艺术二维码模板
    [types.QRCODE_TEMPLATE_USE_CLEAR](state) {
        state.qrcodeTemplateUse = null
    },
    // 保存当前二维码分类key
    [types.QRCODE_KEY](state, { qrcodeKey, qrcodeText, qrcodeUserInput, qrcodeTemplateType }) {
        state.qrcodeNav.list.forEach(item => {
            if (item.name === state.qrcodeNav.selectedItem.name) {
                item.qrcodeKey = qrcodeKey
                item.qrcodeText = qrcodeText
                // 微信公众号使用
                if (qrcodeUserInput && qrcodeUserInput !== null && qrcodeUserInput !== '') {
                    item.qrcodeUserInput = qrcodeUserInput
                }
                item.qrcodeTemplateType = qrcodeTemplateType
                state.qrcodeNav.selectedItem = item
            }
        })
    },
    // 清除当前二维码分类key
    [types.QRCODE_KEY_CLEAR](state) {
        state.qrcodeNav.list.forEach(item => {
            if (item.name === state.qrcodeNav.selectedItem.name) {
                item.qrcodeKey = null
                item.qrcodeText = null
                item.qrcodeTemplate = null
                item.qrcodeSceneJson = null
                state.qrcodeNav.selectedItem = item
            }
        })
    },
    // 保存当前二维码分类sceneJson
    [types.QRCODE_SCENE_JSON](state, pQrcodeSceneJson) {
        state.qrcodeNav.list.forEach(item => {
            if (item.name === state.qrcodeNav.selectedItem.name) {
                item.qrcodeSceneJson = pQrcodeSceneJson
                state.qrcodeNav.selectedItem = item
            }
        })
    },
    [types.QRCODE_UPLOAD_BY_PHONE_AND_KEYBOARD](state, { success, type, key }) {
        state.uploadByPhoneAndKeyboard.success = success
        state.uploadByPhoneAndKeyboard.type = type
        state.uploadByPhoneAndKeyboard.key = key
    },
    [types.QRCODE_UPLOAD_RELOAD](state) {
        state.uploadByPhoneAndKeyboard.random = Math.random()
    }
}

export default {
    state,
    mutations
}
