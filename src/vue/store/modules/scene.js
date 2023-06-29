import types from '../mutationTypes'
import EqxScene from '../../../core/scene'
import EqxPage from '../../../core/html/page'
import storageLocal from '../../../utils/storageLocal'
import util from '../../../utils/util'
import { elementType } from '../../../config/enum'

const state = {
    eqxScene: null,
    eqxSceneEditCompleteEvent: null,
    eqxPage: null,
    eqxElementsSelected: [], // 当前选中的组件
    elementsCopied: [], // 当前复制的组件json
    elementsPasted: [], // 当前粘贴的组件json
    pasteTimes: 0, // 粘贴的次数
    eqxCombineElementSelected: [], // 编组结合模式下选定的组件
    disableBack: true,
    disableForward: true,
    isSaving: false,
    isNoHistory: false,
    gifWorikerNum: 2, // 默认开启俩个线程
    gifQuality: 50, // 0-100 0质量最好 100最差
    ctrlState: false, // 判断用户是不是按住了ctrl
    chooseUploadTagId: -1, // -1 默认为全部
    eqxScene2: null,
    eqxScene2EditCompleteEvent: null,
    eqxPage2: null,
    eqxScene3: null,
    eqxScene3EditCompleteEvent: null,
    eqxPage3: null,
    expressMode: null, // 简易版模式 1：作品 2：纯图片
    cacheImage: {}, // 缓存图片 用于批量制作
    matchCategory: {}, // 相似算法匹配的category
    changeSizeState: 0, // 是否改变场景的宽高
    isGetCoverWithoutWatermark: false,
    batchProductTemplateRelation: [], // 批量创建作品模板关系
    isPhoneUploadFinish: false, // 背景模块 手机上传是否成功标识
    isNeedInitCombineBox: true, // 是否需要生成combineBox
    sidebarMenuOption: {
        show: false,
        eqxElements: [],
        left: 300,
        top: 300
    },
    tableClickTimestamp: new Date().getTime(),
    tableMenu: {
        isShow: false,
        left: 0,
        top: 0,
        type: 'row',
        index: 0,
        id: -1
    },
    tableMenuIn: {
        isShow: false,
        left: 0,
        top: 0
    },
    tableStyleLayer: {
        show: false
    },
    puzzleMode: null // 是否是拼图模式
}

const mutations = {
    [types.SCENE_TABLE_STYLE_LAYER_CHANGE](state, option) {
        state.tableStyleLayer.show = option.show
    },
    [types.SCENE_TABLE_TABLE_MENU_IN_CHANGE](state, config) {
        state.tableMenuIn.isShow = config.isShow
        state.tableMenuIn.left = config.left
        state.tableMenuIn.top = config.top
    },
    [types.SCENE_TABLE_TABLE_MENU](state, config) {
        state.tableMenu.isShow = config.isShow
        state.tableMenu.left = config.left
        state.tableMenu.top = config.top
        state.tableMenu.type = config.type
        state.tableMenu.index = config.index
        state.tableMenu.id = config.id
    },
    [types.SCENE_TABLE_CLICK_TIMESTAMP](state) {
        state.tableClickTimestamp = new Date().getTime()
        const eqxElement = Vue.store.state.scene.eqxElementsSelected[0]
        if (eqxElement.elementJson.type === elementType.table) {
            eqxElement.saveTableData()
        }
    },
    [types.SCENE_BACKGROUND_PHONE_UPLOAD_FINISH](state, flag) {
        state.isPhoneUploadFinish = flag
    },
    [types.WATERMARK_COVER_CHANGE](state, val) {
        state.isGetCoverWithoutWatermark = val
    },
    [types.ADD_BATCH_PRODUCT_TEMPLATE_RELATION](state, { productId, templateId, editorCount }) {
        state.batchProductTemplateRelation.push({
            productId,
            templateId,
            editorCount
        })
    },
    [types.SCENE_SIZE_CHANGE](state, val) {
        state.changeSizeState = val
    },
    [types.MATCH_CATEGORY](state, matchCategoryObj) {
        state.matchCategory = matchCategoryObj
    },
    [types.CHANGE_UPLOAD_TAG](state, chooseTagId) {
        state.chooseUploadTagId = chooseTagId
    },
    [types.CTRL_STATE_CHANGE](state, ctrlState) {
        state.ctrlState = ctrlState
    },
    [types.GIF_WOKER_CHOOSE](state, workNum) {
        state.gifWorikerNum = workNum
    },
    [types.GIG_QUALITY_CHOOSE](state, qualityNum) {
        state.gifQuality = qualityNum
    },
    [types.SCENE_INIT](state, { eqxScene, eqxPage }) {
        state.eqxScene = eqxScene
        state.eqxPage = eqxPage
    },
    [types.SCENE2_INIT](state, { eqxScene2, eqxPage2 }) {
        state.eqxScene2 = eqxScene2
        state.eqxPage2 = eqxPage2
    },
    [types.SCENE3_INIT](state, { eqxScene3, eqxPage3 }) {
        state.eqxScene3 = eqxScene3
        state.eqxPage3 = eqxPage3
    },
    [types.CACHE_IMAGE](state, { key, value }) {
        state.cacheImage[key] = value
    },
    [types.CLEAR_CACHE_IMAGE](state) {
        state.cacheImage = {}
    },
    [types.SCENE_EDIT_COMPLETE_EVENT](state, { eqxSceneEditCompleteEvent }) {
        state.eqxSceneEditCompleteEvent = eqxSceneEditCompleteEvent
    },
    [types.SCENE2_EDIT_COMPLETE_EVENT](state, { eqxScene2EditCompleteEvent }) {
        state.eqxScene2EditCompleteEvent = eqxScene2EditCompleteEvent
    },
    [types.SCENE3_EDIT_COMPLETE_EVENT](state, { eqxScene3EditCompleteEvent }) {
        state.eqxScene3EditCompleteEvent = eqxScene3EditCompleteEvent
    },
    [types.PAGE_CHANGE](state, { eqxPage }) {
        state.eqxPage = eqxPage
    },
    // 新增页添加到最后面
    [types.PAGE_ADD](state, { eqxPage, currentPageId }) {
        state.eqxPage = eqxPage
        state.eqxScene.addPage(eqxPage, true, currentPageId)
    },
    // 删除页根据删除的是否是当前选中页，分别处理
    [types.PAGE_DELETE](state, { eqxPage }) {
        let index = state.eqxScene.eqxPages.indexOf(eqxPage)
        // 如果删除的这一页是当前选中页，并且前面还有页，则选中前一页，否则选中后一页
        // 如果不是当前页，则什么都不处理，直接删除
        if (eqxPage === state.eqxPage) {
            eqxPage === state.eqxScene.eqxPages[0] ? index++ : index--
            state.eqxPage = state.eqxScene.eqxPages[index]
        }
        state.eqxScene.deletePage(eqxPage)
    },
    // 复制页需要添加到被复制页的后面，并选中
    [types.PAGE_COPY](state, { eqxPage, eqxPageNew }) {
        const index = state.eqxScene.eqxPages.indexOf(eqxPage)
        state.eqxScene.sceneJson.pages.splice(index + 1, 0, eqxPageNew.pageJson)
        state.eqxScene.eqxPages.splice(index + 1, 0, eqxPageNew)
        state.eqxPage = eqxPageNew
    },
    [types.HISTORY_SET](state, { disableBack, disableForward }) {
        state.disableBack = disableBack
        state.disableForward = disableForward
    },
    [types.HISTORY_BACK](state) {
        if (!state.disableBack) {
            const pageJson = state.eqxPage.eqxHistory.back()
            state.eqxPage.renderPage(pageJson)
            state.eqxElementsSelected = []
        }
    },
    [types.HISTORY_FORWORD](state) {
        if (!state.disableForward) {
            const pageJson = state.eqxPage.eqxHistory.forward()
            state.eqxPage.renderPage(pageJson)
            state.eqxElementsSelected = []
        }
    },
    [types.ELEMENT_SELECT](state, { eqxElements }) {
        state.eqxElementsSelected = eqxElements
    },
    [types.ELEMENT_COPY](state) {
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
    [types.ELEMENT_PASTE](state) {
        state.pasteTimes++
        const copyElementArr = storageLocal.getItem(storageLocal.key.elementCopy)
        if (copyElementArr && copyElementArr.length > 0) {
            state.elementsPasted = JSON.parse(JSON.stringify(copyElementArr)) // 其他网页复制过来的
        } else {
            state.elementsPasted = JSON.parse(JSON.stringify(state.elementsCopied)) // 将数据复制一份，这样引用变化了就能被监听到
        }
    },
    [types.PAGE_ORDER_CHANGED](state, pos) {
        const { oldIndex, newIndex } = pos
        const { eqxPages, sceneJson: { pages } } = state.eqxScene
        const eqxPage = eqxPages[oldIndex]
        const page = pages[oldIndex]
        const oldSort = page.sort
        const newSort = pages[newIndex].sort

        eqxPages.splice(oldIndex, 1)
        eqxPages.splice(newIndex, 0, eqxPage)
        pages.splice(oldIndex, 1)
        pages.splice(newIndex, 0, page)

        if (oldSort > newSort) {
            pages.map((v, i) => {
                if (v.sort === oldSort) {
                    v.sort = newSort
                } else if (v.sort >= newSort && v.sort < oldSort) {
                    v.sort = v.sort + 1
                }
            })
        } else if (oldSort < newSort) {
            pages.map((v, i) => {
                if (v.sort === oldSort) {
                    v.sort = newSort
                } else if (v.sort <= newSort && v.sort > oldSort) {
                    v.sort = v.sort - 1
                }
            })
        }
    },
    [types.HISTORY_NO_FLAG](state, flag) {
        state.isNoHistory = flag
    },
    [types.EXPRESS_MODE](state, mode) {
        state.expressMode = mode
    },
    [types.PUZZLE_MODE](state, mode) {
        state.puzzleMode = mode
    },
    [types.SCENE_IS_NEED_INIT_COMBINE_BOX](state, flag) {
        state.isNeedInitCombineBox = flag
    },
    [types.SCENE_SIDERBAR_MENU_OPTION](state, option) {
        state.sidebarMenuOption = option
    },
    [types.SCENE_SIDERBAR_MENU_OPTION_SHOW](state, flag) {
        state.sidebarMenuOption.show = flag
    }

}

const actions = {
    // 重新生成无水印的cover
    [types.GET_NO_WATERMARK_COVER]({ state }, { eqxPage, opposite = false }) {
        return new Promise((resolve, reject) => {
            if (opposite) {
                state.isGetCoverWithoutWatermark = false
            } else {
                state.isGetCoverWithoutWatermark = true
            }

            const { pageJson, eqxScene } = eqxPage
            const eqxSceneNew = new EqxScene(JSON.parse(JSON.stringify(eqxScene.sceneJson)))
            const eqxPageNew = new EqxPage(JSON.parse(JSON.stringify(pageJson)), eqxSceneNew)
            const tokenPromise = Vue.api.file.getUploadToken()
            const canvasPromise = eqxPageNew.page2Canvas()
            Promise.all([tokenPromise, canvasPromise]).then(([token, canvas]) => {
                state.isGetCoverWithoutWatermark = false
                if (util.isBlob(canvas)) {
                    util.blobToDataURL(canvas, (dataUrl) => {
                        resolve(Vue.api.file.uploadBase64(dataUrl.split(',')[1], token))
                    })
                } else {
                    resolve(Vue.api.file.uploadBase64(canvas.toDataURL().split(',')[1], token))
                }
            }).catch(err => {
                err && Vue.logger.error(err)
                reject()
                state.isGetCoverWithoutWatermark = false
            })
        })
    },
    // 如果页面有修改需要生成封面
    [types.PAGE_SAVE]({ state }, { eqxPage, needCover, isCopy }) {
        let promise = Promise.resolve()
        const { pageJson, eqxScene } = eqxPage
        pageJson.version++
        state.isSaving = true
        // 保存table的的data
        const eqxElements = Vue.store.state.scene.eqxPage.eqxElements
        eqxElements.map(element => {
            if (element.elementJson.type === elementType.table) {
                element.saveTableData()
            }
        })
        if (needCover) {
            // 秀客身份 生成的cover是干净的
            if (Vue.store.state.user.userInfo.type === 4) {
                state.isGetCoverWithoutWatermark = true
            }
            const eqxSceneNew = new EqxScene(JSON.parse(JSON.stringify(eqxScene.sceneJson)))
            const eqxPageNew = new EqxPage(JSON.parse(JSON.stringify(pageJson)), eqxSceneNew)
            const canvasPromise = eqxPageNew.page2Canvas()
            const tokenPromise = Vue.api.file.getUploadToken()
            let fileSize = 0
            promise = Promise.all([tokenPromise, canvasPromise])
                .then(([token, canvas]) => {
                    return new Promise((resolve, reject) => {
                        if (util.isBlob(canvas)) {
                            fileSize = canvas.size
                            util.blobToDataURL(canvas, (dataUrl) => {
                                resolve(Vue.api.file.uploadBase64(dataUrl.split(',')[1], token))
                            })
                        } else {
                            resolve(Vue.api.file.uploadBase64(canvas.toDataURL().split(',')[1], token))
                        }
                    })
                })
                .then(res => {
                    let fileSizeObj = storageLocal.getItem(storageLocal.key.gifFileSize)
                    if (fileSizeObj) {
                        fileSizeObj = JSON.parse(fileSizeObj)
                        fileSizeObj[res.data.key] = fileSize
                        storageLocal.setItem(storageLocal.key.gifFileSize, JSON.stringify(fileSizeObj))
                    } else {
                        const obj = {}
                        obj[res.data.key] = fileSize
                        storageLocal.setItem(storageLocal.key.gifFileSize, JSON.stringify(obj))
                    }
                    pageJson.cover = res.data.key
                    if (Vue.store.state.user.userInfo.type === 4) {
                        state.isGetCoverWithoutWatermark = false
                    }
                })
        }

        return promise.then(() => {
            return new Promise((resolve, reject) => {
                if (isCopy) {
                    Vue.api.page.copyPage(pageJson)
                        .then(() => {
                            resolve()
                        })
                        .catch(err => {
                            err && Vue.logger.error(err)
                            reject()
                        })
                } else {
                    Vue.api.page.savePage(pageJson)
                        .then(() => {
                            resolve()
                        })
                        .catch(err => {
                            err && Vue.logger.error(err)
                            reject()
                        })
                }
            })
        })
            .then(() => {
                const savedIds = storageLocal.getItem(storageLocal.key.saveTime)
                let savedArr = []
                if (savedIds) {
                    savedArr = JSON.parse(savedIds)
                }
                let found = false
                savedArr.map((v, i) => {
                    if (v.printId === eqxScene.sceneJson.id) {
                        v.saveTime = new Date().getTime()
                        found = true
                    }
                })
                if (!found) {
                    const t = new Date().getTime()
                    savedArr.push({ printId: eqxScene.sceneJson.id, saveTime: t })
                }
                storageLocal.setItem(storageLocal.key.saveTime, JSON.stringify(savedArr))

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
    },
    // 生成艺术二维码的封面-- 专用
    [types.ART_PAGE_SAVE]({ state }, { eqxPage }) {
        const { pageJson, eqxScene } = eqxPage
        pageJson.version++
        let changeFlag = false
        // 确保生成的 所有动态和立体二维码都是无水印的
        if (!state.isGetCoverWithoutWatermark) {
            changeFlag = true
            state.isGetCoverWithoutWatermark = true
        }

        const eqxSceneNew = new EqxScene(JSON.parse(JSON.stringify(eqxScene.sceneJson)))
        const eqxPageNew = new EqxPage(JSON.parse(JSON.stringify(pageJson)), eqxSceneNew)
        const canvasPromise = eqxPageNew.page2Canvas()
        const tokenPromise = Vue.api.file.getUploadToken()
        return Promise.all([tokenPromise, canvasPromise])
            .then(([token, canvas]) => {
                return new Promise((resolve, reject) => {
                    if (util.isBlob(canvas)) {
                        util.blobToDataURL(canvas, (dataUrl) => {
                            resolve(Vue.api.file.uploadBase64(dataUrl.split(',')[1], token))
                        })
                    } else {
                        resolve(Vue.api.file.uploadBase64(canvas.toDataURL().split(',')[1], token))
                    }
                    if (changeFlag) {
                        // 如果之前改变了  就要改变回来
                        state.isGetCoverWithoutWatermark = !state.isGetCoverWithoutWatermark
                    }
                })
            })
    }
}

export default {
    state,
    mutations,
    actions
}
