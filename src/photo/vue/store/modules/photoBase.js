import types from '../mutationTypes'

const state = {
    type: 'base',
    currentChangeStyle: '',
    currentImgObj: {
        size: {},
        src: null,
        timestamp: null
    },
    // currentImgSrc: '', // 当前场景的原图 便于回退的时候使用
    // currentImgSize: null, // 当前图片的宽高
    singleStyleChangeCount: 0, // 每动一次 count+1 确保页面渲染
    clearCount: 0, // 每次变化 都把texture 纹理清空  让其重新生成
    isBackToOriginState: null,
    dragState: false, // true 正在拖动 false 没有拖动了
    isHistory: false, // true 当前片段是history 回退的 false 则不是
    base: {
        contrast: { val: 0, color: null }, // 对比度
        brightness: { val: 0, color: null }, // 亮度
        unsharpMask: { val: 0, color: null }, // 锐度/清晰度
        exposure: { val: 0, color: null }, // 曝光
        saturation: { val: 0, color: null }, // 饱和度
        hue: { val: 0, color: null }, // 色调
        vibrance: { val: 0, color: null }, // 亮丽度
        noise: { val: 0, color: null }, // 噪音
        sepia: { val: 0, color: null }, // 褐色
        triangleBlur: { val: 0, color: null }, // 模糊
        denoise: { val: 0, color: null }, // 降噪
        vignette: { val: 0, color: null }, // 暗角
        lensBlur: { val: 0, color: null }, // 梦幻醉
        ink: { val: 0, color: null }, // 山水画
        bulgePinch: { val: 0, radius: 20 } // 鱼眼特效  val：强度 radius 半径
        // 以下第一版暂时不做
        // colorChange: { val: 0, color: null }, // 色相
        // balanceQh: { val: 0, color: null }, // 青色-红色
        // balanceYl: { val: 0, color: null }, // 洋红-绿色
        // balanceHl: { val: 0, color: null }, // 黄色-蓝色
        // red1: { val: 0, color: null }, // 红色-参数1
        // red2: { val: 0, color: null }, // 红色-参数2
        // red3: { val: 100, color: null }, // 红色-参数3
        // red4: { val: 100, color: null }, // 红色-参数4
        // green1: { val: 0, color: null }, // 绿色-参数1
        // green2: { val: 0, color: null }, // 绿色-参数2
        // green3: { val: 100, color: null }, // 绿色-参数3
        // green4: { val: 100, color: null } // 绿色-参数4
    }
}

const mutations = {
    [types.PHOTO_BASE_CHANGE_IMG_SRC](state, data) {
        // state.currentImgSrc = data
        state.currentImgObj.src = data
    },
    [types.PHOTO_BASE_COUNT_CHANGE](state) {
        state.singleStyleChangeCount++
        state.clearCount++
    },
    [types.PHOTO_BASE_CLEAR_ALL_CONFIG](state) {
        for (const key in state.base) {
            // 全部还原
            state.base[key].val = 0
        }
    },
    [types.PHOTO_BASE_BACK_TO_ORIGIN](state) {
        for (const key in state.base) {
            // 全部还原
            state.base[key].val = 0
        }
        state.isBackToOriginState = new Date().getTime()
    },
    [types.PHOTO_PARAM_DRAG_STATE](state, dragState) {
        state.dragState = dragState
    },
    [types.PHOTO_BASE_INIT](state) {
        state.$canvas = document.getElementsByClassName('eqc-photo-background-image')[0]
        state.ctx = state.$canvas.getContext('2d')
        state.imageData = state.ctx.getImageData(0, 0, state.$canvas.width, state.$canvas.height) // 最初状态
    },
    [types.PHOTO_BASE_CHANGE](state, { name, val, color, range }) {
        state.isHistory = false
        state.base[name].val = val
        state.singleStyleChangeCount++
        Vue.store.commit('PHOTO_SCENE_IS_HISTORY_CHANGE_NAV', false)
    }
}
const actions = {
    [types.PHOTO_BASE_HISTORY_RENDER](state, { snapshot, baseState, isInner }) {
        if (baseState) {
            state.state.base = baseState.operating
            state.state.isHistory = true
            state.state.currentImgObj.size = {
                width: baseState.width,
                height: baseState.height
            }
            state.state.currentImgObj.timestamp = new Date().getTime()
        }
        // 提供给历史记录专用的render方法
        if (!isInner) {
            // 组间  组间只需要快照
            // state.state.currentImgSrc = snapshot
            state.state.currentImgObj.src = snapshot
        }
        // 组内 需要快照和参数
        state.state.singleStyleChangeCount++
    }
}

export default {
    state,
    mutations,
    actions
}
