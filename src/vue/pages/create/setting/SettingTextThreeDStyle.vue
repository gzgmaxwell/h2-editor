<template>
    <div
        id="text-three-d-style-layer"
        :style="getPositionStyle"
        class="eqc-setting-text-three-d-style"
    >
        <div
            v-drag-style-layer="{target: '#text-three-d-style-layer', container: '.eqc-create'}"
            class="head"
        >
            <span>特效</span>
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
                    v-for="(item, index) of textThreeDStyleLayer.styleList"
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
        <a
            class="feedback"
            href="//h5.ebdan.net/ls/hr75rdpJ"
            target="_blank"
        >没有想要的特效？</a>
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
                left: (document.body.clientWidth - 184 - 238) + 'px',
                top: '61px'
            }
        },
        eqxElementsSelected() {
            return this.$store.state.scene.eqxElementsSelected
        },
        eqxElement() {
            return this.eqxElementsSelected[0]
        },
        // 3D文字特效选择框
        textThreeDStyleLayer() {
            return this.$store.state.fontStyle.textThreeDStyle
        }
    },
    methods: {
        getBackgroundImage(pStyleItem) {
            return `url('${pStyleItem.cover}')`
        },
        select(pStyleItem) {
            const property = this.eqxElement.elementJson.property
            // 文字颜色
            property.textColor = pStyleItem.style.textColor
            // 文字投影颜色
            property.textShadowColor = pStyleItem.style.textShadowColor
            // 挤出文本的厚度。默认值为50。
            property.textHeight = pStyleItem.style.textHeight
            // 斜角与原始文本轮廓之间的延伸距离。默认值为8。
            property.bevelSize = pStyleItem.style.bevelSize
            // 斜角偏移量
            property.bevelOffset = pStyleItem.style.bevelOffset
            // 设置为颜色
            property.textStyleType = textThreeDTextStyle.color
            // 应用样式
            this.eqxElement.updateGeometry(property)
        },
        close() {
            this.$store.commit('TEXT_THREED_STYLE_LAYER', { show: false })
        }
    }
}
</script>

<style lang="scss">
.eqc-setting-text-three-d-style {
    position: fixed;
    width: 238px;
    height: calc(100% - 60px);
    font-size: 12px;
    background: #fdfdfd;
    z-index: 93;
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
    .content {
        position: relative;
        height: calc(100% - 96px);
        .list {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: flex-start;
            align-items: center;
            .item {
                width: 96px;
                height: 44px;
                margin: 8px 10px 8px 10px;
                background: #ffffff center/contain no-repeat;
                position: relative;
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
            .item:nth-child(even) {
                margin: 8px 12px 8px 4px;
            }
        }
    }
    .feedback {
        width: 100%;
        height: 48px;
        border-top: 1px solid #ccd5db;
        position: absolute;
        bottom: 0;
        left: 0;
        text-align: center;
        line-height: 48px;
        &:hover {
            color: #1593ff;
        }
    }
}
</style>
