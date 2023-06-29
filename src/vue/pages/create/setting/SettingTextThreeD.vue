<template>
    <div class="eqc-setting-text-three-d">
        <div class="name">
            特效
        </div>
        <div
            class="font-style-btn font-style-box"
            @click="textThreeDStyleSelect()"
        >
            <div
                :style="{backgroundImage: getTextThreeDTextStyleCover(element.elementJson.property)}"
                class="style-box"
            />
            <i
                class="icon eqf-menu-right"
            />
        </div>
        <div
            class="name"
        >
            <label>字体</label>
        </div>
        <div
            class="font-style-btn"
            @click="textThreeDTextFontSelect()"
        >
            <span>{{ property.textFont.name?property.textFont.name:'默认字体' }}</span>
            <i
                class="icon eqf-menu-right"
            />
        </div>
        <div
            class="name"
        >
            <label>字号</label>
        </div>
        <div
            class="content"
        >
            <base-threed-input
                :model="property"
                :min="0"
                :max="100"
                model-key="textFontSize"
            />
        </div>
        <div
            class="name-style"
        >
            <div class="style-type">
                <div
                    :class="['color',property.textStyleType===textThreeDTextStyle.color?'selected':'']"
                    @click="styleClick(textThreeDTextStyle.color)"
                >
                    颜色
                </div>
                <div
                    :class="['gradient',property.textStyleType===textThreeDTextStyle.gradient?'selected':'']"
                    @click="styleClick(textThreeDTextStyle.gradient)"
                >
                    渐变
                </div>
                <div
                    :class="['texture',property.textStyleType===textThreeDTextStyle.texture?'selected':'']"
                    @click="styleClick(textThreeDTextStyle.texture)"
                >
                    贴图
                </div>
            </div>
        </div>
        <div
            class="content-style"
        >
            <setting-threed-color
                v-if="property.textStyleType===textThreeDTextStyle.color"
                :eqx-element="element"
                :model="property"
                :model-key="'textColor'"
            />
            <setting-text-three-d-gradient-color
                v-if="property.textStyleType===textThreeDTextStyle.gradient"
                :model="property"
                :eqx-element="element"
                model-key="textGradient"
            />
            <div
                v-if="property.textStyleType===textThreeDTextStyle.texture"
                class="setting-texture"
            >
                <div
                    data-hint="点击更换贴图"
                    :style="{backgroundImage: threeDUtil.getTextureCover(property.textTexture.cover)}"
                    class="left hint--top hint--rounded"
                    @click="textThreeDTextureSelect()"
                />
                <div class="right">
                    <div>尺寸</div>
                    <div>
                        <base-threed-input
                            :model="property.textTexture"
                            :min="1"
                            :max="99"
                            model-key="size"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div
            v-if="property.textStyleType===textThreeDTextStyle.texture"
            class="name"
        >
            <label>X偏移</label>
            <label style="margin-left:56px">Y偏移</label>
        </div>
        <div
            v-if="property.textStyleType===textThreeDTextStyle.texture"
            class="content"
        >
            <div class="left">
                <base-threed-input
                    :model="property.textTexture"
                    :min="-100"
                    :max="100"
                    model-key="offsetX"
                />
            </div>
            <div
                class="right"
            >
                <base-threed-input
                    :model="property.textTexture"
                    :min="-100"
                    :max="100"
                    model-key="offsetY"
                />
            </div>
        </div>
        <div
            class="name"
        >
            <label>投影颜色</label>
            <label style="margin-left:33px">投影厚度</label>
        </div>
        <div
            class="content"
        >
            <div
                class="left"
            >
                <setting-threed-color
                    :eqx-element="element"
                    :model="property"
                    :model-key="'textShadowColor'"
                />
            </div>
            <div
                class="right"
            >
                <base-threed-input
                    :model="property"
                    :min="0"
                    :max="200"
                    model-key="textHeight"
                />
            </div>
        </div>
        <div
            class="name"
        >
            <label>倒角</label>
            <label style="margin-left:56px">粗细</label>
        </div>
        <div
            class="content"
        >
            <div class="left">
                <base-threed-input
                    :model="property"
                    :min="0"
                    :max="20"
                    model-key="bevelSize"
                />
            </div>
            <div
                class="right"
            >
                <base-threed-input
                    :model="property"
                    :min="0"
                    :max="5"
                    model-key="bevelOffset"
                />
            </div>
        </div>
        <div
            v-show="false"
            class="name"
        >
            <label>斜角分段数</label>
            <label style="margin-left:33px">斜角深度</label>
        </div>
        <div
            v-show="false"
            class="content"
        >
            <div class="left">
                <base-threed-input
                    :model="property"
                    :min="1"
                    :max="20"
                    model-key="bevelSegments"
                />
            </div>
            <div
                class="right"
            >
                <base-threed-input
                    :model="property"
                    :min="0"
                    :max="50"
                    model-key="bevelThickness"
                />
            </div>
        </div>
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
                    <i
                        class="icon eqf-linehigh"
                    />
                </div>
                <div class="input">
                    <base-threed-input
                        :model="property"
                        :min="0"
                        :max="100"
                        model-key="lineHeight"
                    />
                </div>
            </div>
            <div class="right">
                <div class="iconbox">
                    <i
                        class="icon eqf-lineshort"
                    />
                </div>

                <div class="input">
                    <base-threed-input
                        :model="property"
                        :min="0"
                        :max="100"
                        model-key="letterSpacing"
                    />
                </div>
            </div>
        </div>
        <setting-text-three-d-align
            :eqx-element="element"
            :model="property"
            model-key="textAlign"
        />
    </div>
</template>

<script>

import SettingThreedColor from './SettingThreedColor.vue'
import SettingTextThreeDGradientColor from './SettingTextThreeDGradientColor.vue'
import SettingTextThreeDAlign from './SettingTextThreeDAlign.vue'
import threeDUtil from './../../../../utils/threeDUtil'
import textThreeDTextStyle from './../../../../config/enum.textThreeDText.style'

export default {
    components: {
        SettingThreedColor,
        SettingTextThreeDGradientColor,
        SettingTextThreeDAlign
    },
    props: {
        property: {
            type: Object,
            default: null
        },
        element: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            threeDUtil,
            textThreeDTextStyle
        }
    },
    computed: {
        // 3D文字特效选择框
        textThreeDStyleLayer() {
            return this.$store.state.fontStyle.textThreeDStyle
        },
        // 3D文字字体选择
        textThreeDTextFontLayer() {
            return this.$store.state.fontStyle.textThreeDTextFont
        },
        // 3D文字贴图
        textThreeDTextTextureLayer() {
            return this.$store.state.fontStyle.textThreeDTextTexture
        }
    },
    methods: {

        /**
         * 获取3D立体字样式的图片 没有返回自定义样式
         */
        getTextThreeDTextStyleCover(property) {
            for (let i = 0; i < this.textThreeDStyleLayer.styleList.length; i++) {
                const styleItem = this.textThreeDStyleLayer.styleList[i]
                const style = styleItem.style
                if (property.textColor === style.textColor &&
                property.textShadowColor === style.textShadowColor &&
                property.textHeight === style.textHeight &&
                property.bevelSize === style.bevelSize &&
                property.bevelOffset === style.bevelOffset &&
                property.textStyleType === textThreeDTextStyle.color) {
                    return `url(${styleItem.cover})`
                }
            }
            return `url(${this.textThreeDStyleLayer.styleList[0].cover})`
        },
        /**
         * 3D文字特效选择
         */
        textThreeDStyleSelect() {
            this.$store.commit('TEXT_THREED_STYLE_LAYER', { show: !this.textThreeDStyleLayer.show })
        },
        /**
         * 3D文字字体选择
         */
        textThreeDTextFontSelect() {
            this.$store.commit('TEXT_THREED_FONT_LAYER', { show: !this.textThreeDTextFontLayer.show })
        },
        /**
         * 3D文字贴图选择
         */
        textThreeDTextureSelect() {
            this.$store.commit('TEXT_THREED_TEXTURE_LAYER', { show: !this.textThreeDTextTextureLayer.show })
        },
        /**
         * 切换样式类型
         */
        styleClick(pType) {
            if (this.property.textStyleType === pType) {
                return
            }
            this.property.textStyleType = pType
            if (pType === textThreeDTextStyle.color) {
                this.element.updateColor({ textStyleType: pType })
            } else if (pType === textThreeDTextStyle.gradient) {
                this.element.updateGradient({ textStyleType: pType })
            } else if (pType === textThreeDTextStyle.texture) {
                const defaultTexture = this.textThreeDTextTextureLayer.styleList[0]
                this.element.updateTexture({
                    textStyleType: textThreeDTextStyle.texture,
                    textTexture: {
                        cover: defaultTexture.name, // 贴图的key
                        size: this.element.elementJson.property.textTexture.size || 50, // 尺寸
                        offsetX: this.element.elementJson.property.textTexture.offsetX || 0, // 水平偏移
                        offsetY: this.element.elementJson.property.textTexture.offsetY || 0, // 竖直偏移
                        angle: this.element.elementJson.property.textTexture.angle || 0 // 角度
                    },
                    textShadowColor: defaultTexture.textShadowColor
                })
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-setting-text-three-d {
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
    .name-style {
        height: 30px;
        margin-top: 12px;
        .style-type {
            display: flex;
            flex-direction: row;
            width: 100%;
            height: 100%;
            div {
                flex: 1;
                background: #ffffff;
                font-size: 12px;
                font-weight: 400;
                color: rgba(37, 43, 63, 1);
                text-align: center;
                line-height: 27px;
                cursor: pointer;
                &.color {
                    border: 1px solid rgba(204, 213, 219, 1);
                    border-right: none;
                }
                &.gradient {
                    border: 1px solid rgba(204, 213, 219, 1);
                }
                &.texture {
                    border: 1px solid rgba(204, 213, 219, 1);
                    border-left: none;
                }
                &.selected {
                    background: rgba(21, 147, 255, 1);
                    color: #ffffff;
                }
            }
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
    .content-style {
        margin-top: 12px;
        font-size: 12px;
        color: #4f5d69;
        .setting-texture {
            width: 100%;
            height: 54px;
            display: flex;
            flex-direction: row;
            .left {
                width: 54px;
                height: 54px;
                background: rgba(255, 255, 255, 1);
                border: 1px solid rgba(204, 213, 219, 1);
                margin-right: 26px;
                background-size: 100%;
                cursor: pointer;
            }
            .right {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                flex: 1;
            }
        }
    }
}
</style>
