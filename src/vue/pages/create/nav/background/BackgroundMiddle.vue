<template>
    <div class="eqc-background-middle">
        <div class="setting">
            <image-upload />
            <div class="property-box">
                <div class="property">
                    <div class="name">
                        纹理尺寸
                    </div>
                    <base-input
                        :model="background"
                        :min="1"
                        :max="100"
                        :style="{pointerEvents: disableSize ? 'none' : '', background: disableSize ? '#ECEEF0' : ''}"
                        model-key="size"
                        unit=""
                        unit-view="%"
                    />
                </div>
                <div class="property">
                    <div class="name">
                        透明度
                    </div>
                    <base-input
                        :model="background"
                        :min="0"
                        :max="100"
                        :reverse="true"
                        :style="{pointerEvents: disableOpacity ? 'none' : '', background: disableOpacity ? '#ECEEF0' : ''}"
                        model-key="opacity"
                        unit=""
                        unit-view="%"
                    />
                </div>
            </div>
        </div>
        <div
            ref="wrap"
            v-scroll-bar="{onScrollMove}"
            class="content"
        >
            <ul
                v-show="info.list.length"
                class="list"
            >
                <li
                    class="eqc-background-item clear"
                    @click="clearBackground"
                />
                <image-item
                    v-for="item of info.list"
                    :key="item.id"
                    :item="item"
                />
                <base-list-status-infinite
                    v-if="info.list.length && (info.isBusy || info.isEnd)"
                    :is-busy="info.isBusy"
                    :is-end="info.isEnd"
                />
            </ul>
            <base-list-status
                v-if="!info.list.length"
                :is-busy="info.isBusy"
                :is-empty="!info.isBusy && !info.list.length"
                msg-result="暂无图片"
            />
        </div>
    </div>
</template>

<script>
import ImageUpload from './ImageUpload.vue'
import ImageItem from './ImageItem.vue'

export default {
    components: {
        ImageUpload,
        ImageItem
    },
    data() {
        return {
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
        },
        disableSize() {
            return this.background.src === '' || this.background.type !== 0 // 有图且是纹理图片才能设置尺寸
        },
        disableOpacity() {
            return this.background.src === '' // 没有图片不能设置透明度
        }
    },
    watch: {
        'background.size': function (size) {
            this.setBackground(this.background)
        },
        'background.opacity': function (opacity) {
            this.setBackground(this.background)
        }
    },
    created() {
        this.categoryId = Vue.env.mall.backgroundId
        this.getProducts()
    },
    methods: {
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
            setTimeout(() => this.$refs.wrap.myScroll.scrollToTop(), 100)
        },
        onScrollMove(e, info) {
            if (info.scrollY + 100 > info.maxScrollY) {
                this.getNextPage()
            }
        },
        getNextPage() {
            Vue.infiniteScroll.getMoreItems(this.key)
                .catch(err => err && this.logger.error(err))
        }
    }
}
</script>

<style lang="scss">
.eqc-background-middle {
    height: calc(100% - 61px - 64px);
    .setting {
        padding: 16px;
        .custom {
            width: 100%;
            font-size: 12px;
        }
        .property-box {
            display: flex;
            justify-content: space-between;
            .property {
                width: 120px;
                .name {
                    height: 40px;
                    line-height: 40px;
                    font-size: 12px;
                }
            }
        }
    }
    .content {
        position: relative;
        height: calc(100% - 138px);
        padding: 0 16px;
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
