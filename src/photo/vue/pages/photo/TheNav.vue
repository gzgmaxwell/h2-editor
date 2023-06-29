<template>
    <div class="eqc-photo-nav">
        <ul class="list">
            <li
                :class="{left: navPanel.show}"
                class="arrow"
                @click="switchPanel"
            >
                <i class="icon eqf-eqxiulogo" />
            </li>
            <li
                v-for="item of nav.list"
                :key="item.name"
                :class="['item',isUploadImage?'':'item-no-hover', {active: (nav.selectedItem.type === item.type&&isUploadImage)}]"
                :style="'cursor:'+(isUploadImage?'pointer;':'not-allowed;')"
                @click="onSelectNav(item)"
                @mouseover="onItemMouseOver(item)"
                @mouseleave="onItemMouseLeave(item)"
            >
                <i
                    :class="item.icon"
                    class="icon"
                />
                <span>{{ item.name }}</span>
                <span
                    v-if="nav.selectedItem.type === item.type&&isUploadImage"
                    class="triangle"
                />
            </li>
            <li
                v-show="isUploadImage"
                class="slide"
            />
        </ul>
    </div>
</template>

<script>

export default {
    data() {
        return {
            lastItem: null // 保留上次切换的item 便于操作
        }
    },
    computed: {
        photoLayout() {
            return Vue.store.state.photoLayout
        },
        photoScene() {
            return Vue.store.state.photoScene
        },
        nav() {
            return this.photoLayout.nav
        },
        navList() {
            return this.photoLayout.nav.list
        },
        navPanel() {
            return this.photoLayout.navPanel
        },
        isUploadImage() {
            return this.photoScene.isUploadImage
        },
        eqxPage() {
            return this.photoScene.eqxPage
        },
        canNavChange() {
            return this.photoScene.canNavChange
        }
    },
    watch: {
        canNavChange() {
            this.eqxPage.clearCrop()
            Vue.store.commit('PHOTO_NAV', { item: this.lastItem })
            Vue.store.commit('PHOTO_NAV_PANEL', { show: true })
        }
    },
    mounted() {

    },
    created() {
        Vue.store.commit('PHOTO_NAV', { item: this.nav.list[0] })
    },
    methods: {
        switchPanel() {
            Vue.store.commit('PHOTO_NAV_PANEL', { show: !this.navPanel.show })
        },
        onSelectNav(item) {
            if (!this.isUploadImage) {
                return
            }
            // 清除store里面所有组件的选中状态
            Vue.store.commit('PHOTO_ELEMENT_SELECT', { eqxElements: [] })
            // 清除画布上的组件选中状态
            this.eqxPage.clearElementsSelected()
            // 清除文字选择状态
            getSelection().removeAllRanges()
            Vue.store.commit('PHOTO_SCENE_IS_HISTORY_CHANGE_NAV', false)
            if (this.lastItem && this.lastItem.type === 'rotate' && (this.lastItem !== item)) {
                // 通知rotate 生成真正的img 生成完毕之后通知canNavChange 然后再切换菜单
                Vue.store.commit('PHOTO_ROTATE_GENERATE_IMG')
            } else {
                // 清除裁切组件
                this.eqxPage.clearCrop()
                Vue.store.commit('PHOTO_NAV', { item })
                Vue.store.commit('PHOTO_NAV_PANEL', { show: true })
            }

            this.lastItem = item

            // this.eqxPage.eqxHistory.clearHistory()
            // Vue.store.commit('PHOTO_HISTORY_SET', {disableBack: true, disableForward: true})
        },
        onItemMouseOver(item) {
            if (!this.isUploadImage) {
                return
            }
            const className = window.event.target.className
            if (window.event.target.nodeName === 'LI' && className.search('active') === -1) {
                document.querySelector('div.eqc-photo-nav > ul > li.item.active').style.color = 'rgba(79, 93, 105, 1)'
                document.querySelector('div.eqc-photo-nav > ul > li.item.active > span.triangle').style.display = 'none'
                window.event.target.style = ''
            }
        },
        onItemMouseLeave(item) {
            if (!this.isUploadImage) {
                return
            }
            const className = window.event.target.className
            if (window.event.target.nodeName === 'LI' && className.search('active') === -1) {
                document.querySelector('div.eqc-photo-nav > ul > li.item.active').style = ''
                document.querySelector('div.eqc-photo-nav > ul > li.item.active > span.triangle').style.display = 'block'
            }
        }
    }
}
</script>

<style lang="scss">
$nav-background: rgba(255, 255, 255, 1);
$nav-blue: rgba(21, 147, 255, 1);
$nav-white: rgba(255, 255, 255, 1);
$nav-gray: rgba(79, 93, 105, 1);
$slide-background: rgba(21, 147, 255, 1);
$help-content-background: rgba(247, 248, 249, 1);
.eqc-photo-nav {
    position: relative;
    flex: none;
    width: 68px;
    height: 100%;
    z-index: 5; // 需要在navPanel之上
    .list {
        position: relative;
        height: 100%;
        color: #76838f;
        background: $nav-background;
        border-right: 1px solid rgba(204, 213, 219, 1);
        .arrow {
            color: $nav-blue;
            .icon {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 60px;
                font-size: 43px;
                cursor: pointer;
                transition: all 0.3s;
            }
            &.left {
                .icon {
                    transform: rotate(0deg);
                }
            }
        }
        .item {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
            height: 68px;
            font-size: 13px;
            z-index: 1; // 需要在滑块之上
            cursor: pointer;
            transition: all 0.3s;
            color: $nav-gray;
            .icon {
                font-size: 24px;
                margin-bottom: 5px;
            }
            .triangle {
                position: absolute;
                right: -1px;
                top: 29px;
                width: 0;
                height: 0;
                border-right: 6px solid #fafafa;
                border-top: 6px solid transparent;
                border-bottom: 6px solid transparent;
            }
            &.help {
                position: absolute;
                bottom: 0;
                width: 100%;
                height: 48px;
            }
            &.sponsor {
                position: absolute;
                bottom: 48px;
                width: 100%;
            }
            &.active {
                color: $nav-white;
                &:nth-child(2) ~ .slide {
                    transform: translateY(68px * 0);
                }
                &:nth-child(3) ~ .slide {
                    transform: translateY(68px * 1);
                }
                &:nth-child(4) ~ .slide {
                    transform: translateY(68px * 2);
                }
                &:nth-child(5) ~ .slide {
                    transform: translateY(68px * 3);
                }
                &:nth-child(6) ~ .slide {
                    transform: translateY(68px * 4);
                }
                &:nth-child(7) ~ .slide {
                    transform: translateY(68px * 5);
                }
            }
            &:hover {
                color: $nav-white;
                &:nth-child(2) ~ .slide {
                    transform: translateY(68px * 0) !important;
                }
                &:nth-child(3) ~ .slide {
                    transform: translateY(68px * 1) !important;
                }
                &:nth-child(4) ~ .slide {
                    transform: translateY(68px * 2) !important;
                }
                &:nth-child(5) ~ .slide {
                    transform: translateY(68px * 3) !important;
                }
                &:nth-child(6) ~ .slide {
                    transform: translateY(68px * 4) !important;
                }
                &:nth-child(7) ~ .slide {
                    transform: translateY(68px * 5) !important;
                }
                &:nth-child(9) {
                    color: $nav-blue;
                }
            }
        }
        .item-no-hover {
            color: #9099a4;
            &:hover {
                color: #9099a4;
            }
        }
        .slide {
            position: absolute;
            top: 60px;
            left: 0;
            width: 68px;
            height: 68px;
            background: $slide-background;
            transition: all 0.3s;
        }
    }
    .help-content {
        position: absolute;
        left: 68px;
        top: 0;
        width: 288px;
        height: 100%;
        z-index: -1;
        background: $help-content-background;
        transform: translateX(-288px);
        transition: all 0.3s;
        &.active {
            transform: translateX(0);
        }
        .loading {
            display: block;
            margin: 40px auto;
            text-align: center;
        }
        iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
    }
    .sponsor-content {
        position: absolute;
        bottom: 4px;
        left: 70px;
        perspective: 640px;
        z-index: 1;
        .warp {
            width: 169px;
            height: 204px;
            position: relative;
            background: $nav-white;
            box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
            border-radius: 3px;
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
            justify-content: flex-start;
            align-items: center;
            transform-origin: left;
            .qrcode {
                margin: 16px 0 6px;
            }
            .tip {
                margin-bottom: 8px;
            }
        }
    }
}
</style>
