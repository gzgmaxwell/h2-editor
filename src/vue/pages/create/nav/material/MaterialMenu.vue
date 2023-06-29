<template>
    <div class="eqc-nav-material-menu">
        <base-search
            :model="search"
            :on-search="onSearch"
            model-key="keyWord"
        />
        <div
            v-show="search.status"
            class="info-box"
        >
            <span class="result">搜索结果({{ searchInfo.list.length }})</span>
            <span
                class="back"
                @click="goBack"
            ><i class="eqf-left" /> 返回</span>
        </div>
        <div
            v-show="!search.status"
            ref="list-wrap"
            v-scroll-bar
            class="content"
        >
            <ul
                v-show="!search.status"
                class="list"
            >
                <li
                    v-for="item in categoryListShow"
                    :key="item.id"
                    class="list-item"
                >
                    <div class="list-item-head">
                        <span>
                            <label class="category-name">
                                {{ item.name }}
                            </label>
                        </span>
                        <span>
                            <label
                                class="category-all"
                                @click="showAllClick(item)"
                            >
                                更多
                                <i
                                    class="icon eqf-right"
                                />
                            </label>
                        </span>
                    </div>
                    <div class="list-item-content">
                        <ul
                            v-if="categoryListByIdTop3(item).list.length>0"
                            class="list"
                        >
                            <template
                                v-for="goodsItem of categoryListByIdTop3(item).list"
                            >
                                <component
                                    :is="getComponentGoods(item.id , goodsItem, true)"
                                    v-if="getComponentGoods(item.id , goodsItem, true)!==''"
                                    :key="goodsItem.id"
                                    :item="goodsItem"
                                    :category="category"
                                />
                            </template>
                        </ul>
                    </div>
                </li>
            </ul>
        </div>

        <div
            v-show="search.status"
            ref="list-search-wrap"
            v-scroll-bar="{onScrollMove}"
            :style="contentSearchStyle"
            class="content-search"
        >
            <ul
                v-if="searchInfo.list.length"
                class="list"
            >
                <template
                    v-for="goodsItem of searchInfo.list"
                >
                    <component
                        :is="getComponentGoods(goodsItem.categoryId , goodsItem, false)"
                        :key="goodsItem.id"
                        :item="goodsItem"
                        :category="category"
                    />
                </template>
                <base-list-status-infinite
                    v-if="searchInfo.list.length && (searchInfo.isBusy || searchInfo.isEnd)"
                    :is-busy="searchInfo.isBusy"
                    :is-end="searchInfo.isEnd"
                    :bg-color="'rgba(255,255,255,1)'"
                />
            </ul>
            <!-- 推介列表 开始 -->
            <ul
                v-if="!searchInfo.list.length"
                class="list"
            >
                <base-list-status
                    v-if="!searchInfo.list.length"
                    :is-busy="searchInfo.isBusy"
                    :is-empty="!searchInfo.isBusy && !searchInfo.list.length"
                    :style="baseListStatusStyle"
                    :msg-css="msgCss"
                    msg-result="暂无素材"
                />
                <div
                    v-if="!searchInfo.list.length"
                    class="label-box"
                >
                    <span class="line" />
                    <span class="text">热门素材</span>
                    <span class="line" />
                </div>
                <template
                    v-for="(goodsItem,i) of hotList"
                >
                    <component
                        :is="getComponentGoods(goodsItem.itemId , goodsItem, false)"
                        v-if="getComponentGoods(goodsItem.itemId , goodsItem, false)!==''"
                        :key="i"
                        :item="goodsItem"
                        :category="category"
                    />
                </template>
            </ul>
            <!-- 推介列表结束 -->
        </div>
        <transition name="moveright">
            <div
                v-if="categoryDetail.visible"
                class="list-detail"
            >
                <div class="list-detail-head">
                    <span class="left-span">
                        <transition
                            name="fade"
                            mode="out-in"
                        >
                            <label
                                v-if="!categoryDetail.isScroll"
                                class="category-name"
                            >
                                {{ categoryDetail.name }}
                            </label>
                            <div
                                v-if="categoryDetail.isScroll"
                                class="category-detail"
                                @mouseover="categoryListMouseOver"
                                @mouseleave="categoryListMouseLeave"
                            >
                                <div class="current">
                                    <span>{{ categoryDetail.showName }}</span>
                                    <i
                                        :style="categoryItemSelectArrow"
                                        class="icon eqf-menu-down"
                                    />
                                </div>
                            </div>
                        </transition>
                    </span>
                    <span>
                        <label
                            class="category-condition"
                            @click="openCondition"
                        >筛选</label>
                        <label
                            class="category-close"
                            @click="showAllClick(null)"
                        >
                            <i
                                class="icon eqf-left"
                            />
                            返回
                        </label>
                    </span>
                </div>
                <div
                    :style="categoryItemListStyle"
                    class="list-detail-category"
                    @mouseleave="categoryItemListMouseLeave"
                >
                    <ul
                        :style="categoryItemListUlStyle"
                        class="detail"
                    >
                        <li
                            v-for="item of categoryTempList"
                            :key="item.id"
                            :class="{active: categoryDetail.categoryItemSelectedId === item.id}"
                            class="item"
                            @click="chooseCategory(item)"
                        >
                            {{ item.name }}
                        </li>
                        <li
                            v-if="showRestBtn"
                            class="item more"
                            @mousemove="showRest=true"
                        >
                            <i class="eqf-menu-p" />
                        </li>
                    </ul>
                    <!-- 目录下半截 -->
                    <div
                        :style="{height:restHeight}"
                        class="category-rest-box"
                        @mouseleave="showRest=false"
                    >
                        <div class="title">
                            更多分类
                        </div>
                        <div class="content">
                            <span
                                v-for="item in restCategoryList"
                                :key="item.id"
                                class="item"
                                @click="chooseCategory(item)"
                            >{{ item.name }}</span>
                        </div>
                    </div>
                </div>
                <div
                    ref="listDetailContentWrap"
                    v-scroll-bar="{onScrollMove}"
                    :style="listDetailContentStyle"
                    class="list-detail-content"
                >
                    <ul
                        v-show="getNoRepeatInfoList.length"
                        class="list"
                    >
                        <template
                            v-for="goodsItem of getNoRepeatInfoList"
                        >
                            <component
                                :is="getComponentGoods(categoryDetail.id , goodsItem, false)"
                                :key="goodsItem.id"
                                :item="goodsItem"
                                :category="category"
                            />
                        </template>
                        <base-list-status-infinite
                            v-if="getNoRepeatInfoList.length && (info.isBusy || info.isEnd)"
                            :is-busy="info.isBusy"
                            :is-end="info.isEnd"
                            :bg-color="'rgba(255,255,255,1)'"
                        />
                    </ul>
                    <base-list-status
                        v-if="!getNoRepeatInfoList.length"
                        :is-busy="info.isBusy"
                        :is-empty="!info.isBusy && !getNoRepeatInfoList.length"
                        :style="baseListStatusStyle"
                        msg-result="暂无素材"
                    />
                </div>
                <list-scroll-to-top
                    :style="listScrollToTopStyle"
                    :click="listScrollToTopClick"
                    class="toTop"
                />
            </div>
        </transition>
    </div>
</template>

<script>
import ImageItemSmall from './MaterialImageItemSmall.vue'
import ImageItem from './MaterialImageItem.vue'
import FrameItemSmall from './MaterialFrameItemSmall.vue'
import FrameItem from './MaterialFrameItem.vue'
import ShapeItemSmall from './MaterialShapeItemSmall.vue'
import ShapeItem from './MaterialShapeItem.vue'
import CombineItemSmall from './MaterialCombineItemSmall.vue'
import CombineItem from './MaterialCombineItem.vue'
import ListScrollToTop from '../../../../plugins/ListScrollToTop.vue'
import EnumGoodsType from '../../../../../config/enum.goods.type'

export default {
    components: {
        ImageItemSmall,
        ImageItem,
        FrameItemSmall,
        FrameItem,
        ShapeItemSmall,
        ShapeItem,
        CombineItemSmall,
        CombineItem,
        ListScrollToTop
    },
    props: {
        category: { // 类型 h2 主编辑器  tcloud 字云编辑器
            type: String,
            default: 'h2'
        }
    },
    data() {
        return {
            search: {
                status: false,
                keyWord: '',
                isScroll: false // 是否滚动过
            },
            categoryListInfoLoad: {},
            categoryListInfo: {}, // 一级分类下面的【推荐】二级分类的前三个素材
            // 分类详情信息
            categoryDetail: {
                visible: false, // 是否显示
                id: null, // id
                name: null, // 显示名称
                showName: '全部', // 真实的显示名称
                isScroll: false, // 是否滚动过，
                isShow: true, // 是否显示
                categoryItemList: null, // 二级分类数据
                categoryItemListVisible: false, // 二级分类是否显示
                categoryItemSelectedId: null // 选中分类的id
            },
            info: {},
            key: '', // 加载列表用的key
            searchInfo: {
                list: [],
                isBusy: false,
                isEnd: false
            },
            searchKey: '',
            marginTop: 0,
            categoryTempList: [], // menu上半截
            showRestBtn: false,
            showRest: false, // 是不是展示剩下的menu
            restCategoryList: [], // 隐藏的下半截
            hotList: [], // 推介列表
            msgCss: {
                fontSize: '18px',
                color: '#333333',
                fontWeight: '600'
            }
        }
    },
    computed: {
        // 产品数据
        product() {
            return Vue.store.state.product
        },
        // 用于显示的素材一级分类
        categoryListShow() {
            this.initCategoryListInfo()
            return this.categoryList
        },
        // 素材一级分类
        categoryList() {
            const categoryLevel1ListArray = []
            let list = this.product.categoryLevel1List
            if (this.category === 'tcloud') {
                list = this.product.categoryTcloudList
            }
            if (this.category === 'puzzle') {
                list = this.product.categoryPuzzleList
            }
            if (list && list.length > 0) {
                list.forEach((item, index) => {
                    if (!this.isCombineText(item.id)) {
                        categoryLevel1ListArray.push(item)
                    }
                })
            }

            return categoryLevel1ListArray
        },
        // 根据素材二级分类id获取该分类下前三个素材
        categoryListByIdTop3() {
            return function (pCategory) {
                let result = null
                const firstCategoryLevel2Id = pCategory.id
                if (firstCategoryLevel2Id !== null) {
                    result = this.categoryListInfo[firstCategoryLevel2Id].info
                } else {
                    result = {
                        list: []
                    }
                }
                return result
            }
        },
        // 动态计算rest的高度
        restHeight() {
            if (this.showRest) {
                return (50 + Math.ceil(this.restCategoryList.length / 4) * 40) + 'px'
            } else {
                return 0
            }
        },
        // 动态计算内容高度
        listDetailCategoryHeight() {
            const categoryItemListLength = this.categoryTempList.length
            const categoryItemListOneRowDomHeight = 40
            const categoryItemListOneRowDomCount = 4
            let categoryItemListRowsCount = 0
            let categoryItemListDomHeight = 0
            // 计算有几行
            if (categoryItemListLength >= categoryItemListOneRowDomCount) {
                categoryItemListRowsCount = parseInt(categoryItemListLength / categoryItemListOneRowDomCount)
            }
            if (categoryItemListLength % categoryItemListOneRowDomCount !== 0) {
                categoryItemListRowsCount += 1
            }
            // 计算出总高度
            categoryItemListDomHeight = categoryItemListRowsCount * categoryItemListOneRowDomHeight
            return Math.ceil(categoryItemListDomHeight) + 'px'
        },
        // 搜索内容样式
        contentSearchStyle() {
            if (this.search.isScroll) {
                return {
                    marginTop: '16px'
                }
            } else {
                return {
                    paddingTop: '16px'
                }
            }
        },
        // 获取二级分类容器的样式
        categoryItemListStyle() {
            if (this.categoryDetail.isScroll) {
                const height = this.categoryDetail.isShow ? this.listDetailCategoryHeight : 0
                return {
                    position: 'absolute',
                    zIndex: 1,
                    height: height,
                    boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.16)',
                    borderRadius: '3px',
                    margin: '0 8px',
                    paddingTop: '0',
                    width: 'calc(100% - 16px)'
                }
            } else {
                const height = this.categoryDetail.isShow ? this.listDetailCategoryHeight : 0
                return {
                    height: height
                }
            }
        },
        // 获取二级分类ul的样式
        categoryItemListUlStyle(state) {
            const height = this.categoryDetail.isShow ? this.listDetailCategoryHeight : 0
            return {
                marginTop: this.marginTop + 'px',
                height: height,
                borderRadius: '3px'
            }
        },
        // 获取二级分类选择框右侧箭头样式
        categoryItemSelectArrow() {
            const rotateVal = this.categoryDetail.isShow ? '180deg' : '0deg'
            return {
                transform: 'rotate(' + rotateVal + ')',
                '-ms-transform': 'rotate(' + rotateVal + ')',
                '-moz-transform': 'rotate(' + rotateVal + ')',
                '-webkit-transform': 'rotate(' + rotateVal + ')',
                '-o-transform': 'rotate(' + rotateVal + ')',
                transition: 'transform 0.3s linear'
            }
        },
        // 获取详情内容部分样式
        listDetailContentStyle() {
            if (this.categoryDetail.isShow) {
                return {
                    paddingTop: '16px'
                }
            } else {
                return {
                    marginTop: '16px'
                }
            }
        },
        // 获取加载提示的位置
        baseListStatusStyle() {
            let marginTopVal = 0
            if (this.categoryDetail.isScroll && this.categoryDetail.isShow) {
                marginTopVal = this.listDetailCategoryHeight
            }
            return {
                marginTop: marginTopVal
            }
        },
        // 返回顶部样式
        listScrollToTopStyle() {
            if (this.categoryDetail.isScroll) {
                return {
                    transform: 'translate(0,-60px)'
                }
            }
            return {}
        },
        // 获取无重复的infoList
        getNoRepeatInfoList() {
            // 根据id去重
            let noRepeatInfoList = []
            if (this.info.list.length !== 0) {
                const obj = {}
                noRepeatInfoList = this.info.list.reduce((cur, next) => {
                    if (!obj[next.id]) {
                        obj[next.id] = true
                        cur.push(next)
                    }
                    return cur
                }, [])
            }
            return noRepeatInfoList
        },
        layout() {
            return Vue.store.state.layout
        },
        itemClickEvent() {
            return this.layout.nav.itemClickEvent
        },
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        materialMoreConfig() {
            return Vue.store.state.layout.materialMoreConfig
        }
    },
    watch: {
        // 监听筛选条件改变之后的查询
        materialMoreConfig: {
            handler(newVal) {
                if (newVal.show) {
                    this.getProducts(true)
                }
            },
            deep: true
        },
        itemClickEvent: function () {
            if (this.layout.nav.itemClickEvent.type === 'noSwitch' &&
                this.layout.nav.selectedItem.type === 'image' &&
                this.categoryDetail.visible) {
                this.showAllClick(null)
            }
        }
    },
    methods: {
        // 分类列表容器显示与否
        setCategoryListPanelVisible(visible) {
            this.categoryDetail.categoryItemListVisible = visible
            this.categoryDetail.isShow = visible
        },
        initCategoryListInfo() {
            const _self = this
            this.categoryList.forEach((item, index) => {
                const categoryId = item.id
                if (categoryId !== null) {
                    let apiCode = Vue.env.mall.apiCode[0]
                    if (this.isCombine(categoryId)) {
                        apiCode = Vue.env.mall.apiCode[2]
                    }
                    _self.categoryListInfo[categoryId] = { key: '', info: {}, apiCode }
                }
            })
            this.getProductsByCategoryId()
        },
        // 根据素材二级分类id获取指定数量的素材
        getProductsByCategoryId() {
            for (var key in this.categoryListInfo) {
                const tab = 'sys'
                const params = {
                    categoryId: key,
                    apiCode: this.categoryListInfo[key].apiCode
                }
                if (this.userInfo && this.userInfo.id) {
                    params.userId = this.userInfo.id
                }
                this.categoryListInfo[key].key = Vue.infiniteScroll.setKey(Object.assign(params, { tab }))
                this.categoryListInfoLoad = this.categoryListInfo[key].info = Vue.infiniteScroll.getInfo(this.categoryListInfo[key].key)
                if (!this.categoryListInfo[key].info.list.length) {
                    Vue.infiniteScroll.getMoreItems(this.categoryListInfo[key].key, { pageSize: 3 })
                        .catch(err => err && this.logger.error(err))
                }
            }
        },
        // 获取搜索商品
        getSearchProducts(pCategory) {
            const tab = 'sys'
            const params = {
                categoryId: pCategory,
                apiCode: this.categoryListInfo[pCategory].apiCode,
                keyWord: this.getKeyWords(),
                pageNo: 1,
                pageSize: 100
            }
            return Vue.api.product.getNewProducts(Object.assign(params, { tab }))
        },
        // 根据当前选择的二级分类的id获取素材 state只有在更多的时候才使用
        getProducts(state) {
            const tab = 'sys'
            const params = {
                categoryId: this.categoryDetail.categoryItemSelectedId,
                apiCode: this.categoryListInfo[this.categoryDetail.id].apiCode,
                keyWord: this.getKeyWords()
            }
            if (state) {
                if (this.materialMoreConfig.price === 'all') {
                    // 全部:free、memberFree字段为空
                } else if (this.materialMoreConfig.price === 'free') {
                    params.free = 0
                } else if (this.materialMoreConfig.price === 'pay') {
                    params.free = 1
                } else if (this.materialMoreConfig.price === 'memberFree') {
                    params.memberFree = 1
                }
                if (this.materialMoreConfig.sort === 'latest') {
                    params.mostType = 'newest'
                } else if (this.materialMoreConfig.sort === 'hot') {
                    params.mostType = 'hottest'
                }
            }
            if (this.userInfo && this.userInfo.id) {
                params.userId = this.userInfo.id
            }
            this.key = Vue.infiniteScroll.setKey(Object.assign(params, { tab }))
            this.info = Vue.infiniteScroll.getInfo(this.key)
            if (!this.info.list.length) {
                this.getNextPage()
            }
            setTimeout(() => this.$refs.listDetailContentWrap.myScroll.scrollToTop(), 100)
        },
        // 获取搜索关键字
        getKeyWords() {
            if (this.search.status) {
                return this.search.keyWord
            }
            return ''
        },
        // 获取下一页数据
        getNextPage() {
            Vue.infiniteScroll.getMoreItems(this.key)
                .catch(err => err && this.logger.error(err))
        },
        isUnknown(pId) {
            return EnumGoodsType.isUnknown(pId)
        },
        isImage(pId) {
            return EnumGoodsType.isImage(pId)
        },
        isShape(pId) {
            return EnumGoodsType.isShape(pId)
        },
        isFrame(pId) {
            return EnumGoodsType.isFrame(pId)
        },
        isCombine(pId) {
            return EnumGoodsType.isCombine(pId)
        },
        isCombineText(pId) {
            return EnumGoodsType.isCombineText(pId)
        },
        // 是否为svg
        isSvg(item) {
            let extStr = ''
            if (Object.prototype.hasOwnProperty.call(item.productTypeMap, 'ext_name')) {
                extStr = item.productTypeMap.ext_name
            } else if (Object.prototype.hasOwnProperty.call(item.productTypeMap, 'path')) {
                if (item.productTypeMap.path.indexOf('.') >= 1) {
                    extStr = item.productTypeMap.path.split('.')[1]
                }
            }
            return extStr.toLowerCase() === 'svg'
        },
        // 获取商品 根据商品分类id和商品项
        getComponentGoods(pCategoryId, pGoodsItem, pIsSmall) {
            let componentName = ''
            // 未知分类当做图片或者形状处理
            if (this.isImage(pCategoryId) || this.isUnknown(pCategoryId)) {
                if (!this.isSvg(pGoodsItem)) {
                    componentName = 'image-item'
                } else {
                    componentName = 'shape-item'
                }
            } else if (this.isFrame(pCategoryId)) {
                componentName = 'frame-item'
            } else if (this.isCombine(pCategoryId)) {
                componentName = 'combine-item'
            }
            if (componentName !== '' && pIsSmall) {
                componentName += '-small'
            }
            return componentName
        },
        // ----------------Event----------------
        // 搜索按钮点击或者敲击Enter
        onSearch() {
            if (this.search.keyWord === '') {
                this.search.status = false
            } else {
                this.search.status = true
                this.categoryDetail.categoryItemSelectedId = Vue.env.mall.materialId

                const promiseArray = []
                this.categoryList.forEach((item, index) => {
                    promiseArray.push(this.getSearchProducts(item.id))
                })
                const _self = this
                _self.searchInfo.list = []
                _self.searchInfo.isBusy = true
                Promise.all(promiseArray).then((res) => {
                    res.forEach((item, index) => {
                        const categoryId = _self.categoryList[index].id
                        const categorySearchResult = []
                        item.data.list.forEach((item, index) => {
                            item.categoryId = categoryId
                            categorySearchResult.push(item)
                        })
                        _self.searchInfo.list.push(...categorySearchResult)
                    })
                    // 根据id去重
                    const obj = {}
                    _self.searchInfo.list = _self.searchInfo.list.reduce((cur, next) => {
                        if (!obj[next.id]) {
                            obj[next.id] = true
                            cur.push(next)
                        }
                        return cur
                    }, [])
                    _self.searchInfo.isBusy = false
                    _self.searchInfo.isEnd = true
                    // 如果查询结果为空 则显示推介列表
                    if (_self.searchInfo.list.length === 0) {
                        _self.getHotList()
                    }
                }).catch((error) => {
                    console.log(error)
                })
            }
        },
        // 一级分类【全部】按钮点击事件
        showAllClick(item) {
            // 关闭条件框
            Vue.store.commit('MATERIAL_MORE_CHANGE', { show: false })
            if (item === null) {
                this.categoryDetail.visible = false
                this.categoryDetail.showName = '全部'
                this.$emit('showAll', false)
            } else {
                this.restCategoryList = []
                this.$emit('showAll', true)
                this.categoryDetail.visible = true
                this.categoryDetail.id = item.id
                this.categoryDetail.name = item.name
                this.categoryDetail.isScroll = false
                this.categoryDetail.isShow = true
                this.categoryDetail.categoryItemList = [{
                    id: item.id,
                    name: '全部',
                    parentId: item.parentId,
                    path: item.path,
                    topId: item.topId
                }]
                // 判断子分类list是否存在，存在才concat
                if (item.list && item.list.length > 0) {
                    this.categoryDetail.categoryItemList = this.categoryDetail.categoryItemList.concat(item.list.slice(0))
                }
                this.categoryDetail.categoryItemListVisible = true
                this.categoryDetail.categoryItemSelectedId = this.categoryDetail.categoryItemList[0].id
                this.getProducts()
                if (this.categoryDetail.categoryItemList.length > 7) {
                    this.categoryTempList = this.categoryDetail.categoryItemList.slice(0, 6)
                    this.restCategoryList = this.categoryDetail.categoryItemList.slice(6)
                    this.showRestBtn = true
                } else {
                    this.categoryTempList = this.categoryDetail.categoryItemList
                    this.showRestBtn = false
                }
            }
        },
        dealCategoryTempList(state) {
            if (this.categoryDetail.categoryItemList.length > 7) {
                if (state) {
                    // 正常显示
                    this.categoryTempList = this.categoryDetail.categoryItemList.slice(0, 6)
                    this.showRestBtn = true
                } else {
                    // 全部显示
                    this.categoryTempList = this.categoryDetail.categoryItemList
                    this.showRestBtn = false
                }
            }
        },
        // 二级分类内容区滚动 和 搜索内容区滚动
        onScrollMove(e, info) {
            // 这里滚动插件待优化，名称必须是onScrollMove
            if (this.search.status) {
                if (info.scrollY === 0) {
                    this.search.isScroll = false
                } else if (info.scrollY >= 1) {
                    this.search.isScroll = true
                }
            } else {
                if (info.scrollY === 0) {
                    this.categoryDetail.isScroll = false
                    this.setCategoryListPanelVisible(true)
                    this.dealCategoryTempList(true)
                    this.marginTop = 0
                    return
                } else if (info.scrollY >= 1 && info.scrollY <= 150) {
                    if (!this.categoryDetail.isScroll) {
                        this.$refs.listDetailContentWrap.myScroll.scrollToTop()
                    }
                    this.categoryDetail.isScroll = true
                    this.setCategoryListPanelVisible(false)
                    this.dealCategoryTempList(false)
                    this.marginTop = 10
                    this.showRest = false
                }
                if (info.scrollY / info.maxScrollY >= 2 / 3) {
                    this.getNextPage()
                }
            }
        },
        // 二级分类下拉框选择
        chooseCategory(item) {
            // 设置当前选中为点击的项
            this.categoryDetail.showName = item.name
            this.categoryDetail.categoryItemSelectedId = item.id
            this.getProducts()
            // 切换小分类时，关掉配置项
            Vue.store.commit('MATERIAL_MORE_CHANGE', { show: false })
        },
        // 二级分类下拉框鼠标滑入
        categoryListMouseOver() {
            this.setCategoryListPanelVisible(true)
            this.categoryDetail.isShow = true
        },
        // 二级分类下拉框鼠标滑出
        categoryListMouseLeave() {
        },
        // 二级分类列表容器鼠标滑出
        categoryItemListMouseLeave() {
            if (this.categoryDetail.isScroll) {
                this.setCategoryListPanelVisible(false)
            }
        },
        // 返回顶部点击回调
        listScrollToTopClick() {
            // this.categoryDetail.isScroll = false
            this.$refs.listDetailContentWrap.myScroll.scrollToTop()
        },
        // 打开筛选框
        openCondition() {
            const show = !Vue.store.state.layout.materialMoreConfig.show
            Vue.store.commit('MATERIAL_MORE_CHANGE', { show })
        },
        goBack() {
            this.search.keyWord = ''
            this.search.status = false
        },
        getHotList() {
            this.categoryListShow.map(item => {
                this.categoryListByIdTop3(item).list.map(obj => {
                    obj.itemId = item.id
                    this.hotList.push(obj)
                })
            })
        }
    }
}
</script>

<style lang="scss">
.eqc-nav-material-menu {
    position: relative;
    background-color: #ffffff;
    height: calc(100% - 48px);
    .eqc-search {
        padding: 0 16px;
    }
    .content {
        position: relative;
        height: calc(100% - 52px - 16px - 48px);
        margin-top: 16px;
        padding: 0 16px;
        background: #ffffff;
        .list {
            position: relative;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            .list-item {
                width: 100%;
                height: auto;
                margin-bottom: 16px;
                .list-item-head {
                    height: 31px;
                    span {
                        height: 100%;
                        display: inline-block;
                        line-height: 34px;
                    }
                    :nth-child(1) {
                        float: left;
                    }
                    :nth-child(2) {
                        padding: 0 4px;
                        float: right;
                    }
                    .category-name {
                        font-family: HelveticaNeue-Bold;
                        font-size: 14px;
                        font-weight: bold;
                        color: rgba(17, 17, 17, 1);
                    }
                    .category-all {
                        cursor: pointer;
                        font-size: 11px;
                        color: #252b3f;
                        i {
                            transform: rotate(0deg);
                            float: none;
                            vertical-align: -3px;
                            margin-left: -4px;
                            color: #252b3f;
                            font-size: 16px;
                        }
                    }
                }
                .list-item-content {
                    height: 80px;
                }
            }
            :nth-child(1) {
                .list-item-head {
                    height: 20px;
                    span {
                        line-height: 12px;
                    }
                }
            }
        }
    }
    .info-box {
        font-size: 13px;
        font-weight: 600;
        color: #111;
        padding: 0px 16px;
        height: 40px;
        line-height: 40px;
        i {
            font-size: 16px;
        }
        .back {
            float: right;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: normal;
            color: #252b3f;
        }
    }
    .eqc-list-status {
        width: 100%;
    }
    .label-box {
        display: flex;
        justify-content: space-between;
        height: 40px;
        align-items: center;
        width: 100%;
        margin-top: 45px;
        .line {
            width: 80px;
            height: 1px;
            background: #ccd5db;
        }
        .text {
            font-size: 13px;
            font-weight: 600;
            color: #111;
        }
    }
    .content-search {
        position: relative;
        height: calc(100% - 52px - 100px);
        padding: 0px 16px;
        background: #ffffff;
        .list {
            position: relative;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            padding-bottom: 40px;
            .list-item {
                width: 100%;
                height: auto;
                margin-bottom: 5px;
                .list-item-head {
                    height: 31px;
                    span {
                        height: 100%;
                        display: inline-block;
                        line-height: 34px;
                    }
                    :nth-child(1) {
                        float: left;
                    }
                    :nth-child(2) {
                        padding: 0 4px;
                        float: right;
                    }
                    .category-name {
                        font-size: 14px;
                        font-weight: bold;
                        color: rgba(17, 17, 17, 1);
                    }
                    .category-all {
                        cursor: pointer;
                        font-size: 11px;
                        i {
                            transform: rotate(0deg);
                            float: none;
                            vertical-align: -3px;
                            margin-left: -4px;
                            color: #76838f;
                            font-size: 16px;
                        }
                    }
                }
                .list-item-content {
                    height: 80px;
                }
            }
            :nth-child(1) {
                .list-item-head {
                    height: 20px;
                    span {
                        line-height: 12px;
                    }
                }
            }
            .eqc-list-status-infinite {
                background-color: rgba(0, 0, 0, 0);
            }
        }
    }
    .list-detail {
        position: absolute;
        right: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: #fff;
        .list-detail-head {
            height: 60px;
            width: calc(100% - 32px);
            // border-bottom: 1px solid #eceef0;
            margin: 0 16px;
            .left-span {
                padding: 0;
            }
            span {
                height: 100%;
                display: inline-block;
                line-height: 60px;
            }
            :nth-child(1) {
                float: left;
                .category-detail {
                    width: 140px;
                    margin-top: 12px;
                    font-size: 14px;
                    color: #2f3c4d;
                    cursor: pointer;
                    .current {
                        position: relative;
                        width: 100%;
                        height: 36px;
                        line-height: 34px;
                        padding: 0 28px 0 12px;
                        background: #f0f3f4;
                        text-overflow: ellipsis;
                        overflow: hidden;
                        white-space: nowrap;
                        border-radius: 3px;
                        // border: 1px solid rgba(204, 213, 219, 1);
                        span {
                            background: none;
                            line-height: inherit;
                            color: #000000;
                            font-size: 16px;
                            font-weight: 400;
                        }
                        .icon {
                            position: absolute;
                            right: 0;
                            top: 0;
                            width: 34px;
                            height: 34px;
                            font-size: 24px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #76838f;
                        }
                    }
                }
            }
            :nth-child(2) {
                float: right;
                label {
                    cursor: pointer;
                    padding: inherit;
                    i {
                        margin-right: -8px;
                        color: #76838f;
                        float: none;
                        line-break: 0px;
                        font-size: 22px;
                        vertical-align: -5px;
                    }
                }
            }
            .category-name {
                font-size: 18px;
                color: rgba(0, 0, 0, 1);
                font-weight: 600;
            }
            .category-condition {
                color: #252b3f;
                margin-right: 12px;
                &:hover {
                    color: #1593ff;
                }
            }
            .category-close {
                font-size: 14px;
                font-weight: 400;
                color: #252b3f;
            }
        }
        .list-detail-category {
            width: 100%;
            height: auto;
            background: #fff;
            transition: all 0.2s;
            padding: 0 8px;
            .detail {
                display: flex;
                flex-wrap: wrap;
                position: relative;
                background: #fff;
                overflow: hidden;
                padding: 0 8px;
                transition: all 0.2s;
                .item {
                    // width: 64px;
                    height: 28px;
                    line-height: 14px;
                    font-size: 12px;
                    color: #252b3f;
                    text-align: center;
                    cursor: pointer;
                    z-index: 1;
                    background: #f0f3f4;
                    border-radius: 2px;
                    transition: all 0.3s;
                    padding: 6px 8px;
                    margin-right: 12px;
                    &:hover,
                    &.active {
                        background: rgba(21, 147, 255, 1);
                        color: white;
                    }
                }
                .more {
                    padding: 6px 12px;
                    font-size: 16px;
                }
            }
            .category-rest-box {
                position: absolute;
                top: 142px;
                left: 0;
                width: 288px;
                box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
                border-radius: 2px;
                background: white;
                z-index: 4;
                // padding: 16px;
                overflow: hidden;
                transition: all 0.3s;
                .title {
                    font-size: 13px;
                    font-weight: 600;
                    color: #111;
                    line-height: 18px;
                    padding: 16px 16px 0 16px;
                }
                .content {
                    display: flex;
                    flex-wrap: wrap;
                    margin-top: 0;
                    padding: 0 16px;
                    .item {
                        height: 28px;
                        line-height: 14px;
                        font-size: 12px;
                        color: #252b3f;
                        text-align: center;
                        cursor: pointer;
                        z-index: 1;
                        background: #f0f3f4;
                        border-radius: 2px;
                        transition: all 0.3s;
                        padding: 6px 8px;
                        margin-right: 12px;
                        margin-top: 12px;
                        &:hover,
                        &.active {
                            background: rgba(21, 147, 255, 1);
                            color: white;
                        }
                    }
                }
            }
        }
        .list-detail-content {
            width: 100%;
            position: relative;
            height: calc(100% - 60px - 16px);
            padding: 0 16px;
            .list {
                position: relative;
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
                padding-bottom: 40px;
                .eqc-list-status-infinite {
                    background-color: rgba(0, 0, 0, 0);
                }
            }
        }
        .toTop {
            position: absolute;
            bottom: -44px;
            right: 8px;
            transition: transform 0.3s linear;
        }
    }
}
</style>
