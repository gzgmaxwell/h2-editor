<template>
    <div
        class="eqc-qrcode-template"
    >
        <template-list-category />
        <div
            v-scroll-bar="{onScrollMove}"
            class="content"
        >
            <ul
                class="clearfix eqc-ul"
            >
                <li
                    v-for="item of info.list"
                    :key="item.id"
                    :title="item.name"
                    :style="`height:${selectedTemplateType==='基础'?'212':'266'}px`"
                    class="li-style li-margin"
                >
                    <div class="qrcode-info">
                        <div
                            :style="[{
                                backgroundImage: getBackgroundImage(transferData(isSys ? item.productTypeMap.cover : item.cover), 184),
                                height:((selectedTemplateType==='基础'?184:238)+'px')
                            }]"
                            class="qrcode-demo"
                        />
                        <label
                            class="qrcode-name"
                            v-text="getName(item.name)"
                        />
                        <label
                            class="qrcode-charge"
                            v-text="'限免'"
                        />
                    </div>
                    <div class="use-mask">
                        <button @click="useTemplate(item)">
                            使用该模板
                        </button>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import util from '../../../utils/util'
import elementType from '../../../config/enum.element.type'
import TemplateListCategory from './templatelist/TemplateListCategory.vue'
import artQrcodeTemplateType from '../../../config/enum.artQrcodeTemplate.type'
export default {
    components: {
        TemplateListCategory
    },
    props: {
        isSys: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            key: '',
            info: {
                list: []
            },
            filter: {
                type: null, // 艺术二维码模板分类
                mostType: 'sort', // composite：综合排序，newest：最新，hottest：最热
                free: 0, // 0：免费，''：不免费
                memberFree: 0, // 1：会员免费，2：不是会员免费
                color: '', // ''：所有
                attrValue: '', // 属性值id
                pageSize: 50
            }
        }
    },
    computed: {
        qrcode() {
            return Vue.store.state.artQrcode
        },
        qrcodeTemplateListFilter() {
            return this.qrcode.qrcodeTemplateListFilter
        },
        // 当前模板选择类型
        selectedTemplateType() {
            return this.qrcode.selectedTemplateType
        },
        // 模板分类id
        getSelectedTemplateTypeId() {
            if (this.selectedTemplateType === '立体') {
                return Vue.env.mall.artQrcodeTemplateType[1]
            } else if (this.selectedTemplateType === '动态') {
                return Vue.env.mall.artQrcodeTemplateType[2]
            } else {
                return Vue.env.mall.artQrcodeTemplateType[0]
            }
        },
        getQrcodeTemplateType() {
            if (this.selectedTemplateType === '基础') {
                return artQrcodeTemplateType.square
            } else if (this.selectedTemplateType === '立体') {
                return artQrcodeTemplateType.threeD
            } else if (this.selectedTemplateType === '动态') {
                return artQrcodeTemplateType.dynamic
            } else {
                return artQrcodeTemplateType.blackWhite
            }
        }
    },
    watch: {
        // 监视分类变化
        selectedTemplateType() {
            this.filter.type = this.getSelectedTemplateTypeId
            this.getProducts()
        },
        qrcodeTemplateListFilter(newVal, oldVal) {
            this.filter.attrValue = newVal.id
            this.getProducts()
        },
        'info.list': function (newVal, oldVal) {
            this.loading.close()
        }
    },
    created() {
        this.filter.type = this.getSelectedTemplateTypeId
        this.getProducts()
    },
    methods: {
        onScrollMove(e, info) {
            if (info.scrollY / info.maxScrollY >= 2 / 3) {
                this.getNextPage()
            }
        },
        getProducts() {
            this.loading.open('正在加载模板...')
            const params = this.filter
            this.key = this.infiniteScroll.setKey(Object.assign(params, { tab: 'new' }))
            this.info = this.infiniteScroll.getInfo(this.key)
            if (!this.info.list.length) {
                this.getNextPage()
            } else {
                this.loading.close()
            }
        },
        getNextPage() {
            this.infiniteScroll.getMoreItems(this.key).catch(err => {
                // this.notifier.fail(`二维码模板获取失败`)
                this.loading.close()
                err && this.logger.error(err)
            })
        },
        transferData(data) {
            if (data && util.isString(data)) {
                const cover = JSON.parse(data)
                const item = cover[0]
                return item ? item[Object.keys(item)[0]] : ''
            } else {
                return ''
            }
        },
        getBackgroundImage(src, size) {
            src = Vue.filter('qiniuZoom')(src, size)
            return Vue.filter('backgroundImage')(src)
        },
        getName(pName) {
            if (pName.length <= 8) {
                return pName
            } else {
                return pName.substring(0, 8) + '...'
            }
        },
        // 使用模板
        useTemplate(pTemplate) {
            if (!util.login()) {
                return
            }
            const idcode = `${pTemplate.sourceId}_${pTemplate.code}`
            this.api.page.getPage(pTemplate.productTypeMap.page_id, idcode, pTemplate.id).then(res => {
                Vue.store.commit('PRODUCT_ID', { productId: pTemplate.id, sourceUser: pTemplate.sourceUser })
                let qrcodeElementJson
                if (res && res.data && res.data.success && res.data.obj && res.data.obj.elements.length > 0) {
                    res.data.obj.elements.forEach(element => {
                        if (element.type === elementType.qrcode) {
                            qrcodeElementJson = element
                        }
                    })
                }
                if (qrcodeElementJson !== null) {
                    Vue.store.commit('QRCODE_TEMPLATE_USE', {
                        pageJson: res.data.obj,
                        elementJson: qrcodeElementJson,
                        template: pTemplate,
                        templateType: this.getQrcodeTemplateType // 艺术二维码类型
                    })
                } else {
                    this.loading.open('模板里面没有找到二维码组件')
                }
            })
        }
    }
}
</script>

<style lang='scss'>
$width: 100%;
$height: 100%;
$itemWidth: 184px;
$itemHeight: 212px;
.eqc-qrcode-template {
    width: $width;
    height: 100%;
    float: left;
    background: #ffffff;
    .content {
        overflow: auto;
        position: relative;
        padding: 0 36px;
        height: calc(100% - 76px);
        width: 100%;
        .eqc-ul {
            padding-bottom: 24px;
        }
        .li-margin {
            margin-bottom: 16px;
        }
        .li-style {
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            width: $itemWidth;
            height: $itemHeight;
            float: left;
            transition: all 0.3s;
            background: rgba(255, 255, 255, 1);
            &.active {
                background: #eceef0;
                .check {
                    background: $blue-normal;
                }
            }
            .cover {
                position: relative;
                width: $itemWidth;
                height: $itemWidth;
                background: no-repeat center/contain;
            }
            .qrcode-info {
                width: 100%;
                height: 100%;
                .qrcode-demo {
                    width: 100%;
                    height: $itemWidth;
                    background: gray;
                    background-repeat: no-repeat;
                    background-size: cover;
                    box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.1);
                    &:hover {
                        box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
                    }
                }
                .qrcode-name {
                    font-size: 12px;
                    font-weight: 400;
                    color: rgba(17, 17, 17, 1);
                    position: relative;
                    top: 11px;
                }
                .qrcode-charge {
                    font-size: 12px;
                    font-weight: 400;
                    color: rgba(21, 147, 255, 1);
                    float: right;
                    position: relative;
                    top: 12px;
                }
            }
            .use-mask {
                display: none;
                width: $itemWidth;
                height: 68px;
                position: absolute;
                bottom: 28px;
                justify-content: center;
                align-items: center;
                background: rgba(255, 255, 255, 1);
                button {
                    font-size: 14px;
                    font-weight: 400;
                    color: rgba(255, 255, 255, 1);
                    cursor: pointer;
                    width: 96px;
                    height: 36px;
                    background: rgba(21, 147, 255, 1);
                    border-radius: 3px;
                }
            }
            &:hover {
                .qrcode-info {
                    .qrcode-demo {
                        box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
                    }
                }
                .use-mask {
                    display: flex;
                }
            }
        }
        @media screen and (max-width: 1252px) {
            .li-margin {
                &:not(:nth-child(3n + 1)) {
                    margin-left: calc((100% - 184px * 3) / 2);
                }
            }
        }
        @media screen and (min-width: 1253px) and (max-width: 1464px) {
            .li-margin {
                &:not(:nth-child(4n + 1)) {
                    margin-left: calc((100% - 184px * 4) / 3);
                }
            }
        }
        @media screen and (min-width: 1465px) and (max-width: 1676px) {
            .li-margin {
                &:not(:nth-child(5n + 1)) {
                    margin-left: calc((100% - 184px * 5) / 4);
                }
            }
        }
        @media screen and (min-width: 1677px) and (max-width: 1888px) {
            .li-margin {
                &:not(:nth-child(6n + 1)) {
                    margin-left: calc((100% - 184px * 6) / 5);
                }
            }
        }
        @media screen and (min-width: 1889px) and (max-width: 2100px) {
            .li-margin {
                &:not(:nth-child(7n + 1)) {
                    margin-left: calc((100% - 184px * 7) / 6);
                }
            }
        }
        @media screen and (min-width: 2101px) {
            .li-margin {
                &:not(:nth-child(8n + 1)) {
                    margin-left: calc((100% - 184px * 8) / 7);
                }
            }
        }
    }
}
</style>
