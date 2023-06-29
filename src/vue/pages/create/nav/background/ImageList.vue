<template>
    <div class="eqc-background-image-list">
        <!-- 头部 -->
        <div class="header">
            <div class="name">
                <span>背景图片</span>
            </div>
            <span
                class="more"
                @click="moreClick"
            >更多<i class="eqf-right" /></span>
        </div>
        <div class="content">
            <ul
                v-show="list.length"
                class="list"
            >
                <li
                    class="eqc-background-item clear"
                    @click="clearBackground"
                />
                <image-item
                    v-for="(item,i) of list"
                    :key="i"
                    :item="item"
                />
            </ul>
        </div>
    </div>
</template>
<script>
import imageItem from './ImageItem.vue'
export default {
    components: {
        imageItem
    },
    data() {
        return {
            list: [],
            info: {},
            categoryId: -1,
            search: {
                keyWords: ''
            },
            key: '' // 加载列表用的key
        }
    },
    computed: {
        eqxPage() {
            return this.$store.state.scene.eqxPage
        },
        background() {
            return this.eqxPage.pageJson.properties.background.middle
        }

    },
    watch: {
        'info.list'() {
            if (this.info.list) {
                this.info.list.map(item => { item.useType = 1 })
                if (this.info.list.length > 5) {
                    this.list = [...this.info.list.slice(0, 5)]
                } else {
                    this.list = this.info.list
                }
            }
        }
    },
    created() {
        this.categoryId = Vue.env.mall.backgroundImageId
        this.getProducts()
    },
    methods: {
        // 点击更多
        moreClick() {
            this.$emit('moreClick', 1)
        },
        setBackground(background) {
            this.eqxPage.eqxBackground.setBackgroundMiddle(background)
        },
        clearBackground() {
            this.eqxPage.eqxBackground.clearBackgroundMiddle()
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        getProducts() {
            const params = {
                categoryId: this.categoryId,
                apiCode: Vue.env.mall.apiCode[0]
            }
            this.key = Vue.infiniteScroll.setKey(Object.assign(params, { tab: 'sys' }))
            this.info = Vue.infiniteScroll.getInfo(this.key)
            if (!this.info.list.length) {
                this.getNextPage()
            }
        },
        getNextPage() {
            Vue.infiniteScroll.getMoreItems(this.key).then(() => {
                this.$emit('refreshScroll')
            }).catch(err => err && this.logger.error(err))
        }
    }
}
</script>
<style lang="scss">
.eqc-background-image-list {
    padding: 0 16px;
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-size: 13px;
        color: #111111;
        line-height: 18px;
        .name {
            font-weight: 600;
            i {
                margin-left: 1px;
                color: #1593ff;
            }
        }
        .more {
            color: #252b3f;
            cursor: pointer;
            display: flex;
            align-items: center;
            i {
                font-size: 16px;
            }
        }
    }
    .setting {
        margin-bottom: 12px;
        .custom {
            width: 100%;
            font-size: 12px;
        }
        .property-box {
            display: flex;
            justify-content: space-between;
            .property {
                width: 124px;
                height: 30px;
                border: 1px solid #ccd5db;
                border-radius: 2px;
                display: flex;
                .name {
                    width: 42px;
                    line-height: 30px;
                    font-size: 12px;
                    text-align: center;
                    border-right: 1px solid #ccd5db;
                    background: #f6f9fa;
                }
                .eqc-base-input {
                    width: 82px;
                    input {
                        border: 0;
                    }
                }
            }
        }
    }
    .content {
        .list {
            position: relative;
            display: flex;
            flex-wrap: wrap;
            padding-bottom: 40px;
            .clear {
                background: url("../../../../../img/opacity.png");
            }
        }
    }
}
</style>
