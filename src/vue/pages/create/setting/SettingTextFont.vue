<template>
    <div
        id="eqc-setting-text-font"
        :style="getPositionStyle"
        class="eqc-setting-text-font"
    >
        <div
            v-drag-style-layer="{target: '#eqc-setting-text-font', container: '.eqc-create'}"
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
            v-scroll-bar
            class="showFontList"
        >
            <div class="container">
                <!-- 搜索区域 -->
                <div
                    :style="{border:borderChangeState?'1px solid #198ae7':'1px solid #CCD5DB'}"
                    class="searchBox"
                >
                    <i class="icon eqf-search-l" />
                    <input
                        ref="input"
                        v-model="serchValue"
                        placeholder="搜索字体"
                        type="text"
                        @click="searchClick"
                    >
                    <span
                        v-show="!serchValue"
                        class="emptyBox"
                    />
                    <i
                        v-show="serchValue"
                        class="icon eqf-no-f"
                        @click="clear"
                    />
                </div>

                <div class="eqc-drop-dwon-container">
                    <div
                        v-scroll-bar
                        :style="{maxHeight:maxHeight}"
                        class="wrap"
                    >
                        <ul class="list">
                            <!-- 当前画布已使用字体 区域 -->
                            <div
                                v-show="!serchValue"
                                class="titleBar"
                            >
                                当前画布已使用字体
                            </div>
                            <div
                                v-show="!serchValue"
                                class="chooseList"
                            >
                                <span
                                    v-for="(item,i) in chooseFontList"
                                    :key="i"
                                    :style="{fontFamily: item.fontFamily}"
                                    class="ellipsis"
                                    @click="chooseFont(item)"
                                >{{ item.name ?item.name:'默认字体' }}</span>
                            </div>
                            <!-- 远程获得字体区域 -->
                            <div
                                v-show="!serchValue"
                                class="titleBar"
                            >
                                免费字体
                            </div>
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
    </div>
</template>

<script>
import elementType from '../../../../config/enum.element.type.js'
import dragStyleLayer from './dragSettingFontStyleLayer'
export default {
    directives: {
        dragStyleLayer
    },
    props: {
        modelKey: {
            type: String,
            default: 'fontFamily'
        },
        propertyKey: {
            type: String,
            default: 'src'
        }
    },
    data() {
        return {
            serchValue: '', // 字体搜索关键词
            font: {
                list: [
                    { name: '默认字体', fontFamily: '', fontFamilyReal: '' }
                ],
                selectedItem: null
            },
            serchList: [],
            chooseFontList: [],
            borderChangeState: true,
            copyFontList: [] // 保存在这儿 搜索时用
        }
    },
    computed: {
        scene() {
            return this.$store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        fontStyle() {
            return this.$store.state.fontStyle
        },
        fontStyleSelectedItem() {
            return this.fontStyle.selectedItem
        },
        allTextElement() {
            return Vue.store.state.scene.eqxPage.eqxElements.filter(element => element.elementJson.type === 101)
        },
        eqxElement() {
            const length = Vue.store.state.scene.eqxElementsSelected.length
            if (length > 0) {
                const ele = Vue.store.state.scene.eqxElementsSelected[0]
                if (ele.elementJson.type === elementType.combine) {
                    return ele.virtualElement
                } else {
                    return ele
                }
            }
            return null
        },
        isCombine() {
            let state = false
            const length = Vue.store.state.scene.eqxElementsSelected.length
            if (length > 0) {
                const ele = Vue.store.state.scene.eqxElementsSelected[0]
                if (ele.elementJson.type === elementType.combine) {
                    state = true
                }
            }
            return state
        },
        model() {
            const length = Vue.store.state.scene.eqxElementsSelected.length
            if (length > 0) {
                const ele = Vue.store.state.scene.eqxElementsSelected[0]
                if (ele.elementJson.type === elementType.combine) {
                    return ele.virtualElement.css
                } else {
                    return ele.elementJson.css
                }
            }
            return null
        },
        property() {
            const length = Vue.store.state.scene.eqxElementsSelected.length
            if (length > 0) {
                const ele = Vue.store.state.scene.eqxElementsSelected[0]
                if (ele.elementJson.type === elementType.combine) {
                    return ele.virtualElement.property
                } else {
                    return ele.elementJson.property
                }
            }
            return null
        },
        // 获取所在位置
        getPositionStyle() {
            return {
                left: (document.body.clientWidth - 380) + 'px',
                top: '220px'
            }
        },
        maxHeight() {
            return (document.body.clientHeight - 360) + 'px'
        }
    },
    watch: {
        model: {
            handler() {
                this.setSelectedFont()
            },
            // 避免两个组件切换选中时，组件设置面板未消失，字体不更新的问题
            immediate: true
        },
        fontStyleSelectedItem() {
            this.setSelectedFont()
        },
        allTextElement() {
            this.getChooseFontList()
        },
        serchValue(newVal) {
            if (newVal !== '') {
                const matchArr = []
                this.copyFontList.map(item => {
                    if (item.name.indexOf(newVal) !== -1) {
                        matchArr.push(item)
                    }
                })
                this.font.list = matchArr
            } else {
                this.font.list = this.copyFontList
            }
        },
        eqxElement() {
            this.serchValue = ''
        }
    },
    created() {
        this.api.product.getNewProducts({ apiCode: Vue.env.mall.apiCode[1], categoryId: Vue.env.mall.fontId, pageSize: 100, pageNo: 1 })
            .then(res => {
                const id = 'style_font'
                const styles = []
                const fonts = this.font.list
                fonts.length = 1
                res.data.list.forEach(item => {
                    const font = {
                        name: item.name,
                        fontFamily: item.productTypeMap.font_family + '_pre',
                        fontFamilyReal: item.productTypeMap.font_family,
                        src: item.productTypeMap.woff_path
                    }
                    fonts.push(font)
                    styles.push(`@font-face{font-family: "${font.fontFamily}";src: url(${this.env.host.font}/store/fonts/${font.fontFamilyReal}.woff?text=${encodeURIComponent(font.name)}) format("woff")}\r\n`)
                })

                if (!document.querySelector('#' + id)) {
                    const $style = document.createElement('style')
                    $style.id = id
                    $style.innerHTML = styles.join('')
                    document.head.appendChild($style)
                }
                this.copyFontList = fonts
                this.setSelectedFont()
                this.getChooseFontList()
            })
            .catch(err => err && this.logger.error(err))
    },
    methods: {
        close() {
            this.$store.commit('FONT_TEXT_LAYER', { show: false })
        },
        clear() {
            this.serchValue = ''
        },
        getChooseFontList() {
            const chooseList = []
            this.allTextElement.map(ele => {
                if (ele.elementJson.css.fontFamily && !chooseList.includes(ele.elementJson.css.fontFamily)) {
                    chooseList.push(ele.elementJson.css.fontFamily)
                }
            })
            this.chooseFontList = []
            chooseList.map(name => {
                this.chooseFontList.push(this.getFontCNName(name))
            })
        },
        getFontCNName(familyName) {
            const chooseFontObj = this.copyFontList.filter(obj => obj.name === familyName || obj.fontFamily === familyName || obj.fontFamilyReal === familyName)
            if (chooseFontObj.length > 0) {
                return chooseFontObj[0]
            } else {
                return '默认字体'
            }
        },
        setSelectedFont() {
            if (this.model) {
                this.font.selectedItem = this.font.list.find(item => {
                    return item.fontFamily === this.model[this.modelKey] || item.fontFamilyReal === this.model[this.modelKey] || item.name === this.model[this.modelKey]
                }) || {}
            }
        },
        chooseFont(item) {
            if (!this.serchValue) {
                this.borderChangeState = false
            }
            this.font.selectedItem = item
            this.model[this.modelKey] = item.fontFamilyReal
            this.property.fontFamilyName = item.name
            if (item.src) {
                this.property[this.propertyKey] = item.src
                if (!this.isCombine && [elementType.text, elementType.date].includes(this.eqxElement.elementJson.type)) {
                    this.eqxElement.createFontFace()
                }
                if (this.eqxElement.elementJson && this.eqxElement.elementJson.type && this.eqxElement.elementJson.type === elementType.table) {
                    this.eqxElement.updateCellFontFace(item)
                }
            } else {
                delete this.property[this.propertyKey]
            }
            this.eqxPage.eqxHistory.add(this.eqxPage)
            setTimeout(() => {
                this.getChooseFontList()
            }, 100)
        },
        searchClick() {
            this.borderChangeState = true
        }

    }
}
</script>

<style lang="scss">
.eqc-setting-text-font {
    position: fixed;
    width: 232px;
    height: calc(100% - 300px);
    box-shadow: $boxShadow;
    font-size: 13px;
    background: #fdfdfd;
    z-index: 93;
    border-radius: 3px;
    color: #2f3c4d;
    cursor: pointer;
    .head {
        height: 48px;
        padding: 0 12px;
        display: flex;
        font-size: 14px;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        color: #2f3c4d;
        background: white;
        cursor: move;
        .close {
            font-size: 20px;
            transition: all 0.3s;
            cursor: pointer;
            &:hover {
                color: $red-normal;
            }
        }
    }
    .showFontList {
        width: 232px;
        .container {
            background: white;
            box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
            .searchBox {
                width: 200px;
                height: 32px;
                margin: 0 16px 8px 16px;
                border: 1px solid #198ae7;
                display: flex;
                align-items: center;
                justify-content: space-around;
                border-radius: 2px;
                border: 1px solid rgba(204, 213, 219, 1);
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
                height: 36px;
                color: #666666;
                padding: 0 8px;
                line-height: 36px;
                background: #f0f3f4;
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
                    // margin-left: 8px;
                    text-indent: 8px;
                    &:hover {
                        color: #fff;
                        background: #ccd5db;
                    }
                }
            }
            .eqc-drop-dwon-container {
                width: 232px;
                padding-top: 8px;
                font-size: 14px;
                margin-top: -9px;
                height: 100%;
                .wrap {
                    position: relative;
                    width: 100%;
                    // max-height: 600px;
                    .list {
                        width: 100%;
                        padding: 1px 1px 8px 1px;
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
}
</style>
