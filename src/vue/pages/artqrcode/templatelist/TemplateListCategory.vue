<template>
    <div class="eqc-qrcode-templist-category">
        <ul
            v-if="propertyList.length > 0"
            class="category-list"
        >
            <li
                v-for="(item,i) of propertyList"
                v-show="item.visible"
                :key="i"
                :class="[{active:item.id===qrcodeTemplateListFilter.id}]"
                @click="propertyItemClick(item)"
                v-text="item.name"
            />
        </ul>
    </div>
</template>

<script>
export default {
    props: {
        mode: {
            type: Number,
            default: null
        },
        close: {
            type: Function,
            default: null
        }
    },
    data() {
        return {
            propertyList: []
        }
    },
    computed: {
        qrcode() {
            return Vue.store.state.artQrcode
        },
        // 当前模板选择类型
        selectedTemplateType() {
            return this.qrcode.selectedTemplateType
        },
        // 获取当前选择模板类型的风格属性id
        getSelectedTemplateTypeStyleId() {
            if (this.selectedTemplateType === '立体') {
                return Vue.env.mall.artQrcodeTemplatePropertyOfStyleId[1]
            } else if (this.selectedTemplateType === '动态') {
                return Vue.env.mall.artQrcodeTemplatePropertyOfStyleId[2]
            } else {
                return Vue.env.mall.artQrcodeTemplatePropertyOfStyleId[0]
            }
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
        qrcodeTemplateListFilter() {
            return this.qrcode.qrcodeTemplateListFilter
        }
    },
    watch: {
        // 监视变化
        selectedTemplateType() {
            this.initCategory()
        }
    },
    created() {
        this.initCategory()
    },
    methods: {
        propertyItemClick(pItem) {
            Vue.store.commit('QRCODE_TEMPLATE_LIST_FILTER', { filter: pItem })
        },
        initCategory() {
            Vue.loading.open('分类加载中')
            Vue.api.product.getAttributeMallDTOById(this.getSelectedTemplateTypeStyleId)
                .then(res => {
                    Vue.loading.close()
                    if (res.data) {
                        this.propertyList = []
                        this.propertyList.push({
                            id: '',
                            name: '全部',
                            visible: true,
                            selected: true
                        })
                        const getTemplateListPromiseArray = []
                        res.data.valueList.forEach(element => {
                            this.propertyList.push({
                                id: element.id,
                                name: element.name,
                                visible: false
                            })
                            getTemplateListPromiseArray.push(Vue.api.product.getNewProducts(Object.assign({
                                type: this.getSelectedTemplateTypeId, // 艺术二维码模板分类
                                mostType: 'composite', // composite：综合排序，newest：最新，hottest：最热
                                free: 0, // 0：免费，''：不免费
                                memberFree: 0, // 1：会员免费，2：不是会员免费
                                color: '', // ''：所有
                                attrValue: element.id, // 属性值id
                                pageSize: 1,
                                pageNo: 1
                            }, { tab: 'new' })))
                        })
                        Promise.all(getTemplateListPromiseArray).then(res => {
                            res.forEach((item, index) => {
                                if (item.status === 200 && item.data.success && item.data.list.length > 0) {
                                    this.propertyList[index + 1].visible = true
                                }
                            })
                        })
                        // 需要挨个请求分类下是否有模板数据，如果没有则过滤掉
                        Vue.store.commit('QRCODE_TEMPLATE_LIST_FILTER', { filter: this.propertyList[0] })
                    }
                })
                .catch(err => {
                    err && Vue.logger.error(err)
                    Vue.loading.close()
                })
        }
    }
}
</script>

<style lang="scss">
.eqc-qrcode-templist-category {
    width: 100%;
    height: 76px;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: flex-start;
    margin-top: 10px;
    ul.category-list {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: flex-start;
        align-items: center;
        margin-left: 36px;
        li {
            background: #f0f3f4;
            border-radius: 14px;
            padding: 0px 12px;
            font-size: 13px;
            font-weight: 400;
            color: #2f3c4d;
            height: 28px;
            line-height: 28px;
            cursor: pointer;
            margin-right: 16px;
            margin: 4px 16px 0 0;
            &.active {
                background: rgba(21, 147, 255, 1);
                color: rgba(255, 255, 255, 1);
            }
            &:last-child {
                margin-right: 0px;
            }
            &:hover {
                color: #1593ff;
            }
        }
    }
}
</style>
