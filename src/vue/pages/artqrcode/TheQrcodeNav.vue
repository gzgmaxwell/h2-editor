<template>
    <div class="eqc-qrcode-nav">
        <ul class="list">
            <li
                class="arrow"
            >
                <i class="icon eqf-eqxiulogo" />
            </li>
            <li
                v-for="item of navList"
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
            <li class="slide" />
        </ul>
    </div>
</template>

<script>

import artQrcodeMode from '../../../config/enum.artQrcodeMode.type'

export default {
    props: {
        mode: {
            type: Number,
            default: null
        },
        // 传入的二维码图片url
        qrcodeKeyOut: {
            type: String,
            default: null
        },
        // 传入的base64二维码图片
        qrcodeKeyStrOut: {
            type: String,
            default: null
        },
        // 传入的二维码内容
        qrcodeTextOut: {
            type: String,
            default: null
        },
        // 传入的二维码组件元素
        qrcodeElementOut: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
        }
    },
    computed: {
        qrcode() {
            return Vue.store.state.artQrcode
        },
        nav() {
            return this.qrcode.qrcodeNav
        },
        navList() {
            return this.nav.list
        }
    },
    watch: {
    },
    mounted() {
    },
    created() {
        if (this.mode === artQrcodeMode.setting) {
            const qcType = this.qrcodeElementOut.elementJson.property.qcType
            // 根据元素判断选中菜单
            const nav = this.nav.list.filter(item => {
                return item.qrcodeType === qcType && item.type !== 'upload'
            })[0]
            nav.qrcodeKey = this.qrcodeKeyOut
            nav.qrcodeTextOut = this.qrcodeTextOut
            Vue.store.commit('QRCODE_NAV', { item: nav })
        } else {
            Vue.store.commit('QRCODE_NAV', { item: this.nav.list[0] })
        }
    },
    methods: {
        onSelectNav(item) {
            Vue.store.commit('QRCODE_NAV', { item })
        },
        onItemMouseOver(item) {
            const className = window.event.target.className
            if (window.event.target.nodeName === 'LI' && className.search('active') === -1) {
                document.querySelector('div.eqc-qrcode-nav > ul > li.item.active').style.color = '#4f5d69'
                document.querySelector('div.eqc-qrcode-nav > ul > li.item.active > span.triangle').style.display = 'none'
                window.event.target.style = ''
            }
        },
        onItemMouseLeave(item) {
            const className = window.event.target.className
            if (window.event.target.nodeName === 'LI' && className.search('active') === -1) {
                document.querySelector('div.eqc-qrcode-nav > ul > li.item.active').style = ''
                document.querySelector('div.eqc-qrcode-nav > ul > li.item.active > span.triangle').style.display = 'block'
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
.eqc-qrcode-nav {
    position: relative;
    flex: none;
    width: 72px;
    height: 100%;
    z-index: 5; // 需要在navPanel之上
    border-right: 1px solid rgba(204, 213, 219, 1);
    .list {
        position: relative;
        height: 100%;
        color: #76838f;
        background: $nav-background;
        .arrow {
            color: $nav-blue;
            .icon {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 60px;
                font-size: 43px;
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
            height: 72px;
            font-size: 12px;
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
                    transform: translateY(72px * 0);
                }
                &:nth-child(3) ~ .slide {
                    transform: translateY(72px * 1);
                }
                &:nth-child(4) ~ .slide {
                    transform: translateY(72px * 2);
                }
                &:nth-child(5) ~ .slide {
                    transform: translateY(72px * 3);
                }
                &:nth-child(6) ~ .slide {
                    transform: translateY(72px * 4);
                }
                &:nth-child(7) ~ .slide {
                    transform: translateY(72px * 5);
                }
                &:nth-child(8) ~ .slide {
                    transform: translateY(72px * 6);
                }
            }
            &:hover {
                color: $nav-white;
                &:nth-child(2) ~ .slide {
                    transform: translateY(72px * 0) !important;
                }
                &:nth-child(3) ~ .slide {
                    transform: translateY(72px * 1) !important;
                }
                &:nth-child(4) ~ .slide {
                    transform: translateY(72px * 2) !important;
                }
                &:nth-child(5) ~ .slide {
                    transform: translateY(72px * 3) !important;
                }
                &:nth-child(6) ~ .slide {
                    transform: translateY(72px * 4) !important;
                }
                &:nth-child(7) ~ .slide {
                    transform: translateY(72px * 5) !important;
                }
                &:nth-child(8) ~ .slide {
                    transform: translateY(72px * 6) !important;
                }
            }
        }
        .slide {
            position: absolute;
            top: 60px;
            left: 0;
            width: 72px;
            height: 72px;
            background: $slide-background;
            transition: all 0.3s;
        }
    }
}
</style>
