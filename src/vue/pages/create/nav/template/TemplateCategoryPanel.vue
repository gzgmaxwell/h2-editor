<template>
    <transition name="rotate-y-left">
        <div
            v-if="templateCateogry.show"
            class="eqc-template-category"
        >
            <label class="main-title">全部分类</label>
            <i
                class="icon close eqf-no"
                @click="close()"
            />
            <div
                v-scroll-bar="{onScrollMove}"
                class="content"
            >
                <ul>
                    <li
                        v-for="category in categoryList"
                        :key="category.id"
                    >
                        <div class="category">
                            <div
                                class="title"
                                v-text="category.name"
                            />
                            <div class="list">
                                <ul
                                    class="items"
                                >
                                    <li
                                        v-for="item in category.valueList"
                                        :key="item.id"
                                        :class="['item',item.id===templateCateogry.selectedCategoryItem.id?'selected':'']"
                                        @click="categoryItemClick(item)"
                                        v-text="item.name"
                                    />
                                </ul>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </transition>
</template>
<script>
export default {
    data() {
        return {
            categoryList: []
        }
    },
    computed: {
        sceneType() {
            return Vue.store.state.scene.eqxScene.sceneJson.type
        },
        templateCateogry() {
            return Vue.store.state.layout.templateCateogry
        }
    },
    created() {
        Vue.api.product.getTemplateCategory(this.sceneType).then(data => {
            this.categoryList = data.data.list
        }).catch((err) => {
            err && this.logger.error(err)
        })
    },
    methods: {
        onScrollMove(e, info) {

        },
        close() {
            Vue.store.commit('TEMPLATE_CATEGORY', { show: false })
        },
        // 选择分类
        categoryItemClick(pSelectedItem) {
            Vue.store.commit('TEMPLATE_CATEGORY', { selectedCategoryItem: pSelectedItem })
        }
    }
}
</script>
<style lang="scss">
.eqc-template-category {
    position: absolute;
    left: 288px;
    bottom: 0px;
    width: 288px;
    height: 576px;
    z-index: 3;
    transition: all 0.3s;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
    border-radius: 2px;
    padding: 48px 0px 16px 0px;
    transform-origin: left;
    perspective: 640px;
    .main-title {
        position: absolute;
        left: 16px;
        top: 16px;
        font-size: 13px;
        font-weight: 600;
        color: #111111;
    }
    .close {
        position: absolute;
        top: 16px;
        right: 16px;
        color: #252b3f;
        font-size: 16px;
        cursor: pointer;
        z-index: 1;
        &:hover {
            color: #ff2a6a;
        }
    }
    .content {
        height: 512px;
        position: relative;
        overflow: hidden;
        padding: 0px 16px 0px 4px;
        .category {
            margin-bottom: 16px;
            .title {
                font-size: 13px;
                font-weight: 600;
                color: rgba(51, 51, 51, 1);
                margin-bottom: 4px;
                text-indent: 12px;
            }
            .list {
                height: auto;
                .items {
                    height: auto;
                    .item {
                        float: left;
                        width: auto;
                        height: 28px;
                        line-height: 28px;
                        text-align: center;
                        background: rgba(240, 243, 244, 1);
                        border-radius: 2px;
                        padding: 0px 8px;
                        margin-top: 8px;
                        margin-left: 12px;
                        font-size: 12px;
                        font-family: HelveticaNeue;
                        color: rgba(37, 43, 63, 1);
                        cursor: pointer;
                        &.selected {
                            background: rgba(21, 147, 255, 1);
                            color: rgba(255, 255, 255, 1);
                        }
                        &:hover:not(.selected) {
                            color: rgba(21, 147, 255, 1);
                        }
                    }
                    &:after {
                        content: "";
                        display: block;
                        clear: both;
                    }
                }
            }
        }
    }
}
</style>
