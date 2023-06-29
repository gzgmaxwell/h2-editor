<template>
    <transition name="moveright">
        <div
            v-if="option.show"
            class="eqc-background-more"
        >
            <!-- 头部 -->
            <div class="header">
                <div class="name">
                    <span>{{ isTexture?'背景纹理':'背景图片' }}</span>
                    <span
                        v-if="isTexture"
                        class="hint--bottom hint--rounded"
                        data-hint="纹理和图片会相互替换"
                    >
                        <i class="eqf-why-f" />
                    </span>
                </div>
                <span
                    class="more"
                    @click="backClick"
                ><i class="eqf-left" />返回</span>
            </div>
            <!-- 尺寸 透明 -->
            <div
                v-if="isTexture"
                class="setting"
            >
                <div class="property-box">
                    <div class="property">
                        <div class="name">
                            尺寸
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
                            透明
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
            <!-- 展示list -->
            <div
                ref="wrap"
                v-scroll-bar="{onScrollMove}"
                :style="{height:height+'px'}"
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
                        bg-color="#fff"
                    />
                </ul>
                <base-list-status
                    v-if="!info.list.length"
                    :is-busy="info.isBusy"
                    :is-empty="!info.isBusy && !info.list.length"
                    msg-result="暂无图片"
                />
            </div>
            <!-- footer -->
            <div
                class="footer"
                @click="footerClick"
            >
                没有想要的背景？
            </div>
        </div>
    </transition>
</template>
<script>
import imageItem from './ImageItem.vue'
export default {
    components: {
        imageItem
    },
    props: {
        option: {
            type: Object,
            default: () => ({}) //  show 控制显示  type:1 代表背景图片 2 代表 纹理
        }
    },
    data() {
        return {
            info: {},
            categoryId: -1,
            search: {
                keyWords: ''
            },
            height: 0,
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
            return this.background.src === '' || this.background.type !== 0 // 没有图片不能设置透明度
        },
        isTexture() {
            return this.option.type === 2
        }
    },
    watch: {
        'background.size': function (size) {
            this.setBackground(this.background)
        },
        'background.opacity': function (opacity) {
            this.setBackground(this.background)
        },
        'info.list'() {
            if (this.info.list) {
                this.info.list.map(item => { item.useType = this.option.type })
            }
        }
    },
    methods: {
        init(type) {
            if (type === 1) {
                this.categoryId = Vue.env.mall.backgroundImageId
                this.height = document.body.clientHeight - 48 - 40
            } else if (type === 2) {
                this.categoryId = Vue.env.mall.backgroundId
                this.height = document.body.clientHeight - 58 - 40 - 40
            }

            this.getProducts()
        },
        footerClick() {
            // 跳转到长表单
        },
        // 返回
        backClick() {
            this.$emit('backClick')
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
.eqc-background-more {
    position: absolute;
    left: 0;
    top: 0;
    padding: 20px 16px;
    background: white;
    height: 100%;
    width: 100%;
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
                color: #252b3f;
                &:hover {
                    color: #1593ff;
                }
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
            .eqc-list-status-infinite {
                background: white;
            }
        }
    }
    .footer {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 48px;
        line-height: 48px;
        font-size: 13px;
        color: #252b3f;
        font-weight: 400;
        text-align: center;
        background: white;
        border-top: 1px solid #ccd5db;
        cursor: pointer;
    }
}
</style>
