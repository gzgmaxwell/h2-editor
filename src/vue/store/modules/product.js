import types from '../mutationTypes'

const state = {
    categoryLevel1List: null, // 主编辑器素材分类
    productType: null,
    productId: null,
    isSourceId: false,
    sourceUser: null,
    centerId: null,
    categoryTcloudList: null, // 字云编辑器素材分类
    categoryPuzzleList: null // 拼图编辑器素材分类

}

const mutations = {
    [types.PRODUCT_CATEGORY_LEVEL1_LIST](state, { categoryList }) {
        state.categoryLevel1List = categoryList
    },
    [types.PRODUCT_CATEGORY_TCOULD_LIST](state, { categoryList }) {
        state.categoryTcloudList = categoryList
    },
    [types.PRODUCT_CATEGORY_PUZZLE_LIST](state, { categoryList }) {
        state.categoryPuzzleList = categoryList
    },
    [types.PRODUCT_TYPE](state, productType) {
        state.productType = productType
    },
    [types.PRODUCT_ID](state, { productId, needUpdate = false, isSourceId = false, sourceUser, centerId }) {
        if (state.productId === null || state.productId === undefined || needUpdate) {
            state.productId = productId
            state.isSourceId = isSourceId
            state.sourceUser = sourceUser
            state.centerId = centerId
        }
    }
}

export default {
    state,
    mutations
}
