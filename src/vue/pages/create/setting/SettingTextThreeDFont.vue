<template>
    <div
        id="eqc-setting-text-three-d-font"
        :style="getPositionStyle"
        class="eqc-setting-text-three-d-font"
    >
        <div
            v-drag-style-layer="{target: '#eqc-setting-text-three-d-font', container: '.eqc-create'}"
            class="head"
        >
            <span>字体</span>
            <i
                class="close eqf-no"
                @click="close"
            />
        </div>
        <!--层级需要比“基础”展开时高-->
        <div
            class="showFontList"
        >
            <div class="container">
                <div class="eqc-drop-dwon-container">
                    <div
                        v-scroll-bar
                        :style="{maxHeight:maxHeight}"
                        class="wrap"
                    >
                        <ul class="list">
                            <li
                                v-for="item of font.list"
                                :key="item.name"
                                :class="{active: item.name === font.selectedItem.name}"
                                :style="{fontFamily: item.fontFamily}"
                                class="item ellipsis"
                                @click="chooseFont(item)"
                            >
                                {{ item.name }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="feedback">
            <div class="want-font">
                <a
                    class="want-font"
                    href="//h5.ebdan.net/ls/E9d9upJ5"
                    target="_blank"
                >想要的字体？</a>
            </div>
            <!-- 暂时不上
            <div class="want-font">
                <a
                    class="font-store"
                    href="//h5.ebdan.net/ls/hr75rdpJ"
                    target="_blank"
                >字体商城</a>
            </div> -->
        </div>
    </div>
</template>

<script>

import dragStyleLayer from './dragSettingFontStyleLayer'

export default {
    directives: {
        dragStyleLayer
    },
    data() {
        return {
            font: {
                list: [
                    { name: '默认字体', fontFamily: '', fontFamilyReal: '', src: 'PangMenZhengDao_Regular.json' }
                ],
                selectedItem: {}
            }
        }
    },
    computed: {
        eqxElement() {
            return Vue.store.state.scene.eqxElementsSelected[0]
        },
        // 获取所在位置
        getPositionStyle() {
            return {
                left: (document.body.clientWidth - 414) + 'px',
                top: '60px'
            }
        },
        maxHeight() {
            return (document.body.clientHeight - 156) + 'px'
        }
    },
    watch: {
    },
    created() {
        this.api.product.getNewProducts({ apiCode: Vue.env.mall.apiCode[1], categoryId: Vue.env.mall.fontId, pageSize: 100, pageNo: 1 })
            .then(res => {
                const id = 'style_text_three_font'
                const styles = []
                const fonts = this.font.list
                fonts.length = 1
                res.data.list.forEach(item => {
                    if (item.productTypeMap.fontJson) {
                        const font = {
                            name: item.name,
                            fontFamily: item.productTypeMap.font_family + '_pre',
                            fontFamilyReal: item.productTypeMap.font_family,
                            src: item.productTypeMap.fontJson
                        }
                        fonts.push(font)
                        styles.push(`@font-face{font-family: "${font.fontFamily}";src: url(${this.env.host.font}/store/fonts/${font.fontFamilyReal}.woff?text=${encodeURIComponent(font.name)}) format("woff")}\r\n`)
                    }
                })

                if (!document.querySelector('#' + id)) {
                    const $style = document.createElement('style')
                    $style.id = id
                    $style.innerHTML = styles.join('')
                    document.head.appendChild($style)
                }
                this.setSelectedFont()
            })
            .catch(err => err && this.logger.error(err))
    },
    methods: {
        close() {
            this.$store.commit('TEXT_THREED_FONT_LAYER', { show: false })
        },
        setSelectedFont() {
            const _self = this
            this.font.selectedItem = this.font.list.find(item => {
                return item.name === _self.eqxElement.elementJson.property.textFont.name
            }) || {}
        },
        chooseFont(item) {
            this.font.selectedItem = item
            this.eqxElement.updateFont({
                textFont: {
                    name: item.name,
                    src: item.src
                }
            })
        }
    }
}
</script>

<style lang="scss">
.eqc-setting-text-three-d-font {
    position: fixed;
    width: 230px;
    height: calc(100% - 60px);
    font-size: 12px;
    background: #fdfdfd;
    z-index: 93;
    color: #2f3c4d;
    border: 1px solid #ccd5db;
    .head {
        height: 48px;
        padding: 0 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        color: #2f3c4d;
        cursor: move;
        .close {
            font-size: 20px;
            transition: all 0.3s;
            cursor: pointer;
            &:hover {
                color: $red-normal;
            }
        }
        span {
            font-size: 13px;
        }
    }
    .showFontList {
        width: 228px;
        .container {
            background: white;
            .searchBox {
                width: 192px;
                height: 28px;
                margin: 0 8px 8px 8px;
                border: 1px solid #198ae7;
                display: flex;
                align-items: center;
                justify-content: space-around;
                input {
                    width: 124px;
                    color: #2f3c4d;
                }
                input::-webkit-input-placeholder {
                    color: #9099a4;
                }
                span {
                    width: 12px;
                }
                i {
                    color: #76838f;
                }
            }
            .titleBar {
                height: 20px;
                color: #9099a4;
                padding: 0 8px;
                line-height: 20px;
                font-size: 12px;
                background: #eceef0;
                margin-bottom: 1px;
            }
            .chooseList {
                display: flex;
                flex-direction: column;
                span {
                    height: 30px;
                    line-height: 30px;
                    color: #2f3c4d;
                    font-size: 12px;
                    text-indent: 8px;
                    &:hover {
                        color: #fff;
                        background: #ccd5db;
                    }
                }
            }
            .eqc-drop-dwon-container {
                width: 228px;
                font-size: 14px;
                height: 100%;
                .wrap {
                    position: relative;
                    width: 100%;
                    .list {
                        width: 100%;
                        padding: 1px 1px 1px 1px;
                        background: #fff;
                        .item {
                            width: 100%;
                            height: 30px;
                            line-height: 30px;
                            padding: 0 12px;
                            color: #2f3c4d;
                            cursor: pointer;
                            transition: all 0.3s;
                            &:hover {
                                color: #fff;
                                background: #ccd5db;
                            }
                            &.active {
                                color: #fff;
                                background: #4f5d69;
                            }
                        }
                    }
                }
            }
        }
    }
    .feedback {
        width: 100%;
        height: 47px;
        border-top: 1px solid #ccd5db;
        position: absolute;
        bottom: 0;
        left: 0;
        text-align: center;
        line-height: 47px;
        display: flex;
        flex-direction: row;
        div {
            flex: 1;
            &:hover {
                color: #1593ff;
            }
        }
    }
}
</style>
