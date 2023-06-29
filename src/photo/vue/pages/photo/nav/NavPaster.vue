<template>
    <div class="eqc-photo-paster">
        <!-- 搜索框 -->
        <div class="search">
            <base-search
                :model="search"
                :on-search="onSearch"
                model-key="keyWord"
            />
        </div>
        <!-- 查询列表 -->
        <div
            v-if="search.status"
            ref="searchListWrap"
            v-scroll-bar
            class="search-list"
        >
            <ul class="list-ul">
                <li
                    v-for="item in searchObj.list"
                    :key="item.id"
                    :style="{backgroundImage: getBackgroundImage(item.productTypeMap.path)}"
                    class="list-item"
                    @click="selectItem(item,item.type)"
                />
                <base-list-status-infinite
                    v-if="(searchObj.isBusy || searchObj.isEnd) && searchObj.list.length!==0"
                    :is-busy="searchObj.isBusy"
                    :is-end="searchObj.isEnd"
                    :bg-color="'rgba(255,255,255,1)'"
                />
            </ul>
            <base-list-status
                v-if="searchObj.list.length===0"
                :is-busy="searchObj.isBusy"
                :is-empty="!searchObj.isBusy"
                msg-result="暂无素材"
            />
        </div>
        <!-- 加一层div包裹起来避免查询的滚动条出不来 -->
        <div>
            <!-- 形状 -->
            <div
                v-if="!search.status"
                class="shape"
            >
                <div
                    class="header"
                    @click="toggleClick(1)"
                >
                    <span>{{ shape.name }}</span>
                    <span><i class="eqf-right" /></span>
                </div>
                <div class="content">
                    <div
                        v-for="item in shape.list"
                        :key="item.id"
                        :style="{backgroundImage: getBackgroundImage(item.productTypeMap.path)}"
                        class="item"
                        @click="selectItem(item,1)"
                    />
                </div>
            </div>
            <!-- 免扣素材 -->
            <div
                v-if="!search.status"
                class="shape"
            >
                <div
                    class="header"
                    @click="toggleClick(2)"
                >
                    <span>{{ material.name }}</span>
                    <span><i class="eqf-right" /></span>
                </div>
                <div class="content">
                    <div
                        v-for="item in material.list"
                        :key="item.id"
                        :style="{backgroundImage: getBackgroundImage(item.productTypeMap.path)}"
                        class="item"
                        @click="selectItem(item,2)"
                    />
                </div>
            </div>
        </div>
        <!-- 更多 -->
        <transition name="moveright">
            <div
                v-if="currentItem.state"
                class="list-detail"
            >
                <div class="header">
                    <span class="title">{{ currentItem.name }}</span>
                    <span
                        class="back"
                        @click="goBack"
                    ><i class="eqf-left" /> 返回</span>
                </div>
                <div
                    ref="listDetailContentWrap"
                    v-scroll-bar="{onScrollMove}"
                    class="list"
                >
                    <ul class="list-wrapper">
                        <li
                            v-for="item in info.list"
                            :key="item.id"
                            :style="{backgroundImage: getBackgroundImage(item.productTypeMap.path)}"
                            class="list-item"
                            @click="selectItem(item,chooseType)"
                        />
                        <base-list-status-infinite
                            v-if="info.isBusy || info.isEnd"
                            :is-busy="info.isBusy"
                            :is-end="info.isEnd"
                            :bg-color="'rgba(255,255,255,1)'"
                        />
                    </ul>
                    <base-list-status
                        v-if="!info.list"
                        :is-busy="info.isBusy"
                        :is-empty="!info.isBusy && !getNoRepeatInfoList.length"
                        :style="baseListStatusStyle"
                        msg-result="暂无素材"
                    />
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import loader from '../../../../../utils/loader'
import elementType from '../../../../../config/enum.element.type'
import historyType from '../../../../../config/enum.photoHistory.type'
export default {
    data() {
        return {
            historyType,
            search: {
                status: false,
                keyWord: '',
                placeholder: '搜索素材'
            },
            shape: {
                state: false,
                name: '形状',
                list: []
            },
            material: {
                state: false,
                name: '免扣素材',
                list: []
            },
            currentItem: { state: false },
            info: {},
            key: {},
            searchObj: {
                list: [],
                isBusy: false,
                isEnd: false
            },
            shapeCategoryId: 0,
            materialCategoryId: 0,
            chooseType: 1// 1 代表形状 2代表免扣素材
        }
    },
    computed: {
        thumbSize() {
            return 80
        },
        viewSize() {
            return 180
        },
        photoScene() {
            return Vue.store.state.photoScene
        },
        eqxScene() {
            return this.photoScene.eqxScene
        },
        eqxPage() {
            return this.photoScene.eqxPage
        },
        selectType() {
            return Vue.store.state.photoLayout.nav.selectedItem.type
        },
        photoHistory() { // 历史记录
            return Vue.store.state.photoHistory
        },
        itemClickEvent() {
            return Vue.store.state.photoLayout.nav.itemClickEvent
        }
    },
    watch: {
        itemClickEvent() {
            this.currentItem.state = false
        }
    },
    mounted() {
        this.shapeCategoryId = Vue.env.mall.shapeCategoryId
        this.materialCategoryId = Vue.env.mall.materialCategoryId
        this.getSearchProducts(this.shapeCategoryId, 3).then(data => {
            this.shape.list = data.data.list
        })
        this.getSearchProducts(this.materialCategoryId, 3).then(data => {
            this.material.list = data.data.list
        })
    },
    methods: {
        onSearch() {
            if (this.search.keyWord) {
                this.search.status = true
            } else {
                this.search.status = false
            }
            if (this.search.status) {
                this.searchObj.list = []
                const promiseShape = this.getSearchProducts(this.shapeCategoryId, 1000)
                const promiseMaterial = this.getSearchProducts(this.materialCategoryId, 1000)
                this.searchObj.isBusy = true
                this.searchObj.isEnd = false
                Promise.all([promiseShape, promiseMaterial]).then(([data1, data2]) => {
                    data1.data.list.map(item => {
                        item.type = 1
                    })
                    data2.data.list.map(item => {
                        item.type = 2
                    })
                    this.searchObj.list = [...data1.data.list, ...data2.data.list]
                    this.searchObj.isBusy = false
                    this.searchObj.isEnd = true
                    setTimeout(() => this.$refs.searchListWrap.myScroll.refresh(), 1000)
                })
            }
        },
        toggleClick(type) {
            this.chooseType = type
            if (type === 1) {
                this.shape.state = !this.shape.state
                this.currentItem = this.shape
                this.getProducts(this.shapeCategoryId)
            } else if (type === 2) {
                this.material.state = !this.material.state
                this.currentItem = this.material
                this.getProducts(this.materialCategoryId)
            }
        },
        // 获取搜索商品
        getSearchProducts(categoryId, pageSize) {
            const tab = 'sys'
            const params = {
                categoryId: categoryId,
                apiCode: 94231,
                keyWord: this.getKeyWords(),
                pageNo: 1,
                pageSize: pageSize || 100
            }
            return Vue.api.product.getNewProducts(Object.assign(params, { tab }))
        },
        // 获取搜索关键字
        getKeyWords() {
            if (this.search.status) {
                return this.search.keyWord
            }
            return ''
        },
        getBackgroundImage(src) {
            return Vue.filter('backgroundImage')(src)
        },
        // 选中贴纸
        selectItem(item, type) {
            // 选中免扣素材
            if (item.productTypeMap.path.indexOf('.svg') > -1) {
                // 添加形状
                this.getSvg(item.productTypeMap.path)
                    .then(svg => {
                        this.addShapeElement('click', item.productTypeMap.path, 0, 0, svg.items, svg.width, svg.height)
                    })
            } else {
                const src = this.getQiniuImage(item.productTypeMap.path)
                loader.image(src)
                    .then(img => {
                        this.addImageElement('click', img, item.productTypeMap.path)
                    })
            }
        },
        goBack() {
            this.currentItem.state = false
        },
        // 根据当前选择的二级分类的id获取素材
        getProducts(categoryId) {
            const tab = 'sys'
            const params = {
                categoryId: categoryId,
                apiCode: 94231,
                keyWord: this.getKeyWords()
            }
            this.key = Vue.infiniteScroll.setKey(Object.assign(params, { tab }))
            this.info = Vue.infiniteScroll.getInfo(this.key)
            if (!this.info.list.length) {
                this.getNextPage()
            }
            setTimeout(() => this.$refs.listDetailContentWrap.myScroll.refresh(), 100)
        },
        // 二级分类内容区滚动 和 搜索内容区滚动
        onScrollMove(e, info) {
            if (info.scrollY / info.maxScrollY >= 2 / 3) {
                this.getNextPage()
            }
        }, // 获取下一页数据
        getNextPage() {
            Vue.infiniteScroll.getMoreItems(this.key)
                .catch(err => err && this.logger.error(err))
        },
        getSvg(src) {
            return loader.svg(src)
                .then($svg => {
                    const width = parseFloat($svg.attr('width'))
                    const height = parseFloat($svg.attr('height'))
                    return { $svg, width, height }
                })
        },
        addShapeElement(type, src, left = 0, top = 0, items, width, height, ignoreFlag) {
            const scale = this.eqxPage.scale
            const viewScale = width / height
            let newWidth = 0
            let newHeight = 0
            if (viewScale > 1) {
                newWidth = this.viewSize / scale
                newHeight = newWidth / viewScale
            } else {
                newHeight = this.viewSize / scale
                newWidth = newHeight * viewScale
            }
            if (type === 'click') {
                const result = this.eqxPage.getElementPosOfCenter(newWidth, newHeight, scale)
                left = result.left
                top = result.top
            }
            const elementJson = {
                type: elementType.photoShape,
                property: {
                    items,
                    url: src,
                    dropShadow: {
                        color: 'rgba(0,0,0,0)',
                        x: 0,
                        y: 0,
                        blur: 0,
                        transparency: 100
                    },
                    borderRadius: {
                        lt: true,
                        rt: true,
                        lb: true,
                        rb: true,
                        val: 0
                    },
                    gradient: {
                        angle: 90,
                        colors: { 0: '#5D61FF', 1: '#FF15F5' },
                        enabled: false
                    }
                },
                css: {
                    left: Math.round(left) + 'px',
                    top: Math.round(top) + 'px',
                    width: ignoreFlag ? Math.round(width) + 'px' : Math.round(newWidth) + 'px',
                    height: ignoreFlag ? Math.round(height) + 'px' : Math.round(newHeight) + 'px'
                }
            }
            if (this.showComponentWarning) {
                Vue.notifier.warn('APP和小程序无法支持svg文件', 8)
            }
            this.eqxPage.addElement(elementJson)
            // this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        getQiniuImage(src) {
            return Vue.filter('qiniuZoom')(src, this.thumbSize)
        },
        addImageElement(type, img, src, left = 0, top = 0, width, height, ignoreFlag) {
            const scale = this.eqxPage.scale
            const viewScale = img.width / img.height
            let newWidth = 0
            let newHeight = 0
            if (viewScale > 1) {
                newWidth = this.viewSize / scale
                newHeight = newWidth / viewScale
            } else {
                newHeight = this.viewSize / scale
                newWidth = newHeight * viewScale
            }
            if (type === 'click') {
                const result = this.eqxPage.getElementPosOfCenter(newWidth, newHeight, scale)
                left = result.left
                top = result.top
            }
            let isSvg = false
            if (src.indexOf('.svg') > -1) {
                isSvg = true
            }
            const elementJson = {
                type: elementType.photoImage,
                property: {
                    src,
                    dropShadow: {
                        color: 'rgba(0,0,0,0)',
                        x: 0,
                        y: 0,
                        blur: 0,
                        transparency: 100
                    },
                    borderRadius: {
                        lt: true,
                        rt: true,
                        lb: true,
                        rb: true,
                        val: 0
                    },
                    isSvg
                },
                css: {
                    left: Math.round(left) + 'px',
                    top: Math.round(top) + 'px',
                    width: ignoreFlag ? Math.round(width) + 'px' : Math.round(newWidth) + 'px',
                    height: ignoreFlag ? Math.round(height) + 'px' : Math.round(newHeight) + 'px',
                    border: '1px solid transparent'
                }
            }
            this.eqxPage.addElement(elementJson)
            // this.eqxPage.eqxHistory.add(this.eqxPage)
        }
    }
}
</script>
<style lang="scss">
.eqc-photo-paster {
    // padding: 0px 16px;
    transition: all 0.3s;
    position: relative;
    .shape {
        padding: 14px 16px;
        .header {
            display: flex;
            justify-content: space-between;
            height: 18px;
            cursor: pointer;
            font-size: 13px;
            line-height: 18px;
            color: #111111;
            font-weight: 600;
            i {
                font-size: 16px;
            }
        }
        .content {
            display: flex;
            justify-content: space-between;
            margin-top: 12px;
            .item {
                width: 80px;
                height: 80px;
                background: #ffffff center/contain no-repeat;
                border-radius: 3px;
                box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.16);
                cursor: pointer;
                &:hover {
                    box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.16);
                }
            }
        }
    }
    .search-list {
        width: 100%;
        position: relative;
        height: calc(100% - 66px);
        padding: 16px;
        .list-ul {
            position: relative;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            padding-bottom: 40px;
            .list-item {
                width: 80px;
                height: 80px;
                background: #f6f9fa center/contain no-repeat;
                margin-bottom: 8px;
                cursor: pointer;
            }
            .eqc-list-status-infinite {
                background: #fff !important;
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
        .header {
            height: 60px;
            width: calc(100% - 32px);
            border-bottom: 1px solid #eceef0;
            margin: 0 16px;
            display: flex;
            justify-content: space-between;
            line-height: 60px;
            .title {
                font-size: 18px;
                font-weight: 600;
                color: #000;
            }
            .back {
                font-size: 14px;
                font-weight: 400;
                color: #76838f;
                cursor: pointer;
                i {
                    font-size: 22px;
                    vertical-align: -5px;
                    margin-right: -6px;
                }
            }
        }
        .list {
            width: 100%;
            position: relative;
            height: calc(100% - 72px);
            padding: 16px;
            .list-wrapper {
                position: relative;
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
                padding-bottom: 40px;
                .list-item {
                    width: 80px;
                    height: 80px;
                    background: #f6f9fa center/contain no-repeat;
                    margin-bottom: 8px;
                    cursor: pointer;
                }
                .eqc-list-status-infinite {
                    background: #fff !important;
                }
            }
        }
    }
}
</style>
