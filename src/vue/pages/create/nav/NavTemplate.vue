<template>
    <div class="eqc-nav-template">
        <!-- 顶部分类组件 -->
        <base-tab
            :list="categoryTabList"
            :selected-item="categoryTabListSelected"
            class="transition"
            @select="selectedCategoryTab"
        />
        <!-- 顶部右侧设置组件 -->
        <base-config
            @configMove="configMousemove"
        />
        <!-- 搜索组件 -->
        <base-search
            v-show="isSys"
            ref="baseSearch"
            :model="search"
            :om-mousedown="onSearchMousedown"
            :on-search="onSearch"
            model-key="keyWord"
        />
        <div
            v-if="searchState&&categoryTabListSelected.type===categoryTabList[0].type"
            class="search-result-info"
        >
            <label class="result">搜索结果({{ info.count===-1?'...':info.count }})</label>
            <label
                class="return"
                @click="closeSearch()"
            ><i class="icon eqf-left" />返回</label>
        </div>
        <!-- 固定颜色选择面板 -->
        <div
            v-if="showSearchCondition && categoryTabListSelected.type==='new'"
            :style="`height:${searchState?'56px':'60px'};`"
            class="condition-bar flex-center"
        >
            <condition-bar
                :style="`margin-top:${searchState?'12px;':'16px;'}`"
                :condition="condition"
            />
        </div>
        <div
            ref="wrap"
            v-scroll-bar="{onScrollMove}"
            :class="{sys: isSys,search:searchState}"
            class="content"
            :style="`margin-top:${isSys?(searchState?'12px':'16px'):'0px'};`"
        >
            <!-- 条件展示模板 -->
            <ul
                ref="list"
                class="list"
            >
                <div
                    class="wrraper"
                >
                    <!-- 属性展示模板 -->
                    <div
                        v-if="isSys && !searchState&&templateConfig.recommendAuthor"
                        class="attribute"
                    >
                        <div
                            v-for="(item,i) in filterAttributeList"
                            :key="i"
                        >
                            <div class="list-item-head">
                                <div class="attribute-name">
                                    {{ item.attrName }}
                                </div>
                                <div
                                    class="attribute-all pointer flex-center"
                                    @click="showAllClick(item)"
                                >
                                    <p>更多</p>
                                    <i
                                        class="icon eqf-right"
                                    />
                                </div>
                            </div>
                            <ul
                                v-show="item.attrResultMap.pageResutInfo.dataList"
                                class="list"
                            >
                                <template-item
                                    v-for="(tmp, index) of item.attrResultMap.pageResutInfo.dataList"
                                    :key="index"
                                    :item="tmp"
                                    :item-css="attributeItemCss"
                                    :tab-list="categoryTabList"
                                    :is-two-col="false"
                                    :is-sys="isSys"
                                    :is-buy="isBuy"
                                    :is-collect="isCollect"
                                    :eqx-scene="eqxScene"
                                    :eqx-page="eqxPage"
                                />
                            </ul>
                        </div>
                    </div>
                    <!-- 全部模板 -->
                    <div
                        v-if="isSys"
                        class="sort-condition"
                    >
                        <span
                            v-if="!searchState && keepTitle && type !== 0 && templateConfig.recommendAuthor"
                            class="title"
                        >全部模板</span>
                        <div
                            v-if="type === 0"
                            class="box"
                        >
                            <span>当前作品为自定义尺寸</span>
                            <span>为您推荐以下相近尺寸的模板</span>
                        </div>
                        <condition-bar :condition="condition" />
                    </div>
                </div>
                <base-list-status
                    v-if="!info.list.length && searchState"
                    :style="`width:100%;margin-top:9px;bottom:-25px;`"
                    :is-busy="info.isBusy"
                    :is-empty="!info.isBusy && !info.list.length"
                    :msg-css="msgCss"
                    msg-result="暂无模板"
                />
                <div
                    v-if="searchState && info.list.length===0"
                    class="hot-template"
                >
                    <span>热门模板</span>
                </div>
                <template-item
                    v-for="item of getInfoList()"
                    :key="item.id"
                    :item="item"
                    :item-css="itemCss"
                    :tab-list="categoryTabList"
                    :is-two-col="isTwoCol"
                    :is-sys="isSys"
                    :is-buy="isBuy"
                    :is-collect="isCollect"
                    :eqx-scene="eqxScene"
                    :eqx-page="eqxPage"
                />
                <div class="padding-bottom" />
                <!-- 常规列表最后提示 -->
                <base-list-status-infinite
                    v-if="info.list.length && (info.isBusy || info.isEnd)"
                    :is-busy="info.isBusy"
                    :is-end="info.isEnd"
                    :bg-color="'rgba(255,255,255,1)'"
                />
                <!-- 搜索热门最后提示 -->
                <base-list-status-infinite
                    v-if="searchState && hotInfo.list.length && (hotInfo.isBusy || hotInfo.isEnd)"
                    :is-busy="hotInfo.isBusy"
                    :is-end="hotInfo.isEnd"
                    :bg-color="'rgba(255,255,255,1)'"
                />
                <div
                    v-if="isSys && showFixer"
                    :style="{height:fixHeight+'px'}"
                    class="fixer"
                >
                    <span v-if="fixHeight"> 加载中...</span>
                </div>
            </ul>
            <base-list-status
                v-if="!info.list.length && !searchState"
                :is-busy="info.isBusy"
                :is-empty="!info.isBusy && !info.list.length"
                msg-result="暂无模板"
            />
            <list-scroll-to-top
                :style="listScrollToTopStyle"
                :click="listScrollToTopClick"
                :text="topBall.text"
                :show-icon-flag="topBall.showIconFlag"
                :css="topBall.css"
                class="toTop"
            />
        </div>
        <!-- 展示点击全部之后的详情页 -->
        <template-detail :detail="detail" />
        <!-- footer -->
        <template-footer ref="templateFooter" />
    </div>
</template>

<script>
import templateItem from './NavTemplateItem.vue'
import templateDetail from './template/TemplateDetail.vue'
import conditionBar from './template/ConditionBar.vue'
import ListScrollToTop from '../../../plugins/ListScrollToTop.vue'
import sceneMatchType from '../../../../config/enum.sceneMatch.type'
import TemplateFooter from './template/TemplateFooter.vue'
export default {
    components: {
        templateItem, templateDetail, conditionBar, ListScrollToTop, TemplateFooter
    },
    data() {
        return {
            // 顶部分类数组
            categoryTabList: [{
                name: '模板库',
                type: 'new'
            }, {
                name: '已购买',
                type: 'buy-template'
            }, {
                name: '已收藏',
                type: 'collect-template'
            }],
            // 顶部分类选中项
            categoryTabListSelected: null,
            itemCss: { isBusy: false },
            attributeItemCss: {},
            isTwoCol: false, // 模板是否显示两列，默认是一列
            info: {
                list: []
            },
            // 热门模板数据
            hotInfo: {
                list: []
            },
            search: {
                keyWord: ''
            },
            key: '', // 加载列表用的key
            // 模拟属性数据
            attributeList: [],
            detail: {
                id: '',
                type: '',
                show: false,
                showTips: true,
                showCondition: false
            },
            condition: {
                mostType: 'composite', // 排序: composite 综合排序 newest 最新 hottest 最热
                freeState: false,
                memberFreeState: false,
                color: '' // 颜色
            },
            showSearchCondition: false, // 控制查询条件是否显示
            searchState: false, // 查询状态 true 已经查询 false未查询
            heightRecord: 0, // 记录下滑到哪儿了
            maxHeight: 0,
            fixHeight: 0,
            showFixer: false,
            typeChange: false,
            topBall: {
                text: '置顶',
                showIconFlag: true,
                css: null,
                tmpCss: {
                    lineHeight: '17px',
                    padding: '4px'
                }
            },
            isScroll: false,
            categories: [],
            matchType: 0,
            // 暂无模板样式
            msgCss: {
                fontSize: '18px',
                color: '#333333',
                fontWeight: '600'
            }
        }
    },
    computed: {
        scene() {
            return this.$store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        eqxScene() {
            return this.scene.eqxScene
        },
        sceneJson() {
            return this.eqxScene.sceneJson
        },
        type() {
            return this.sceneJson.type
        },
        changeSizeState() {
            return this.scene.changeSizeState
        },
        isSys() {
            return this.categoryTabListSelected.type === this.categoryTabList[0].type
        },
        isBuy() {
            return this.categoryTabListSelected.type === this.categoryTabList[1].type
        },
        isCollect() {
            return this.categoryTabListSelected.type === this.categoryTabList[2].type
        },
        userInfo() {
            return this.$store.state.user.userInfo
        },
        matchCategory() {
            return this.scene.matchCategory
        },
        filterAttributeList() {
            if (this.type === 0) {
                return []
            }
            return this.attributeList.filter(item => {
                if (item.attrResultMap) {
                    if (this.isTwoCol) {
                        return item.attrResultMap.pageResutInfo.dataList.length === 3
                    } else {
                        return item.attrResultMap.pageResutInfo.dataList.length === 2
                    }
                } else {
                    return false
                }
            })
        },
        // 返回顶部样式
        listScrollToTopStyle() {
            if (this.isScroll) {
                return {
                    transform: `translate(0,${this.isSys ? -60 : -90}px)`
                }
            }
            return {}
        },
        keepTitle() {
            let count = 0
            this.attributeList.map(item => {
                if (item.attrResultMap) {
                    if (this.isTwoCol) {
                        if (item.attrResultMap.pageResutInfo.dataList.length >= 3) {
                            count++
                        }
                    } else {
                        if (item.attrResultMap.pageResutInfo.dataList.length >= 2) {
                            count++
                        }
                    }
                }
            })
            return count
        },
        layout() {
            return this.$store.state.layout
        },
        itemClickEvent() {
            return this.layout.nav.itemClickEvent
        },
        // 模板颜色选择
        templateColorPanel() {
            return this.layout.templateColorPanel
        },
        // 模板配置
        templateConfig() {
            return this.layout.templateConfig
        },
        // 模板分类
        templateCateogry() {
            return this.layout.templateCateogry
        },
        // 刷新模板收藏列表
        refreshTemplateCollectListState() {
            return this.layout.refreshTemplateCollectListState
        }
    },
    watch: {
        itemClickEvent() {
            this.detail.show = false
        },
        type(newVal) {
            this.categoryTabListSelected = this.categoryTabList[0]
            this.setAttributeItemCss(this.eqxScene.sceneJson)
            this.init()
        },
        condition: {
            handler(newVal) {
                this.getProducts() // 刷新数据
            },
            deep: true
        },
        'info.isBusy': function (newVal) {
            if (!this.searchState) {
                if (newVal && this.info.pageNo < 2) {
                    this.showFixer = true
                    this.fixHeight = this.maxHeight - this.heightRecord
                } else {
                    this.showFixer = false
                    this.fixheight = 0
                }
            }
        },
        changeSizeState(newVal, oldVal) {
            this.categoryTabListSelected = this.categoryTabList[0]
            this.setAttributeItemCss(this.eqxScene.sceneJson)
            this.init()
        },
        'templateColorPanel.colorSelectedVal': {
            handler(newVal) {
                this.condition.color = newVal
                this.getProducts() // 刷新数据
            },
            deep: true
        },
        'detail.show': {
            handler(newVal) {
                const mode = newVal ? 2 : 1
                if (mode === 1) {
                    // 去除选中项
                    Vue.store.commit('TEMPLATE_CATEGORY', { selectedCategoryItem: { id: null } })
                }
            },
            deep: true
        },
        'templateCateogry.selectedCategoryItem': {
            handler(newVal) {
                if (newVal.id === null) {
                    return
                }
                this.detail.show = true
                this.detail.title = newVal.name
                this.detail.id = newVal.id
                this.detail.type = this.type
                this.showSearchCondition = false
            },
            deep: true
        },
        'info.list': {
            handler(newVal) {
                if (this.searchState && newVal.length === 0) {
                    const isHotTemplate = true
                    this.getProducts(isHotTemplate)
                }
            }
        },
        // 刷新模板收藏列表
        refreshTemplateCollectListState() {
            // 删除之后触发 然后刷新列表
            if (this.categoryTabListSelected.type === 'collect-template') {
                this.getProducts()
            }
        }
    },
    created() {
        // 从别的nav切换过来时执行
        this.categoryTabListSelected = this.categoryTabList[0]
        this.setItemCss(this.eqxScene.sceneJson)
        this.setAttributeItemCss(this.eqxScene.sceneJson)
        this.init()
    },
    methods: {
        selectedCategoryTab(pItem) {
            if (!this.userInfo.id && pItem.type === 'buy-template') {
                this.notifier.info('已购买模板需登录后才能查看')
                return
            }
            if (!this.userInfo.id && pItem.type === 'collect-template') {
                this.notifier.info('已收藏模板需登录后才能查看')
                return
            }
            this.categoryTabListSelected = pItem
            this.getProducts()
        },
        // 右上角设置鼠标move事件
        configMousemove() {
            Vue.store.commit('TEMPLATE_CONFIG', { show: true })
        },
        updatePages(pPageIndex = 0) {
            const promist = new Promise((resolve, reject) => {
                const page = this.eqxScene.eqxPages[pPageIndex]
                if (page) {
                    this.loading.open('正在智能调整中，请稍后...')
                    const $elWorkspace = this.eqxPage.$el.parentElement
                    Vue.store.commit('PAGE_CHANGE', { eqxPage: page })
                    setTimeout(() => {
                        page.setScale('changeCategoryFit', $elWorkspace.offsetWidth, $elWorkspace.offsetHeight)
                        Vue.store.dispatch('PAGE_SAVE', { eqxPage: page, needCover: true })
                        this.loading.close()
                        resolve()
                        this.sceneJson.oldHeight = this.sceneHeight
                        this.sceneJson.oldWidth = this.sceneWidth
                    }, 500)
                }
            })
            promist.then((res) => {
                this.updatePages(pPageIndex + 1)
            })
        },
        loadAllSceneCategory() {
            this.api.banner.getSceneBanners()
                .then(res => {
                // 将所有的分类取出来
                    const list = [].concat(...res.data.list.slice(1).map(item => item.list))
                    list.forEach(item => {
                        this.categories.push({
                            type: item.type,
                            width: item.unit === 'px' ? item.width : Vue.filter('mm2px')(item.width, item.unit),
                            height: item.unit === 'px' ? item.height : Vue.filter('mm2px')(item.height, item.unit),
                            scale: item.width / item.height,
                            name: item.name,
                            unit: item.unit || 'px'
                        })
                    })
                    this.loadSimilarTemplate()
                })
        },
        loadSimilarTemplate() {
            // 匹配相似度，优先匹配scale的误差值 然后是width和height 的误差值
            const { width, height } = Vue.store.state.scene.eqxScene.sceneJson
            let min = 10000000
            let minScale = 1000000
            const scaleObj = {}
            const hwObj = {}
            this.categories.map(item => {
                const w = Math.abs(item.width - width) // 宽度的误差值
                const h = Math.abs(item.height - height) // 高度的误差值
                if (w + h < min) {
                    min = w + h
                    hwObj.type = item.type
                    hwObj.width = item.width
                    hwObj.height = item.height
                }
                if (Math.abs(item.width / item.height - width / height) <= minScale) {
                    if (scaleObj.width) {
                        // 同等比例下， 匹配谁的宽高更接近
                        if (Math.abs(scaleObj.width - width) + Math.abs(scaleObj.height - height) > Math.abs(item.width - width) + Math.abs(item.height - height)) {
                            minScale = Math.abs(item.width / item.height - width / height)
                            scaleObj.type = item.type
                            scaleObj.width = item.width
                            scaleObj.height = item.height
                        }
                    } else {
                        minScale = Math.abs(item.width / item.height - width / height)
                        scaleObj.type = item.type
                        scaleObj.width = item.width
                        scaleObj.height = item.height
                    }
                }
            })
            let matchObj = null
            if (scaleObj.width / width > 0.7 && scaleObj.width / width < 1.3) {
                matchObj = this.checkSceneMatch(scaleObj)
                this.matchType = scaleObj.type
            } else {
                matchObj = this.checkSceneMatch(hwObj)
                this.matchType = hwObj.type
            }
            Vue.store.commit('MATCH_CATEGORY', matchObj)
            this.setItemCss(matchObj)
            this.getProducts()
        },
        checkSceneMatch(obj) {
            // 匹配相似场景值
            const env = Vue.env.docker
            if (['product', 'stage'].includes(env)) {
                const value = sceneMatchType[env][obj.type]
                if (value) {
                    obj.type = value
                }
            }
            return obj
        },
        getAttrAllHeight() {
            // 推荐行有几列
            const count = this.isTwoCol ? 3 : 2
            // 单个推荐行高度
            const singleAttrheight = this.isTwoCol ? (parseInt(this.attributeItemCss.height) + 40) : (parseInt(this.attributeItemCss.height) * count + count * 8 + 32)
            // 推荐模板高度
            let attrbuteBoxHeight = 0
            if (this.templateConfig.recommendAuthor) {
                attrbuteBoxHeight = singleAttrheight * this.filterAttributeList.length
            }
            // 搜索框高度
            const searchInputHeight = 36
            return this.searchState ? searchInputHeight : attrbuteBoxHeight + searchInputHeight
        },
        initTopBall() {
            // 初始化小球  计算屏幕的高度 如果小于属性+全部模板（不包括下面的模板，仅条件）说明属性把屏幕遮挡完了 展示全部模板 否则不展示
            const screenHeight = document.body.clientHeight
            const maxHeight = this.getAttrAllHeight()
            if (maxHeight > screenHeight) {
                this.showTopBall(true)
            } else {
                this.showTopBall(false)
            }
        },
        showTopBall(flag) {
            // true 展示全部模板 false 展示 置顶
            if (flag) {
                this.topBall.text = '全部模板'
                this.topBall.showIconFlag = false
                this.topBall.css = JSON.parse(JSON.stringify(this.topBall.tmpCss))
                this.isScroll = true
            } else {
                this.topBall.text = '置顶'
                this.topBall.showIconFlag = true
                this.topBall.css = null
            }
        },
        showAllClick(item) {
            this.detail.show = true
            this.detail.title = item.attrName
            this.detail.id = item.attrValue
            this.detail.type = this.type
        },
        loadAttrData() {
            // 加载属性列表
            const that = this
            let pageSize = 3
            if (!this.isTwoCol) {
                pageSize = 2
            }
            return new Promise((resolve, reject) => [
                Vue.api.product.defaultPropertiesSearch(this.type, pageSize).then(data => {
                    that.attributeList = data.data.list
                    this.initTopBall() // 计算是否需要展示全部模板
                    resolve(true)
                }).catch(err => {
                    console.log(err)
                    resolve(false)
                })
            ])
        },
        init() {
            this.loadAttrData().then(() => {
                // 自定义类型时，没有模板
                if (this.type === 0) {
                    setTimeout(() => {
                        this.loadAllSceneCategory() // 延迟一点再进行匹配  等scene改变完毕之后
                    }, 200)
                } else {
                    this.setItemCss(this.eqxScene.sceneJson)
                    this.getProducts()
                }
            })
        },
        setItemCss(sceneJson) {
            const defaultSize = {
                itemWidthOfOneCol: 256,
                itemWidthOfTwoCol: 124
            }
            const ratio = sceneJson.width / sceneJson.height
            let newWidth = 0
            let newHeight = 0
            if (ratio > 8 / 5) {
                newWidth = defaultSize.itemWidthOfOneCol
                this.isTwoCol = false
            } else {
                newWidth = defaultSize.itemWidthOfTwoCol
                this.isTwoCol = true
            }
            newHeight = newWidth / ratio
            this.itemCss = {
                width: newWidth + 'px',
                height: newHeight + 'px',
                size: Math.max(newWidth, newHeight)
            }
        },
        setAttributeItemCss(sceneJson) {
            if (this.type !== 0) {
                const defaultSize = {
                    itemWidthOfOneCol: 256,
                    itemWidthOfTwoCol: 80
                }
                const ratio = sceneJson.width / sceneJson.height
                let newWidth = 0
                let newHeight = 0
                if (ratio > 8 / 5) {
                    newWidth = defaultSize.itemWidthOfOneCol
                    this.isTwoCol = false
                } else {
                    newWidth = defaultSize.itemWidthOfTwoCol
                    this.isTwoCol = true
                }
                newHeight = newWidth / ratio
                this.attributeItemCss = {
                    width: newWidth + 'px',
                    height: newHeight + 'px',
                    size: Math.max(newWidth, newHeight)
                }
            }
        },
        onSearch() {
            if (this.search.keyWord !== '') {
                this.searchState = true
                this.$refs.templateFooter.setMode(2)
            } else {
                this.searchState = false
                this.$refs.templateFooter.setMode(1)
            }
            this.getProducts()
        },
        onSearchMousedown() {
            Vue.store.commit('TEMPLATE_CATEGORY', { show: false })
        },
        getProducts(pIsHotTemplate = false) {
            let params = {}
            if (this.isSys) {
                params = {
                    type: this.type === 0 ? this.matchType : this.type,
                    keyWord: this.search.keyWord,
                    mostType: this.condition.mostType,
                    free: this.condition.freeState ? 0 : '', // 免费传0  不免费就传空
                    memberFree: this.condition.memberFreeState ? 1 : 0,
                    color: this.condition.color
                }
            } else if (this.isBuy) {
                params = {
                    type: this.type
                }
            }
            // 添加userId参数
            if (this.userInfo && this.userInfo.id) {
                params.userId = this.userInfo.id
            }
            if (!pIsHotTemplate) {
                if (this.categoryTabListSelected.type === 'new') {
                    this.key = this.infiniteScroll.setKey(Object.assign(params, { tab: this.categoryTabListSelected.type }))
                } else {
                    // 如果是购买或者收藏加上一个随机数
                    this.key = this.infiniteScroll.setKey(Object.assign(params, { tab: this.categoryTabListSelected.type, randomId: Math.random() * 10000 }))
                }
                this.info = this.infiniteScroll.getInfo(this.key)
                if (!this.info.list.length) {
                    this.getNextPage()
                }
            } else {
                this.key = this.infiniteScroll.setKey(Object.assign(params, { tab: this.categoryTabListSelected.type }, { keyWord: '' }, { mostType: 'hottest' }))
                this.hotInfo = this.infiniteScroll.getInfo(this.key)
                if (!this.hotInfo.list.length) {
                    this.getNextPage()
                }
            }
        },
        onScrollMove(e, info) {
            this.heightRecord = info.scrollY
            this.maxHeight = info.maxScrollY
            if (info.scrollY / info.maxScrollY >= 2 / 3) {
                this.getNextPage()
            }
            const maxHeight = this.getAttrAllHeight()
            if (info.scrollY > maxHeight) {
                this.showSearchCondition = true
            } else {
                this.showSearchCondition = false
            }
            // 当 ‘全部模板’这个label漏出来的时候 全部模板变为置顶
            if (this.topBall.text === '全部模板') {
                const screenHeight = document.body.clientHeight - 105
                const labelHeight = this.getAttrAllHeight()
                if (labelHeight < screenHeight + info.scrollY) {
                    this.showTopBall(false)
                }
            }

            if (info.scrollY === 0) {
                this.isScroll = false
                this.initTopBall()
            } else {
                this.isScroll = true
            }
        },
        getNextPage() {
            this.infiniteScroll.getMoreItems(this.key).catch(err => err && this.logger.error(err))
        },
        // 返回顶部点击回调
        listScrollToTopClick() {
            if (this.topBall.text === '全部模板') {
                const scrollHeight = this.getAttrAllHeight(false, false) + 20 // 加20 是为了把‘全部模板’这几个字遮住
                this.$refs.list.style.transform = `translate3d(0px, -${scrollHeight}px, 0px)`
                this.$refs.wrap.myScroll.scrollY = scrollHeight
                this.showTopBall(false)
                this.isScroll = true
            } else {
                this.$refs.wrap.myScroll.scrollToTop()
                this.showSearchCondition = false
                setTimeout(() => {
                    this.isScroll = false
                    this.initTopBall()
                }, 300)
            }
        },
        // 搜索返回
        closeSearch() {
            this.$refs.baseSearch.cancel()
        },
        // 获取模板列表数据源 如果搜索状态下没有搜索到则使用热门数据源
        getInfoList() {
            if (this.searchState && this.info.list.length === 0) {
                return this.hotInfo.list
            } else {
                return this.info.list
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-nav-template {
    background-color: #ffffff;
    transition: all 0.3s;
    position: relative;
    .eqc-search {
        padding-top: 0px;
    }
    .content {
        position: relative;
        height: calc(100% - 61px - 16px);
        margin-top: 16px;
        padding: 0 16px;
        &.sys {
            height: calc(100% - 61px - 52px - 47px);
        }
        &.search {
            height: calc(100% - 21px - 52px - 117px);
        }
        .list {
            position: relative;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            padding-bottom: 16px;
            transition: all 0.3s;
            .eqc-template-item {
                box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.16);
                border-radius: 3px;
                &:hover {
                    box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.16);
                    background-color: red;
                }
            }
            .eqc-list-status-infinite {
                background-color: #ffffff;
            }
            .fixer {
                text-align: center;
                margin-top: 20px;
                width: 100%;
                font-size: 16px;
            }
            .wrraper {
                width: 100%;
                .attribute {
                    .list-item-head {
                        display: flex;
                        justify-content: space-between;
                        .attribute-name {
                            font-weight: bold;
                            font-size: 14px;
                            color: #111111;
                        }
                        .attribute-all {
                            font-size: 12px;
                            color: #252b3f;
                            .eqf-right {
                                font-size: 16px;
                                line-height: 14px;
                            }
                        }
                    }
                }
                .sort-condition {
                    .sort-list {
                        margin-top: 0px;
                        margin-bottom: 8px;
                    }
                    .title {
                        font-weight: bold;
                        font-size: 14px;
                        color: #111;
                        margin-bottom: 12px;
                        display: block;
                    }
                    .box {
                        widows: 256px;
                        height: 56px;
                        background: #f7f8f9;
                        border-radius: 3px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        font-size: 12px;
                        span {
                            margin-top: 6px;
                            letter-spacing: 1px;
                        }
                    }
                }
            }
            .hot-template {
                width: 100%;
                height: 18px;
                font-size: 13px;
                font-weight: 600;
                color: rgba(17, 17, 17, 1);
                margin-top: 49px;
                margin-bottom: 4px;
                line-height: 18px;
                position: relative;
                span {
                    text-align: center;
                    display: block;
                }
                span:before,
                span:after {
                    content: "";
                    position: absolute;
                    background: rgba(204, 213, 219, 1);
                    width: 80px;
                    height: 1px;
                    top: 9px;
                }
                span:before {
                    left: 0;
                }

                span:after {
                    right: 0;
                }
            }
            .padding-bottom {
                height: 40px;
                width: 100%;
            }
        }
        .toTop {
            position: absolute;
            bottom: -44px;
            right: 8px;
            transition: transform 0.3s linear;
        }
    }
    // 搜索结果信息
    .search-result-info {
        width: 100%;
        height: 18px;
        margin-top: 16px;
        padding: 0px 16px;
        line-height: 18px;
        .result {
            font-size: 13px;
            font-weight: 600;
            color: rgba(17, 17, 17, 1);
            float: left;
        }
        .return {
            font-size: 13px;
            color: rgba(37, 43, 63, 1);
            float: right;
            cursor: pointer;
            i {
                color: #252b3f;
                font-size: 18px;
                vertical-align: text-top;
            }
        }
    }
    .condition-bar {
        transition: all 0.5s;
        overflow: hidden;
        color: #76838f;
        // box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.08);
        position: absolute;
        z-index: 4;
        background: white;
        width: 100%;
        .tips {
            width: 150px;
            line-height: 36px;
            font-size: 12px;
            color: #76838f;
        }
        i {
            font-size: 20px;
        }
    }
    .flex-center {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .pointer {
        cursor: pointer;
    }
}
</style>
