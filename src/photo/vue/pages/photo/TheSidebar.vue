<template>
    <div class="eqc-photo-sidebar">
        <ul class="list">
            <li
                :class="{disable: disableBack}"
                data-hint="撤销"
                class="item hint--left hint--rounded"
                @click="back"
            >
                <i class="icon eqf-back" />
            </li>
            <li
                :class="{disable: disableForward}"
                data-hint="恢复"
                class="item hint--left hint--rounded"
                @click="forward"
            >
                <i class="icon eqf-rework" />
            </li>
            <li
                :class="{disable: false}"
                :data-hint="'恢复到原图'"
                class="item hint--left hint--rounded"
                @click="undoToOriginal"
            >
                <i class="icon eqf-picinpic" />
            </li>
        </ul>
    </div>
</template>

<script>

export default {
    data() {
        return {
            reset: false
        }
    },
    computed: {
        photoScene() {
            return Vue.store.state.photoScene
        },
        eqxPage() {
            return this.photoScene.eqxPage
        },
        photoHistory() {
            return Vue.store.state.photoHistory
        },
        disableBack() {
            return this.photoHistory.disableBack
        },
        disableForward() {
            return this.photoHistory.disableForward
        },
        nav() {
            return Vue.store.state.photoLayout.nav
        },
        navType() {
            return this.nav.selectedItem.type
        }
    },
    methods: {
        back() {
            !this.disableBack && Vue.store.commit('PHOTO_HISTORY_BACK')
        },
        forward() {
            !this.disableForward && Vue.store.commit('PHOTO_HISTORY_FORWORD')
        },
        undoToOriginal() {
            const background = {
                src: this.photoScene.originImageShot,
                width: this.photoScene.originImageShotSize.width,
                height: this.photoScene.originImageShotSize.height
            }
            // 设置页面背景
            this.eqxPage.eqxBackground.setBackground(background)

            // 所有左侧设置归零
            if (this.navType === 'base') {
                Vue.store.commit('PHOTO_BASE_BACK_TO_ORIGIN')
            } else if (this.navType === 'rotate') {
                Vue.store.commit('PHOTO_ROTATE_BACK_TO_ORIGIN')
            } else if (this.navType === 'filter') {
                Vue.store.commit('PHOTO_FILTER_IS_BACK_TO_ORIGIN', true)
            } else if (this.navType === 'paster' || this.navType === 'text') {
                Vue.store.commit('PHOTO_BASE_BACK_TO_ORIGIN')
            }

            // 更新页面大小为图片大小
            Vue.store.commit('PHOTO_SCENE_SIZE_CHANGE', { width: this.photoScene.originImageShotSize.width, height: this.photoScene.originImageShotSize.height })
            const $elWorkspace = this.eqxPage.$el.parentElement
            this.eqxPage.setScale('fit', $elWorkspace.offsetWidth, $elWorkspace.offsetHeight)

            // 移除颜色选择
            Vue.colorPicker.close()
            // 移除文字设置面板
            Vue.textStyleSetting.close()
            // 清除所有组件
            this.eqxPage.clearElements()
            // 清除store里面所有组件的选中状态
            Vue.store.commit('PHOTO_ELEMENT_SELECT', { eqxElements: [] })

            // 清空历史数据
            Vue.store.commit('PHOTO_HISTORY_UNDO_TO_ORIGINAL', { all: false })
        }
    }
}
</script>

<style lang="scss">
.eqc-photo-sidebar {
    position: relative;
    width: 49px;
    height: 100%;
    border-right: 1px solid #ccd5db;
    box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.16);
    background: #fdfdfd;
    .list {
        &.bottom {
            position: absolute;
            bottom: 0;
        }
        .notice {
            height: 108px !important;
            font-size: 12px;
            color: #2f3c4d;
            writing-mode: vertical-lr;
            .box {
                width: 28px !important;
                height: 108px !important;
                border: 1px solid #ccd5db;
                display: flex;
                justify-content: center;
                align-items: center;
                letter-spacing: 2px;
                background: rgba(247, 248, 249, 1);
            }
        }
        .item {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 48px;
            height: 48px;
            cursor: pointer;
            .icon {
                font-size: 20px;
                color: #76838f;
                transition: all 0.3s;
            }
            &.disable {
                cursor: default;
                .icon {
                    color: #ccd5db !important;
                }
            }
            &:hover,
            &.active {
                .icon {
                    color: #1593ff;
                }
            }
        }
    }
}
</style>
