import types from '../mutationTypes'
import EqxScene from '../../../core/scene'
import EqxPage from '../../../core/html/page'
import storageLocal from '../../../../utils/storageLocal'
import { elementType } from '../../../../config/enum'

const state = {
    // 用户上传的原图key
    originKey: null,
    // 用户上传的原图
    originImage: null,
    // 原图的缩略图 便于操作
    originImageShot: null,
    // 原图尺寸信息
    originImageSize: null,
    // 缩略图的尺寸
    originImageShotSize: null,
    // 是否上传了图片
    isUploadImage: false,
    // 重新上传消息通知
    reUploadImage: null,
    // 场景数据
    eqxScene: null,
    // 页面数据
    eqxPage: null,
    // 是否在保存中
    isSaving: false,
    // 设置原图和size
    setOriginImageInfo: null,
    // 当前选中的组件
    eqxElementsSelected: [],
    // 当前复制的组件json
    elementsCopied: [],
    // 当前粘贴的组件json
    elementsPasted: [],
    // 判断用户是不是按住了ctrl
    ctrlState: false,
    // 菜单是否能切换 不能的话 需要等待
    canNavChange: null,
    // 判断是不是回退自动切换的菜单
    isHistoryChangeNav: false
}

const mutations = {
    [types.PHOTO_SCENE_IS_HISTORY_CHANGE_NAV](state, status) {
        state.isHistoryChangeNav = status
    },
    // 是否切换menu
    [types.PHOT_NAV_CAN_CHANGE](state) {
        state.canNavChange = new Date().getTime()
    },
    // 清空workspace
    [types.PHOTO_SCENE_CLEAR](state) {
        state.originKey = null
        state.originImage = null
        state.originImageShot = null
        state.originImageSize = null
        state.originImageShotSize = null

        state.isUploadImage = false
        state.reUploadImage = null
        state.setOriginImageInfo = null
        state.eqxElementsSelected = []

        state.elementsCopied = []
        state.elementsPasted = []
        state.ctrlState = false
    },
    // 源图key
    [types.PHOTO_ORIGIN_KEY](state, originKey) {
        state.originKey = originKey
    },
    // 源图
    [types.PHOTO_ORIGIN_IMAGE](state, originImage) {
        state.originImage = originImage
    },
    // 源图的缩略图
    [types.PHOTO_ORIGIN_IMAGE_SHOT](state, { shotImage, width, height }) {
        state.originImageShot = shotImage
        state.originImageShotSize = {
            width: width,
            height: height
        }
    },
    // 源图尺寸信息
    [types.PHOTO_ORIGIN_IMAGE_SIZE](state, { width, height }) {
        if (state.originImageSize === null) {
            state.originImageSize = {}
        }
        state.originImageSize.width = width
        state.originImageSize.height = height
    },
    // 设置原图和size
    [types.PHOTO_SET_ORIGIN_IMAGE_INFO](state, setOriginImageInfo) {
        state.setOriginImageInfo = setOriginImageInfo
    },
    // 是否上传了图片
    [types.PHOTO_IS_UPLOAD_IMAGE](state, isUploadImage) {
        state.isUploadImage = isUploadImage
    },
    // 重新上传消息通知
    [types.PHOTO_RE_UPLOAD_IMAGE](state, { reUploadImage }) {
        state.reUploadImage = reUploadImage
    },
    // 初始化场景
    [types.PHOTO_SCENE_INIT](state, { eqxScene, eqxPage }) {
        state.eqxScene = eqxScene
        state.eqxPage = eqxPage
    },
    // 改变场景大小
    [types.PHOTO_SCENE_SIZE_CHANGE](state, { width, height }) {
        if (state.eqxScene) {
            state.eqxScene.sceneJson.width = width
            state.eqxScene.sceneJson.height = height
        }
    },
    // 新增页添加到最后面
    [types.PHOTO_PAGE_ADD](state, { eqxPage }) {
        state.eqxPage = eqxPage
        state.eqxScene.addPage(eqxPage, true)
    },
    [types.PHOTO_ELEMENT_SELECT](state, { eqxElements }) {
        state.eqxElementsSelected = eqxElements
    },
    [types.PHOTO_CTRL_STATE_CHANGE](state, ctrlState) {
        state.ctrlState = ctrlState
    },
    [types.PHOTO_ELEMENT_COPY](state) {
        // state.elementsCopied = state.eqxElementsSelected.map(eqxElement => JSON.parse(JSON.stringify(eqxElement.elementJson)))
        state.elementsCopied = []
        // let copyCombineArr = [] // 防止重复copy
        state.eqxElementsSelected.map(eqxElement => {
            if (eqxElement.elementJson.type === elementType.gif || eqxElement.elementJson.property.lock) {
                // 如果是gif 或者锁定的元素 则不做任何操作 gif不能复制
            } else if (eqxElement.elementJson.type === elementType.combine) {
                eqxElement.elementJson.isCombine = eqxElement.isCombine // 保存组合状态
                if (eqxElement.combineBox) {
                    eqxElement.combineBox.copyCombineBox(eqxElement.combineBox)
                } else {
                    eqxElement.copyCombineBox(eqxElement)
                }
            } else {
                if (eqxElement.combineBox) {
                    if (eqxElement.combineBox.combineBox) {
                        eqxElement.combineBox.combineBox.copyCombineBox(eqxElement.combineBox.combineBox)
                    } else {
                        eqxElement.combineBox.copyCombineBox(eqxElement.combineBox)
                    }
                } else {
                    state.elementsCopied.push(JSON.parse(JSON.stringify(eqxElement.elementJson)))
                }
            }
        })
        // 去重
        const noReaptArr = []
        const temp = []
        const indexArr = []
        const idArr = state.elementsCopied.map(item => item.id)
        idArr.forEach((id, i) => {
            if (!temp.includes(id)) {
                temp.push(id)
                indexArr.push(i)
            }
        })
        indexArr.forEach(index => {
            noReaptArr.push(state.elementsCopied[index])
        })
        state.elementsCopied = noReaptArr
        storageLocal.setItem(storageLocal.key.elementCopy, noReaptArr)
        state.pasteTimes = 0
    },
    [types.PHOTO_ELEMENT_PASTE](state) {
        state.pasteTimes++
        const copyElementArr = storageLocal.getItem(storageLocal.key.elementCopy)
        if (copyElementArr && copyElementArr.length > 0) {
            state.elementsPasted = JSON.parse(JSON.stringify(copyElementArr)) // 其他网页复制过来的
        } else {
            state.elementsPasted = JSON.parse(JSON.stringify(state.elementsCopied)) // 将数据复制一份，这样引用变化了就能被监听到
        }
    }
}

const actions = {
    // 保存页面并生成封面cover用于导出到图片库
    [types.PHOTO_PAGE_SAVE]({ state }, { eqxPage, needCover }) {
        let promise = Promise.resolve()
        const { pageJson, eqxScene } = eqxPage
        state.isSaving = true
        if (needCover) {
            const eqxSceneNew = new EqxScene(JSON.parse(JSON.stringify(eqxScene.sceneJson)))
            const eqxPageNew = new EqxPage(JSON.parse(JSON.stringify(pageJson)), eqxSceneNew)
            const canvasPromise = eqxPageNew.page2Canvas()
            const tokenPromise = Vue.api.file.getUploadToken()
            promise = Promise.all([tokenPromise, canvasPromise])
                .then(([token, canvas]) => Vue.api.file.uploadBase64(canvas.toDataURL().split(',')[1], token))
                .then(res => { pageJson.cover = res.data.key })
        }

        return promise
            .then(() => {
                const { width, height } = eqxPage.eqxScene.sceneJson
                eqxPage.setSavedJson(pageJson)
                eqxPage.sceneWidth = width
                eqxPage.sceneHeight = height
                state.isSaving = false
                return pageJson
            })
            .catch(err => {
                err && Vue.logger.error(err)
                state.isSaving = false
                return Promise.reject()
            })
    }

}

export default {
    state,
    mutations,
    actions
}
