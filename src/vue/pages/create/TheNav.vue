<template>
    <div class="eqc-nav">
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
                :class="['item', {active: nav.selectedItem.type === item.type}]"
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
                    v-if="nav.selectedItem.type === item.type"
                    class="triangle"
                />
            </li>
            <li v-if="isBatch" />
            <li
                v-if="!expressMode"
                class="item sponsor"
                @mouseover="showSponsor"
                @mouseleave="hideSponsor"
            >
                <!-- <i
                    :class="[{'eqf-sponsor-f':isSponsorHover},{'eqf-sponsor-l':!isSponsorHover}]"
                    class="icon"/>
                <span>福利</span> -->
                <img
                    :src="sponsorIcon"
                    style="width:67px;height:67px"
                >
            </li>
            <li
                v-if="!expressMode"
                class="item help"
                @click="showHelp"
                @mouseover="hoverHelp"
                @mouseleave="hideHelp"
            >
                <i
                    :class="[{'eqf-feedback-f':isHelpHover},{'eqf-feedback-f':!isHelpHover}]"
                    class="icon"
                />
                <span>帮助</span>
            </li>
            <li class="slide" />
        </ul>
        <div
            :class="{active: isShowHelp}"
            class="help-content"
        >
            <span class="loading">加载中…</span>
            <iframe
                v-if="isInitHelp"
                src="//qingsheji-help.eqxiu.com/"
                @mouseover="showHelp"
                @mouseleave="hideHelp"
            />
        </div>
        <div
            class="sponsor-content"
        >
            <transition name="rotate-y-left">
                <div
                    v-if="isSponsorHover"
                    class="warp"
                >
                    <img
                        :src="sponsorImg"
                        class="qrcode"
                    >
                    <p class="tip">
                        微信扫码添加管理员
                    </p>
                    <img :src="sponsorTag">
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import storageLocal from '../../../utils/storageLocal'
import sponsorSrc from '../../../img/sponsor.png'
import sponsorTip from '../../../img/sponsor_tag.png'
import spIcon from '../../../img/psp.gif'
import util from '../../../utils/util'

export default {
    data() {
        return {
            textKey: storageLocal.key.newText,
            qrcodeKey: storageLocal.key.newQrcode,
            uploadKey: storageLocal.key.newUpload,
            helpKey: storageLocal.key.newHelp,
            isInitHelp: false,
            isShowHelp: false,
            helpTimeoutId: 0,
            isSponsorHover: false,
            isHelpHover: false,
            sponsorImg: sponsorSrc,
            sponsorTag: sponsorTip,
            sponsorIcon: spIcon
        }
    },
    computed: {
        layout() {
            return this.$store.state.layout
        },
        nav() {
            if (this.isBatch) {
                return {
                    itemClickEvent: this.layout.nav.itemClickEvent,
                    list: this.layout.nav.list.slice(1),
                    selectedItem: this.layout.nav.selectedItem
                }
            } else {
                return this.layout.nav
            }
        },
        navList() {
            return this.layout.nav.list
        },
        navPanel() {
            return this.layout.navPanel
        },
        type() {
            return this.$store.state.scene.eqxScene.sceneJson.type
        },
        userInfo() {
            return this.$store.state.user.userInfo
        },
        isBatch() {
            return util.getIsBatchCreate()
        },
        expressMode() {
            return this.$store.state.scene.expressMode
        }
    },
    watch: {
        type(newVal) {
            this.$store.commit('LAYOUT_NAV', { item: this.nav.list[0] })
            this.$store.commit('LAYOUT_NAV_PANEL', { show: true })
        }
    },
    mounted() {
        if (!this.expressMode) {
            Vue.arrowNotifier.open({
                title: '新增加【工具箱】栏目，不定期推出各种酷炫小工具，请持续关注哦！',
                iconType: 'warn',
                arrowDirection: 'left',
                // arrowDistance: '22px',
                width: '378px',
                height: '128px',
                left: '85px',
                type: 'add-tool',
                top: '305px',
                okClick: () => {
                    Vue.arrowNotifier.open({
                        title: '【更改尺寸】移到这里啦！',
                        subTitle: '全新的更改尺寸和扩展尺寸效果等你来体验。',
                        // iconType: 'warn',
                        arrowDirection: 'up',
                        width: '336px',
                        height: '136px',
                        right: '94px',
                        top: '80px',
                        moveDistance: '150px',
                        type: 'update-scale' // 唯一标识这个notifier 确保唯一
                    })
                }
            })
        }
    },
    created() {
        this.$store.commit('LAYOUT_NAV', { item: this.nav.list[0] })
    },
    methods: {
        switchPanel() {
            this.$store.commit('LAYOUT_NAV_PANEL', { show: !this.navPanel.show })
        },
        onSelectNav(item) {
            if (!this.userInfo.id && item.type === 'upload') {
                this.notifier.info('上传功能需登录后才能使用')
                return
            }
            this.$store.commit('LAYOUT_NAV', { item })
            this.$store.commit('LAYOUT_NAV_PANEL', { show: true })
            // 关闭条件框
            Vue.store.commit('MATERIAL_MORE_CHANGE', { show: false })
            // 关闭模板颜色选择框
            Vue.store.commit('TEMPLATE_COLOR_PANEL', { show: false })
            // 关闭模板设置
            Vue.store.commit('TEMPLATE_CONFIG', { show: false })
            // 关闭模板分类
            Vue.store.commit('TEMPLATE_CATEGORY', { show: false })
        },
        onItemMouseOver(item) {
            const className = window.event.target.className
            if (window.event.target.nodeName === 'LI' && className.search('active') === -1) {
                document.querySelector('div.eqc-nav > ul > li.item.active').style.color = '#252b3f'
                document.querySelector('div.eqc-nav > ul > li.item.active > span.triangle').style.display = 'none'
                window.event.target.style = ''
            }
        },
        onItemMouseLeave(item) {
            const className = window.event.target.className
            if (window.event.target.nodeName === 'LI' && className.search('active') === -1) {
                document.querySelector('div.eqc-nav > ul > li.item.active').style = ''
                document.querySelector('div.eqc-nav > ul > li.item.active > span.triangle').style.display = 'block'
            }
        },
        showHelp() {
            this.isInitHelp = true
            this.isShowHelp = true
            clearTimeout(this.helpTimeoutId)
        },
        hideHelp() {
            this.isHelpHover = false
            this.helpTimeoutId = setTimeout(() => {
                this.isShowHelp = false
            }, 200)
        },
        hoverHelp() {
            this.isHelpHover = true
        },
        showSponsor() {
            this.isSponsorHover = true
        },
        hideSponsor() {
            this.isSponsorHover = false
        }
    }
}
</script>

<style lang="scss">
$nav-background: rgba(255, 255, 255, 1);
$nav-blue: rgba(21, 147, 255, 1);
$nav-white: rgba(255, 255, 255, 1);
$nav-gray: rgba(37, 43, 63, 1);
$slide-background: rgba(21, 147, 255, 1);
$help-content-background: rgba(247, 248, 249, 1);
.eqc-nav {
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
                bottom: 10px;
                width: 100%;
                height: 48px;
            }
            &.sponsor {
                position: absolute;
                bottom: 58px;
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
