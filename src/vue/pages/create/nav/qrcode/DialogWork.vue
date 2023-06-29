<template>
    <div class="eqc-dialog-work dialog">
        <div class="tab">
            <div class="works">
                我的作品
            </div>
            <div
                v-for="(item,index) of productType"
                :key="item.key"
                :class="item.value===activeItem?'active':''"
                class="item"
                @click="getProduct(item,index)"
            >
                {{ item.value }}
                <p
                    v-if="item.tag"
                    class="newTag"
                >
                    new
                </p>
            </div>
            <a
                class="help"
                href="//qingsheji.help.eqxiu.com/qrc.html"
                target="_blank"
            >
                <i class="why eqf-why-l" />
                <p>怎么运用作品二维码</p>
            </a>
        </div>
        <i
            class="close eqf-no"
            @click="cancle"
        />
        <div
            v-if="productList[productListKey].length>0"
            class="content"
        >
            <a
                v-if="!loading && productList[productListKey].length > 0"
                :href="productType[activeIndex].link"
                class="link-btn"
                target="_blank"
            >创建{{ activeItem }}作品</a>
            <ul>
                <li
                    v-for="item of productList[productListKey]"
                    :key="item.key"
                >
                    <div class="item">
                        <div class="product">
                            <img
                                :src=" item.coverImg ? (item.coverImg.indexOf('/tencent/') > -1 ? `${videoImgPre}${item.coverImg}` : item.coverImg) : hostFile + (item.cover ? item.cover :item.coverKey)"
                                class="img"
                            >
                            <div class="mark">
                                <base-button
                                    class="button blue"
                                    @click.native="getProductInfo(item)"
                                >
                                    使用
                                </base-button>
                            </div>
                        </div>

                        <p> {{ item.name||item.title||item.activityName }}</p>
                    </div>
                </li>
            </ul>

            <base-pagination
                :page-no="pageNo"
                :page-size="pageSize"
                :total-count="totalCount"
                :on-to-page="onToPage"
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
</template>

<script>
import { host } from '../../../../../config/env'
import basePagination from '../../../../comps/BasePagination.vue'
export default {
    components: {
        basePagination
    },
    props: {
        data: {
            type: Object,
            default: null
        },
        close: {
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
            pageSize: 8,
            totalCount: 0
        }
    },
    mounted() {
        this.productType.forEach((item, index) => {
            item = Object.assign(item, { isOne: true, totalCount: 0, pageNo: 1 })
        })
        this.getProduct(this.productType[this.activeIndex], this.activeIndex)
    },
    methods: {
        onToPage(pageNo) {
            this.pageNo = pageNo
            this.productType[this.activeIndex].pageNo = pageNo
            this.getProduct(this.productType[this.activeIndex], this.activeIndex, true)
        },
        cancle() {
            this.close()
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
            this.close({ text: link })
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
        }
    }
}
</script>

<style lang="scss">
.eqc-dialog-work {
    width: 960px;
    height: 600px;
    position: relative;
    display: flex;
    .tab {
        border-radius: 4px 0 0 4px;
        width: 176px;
        height: 100%;
        background: #222528;
        color: #ffffff;
        .works {
            font-size: 18px;
            height: 60px;
            line-height: 60px;
            padding-left: 28px;
        }
        .item {
            height: 48px;
            line-height: 48px;
            font-size: 14px;
            padding-left: 28px;
            transition: all 0.3s linear;
            cursor: pointer;
            position: relative;
            &:hover {
                background: #1593ff;
            }
            .newTag {
                font-size: 12px;
                background: #ff296a;
                color: #ffffff;
                border-radius: 6px;
                width: 34px;
                height: 14px;
                line-height: 12px;
                text-align: center;
                position: absolute;
                top: 10px;
                left: 60px;
            }
        }
        .active {
            background: #1593ff;
        }
        .help {
            position: absolute;
            bottom: 23px;
            left: 20px;
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: center;
            align-items: flex-start;
            color: rgba(144, 153, 164, 1);
            .why {
                margin-right: 2px;
                font-size: 16px;
            }
            p {
                font-size: 13px;
                line-height: 15px;
            }
        }
    }
    .close {
        position: absolute;
        right: 33px;
        top: 23px;
        font-size: 16px;
        color: #666666;
        z-index: 1;
        cursor: pointer;
        font-size: 20px;
        &:hover {
            color: $red-normal;
        }
    }
    .content {
        width: 784px;
        position: relative;
        .pagination {
            position: absolute;
            left: 31px;
            bottom: 28px;
        }
        .link-btn {
            color: rgba(21, 147, 255, 1);
            padding: 20px 0 0 28px;
            position: absolute;
        }
        > ul {
            margin-top: 60px;
            margin-left: 12px;
            height: 458px;
            li {
                float: left;
                margin-left: 16px;
                margin-bottom: 16px;
            }
            .item {
                width: 170px;
                height: 218px;
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
                    border-radius: 3px;
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
                    width: 170px;
                    height: 170px;
                    border-radius: 4px;
                }
                p {
                    height: 48px;
                    font-size: 12px;
                    line-height: 48px;
                    color: #111111;
                    overflow: hidden;
                    text-overflow: ellipsis; //文本溢出显示省略号
                    white-space: nowrap; //文本不会换行（单行文本溢出）
                    width: 170px;
                    font-size: 13px;
                }
            }
        }
    }
}
</style>
