<template>
    <div
        :style="`left:${position.x}px;top:${position.y}px`"
        class="eqc-photo-text-style-setting-panel"
    >
        <div class="row-top">
            <div
                class="font-type"
                @click="fontFamilyListClick"
            >
                <span
                    id="fontName"
                    class="ellipsis"
                >{{ fontFamilySelected.name }}</span>
                <div
                    class="triangle"
                >
                    <i class="icon eqf-menu-down" />
                </div>
                <base-drop-down
                    v-if="fontFamilyListStatus"
                    :list="fontFamilyList"
                    :css="{left: '0px', top: '30px', paddingBottom: '10px', width: '100%', zIndex: 3}"
                    :selected-item="fontFamilySelected"
                    :max-item-num="5"
                    item-key="name"
                    @choose="chooseFontFamily"
                />
            </div>
            <div class="font-size">
                <base-photo-input
                    v-if="JSON.stringify(css)!=='{}'"
                    :model="css"
                    :min="0"
                    model-key="fontSize"
                />
            </div>
            <div
                class="font-color"
            >
                <setting-color
                    :model="css"
                    model-key="color"
                />
            </div>
        </div>
        <div class="row-bottom">
            <div
                :class="['item', 'item-font-align', css.textAlign==='left' ? 'active' : '']"
                @click="chooseFontAlign('left')"
            >
                <i class="icon fl eqf-align-left" />
            </div>
            <div
                :class="['item', 'item-font-align', css.textAlign==='center' ? 'active' : '']"
                @click="chooseFontAlign('center')"
            >
                <i class="icon fl eqf-align-center" />
            </div>
            <div
                :class="['item', 'item-font-align', css.textAlign==='right' ? 'active' : '']"
                @click="chooseFontAlign('right')"
            >
                <i class="icon fl eqf-align-right" />
            </div>
            <div class="item item-spliter" />
            <div
                :class="['item', 'item-font-format', css.fontWeight==='bold' ? 'active' : '']"
                @click="chooseFontFormat('b')"
            >
                <i class="icon fl eqf-b" />
            </div>
            <div
                :class="['item', 'item-font-format', css.fontStyle==='italic' ? 'active' : '']"
                @click="chooseFontFormat('i')"
            >
                <i class="icon fl eqf-i" />
            </div>
            <div
                :class="['item', 'item-font-format', css.textDecoration==='underline' ? 'active' : '']"
                @click="chooseFontFormat('u')"
            >
                <i class="icon fl eqf-u" />
            </div>
            <div
                :class="['item', 'item-font-format', css.textDecoration==='line-through' ? 'active' : '']"
                @click="chooseFontFormat('s')"
            >
                <i class="icon fl eqf-s" />
            </div>
        </div>
    </div>
</template>

<script>

import { host } from '../../../config/env'
import elementType from '../../../config/enum.element.type.js'
import historyType from '../../../config/enum.photoHistory.type'
import SettingColor from '../pages/photo/setting/SettingColor.vue'

export default {
    components: {
        SettingColor
    },
    props: {
        // 字体
        inFontFamily: {
            type: Object,
            default: null
        },
        // 字号
        inFontSize: {
            type: Number,
            default: 0
        },
        // 字颜色
        inFontColor: {
            type: String,
            default: ''
        },
        // 对齐方式 1 左对齐 2 居中对齐 4 右对齐
        inFontAlign: {
            type: Number,
            default: 1
        },
        // 字格式 1 加粗 2 斜体 4 下划线 8 删除线
        inFontFormat: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            historyType,
            // 当前位置
            position: {
                x: 0, y: 0
            },
            // 字体列表
            fontFamilyList: [],
            // 字体列表状态 false：关闭 true：打开
            fontFamilyListStatus: false,
            // 选择的字体
            fontFamilySelected: { name: '' }
        }
    },
    computed: {
        scene() {
            return Vue.store.state.photoScene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        eqxElement() {
            const length = this.scene.eqxElementsSelected.length
            if (length > 0) {
                const ele = this.scene.eqxElementsSelected[0]
                if (ele.elementJson.type === elementType.photoText) {
                    return ele
                }
            }
            return null
        },
        property() {
            if (this.eqxElement !== null) {
                return this.eqxElement && this.eqxElement.elementJson.property
            }
            return {}
        },
        css() {
            if (this.eqxElement !== null) {
                return this.eqxElement && this.eqxElement.elementJson.css
            }
            return {}
        },
        // 历史记录
        photoHistory() {
            return Vue.store.state.photoHistory
        },
        selectType() {
            return Vue.store.state.photoLayout.nav.selectedItem.type
        }
    },
    watch: {
        'eqxPage.scale': {
            handler() {
                this.setPosition()
            },
            // 避免首次eqxPage改变时，watch还未执行的问题
            immediate: true
        },
        css: {
            handler(newVal, oldVal) {
                if (newVal && JSON.stringify(newVal) !== '{}') {
                    this.eqxElement.updateCss(newVal)
                }
            },
            deep: true
        }
    },
    created() {
        this.setPosition()
        // 初始化字体
        this.fontRequest()
    },
    mounted() {
        this.$el.addEventListener('mousedown', e => {
            Vue.colorPicker.close()
            e.stopPropagation()
            e.preventDefault()
        })
    },
    methods: {
        setPosition() {
            const elementBoxs = document.querySelector('.eqc-photo-element-boxs')
            if (!elementBoxs || elementBoxs === null) {
                return
            }
            const allElementBox = document.querySelectorAll('.eqc-comp-box')
            if (!allElementBox || allElementBox === null || allElementBox.length <= 0) {
                return
            }
            for (let i = 0; i < allElementBox.length; i++) {
                const elementBoxItem = allElementBox[i]
                if (elementBoxItem.css('display') === 'block') {
                    const elementBoxsPosition = elementBoxs.getBoundingClientRect()
                    const elementBoxItemPosition = elementBoxItem.getBoundingClientRect()
                    this.position.x = elementBoxItemPosition.x - elementBoxsPosition.x
                    this.position.y = elementBoxItemPosition.y - elementBoxsPosition.y - 127
                    break
                }
            }
        },
        // 字体数据请求
        fontRequest() {
            Vue.loading.open('字体加载中')
            Vue.api.product.getNewProducts({ apiCode: Vue.env.mall.apiCode[1], categoryId: Vue.env.mall.fontId, pageSize: 100, pageNo: 1 })
                .then(res => {
                    Vue.loading.close()
                    if (res && res.data && res.data.list) {
                        const id = 'style_font'
                        const styles = []
                        res.data.list.forEach(item => {
                            const font = {
                                name: item.name,
                                fontFamily: item.productTypeMap.font_family + '_pre',
                                fontFamilyReal: item.productTypeMap.font_family,
                                src: item.productTypeMap.woff_path
                            }
                            this.fontFamilyList.push(font)
                            styles.push(`@font-face{font-family: "${font.fontFamily}";src: url(${Vue.env.host.font}/store/fonts/${font.fontFamilyReal}.woff?text=${encodeURIComponent(font.name)}) format("woff")}\r\n`)
                            if (font.name === this.eqxElement.elementJson.property.fontFamilyName) {
                                this.fontFamilySelected = font
                                this.downloadWebFont(font.fontFamilyReal, font.src)
                            }
                        })

                        if (!document.querySelector('#' + id)) {
                            const $style = document.createElement('style')
                            $style.id = id
                            $style.innerHTML = styles.join('')
                            document.head.appendChild($style)
                        }
                    }

                    this.fontFamilyList.unshift({ name: '默认字体', fontFamily: '', fontFamilyReal: '' })
                    if (!this.fontFamilySelected || this.fontFamilySelected.name === '') {
                        this.fontFamilySelected = this.fontFamilyList[0]
                    }
                })
                .catch(err => {
                    err && Vue.logger.error(err)
                    Vue.loading.close()
                })
        },
        // 加载全量字体
        downloadWebFont(fontFamilyReal, src) {
            if (fontFamilyReal !== '' && src !== '' && !document.querySelector('#' + fontFamilyReal)) {
                const $style = document.createElement('style')
                $style.id = fontFamilyReal
                $style.innerHTML = `@font-face{font-family: "${fontFamilyReal}";src: url(${host.file + src}) format("woff")}\r\n`
                document.head.appendChild($style)
            }
            const $fontName = document.getElementById('fontName')
            $fontName && $fontName.css({ fontFamily: fontFamilyReal })
        },
        // 字体控件点击事件 控制字体列表显隐
        fontFamilyListClick() {
            this.fontFamilyListStatus = !this.fontFamilyListStatus
        },
        // 选择字体
        chooseFontFamily(item) {
            event.stopPropagation()
            this.fontFamilySelected = item
            this.fontFamilyListStatus = false
            this.downloadWebFont(item.fontFamilyReal, item.src)
            this.chooseFont(item)
        },
        chooseFont(item) {
            this.css.fontFamily = item.fontFamilyReal
            this.property.fontFamilyName = item.name
            if (item.src) {
                this.property.src = item.src
                if ([elementType.photoText].includes(this.eqxElement.elementJson.type)) {
                    this.eqxElement.createFontFace()
                }
            } else {
                delete this.property.src
            }
            this.addHistory()
        },
        // 选择对齐
        chooseFontAlign(pAlign) {
            this.css.textAlign = pAlign
            this.addHistory()
        },
        // 选择style
        chooseFontFormat(pOption) {
            if (pOption === 'b') {
                this.css.fontWeight = this.css.fontWeight ? '' : 'bold'
            } else if (pOption === 'i') {
                this.css.fontStyle = this.css.fontStyle ? '' : 'italic'
            } else if (pOption === 'u') {
                this.css.textDecoration = ['', 'line-through'].includes(this.css.textDecoration) ? 'underline' : ''
            } else if (pOption === 's') {
                this.css.textDecoration = ['', 'underline'].includes(this.css.textDecoration) ? 'line-through' : ''
            }
            this.addHistory()
        },
        addHistory() {
            this.eqxElement.updateCss(this.css)
            this.photoHistory.history.insert(JSON.parse(JSON.stringify(this.eqxPage.pageJson.elements)), null, this.historyType.text, false)
        }
    }
}
</script>

<style lang="scss">
.eqc-photo-text-style-setting-panel {
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 298px;
    height: 88px;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
    border-radius: 3px;
    padding: 12px;
    z-index: 1002;
    .row-top {
        flex: 1;
        width: 100%;
        display: flex;
        .font-type {
            position: relative;
            cursor: pointer;
            background: white;
            border-radius: 3px 0px 0px 3px;
            width: 160px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 32px;
            border: 1px solid #ccd5db;
            font-size: 13px;
            padding-left: 12px;
            .triangle {
                display: block;
                width: 36px;
                height: 36px;
                font-size: 26px;
                display: flex;
                justify-content: center;
                align-items: center;
                transition: all 0.3s;
            }
        }
        .font-size {
            width: 75px;
            display: flex;
            .eqc-base-input {
                left: -1px;
                input {
                    height: 32px;
                    border-radius: 0px 3px 3px 0px;
                }
            }
        }
        .font-color {
            width: 32px;
            height: 32px;
            margin-left: 7px;
            cursor: pointer;
        }
    }
    .row-bottom {
        flex: 1;
        width: 100%;
        display: flex;
        padding-top: 8px;
        .item {
            width: 24px;
            height: 24px;
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: 3px;
            &:nth-child(3) {
                margin-right: 0px;
            }
            &:last-child {
                margin-right: 0px;
            }
            .icon {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                color: #76838f;
                transition: all 0.3s;
            }
            &:hover:not(.active) {
                background: #eceef0;
            }
        }
        .item-spliter {
            width: 1px;
            margin: 0px 16px 0px 16px;
            background: rgba(236, 238, 240, 1);
            cursor: default;
        }
        .active {
            background: #1593ff;
            .icon {
                color: #ffffff;
            }
        }
    }
}
</style>
