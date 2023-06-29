<template>
    <div class="eqc-wordcloud-palette">
        <div class="palette">
            <div class="settings">
                <div
                    ref="settingBox"
                    class="box"
                >
                    <div class="step-1">
                        <div class="inner">
                            <div class="title">
                                <div
                                    class="pio"
                                />
                                <div>第一步：选择云形状</div>
                            </div>
                            <div class="banner">
                                <div class="swiper-container">
                                    <div
                                        ref="bannerList"
                                        class="swiper-wrapper"
                                    >
                                        <div
                                            v-for="(item,index) in bannerList"
                                            :key="index"
                                            :class="[{'selected-swiper-item':selectBannerItem.name === item.name}]"
                                            :data-index="index"
                                            class="swiper-slide"
                                            @click="selectBanner(item)"
                                        >
                                            <div>
                                                {{ item.name }}
                                                <base-new
                                                    v-if="item.name === '自定义'"
                                                    :css="{right: '-8px', top: '0px',width:'6px',height:'6px'}"
                                                    :storage-key="newKey"
                                                    storage-version="2"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    class="swiper-button swiper-button-prev"
                                />
                                <div
                                    class="swiper-button swiper-button-next"
                                />
                            </div>
                            <div
                                v-show="customShapeSelected"
                                class="upload-box"
                            >
                                <div
                                    class="upload-area flex-center"
                                    @mouseover="showUploadBtn=true"
                                >
                                    <div
                                        v-if="customShape"
                                        :style="{background: `${getBackgroundImage(customShape)} no-repeat center/contain`}"
                                        class="show-oringin-img"
                                        @mouseleave="showUploadBtn=false"
                                    />
                                    <div
                                        v-if="showUploadBtn && uploadBtnName==='重新上传'"
                                        class="layer"
                                        @mouseleave="showUploadBtn=false"
                                    />
                                    <upload-pc
                                        v-show="!customShape || showUploadBtn"
                                        v-bind="uploadOptions"
                                        :css="btnCss"
                                        :name="uploadBtnName"
                                    />
                                    <img
                                        v-if="!customShape"
                                        class="tips"
                                        :src="tipIcon"
                                    >
                                </div>
                            </div>
                            <ul class="shapes">
                                <li
                                    v-for="(item,index) of shapeList"
                                    :key="index"
                                    :class="[{'shape-selected':selectShapeItem === item}]"
                                    :style="{backgroundImage: getBackgroundImage(getQiniuImage(item.productTypeMap.path))}"
                                    class="shape"
                                    @click="shapeSelected(item)"
                                >
                                    <div
                                        v-if="selectShapeItem === item"
                                        class="shape-selected-arrow"
                                    />
                                    <i
                                        v-if="selectShapeItem === item"
                                        class="shape-selected-flag eqf-yes"
                                    />
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="step-2">
                        <div class="inner">
                            <div class="title">
                                <div
                                    class="pio"
                                />
                                <div>第二步：添加文字内容</div>
                                <p
                                    :class="[{'error-tip':errorTip},{'tip':!errorTip}]"
                                >
                                    {{ errorTip ? '请输入词条,最多500字符':'（词条用空格分隔，建议单个词不超过5个字）' }}
                                </p>
                            </div>
                            <textarea
                                v-model="userTextContent"
                                :class="{error: errorTip}"
                                type="text"
                                placeholder="在这里输入词条，用空格分隔，想要突出强调的词放在前面，如：易企秀 轻设计 图片制作。为保证效果，建议单个词长度不超过5个字"
                                @input="changeTextValue"
                                @blur="wordlistFinishTyping"
                            />
                        </div>
                    </div>
                    <div class="step-3">
                        <div class="inner">
                            <div class="title">
                                <div
                                    class="pio"
                                />
                                <div>第三步：设置</div>
                            </div>
                            <div class="bg-setting">
                                <div class="tabs">
                                    <p class="title">
                                        背景填充
                                    </p>
                                    <ul class="tab">
                                        <li
                                            :class="[{'tab-selected':!isBgColorCustomized}]"
                                            class="auto"
                                            @click="tabSelect('bg','auto')"
                                        >
                                            自动
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
                                        class="btn clear"
                                        @click="chooseBgColor('transparent')"
                                    >
                                        <i
                                            v-if="userSelectBgColor === 'transparent'"
                                            class="select-flag eqf-yes"
                                        />
                                    </li>
                                    <li
                                        class="btn setting"
                                        @click="showColorPanel($event, 0)"
                                    />
                                    <li
                                        v-for="(item, index) of bgColorList"
                                        :key="index"
                                        class="btn clear"
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
                                <div
                                    class="show-more"
                                    @click="moreSetting()"
                                >
                                    <span>{{ showMoreSetting ? '隐藏':'更多' }}</span>
                                    <div
                                        :style="{transform: `${showMoreSetting ? 'rotate(180deg)' : 'rotate(0deg)'}`}"
                                    >
                                        <i
                                            class="eqf-down"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div
                                v-if="showMoreSetting"
                                class="more-settings"
                            >
                                <div class="top">
                                    <ul class="tp-oper">
                                        <li>
                                            <p class="title">
                                                背景透明度
                                            </p>
                                            <base-input
                                                :model="bgTransObj"
                                                :min="0"
                                                :max="100"
                                                :reverse="true"
                                                model-key="opacity"
                                                unit=""
                                                unit-view="%"
                                                class="base-input"
                                            />
                                        </li>
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
                                                    {{ fontType.name }}
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
                                    <div class="text-rotate">
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
                                    </div>
                                </div>
                                <div class="middle">
                                    <div class="tabs">
                                        <p class="title">
                                            文字配色
                                        </p>
                                        <ul class="tab">
                                            <li
                                                :class="[{'tab-selected':!isTextColorCustomized}]"
                                                class="auto"
                                                @click="tabSelect('text','auto')"
                                            >
                                                自动
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
                                        已选配色
                                    </p>
                                    <ul class="colors">
                                        <li
                                            v-for="(item, index) of userSelectTextColor"
                                            :key="index"
                                            class="btn clear"
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
                        </div>
                    </div>
                </div>
            </div>
            <div class="result">
                <div class="top">
                    <i
                        class="close eqf-no"
                        @click="close"
                    />
                </div>
                <div class="preview">
                    <div class="canvas-container">
                        <canvas
                            id="wcpCanvas"
                            :width="exportCanvasWidth"
                            :height="exportCanvasHeight"
                        />
                    </div>
                    <div class="refresh">
                        <div
                            :class="[{'refresh-loading':isCreating},{'hint--bottom hint--rounded':!isCreating},{'hint--always':isModify && !isCreating}]"
                            :data-hint="isModify ?'配置有改动，请重新生成': '点击刷新预览图'"
                            style="padding: 6px 0"
                        >
                            <i
                                class="run eqf-refresh-cw"
                                @click="refresh"
                            />
                        </div>
                    </div>
                </div>
                <div class="operation">
                    <div
                        class="btn"
                        @click="exportToH5"
                    >
                        导出到图片库
                    </div>
                    <div
                        class="btn"
                        @click="download"
                    >
                        下载到本地
                    </div>
                </div>
                <div
                    class="addToPage"
                    @click="addToPage"
                >
                    添加到画布
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import wordCloudColor from './wordCloudColor'
import delayLoad from '../../utils/delayLoad'
import WordCloud from '../../utils/wordcloud2'
import color from '../../utils/color'
import elementType from '../../config/enum.element.type'
import { host } from '../../config/env'
import imgToBase64 from '../../utils/imgToBase64'
import storageLocal from '../../utils/storageLocal'
import statistic from '../../config/statistic'
import uploadPc from '../pages/create/nav/upload/UploadPc.vue'

import img1 from '../../img/wc/wc_rotate_1.png'
import img2 from '../../img/wc/wc_rotate_2.png'
import img3 from '../../img/wc/wc_rotate_3.png'
import img4 from '../../img/wc/wc_rotate_4.png'
import img5 from '../../img/wc/wc_rotate_5.png'
import img6 from '../../img/wc/wc_rotate_6.png'
import img7 from '../../img/wc/wc_rotate_7.png'
import img8 from '../../img/wc/wc_rotate_8.png'
import img9 from '../../img/wc/wc_rotate_9.png'
import img10 from '../../img/wc/wc_rotate_10.png'

import img1s from '../../img/wc/wc_rotate_1_s.png'
import img2s from '../../img/wc/wc_rotate_2_s.png'
import img3s from '../../img/wc/wc_rotate_3_s.png'
import img4s from '../../img/wc/wc_rotate_4_s.png'
import img5s from '../../img/wc/wc_rotate_5_s.png'
import img6s from '../../img/wc/wc_rotate_6_s.png'
import img7s from '../../img/wc/wc_rotate_7_s.png'
import img8s from '../../img/wc/wc_rotate_8_s.png'
import img9s from '../../img/wc/wc_rotate_9_s.png'
import img10s from '../../img/wc/wc_rotate_10_s.png'

import tipIcon from '../../img/word_cloud_tip.png'

export default {
    components: {
        uploadPc
    },
    props: {

    },
    data() {
        return {
            tipIcon,
            timerId: null, // 展开动画
            showMoreSetting: false,
            customColor: { // 色盘model
                color: ''
            },
            isReady: false,
            selectFont: false,
            fontType: null, // 选择的字体
            fontTypeList: [],
            selectGridSize: false,
            gridType: { name: '正常', size: 4 }, // 选择的紧密度
            gridTypeList: [{ name: '极度松散', size: 8 }, { name: '松散', size: 6 }, { name: '正常', size: 4 }, { name: '紧密', size: 2 }, { name: '极度紧密', size: 1 }],
            rotateRatio: {
                list: [{ name: '是', type: true }, { name: '否', type: false }],
                selectedItem: null
            },
            rotateRatioValue: true,
            fontSizeObj: { size: 200 }, // 最大字号
            colorList: wordCloudColor, // 文字推荐配色
            bgColorList: ['rgba(0, 0, 0, 1)', 'rgba(255, 255, 255, 1)', 'rgba(21, 147, 255, 1)', 'rgba(255, 41, 106, 1)',
                'rgba(252, 152, 3, 1)', 'rgba(255, 84, 72, 1)', 'rgba(80, 227, 194, 1)', 'rgba(189, 16, 224, 1)', 'rgba(184, 233, 134, 1)', 'rgba(248, 231, 28, 1)'], // 背景推荐配色
            userSelectBgColor: 'rgba(0, 0, 0, 1)', // 用户选择的背景色
            userSelectTextColor: JSON.parse(JSON.stringify(wordCloudColor[0].color)), // 用户选择的文字色
            curColorSetting: 0, // 当前设置的颜色项 0:背景色 1:文字配色
            isCreating: false, // 是否正在生成中
            userTextContent: '易企秀 轻设计 作图 神器', // 用户输入文字内容
            errorTip: false, // 文字框错误提示
            shapeData: [], // 所有分类下的形状数据
            shapeList: [], // 当前分类下的形状数据
            selectShapeItem: null,
            maskCanvas: null, // 形状蒙版canvas
            wordWeight: [11, 9, 6, 6, 5, 4, 3, 3], // 权重量级
            bgTransparent: false, // 形状背景是否透明
            words: [], // 词汇
            exportCanvasWidth: 640,
            exportCanvasHeight: 640,
            userOptHistory: null, // 用户最后一次操作记录
            lastSelectShapeItem: null,
            bannerList: [], // 形状分类
            customShape: '', // 自定义上传形状
            showUploadBtn: false,
            uploadBtnName: '上传本地图片',
            btnBeforeCss: {
                width: '200px', height: '48px', fontSize: '17px', marginTop: '12px'
            },
            btnAfterCss: {
                width: '96px', height: '36px', fontSize: '14px'
            },
            customShapeSelected: false,
            selectBannerItem: null,
            newKey: storageLocal.key.newCustomShape,
            isBgColorCustomized: false,
            isTextColorCustomized: false,
            bgTransObj: { opacity: 0.1 },
            degree: [{ rotateRatio: 0.5, minRotation: -Math.PI / 2, maxRotation: Math.PI / 2, rotationSteps: 0, cover: img1, scover: img1s },
                { rotateRatio: 1, minRotation: Math.PI * 3 / 2, maxRotation: Math.PI * 3 / 2, rotationSteps: 0, cover: img3, scover: img3s },
                { rotateRatio: 0.5, minRotation: Math.PI * 3 / 2, maxRotation: Math.PI * 3 / 2, rotationSteps: 0, cover: img4, scover: img4s },
                { rotateRatio: 0, minRotation: -Math.PI / 2, maxRotation: Math.PI / 2, rotationSteps: 0, cover: img2, scover: img2s },
                { rotateRatio: 1, minRotation: Math.PI / 4, maxRotation: Math.PI * 7 / 4, rotationSteps: 2, cover: img5, scover: img5s },
                { rotateRatio: 1, minRotation: Math.PI * 7 / 4, maxRotation: Math.PI * 7 / 4, rotationSteps: 0, cover: img6, scover: img6s },
                { rotateRatio: 0.5, minRotation: Math.PI * 1 / 4, maxRotation: Math.PI * 1 / 4, rotationSteps: 2, cover: img7, scover: img7s },
                { rotateRatio: 1, minRotation: Math.PI / 4, maxRotation: Math.PI / 4, rotationSteps: 0, cover: img8, scover: img8s },
                { rotateRatio: 1, minRotation: Math.PI / 4, maxRotation: Math.PI * 7 / 4, rotationSteps: 2, cover: img9, scover: img9s },
                { rotateRatio: 0.5, minRotation: -Math.PI / 4, maxRotation: Math.PI * 3 / 2, rotationSteps: 2, cover: img10, scover: img10s }],
            maxMaskCanvas: { width: 100, height: 100 },
            maskCanvasList: [], // 形状蒙版list
            drawShapeNum: 0, // 已绘制的蒙版计数
            selectedDegreeItem: { rotateRatio: 0.5, minRotation: -Math.PI / 2, maxRotation: Math.PI / 2, rotationSteps: 0, cover: img1, scover: img1s },
            isModify: false // 是否有改变设置
        }
    },
    computed: {
        thumbSize() {
            return 56
        },
        eqxPage() {
            return Vue.store.state.scene.eqxPage
        },
        sceneJson() {
            return Vue.store.state.scene.eqxScene.sceneJson
        },
        scale() {
            return this.eqxPage.scale
        },
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        uploadOptions() {
            return {
                type: 'shape',
                onComplete: this.onComplete
            }
        },
        btnCss() {
            if (this.customShape && this.showUploadBtn) {
                return this.btnAfterCss
            } else {
                return this.btnBeforeCss
            }
        }
    },
    watch: {
        'customColor.color': function (color) {
            if (this.customColor.color !== '') {
                if (this.curColorSetting === 0) {
                    // 把用户选的颜色透明度设置到背景透明度
                    if (color.indexOf('#') > -1) {
                        const rgba = color.hex2rgba(color)
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
                    this.isModify = true
                }
            }
        },
        'bgTransObj.opacity': {
            handler(newVal, oldVal) {
                if (newVal !== oldVal) {
                    this.isModify = true
                }
            }
        }
    },
    created() {
        const loadSwipercss = delayLoad.delayLoadCSS(Vue.env.plugin.swipercss)
        const loadSwiperjs = delayLoad.delayLoadJS(Vue.env.plugin.swiperjs)
        const loadJquery = delayLoad.delayLoadJS(this.env.plugin.jquery)
        Promise.all([loadSwipercss, loadSwiperjs, loadJquery]).then(() => {
            this.isReady = true
            this.fontRequest()
        }).catch(err => err && this.logger.error(err))
    },
    methods: {
        close() {
            // 保存设置信息
            this.optionHistorySet()
            const wordCloudPalette = this.$el
            document.body.removeChild(wordCloudPalette)
            this.$destroy()
        },
        setBannerData() {
            this.$nextTick(function () {
                // eslint-disable-next-line
                const swiper = new Swiper('.swiper-container', {
                    slidesPerView: 'auto',
                    spaceBetween: 32,
                    watchOverflow: true,
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev'
                    }
                })
            })
            const shapeReqs = []
            for (const item of this.bannerList) {
                const category = item.id
                let size = 30
                if (category > 0) {
                    if (category === Vue.env.mall.wordCloudId) {
                        size = 100
                    }
                    shapeReqs.push(this.shapeRequest(category, size))
                }
            }
            Vue.loading.open('形状加载中')
            Promise.all(shapeReqs).then((res) => {
                Vue.loading.close()
                this.shapeData = res
                this.initWordCloud()
            }).catch(err => {
                err && Vue.logger.error(err)
                Vue.loading.close()
            })
        },
        // 字云形状分类请求
        bannerRequest() {
            Vue.loading.open('分类加载中')
            Vue.api.product.getCategoryListByFatherId(Vue.env.mall.wordCloudId)
                .then(res => {
                    Vue.loading.close()
                    if (res.data) {
                        const list = res.data.list
                        if (list && list.length > 0) {
                            const resList = list.filter((v, i) => v.name !== '推荐')
                            const spe = list.filter((v, i) => v.name === '推荐')
                            this.selectBannerItem = spe ? spe[0] : resList[0] // 默认选择推荐分类,若没有推荐则选择第一个分类
                            this.bannerList = this.bannerList.concat({ name: '自定义', id: -1 }, spe[0], { name: '全部', id: Vue.env.mall.wordCloudId }, resList)
                        }
                        this.setBannerData()
                    }
                })
                .catch(err => {
                    err && Vue.logger.error(err)
                    Vue.loading.close()
                })
        },
        // 字云形状素材数据请求
        shapeRequest(category, pageSize) {
            return new Promise((resolve, reject) => {
                Vue.api.product.getNewProducts({ apiCode: Vue.env.mall.apiCode[0], categoryId: category, pageSize, pageNo: 1 })
                    .then(res => {
                        if (res.data.list) {
                            resolve({ category, list: res.data.list })
                        } else {
                            resolve({ category, list: [] })
                        }
                    })
                    .catch(err => {
                        err && Vue.logger.error(err)
                        reject()
                    })
            })
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

                    // 请求形状分类
                    this.bannerRequest()
                })
                .catch(err => {
                    err && Vue.logger.error(err)
                    Vue.loading.close()
                    // 请求形状分类
                    this.bannerRequest()
                })
        },
        getQiniuImage(src) {
            return Vue.filter('qiniuZoom')(src, this.thumbSize)
        },
        getBackgroundImage(src) {
            return Vue.filter('backgroundImage')(src)
        },
        initWordCloud() {
            const $canvas = document.getElementById('wcpCanvas')
            $canvas.addEventListener('wordcloudstop', () => {
                // console.log('wordcloudstop', this.drawShapeNum)
                this.drawShapeNum++
                if (this.drawShapeNum < this.maskCanvasList.length) {
                    this.run(this.maskCanvasList[this.drawShapeNum])
                } else {
                    this.drawShapeNum = 0
                    this.isCreating = false
                    Vue.loading.close()
                }
            })
            $canvas.addEventListener('wordcloudstart', () => {
                // console.log('wordcloudstart')
            })
            this.runWithDefaultOption()
        },
        exportCanvas(reRender = false) {
            return new Promise((resolve, reject) => {
                if (reRender) {
                    const $expCanvs = document.createElement('canvas')
                    $expCanvs.width = this.exportCanvasWidth
                    $expCanvs.height = this.exportCanvasHeight
                    $expCanvs.addEventListener('wordcloudstop', () => {
                        resolve($expCanvs)
                    })
                    const ctx = $expCanvs.getContext('2d')
                    ctx.clearRect(0, 0, this.exportCanvasWidth, this.exportCanvasHeight)
                    const ops = this.createOptionSet(true, $expCanvs)
                    WordCloud($expCanvs, ops)
                } else {
                    const $canvas = document.getElementById('wcpCanvas')
                    resolve($canvas)
                }
            })
        },
        runWithDefaultOption() {
            if (!this.optionHistoryCheck()) {
                // 设置默认词组
                if (this.words.length === 0) {
                    this.wordlistFinishTyping()
                }
                // 默认选择推荐分类的第一个形状
                const list = this.shapeData.filter(v => v.category === this.selectBannerItem.id)
                this.shapeList = list && list[0].list
                this.shapeSelected(this.shapeList[0])
            }
        },
        run(info) {
            if (!this.createCheck()) {
                this.errorTip = true
                return
            }
            if (this.drawShapeNum === 0) {
                Vue.loading.open('字云生成中')
            }
            this.isModify = false
            this.isCreating = true
            const ops = this.createOptionSet(false, null, info)
            const $canvas = document.getElementById('wcpCanvas')
            WordCloud($canvas, ops)
        },
        // 选择字体
        chooseFontType(item) {
            this.fontType = item
            this.selectFont = false // 选择后关掉下拉框
            this.downloadWebFont(item.fontFamilyReal, item.src)
            this.isModify = true
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
            }
        },
        // 选择紧密度
        chooseGridType(item) {
            this.gridType = item
            this.selectGridSize = false // 选择后关掉下拉框
            this.isModify = true
        },
        // 选择是否要旋转文字
        chooseRotateRadio(item) {
            this.rotateRatioValue = item.type
            this.rotateRatio.selectedItem = item
        },
        // 选择背景色
        chooseBgColor(color) {
            this.userSelectBgColor = color
            this.isModify = true
        },
        // 打开色盘
        showColorPanel(e, index) {
            document.addEventListener('mousedown', this.hideColorPanel)
            this.curColorSetting = index
            if (index === 1) {
                this.userSelectTextColor.push('#000000')
                this.isModify = true
            }
            let top = e.pageY - 410
            const left = e.pageX
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
            this.isModify = true
        },
        // 选取推荐配色条
        selectRecommendColor(colors) {
            this.userSelectTextColor.splice(0)
            this.userSelectTextColor = this.userSelectTextColor.concat(colors)
            this.isModify = true
        },
        // 滚动到底部
        toBottom() {
            const $settingBox = this.$refs.settingBox
            const clientHeight = $settingBox.clientHeight
            const maxHeight = $settingBox.scrollHeight - clientHeight
            $settingBox.scrollTop += 50
            if ($settingBox.scrollTop < maxHeight) {
                this.timerId = setTimeout(() => this.toBottom(), 30)
            } else {
                clearTimeout(this.timerId)
            }
        },
        // 更多设置
        moreSetting() {
            this.showMoreSetting = !this.showMoreSetting
            setTimeout(() => {
                this.toBottom()
            }, 200)
        },
        // 导出到H5素材
        exportToH5() {
            if (this.userInfo.id) {
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.WC,
                    statistic.opt_label.WC.h5])

                Vue.loading.open('导出中')
                this.exportCanvas().then(cvs => {
                    this.uploadImg(cvs).then(res => {
                        const urlArr = [{
                            extName: 'png',
                            path: res,
                            name: res,
                            tmbPath: res
                        }]
                        Vue.api.file.saveToH5(Vue.env.h5TagId, urlArr, this.sceneJson.id)
                            .then((res) => {
                                Vue.loading.close()
                                Vue.notifier.info('导出成功，刷新H5素材库可查看')
                            })
                            .catch(err => {
                                err && this.logger.error(err)
                                Vue.loading.close()
                                Vue.notifier.fail('服务器异常，请稍后重试')
                            })
                    }).catch(err => {
                        err && Vue.logger.error(err)
                        Vue.loading.close()
                        Vue.notifier.fail('服务器异常，请稍后重试')
                    })
                })
            } else {
                Vue.notifier.info('导出到H5功能需登录后才能使用')
            }
        },
        // 下载到本地
        download() {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.WC,
                statistic.opt_label.WC.exp])

            Vue.loading.open('下载中，请等候')
            this.exportCanvas().then(cvs => {
                const url = cvs.toDataURL()
                const a = document.createElement('a')
                const dateStr = new Date().format('yyyyMMddhhmmss')
                a.download = `轻设计_文字云_${dateStr}`
                a.href = url
                a.click()
                Vue.loading.close()
            })
        },
        // 上传到七牛
        uploadImg(cvs) {
            return new Promise((resolve, reject) => {
                const img = cvs.toDataURL()
                Vue.api.file.getUploadToken().then(token => {
                    Vue.api.file.uploadBase64(img.split(',')[1], token)
                        .then(res => {
                            resolve(res.data.key)
                        }).catch(err => {
                            err && Vue.logger.error(err)
                            reject(err)
                        })
                }).catch(err => {
                    err && Vue.logger.error(err)
                    reject(err)
                })
            })
        },
        // 绘制图片组件到画布
        addElement(src) {
            const result = this.eqxPage.getElementPosOfCenter(this.exportCanvasWidth, this.exportCanvasHeight, this.scale)
            const left = result.left
            const top = result.top
            const elementJson = {
                type: elementType.image,
                property: {
                    src,
                    dropShadow: {
                        color: 'rgba(0,0,0,0)',
                        x: 0,
                        y: 0,
                        blur: 0,
                        transparency: 100
                    },
                    borderRadius: {
                        lt: true,
                        rt: true,
                        lb: true,
                        rb: true,
                        val: 0
                    },
                    wordcloud: true // 字云生成的图片带有此标识符，Max审核时需要
                },
                css: {
                    left: Math.round(left) + 'px',
                    top: Math.round(top) + 'px',
                    width: Math.round(this.exportCanvasWidth) + 'px',
                    height: Math.round(this.exportCanvasWidth) + 'px',
                    border: '1px solid transparent'
                }
            }

            this.eqxPage.addElement(elementJson)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        // 添加到画布
        addToPage() {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.WC,
                statistic.opt_label.WC.draw])

            Vue.loading.open('正在添加')
            this.exportCanvas().then(cvs => {
                this.uploadImg(cvs).then(res => {
                    Vue.loading.close()
                    this.addElement(res)
                    // this.close()
                    Vue.notifier.success('添加成功')
                }).catch(err => {
                    err && Vue.logger.error(err)
                    Vue.loading.close()
                    Vue.notifier.fail('服务器异常，请稍后重试')
                })
            })
        },
        // 文字输入框监听
        changeTextValue() {
            try {
                this.errorTip = false
                if (this.userTextContent && this.userTextContent.length > 500) {
                    this.userTextContent = this.userTextContent.substr(0, 500)
                }
            } catch (error) {
                console.log(error)
            }
        },
        // 文字输入完毕监听
        wordlistFinishTyping() {
            const list = this.userTextContent.split(' ').filter((v) => v.length > 0)
            this.words = list
            this.isModify = true
        },
        // 清理canvas
        clearCanvas() {
            const $canvas = document.getElementById('wcpCanvas')
            var ctx = $canvas.getContext('2d')
            ctx.clearRect(0, 0, $canvas.width, $canvas.height)
        },
        // 选择形状
        shapeSelected(item) {
            if (item && this.lastSelectShapeItem !== item) {
                this.clearCanvas()
                this.selectShapeItem = item
                const url = Vue.env.host.file + item.productTypeMap.path
                this.buildWordCloud(url)
                this.lastSelectShapeItem = item
            }
        },
        // 生成字云
        buildWordCloud(url) {
            imgToBase64(url).then(res => {
                this.getShapeImgWithDiffColors(url)
                    .then((res) => {
                        this.setShapes(res)
                            .then(res => {
                                this.maskCanvasList = res
                                this.run(this.maskCanvasList[0])
                            })
                    })
            })
        },
        // 获取形状区分不同色块
        getShapeImgWithDiffColors(url) {
            return new Promise((resolve, reject) => {
                let pixelNum = 0
                const img = new Image()
                img.crossOrigin = 'anonymous'
                img.onload = () => {
                    const { targetWidth, targetHeight } = this.fixSize(this.maxMaskCanvas.width, this.maxMaskCanvas.height, img.width, img.height)
                    var temp = document.createElement('canvas')
                    temp.width = this.maxMaskCanvas.width
                    temp.height = this.maxMaskCanvas.height

                    const ctx = temp.getContext('2d')
                    ctx.drawImage(img, (temp.width - targetWidth) / 2, (temp.height - targetHeight) / 2, targetWidth, targetHeight)
                    const imageData = ctx.getImageData(0, 0, temp.width, temp.height)
                    pixelNum = imageData.data.length / 4
                    const shapes = {}
                    for (var i = 0; i < imageData.data.length; i += 4) {
                        var alpha = imageData.data[i + 3]
                        if (alpha > 69) {
                            var key = `${imageData.data[i]}rgba${imageData.data[i + 1]}rgba${imageData.data[i + 2]}rgba${imageData.data[i + 3]}`
                            if (!shapes[key]) {
                                shapes[key] = []
                            }
                            shapes[key].push(i)
                        }
                    }
                    for (const key in shapes) {
                        if (shapes[key].length < pixelNum * 0.02) { delete shapes[key] }
                    }
                    resolve(shapes)
                }
                img.src = url
            })
        },
        // 设置形状
        setShapes(shapes) {
            return new Promise((resolve, reject) => {
                const getShapeCanvas = (color, data) => {
                    const rgba = color.split('rgba')
                    const r = Number(rgba[0])
                    const g = Number(rgba[1])
                    const b = Number(rgba[2])
                    const a = Number(rgba[3])
                    const bgColor = `rgba(${r},${g},${b},0.1)`
                    const textColor = `rgba(${r},${g},${b},1)`
                    return new Promise((resolve, reject) => {
                        const mCanvas = document.createElement('canvas')
                        mCanvas.width = this.maxMaskCanvas.width
                        mCanvas.height = this.maxMaskCanvas.height

                        var ctx = mCanvas.getContext('2d')
                        ctx.fillStyle = 'red'
                        ctx.fillRect(0, 0, mCanvas.width, mCanvas.height)
                        const imageData = ctx.getImageData(0, 0, mCanvas.width, mCanvas.height)
                        const newImageData = ctx.createImageData(imageData)

                        for (var i = 0; i < imageData.data.length; i += 4) {
                            if (data.indexOf(i) === -1) {
                                // Area not to draw
                                newImageData.data[i] =
                                        newImageData.data[i + 1] =
                                        newImageData.data[i + 2] = 255
                                newImageData.data[i + 3] = 0
                            } else {
                                // Area to draw
                                newImageData.data[i] = r
                                newImageData.data[i + 1] = g
                                newImageData.data[i + 2] = b
                                newImageData.data[i + 3] = a
                            }
                        }

                        ctx.putImageData(newImageData, 0, 0)
                        resolve({ mCanvas, bgColor, textColor })
                    })
                }
                const shapeReqs = []
                for (const key in shapes) {
                    const data = shapes[key]
                    const color = key
                    shapeReqs.push(getShapeCanvas(color, data))
                }
                Promise.all(shapeReqs).then((res) => {
                    resolve(res)
                }).catch((error) => { reject(error) })
            })
        },
        // 获取形状
        getShapeImgOnMaskCanvas(url) {
            return new Promise((resolve, reject) => {
                var img = new Image()
                img.crossOrigin = 'anonymous'
                img.src = url
                img.onload = () => {
                    this.maskCanvas = document.createElement('canvas')
                    this.maskCanvas.width = img.width
                    this.maskCanvas.height = img.height

                    const ctx = this.maskCanvas.getContext('2d')
                    ctx.drawImage(img, 0, 0, img.width, img.height)

                    const imageData = ctx.getImageData(0, 0, this.maskCanvas.width, this.maskCanvas.height)
                    const newImageData = ctx.createImageData(imageData)

                    for (var i = 0; i < imageData.data.length; i += 4) {
                        var alpha = imageData.data[i + 3]
                        if (alpha < 3) {
                            // Area not to draw
                            newImageData.data[i] =
                                    newImageData.data[i + 1] =
                                    newImageData.data[i + 2] = 255
                            newImageData.data[i + 3] = 0
                        } else {
                            // Area to draw
                            newImageData.data[i] =
                                    newImageData.data[i + 1] =
                                    newImageData.data[i + 2] = 0
                            newImageData.data[i + 3] = 255
                        }
                    }

                    ctx.putImageData(newImageData, 0, 0)
                    resolve()
                }
            })
        },
        // 词组预处理
        wordListPreprocess() {
            let prelist = JSON.parse(JSON.stringify(this.words))
            const res = []
            prelist.map((v, i, a) => {
                if (v.length > 10) {
                    const len = v.length
                    const count = (len % 3 !== 0) ? parseInt(len / 3) + 1 : parseInt(len / 3)
                    for (let i = 0; i < count; i++) {
                        res.push(v.substr(i * 3, 3))
                    }
                } else {
                    res.push(v)
                }
            })
            prelist = null
            return res
        },
        // 设置词组
        setWordListOption() {
            this.words = this.wordListPreprocess()
            const wordList = []
            const nums = this.wordWeight.slice(1)
            const levelCount = 50
            const wordCount = this.words.length
            if (wordCount < levelCount) {
                const minCount = levelCount - wordCount
                if (minCount < wordCount) {
                    this.words = this.words.concat(this.words.slice(0, minCount + 1))
                } else {
                    const dif = parseInt(minCount / wordCount)
                    const rem = parseInt(minCount % wordCount)
                    const tmp = [...this.words]
                    for (let i = 0; i < dif; i++) {
                        this.words = this.words.concat(tmp)
                    }
                    if (rem > 0) {
                        this.words = this.words.concat(tmp.slice(0, rem + 1))
                    }
                }
                nums.forEach((n, i) => {
                    const tmp = this.words.slice(0, levelCount / nums.length * (i + 1))
                    tmp.forEach((w) => {
                        wordList.push([w, n])
                    })
                })
            } else {
                let copyWords = [...this.words]
                nums.forEach((n, i) => {
                    const tmpCount = parseInt(levelCount / nums.length * (i + 1))
                    if (copyWords.length < tmpCount) {
                        copyWords = copyWords.concat(copyWords, this.words.slice(0, tmpCount - copyWords.length))
                    }
                    const tmp = copyWords.splice(0, tmpCount)
                    tmp.forEach((w) => {
                        wordList.push([w, n])
                    })
                })
            }

            wordList.unshift([this.words[0], this.wordWeight[0]])
            return wordList
        },
        // 设置文字颜色
        setTextColorOption() {
            const count = this.userSelectTextColor.length
            let colors = this.userSelectTextColor
            const weightCount = this.wordWeight.length
            let random = true
            if (count < weightCount) { // 颜色数量小于权重等级则补全，每个权重一种颜色
                const minCount = weightCount - count
                const dif = parseInt(minCount / count)
                const rem = parseInt(minCount % count)
                const tmp = [...colors]
                for (let i = 0; i < dif; i++) {
                    colors = colors.concat(tmp)
                }
                if (rem > 0) {
                    colors = colors.concat(tmp.slice(0, rem + 1))
                }
            } else if (count > weightCount) { // 颜色数量大于权重等级则每个词随机选择一种颜色
                random = true
            }
            let colorObj = {}
            if (!random) {
                this.wordWeight.map((v, i) => {
                    colorObj = Object.assign(colorObj, { [v]: colors[i] })
                })
            }

            return (word, weight, fontSize, distance, theta) => {
                if (random) {
                    const index = this.getRandomIntInclusive(0, count - 1)
                    return colors[index]
                } else {
                    return colorObj[weight]
                }
            }
        },
        getRandomIntInclusive(min, max) {
            min = Math.ceil(min)
            max = Math.floor(max)
            return Math.floor(Math.random() * (max - min + 1)) + min
        },
        fixSize(maxWidth, maxHeight, imgWidth, imgHeight) {
            const originWidth = imgWidth
            const originHeight = imgHeight
            let targetWidth = originWidth
            let targetHeight = originHeight
            // 尺寸超过限制
            if (originWidth > maxWidth || originHeight > maxHeight) {
                if (originWidth / originHeight > maxWidth / maxHeight) {
                    targetWidth = maxWidth
                    targetHeight = Math.floor(maxWidth * (originHeight / originWidth))
                } else {
                    targetHeight = maxHeight
                    targetWidth = Math.floor(maxHeight * (originWidth / originHeight))
                }
            } else { // 上传形状图片小于目标尺寸，则按长边放大到目标尺寸
                if (originWidth > originHeight) {
                    targetWidth = maxWidth
                    targetHeight = Math.floor(maxWidth * (originHeight / originWidth))
                } else {
                    targetHeight = maxHeight
                    targetWidth = Math.floor(maxHeight * (originWidth / originHeight))
                }
            }

            return { targetWidth, targetHeight }
        },
        // 设置形状mask
        setShapeMask(options, tmpWidth, tmpHeight, canvas, mask) {
            if (options) {
                const $canvas = canvas || document.getElementById('wcpCanvas')
                let bctx = document.createElement('canvas').getContext('2d')
                bctx.fillStyle = options.backgroundColor || '#fff'
                bctx.fillRect(0, 0, 1, 1)
                let bgPixel = bctx.getImageData(0, 0, 1, 1).data
                let maskCanvasScaled = document.createElement('canvas')
                maskCanvasScaled.width = $canvas.width
                maskCanvasScaled.height = $canvas.height

                let ctx = maskCanvasScaled.getContext('2d')
                // 把shape canvas 缩放成 main canvas 大小
                ctx.drawImage(mask, 0, 0, mask.width, mask.height, 0, 0, maskCanvasScaled.width, maskCanvasScaled.height)
                // let {targetWidth, targetHeight} = this.fixSize(maskCanvasScaled.width, maskCanvasScaled.height, this.maskCanvas.width, this.maskCanvas.height)
                // ctx.drawImage(this.maskCanvas, 0, 0, this.maskCanvas.width, this.maskCanvas.height,
                //     (maskCanvasScaled.width - targetWidth) / 2, (maskCanvasScaled.height - targetHeight) / 2, targetWidth, targetHeight)
                // 复制像素值
                let imageData = ctx.getImageData(0, 0, $canvas.width, $canvas.height)
                // 创建一个新的imageData，宽高与canvas一致，里面的像素为透明
                let newImageData = ctx.createImageData(imageData)
                for (let i = 0; i < imageData.data.length; i += 4) {
                    if (imageData.data[i + 3] > 128) {
                        // shape区域
                        newImageData.data[i] = bgPixel[0]
                        newImageData.data[i + 1] = bgPixel[1]
                        newImageData.data[i + 2] = bgPixel[2]
                        newImageData.data[i + 3] = bgPixel[3]// 0:透明~ 255：不透明
                    } else {
                        // shape 之外区域
                        newImageData.data[i] = bgPixel[0]
                        newImageData.data[i + 1] = bgPixel[1]
                        newImageData.data[i + 2] = bgPixel[2]
                        newImageData.data[i + 3] = this.bgTransparent ? (bgPixel[3] - 1) : 0
                    }
                }
                ctx.putImageData(newImageData, 0, 0)
                ctx = $canvas.getContext('2d')
                ctx.drawImage(maskCanvasScaled, 0, 0)
                maskCanvasScaled = ctx = imageData = newImageData = bctx = bgPixel = undefined
            }
        },
        createCheck() {
            return this.words.length > 0 && this.words.length <= 250
        },
        createOptionSet(exp = false, canvas, info) {
            const $canvas = document.getElementById('wcpCanvas')
            const options = { ellipticity: 1 }
            const tmpWidth = exp ? this.exportCanvasWidth : $canvas.width
            const tmpHeight = exp ? this.exportCanvasHeight : $canvas.height

            // background color set and transparent set
            if (this.isBgColorCustomized && this.userSelectBgColor === 'transparent') {
                this.bgTransparent = true
                options.backgroundColor = 'rgba(255,255,255,0.01)'
            } else {
                this.bgTransparent = false
                let mixBgColor = this.isBgColorCustomized ? this.userSelectBgColor : info.bgColor
                if (mixBgColor.indexOf('#') > -1) {
                    const rgba = color.hex2rgba(mixBgColor)
                    mixBgColor = `rgba(${rgba.r},${rgba.g},${rgba.b},${this.bgTransObj.opacity})`
                } else {
                    const rgba = mixBgColor.match(/(\d(\.\d+)?)+/g)
                    mixBgColor = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${this.bgTransObj.opacity})`
                }
                options.backgroundColor = mixBgColor
            }

            // font style set
            options.fontFamily = this.fontType && this.fontType.fontFamilyReal ? this.fontType.fontFamilyReal : 'Times, serif'

            // max fontsize set
            const maxFontSize = parseInt(this.fontSizeObj.size)
            options.weightFactor = (size) => {
                let res = (Math.pow(size, 2.6) * tmpWidth / 1024)
                if (maxFontSize > 0 && res > maxFontSize) {
                    res = maxFontSize
                }
                return res
            }

            // gridSize set
            const gridSize = this.gridType.size || Math.round(16 * tmpWidth / 1024)
            options.gridSize = gridSize

            if (this.selectedDegreeItem) {
                options.rotateRatio = this.selectedDegreeItem.rotateRatio
                options.minRotation = this.selectedDegreeItem.minRotation
                options.maxRotation = this.selectedDegreeItem.maxRotation
                options.rotationSteps = this.selectedDegreeItem.rotationSteps
            } else {
                options.rotateRatio = 0.5
            }

            // text color set
            options.color = this.isTextColorCustomized ? this.setTextColorOption() : info.textColor

            // word list set
            options.list = this.setWordListOption()

            // shape set
            // if (this.maskCanvas) {
            //     options.clearCanvas = false
            //     this.setShapeMask(options, tmpWidth, tmpHeight, canvas)
            // }
            if (info.mCanvas) {
                options.clearCanvas = false
                this.setShapeMask(options, tmpWidth, tmpHeight, canvas, info.mCanvas)
            }

            return options
        },
        optionHistorySet() {
            this.userOptHistory = {
                shape: this.selectShapeItem,
                textContent: this.userTextContent,
                bgColor: this.userSelectBgColor,
                font: this.fontType,
                maxFontSize: this.fontSizeObj,
                grid: this.gridType,
                rotateRatioItem: this.rotateRatio.selectedItem,
                textColors: this.userSelectTextColor,
                customShape: this.customShape,
                customShapeSelected: this.customShapeSelected,
                banner: this.selectBannerItem,
                isBgColorCustomized: this.isBgColorCustomized,
                isTextColorCustomized: this.isTextColorCustomized,
                bgTransObj: this.bgTransObj,
                selectedDegreeItem: this.selectedDegreeItem
            }
            const key = storageLocal.key.wordCloudOpt
            storageLocal.setItem(key, JSON.stringify(this.userOptHistory))
        },
        optionHistoryCheck() {
            const key = storageLocal.key.wordCloudOpt
            const res = storageLocal.getItem(key)
            if (res) {
                const his = JSON.parse(res)
                if (his.isBgColorCustomized) {
                    this.isBgColorCustomized = his.isBgColorCustomized
                }
                if (his.isTextColorCustomized) {
                    this.isTextColorCustomized = his.isTextColorCustomized
                }
                if (his.bgTransObj) {
                    this.bgTransObj = his.bgTransObj
                }
                if (his.selectedDegreeItem) {
                    this.selectedDegreeItem = his.selectedDegreeItem
                }
                if (his.bgColor) {
                    if (['transparent', ...this.bgColorList].indexOf(his.bgColor) === -1) {
                        this.bgColorList.push(his.bgColor)
                    }
                    this.userSelectBgColor = his.bgColor
                }
                if (his.maxFontSize) {
                    this.fontSizeObj = his.maxFontSize
                }
                if (his.grid) {
                    this.gridType = his.grid
                }
                if (his.rotateRatioItem) {
                    this.rotateRatioValue = his.rotateRatioItem.type
                    this.rotateRatio.selectedItem = his.rotateRatioItem
                }
                if (his.textColors) {
                    this.userSelectTextColor = his.textColors
                }
                if (his.font) {
                    const res = this.fontTypeList.filter(v => v.fontFamily === his.font.fontFamily)
                    if (res && res[0]) {
                        this.chooseFontType(res[0])
                    }
                }
                if (his.textContent) {
                    this.userTextContent = his.textContent
                    this.wordlistFinishTyping()
                }
                if (his.customShape !== '') {
                    this.customShape = his.customShape
                    this.showUploadBtn = false
                    this.uploadBtnName = '重新上传'
                }

                if (his.banner) {
                    this.selectBannerItem = his.banner
                    if (his.banner.name !== '自定义') {
                        this.selectBanner(his.banner)
                    }
                } else {
                    this.selectBanner(this.selectBannerItem)
                }
                if (his.customShapeSelected) { // 自定义上传
                    this.customShapeSelected = his.customShapeSelected
                    this.customShape = his.customShape
                    if (his.customShape !== '') {
                        this.buildWordCloud(Vue.env.host.file + his.customShape)
                    }
                } else {
                    if (his.shape) {
                        const path = his.shape.productTypeMap ? his.shape.productTypeMap.path : his.shape.path
                        const res = this.shapeList.filter(v => v.productTypeMap.path === path)
                        if (res && res[0]) {
                            this.shapeSelected(res[0])
                        } else {
                            this.shapeSelected(this.shapeList[0])
                        }
                    } else {
                        // 默认选择第一个形状
                        this.shapeSelected(this.shapeList[0])
                    }
                }
                return true
            } else {
                return false
            }
        },
        // 自定义形状上传完成
        onComplete(tagIdAll, data) {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.WC,
                statistic.opt_label.WC.custom])
            setTimeout(() => {
                const { key } = data
                const url = Vue.env.host.file + key
                this.checkShape(url).then(res => {
                    if (!res) {
                        Vue.notifier.info('非透明背景图片，只能生成【矩形】文字云')
                    }
                    this.customShape = key
                    this.customShapeSelected = true
                    this.showUploadBtn = false
                    this.uploadBtnName = '重新上传'
                    this.buildShape()
                }).catch(err => {
                    err && Vue.logger.error(err)
                })
            }, 300)
        },
        checkShape(url) {
            return new Promise((resolve, reject) => {
                var img = new Image()
                img.crossOrigin = 'anonymous'
                img.src = url
                img.onload = () => {
                    const tmpCanvas = document.createElement('canvas')
                    tmpCanvas.width = img.width
                    tmpCanvas.height = img.height
                    const ctx = tmpCanvas.getContext('2d')
                    ctx.drawImage(img, 0, 0, img.width, img.height)
                    const imageData = ctx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height)
                    let transparentCount = 0
                    for (var i = 0; i < imageData.data.length; i += 4) {
                        var alpha = imageData.data[i + 3]

                        if (alpha < 3) {
                            transparentCount++
                        }
                    }
                    const ratio = parseInt(imageData.data.length / 4 * 0.1)
                    if (transparentCount > ratio) {
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                }
            })
        },
        buildShape() {
            if (this.words.length === 0) {
                this.wordlistFinishTyping()
            }
            const url = Vue.env.host.file + this.customShape
            this.buildWordCloud(url)
        },
        selectBanner(item) {
            this.selectBannerItem = item
            if (item.name === '自定义') {
                this.customShapeSelected = true
                if (this.customShape !== '') {
                    this.buildShape()
                }
            } else {
                this.customShapeSelected = false
                const list = this.shapeData.filter(v => v.category === this.selectBannerItem.id)
                this.shapeList = list[0].list
            }
        },
        tabSelect(tab, type) {
            this.isModify = true
            if (tab === 'bg') {
                if (type === 'auto') {
                    this.isBgColorCustomized = false
                } else {
                    this.isBgColorCustomized = true
                    this.showMoreSetting = true
                    setTimeout(() => {
                        this.toBottom()
                    }, 200)
                }
            } else if (tab === 'text') {
                if (type === 'auto') {
                    this.isTextColorCustomized = false
                } else {
                    this.isTextColorCustomized = true
                    setTimeout(() => {
                        this.toBottom()
                    }, 200)
                }
            }
        },
        refresh() {
            this.clearCanvas()
            this.run(this.maskCanvasList[0])
        },
        chooseDegree(item) {
            this.selectedDegreeItem = item
            this.isModify = true
        }

    }
}
</script>

<style lang="scss">
.eqc-wordcloud-palette {
    user-select: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    z-index: 95; //需要比色盘层级小1
    .palette {
        width: 960px;
        height: 600px;
        background: transparent;
        position: relative;
        box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-between;
        align-items: center;
        .settings {
            width: 62%;
            height: 100%;
            background: #ffffff;
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
            .box {
                margin: 28px 8px 28px 28px;
                overflow-y: scroll;
                height: calc(100% - 56px);
                .inner {
                    padding: 12px 0;
                    margin: 0 16px;
                    position: relative;
                    > .title {
                        font-size: 16px;
                        font-weight: 600;
                        color: rgba(17, 17, 17, 1);
                        line-height: 22px;
                        display: flex;
                        flex-direction: row;
                        flex-wrap: nowrap;
                        justify-content: flex-start;
                        align-items: center;
                        .pio {
                            width: 12px;
                            height: 12px;
                            background: rgba(252, 152, 3, 1);
                            margin-right: 5px;
                        }
                    }
                }
                .step-1 {
                    height: 246px;
                    background: rgba(247, 248, 249, 1);
                    margin-right: 12px;
                    margin-bottom: 15px;
                    .inner {
                        margin: 0 8px 0 16px;
                    }
                    .banner {
                        width: 94%;
                        height: 24px;
                        position: relative;
                        margin: 8px 3% 0 3%;
                        .swiper-container {
                            width: 100%;
                            height: 100%;
                        }
                        .swiper-slide {
                            color: #111111;
                            border-bottom: 2px solid #f7f8f9;
                            width: auto;
                            height: 22px;
                            text-align: center;
                            font-size: 13px;
                            cursor: pointer;
                            display: flex;
                            -webkit-box-pack: center;
                            -ms-flex-pack: center;
                            -webkit-justify-content: center;
                            justify-content: center;
                            -webkit-box-align: center;
                            -ms-flex-align: center;
                            -webkit-align-items: center;
                            align-items: center;
                        }
                        .swiper-button {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            font-size: 13px;
                            color: #76838f;
                            transform: scale(0.3);
                        }
                        .swiper-button-prev {
                            margin: -24px 0 0 -35px;
                            background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2027%2044'%3E%3Cpath%20d%3D'M0%2C22L22%2C0l4.2%2C4.2L8.4%2C22l17.8%2C17.8L22%2C44L0%2C22z'%20fill%3D'%2376838F'%2F%3E%3C%2Fsvg%3E");
                        }
                        .swiper-button-next {
                            margin: -24px -35px 0 0;
                            background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2027%2044'%3E%3Cpath%20d%3D'M27%2C22L5%2C44l-4.2-4.2L18.6%2C22L0.8%2C4.2L5%2C0z'%20fill%3D'%2376838F'%2F%3E%3C%2Fsvg%3E");
                        }
                        .swiper-button-prev.swiper-button-disabled,
                        .swiper-button-next.swiper-button-disabled {
                            opacity: 0;
                        }
                        .selected-swiper-item {
                            color: #1593ff;
                            border-bottom: 2px solid #1593ff;
                        }
                    }
                    .upload-box {
                        width: 100%;
                        height: 168px;
                        position: absolute;
                        bottom: 12px;
                        left: -4px;
                        z-index: 1;
                        background: #f7f8f9;
                        .upload-area {
                            width: 100%;
                            height: 156px;
                            flex-direction: column;
                            position: relative;
                            display: flex;
                            flex-wrap: nowrap;
                            justify-content: center;
                            align-items: center;
                            .tips {
                                width: 464px;
                                height: 64px;
                                margin-top: 16px;
                            }
                            .layer {
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                background: rgba(0, 0, 0, 0.7);
                                z-index: 0; //与错误提示层级一样
                                border-radius: 3px;
                            }
                            .label {
                                font-size: 12px;
                                color: #9b9b9b;
                                margin: 9px;
                            }
                            .show-oringin-img {
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 156px;
                            }
                        }
                    }
                    .shapes {
                        position: relative;
                        width: 100%;
                        height: 168px; //184px;
                        overflow-y: scroll;
                        font-size: 0;
                        margin-top: 12px;
                        padding: 2px 0 0 2px;
                        .shape {
                            position: relative;
                            width: 54px;
                            height: 54px;
                            overflow: hidden;
                            margin: 0 8px 8px 0;
                            background: #00ff;
                            display: inline-block;
                            vertical-align: middle;
                            background: #ffffff center/contain no-repeat;
                            border: 1px solid #ffffff;
                            cursor: pointer;
                            &:hover {
                                // transform: scale(1.2);
                                box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.16);
                            }
                            .shape-selected-arrow {
                                width: 0;
                                height: 0;
                                border-width: 8px;
                                border-style: solid;
                                position: absolute;
                                border-color: rgba(21, 147, 255, 1) transparent transparent rgba(21, 147, 255, 1);
                            }
                            .shape-selected-flag {
                                font-size: 12px;
                                position: absolute;
                                top: -1px;
                                left: 0px;
                                color: #ffffff;
                            }
                        }
                        .shape-selected {
                            border: 1px solid rgba(21, 147, 255, 1);
                        }
                        .shape:nth-child(8n) {
                            margin-right: 0;
                        }
                        &::-webkit-scrollbar {
                            width: 8px;
                        }
                        &::-webkit-scrollbar-track {
                            background-color: #f7f8f9;
                        }
                        &::-webkit-scrollbar-thumb {
                            background-color: rgba(0, 0, 0, 0.2);
                            height: 80px;
                            border-radius: 4px;
                        }
                    }
                }
                .step-2 {
                    height: 178px;
                    background: rgba(247, 248, 249, 1);
                    margin-right: 12px;
                    margin-bottom: 15px;
                    .error-tip {
                        font-size: 14px;
                        color: rgba(255, 84, 72, 1);
                        margin-left: 8px;
                        padding: 0;
                    }
                    .tip {
                        font-size: 14px;
                        color: #333333;
                        font-weight: normal;
                        margin-left: 8px;
                        padding: 0;
                    }
                    textarea {
                        margin-top: 16px;
                        width: 100%;
                        line-height: 20px;
                        height: 100px;
                        padding: 8px;
                        color: #2f3c4d;
                        border: 1px solid #ccd5db;
                        //border-radius: 3px;
                        resize: none;
                        font-size: 14px;
                    }
                    .error {
                        border: 1px solid rgba(255, 84, 72, 1);
                    }
                }
                .step-3 {
                    // height: 90px; //451px;
                    background: rgba(247, 248, 249, 1);
                    margin-right: 12px;
                    .inner {
                        .bg-setting {
                            display: flex;
                            flex-direction: column;
                            flex-wrap: nowrap;
                            justify-content: flex-start;
                            align-items: flex-start;
                            margin-top: 16px;
                            position: relative;
                            .tabs {
                                display: flex;
                                flex-direction: row;
                                flex-wrap: nowrap;
                                justify-content: flex-start;
                                align-items: center;
                                position: relative;
                                > .title {
                                    font-size: 14px;
                                    color: rgba(17, 17, 17, 1);
                                    line-height: 20px;
                                    margin-right: 12px;
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
                                        // &:hover {
                                        //     background: #1593ff;
                                        //     color: #ffffff;
                                        // }
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
                                flex-wrap: nowrap;
                                justify-content: flex-start;
                                align-items: center;
                                margin-top: 12px;
                                > .btn {
                                    font-size: 14px;
                                    width: 28px;
                                    height: 28px;
                                    position: relative;
                                    background: #fff;
                                    margin-right: 8px;
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
                                .clear {
                                    background: url("../../img/opacity.png") center;
                                }
                                .setting {
                                    background: url("../../img/color_bg.png") center;
                                }
                            }
                            .show-more {
                                position: absolute;
                                right: 0;
                                top: 5px;
                                cursor: pointer;
                                display: flex;
                            }
                        }
                        .more-settings {
                            color: #111111;
                            margin-top: 16px;
                            .top {
                                border-top: 1px solid #ccd5db;
                                border-bottom: 1px solid #ccd5db;
                                height: 174px;
                                width: auto;
                                position: relative;

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
                                    height: 90px;
                                    // overflow: hidden;
                                    position: relative;
                                    margin-top: 4px;
                                    .title {
                                        font-size: 14px;
                                        color: rgba(17, 17, 17, 1);
                                        line-height: 20px;
                                    }
                                    .degree {
                                        display: flex;
                                        flex-direction: row;
                                        flex-wrap: nowrap;
                                        justify-content: space-between;
                                        align-items: center;
                                        margin-top: 8px;
                                        > li {
                                            width: 44px;
                                            cursor: pointer;
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
                                    margin-top: 15px;
                                    > .title {
                                        font-size: 14px;
                                        color: rgba(17, 17, 17, 1);
                                        line-height: 20px;
                                        margin-right: 12px;
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
                                            // &:hover {
                                            //     background: #1593ff;
                                            //     color: #ffffff;
                                            // }
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
                                        justify-content: space-between;
                                        align-items: center;
                                        > li {
                                            width: 116px;
                                            height: 25px;
                                            display: flex;
                                            flex-direction: row;
                                            flex-wrap: nowrap;
                                            justify-content: space-around;
                                            align-items: center;
                                            margin-bottom: 8px;
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
                                    font-size: 14px;
                                    color: rgba(112, 112, 112, 1);
                                    line-height: 20px;
                                    margin-right: 8px;
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
                                .clear {
                                    background: url("../../img/opacity.png") center;
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
                    }
                }
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
            }
        }
        .result {
            width: 38%;
            height: 100%;
            background: #eceef0;
            border-top-right-radius: 4px;
            border-bottom-right-radius: 4px;
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
            justify-content: flex-start;
            align-items: center;
            .top {
                width: 100%;
                height: 60px;
                position: relative;
                .close {
                    font-size: 24px;
                    color: #9099a4;
                    position: absolute;
                    right: 28px;
                    top: 18px;
                    cursor: pointer;
                }
            }
            .preview {
                display: flex;
                flex-direction: column;
                flex-wrap: nowrap;
                justify-content: space-between;
                align-items: center;
                margin: 0 28px;
                background: #ffffff;
                #wcpCanvas {
                    // border: 1px dashed #979797;
                    background: #ffffff;
                    width: 312px;
                    height: 312px;
                }
                .refresh {
                    width: 100%;
                    height: 76px;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    flex-wrap: nowrap;
                    justify-content: center;
                    align-items: center;
                    .run {
                        background: rgba(255, 255, 255, 1);
                        box-shadow: 0px 2px 16px 0px rgba(0, 0, 0, 0.16);
                        //border: 1px solid rgba(204, 213, 219, 1);
                        font-size: 23px;
                        color: #1593ff;
                        border-radius: 36px;
                        padding: 6px;
                        cursor: pointer;
                    }
                }
                .refresh-loading {
                    animation: loading 2s linear infinite;
                }
                @keyframes loading {
                    from {
                        transform: rotate(0);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            }
            .operation {
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: space-between;
                align-items: center;
                margin: 36px auto 16px auto;
                width: 312px;
                .btn {
                    width: 148px;
                    height: 36px;
                    border-radius: 3px;
                    border: 1px solid #9099a4;
                    font-size: 14px;
                    font-weight: 400;
                    text-align: center;
                    line-height: 36px;
                    cursor: pointer;
                    color: #9099a4;
                }
            }
            .addToPage {
                width: 312px;
                height: 36px;
                background: rgba(21, 147, 255, 1);
                border-radius: 3px;
                font-size: 14px;
                font-weight: 400;
                color: rgba(255, 255, 255, 1);
                line-height: 36px;
                text-align: center;
                cursor: pointer;
            }
        }
    }
}
</style>
