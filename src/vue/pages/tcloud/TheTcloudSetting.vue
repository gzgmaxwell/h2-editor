<template>
    <div
        class="eqc-tcloud-setting"
    >
        <div class="content">
            <div class="setting">
                <div class="part-1">
                    <ul>
                        <li class="words-box">
                            <p
                                class="title hint--right hint--rounded"
                                data-hint="点击框内空白处添加词语，回车保存"
                            >
                                关键词
                            </p>
                            <div class="inner">
                                <ul
                                    class="words-list"
                                    :style="{border:!keyWord?'1px solid #ff0000':''}"
                                    @click="addWordItem($event, 'keyword')"
                                >
                                    <li
                                        v-if="keyWord"
                                        ref="keyWord"
                                        @mouseover="keyWord.showWordDelete = true"
                                        @mouseleave="keyWord.showWordDelete = false"
                                        @dblclick="editWordItem($event, keyWord)"
                                        @click="$event && $event.stopPropagation()"
                                    >
                                        <span
                                            v-if="!keyWord.showWordInput"
                                            class="word-name hint--bottom hint--rounded"
                                            data-hint="双击修改"
                                        >{{ keyWord.name }}</span>
                                        <input
                                            v-if="keyWord.showWordInput"
                                            ref="keywordEnter"
                                            v-model="keyWord.wordTagName"
                                            type="text"
                                            class="word-enter"
                                            maxlength="5"
                                            @blur="blurWordInput($event, keyWord)"
                                            @keyup.enter="enterWordInput($event, keyWord)"
                                        >
                                        <span
                                            v-if="keyWord.showWordDelete && !keyWord.showWordInput"
                                            class="word-delete"
                                            @click="deleteWord($event, keyWord,'keyword')"
                                        >
                                            <i class="eqf-minus-f" />
                                        </span>
                                    </li>
                                </ul>
                                <input
                                    v-show="showAddKeyWordInput"
                                    ref="addKeyWord"
                                    v-model="addKeyWord"
                                    type="text"
                                    class="add-a-word"
                                    maxlength="5"
                                    @blur="blurAddWord($event, 'keyword')"
                                    @keyup.enter="enterAddWord($event, 'keyword')"
                                >
                            </div>
                            <p class="tip">
                                所有单词不超过5个字
                            </p>
                        </li>
                        <li class="words-box">
                            <p
                                class="title hint--right hint--rounded"
                                data-hint="点击框内空白处添加词语，回车保存"
                            >
                                其他词
                            </p>
                            <div
                                ref="commonWordsBox"
                                class="common-words"
                                :style="{border:commonWords.length === 0?'1px solid #ff0000':''}"
                                @click="addWordItem($event, 'common')"
                            >
                                <ul
                                    class="words-list2"
                                >
                                    <li
                                        v-for="item of commonWords"
                                        :key="item.id"
                                        :ref="`${item.id}commonWord`"
                                        @mouseover="item.showWordDelete = true"
                                        @mouseleave="item.showWordDelete = false"
                                        @dblclick="editWordItem($event, item)"
                                        @click="$event && $event.stopPropagation()"
                                    >
                                        <span
                                            v-if="!item.showWordInput"
                                            class="word-name hint--bottom hint--rounded"
                                            data-hint="双击修改"
                                        >{{ item.name }}</span>
                                        <input
                                            v-if="item.showWordInput"
                                            :ref="`${item.id}wordEnter`"
                                            v-model="item.wordTagName"
                                            type="text"
                                            class="word-enter"
                                            maxlength="5"
                                            @blur="blurWordInput($event, item)"
                                            @keyup.enter="enterWordInput($event, item)"
                                        >
                                        <span
                                            v-if="item.showWordDelete && !item.showWordInput"
                                            class="word-delete"
                                            @click="deleteWord($event, item,'common')"
                                        >
                                            <i class="eqf-minus-f" />
                                        </span>
                                    </li>
                                </ul>
                                <input
                                    v-show="showAddCommonWordInput"
                                    ref="addCommonWord"
                                    v-model="addCommonWord"
                                    type="text"
                                    class="add-a-word"
                                    maxlength="5"
                                    @blur="blurAddWord($event, 'common')"
                                    @keyup.enter="enterAddWord($event, 'common')"
                                >
                            </div>
                        </li>
                        <li>
                            <ul class="tp-oper">
                                <li>
                                    <p class="title">
                                        字体
                                    </p>
                                    <div
                                        class="base-type-default font-type"
                                        @mouseover="selectFont = true"
                                        @mouseleave="selectFont = false"
                                    >
                                        <span
                                            id="fontName"
                                            class="ellipsis"
                                        >
                                            {{ fontType && fontType.name }}
                                        </span>
                                        <div
                                            class="triangle"
                                        >
                                            <i
                                                class="icon eqf-menu-down"
                                            />
                                        </div>
                                        <base-drop-down
                                            v-if="selectFont"
                                            :list="fontTypeList"
                                            :css="{left: '0px', top: '30px', paddingBottom: '10px', width: '100%', zIndex: 3}"
                                            :selected-item="fontType"
                                            :max-item-num="5"
                                            item-key="name"
                                            @choose="chooseFontType"
                                        />
                                    </div>
                                </li>
                                <li>
                                    <p class="title">
                                        最大字号
                                    </p>
                                    <base-input
                                        :model="fontSizeObj"
                                        :min="50"
                                        :max="200"
                                        class="base-input"
                                        model-key="size"
                                    />
                                </li>
                                <li>
                                    <p class="title">
                                        紧密度
                                    </p>
                                    <div
                                        class="base-type-default grid-type"
                                        @mouseover="selectGridSize = true"
                                        @mouseleave="selectGridSize = false"
                                    >
                                        <span class="ellipsis">{{ gridType.name }}</span>
                                        <div
                                            class="triangle"
                                        >
                                            <i
                                                class="icon eqf-menu-down"
                                            />
                                        </div>
                                        <base-drop-down
                                            v-if="selectGridSize"
                                            :list="gridTypeList"
                                            :css="{left: '0px', top: '30px', paddingBottom: '10px', width: '100%', zIndex: 3}"
                                            :selected-item="gridType"
                                            :max-item-num="5"
                                            item-key="size"
                                            @choose="chooseGridType"
                                        />
                                    </div>
                                </li>
                            </ul>
                        </li>
                        <li class="text-rotate">
                            <p class="title">
                                旋转角度
                            </p>
                            <ul class="degree">
                                <li
                                    v-for="item of degree"
                                    :key="item.cover"
                                    @click="chooseDegree(item)"
                                >
                                    <img :src="JSON.stringify(selectedDegreeItem) === JSON.stringify(item) ? item.scover : item.cover">
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div class="part-2">
                    <div class="middle">
                        <div class="tabs">
                            <p class="title">
                                文字颜色
                            </p>
                            <ul class="tab">
                                <li
                                    :class="[{'tab-selected':!isTextColorCustomized}]"
                                    class="auto"
                                    @click="tabSelect('text','auto')"
                                >
                                    自动配色
                                </li>
                                <li
                                    :class="[{'tab-selected':isTextColorCustomized}]"
                                    class="custom"
                                    @click="tabSelect('text','custom')"
                                >
                                    自定义
                                </li>
                            </ul>
                        </div>
                        <div
                            v-if="isTextColorCustomized"
                            class="color-palette"
                        >
                            <ul class="cl-palettes">
                                <li
                                    v-for="(item,i) of colorList"
                                    :key="i"
                                    @click="selectRecommendColor(item.color)"
                                >
                                    <div
                                        v-for="(v, index) of item.color"
                                        :key="index"
                                        :style="{width: parseFloat(100/item.count).toFixed(2)+'%',
                                                 background: v,
                                                 borderTopLeftRadius: index === 0 ? '3px':'0',
                                                 borderBottomLeftRadius: index === 0 ? '3px':'0',
                                                 borderTopRightRadius: index === item.count - 1 ? '3px':'0',
                                                 borderBottomRightRadius: index === item.count - 1 ? '3px':'0'}"
                                    />
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div
                        v-if="isTextColorCustomized"
                        class="bottom"
                    >
                        <p class="title">
                            已选自定义颜色
                        </p>
                        <ul class="colors">
                            <li
                                v-for="(item, index) of userSelectTextColor"
                                :key="index"
                                class="btn clear-btn"
                            >
                                <div
                                    :style="{background:item}"
                                    class="btn-color"
                                />
                                <i
                                    class="delete-btn eqf-no"
                                    @click="deleteUserSelectColor(index)"
                                />
                            </li>
                        </ul>
                        <div
                            :class="[{'hint--top hint--rounded':userSelectTextColor.length >= 6}]"
                            data-hint="最多选择6种颜色"
                        >
                            <div
                                :class="[{disabled: userSelectTextColor.length >= 6}]"
                                class="add-btn"
                                @click="showColorPanel($event, 1)"
                            >
                                <i
                                    class="eqf-plus"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="part-3">
                    <div class="bg-setting">
                        <div class="tabs">
                            <p class="title">
                                背景颜色
                            </p>
                            <ul class="tab">
                                <li
                                    :class="[{'tab-selected':!isBgColorCustomized}]"
                                    class="auto"
                                    @click="tabSelect('bg','auto')"
                                >
                                    自动配色
                                </li>
                                <li
                                    :class="[{'tab-selected':isBgColorCustomized}]"
                                    class="custom"
                                    @click="tabSelect('bg','custom')"
                                >
                                    自定义
                                </li>
                            </ul>
                        </div>

                        <ul
                            v-if="isBgColorCustomized"
                            class="colors"
                        >
                            <li
                                class="btn clear-btn"
                                @click="chooseBgColor('transparent')"
                            >
                                <i
                                    v-if="userSelectBgColor === 'transparent'"
                                    class="select-flag eqf-yes"
                                />
                            </li>
                            <li
                                class="btn setting-btn"
                                @click="showColorPanel($event, 0)"
                            />
                            <li
                                v-for="(item, index) of bgColorList"
                                :key="index"
                                class="btn clear-btn"
                                @click="chooseBgColor(item)"
                            >
                                <div
                                    :style="{background:item}"
                                    class="show-color"
                                >
                                    <i
                                        v-if="userSelectBgColor === item"
                                        class="select-flag eqf-yes"
                                    />
                                </div>
                            </li>
                        </ul>
                        <div class="bg-trans-box">
                            <div class="name">
                                透明度
                            </div>
                            <div class="range-box">
                                <input
                                    v-model="bgTransObj.opacity"
                                    type="range"
                                    min="0"
                                    max="1.0"
                                    step="0.01"
                                >
                                <div class="unit">
                                    {{ parseInt(bgTransObj.opacity * 100) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                class="btns"
            >
                <div
                    class="clear"
                    @click="clearPreview"
                >
                    清空画布
                </div>
                <div
                    class="render"
                    @click="refresh"
                >
                    <i
                        class="eqf-refresh-cw"
                    />
                    <p class="text">
                        刷新预览文字云
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import img1 from '../../../img/wc/wc_rotate_1.png'
import img2 from '../../../img/wc/wc_rotate_2.png'
import img3 from '../../../img/wc/wc_rotate_3.png'
import img4 from '../../../img/wc/wc_rotate_4.png'
import img5 from '../../../img/wc/wc_rotate_5.png'
import img6 from '../../../img/wc/wc_rotate_6.png'
import img7 from '../../../img/wc/wc_rotate_7.png'
import img8 from '../../../img/wc/wc_rotate_8.png'
import img9 from '../../../img/wc/wc_rotate_9.png'
import img10 from '../../../img/wc/wc_rotate_10.png'

import img1s from '../../../img/wc/wc_rotate_1_s.png'
import img2s from '../../../img/wc/wc_rotate_2_s.png'
import img3s from '../../../img/wc/wc_rotate_3_s.png'
import img4s from '../../../img/wc/wc_rotate_4_s.png'
import img5s from '../../../img/wc/wc_rotate_5_s.png'
import img6s from '../../../img/wc/wc_rotate_6_s.png'
import img7s from '../../../img/wc/wc_rotate_7_s.png'
import img8s from '../../../img/wc/wc_rotate_8_s.png'
import img9s from '../../../img/wc/wc_rotate_9_s.png'
import img10s from '../../../img/wc/wc_rotate_10_s.png'

import { host } from '../../../config/env'
import wordCloudColor from '../../plugins/wordCloudColor'
import colorTransfer from '../../../utils/color'

import TcloudMode from '../../../config/enum.tcloudMode.type'

export default {
    props: {
        mode: {
            type: Number,
            default: null
        }
    },
    data() {
        return {
            tMode: TcloudMode,
            showAddKeyWordInput: false,
            addKeyWord: '',
            showAddCommonWordInput: false,
            addCommonWord: '',
            keyWord: { id: 'key', name: '轻设计', showWordInput: false, wordTagName: '', showWordDelete: false },
            commonWords: [{ id: 'tcloud-0', name: '作图神器', showWordInput: false, wordTagName: '', showWordDelete: false },
                { id: 'tcloud-1', name: '易企秀', showWordInput: false, wordTagName: '', showWordDelete: false },
                { id: 'tcloud-2', name: '免费模板', showWordInput: false, wordTagName: '', showWordDelete: false }],
            customColor: { // 色盘model
                color: ''
            },
            colorList: wordCloudColor, // 文字推荐配色
            bgColorList: ['rgba(0, 0, 0, 1)', 'rgba(255, 255, 255, 1)', 'rgba(21, 147, 255, 1)', 'rgba(255, 41, 106, 1)',
                'rgba(252, 152, 3, 1)', 'rgba(255, 84, 72, 1)', 'rgba(80, 227, 194, 1)', 'rgba(189, 16, 224, 1)', 'rgba(184, 233, 134, 1)', 'rgba(248, 231, 28, 1)'], // 背景推荐配色
            userSelectBgColor: 'rgba(0, 0, 0, 1)', // 用户选择的背景色
            userSelectTextColor: JSON.parse(JSON.stringify(wordCloudColor[0].color)), // 用户选择的文字色
            curColorSetting: 0, // 当前设置的颜色项 0:背景色 1:文字配色
            isCreating: false, // 是否正在生成中
            errorTip: false, // 文字框错误提示
            isBgColorCustomized: false,
            isTextColorCustomized: false,
            bgTransObj: { opacity: 0.1 },
            selectGridSize: false,
            gridType: { name: '正常', size: 4 }, // 选择的紧密度
            gridTypeList: [{ name: '极度松散', size: 8 }, { name: '松散', size: 6 }, { name: '正常', size: 4 }, { name: '紧密', size: 2 }, { name: '极度紧密', size: 1 }],
            fontSizeObj: { size: 200 }, // 最大字号
            selectFont: false,
            fontType: null, // 选择的字体
            fontTypeList: [],
            selectedDegreeItem: { rotateRatio: 0.5, minRotation: -Math.PI / 2, maxRotation: Math.PI / 2, rotationSteps: 0, cover: img1, scover: img1s },
            isModify: false, // 是否有改变设置
            degree: [{ rotateRatio: 0.5, minRotation: -Math.PI / 2, maxRotation: Math.PI / 2, rotationSteps: 0, cover: img1, scover: img1s },
                { rotateRatio: 1, minRotation: Math.PI * 3 / 2, maxRotation: Math.PI * 3 / 2, rotationSteps: 0, cover: img3, scover: img3s },
                { rotateRatio: 0.5, minRotation: Math.PI * 3 / 2, maxRotation: Math.PI * 3 / 2, rotationSteps: 0, cover: img4, scover: img4s },
                { rotateRatio: 0, minRotation: -Math.PI / 2, maxRotation: Math.PI / 2, rotationSteps: 0, cover: img2, scover: img2s },
                { rotateRatio: 1, minRotation: Math.PI / 4, maxRotation: Math.PI * 7 / 4, rotationSteps: 2, cover: img5, scover: img5s },
                { rotateRatio: 1, minRotation: Math.PI * 7 / 4, maxRotation: Math.PI * 7 / 4, rotationSteps: 0, cover: img6, scover: img6s },
                { rotateRatio: 0.5, minRotation: Math.PI * 1 / 4, maxRotation: Math.PI * 1 / 4, rotationSteps: 2, cover: img7, scover: img7s },
                { rotateRatio: 1, minRotation: Math.PI / 4, maxRotation: Math.PI / 4, rotationSteps: 0, cover: img8, scover: img8s },
                { rotateRatio: 1, minRotation: Math.PI / 4, maxRotation: Math.PI * 7 / 4, rotationSteps: 2, cover: img9, scover: img9s },
                { rotateRatio: 0.5, minRotation: -Math.PI / 4, maxRotation: Math.PI * 3 / 2, rotationSteps: 2, cover: img10, scover: img10s }]
        }
    },
    computed: {
        wordCloud() {
            return Vue.store.state.tcloud.instance
        }
    },
    watch: {
        'customColor.color': function (color) {
            if (this.customColor.color !== '') {
                if (this.curColorSetting === 0) {
                    // 把用户选的颜色透明度设置到背景透明度
                    if (color.indexOf('#') > -1) {
                        const rgba = colorTransfer.hex2rgba(color)
                        this.bgTransObj.opacity = rgba.a
                    } else {
                        const rgba = color.match(/(\d(\.\d+)?)+/g)
                        this.bgTransObj.opacity = rgba[3]
                    }
                    if (this.bgColorList.length > 10) {
                        this.bgColorList.splice(this.bgColorList.length - 1, 1, color)
                    } else {
                        this.bgColorList.push(color)
                    }
                    this.userSelectBgColor = color
                } else if (this.curColorSetting === 1) {
                    this.userSelectTextColor.splice(this.userSelectTextColor.length - 1, 1, color)
                }
            }

            this.customColor.color = '' // 强制清空避免重复选择同一颜色不生效
        },
        'fontSizeObj.size': {
            handler(newVal, oldVal) {
                if (newVal !== oldVal) {
                    this.wordCloud.setOptionMaxFontSize(parseInt(this.fontSizeObj.size))
                }
            }
        },
        'bgTransObj.opacity': {
            handler(newVal, oldVal) {
                if (newVal !== oldVal) {
                    this.wordCloud.bgTransOpacity = this.bgTransObj.opacity
                }
            }
        },
        userSelectBgColor: {
            handler(newVal, oldVal) {
                if (newVal !== oldVal) {
                    this.wordCloud.userSelectBgColor = this.userSelectBgColor
                    if (this.isBgColorCustomized) {
                        this.wordCloud.setOptionBgColor()
                    }
                }
            }
        },
        userSelectTextColor: {
            handler(newVal) {
                this.wordCloud.userSelectTextColor = this.userSelectTextColor
                if (this.isTextColorCustomized) {
                    this.wordCloud.setOptionTextColor()
                }
            }
        }
    },
    mounted() {
        this.fontRequest()
    },
    methods: {
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
                            this.fontTypeList.push(font)
                            styles.push(`@font-face{font-family: "${font.fontFamily}";src: url(${Vue.env.host.font}/store/fonts/${font.fontFamilyReal}.woff?text=${encodeURIComponent(font.name)}) format("woff")}\r\n`)
                            // 将默认字体设置为 方正综艺简体
                            if (font.name === '方正综艺简体') {
                                this.fontType = font
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

                    this.fontTypeList.unshift({ name: '默认字体', fontFamily: '', fontFamilyReal: '' })
                    if (!this.fontType) {
                        this.fontType = this.fontTypeList[0]
                    }

                    // 初始化字云参数
                    if (this.mode !== this.tMode.independent) {
                        // 非独立入口时页面进入时有slide动画，
                        // 动画有300ms延迟，之后页面才加载完成，故初始化字云参数需要延迟>300ms
                        setTimeout(() => {
                            this.setTcloudOption()
                        }, 450)
                    } else {
                        this.setTcloudOption()
                    }
                })
                .catch(err => {
                    err && Vue.logger.error(err)
                    Vue.loading.close()
                })
        },
        // 选择方向
        chooseDegree(item) {
            this.selectedDegreeItem = item
            this.wordCloud.setOptionRotate(this.selectedDegreeItem)
        },
        // 选择字体
        chooseFontType(item) {
            this.fontType = item
            this.selectFont = false // 选择后关掉下拉框
            this.downloadWebFont(item.fontFamilyReal, item.src)
        },
        // 加载全量字体
        downloadWebFont(fontFamilyReal, src) {
            if (fontFamilyReal !== '' && src !== '' && !document.querySelector('#' + fontFamilyReal)) {
                const $style = document.createElement('style')
                $style.id = fontFamilyReal
                $style.innerHTML = `@font-face{font-family: "${fontFamilyReal}";src: url(${host.file + src}) format("woff")}\r\n`
                document.head.appendChild($style)

                const $fontName = document.getElementById('fontName')
                $fontName && $fontName.css({ fontFamily: fontFamilyReal })

                this.wordCloud && this.wordCloud.setOptionFontStyle(fontFamilyReal)
            }
        },
        // 选择紧密度
        chooseGridType(item) {
            this.gridType = item
            this.selectGridSize = false // 选择后关掉下拉框
            this.wordCloud.setOptionGridSize(this.gridType.size)
        },
        tabSelect(tab, type) {
            if (tab === 'bg') {
                if (type === 'auto') {
                    this.isBgColorCustomized = false
                } else {
                    this.isBgColorCustomized = true
                }
                this.wordCloud.isBgColorCustomized = this.isBgColorCustomized
            } else if (tab === 'text') {
                if (type === 'auto') {
                    this.isTextColorCustomized = false
                } else {
                    this.isTextColorCustomized = true
                }
                this.wordCloud.isTextColorCustomized = this.isTextColorCustomized
            }
        },
        // 打开色盘
        showColorPanel(e, index) {
            document.addEventListener('mousedown', this.hideColorPanel)
            this.curColorSetting = index
            if (index === 1) {
                this.userSelectTextColor.push('#000000')
            }
            let top = e.pageY - 410
            const left = e.pageX - 400
            if (top < 0) {
                top = e.pageY + 40
            }
            Vue.colorPicker.open(this.customColor, 'color', { left: left + 'px', top: top + 'px' }, false)
        },
        // 关闭色盘
        hideColorPanel() {
            if (!this.colorPicker.getState().isOpenSucker) {
                document.removeEventListener('mousedown', this.hideColorPanel)
                Vue.colorPicker.close()
            }
        },
        // 删除文字颜色
        deleteUserSelectColor(index) {
            this.userSelectTextColor.splice(index, 1)
        },
        // 选取推荐配色条
        selectRecommendColor(colors) {
            this.userSelectTextColor.splice(0)
            this.userSelectTextColor = this.userSelectTextColor.concat(colors)
        },
        // 选择背景色
        chooseBgColor(color) {
            this.userSelectBgColor = color
        },
        // 双击编辑文字标签
        editWordItem(event, item) {
            event && event.stopPropagation()
            item.showWordInput = true
            item.wordTagName = item.name
            const ref = `${item.id}wordEnter`

            setTimeout(() => {
                if (ref === 'keywordEnter') {
                    this.$refs.keywordEnter.focus()
                } else {
                    this.$refs[ref][0] && this.$refs[ref][0].focus()
                }
            })
        },
        // 文字标签修改完成
        enterWordInput(event, item) {
            event && event.stopPropagation()
            if (item.wordTagName.length === 0) {
                item.showWordInput = false
                return
            }
            item.name = item.wordTagName
            item.showWordInput = false
            this.updateWordsOption()
        },
        blurWordInput(event, item) {
            event && event.stopPropagation()
            item.showWordInput = false
        },
        deleteWord(event, item, type) {
            event && event.stopPropagation()
            if (type === 'keyword') {
                this.keyWord = null
            } else if (type === 'common') {
                const index = this.commonWords.indexOf(item)
                this.commonWords.splice(index, 1)
                this.commonWords.map((v, i) => {
                    v.id = `tcloud-${i}`
                })
            }
            this.updateWordsOption()
        },
        // 点击空白处添加文字
        addWordItem(event, type) {
            event && event.stopPropagation()
            if (type === 'keyword') {
                this.showAddKeyWordInput = true
                const $ele = this.$refs.addKeyWord
                const $keyWord = this.$refs.keyWord
                let wleft = 10
                let wtop = 3
                let wwidth = 80
                if ($keyWord) {
                    wleft = $keyWord.offsetLeft + $keyWord.offsetWidth
                    wtop = $keyWord.offsetTop
                    wwidth = 112 - $keyWord.offsetWidth
                }
                $ele.style.left = wleft + 'px'
                $ele.style.top = wtop + 'px'
                $ele.style.width = wwidth + 'px'
                setTimeout(() => {
                    $ele.focus()
                })
            } else if (type === 'common') {
                this.showAddCommonWordInput = true
                const $ele = this.$refs.addCommonWord
                let wleft = 10
                let wtop = 3
                let wwidth = 80

                if (this.commonWords.length > 0) {
                    const id = this.commonWords[this.commonWords.length - 1].id
                    const lastItemRef = `${id}commonWord`
                    const $lastWord = this.$refs[lastItemRef][0]
                    if ($lastWord) {
                        wleft = $lastWord.offsetLeft + $lastWord.offsetWidth
                        wtop = $lastWord.offsetTop
                        wwidth = 300 - $lastWord.offsetWidth - $lastWord.offsetLeft
                    }
                }
                $ele.style.left = wleft + 'px'
                $ele.style.top = wtop + 'px'
                $ele.style.width = wwidth + 'px'
                setTimeout(() => {
                    $ele.focus()
                })
            }
        },
        // 添加单词回车完成
        enterAddWord(event, type) {
            event && event.stopPropagation()
            if (type === 'keyword') {
                if (this.addKeyWord.length === 0) {
                    this.showAddKeyWordInput = false
                    return
                }
                if (!this.keyWord) {
                    this.keyWord = { id: 'tcloud-key', name: '轻设计', showWordInput: false, wordTagName: '', showWordDelete: false }
                }
                this.keyWord.name = this.addKeyWord
                this.showAddKeyWordInput = false
                this.addKeyWord = ''
            } else if (type === 'common') {
                if (this.addCommonWord.length === 0) {
                    this.showAddCommonWordInput = false
                    return
                }
                const item = { id: `tcloud-${this.commonWords.length}`, name: this.addCommonWord, showWordInput: false, wordTagName: '', showWordDelete: false }
                this.commonWords.push(item)
                this.showAddCommonWordInput = false
                this.addCommonWord = ''
                this.toBottom()
            }
            this.updateWordsOption()
        },
        blurAddWord(event, type) {
            event && event.stopPropagation()
            if (type === 'keyword') {
                this.showAddKeyWordInput = false
            } else if (type === 'common') {
                this.showAddCommonWordInput = false
            }
        },
        // 单词栏滚动到底部
        toBottom() {
            const $commonWordsBox = this.$refs.commonWordsBox
            const clientHeight = $commonWordsBox.clientHeight
            const maxHeight = $commonWordsBox.scrollHeight - clientHeight
            $commonWordsBox.scrollTop = maxHeight
        },
        setTcloudOption() {
            if (!this.keyWord || this.commonWords.length === 0) {
                Vue.notifier.warn('请添加文字')
                return
            }
            this.wordCloud.bgTransOpacity = this.bgTransObj.opacity
            this.wordCloud.isBgColorCustomized = this.isBgColorCustomized
            this.wordCloud.isTextColorCustomized = this.isTextColorCustomized
            this.wordCloud.userSelectBgColor = this.userSelectBgColor
            this.wordCloud.userSelectTextColor = this.userSelectTextColor

            if (this.isBgColorCustomized) {
                this.wordCloud.setOptionBgColor()
            }

            const fy = this.fontType && this.fontType.fontFamilyReal ? this.fontType.fontFamilyReal : 'Times, serif'
            this.wordCloud.setOptionFontStyle(fy)
            this.wordCloud.setOptionMaxFontSize(parseInt(this.fontSizeObj.size))
            this.wordCloud.setOptionGridSize(this.gridType.size)
            this.wordCloud.setOptionRotate(this.selectedDegreeItem)

            if (this.isTextColorCustomized) {
                this.wordCloud.setOptionTextColor()
            }
            this.updateWordsOption()
        },
        updateWordsOption() {
            this.wordCloud.words = []
            if (this.keyWord) {
                this.wordCloud.words.push(this.keyWord.name)
            }

            this.commonWords.map(v => {
                this.wordCloud.words.push(v.name)
            })
            this.wordCloud.setOptionWords()
        },
        clearPreview() {
            this.wordCloud.clearCanvas()
        },
        refresh() {
            if (this.wordCloud.maskCanvasList.length === 0) {
                Vue.notifier.warn('请选择一个形状图片')
                return
            }
            if (!this.keyWord || this.commonWords.length === 0) {
                Vue.notifier.warn('请添加文字')
                return
            }
            this.wordCloud.clearCanvas()
            this.setTcloudOption()
            this.wordCloud.run(this.wordCloud.maskCanvasList[0])
        }
    }
}
</script>

<style lang="scss">
.eqc-tcloud-setting {
    position: relative;
    width: 400px;
    height: calc(100% - 60px);
    background: #ffffff;
    border-left: 1px solid #ccd5db;
    .content {
        position: relative;
        width: 100%;
        height: 100%;
        .btns {
            width: 100%;
            height: 48px;
            border-top: 1px solid #ccd5db;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: absolute;
            bottom: 0;
            left: 0;
            font-size: 13px;
            cursor: pointer;
            .clear {
                width: calc(100% - 160px);
                height: 100%;
                text-align: left;
                line-height: 48px;
                text-indent: 16px;
                background: #ffffff;
            }
            .render {
                width: 160px;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                color: #fff;
                background: #1593ff;
                .text {
                    margin-left: 4px;
                }
            }
        }
        .setting {
            height: calc(100% - 48px);
            overflow-y: scroll;
            overflow-x: hidden;
            &::-webkit-scrollbar {
                width: 8px;
            }
            &::-webkit-scrollbar-track {
                background-color: #fff;
            }
            &::-webkit-scrollbar-thumb {
                background-color: rgba(0, 0, 0, 0.2);
                height: 80px;
                border-radius: 4px;
            }
            .part-1 {
                padding: 20px 0;
                margin: 0 16px;
                border-bottom: 1px solid #e6ebed;
                .words-box {
                    display: flex;
                    position: relative;
                    justify-content: flex-start;
                    align-items: center;
                    margin-bottom: 12px;
                    .inner {
                        position: relative;
                        margin: 0 12px 0 17px;
                    }
                    > .title {
                        font-size: 13px;
                        font-weight: bold;
                        color: rgba(17, 17, 17, 1);
                        line-height: 16px;
                    }
                    .common-words {
                        position: relative;
                        width: 300px;
                        height: 80px;
                        margin: 0px 0px 4px 17px;
                        background: rgba(255, 255, 255, 1);
                        border-radius: 2px;
                        border: 1px solid rgba(204, 213, 219, 1);
                        overflow-y: scroll;
                        overflow-x: hidden;
                        &::-webkit-scrollbar {
                            width: 4px;
                        }
                        &::-webkit-scrollbar-track {
                            background-color: #fff;
                        }
                        &::-webkit-scrollbar-thumb {
                            background-color: rgba(0, 0, 0, 0.2);
                            height: 10px;
                            border-radius: 4px;
                        }
                    }
                    .words-list2 {
                        width: 100%;
                        display: flex;
                        align-items: flex-start;
                        justify-content: flex-start;
                        flex-wrap: wrap;
                        position: relative;
                    }
                    .words-list {
                        position: relative;
                        width: 112px;
                        height: 32px;
                        background: rgba(255, 255, 255, 1);
                        border-radius: 2px;
                        border: 1px solid rgba(204, 213, 219, 1);
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                        // margin: 0 12px 0 17px;
                    }
                    .add-a-word {
                        width: 80px;
                        height: 24px;
                        position: absolute;
                        background: transparent;
                    }
                    .words-list,
                    .words-list2 {
                        > li {
                            position: relative;
                            margin: 8px 0;
                            .word-name {
                                background: rgba(236, 238, 240, 1);
                                border-radius: 2px;
                                height: 24px;
                                line-height: 24px;
                                margin: 0 4px;
                                font-size: 13px;
                                font-weight: 400;
                                color: rgba(37, 43, 63, 1);
                                padding: 0 8px;
                                white-space: nowrap;
                                cursor: pointer;
                            }
                            .word-enter {
                                width: 80px;
                                height: 24px;
                                font-size: 13px;
                                font-weight: 400;
                                color: rgba(37, 43, 63, 1);
                                padding: 0 8px;
                                white-space: nowrap;
                            }
                            .word-delete {
                                position: absolute;
                                top: -6px;
                                right: -4px;
                                font-size: 13px;
                                color: #252b3f !important;
                                &:hover {
                                    color: #ff4b4b !important;
                                }
                            }
                        }
                    }

                    .tip {
                        font-size: 12px;
                        font-weight: 400;
                        color: rgba(102, 102, 102, 1);
                        line-height: 17px;
                    }
                }
                .tp-oper {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: nowrap;
                    justify-content: space-around;
                    align-items: center;
                    width: 100%;
                    height: 72px;
                    padding-top: 12px;
                    > li {
                        width: 120px;
                        margin-right: 12px;
                        position: relative;
                        .title {
                            font-size: 13px;
                            color: #111111;
                            line-height: 20px;
                            font-weight: 600;
                        }
                        .base-type-default {
                            position: relative;
                            cursor: pointer;
                            background: white;
                            border-radius: 3px;
                            width: auto;
                            margin: 8px 0;
                            display: flex;
                            padding-left: 12px;
                            justify-content: space-between;
                            align-items: center;
                            height: 30px;
                            border: 1px solid #ccd5db;
                            font-size: 13px;
                            .triangle {
                                display: block;
                                width: 36px;
                                height: 36px;
                                font-size: 20px;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                transition: all 0.3s;
                            }
                        }
                        .base-input {
                            margin: 8px 0;
                            > input {
                                border-radius: 3px;
                            }
                        }
                        .rotate-ratio-box {
                            margin: 8px 0;
                            height: 30px;
                            display: flex;
                            flex-direction: row;
                            flex-wrap: nowrap;
                            justify-content: space-between;
                            align-items: center;
                            font-size: 13px;
                            width: 88px;
                        }
                    }
                }
                .text-rotate {
                    width: 100%;
                    position: relative;
                    margin-top: 4px;
                    .title {
                        font-size: 13px;
                        color: #111111;
                        line-height: 20px;
                        font-weight: 600;
                    }
                    .degree {
                        display: flex;
                        flex-direction: row;
                        flex-wrap: wrap;
                        justify-content: flex-start;
                        align-items: center;
                        margin-top: 8px;
                        > li {
                            width: 48px;
                            cursor: pointer;
                            margin-right: 4px;
                            margin-bottom: 4px;
                            img {
                                width: 100%;
                            }
                            &:hover {
                                transform: scale(1.1);
                            }
                        }
                    }
                }
            }
            .part-2 {
                padding: 20px 0;
                margin: 0 16px;
                border-bottom: 1px solid #e6ebed;
                .middle {
                    width: 100%;
                    position: relative;
                    .tabs {
                        display: flex;
                        flex-direction: row;
                        flex-wrap: nowrap;
                        justify-content: flex-start;
                        align-items: center;
                        position: relative;
                        > .title {
                            font-size: 13px;
                            color: rgba(17, 17, 17, 1);
                            line-height: 20px;
                            margin-right: 12px;
                            font-weight: 600;
                        }
                        .tab {
                            display: flex;
                            flex-direction: row;
                            flex-wrap: nowrap;
                            justify-content: flex-start;
                            align-items: center;
                            position: relative;
                            > li {
                                width: 86px;
                                height: 28px;
                                text-align: center;
                                line-height: 28px;
                                cursor: pointer;
                                font-size: 12px;
                            }
                            .auto {
                                border-top: 1px solid #ccd5db;
                                border-bottom: 1px solid #ccd5db;
                                border-left: 1px solid #ccd5db;
                                border-top-left-radius: 3px;
                                border-bottom-left-radius: 3px;
                            }
                            .custom {
                                border: 1px solid #ccd5db;
                                border-top-right-radius: 3px;
                                border-bottom-right-radius: 3px;
                            }
                            .tab-selected {
                                border: 1px solid #1593ff;
                                background: #1593ff;
                                color: #ffffff;
                            }
                        }
                    }

                    .palettes {
                        width: 100%;
                        display: flex;
                        flex-direction: row;
                        flex-wrap: wrap;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .color-palette {
                        margin-top: 12px;
                        .cl-palettes {
                            display: flex;
                            flex-direction: row;
                            flex-wrap: wrap;
                            justify-content: flex-start;
                            align-items: center;
                            > li {
                                width: 112px;
                                height: 25px;
                                display: flex;
                                flex-direction: row;
                                flex-wrap: nowrap;
                                justify-content: space-around;
                                align-items: center;
                                margin-bottom: 8px;
                                margin-right: 10px;
                                cursor: pointer;
                                border-radius: 3px;
                                transition: transform 0.1s;
                                div {
                                    height: 100%;
                                }
                                &:hover {
                                    transform: scale(1.1);
                                    box-shadow: $boxShadow;
                                }
                            }
                            > li:nth-child(3n + 3) {
                                margin-right: 0;
                            }
                        }
                    }
                }
                .bottom {
                    margin-top: 20px;
                    width: 100%;
                    position: relative;
                    display: flex;
                    flex-direction: row;
                    flex-wrap: nowrap;
                    justify-content: flex-start;
                    align-items: center;
                    > .title {
                        font-size: 13px;
                        color: #111111;
                        line-height: 20px;
                        margin-right: 8px;
                        font-weight: 600;
                    }
                    .colors {
                        display: flex;
                        flex-direction: row;
                        flex-wrap: nowrap;
                        justify-content: flex-start;
                        align-items: center;
                        > .btn {
                            font-size: 14px;
                            width: 28px;
                            height: 28px;
                            position: relative;
                            margin-right: 8px;
                            cursor: pointer;
                            border-radius: 3px;
                            box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.16);
                            transition: transform 0.1s;
                            .btn-color {
                                width: 100%;
                                height: 100%;
                                border-radius: 3px;
                            }
                            .delete-btn {
                                background: rgba(79, 93, 105, 1);
                                border-radius: 12px;
                                color: #ffffff;
                                font-size: 12px;
                                padding: 1px;
                                display: none;
                                position: absolute;
                                top: -6px;
                                left: -4px;
                                transition: all 0.3s;
                                &:hover {
                                    background: $red-normal;
                                }
                            }
                            &:hover {
                                transform: scale(1.2);
                                box-shadow: $boxShadow;
                                .delete-btn {
                                    display: block;
                                }
                            }
                        }
                    }
                    .clear-btn {
                        background: url("../../../img/opacity.png") center;
                    }
                    .add-btn {
                        width: 28px;
                        height: 28px;
                        background: rgba(255, 255, 255, 1);
                        border: 1px solid rgba(204, 213, 219, 1);
                        display: flex;
                        flex-direction: column;
                        flex-wrap: nowrap;
                        justify-content: center;
                        align-items: center;
                        cursor: pointer;
                        border-radius: 3px;
                        transition: all 0.3s;
                        color: #252b3f;
                        &:hover {
                            color: #fff;
                            background: $blue-normal;
                            border: 1px solid $blue-normal;
                            transform: scale(1);
                        }
                        &.disabled {
                            color: #999;
                            pointer-events: none;
                        }
                    }
                }
            }
            .part-3 {
                padding: 20px 0;
                margin: 0 16px;
                .bg-setting {
                    display: flex;
                    flex-direction: column;
                    flex-wrap: nowrap;
                    justify-content: flex-start;
                    align-items: flex-start;
                    position: relative;
                    .tabs {
                        display: flex;
                        flex-direction: row;
                        flex-wrap: nowrap;
                        justify-content: flex-start;
                        align-items: center;
                        position: relative;
                        > .title {
                            font-size: 13px;
                            color: rgba(17, 17, 17, 1);
                            line-height: 20px;
                            margin-right: 12px;
                            font-weight: 600;
                        }
                        .tab {
                            display: flex;
                            flex-direction: row;
                            flex-wrap: nowrap;
                            justify-content: flex-start;
                            align-items: center;
                            position: relative;
                            > li {
                                width: 86px;
                                height: 28px;
                                text-align: center;
                                line-height: 28px;
                                cursor: pointer;
                                font-size: 12px;
                            }
                            .auto {
                                border-top: 1px solid #ccd5db;
                                border-bottom: 1px solid #ccd5db;
                                border-left: 1px solid #ccd5db;
                                border-top-left-radius: 3px;
                                border-bottom-left-radius: 3px;
                            }
                            .custom {
                                border: 1px solid #ccd5db;
                                border-top-right-radius: 3px;
                                border-bottom-right-radius: 3px;
                            }
                            .tab-selected {
                                border: 1px solid #1593ff;
                                background: #1593ff;
                                color: #ffffff;
                            }
                        }
                    }
                    .colors {
                        display: flex;
                        flex-direction: row;
                        flex-wrap: wrap;
                        justify-content: flex-start;
                        align-items: center;
                        margin-top: 12px;
                        > .btn {
                            font-size: 13px;
                            width: 25px;
                            height: 25px;
                            position: relative;
                            background: #fff;
                            margin-right: 6px;
                            margin-bottom: 6px;
                            cursor: pointer;
                            box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.16);
                            border-radius: 3px;
                            transition: transform 0.1s;
                            .select-flag {
                                background: #1593ff;
                                border-radius: 12px;
                                color: #ffffff;
                                font-size: 12px;
                                padding: 1px;
                                position: absolute;
                                top: -6px;
                                right: -4px;
                            }
                            &:hover {
                                transform: scale(1.2);
                                box-shadow: $boxShadow;
                            }
                            .show-color {
                                width: 100%;
                                height: 100%;
                            }
                        }
                        .clear-btn {
                            background: url("../../../img/opacity.png") center;
                        }
                        .setting-btn {
                            background: url("../../../img/color_bg.png") center;
                        }
                    }
                    .bg-trans-box {
                        color: #2f3c4d;
                        background: #fff;
                        display: flex;
                        flex-direction: row;
                        flex-wrap: nowrap;
                        justify-content: center;
                        align-items: center;
                        font-size: 13px;
                        margin-top: 16px;
                        .name {
                            line-height: 20px;
                            font-size: 13px;
                            font-weight: 600;
                            color: rgba(17, 17, 17, 1);
                            line-height: 18px;
                            margin-right: 17px;
                        }
                        .range-box {
                            width: 180px;
                            height: 30px;
                            border-radius: 2px;
                            border: 1px solid rgba(204, 213, 219, 1);
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        }
                        input[type="range"] {
                            width: 100px;
                            height: 2px;
                            font-size: 13px;
                            color: #2f3c4d;
                            background: #ccd5db;
                            margin-right: 1px;
                            -webkit-appearance: none !important;
                            // background: -webkit-linear-gradient(#059cfa, #059cfa) no-repeat;
                            background-size: 0% 100%;

                            margin: 0 auto;
                        }
                        input[type="range"]::-webkit-slider-thumb {
                            // 滑块
                            -webkit-appearance: none;
                            cursor: pointer;
                            width: 20px;
                            height: 20px;
                            background: #1593ff;
                            border: 6px solid #ffffff;
                            box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
                            border-radius: 50%;
                        }
                        input[type="range"]::-moz-range-thumb {
                            // 滑块
                            -webkit-appearance: none;
                            cursor: pointer;
                            width: 8px;
                            height: 8px;
                            background: #1593ff;
                            border: 6px solid #ffffff;
                            border-radius: 50%;
                            box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
                        }
                        .unit {
                            width: 48px;
                            font-size: 13px;
                            font-weight: 400;
                            color: rgba(37, 43, 63, 1);
                            line-height: 18px;
                            height: 30px;
                            border-left: 1px solid rgba(204, 213, 219, 1);
                            line-height: 30px;
                            text-align: center;
                        }
                    }
                }
            }
        }
    }
}
</style>
