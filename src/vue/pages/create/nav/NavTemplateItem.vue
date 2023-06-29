<template>
    <li
        :_tracker_data_="`{product_id: ${item.id}, name: '${item.name}', price: ${item.price}, type: ${sceneJson.type}}`"
        :class="{col2: isTwoCol}"
        :style="[itemCss, {backgroundImage: getBackgroundImage(transferData(isSys ? item.productTypeMap.cover : item.cover), itemCss.size)}]"
        class="eqc-template-item col1"
        @click="replaceTemplate(item)"
        @mouseover="showPreview(item)"
        @mouseleave="hidePreview(item)"
    >
        <span
            v-show="showPrice"
        >
            <span
                v-show="item.price"
                class="price"
            >{{ item.price }}秀点</span>
            <span
                v-if="item.attrMap && item.attrMap.memberFreeFlag "
                class="member-icon"
                @click="toMember(item, $event)"
            >
                会免
            </span>
        </span>
        <TemplateStar
            v-if="showStart"
            :item="item"
        />
    </li>
</template>

<script>
import EqxPage from '../../../../core/html/page'
import PageHistoryType from '../../../../config/enum.pageHistory.type'
import util from '../../../../utils/util'
import elementType from '../../../../config/enum.element.type'
import TemplateStar from './template/TemlpateStar.vue'
export default {
    components: {
        TemplateStar
    },
    props: {
        item: {
            type: Object,
            default: null
        },
        itemCss: {
            type: Object,
            default: null
        },
        isTwoCol: {
            type: Boolean,
            default: true
        },
        isSys: {
            type: Boolean,
            default: true
        },
        isBuy: {
            type: Boolean,
            default: true
        },
        isCollect: {
            type: Boolean,
            default: true
        },
        tabList: {
            type: Array,
            default: null
        },
        eqxScene: {
            type: Object,
            default: null
        },
        eqxPage: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            showStart: false // 是不是展示收藏start
        }
    },
    computed: {
        preview() {
            return Vue.store.state.layout.preview
        },
        sceneJson() {
            return this.eqxScene.sceneJson
        },
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        buyMemberAuth() {
            return !(this.userInfo.members && this.userInfo.members.some(item => [14].includes(item.memberId))) && this.user.allow('buyMember')
        },
        scene() {
            return Vue.store.state.scene
        },
        type() {
            return this.scene.eqxScene.sceneJson.type
        },
        matchCategory() {
            return this.scene.matchCategory
        },
        showPrice() {
            // 若折扣价存在且为0则认为是免费的
            const discountPrice = this.item.attrMap ? this.item.attrMap.discountPrice : undefined
            return !(typeof discountPrice === 'number' && discountPrice === 0)
        },
        templateConfig() {
            return Vue.store.state.layout.templateConfig
        }
    },
    methods: {
        transferData(data) {
            if (data && util.isString(data)) {
                let cover = null
                try {
                    cover = JSON.parse(data)
                    const item = cover[0]
                    return item ? item[Object.keys(item)[0]] : ''
                } catch (e) {
                    return data
                }
            } else {
                return ''
            }
        },
        getBackgroundImage(src, size) {
            src = Vue.filter('qiniuZoom')(src, size)
            return Vue.filter('backgroundImage')(src)
        },
        showPreview(item) {
            this.showStart = true
            Vue.store.commit('TEMPLATE_COLOR_PANEL', { show: false })
            Vue.store.commit('TEMPLATE_CONFIG', { show: false })
            if (!this.templateConfig.previewAuthor) {
                return
            }
            clearTimeout(this.preview.timeoutId)
            this.preview.timeoutId = setTimeout(() => {
                const { width, height } = this.sceneJson
                const obj = {
                    isSys: this.isSys,
                    eqxPage: this.eqxPage,
                    eqxScene: this.eqxScene,
                    tablist: this.tabList
                }
                const pageInfo = Object.assign(JSON.parse(JSON.stringify(item)), obj)
                this.$store.commit('LAYOUT_PREVIEW', { show: true, width, height, pageInfo: pageInfo })
            }, 300)
        },
        hidePreview(item) {
            this.showStart = false
            clearTimeout(this.preview.timeoutId)
            this.preview.timeoutId = setTimeout(() => {
                this.$store.commit('LAYOUT_PREVIEW', { show: false })
            }, 300)
        },
        updatePages(pPageIndex = 0, state) {
            const promist = new Promise((resolve, reject) => {
                const page = this.eqxScene.eqxPages[pPageIndex]
                if (page) {
                    this.loading.open('正在智能调整中，请稍后...')
                    const $elWorkspace = this.eqxPage.$el.parentElement
                    Vue.store.commit('PAGE_CHANGE', { eqxPage: page })
                    this.sceneJson.oldWidth = this.matchCategory.width
                    this.sceneJson.oldHeight = this.matchCategory.height
                    setTimeout(() => {
                        page.setScale('changeCategoryFit', $elWorkspace.offsetWidth, $elWorkspace.offsetHeight)
                        Vue.store.dispatch('PAGE_SAVE', { eqxPage: page, needCover: true })
                        this.loading.close()
                        if (!state) {
                            resolve()
                        }
                    }, 500)
                }
            })
            promist.then((res) => {
                this.updatePages(pPageIndex + 1)
            })
        },
        // 模板替换
        replaceTemplate(item) {
            let pageCount = 0
            if (item.productTypeMap) {
                pageCount = Object.keys(JSON.parse(item.productTypeMap.cover)).length
            } else {
                pageCount = Object.keys(JSON.parse(item.cover)).length
            }

            if (pageCount === 1) {
                if (this.eqxPage.eqxHistory.getHistory().type !== PageHistoryType.replaceTemplate && this.eqxPage.eqxElements.length > 0) {
                    this.dialog.openConfirm({ msg: '使用模板后，将会替换当前页的所有内容哦' })
                        .then(() => {
                            this.replaceOneTelpmate(item)
                        }).catch(e => {})
                } else {
                    this.replaceOneTelpmate(item)
                }
            } else if (pageCount > 1) {
                this.replaceAllTemplmate()
            }
        },
        // 替换单页模板
        replaceOneTelpmate(pItem) {
            Vue.store.commit('PRODUCT_ID', { productId: pItem.id, sourceUser: pItem.sourceUser })
            let promise = Promise.resolve(JSON.parse(JSON.stringify(pItem)))
            if (this.isSys || this.isCollect) {
                let pageId
                if (Object.prototype.hasOwnProperty.call(pItem.productTypeMap, 'page_id')) {
                    // 这种情况是普通列表
                    pageId = pItem.productTypeMap.page_id
                } else {
                    // 这种情况是已收藏需要去cover里面获取
                    pageId = Object.keys(JSON.parse(pItem.productTypeMap.cover)[0])[0]
                }
                // 普通获取
                // 1016 未购买
                // 1018 游客，需要登录才能访问
                const idcode = `${pItem.sourceId}_${pItem.code}`
                promise = this.api.page.getPage(pageId, idcode, pItem.id)
                    .then(res => {
                        const code = res.data.code
                        if (code === 1016) {
                            return this.buy(pItem)
                        } else if (code === 1018) {
                            this.notifier.info('付费模板需登录并购买后才能使用')
                            return Promise.reject()
                        } else {
                            return res
                        }
                    })
                    .then(res => res.data.obj)
            } else if (this.isBuy) {
                // 已购买获取
                promise = this.api.page.getPurchasedPage(pItem.id, pItem.printId)
                    .then(res => res.data.obj)
            }

            promise.then(obj => {
                const { elements, properties } = obj
                this.getArtQrcodeTplCover(obj)
                this.eqxPage.renderPage({ elements, properties })
                this.eqxPage.eqxHistory.add(this.eqxPage, { type: PageHistoryType.replaceTemplate })
                this.$store.commit('ELEMENT_SELECT', { eqxElements: [] })
                this.$store.dispatch('PAGE_SAVE', { eqxPage: this.eqxPage, needCover: true })
                if (this.type === 0) { // 如果是自定义场景  则要智能适配
                    const allPages = Vue.store.state.scene.eqxScene.eqxPages
                    const currentPage = Vue.store.state.scene.eqxPage
                    const index = allPages.indexOf(currentPage)
                    this.updatePages(index, true)
                }
            }).catch(err => {
                err && this.logger.error(err)
            })
        },
        // 替换全部模板
        replaceAllTemplmate() {
            const data = this.preview.pageInfo
            this.dialog.openConfirm({ msg: '使用整套模板会覆盖所有页面，是否继续？' })
                .then(() => {
                    Vue.store.commit('PRODUCT_ID', { productId: data.id, sourceUser: data.sourceUser })
                    const promiseArray = []
                    let promise = Promise.resolve(data)
                    if (this.isSys || this.isCollect) {
                        const coverObj = data.productTypeMap ? JSON.parse(data.productTypeMap.cover) : JSON.parse(data.cover)
                        coverObj.forEach(coverItem => {
                            const pageId = Object.keys(coverItem)[0]
                            // 1016 未购买
                            // 1018 游客，需要登录才能访问
                            const idcode = `${data.sourceId}_${data.code}`
                            promise = this.api.page.getPage(pageId, idcode, data.id)
                                .then(res => {
                                    const code = res.data.code
                                    if (code === 1016) {
                                        return this.buy(data)
                                    } else if (code === 1018) {
                                        this.notifier.info('付费模板需登录并购买后才能使用')
                                        return Promise.reject()
                                    } else {
                                        return res
                                    }
                                })
                                .then(res => res.data.obj)
                            promiseArray.push(promise)
                        })
                    } else if (this.isBuy) {
                        const coverObj = data.productTypeMap ? JSON.parse(data.productTypeMap.cover) : JSON.parse(data.cover)
                        coverObj.forEach(coverItem => {
                            const pageId = Object.keys(coverItem)[0]
                            promise = this.api.page.getPurchasedPage(pageId, data.printId)
                                .then(res => res.data.obj)
                            promiseArray.push(promise)
                        })
                    }
                    Promise.all(promiseArray)
                        .then((res) => {
                            this.loading.open('正在替换')
                            const promiseArray = []
                            // 删除非第一页
                            data.eqxScene.sceneJson.pages.forEach((item, index) => {
                                if (index !== 0) {
                                    const promise = this.api.page.deletePage(item.id, data.eqxScene.sceneJson.id)
                                    promiseArray.push(promise)
                                }
                            })
                            Promise.all(promiseArray).then((result) => {
                                while (data.eqxScene.eqxPages.length >= 2) {
                                    this.$store.commit('PAGE_DELETE', { eqxPage: data.eqxScene.eqxPages[1] })
                                }
                                res.forEach((item, index) => {
                                    if (index === 0) {
                                        // 第一页采取替换的方式
                                        const { elements, properties } = item
                                        this.getArtQrcodeTplCover(item)
                                        data.eqxScene.eqxPages[0].renderPage({ elements, properties })
                                        data.eqxScene.eqxPages[0].eqxHistory.add(data.eqxScene.eqxPages[0], { type: PageHistoryType.replaceTemplate })
                                        this.$store.dispatch('PAGE_SAVE', { eqxPage: data.eqxScene.eqxPages[0], needCover: true })
                                    } else {
                                        // 非第一页采取新增的方式
                                        const newPageJson = JSON.parse(JSON.stringify(item))
                                        newPageJson.id = EqxPage.newPageId(data.eqxScene.sceneJson.pages)
                                        newPageJson.sort = EqxPage.newPageSort(data.eqxScene.sceneJson.pages)
                                        newPageJson.printId = data.eqxScene.sceneJson.pages[0].printId
                                        const eqxPage = new EqxPage(newPageJson, data.eqxScene)
                                        eqxPage.eqxHistory.add(eqxPage, { type: PageHistoryType.replaceTemplate })
                                        this.$store.dispatch('PAGE_SAVE', { eqxPage, needCover: false })
                                        this.$store.commit('PAGE_ADD', { eqxPage })
                                    }
                                })
                                // 跳转到第一页显示
                                this.$store.commit('PAGE_CHANGE', { eqxPage: data.eqxScene.eqxPages[0] })
                                this.loading.close()
                                if (this.type === 0) { // 如果是自定义场景  则要智能适配
                                    this.updatePages()
                                }
                            })
                        })
                })
                .catch(err => err && this.logger.error(err))
        },
        buy(item) {
            const data = {
                orderAppId: 10002,
                signUrl: `${this.env.host.p1}/m/charge/signature`,
                buyItems: [{
                    name: `购买模板《${item.name}》`,
                    price: item.price,
                    id: item.id,
                    type: this.enum.attrGroupId.printTpl // 轻设计模板
                }]
            }
            return this.dialog.openPay(data)
                .then(value => {
                    if (value.data.success) {
                        return this.api.product.getOrderStatus(value.data.obj.merchantOrderNo, item.productTypeMap.page_id, item.sourceId)
                            .then(res => {
                                const params = {
                                    type: this.sceneJson.type,
                                    tab: this.tabList[1].type
                                }
                                this.infiniteScroll.clearKey(params)
                                this.notifier.success('购买成功')
                                return res
                            })
                            .catch(() => {
                                this.notifier.fail('购买失败，请联系客服处理')
                                return Promise.reject()
                            })
                    } else {
                        this.notifier.fail('支付失败，请稍后重试')
                        return Promise.reject()
                    }
                })
        },
        toMember(item, event) {
            if (this.buyMemberAuth) {
                event.stopPropagation()
                this.dialog.openMember().then(res => {
                    if (res.success) {
                        this.notifier.success('支付成功，请刷新页面')
                    } else {
                        this.notifier.fail('支付失败，请稍后重试')
                    }
                }).catch(err => {
                    err && this.logger.error(err)
                })
            }
        },
        getArtQrcodeTplCover(item) {
            // 艺术二维码场景下 切换模板时需替换封面
            if (this.type === Vue.env.mall.artQrcodeTemplateType) {
                const cover = item.productTypeMap ? item.productTypeMap.cover : item.cover
                item.elements.map(ele => {
                    if (ele.type === elementType.qrcode && ele.property.isArt) {
                        ele.property.cover = cover
                    }
                })
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-template-item {
    position: relative;
    margin-top: 8px;
    background: #eceef0 center/cover no-repeat;
    overflow: hidden;
    cursor: pointer;
    &::after {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: #000;
        opacity: 0;
        transition: all 0.3s;
    }
    &:hover::after {
        opacity: 0.1;
    }
    .price {
        display: flex;
        align-items: center;
        position: absolute;
        left: 6px;
        top: 6px;
        text-align: center;
        padding: 3px;
        border-radius: 1px;
        font-size: 12px;
        color: #000;
        background: #fff;
        box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
        z-index: 1; // 需要在mask之上
    }
    .member-icon {
        z-index: 1; // 需要在mask之上
        position: absolute;
        right: 6px;
        top: 6px;
        padding: 5px;
        font-size: 12px;
        border-radius: 3px;
        background: #c09659;
        width: 66px;
        text-align: center;
        color: #fff;
        transform: rotate(45deg) translateX(16px) translateY(-21px);
        box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
    }
}
</style>
