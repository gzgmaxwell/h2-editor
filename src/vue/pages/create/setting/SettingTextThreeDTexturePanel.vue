<template>
    <div
        id="text-three-d-texture-layer"
        :style="getPositionStyle"
        class="eqc-setting-text-three-d-texture"
    >
        <div
            v-drag-style-layer="{target: '#text-three-d-texture-layer', container: '.eqc-create'}"
            class="head"
        >
            <span>贴图</span>
            <i
                class="close eqf-no"
                @click="close"
            />
        </div>
        <div
            v-scroll-bar
            class="content"
        >
            <ul class="list">
                <li
                    v-for="(item, index) of textThreeDTextTextureLayer.styleList"
                    :key="index"
                    :style="{backgroundImage: getBackgroundImage(item)}"
                    class="item"
                    @click="select(item)"
                >
                    <p
                        v-if="item.flag !== ''"
                        class="flag"
                    >
                        {{ item.flag }}
                    </p>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import dragStyleLayer from './dragSettingFontStyleLayer'
import textThreeDTextStyle from '../../../../config/enum.textThreeDText.style'

export default {
    directives: {
        dragStyleLayer
    },
    data() {
        return {
        }
    },
    computed: {
        // 获取所在位置
        getPositionStyle() {
            return {
                left: (document.body.clientWidth - 417) + 'px',
                top: '61px'
            }
        },
        eqxElementsSelected() {
            return this.$store.state.scene.eqxElementsSelected
        },
        eqxElement() {
            return this.eqxElementsSelected[0]
        },
        // 3D文字贴图
        textThreeDTextTextureLayer() {
            return this.$store.state.fontStyle.textThreeDTextTexture
        }
    },
    methods: {
        getBackgroundImage(pStyleItem) {
            return `url('${pStyleItem.cover}')`
        },
        select(pStyleItem) {
            const property = this.eqxElement.elementJson.property
            this.eqxElement.updateTexture({
                textStyleType: textThreeDTextStyle.texture,
                textTexture: {
                    cover: pStyleItem.name, // 贴图的key
                    size: property.textTexture.size || 50, // 尺寸
                    offsetX: property.textTexture.offsetX || 0, // 水平偏移
                    offsetY: property.textTexture.offsetY || 0, // 竖直偏移
                    angle: property.textTexture.angle || 0 // 角度
                },
                textShadowColor: pStyleItem.textShadowColor
            })
        },
        close() {
            this.$store.commit('TEXT_THREED_TEXTURE_LAYER', { show: false })
        }
    }
}
</script>

<style lang="scss">
.eqc-setting-text-three-d-texture {
    position: fixed;
    width: 234px;
    height: calc(100% - 60px);
    font-size: 12px;
    background: #fdfdfd;
    z-index: 93;
    // border-radius: 3px;
    border: 1px solid #ccd5db;
    .head {
        height: 40px;
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
    .content {
        position: relative;
        height: calc(100% - 40px); // 392px;
        padding: 0px 16px 16px 16px;
        .list {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: flex-start;
            align-items: center;
            .item {
                width: 64px;
                height: 64px;
                background: #ff0;
                background: #ffffff center/contain no-repeat;
                position: relative;
                margin-bottom: 4px;
                cursor: pointer;
                &:hover {
                    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.4);
                }
                .flag {
                    width: 32px;
                    height: 16px;
                    background: #ff296a;
                    border-radius: 3px;
                    color: #ffffff;
                    font-size: 12px;
                    line-height: 16px;
                    text-align: center;
                    position: absolute;
                    top: -8px;
                    right: -6px;
                }
            }
            .item:nth-child(3n + 2) {
                margin-left: 4px;
                margin-right: 4px;
            }
        }
    }
}
</style>
