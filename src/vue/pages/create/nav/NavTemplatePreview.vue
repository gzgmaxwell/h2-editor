<template>
    <div
        class="preivew-wrap"
    >
        <transition name="rotate-y-left">
            <div
                v-if="preview.show"
                class="wrap"
                @mouseover="showWarp"
                @mouseleave="hideWarp"
            >
                <div class="warp-title">
                    <div class="title-info">
                        <span :class="['price', {free: !preview.pageInfo.price}]">
                            {{ showPrice ? (preview.pageInfo.price ? preview.pageInfo.price : '免费') : '免费' }}
                            <span
                                v-if="showPrice && preview.pageInfo.price"
                                class="unit"
                            >秀点</span>
                        </span>
                        <!-- <span
                            v-if="preview.pageInfo.commercialFlag"
                            class="commercial">
                            <span class="copyright"/>&nbsp;可商用
                        </span> -->
                        <span
                            v-if="showPrice && preview.pageInfo.attrMap && preview.pageInfo.attrMap.memberFreeFlag"
                            :class="['members', {'disable': !buyMemberAuth}]"
                            @click="toMembers"
                        >
                            <i class="member-icon eqf-vipdiamond-f" />&nbsp;会员免费
                        </span>
                    </div>
                    <div class="use-like" />
                </div>
                <div
                    ref="imgList"
                    v-scroll-bar="{onScrollMove}"
                    :style="{
                        width:getPreviewImgWidth,
                        height: getPreviewImgListHeight,
                    }"
                    class="img-container"
                >
                    <ul>
                        <!-- 要改造 -->
                        <li
                            v-for="(coverItem,index) in coverObj"
                            :key="index"
                        >
                            <img
                                :id="'preview_img_' + coverItem"
                                :src="getQiniuImage(coverItem)"
                                :style="{
                                    width:getPreviewImgWidth,
                                    height: getPreviewImgHeight,
                                    boxShadow: '0 0 4px 0 rgba(0, 0, 0, 0.16)',
                                    cursor: 'pointer',
                                    margin:'0px auto'
                                }"
                                class="preview-img"
                                @load="imgLoad"
                                @click="replaceTemplate(Object.keys(coverItem)[0])"
                            >
                        </li>
                    </ul>
                    <span
                        v-if="Object.keys(coverObj).length > 1"
                        class="use-all-template"
                        @click="replaceAllTemplmate"
                    >
                        {{ getUseAllTemplateText }}
                    </span>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>

import EqxPage from '../../../../core/html/page'
import PageHistoryType from '../../../../config/enum.pageHistory.type'
import util from '../../../../utils/util'
import elementType from '../../../../config/enum.element.type'

export default {
    data() {
        return {
            imgloadCount: 0
        }
    },
    computed: {
        size() {
            return {
                maxWidth: 570,
                maxHeight: document.body.clientHeight - 60 - 44 - 48,
                minWidth: 187,
                minHeight: 152
            }
        },
        previewWidth() {
            return (this.preview.width > this.size.maxWidth ? this.size.maxWidth : this.preview.width) + 'px'
        },
        previewHeight() {
            return (this.preview.height > this.size.maxHeight ? this.size.maxHeight : this.preview.height) + 'px'
        },
        layout() {
            return Vue.store.state.layout
        },
        previewPageInfo() {
            return this.preview.pageInfo
        },
        showPrice() {
            // 若折扣价存在且为0则认为是免费的
            const discountPrice = this.preview.pageInfo.attrMap ? this.preview.pageInfo.attrMap.discountPrice : undefined
            return !(typeof discountPrice === 'number' && discountPrice === 0)
        },
        coverObj() {
            if (this.previewPageInfo && this.previewPageInfo.productTypeMap) {
                try {
                    return JSON.parse(this.previewPageInfo.productTypeMap.cover)
                } catch (e) {
                    // 进来这里主要是模板收藏进来这里
                    const cover = this.previewPageInfo.cover
                    if (cover && cover !== '') {
                        return JSON.parse(`[{"0":"${cover}"}]`)
                    } else {
                        return ''
                    }
                }
            } else {
                return JSON.parse(this.previewPageInfo.cover)
            }
        },
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        buyMemberAuth() {
            return !(this.userInfo.members && this.userInfo.members.some(item => [14].includes(item.memberId))) && this.user.allow('buyMember')
        },
        getUseAllTemplateText() {
            if (this.imgloadCount === Object.keys(this.coverObj).length) {
                return '使用整套模板'
            } else {
                return '模板加载中'
            }
        },
        getPreviewImgWidth() {
            let width2 = this.preview.width / (this.preview.height / this.size.maxHeight)
            if (width2 > this.size.maxWidth) {
                width2 = this.size.maxWidth
            }
            if (width2 < this.size.minWidth) {
                width2 = this.size.minWidth
            }
            return width2 + 'px'
        },
        getPreviewImgHeight() {
            if (this.type === 0) {
                Object.assign(this.layout.preview, this.matchCategory)
            }
            let height2 = this.preview.height / (this.preview.width / this.size.maxWidth)
            if (height2 > this.size.maxHeight) {
                height2 = this.size.maxHeight
            }
            if (height2 < this.size.minHeight) {
                height2 = this.size.minHeight
            }
            return height2 + 'px'
        },
        getPreviewImgListHeight() {
            if (this.type === 0) {
                Object.assign(this.layout.preview, this.matchCategory)
            }
            let height2 = this.preview.height / (this.preview.width / this.size.maxWidth)
            const coverCount = Object.keys(this.coverObj).length
            height2 = height2 * coverCount + ((coverCount - 1) * 8)
            if (height2 > this.size.maxHeight) {
                height2 = this.size.maxHeight
            }
            if (height2 < this.size.minHeight) {
                height2 = this.size.minHeight
            }
            return height2 + 'px'
        },
        scene() {
            return Vue.store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        type() {
            return this.scene.eqxScene.sceneJson.type
        },
        matchCategory() {
            return this.scene.matchCategory
        },
        eqxScene() {
            return this.scene.eqxScene
        },
        sceneJson() {
            return this.eqxScene.sceneJson
        },
        preview() {
            if (this.type === 0) {
                return Object.assign(this.layout.preview, this.matchCategory)
            }
            return this.layout.preview
        }
    },
    watch: {
        previewPageInfo() {
            this.imgloadCount = 0
        }
    },
    methods: {
        getQiniuImage(src) {
            if (util.isObject(src)) {
                src = src[Object.keys(src)[0]]
            }
            let size
            const width2 = this.preview.width / (this.preview.height / this.size.maxHeight)
            if (width2 <= this.size.maxWidth) {
                size = this.size.maxHeight
            } else {
                size = this.size.maxWidth
            }
            return this.env.host.file + Vue.filter('qiniuZoom')(src, size)
        },
        toMembers() {
            if (this.buyMemberAuth) {
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
        onScrollMove(e, info) {

        },
        showWarp() {
            clearTimeout(this.preview.timeoutId)
        },
        hideWarp() {
            this.preview.timeoutId = setTimeout(() => {
                this.$store.commit('LAYOUT_PREVIEW', { show: false })
            }, 300)
        },
        imgLoad(e) {
            this.imgloadCount += 1
            try {
                if (this.preview.pageInfo && this.coverObj && this.imgloadCount === Object.keys(this.coverObj).length) {
                    this.$refs.imgList.myScroll.scrollToTop()
                }
            } catch (error) {

            }
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
            if (this.eqxPage.eqxHistory.getHistory().type !== PageHistoryType.replaceTemplate) {
                this.dialog.openConfirm({ msg: '使用模板后，将会替换当前页的所有内容哦' })
                    .then(() => {
                        this.replaceOneTelpmate(item)
                    }).catch(e => {})
            } else {
                this.replaceOneTelpmate(item)
            }
        },
        // 替换单个模板
        replaceOneTelpmate(pIndex) {
            const data = this.preview.pageInfo
            Vue.store.commit('PRODUCT_ID', { productId: data.id, sourceUser: data.sourceUser })
            let promise = Promise.resolve(data)
            if (data.isSys) {
                // 1016 未购买
                // 1018 游客，需要登录才能访问
                const idcode = `${data.sourceId}_${data.code}`
                promise = this.api.page.getPage(pIndex, idcode, data.id)
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
            } else {
                promise = this.api.page.getPurchasedPage(data.id, data.printId)
                    .then(res => res.data.obj)
            }
            promise
                .then(obj => {
                    const { elements, properties } = obj
                    this.getArtQrcodeTplCover(obj)
                    data.eqxPage.renderPage({ elements, properties })
                    data.eqxPage.eqxHistory.add(this.eqxPage, { type: PageHistoryType.replaceTemplate })
                    this.$store.commit('ELEMENT_SELECT', { eqxElements: [] })
                    this.$store.dispatch('PAGE_SAVE', { eqxPage: data.eqxPage, needCover: true })
                    if (this.type === 0) { // 如果是自定义场景  则要智能适配
                        const allPages = Vue.store.state.scene.eqxScene.eqxPages
                        const currentPage = Vue.store.state.scene.eqxPage
                        const index = allPages.indexOf(currentPage)
                        this.updatePages(index, true)
                    }
                })
                .catch(err => err && this.logger.error(err))
        },
        // 替换全部模板
        replaceAllTemplmate() {
            const data = this.preview.pageInfo
            this.dialog.openConfirm({ msg: '使用整套模板会覆盖所有页面，是否继续？' })
                .then(() => {
                    Vue.store.commit('PRODUCT_ID', { productId: data.id, sourceUser: data.sourceUser })
                    const promiseArray = []
                    let promise = Promise.resolve(data)
                    if (data.isSys) {
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
                    } else {
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
                                        this.$store.dispatch('PAGE_SAVE', { eqxPage: data.eqxScene.eqxPages[0], needCover: true })
                                    } else {
                                        // 非第一页采取新增的方式
                                        const newPageJson = JSON.parse(JSON.stringify(item))
                                        newPageJson.id = EqxPage.newPageId(data.eqxScene.sceneJson.pages)
                                        newPageJson.sort = EqxPage.newPageSort(data.eqxScene.sceneJson.pages)
                                        newPageJson.printId = data.eqxScene.sceneJson.pages[0].printId
                                        const eqxPage = new EqxPage(newPageJson, data.eqxScene)
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
.preivew-wrap {
    position: absolute;
    left: 288px;
    top: 60px;
    z-index: 4; // 层级需要在工作区的提示之上
    perspective: 640px;
    .wrap {
        position: relative;
        background: #f7f8f9 no-repeat center/contain;
        box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
        transform-origin: left;
        .warp-title {
            display: flex;
            justify-content: space-between;
            padding: 0px 16px;
            height: 44px;
            border-bottom: 1px solid #ccd5db;
            background: #fff;
            .title-info {
                display: flex;
                align-items: center;
                height: 100%;
                .price {
                    position: relative;
                    font-size: 18px;
                    font-family: HelveticaNeue-Bold;
                    font-weight: bold;
                    color: #111;
                    padding-right: 8px;
                    .unit {
                        position: relative;
                        top: -6px;
                        right: 5px;
                        font-size: 12px;
                    }
                    &.free {
                        font-size: 18px;
                    }
                }
                .commercial {
                    background: #1bc7b1;
                }
                .commercial,
                .members {
                    color: #fff;
                    font-size: 12px;
                    padding: 0px 8px;
                    display: flex;
                    align-items: center;
                    border-left: 1px solid #d8d8d8;
                    height: 24px;
                    border-radius: 12px;
                }
                .members {
                    transition: all 0.3s;
                    margin-left: 9px;
                    background: #c09659;
                    cursor: pointer;
                    .member-icon {
                        font-size: 14px;
                        color: #fff;
                    }
                    &:hover {
                        background: #af7928;
                    }
                    &.disable {
                        cursor: default;
                    }
                }
                .commercial {
                    .copyright {
                        width: 14px;
                        height: 14px;
                        background: url("../../../../img/copyright.svg") center;
                    }
                }
            }
        }
        .img-container {
            position: relative;
            background: #f7f8f9;
            min-height: 70px;
            ul {
                font-size: 0px;
                li {
                    padding-bottom: 8px;
                    .preview-img {
                        background: url("../../../../img/imgdefault.svg") no-repeat center;
                    }
                }
                :last-child {
                    padding-bottom: 0px;
                }
            }
            .use-all-template {
                position: absolute;
                left: calc(50% - 80px);
                bottom: 16px;
                width: 160px;
                height: 36px;
                font-size: 14px;
                font-weight: 400;
                color: rgba(255, 255, 255, 1);
                line-height: 35px;
                background: rgba(21, 147, 255, 1);
                box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.16);
                border-radius: 28px;
                text-align: center;
                cursor: pointer;
            }
        }
    }
}
</style>
