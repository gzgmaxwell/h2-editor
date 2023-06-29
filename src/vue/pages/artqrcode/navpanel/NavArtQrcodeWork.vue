<template>
    <div class="eqc-nav-artqrcode-work">
        <div class="head">
            <p class="title">
                作品
            </p>
            <nav-panel-tools
                :data="{type:'work'}"
                :clear="clear"
            />
        </div>
        <div
            v-show="isShowWork"
            class="create-work"
        >
            <div class="tabs">
                <div
                    v-for="(ptype,index) of productType"
                    :key="ptype.key"
                    :class="{active: ptype.value === activeItem}"
                    class="item"
                    @click="getProduct(ptype,index)"
                >
                    {{ ptype.value }}
                </div>
            </div>
            <div
                v-if="productList[productListKey].length > 0"
                class="content"
            >
                <div class="list-box">
                    <ul>
                        <li
                            v-for="pitem of productList[productListKey]"
                            :key="pitem.key"
                        >
                            <div class="item">
                                <div class="product">
                                    <img
                                        :src=" pitem.coverImg ? (pitem.coverImg.indexOf('/tencent/') > -1 ? `${videoImgPre}${pitem.coverImg}` : pitem.coverImg) : hostFile + (pitem.cover ? pitem.cover :pitem.coverKey)"
                                        class="img"
                                    >
                                    <div class="mark">
                                        <base-button
                                            class="button blue"
                                            @click.native="getProductInfo(pitem)"
                                        >
                                            生成
                                        </base-button>
                                    </div>
                                </div>

                                <p> {{ pitem.name || pitem.title || pitem.activityName }}</p>
                            </div>
                        </li>
                    </ul>
                </div>
                <base-pagination
                    :page-no="pageNo"
                    :page-size="pageSize"
                    :total-count="totalCount"
                    :on-to-page="onToPage"
                    :max-show-item="1"
                    :show-goto="false"
                    class="pagination"
                />
            </div>
            <base-list-status
                v-else
                :is-busy="loading"
                :is-empty="!loading && !productList[productListKey].length"
                :msg-result="`您还没有${activeItem}作品`"
                :show-btn="true"
                :btn-name="`创建${activeItem}作品`"
                :url="productType[activeIndex].link"
                class="content"
            />
        </div>

        <div
            v-show="isShowResult"
            class="create-result"
        >
            <div class="builder">
                <nav-panel-builder
                    ref="qrcodeBuilder"
                    :mode="mode"
                    :status-out="showBuilderQrcode() ? 201 : 100"
                    :qrcode-key-out="showBuilderQrcode() ? qrcodeKeyOut : null"
                    :qrcode-key-str-out="showBuilderQrcode() ? qrcodeKeyStrOut : null"
                />
            </div>
            <div
                class="redo"
                @click="redo"
            >
                更换作品
            </div>
        </div>
    </div>
</template>

<script>
import artQrcodeMode from '../../../../config/enum.artQrcodeMode.type'
import { host } from '../../../../config/env'
import basePagination from '../../../comps/BasePagination.vue'
import NavPanelBuilder from './panel/NavPanelBuilder.vue'
import NavPanelTools from './panel/NavPanelTools.vue'
import qrcodeType from '../../../../config/enum.qrcode.type'

export default {
    components: {
        basePagination,
        NavPanelBuilder,
        NavPanelTools
    },
    props: {
        item: {
            type: Object,
            default: null
        },
        mode: {
            type: Number,
            default: null
        },
        close: {
            type: Function,
            default: null
        },
        qrcodeKeyOut: {
            type: String,
            default: null
        },
        qrcodeKeyStrOut: {
            type: String,
            default: null
        },
        qrcodeTextOut: {
            type: String,
            default: null
        },
        qrcodeElementOut: {
            type: Object,
            default: null
        },
        qrcodeCompleteOut: {
            type: Function,
            default: null
        }
    },
    data() {
        return {
            loading: true,
            videoImgPre: host.videoImage,
            hostFile: host.file,
            productListKey: 'H5List',
            activeItem: '卡片H5',
            activeIndex: 0,
            productList: {
                H5List: [],
                EFromList: [],
                LongPageList: [],
                InteractH5List: [],
                VideoList: []
            },
            productType: [
                {
                    key: 'H5List',
                    value: '卡片H5',
                    link: 'http://store.eqxiu.com/h5/list',
                    tag: false
                },
                {
                    key: 'EFromList',
                    value: '易表单',
                    link: 'http://store.eqxiu.com/h5e/',
                    tag: false
                },
                {
                    key: 'LongPageList',
                    value: '长页',
                    link: 'http://store.eqxiu.com/h5l/',
                    tag: false
                },
                {
                    key: 'InteractH5List',
                    value: '互动',
                    link: 'http://store.eqxiu.com/gc/',
                    tag: false
                },
                {
                    key: 'VideoList',
                    value: '视频',
                    link: 'http://www.eqxiu.com/video/index',
                    tag: true
                }
            ],
            pageNo: 1,
            pageSize: 20,
            totalCount: 0,
            artQrcodeMode,
            created: false, // 是否已经生成二维码
            inputContent: '', // 输入内容
            applyContent: '', // 应用内容
            applyStyle: null // 当前样式
        }
    },
    computed: {
        isShowWork() {
            return !this.created
        },
        isShowResult() {
            return this.created
        }
    },
    watch: {

    },
    created() {
        if (this.mode === this.artQrcodeMode.setting &&
            this.qrcodeElementOut.elementJson.property.qcType !== qrcodeType.work) {
            return
        }
        if (this.qrcodeTextOut !== null && this.qrcodeTextOut !== '') {
            this.created = true
            this.inputContent = this.qrcodeTextOut
            this.applyContent = this.qrcodeTextOut
        }
    },
    mounted() {
        this.productType.forEach((item, index) => {
            item = Object.assign(item, { isOne: true, totalCount: 0, pageNo: 1 })
        })
        this.getProduct(this.productType[this.activeIndex], this.activeIndex)
    },
    methods: {
        showBuilderQrcode() {
            return this.mode === this.artQrcodeMode.setting && this.qrcodeElementOut.elementJson.property.qcType === qrcodeType.work
        },
        // 重新上传
        redo() {
            this.created = false
            this.inputContent = ''
            this.applyContent = ''
            this.applyStyle = null
        },
        onToPage(pageNo) {
            this.pageNo = pageNo
            this.productType[this.activeIndex].pageNo = pageNo
            this.getProduct(this.productType[this.activeIndex], this.activeIndex, true)
        },
        getProductInfo(item) {
            const type = this.activeItem
            const productType = this.productType

            let link = 'http://www.eqxiu.com'
            switch (type) {
                case productType[0].value: link = `${host.h5}/s/` + item.code
                    break
                case productType[1].value:
                case productType[2].value: link = `${host.h5}/ls/` + item.code
                    break
                case productType[3].value: link = [4, 5, 6, 7, 8, 9, 10].includes(item.templateType) ? `${host.hdh5}/gs2/` + item.code : `${host.hdh5}/gs/` + item.code
                    break
                case productType[4].value: link = `${host.video}/video/player/0/${item.playCode}`
            }
            this.inputContent = link
            // 将当前的值保存下来
            this.applyContent = this.inputContent
            this.createQrcode(null)
        },
        getData(key, data, item) {
            this.productList[key] = data.list
            if (data.map) {
                this.totalCount = item.totalCount = data.count || data.map.count
            } else {
                this.totalCount = item.totalCount = data.count
            }
            this.loading = false
            item.isOne = false
        },
        getProduct(item, index, flag) {
            const productType = this.productType
            const type = item.value
            this.activeIndex = index
            if (!item.isOne) {
                this.totalCount = item.totalCount
            }
            this.pageNo = item.pageNo
            this.activeItem = item.value
            this.productListKey = item.key
            switch (type) {
                case productType[0].value:
                    if (flag || item.isOne) {
                        this.loading = true
                        Vue.api.product.getH5Product({ pageNumber: this.pageNo, pageSize: this.pageSize }).then(res => {
                            this.getData(item.key, res.data, item)
                        }).catch(err => err && this.logger.error(err))
                    }
                    break
                case productType[1].value:
                    if (flag || item.isOne) {
                        this.loading = true
                        Vue.api.product.getEFormAndLongPage({ pageNo: this.pageNo, pageSize: this.pageSize, bizType: 1 }).then(res => {
                            this.getData(item.key, res.data, item)
                        }).catch(err => err && this.logger.error(err))
                    }
                    break
                case productType[2].value:
                    if (flag || item.isOne) {
                        this.loading = true
                        Vue.api.product.getEFormAndLongPage({ pageNo: this.pageNo, pageSize: this.pageSize }).then(res => {
                            this.getData(item.key, res.data, item)
                        }).catch(err => err && this.logger.error(err))
                    }
                    break
                case productType[3].value:
                    if (flag || item.isOne) {
                        this.loading = true
                        Vue.api.product.getInteractH5({ pageNo: this.pageNo, pageSize: this.pageSize }).then(res => {
                            this.getData(item.key, res.data, item)
                        }).catch(err => err && this.logger.error(err))
                    }
                    break
                case productType[4].value:
                    if (flag || item.isOne) {
                        this.loading = true
                        Vue.api.product.getVideoProduct({ pageNo: this.pageNo, pageSize: this.pageSize }).then(res => {
                            this.getData(item.key, res.data, item)
                        }).catch(err => err && this.logger.error(err))
                    }
            }
        },
        // 生成二维码
        createQrcode(pStyle) {
            if (this.applyContent === '') {
                this.notifier.warn('请先生成普通二维码')
                return
            }
            // 如果样式参数不为空则保存
            if (pStyle !== null) {
                this.applyStyle = pStyle
                this.inputContent = this.applyContent
            }
            this.$refs.qrcodeBuilder.create(this.applyContent, this.applyStyle)
            this.created = true
        },
        // 清除样式
        clear() {
            this.applyStyle = null
            this.applyContent = ''
            this.redo()
            this.$refs.qrcodeBuilder.setStatus()
        }
    }
}
</script>

<style lang="scss">
.eqc-nav-artqrcode-work {
    .head {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 21px;
        height: 20px;
        line-height: 20px;
        .title {
            font-size: 14px;
            font-weight: 600;
            color: rgba(17, 17, 17, 1);
        }
    }
    .create-work {
        width: 100%;
        height: 88%;
        .tabs {
            width: 268px;
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: space-between;
            align-items: center;
            text-align: center;
            .item {
                cursor: pointer;
                width: 54px;
                height: 32px;
                background: rgba(255, 255, 255, 1);
                border-left: 1px solid #ccd5db;
                border-top: 1px solid #ccd5db;
                border-bottom: 1px solid #ccd5db;
                font-size: 13px;
                font-weight: 400;
                color: rgba(47, 60, 77, 1);
                line-height: 32px;
                &:first-child {
                    border-radius: 2px 0px 0px 2px;
                }
                &:last-child {
                    border-radius: 0px 2px 2px 0px;
                    border-right: 1px solid #ccd5db;
                }
                &:hover {
                    color: #1593ff;
                }
            }

            .active {
                background: rgba(21, 147, 255, 1);
                border-left: 1px solid rgba(21, 147, 255, 1);
                border-top: 1px solid rgba(21, 147, 255, 1);
                border-bottom: 1px solid rgba(21, 147, 255, 1);
                color: #ffffff;
            }
        }

        .content {
            margin-top: 16px;
            width: 105%;
            height: 100%;
            overflow: hidden;
            position: relative;
            .pagination {
                margin: 20px 0 0 10px;
            }
            .list-box {
                overflow-y: scroll;
                width: 105%;
                height: calc(100% - 60px);

                &::-webkit-scrollbar {
                    width: 8px;
                }
                &::-webkit-scrollbar-track {
                    background-color: #f7f8f9;
                }
                &::-webkit-scrollbar-thumb {
                    background-color: rgba(0, 0, 0, 0.2);
                    height: 80px;
                    border-radius: 4px;
                }
                > ul {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    justify-content: flex-start;
                    align-items: center;
                    > li {
                        &:nth-child(odd) {
                            margin-right: 12px;
                        }
                    }
                    .item {
                        width: 128px;
                        height: 170px;
                        &:hover .mark {
                            opacity: 1;
                            background: rgba(0, 0, 0, 0.7);
                            transition: all 0.3s linear;
                        }
                        &:hover p {
                            color: #1593ff;
                            transition: all 0.3s linear;
                        }

                        .product {
                            position: relative;
                            font-size: 0;
                        }
                        .mark {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            background: rgba(0, 0, 0, 0);
                            opacity: 0;
                            .button {
                                position: absolute;
                                left: 50%;
                                top: 50%;
                                margin-left: -36px;
                                margin-top: -18px;
                                width: 72px;
                                height: 36px;
                                text-align: center;
                                line-height: 36px;
                                border-radius: 3px;
                            }
                        }
                        .img {
                            width: 128px;
                            height: 128px;
                        }
                        p {
                            height: 42px;
                            line-height: 42px;
                            color: #111111;
                            overflow: hidden;
                            text-overflow: ellipsis; //文本溢出显示省略号
                            white-space: nowrap; //文本不会换行（单行文本溢出）
                            width: 128px;
                            font-size: 13px;
                        }
                    }
                }
            }
        }
    }
    .create-result {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        // padding: 2px;
        .builder {
            width: 268px;
            height: 268px;
            background: #ff0;
        }
        .redo {
            width: 268px;
            height: 36px;
            background: rgba(255, 255, 255, 1);
            border-radius: 3px;
            border: 1px solid rgba(204, 213, 219, 1);
            margin-top: 16px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 400;
            color: rgba(47, 60, 77, 1);
            text-align: center;
            line-height: 36px;
            &:hover {
                background: rgba(21, 147, 255, 1);
                color: #ffffff;
            }
        }
    }
}
</style>
