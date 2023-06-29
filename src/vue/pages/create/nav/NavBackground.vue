<template>
    <div
        v-scroll-bar
        class="eqc-nav-background"
    >
        <!-- 【基础、高级】 -->
        <div class="navigator">
            <span
                v-for="(item,i) in tabList"
                :key="i"
                :class="{active:tabSelected===item}"
                class="menu"
                @click="selectTab(item)"
            >{{ item.name }}</span>
            <span
                class="clear"
                @click="clearBackground"
            >清空背景</span>
        </div>
        <div
            ref="wrap"
            v-scroll-bar
            :style="{height:height+'px'}"
            class="content"
        >
            <!-- 添加ul 标签是为了让滚动条展示出来 -->
            <ul>
                <li>
                    <!-- 基础 -->
                    <background-basic
                        v-show="tabSelected === tabList[0]"
                        ref="basic"
                    />
                    <!-- 高级 -->
                    <background-high v-show="tabSelected === tabList[1]" />
                    <!-- 背景图片列表  -->
                    <image-list
                        v-if="tabSelected === tabList[0]"
                        @refreshScroll="refreshScrollBar"
                        @moreClick="moreClick"
                    />
                    <!-- 纹理图片列表 -->
                    <texture-list
                        v-if="tabSelected === tabList[0]"
                        @refreshScroll="refreshScrollBar"
                        @moreClick="moreClick"
                    />
                </li>
            </ul>
        </div>
        <!-- 底部-文件上传 -->
        <background-foot />
        <!-- more -->
        <background-more
            ref="backgroundMore"
            :option="detailOption"
            @backClick="backClick"
        />
    </div>
</template>

<script>
import BackgroundBasic from './background/BackgroundBasic.vue'
import BackgroundHigh from './background/BackgroundHigh.vue'
import BackgroundFoot from './background/BackgroundFoot.vue'
import ImageList from './background/ImageList.vue'
import TextureList from './background/TextureList.vue'
import BackgroundMore from './background/BackgroundMore.vue'
export default {
    components: {
        BackgroundBasic,
        BackgroundHigh,
        BackgroundFoot,
        ImageList,
        TextureList,
        BackgroundMore
    },
    data() {
        return {
            tabList: [{
                name: '基础',
                type: 'basic'
            }, {
                name: '高级',
                type: 'high'
            }],
            tabSelected: null,
            detailOption: {
                show: false,
                type: 0
            },
            height: 0
        }
    },
    computed: {
        eqxPage() {
            return this.$store.state.scene.eqxPage
        },
        layout() {
            return this.$store.state.layout
        },
        itemClickEvent() {
            return this.layout.nav.itemClickEvent
        }
    },
    watch: {
        itemClickEvent() {
            this.detailOption.show = false
        }
    },
    created() {
        this.tabSelected = this.tabList[0]
        this.initHeight()
    },
    methods: {
        initHeight() {
            this.height = document.body.clientHeight - 140
            this.refreshScrollBar()
        },
        refreshScrollBar() {
            setTimeout(() => this.$refs.wrap.myScroll.scrollToTop(), 100)
        },
        backClick() {
            this.detailOption.show = false
        },
        selectTab(item) {
            this.tabSelected = item
        },
        clearBackground() {
            this.$refs.basic.backToPure()
            this.eqxPage.eqxBackground.clearBackground()
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        moreClick(type) {
            this.detailOption.type = type
            this.$refs.backgroundMore.init(type)
            this.detailOption.show = true
        }
    }
}
</script>

<style lang="scss">
.eqc-nav-background {
    background-color: #ffffff;
    position: relative;
    .navigator {
        margin: 0 16px;
        display: flex;
        align-items: center;
        height: 60px;
        color: #252b3f;
        .menu {
            font-size: 14px;
            font-weight: 600;
            height: 58px;
            line-height: 56px;
            margin-right: 20px;
            cursor: pointer;
            border-top: 2px solid transparent;
            margin-top: -2px;
            &.active {
                color: #1593ff;
                border-top: 2px solid #1593ff;
            }
            &:hover {
                color: #1593ff;
            }
        }
        .clear {
            cursor: pointer;
            font-size: 13px;
            line-height: 18px;
            position: absolute;
            right: 16px;
            top: 21px;
            &:hover {
                color: #1593ff;
            }
        }
    }
}
</style>
