<template>
    <div
        v-if="showFlag"
        class="eqc-setting-combine-text"
    >
        <div
            :style="{height: textHeight + 'px'}"
            class="category text"
        >
            <div
                class="title"
                @click="openText"
            >
                <span>文字-批量</span>
                <i
                    :class="{'eqf-down':textHeight !== 40,'eqf-right':textHeight === 40}"
                    class="arrow"
                />
            </div>
            <div
                class="detail"
                @click="$refs.combineTextRadiusPanel && $refs.combineTextRadiusPanel.hideSelectPanel()"
            >
                <div class="name">
                    样式
                </div>
                <div
                    class="font-style-btn font-style-box"
                    @click="fontStyleSelect()"
                >
                    <div
                        v-if="!showTextStyle"
                        :style="{backgroundImage: getTextStyleBgImage}"
                        class="style-box"
                    />
                    <p
                        v-if="showTextStyle"
                        class="multi-styles"
                    >
                        多个特效
                    </p>
                    <i
                        class="icon eqf-menu-right"
                    />
                </div>
                <div class="name">
                    字体
                </div>
                <div
                    class="font-style-btn"
                    @click="fontTextSelect()"
                >
                    <span>{{ fontName }}</span>
                    <i class="icon eqf-menu-right" />
                </div>
                <div
                    v-if="textTypeSelected !== textType.gradient"
                    class="name"
                >
                    文字颜色字号
                </div>
                <div
                    v-if="textTypeSelected !== textType.gradient"
                    class="content"
                >
                    <div class="left">
                        <setting-color
                            :model="css"
                            model-key="color"
                        />
                    </div>
                    <div
                        class="right"
                    >
                        <base-input
                            :model="css"
                            :min="0"
                            model-key="fontSize"
                        />
                    </div>
                </div>
                <div
                    v-if="[textType.text,textType.shadow,textType.cube,textType.stroke].includes(textTypeSelected)"
                    class="name"
                >
                    背景颜色
                </div>
                <setting-color
                    v-if="[textType.text,textType.shadow,textType.cube,textType.stroke].includes(textTypeSelected)"
                    :model="css"
                    model-key="backgroundColor"
                />
                <div
                    v-if="property && property.borderRadius && [textType.text,textType.shadow,textType.cube,textType.stroke].includes(textTypeSelected)"
                    class="name"
                >
                    背景圆角
                </div>
                <setting-border-radius
                    v-if="property && property.borderRadius && [textType.text,textType.shadow,textType.cube,textType.stroke].includes(textTypeSelected)"
                    ref="combineTextRadiusPanel"
                    :model="property.borderRadius"
                    model-key="val"
                />
                <base-input
                    v-if="textTypeSelected === textType.gradient"
                    :model="css"
                    :min="0"
                    style="marginTop:12px"
                    model-key="fontSize"
                />

                <div
                    v-if="textTypeSelected === textType.gradient"
                    class="name"
                >
                    文字颜色
                </div>
                <setting-gradient-color
                    v-if="textTypeSelected === textType.gradient"
                    :model="property"
                    :eqx-element="eqxElement"
                    model-key="gradient"
                />
                <div
                    v-if="textTypeSelected === textType.shake"
                    class="name"
                >
                    颤抖颜色
                </div>
                <div
                    v-if="textTypeSelected === textType.shake"
                    class="content"
                >
                    <div class="left">
                        <setting-color
                            :model="property"
                            model-key="shake"
                            model-key-type="0"
                        />
                    </div>

                    <div class="right">
                        <setting-color
                            :model="property"
                            model-key="shake"
                            model-key-type="1"
                        />
                    </div>
                </div>
                <div
                    v-if="textTypeSelected === textType.shake"
                    class="name"
                >
                    颜色角度
                </div>
                <base-input
                    v-if="textTypeSelected === textType.shake"
                    :model="property"
                    :min="0"
                    :max="359"
                    model-key="angle"
                    unit=""
                    unit-view="°"
                />
                <div
                    v-if="textTypeSelected === textType.shake"
                    class="name"
                >
                    颜色尺寸
                </div>
                <base-input
                    v-if="textTypeSelected === textType.shake"
                    :model="property"
                    :min="0"
                    model-key="shake"
                    model-key-type="size"
                    unit=""
                    unit-view=""
                />

                <div class="name">
                    内边距
                </div>
                <base-input
                    :model="css"
                    :min="0"
                    model-key="padding"
                />
                <div class="content">
                    <div class="name left">
                        行间距
                    </div>
                    <div class="name right">
                        字间距
                    </div>
                </div>
                <div
                    class="content"
                >
                    <div class="left">
                        <div class="iconbox">
                            <i class="icon eqf-linehigh" />
                        </div>

                        <div class="input">
                            <base-input
                                :model="css"
                                :min="100"
                                :max="200"
                                model-key="lineHeight"
                                unit=""
                                unit-view="%"
                            />
                        </div>
                    </div>

                    <div class="right">
                        <div class="iconbox">
                            <i class="icon eqf-lineshort" />
                        </div>

                        <div class="input">
                            <base-input
                                :model="css"
                                :min="0"
                                model-key="letterSpacing"
                            />
                        </div>
                    </div>
                </div>

                <setting-text-align
                    :model="css"
                    model-key="textAlign"
                />
                <setting-text-style
                    :model="css"
                    :text-type="property.type"
                />
            </div>
        </div>
    </div>
</template>

<script>
import SettingColor from './SettingColor.vue'
import SettingTextAlign from './SettingTextAlign.vue'
import SettingTextStyle from './SettingTextStyle.vue'
import elementType from '../../../../config/enum.element.type'
import combineInitor from '../workspace/combine.box.js'
import bindResize from '../../../../core/html/element.resize'
import textType from '../../../../config/enum.text.type'
import init from '../../../../core/html/element/text'
import SettingBorderRadius from './SettingBorderRadius.vue'
import SettingGradientColor from './SettingGradientColor.vue'
export default {
    components: {
        SettingColor,
        SettingTextAlign,
        SettingTextStyle,
        SettingBorderRadius,
        SettingGradientColor
    },
    props: {
        eqxElement: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            showFlag: true,
            virtualElement: {
                css: {
                    padding: 0,
                    lineHeight: 1.2,
                    letterSpacing: 0,
                    fontFamily: '',
                    fontSize: '12px',
                    fontWeight: '', // bold
                    fontStyle: '' // italic
                },
                property: {
                    fontstylename: '无样式',
                    type: 0,
                    dropShadow: {},
                    shadow: {},
                    shake: {},
                    stroke: {},
                    angle: 0 // 角度 颤抖和立体的时候 都用得到
                }
            },
            lastVirtualElement: {},
            allTextElement: [],
            textType,
            textHeight: 621,
            textHeightCopy: 621,
            backgroundImage: ''
        }
    },
    computed: {
        eqxPage() {
            return this.$store.state.scene.eqxPage
        },
        css() {
            return this.virtualElement.css
        },
        property() {
            return this.virtualElement.property
        },
        fontStyleLayer() {
            return this.$store.state.fontStyle.layer
        },
        textTypeSelected() {
            return this.property.type
        },
        fontTextLayer() {
            return this.$store.state.fontStyle.text
        },
        styleList() {
            return this.$store.state.fontStyle.list
        },
        fontName() {
            return this.virtualElement.property.fontFamilyName
        },
        showTextStyle() {
            return this.virtualElement.property.fontstylename === '多个特效'
        },
        getTextStyleBgImage() {
            return this.getBackgroundImage(this.virtualElement.property.fontStyleImgPath)
        }
    },
    watch: {
        textTypeSelected(newVal) {
            if (newVal === textType.gradient) {
                this.backgroundImage = init.gradient(this.virtualElement.property).backgroundImage
            }
            let height = 0
            switch (newVal) {
                case -1: height = 407 + 24 + 18; break // 公共的属性
                case textType.text: height = 473 + 66 + 24 + 18; break
                case textType.shadow: height = 407 + 66 + 24 + 66 + 18; break
                case textType.gradient : height = 588 + 24 + 18; break
                case textType.cube:height = 407 + 66 + 66 + 24 + 18; break
                case textType.stroke:height = 407 + 66 + 24 + 66 + 18; break
                case textType.shake:height = 605 + 24 + 18; break
                case textType.chartlet:height = 407 + 24 + 18; break
            }
            this.textHeight = 40 + height
            this.textHeightCopy = this.textHeight
            this.$emit('changeHeight', this.textHeight)
        },
        eqxElement(newVal) {
            this.allTextElement = this.findTextElement()
        },
        allTextElement() {
            this.initStyle()
        },
        virtualElement: {
            handler(newObj) {
                const oldObj = this.lastVirtualElement
                if (newObj.type !== 0) {
                    const properKeyArr = this.compareObj(newObj.property, oldObj.property)
                    const cssKeyArr = this.compareObj(newObj.css, oldObj.css)
                    const changeCss = {}
                    cssKeyArr.map(cssKey => {
                        changeCss[cssKey] = newObj.css[cssKey]
                    })
                    // 更新property
                    if (properKeyArr.length > 0) {
                        const changeProperty = {}
                        properKeyArr.map(key => {
                            changeProperty[key] = newObj.property[key]
                        })
                        this.allTextElement.map(element => {
                            let copyChangeProperty = JSON.parse(JSON.stringify(changeProperty))
                            // 字体改变和样式改变
                            if (newObj.property.fontstylename !== oldObj.property.fontstylename) {
                                copyChangeProperty = JSON.parse(JSON.stringify(newObj.property)) // 改变字体 必须全部替换property 才行 坑啊
                                // 设置字体
                                setTimeout(() => {
                                    element.createFontFace()
                                    element.updateCss(changeCss)
                                }, 0)
                            }
                            element.updateProperty(copyChangeProperty)
                        })
                    }

                    // 更新css
                    if (cssKeyArr.length > 0) {
                        this.allTextElement.map(element => {
                            // 文字竖排
                            let copyChangeCss = JSON.parse(JSON.stringify(changeCss))
                            if (cssKeyArr.includes('writingMode')) {
                                const width = element.elementJson.css.width
                                const height = element.elementJson.css.height
                                copyChangeCss.width = height
                                copyChangeCss.height = width
                                element.elementJson.css.writingMode = newObj.css.writingMode
                                if (newObj.css.writingMode === 'vertical-rl') {
                                    element.elementBox.value = 13
                                    bindResize.call(element, element.elementBox, element.elementBox.value)
                                } else {
                                    element.elementBox.value = 11
                                }
                            }
                            // 改变字体的时候   添加一些特殊的样式
                            if (textType.gradient === newObj.property.type) {
                                copyChangeCss = Object.assign(copyChangeCss, {
                                    webkitBackgroundClip: 'text',
                                    backgroundClip: 'text',
                                    backgroundImage: newObj.css.backgroundImage
                                    // color: 'transparent'
                                })
                            } else if (textType.chartlet === newObj.property.type) {
                                copyChangeCss = Object.assign(copyChangeCss, {
                                    backgroundPosition: 'center',
                                    backgroundSize: 'cover',
                                    webkitBackgroundClip: 'text',
                                    backgroundClip: 'text'
                                })
                            }
                            element.updateCss(copyChangeCss)
                        })
                    }

                    // 改变了下列属性 将会导致重新绘制组合框
                    const state = cssKeyArr.some(key => {
                        return ['fontSize', 'padding', 'letterSpacing', 'writingMode', 'lineHeight'].includes(key)
                    })

                    if (state) {
                        this.reCalculateCombineBox()
                    }
                    this.lastVirtualElement = JSON.parse(JSON.stringify(newObj))
                    this.eqxPage.eqxHistory.add(this.eqxPage)
                } else {
                    newObj.type = 1
                    this.lastVirtualElement = JSON.parse(JSON.stringify(newObj))
                }
            },
            deep: true
        }
    },
    mounted() {
        this.allTextElement = this.findTextElement()
    },
    methods: {
        initStyleFontImg() {
            // 初始化加载 字体图片
            const fontstylename = this.eqxElement.virtualElement.property.fontstylename
            const matchStyleItem = this.styleList.find(item => item.name === fontstylename)
            if (matchStyleItem) {
                this.eqxElement.virtualElement.property.fontStyleImgPath = matchStyleItem.cover
            }
        },
        reCalculateCombineBox() {
            setTimeout(() => {
                const parentElement = this.eqxElement.combineBox ? this.eqxElement.combineBox : this.eqxElement
                combineInitor.reCalculateCombineBox(parentElement)
            }, 40)
        },
        // 字体都还原为默认字体
        initFontStyle() {
            this.allTextElement.map(element => {
                // 初始化 property
                const initProperty = {
                    cube: [{ color: '#fff', size: 0 }],
                    dropShadow: {
                        blur: 0,
                        color: 'rgba(0,0,0,0)',
                        lastTransparency: 100,
                        transparency: 100,
                        x: 0,
                        y: 0
                    },
                    stroke: {
                        color: '#FF2A6A',
                        distance: 0,
                        size: 0
                    },
                    src: '',
                    fontstylename: '无样式',
                    angle: 45,
                    type: 0

                }
                const initCss = {
                    color: '#000000',
                    fontFamily: '',
                    textShadow: ''

                }
                element.updateProperty(initProperty)
                element.createFontFace()
                element.updateCss(initCss)
            })
        },
        compareObj(newObj, oldObj) {
            const changeKeyArr = []
            for (const key in newObj) {
                if (typeof newObj[key] === 'object') {
                    if (JSON.stringify(newObj[key]) !== JSON.stringify(oldObj[key])) {
                        changeKeyArr.push(key)
                    }
                } else if (newObj[key] !== oldObj[key]) {
                    changeKeyArr.push(key)
                }
            }
            return changeKeyArr
        },
        initStyle() {
            /**
             * 若各文本框对应属性一致，则显示对应属性值，若不一致，则按下列规则显示：
                （1）样式显示”多个特效“
                （2）字体显示“...”
                （3）文字颜色显示“...”
                （4）字号显示所有文字组件中字号显示“...”
                （5）背景颜色显示为“...”
                （6）背景圆角显示为“...”，选中4个圆角
                （7）内边距显示“...”
                （8）行间距显示“...”
                （9）字间距显示为“...”
                （10）对齐方式显示为默认不选中，横排
                （11）加粗、斜体、下划线、删除线默认不选中
            */
            if (this.allTextElement.length === 0) {
                this.showFlag = false
                return
            } else {
                this.showFlag = true
            }
            const element = this.allTextElement[0]
            const virtualElement = {
                type: 0, // 0 新添加 1已添加
                property: JSON.parse(JSON.stringify(element.elementJson.property)),
                css: {
                    fontFamily: element.elementJson.css.fontFamily,
                    color: element.elementJson.css.color,
                    fontSize: element.elementJson.css.fontSize,
                    backgroundColor: element.elementJson.css.backgroundColor,
                    padding: element.elementJson.css.padding,
                    lineHeight: element.elementJson.css.lineHeight,
                    letterSpacing: element.elementJson.css.letterSpacing,
                    textAlign: element.elementJson.css.textAlign,
                    fontStyle: element.elementJson.css.fontStyle,
                    textDecoration: element.elementJson.css.textDecoration,
                    writingMode: element.elementJson.css.writingMode,
                    fontWeight: element.elementJson.css.fontWeight,
                    borderRadius: element.elementJson.css.borderRadius
                }
            }
            this.allTextElement.map(element => {
                if (virtualElement.property.borderRadius && element.elementJson.property.borderRadius && virtualElement.property.borderRadius.val === element.elementJson.property.borderRadius.val) {
                    //  如果相同则不做处理
                } else {
                    if (virtualElement.property.borderRadius) {
                        virtualElement.property.borderRadius.val = '...'
                    }
                }
                if (virtualElement.property.type !== element.elementJson.property.type) {
                    virtualElement.property.type = -1 // 不和任何一个类型匹配 这样子就只展示公共的
                }
                if (virtualElement.property.fontstylename !== element.elementJson.property.fontstylename) {
                    virtualElement.property.fontstylename = '多个特效' // 样式
                }
                if (virtualElement.property.fontFamilyName !== element.elementJson.property.fontFamilyName) {
                    virtualElement.property.fontFamilyName = '...'// 字体
                }
                if (virtualElement.css.color !== element.elementJson.css.color) {
                    virtualElement.css.color = '...'
                }
                if (virtualElement.css.backgroundColor !== element.elementJson.css.backgroundColor) {
                    virtualElement.css.backgroundColor = '...'
                }
                if (virtualElement.css.fontSize !== element.elementJson.css.fontSize) {
                    virtualElement.css.fontSize = '...'
                }
                if (virtualElement.css.padding !== element.elementJson.css.padding) {
                    virtualElement.css.padding = '...'
                }
                if (virtualElement.css.lineHeight !== element.elementJson.css.lineHeight) {
                    virtualElement.css.lineHeight = '...'
                }
                if (virtualElement.css.letterSpacing !== element.elementJson.css.letterSpacing) {
                    virtualElement.css.letterSpacing = '...'
                }
                if (virtualElement.css.textAlign !== element.elementJson.css.textAlign) {
                    virtualElement.css.textAlign = ''
                }
                if (virtualElement.css.fontStyle !== element.elementJson.css.fontStyle) {
                    virtualElement.css.fontStyle = ''
                }
                if (virtualElement.css.textDecoration !== element.elementJson.css.textDecoration) {
                    virtualElement.css.textDecoration = ''
                }
                if (virtualElement.css.writingMode !== element.elementJson.css.writingMode) {
                    virtualElement.css.writingMode = ''
                }
                if (virtualElement.css.fontWeight !== element.elementJson.css.fontWeight) {
                    virtualElement.css.fontWeight = ''
                }
            })

            this.virtualElement = this.lastVirtualElement = virtualElement
            // 挂载到combine元素中 选文字样式的时候 使用
            this.eqxElement.virtualElement = this.virtualElement
            this.initStyleFontImg()
        },
        findTextElement() {
            let textElementArr = []
            let totalElements = 0
            const parentElement = this.eqxElement.combineBox ? this.eqxElement.combineBox : this.eqxElement
            parentElement.childElements.map(element => {
                if (element.elementJson.type === elementType.text) {
                    textElementArr.push(element)
                    totalElements++
                } else if (element.elementJson.type === elementType.combine) {
                    textElementArr = textElementArr.concat(element.childElements.filter(item => (item.elementJson.type === elementType.text)))
                    totalElements += element.childElements.length
                } else {
                    totalElements++
                }
            })
            // 必须是全部元素都是文本元素才允许
            if (totalElements !== textElementArr.length) {
                textElementArr = []
            }
            return textElementArr
        },
        fontStyleSelect() {
            this.$store.commit('FONT_STYLE_LAYER', { show: !this.fontStyleLayer.show })
        },
        openText() {
            if (this.textHeight === this.textHeightCopy) {
                this.textHeight = 40
            } else {
                this.textHeight = this.textHeightCopy
            }
            this.$emit('changeHeight', this.textHeight)
        },
        selsectColor(item) {
            this.allTextElement.map(element => {
                element.updateProperty({
                    gradient: {
                        angle: 90,
                        colors: item
                    }
                })
            })
        },
        fontTextSelect() {
            this.$store.commit('FONT_TEXT_LAYER', { show: !this.fontTextLayer.show })
        },
        getBackgroundImage(src) {
            // 必须有虚拟元素才执行
            if (this.eqxElement.virtualElement) {
                src = Vue.filter('qiniuZoom')(src, 124)
                if (this.eqxElement.virtualElement.property.fontstylename === '无样式') {
                    return Vue.filter('backgroundImage')(null, src)
                } else {
                    return Vue.filter('backgroundImage')(src)
                }
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-setting-combine-text {
    .category {
        height: 621px;
        overflow: hidden;
        transition: all 0.3s;
        .title {
            position: relative;
            width: 100%;
            height: 40px;
            line-height: 38px;
            padding-left: 16px;
            color: #4f5d69;
            border-bottom: 1px solid #ccd5db;
            font-size: 12px;
            transition: all 0.3s;
            cursor: pointer;
            &:hover {
                background: #f7f8f9;
            }
        }
        .detail {
            padding: 0 16px 16px;
            background: #eceef0;
            border-bottom: 1px solid #ccd5db;
            transition: all 0.3s;
            .crop {
                margin-top: 12px;
            }
            .font-style-box {
                height: 48px !important;
                line-height: 48px !important;
                padding: 8px 8px 8px 12px !important;
                .style-box {
                    width: 71px;
                    height: 32px;
                    background-size: cover;
                }
                .icon {
                    top: 8px !important;
                }
            }
            .font-style-btn {
                position: relative;
                width: 100%;
                height: 30px;
                line-height: 28px;
                padding: 0 28px 0 12px;
                background: #fff;
                border: 1px solid #ccd5db;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                font-size: 12px;
                cursor: pointer;
                .icon {
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: 28px;
                    height: 28px;
                    font-size: 22px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .multi-styles {
                    line-height: 30px;
                    height: 30px;
                    color: #111;
                    font-size: 22px;
                    font-weight: 600;
                }
            }
            .name {
                height: 36px;
                line-height: 36px;
                font-size: 12px;
                color: #4f5d69;
                display: flex;
                > p {
                    flex: 1;
                }
            }
            .content {
                display: flex;
                justify-content: space-between;
                > div {
                    flex: 3;
                }

                .left,
                .right {
                    margin-right: 4px;
                    display: flex;
                    .iconbox {
                        flex: 1;
                        border: 1px solid #ccd5db;
                        border-right: none;
                        background: #f7f8f9;
                        color: #76838f;
                    }
                    .input {
                        flex: 2;
                    }
                }
                p {
                    flex: 2;
                    margin: 0 4px;
                    border: 1px solid #ccd5db;
                }
                .right {
                    margin-left: 4px;
                    margin-right: 0;
                }
                .icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    font-size: 18px;
                }
            }
            .text {
                width: 100%;
                height: 30px;
                padding: 0 12px;
                border: 1px solid #ccd5db;
                font-size: 12px;
            }
        }
    }
}
</style>
