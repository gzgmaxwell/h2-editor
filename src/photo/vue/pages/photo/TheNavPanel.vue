<template>
    <div
        :class="{show: (navPanel.show&&isUploadImage)}"
        class="eqc-photo-nav-panel"
    >
        <div class="panel">
            <!-- 基础 -->
            <nav-base
                v-if="navStatusArray.base.render"
                v-show="navStatusArray.base.show"
                class="content"
            />
            <!-- 裁剪 -->
            <nav-crop
                v-if="navStatusArray.crop.render"
                v-show="navStatusArray.crop.show"
                :mode="mode"
                class="content"
            />
            <!-- 旋转 -->
            <nav-rotate
                v-if="navStatusArray.rotate.render"
                v-show="navStatusArray.rotate.show"
                class="content"
            />
            <!-- 滤镜 -->
            <nav-filter
                v-if="navStatusArray.filter.render"
                v-show="navStatusArray.filter.show"
                class="content"
            />
            <!-- 贴纸 -->
            <nav-paster
                v-if="navStatusArray.paster.render"
                v-show="navStatusArray.paster.show"
                class="content"
            />
            <!-- 文字 -->
            <nav-text
                v-if="navStatusArray.text.render"
                v-show="navStatusArray.text.show"
                class="content"
            />
        </div>
    </div>
</template>

<script>
import NavBase from './nav/NavBase.vue'
import NavCrop from './nav/NavCrop.vue'
import NavRotate from './nav/NavRotate.vue'
import NavFilter from './nav/NavFilter.vue'
import NavPaster from './nav/NavPaster.vue'
import NavText from './nav/NavText.vue'
export default {
    components: {
        NavBase,
        NavCrop,
        NavRotate,
        NavFilter,
        NavPaster,
        NavText
    },
    props: {
        mode: {
            type: Number,
            default: 1
        }
    },
    data() {
        return {
            navStatusArray: {
                base: {
                    render: true,
                    show: true
                },
                crop: {
                    render: false,
                    show: false
                },
                rotate: {
                    render: false,
                    show: false
                },
                filter: {
                    render: false,
                    show: false
                },
                paster: {
                    render: false,
                    show: false
                },
                text: {
                    render: false,
                    show: false
                }
            }
        }
    },
    computed: {
        photoLayout() {
            return Vue.store.state.photoLayout
        },
        photoScene() {
            return Vue.store.state.photoScene
        },
        navSelectedItem() {
            return this.photoLayout.nav.selectedItem
        },
        navPanel() {
            return this.photoLayout.navPanel
        },
        isUploadImage() {
            return this.photoScene.isUploadImage
        }
    },
    watch: {
        navSelectedItem() {
            this.refreshNavStatus(this.navSelectedItem.type)
        }
    },
    mounted() {
        this.refreshNavStatus(this.navSelectedItem.type)
    },
    methods: {
        refreshNavStatus(pNavName) {
            for (const key in this.navStatusArray) {
                if (key === pNavName) {
                    this.navStatusArray[key].render = true
                    this.navStatusArray[key].show = true
                } else {
                    this.navStatusArray[key].show = false
                }
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-photo-nav-panel {
    position: relative;
    flex: none;
    width: 0;
    height: 100%;
    background: rgba(255, 255, 255, 1);
    opacity: 0;
    transition: all 0.3s;
    z-index: 4; // 需要在header之上才有阴影
    &.show {
        width: 288px;
        box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.12);
        opacity: 1;
    }
    .panel {
        height: 100%;
        overflow: hidden;
        > .content {
            height: 100%;
            width: 288px;
        }
    }
}
</style>
