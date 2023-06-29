import types from '../mutationTypes'
import styleImg0 from '../../../img/textThreeDStyle/style0.png'// 自定义.png
import styleImg1 from '../../../img/textThreeDStyle/style1.png'// 火热.png
import styleImg2 from '../../../img/textThreeDStyle/style2.png'// 冰冻.png
import styleImg3 from '../../../img/textThreeDStyle/style3.png'// 生机.png
import styleImg4 from '../../../img/textThreeDStyle/style4.png'// 辉煌.png
import styleImg5 from '../../../img/textThreeDStyle/style5.png'// 热闹.png
import styleImg6 from '../../../img/textThreeDStyle/style6.png'// 清新.png
import styleImg7 from '../../../img/textThreeDStyle/style7.png'// 回忆.png
import styleImg8 from '../../../img/textThreeDStyle/style8.png'// 时尚.png
import styleImg9 from '../../../img/textThreeDStyle/style9.png'// 提示.png
import styleImg10 from '../../../img/textThreeDStyle/style10.png'// 英伦.png
import styleImg11 from '../../../img/textThreeDStyle/style11.png'// 专业.png

import texture1 from '../../../img/textThreeDStyle/textTexture/1.png'// 贴图1
import texture2 from '../../../img/textThreeDStyle/textTexture/2.png'// 贴图2
import texture3 from '../../../img/textThreeDStyle/textTexture/3.png'// 贴图3
import texture4 from '../../../img/textThreeDStyle/textTexture/4.png'// 贴图4
import texture5 from '../../../img/textThreeDStyle/textTexture/5.png'// 贴图5
import texture6 from '../../../img/textThreeDStyle/textTexture/6.png'// 贴图6
import texture7 from '../../../img/textThreeDStyle/textTexture/7.png'// 贴图7
import texture8 from '../../../img/textThreeDStyle/textTexture/8.png'// 贴图8
import texture9 from '../../../img/textThreeDStyle/textTexture/9.png'// 贴图9

const state = {
    list: [],
    selectedItem: {},
    layer: {
        // 文字组件 样式面板
        show: false
    },
    text: {
        // 文字组件 字体面板
        show: false
    },
    // 3D文字组件 字体面板
    textThreeDTextFont: {
        show: false
    },
    // 3D文字贴图
    textThreeDTextTexture: {
        show: false,
        styleList: [
            {
                flag: '',
                name: '1',
                cover: texture1,
                textShadowColor: '#092546'
            },
            { flag: '', name: '2', cover: texture2, textShadowColor: '#503815' },
            { flag: '', name: '3', cover: texture3, textShadowColor: '#10275A' },
            { flag: '', name: '4', cover: texture4, textShadowColor: '#6E3E14' },
            { flag: '', name: '5', cover: texture5, textShadowColor: '#414141' },
            { flag: '', name: '6', cover: texture6, textShadowColor: '#3C331E' },
            { flag: '', name: '7', cover: texture7, textShadowColor: '#606060' },
            { flag: '', name: '8', cover: texture8, textShadowColor: '#2E2E25' },
            { flag: '', name: '9', cover: texture9, textShadowColor: '#391A14' }
        ]
    },
    // 3D文字特效选择框
    textThreeDStyle: {
        show: false,
        styleList: [{
            flag: '',
            name: '自定义',
            cover: styleImg0,
            style: {
                // 文字颜色
                textColor: '#ffffff',
                // 文字投影颜色
                textShadowColor: '#000000',
                // 挤出文本的厚度。默认值为50。
                textHeight: 40,
                // 斜角与原始文本轮廓之间的延伸距离。默认值为8。
                bevelSize: 0,
                // 斜角偏移量
                bevelOffset: 0
            }
        }, {
            flag: '',
            name: '火热',
            cover: styleImg1,
            style: { textColor: '#FF0005', textShadowColor: '#850003', textHeight: 40, bevelSize: 0, bevelOffset: 0 }
        }, {
            flag: '',
            name: '冰冻',
            cover: styleImg2,
            style: { textColor: '#00E2FF', textShadowColor: '#0075FF', textHeight: 40, bevelSize: 0, bevelOffset: 0 }
        }, {
            flag: '',
            name: '生机',
            cover: styleImg3,
            style: { textColor: '#00FF13', textShadowColor: '#00A93A', textHeight: 40, bevelSize: 0, bevelOffset: 0 }
        }, {
            flag: '',
            name: '辉煌',
            cover: styleImg4,
            style: { textColor: '#FFF100', textShadowColor: '#F5A700', textHeight: 40, bevelSize: 0, bevelOffset: 0 }
        }, {
            flag: '',
            name: '热闹',
            cover: styleImg5,
            style: { textColor: '#FFF100', textShadowColor: '#FF0600', textHeight: 40, bevelSize: 0, bevelOffset: 0 }
        }, {
            flag: '',
            name: '清新',
            cover: styleImg6,
            style: { textColor: '#A8FFFF', textShadowColor: '#72C6DF', textHeight: 40, bevelSize: 0, bevelOffset: 0 }
        }, {
            flag: '',
            name: '回忆',
            cover: styleImg7,
            style: { textColor: '#FFACD7', textShadowColor: '#F35268', textHeight: 40, bevelSize: 0, bevelOffset: 0 }
        }, {
            flag: '',
            name: '时尚',
            cover: styleImg8,
            style: { textColor: '#F900FF', textShadowColor: '#001FCF', textHeight: 40, bevelSize: 0, bevelOffset: 0 }
        }, {
            flag: '',
            name: '提示',
            cover: styleImg9,
            style: { textColor: '#EEFF00', textShadowColor: '#04000D', textHeight: 40, bevelSize: 0, bevelOffset: 0 }
        }, {
            flag: '',
            name: '英伦',
            cover: styleImg10,
            style: { textColor: '#EA3A3E', textShadowColor: '#2E3A62', textHeight: 40, bevelSize: 0, bevelOffset: 0 }
        }, {
            flag: '',
            name: '专业',
            cover: styleImg11,
            style: { textColor: '#BDC9FF', textShadowColor: '#003AFF', textHeight: 40, bevelSize: 0, bevelOffset: 0 }
        }]
    },
    isLoad: true
}

const mutations = {
    [types.FONT_STYLE_INIT](state, list) {
        state.list = list
    },
    [types.FONT_STYLE_SELECTED](state, item) {
        state.selectedItem = item
    },
    [types.FONT_STYLE_LAYER](state, { show }) {
        state.layer.show = show
        if (show && state.text.show) {
            // 字体面板若打开则关闭，不同时打开样式和字体面板
            state.text.show = false
            state.textThreeDTextFont.show = false
        }
    },
    [types.FONT_STYLE_ISLOAD](state, { isLoad }) {
        state.isLoad = isLoad
    },
    [types.FONT_TEXT_LAYER](state, { show }) {
        state.text.show = show
    },
    // 设置3D文字特效选择框显示与否
    [types.TEXT_THREED_STYLE_LAYER](state, { show }) {
        state.textThreeDStyle.show = show
        if (show) {
            if (state.layer.show) {
                // 样式面板若打开则关闭，不同时打开样式和字体面板
                state.layer.show = false
            }
            if (state.textThreeDTextFont.show) {
                state.textThreeDTextFont.show = false
            }
            if (state.textThreeDTextTexture.show) {
                state.textThreeDTextTexture.show = false
            }
        }
    },
    // 设置3D文字字体选择面板显示与否
    [types.TEXT_THREED_FONT_LAYER](state, { show }) {
        state.textThreeDTextFont.show = show
        if (show) {
            if (state.layer.show) {
                // 样式面板若打开则关闭，不同时打开样式和字体面板
                state.layer.show = false
            }
            if (state.textThreeDStyle.show) {
                state.textThreeDStyle.show = false
            }
            if (state.textThreeDTextTexture.show) {
                state.textThreeDTextTexture.show = false
            }
        }
    },
    // 设置3D文字贴图选择框显示与否
    [types.TEXT_THREED_TEXTURE_LAYER](state, { show }) {
        state.textThreeDTextTexture.show = show
        if (show) {
            if (state.layer.show) {
                // 样式面板若打开则关闭，不同时打开样式和字体面板
                state.layer.show = false
            }
            if (state.textThreeDStyle.show) {
                state.textThreeDStyle.show = false
            }
            if (state.textThreeDTextFont.show) {
                state.textThreeDTextFont.show = false
            }
        }
    }
}

export default {
    state,
    mutations
}
