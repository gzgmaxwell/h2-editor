<template>
    <div class="eqc-dialog-empty-create dialog">
        <div class="content">
            <div class="left-part">
                <div class="category">
                    <div class="banner">
                        <div class="swiper-container">
                            <div
                                class="swiper-wrapper"
                            >
                                <div
                                    v-for="(item,index) in banners"
                                    :key="index"
                                    :class="[{'selected-swiper-item':selectBannerItem && selectBannerItem.name === item.name}]"
                                    :data-index="index"
                                    class="swiper-slide"
                                    @click="selectBanner(item)"
                                >
                                    <div>{{ item.name }}</div>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-button swiper-button-prev" />
                        <div class="swiper-button swiper-button-next" />
                    </div>
                </div>
                <div class="list">
                    <ul
                        v-if="selectBannerItem"
                        class="sizes"
                    >
                        <li
                            v-for="(item,index) of selectBannerItem.list"
                            :key="index"
                            class="size-box"
                            @click="selectSize(item)"
                        >
                            <div
                                :class="[{'size-selected':selectSizeItem && selectSizeItem === item}]"
                                :style="[{backgroundImage: item.config ? `url(${item.cover})`: getBackgroundImage(getImage(item.cover))},
                                         {backgroundSize: item.config ? '80px': 'contain'}]"
                                class="size-cover"
                            >
                                <div
                                    v-if="selectSizeItem === item"
                                    class="size-selected-arrow"
                                />
                                <i
                                    v-if="selectSizeItem === item"
                                    class="size-selected-flag eqf-yes"
                                />
                            </div>
                            <p
                                :class="[{'size-box-selected':selectSizeItem && selectSizeItem === item}]"
                                class="title"
                            >
                                {{ item.name }}
                            </p>
                            <div
                                :class="[{'size-box-selected':selectSizeItem && selectSizeItem === item}]"
                                class="sub-title"
                            >
                                {{ `${item.width}*${item.height} ${item.unit === 'mm' ? '毫米' : '像素'}` }}
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="search-bar">
                    <i
                        class="icon eqf-search-l"
                        @click="search"
                    />
                    <input
                        v-model="searchStr"
                        placeholder="搜索想要的模板"
                        maxlength="20"
                        class="text"
                        type="text"
                        @keydown.enter="search"
                    >
                </div>
            </div>
            <div class="right-part">
                <i
                    class="close eqf-no"
                    @click="cancel"
                />
                <span class="title">作品标题</span>
                <div
                    class="pro-name hint--left hint--rounded"
                    data-hint="点击修改作品标题"
                >
                    <input
                        v-model="data.title"
                        type="text"
                        maxlength="16"
                        placeholder="易企秀轻设计制作"
                    >
                </div>
                <span class="title">自定义尺寸</span>
                <div class="size">
                    <div
                        class="text width"
                    >
                        <div class="title">
                            宽度
                        </div>
                        <input
                            v-model.number="data.width"
                            type="number"
                            placeholder="宽"
                            @input="changeValue('width')"
                        >
                    </div>
                    <i
                        class="icon eqf-refresh-ccw"
                        @click="exchange"
                    />
                    <div
                        class="text height"
                    >
                        <div class="title">
                            高度
                        </div>
                        <input
                            v-model.number="data.height"
                            type="number"
                            placeholder="高"
                            @input="changeValue('height')"
                        >
                    </div>
                </div>
                <div class="unit">
                    <div class="title">
                        单位
                    </div>
                    <div
                        class="box"
                        @mouseover="selectUnit = true"
                        @mouseleave="selectUnit = false"
                    >
                        <span>{{ unitType.name }}</span>
                        <div
                            class="triangle"
                        >
                            <i class="icon eqf-menu-down" />
                        </div>
                        <base-drop-down
                            v-if="selectUnit"
                            :list="unitTypeList"
                            :css="{left: '0px', top: '30px', width: '100%', zIndex: 3}"
                            :selected-item="unitType"
                            :max-item-num="3"
                            item-key="size"
                            @choose="chooseUnitType"
                        />
                    </div>
                </div>
                <div
                    v-if="!vipMemberAuth && !isXiuKe"
                    :class="[{'renew-member': yinxiaoVipMemberAuth || chuangyiVipMemberAuth},
                             {'open-member': !yinxiaoVipMemberAuth && !chuangyiVipMemberAuth}]"
                    class="buy-btn"
                    @click="memberRePay"
                />
                <div
                    class="create-btn"
                    @click="addScene"
                >
                    创建
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import delayLoad from '../../../utils/delayLoad'
import emptyList from './emptyList'
import storageLocal from '../../../utils/storageLocal'

export default {
    props: {
        close: {
            type: Function,
            default: null
        }
    },
    data() {
        return {
            emptyList,
            banners: [], // 分类
            selectBannerItem: null, // 选择的空白创建分类
            selectSizeItem: null, // 选择的空白创建size
            searchStr: '',
            historyUse: { name: '最近使用', list: [] },
            data: {
                title: '易企秀轻设计制作',
                width: 800,
                height: 800
            },
            selectUnit: false,
            unitType: { name: '像素', size: 'px' },
            unitTypeList: [{ name: '像素', size: 'px' }, { name: '毫米', size: 'mm' }],
            needChangeUnit: false //
        }
    },
    computed: {
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        // 7,8,9 Vip
        vipMemberAuth() {
            return this.userInfo && ([7, 8, 9].includes(this.userInfo.memberType) || (this.userInfo.members && this.userInfo.members.some(item => [7, 8, 9].includes(item.memberId))))
        },
        // 营销云 vip
        yinxiaoVipMemberAuth() {
            return this.userInfo.members && this.userInfo.members.some(item => [202, 203, 204].includes(item.memberId))
        },
        // 创意云 vip
        chuangyiVipMemberAuth() {
            return this.userInfo.members && this.userInfo.members.some(item => [14].includes(item.memberId))
        },
        buyMemberAuth() {
            return this.user.allow('buyMember')
        },
        // 是否是秀客
        isXiuKe() {
            return [4].includes(this.userInfo.type)
        }
    },
    watch: {
        'selectSizeItem.width': {
            handler(newVal) {
                if (newVal) {
                    this.data.width = newVal
                }
            }
        },
        'selectSizeItem.height': {
            handler(newVal) {
                if (newVal) {
                    this.data.height = newVal
                }
            }
        },
        unitType: {
            handler(newVal) {
                if (this.needChangeUnit) {
                    let width = 0
                    let height = 0
                    if (newVal.size === 'px') {
                        width = Vue.filter('mm2px')(this.data.width)
                        height = Vue.filter('mm2px')(this.data.height)
                    } else {
                        width = Vue.filter('px2mm')(this.data.width, 'mm')
                        height = Vue.filter('px2mm')(this.data.height, 'mm')
                    }
                    this.data.width = width
                    this.data.height = height
                }
            }
        }
    },
    created() {
        const loadSwipercss = delayLoad.delayLoadCSS(Vue.env.plugin.swipercss)
        const loadSwiperjs = delayLoad.delayLoadJS(Vue.env.plugin.swiperjs)
        const loadJquery = delayLoad.delayLoadJS(this.env.plugin.jquery)
        Promise.all([loadSwipercss, loadSwiperjs, loadJquery]).then(() => {
            this.getBanner()
        }).catch(err => err && this.logger.error(err))
    },
    methods: {
        // 会员续费
        memberRePay() {
            if (this.buyMemberAuth) {
                const options = {
                    benefitId: Vue.env.benefits.download
                }
                this.dialog.openMember(options).then(res => {
                    if (res.success) {
                        this.notifier.success('支付成功，请刷新页面')
                        this.init()
                    } else {
                        this.notifier.fail('支付失败，请稍后重试')
                    }
                }).catch(err => {
                    err && this.logger.error(err)
                })
            }
        },
        getImage(src) {
            return Vue.filter('qiniuZoom')(src, 164)
        },
        getBackgroundImage(src) {
            return Vue.filter('backgroundImage')(src)
        },
        cancel() {
            this.close()
        },
        exchange() {
            [this.data.width, this.data.height] = [this.data.height, this.data.width]
            this.selectSizeItem = null
        },
        changeValue(type) {
            this.selectSizeItem = null
            const maxSize = this.unitType.size === 'mm' ? Math.round(5000 / 300 * 25.4) : 5000
            const size = type === 'width' ? this.data.width : this.data.height
            if (size > maxSize) {
                type === 'width' ? this.data.width = maxSize : this.data.height = maxSize
            }
        },
        // 选择单位
        chooseUnitType(item) {
            this.unitType = item
            this.selectUnit = false // 选择后关掉下拉框
            this.needChangeUnit = true
        },
        search() {
            // http://store.eqxiu.com/search/?keywords=圣诞节&searchCode=94227
            if (this.searchStr === '') {
                return Vue.notifier.fail('搜索内容不能为空')
            }
            window.open(`${this.env.host.mall}/search/?keywords=${this.searchStr}&searchCode=94227`, '_blank')
        },
        setBannerData() {
            this.$nextTick(function () {
                // eslint-disable-next-line
                const swiper = new Swiper('.swiper-container', {
                    slidesPerView: 'auto',
                    spaceBetween: 32,
                    watchOverflow: true,
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev'
                    }
                })
            })
            // 默认选中第一个分类下的第一个
            this.selectBanner(this.banners[1])
            this.selectSize(this.selectBannerItem.list[0])
        },
        // 分类请求
        getBanner() {
            this.api.banner.getSceneBanners()
                .then(res => {
                    if (res.data.list) {
                        this.banners = res.data.list.slice(1).concat(this.emptyList)
                        this.getHistory()
                        this.banners.unshift(this.historyUse)
                        this.setBannerData()
                    }
                })
                .catch(err => err && this.logger.error(err))
        },
        selectBanner(item) {
            this.selectBannerItem = item
        },
        selectSize(item) {
            if (!item.unit) {
                item.unit = 'px'
            }
            this.selectSizeItem = item
            this.needChangeUnit = false
            const units = this.unitTypeList.filter(v => v.size === this.selectSizeItem.unit)
            if (units && units.length > 0) {
                this.unitType = units[0]
            }
        },
        addScene() {
            let type = 0
            let width = this.data.width
            let height = this.data.height
            let unit = this.unitType.size

            if (this.selectSizeItem) {
                width = this.selectSizeItem.width
                height = this.selectSizeItem.height
                unit = this.selectSizeItem.unit
                type = this.selectSizeItem.type || 0
            }
            // 自定义类型的毫米单位 需要换成px创建
            if (type === 0 && unit === 'mm') {
                width = Vue.filter('mm2px')(this.data.width)
                height = Vue.filter('mm2px')(this.data.height)
                unit = 'px'
            }
            const route = {
                path: '/create',
                query: {
                    type,
                    width,
                    height,
                    unit,
                    history: true,
                    title: this.data.title
                }
            }
            this.addHistory()
            this.close()
            // 改为新打开一个tab
            const routeData = Vue.router.resolve(route)
            window.open(routeData.href, '_blank')
        },
        addHistory() {
            if (this.selectSizeItem) {
                const res = this.historyUse.list.some(v => v.name === this.selectSizeItem.name)
                if (res) {
                    return
                }

                this.historyUse.list.push(this.selectSizeItem)
                // save history
                const his = JSON.stringify(this.historyUse.list)
                storageLocal.setItem(storageLocal.key.emptyCreateHistory, his)
            }
        },
        getHistory() {
            const his = storageLocal.getItem(storageLocal.key.emptyCreateHistory)
            if (his) {
                const list = JSON.parse(his)
                if (list && list.length > 0) {
                    this.historyUse.list = list
                }
            }
        }

    }

}
</script>

<style lang="scss">
.eqc-dialog-empty-create {
    width: 1024px;
    height: 600px;
    .content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        position: relative;
        border-radius: 3px;
        .left-part {
            width: 760px;
            background: #eee;
            height: 600px;
            border-top-left-radius: 3px;
            border-bottom-left-radius: 3px;
            .category {
                height: 60px;
                background: #ffffff;
                border-bottom: 1px solid #ccd5db;
                border-top-left-radius: 3px;
                .banner {
                    width: calc(100% - 56px);
                    height: 100%;
                    margin: 0 28px;
                    position: relative;
                }
                .swiper-container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }
                .swiper-slide {
                    color: #111111;
                    border-bottom: 2px solid #ffffff;
                    width: auto;
                    height: 59px;
                    text-align: center;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                    -webkit-box-pack: center;
                    -ms-flex-pack: center;
                    -webkit-justify-content: center;
                    justify-content: center;
                    -webkit-box-align: center;
                    -ms-flex-align: center;
                    -webkit-align-items: center;
                    align-items: center;
                }
                .swiper-button {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 13px;
                    color: #76838f;
                    transform: scale(0.3);
                }
                .swiper-button-prev {
                    margin: -24px 0 0 -35px;
                    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2027%2044'%3E%3Cpath%20d%3D'M0%2C22L22%2C0l4.2%2C4.2L8.4%2C22l17.8%2C17.8L22%2C44L0%2C22z'%20fill%3D'%2376838F'%2F%3E%3C%2Fsvg%3E");
                }
                .swiper-button-next {
                    margin: -24px -35px 0 0;
                    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2027%2044'%3E%3Cpath%20d%3D'M27%2C22L5%2C44l-4.2-4.2L18.6%2C22L0.8%2C4.2L5%2C0z'%20fill%3D'%2376838F'%2F%3E%3C%2Fsvg%3E");
                }
                .swiper-button-prev.swiper-button-disabled,
                .swiper-button-next.swiper-button-disabled {
                    opacity: 0;
                }
                .selected-swiper-item {
                    color: #1593ff;
                    border-bottom: 2px solid #1593ff;
                }
            }
            .list {
                height: 480px;
                width: 100%;
                background: #ffffff;
                .sizes {
                    position: relative;
                    height: 480px;
                    overflow-y: scroll;
                    font-size: 0;
                    padding: 20px 22px 0 28px;
                    margin-right: 6px;
                    .size-box {
                        position: relative;
                        width: 164px;
                        height: 216px;
                        // overflow: hidden;
                        margin: 0 10px 20px 0;
                        display: inline-block;
                        vertical-align: middle;
                        &:nth-child(4n) {
                            margin-right: 0 !important;
                        }
                        &:hover .size-cover {
                            box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
                        }
                        &:hover .title,
                        &:hover .sub-title {
                            color: #1593ff;
                        }
                        .size-cover {
                            width: 100%;
                            height: 164px;
                            background: #f6f9fa center/contain no-repeat;
                            border: 2px solid #f6f9fa;
                            cursor: pointer;
                        }
                        .size-selected-arrow {
                            width: 0;
                            height: 0;
                            border-width: 12px;
                            border-style: solid;
                            position: absolute;
                            border-color: rgba(21, 147, 255, 1) transparent transparent rgba(21, 147, 255, 1);
                        }
                        .size-selected-flag {
                            font-size: 16px;
                            position: absolute;
                            top: 0px;
                            left: 2px;
                            color: #ffffff;
                        }
                        .title {
                            height: 20px;
                            font-size: 14px;
                            color: rgba(37, 43, 63, 1);
                            line-height: 16px;
                            text-align: center;
                            margin: 8px 0 6px 0;
                        }
                        .sub-title {
                            height: 17px;
                            font-size: 12px;
                            color: rgba(102, 102, 102, 1);
                            line-height: 14px;
                            text-align: center;
                        }
                    }

                    .size-selected {
                        border: 2px solid rgba(21, 147, 255, 1) !important;
                    }
                    .size-box-selected {
                        color: rgba(21, 147, 255, 1) !important;
                    }

                    &::-webkit-scrollbar {
                        width: 8px;
                    }
                    &::-webkit-scrollbar-track {
                        background-color: #ffffff;
                    }
                    &::-webkit-scrollbar-thumb {
                        background-color: rgba(0, 0, 0, 0.2);
                        height: 80px;
                        border-radius: 4px;
                    }
                }
            }
            .search-bar {
                height: 60px;
                background: #ffffff;
                border-top: 1px solid #ccd5db;
                display: flex;
                justify-content: flex-start;
                align-items: center;
                border-bottom-left-radius: 3px;
                .icon {
                    font-size: 14px;
                    margin-left: 24px;
                    cursor: pointer;
                    &:hover {
                        color: #1593ff;
                    }
                }
                input {
                    width: 128px;
                    height: 20px;
                    font-size: 14px;
                    color: rgba(37, 43, 63, 1);
                    line-height: 16px;
                    margin: -2px 2px 0 2px;
                }
            }
        }
        .right-part {
            width: 264px;
            background: #ffffff;
            height: 600px;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-start;
            box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.16);
            border-top-right-radius: 3px;
            border-bottom-right-radius: 3px;
            .close {
                width: 24px;
                height: 24px;
                font-size: 24px;
                margin-left: calc(100% - 24px - 28px);
                margin-top: 18px;
                cursor: pointer;
            }
            > .title {
                height: 20px;
                font-size: 14px;
                font-weight: 600;
                color: rgba(17, 17, 17, 1);
                line-height: 20px;
                margin: 18px 28px 0 28px;
                width: 208px;
            }
            .pro-name {
                height: 28px;
                width: 208px;
                margin-top: 10px;
                padding: 0 0 10px 0;
                font-size: 14px;
                color: #252b3f;
                border-bottom: 1px solid #ccd5db;
                margin-left: 28px;
                input {
                    outline: none;
                    width: 100%;
                }
            }
            .size {
                width: 208px;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin: 10px 28px;
                .text .title {
                    width: 26px;
                    height: 26px;
                    font-size: 13px;
                    font-weight: 600;
                    color: rgba(17, 17, 17, 1);
                    line-height: 18px;
                }
                .text input {
                    width: 80px;
                    height: 32px;
                    padding-left: 12px;
                    background: rgba(255, 255, 255, 1);
                    border-radius: 2px;
                    border: 1px solid rgba(204, 213, 219, 1);
                }
                .icon {
                    width: 32px;
                    height: 32px;
                    line-height: 32px;
                    background: rgba(255, 255, 255, 1);
                    border-radius: 2px;
                    border: 1px solid rgba(204, 213, 219, 1);
                    font-size: 16px;
                    text-align: center;
                    cursor: pointer;
                }
            }
            .unit {
                width: 80px;
                position: relative;
                margin: 2px 28px;
                .title {
                    width: 26px;
                    height: 26px;
                    font-size: 13px;
                    font-weight: 600;
                    color: rgba(17, 17, 17, 1);
                    line-height: 18px;
                }
                .box {
                    width: 80px;
                    height: 32px;
                    background: rgba(255, 255, 255, 1);
                    border-radius: 2px;
                    border: 1px solid rgba(204, 213, 219, 1);
                    display: flex;
                    position: relative;
                    span {
                        width: 48px;
                        height: 100%;
                        line-height: 32px;
                        text-align: center;
                    }
                    .triangle {
                        width: 30px;
                        height: 30px;
                        line-height: 32px;
                        font-size: 16px;
                        text-align: center;
                    }
                }
            }
            .create-btn {
                width: 264px;
                height: 60px;
                background: rgba(21, 147, 255, 1);
                color: #ffffff;
                text-align: center;
                line-height: 60px;
                font-size: 14px;
                position: absolute;
                bottom: 0;
                left: 0;
                cursor: pointer;
                border-bottom-right-radius: 3px;
            }
            .disabled-btn {
                color: #ccd5db;
                cursor: not-allowed;
                user-select: none;
            }
            // 按钮
            .buy-btn {
                width: 232px;
                height: 136px;
                border-radius: 2px;
                font-size: 13px;
                font-weight: 400;
                color: white;
                text-align: center;
                line-height: 32px;
                cursor: pointer;
                background-size: cover !important;
                position: absolute;
                left: 16px;
                bottom: 76px;
                &.open-member {
                    background: url("../../../img/openMember.png");
                }
                &.renew-member {
                    background: url("../../../img/renewMember.png");
                }
            }
        }
    }
}
</style>
