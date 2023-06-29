<template>
    <div
        id="font-style-layer"
        :style="getPositionStyle"
        class="eqc-setting-font-style"
    >
        <div
            v-drag-style-layer="{target: '#font-style-layer', container: '.eqc-create'}"
            class="head"
        >
            <span>文字样式</span>
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
                    v-for="(item, index) of list"
                    :key="index"
                    :style="{backgroundImage: getBackgroundImage(index,item.cover)}"
                    :data-hint="showWarning(item) ? 'APP不支持该特效':''"
                    :class="[{'hint--bottom':showWarning(item)},{'hint--rounded':showWarning(item)}]"
                    class="item"
                    @click="select($event, item)"
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
import textType from '../../../../config/enum.text.type'
import init from '../../../../core/html/element/text'
import { host } from '../../../../config/env'
export default {
    directives: {
        dragStyleLayer
    },
    data() {
        return {
            list: []// 经过处理后的样式库数据
        }
    },
    computed: {
        scene() {
            return this.$store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        eqxElementsSelected() {
            return this.scene.eqxElementsSelected
        },
        eqxElement() {
            return this.eqxElementsSelected[0]
        },
        property() {
            return this.eqxElement.elementJson.property
        },
        fontStyle() {
            return this.$store.state.fontStyle
        },
        styleList() {
            return this.fontStyle.list
        },
        // 获取所在位置
        getPositionStyle() {
            return {
                left: (document.body.clientWidth - 184 - 232) + 'px',
                top: '61px'
            }
        }
    },
    created() {
        this.formatStyleList()
    },
    methods: {
        showWarning(item) {
            const { property: { stroke } } = item
            const res = Vue.user.allow('showComponentWarning') && stroke && stroke.distance > 0 && stroke.size > 0
            return res
        },
        getBackgroundImage(index, src) {
            src = Vue.filter('qiniuZoom')(src, 96)
            if (index === 0) {
                return Vue.filter('backgroundImage')(null, src)
            } else {
                return Vue.filter('backgroundImage')(src)
            }
        },
        close() {
            this.$store.commit('FONT_STYLE_LAYER', { show: false })
        },
        formatStyleList() {
            this.list.push(...JSON.parse(JSON.stringify(this.styleList)))

            for (let i = 0; i < this.list.length; i++) {
                let { property, css } = this.list[i]
                switch (property.type) {
                    case textType.shadow:
                        css.textShadow = init.dropShadow(property).textShadow
                        break
                    case textType.gradient:
                        css.backgroundImage = init.gradient(property).backgroundImage
                        css = Object.assign(css, {
                            webkitBackgroundClip: 'text',
                            backgroundClip: 'text'
                        })
                        break
                    case textType.shake:
                        css.textShadow = init.shake(property).textShadow
                        break
                    case textType.cube:
                        css.textShadow = init.cube(property).textShadow
                        break
                    case textType.stroke:
                        css.textShadow = init.stroke(property).textShadow
                        break
                    case textType.chartlet:
                        css = Object.assign(css, {
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                            webkitBackgroundClip: 'text',
                            backgroundClip: 'text'
                        })
                        break
                }
            }
        },
        select(e, item) {
            const scale = this.eqxPage.scale
            const selectedItem = JSON.parse(JSON.stringify(item))
            this.$store.commit('FONT_STYLE_SELECTED', selectedItem)

            const { property, css, fontinfo, name } = selectedItem
            if (name) {
                property.fontstylename = name
                property.fontStyleImgPath = item.cover // 保留字体图片的路径
            }
            // 下载字体文件
            if (fontinfo && fontinfo.src && !document.querySelector('#' + fontinfo.fontFamilyReal)) {
                const $style = document.createElement('style')
                $style.id = fontinfo.fontFamilyReal
                $style.innerHTML = `@font-face{font-family: "${fontinfo.fontFamilyReal}";src: url(${host.file + fontinfo.src}) format("woff")}\r\n`
                document.head.appendChild($style)
                property.src = fontinfo.src
            }

            if (property.dropShadow) {
                property.dropShadow.x = Math.round(property.dropShadow.x / scale)
                property.dropShadow.y = Math.round(property.dropShadow.y / scale)
                property.dropShadow.blur = Math.round(property.dropShadow.blur / scale)
            }
            if (property.shadow) {
                property.shadow.h = Math.round(property.shadow.h / scale)
                property.shadow.v = Math.round(property.shadow.v / scale)
                property.shadow.blur = Math.round(property.shadow.blur / scale)
            }
            if (property.cube) {
                let cube = Math.round(property.cube[0].size / scale)
                if (cube > 50) {
                    cube = 50
                }
                property.cube[0].size = cube
            }
            if (property.shake) {
                property.shake.size = Math.round(property.shake.size / scale)
            }
            if (property.stroke) {
                let stroke = Math.round(property.stroke.size / scale)
                let distance = Math.round(property.stroke.distance / scale)
                if (stroke > 10) {
                    stroke = 10
                }
                if (distance > 10) {
                    distance = 10
                }
                if (property.type === textType.gradient) { // 渐变文字描边会占据文字大小需优化，暂时处理为0
                    stroke = 0
                    distance = 0
                }
                property.stroke.size = stroke
                property.stroke.distance = distance
            }

            // 如果文字类型不是贴图，渐变，颤抖这三种之一的，保留用户之前设置的圆角属性
            if ([textType.text, textType.shadow, textType.cube, textType.stroke].includes(property.type)) {
                if (this.eqxElement.elementJson.property.borderRadius) {
                    property.borderRadius = this.eqxElement.elementJson.property.borderRadius
                }
            }

            if (this.eqxElement.elementJson.type === 106) {
                this.eqxElement.virtualElement = {
                    property: Object.assign(this.eqxElement.virtualElement.property, property),
                    css: Object.assign(this.eqxElement.virtualElement.css, css)
                }
            } else {
                this.eqxElement.updateProperty(property)
                this.eqxElement.updateCss(css)
                this.eqxPage.eqxHistory.add(this.eqxPage)
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-setting-font-style {
    position: fixed;
    width: 232px;
    height: calc(100% - 60px);
    font-size: 12px;
    background: #fdfdfd;
    z-index: 93;
    // border-left: 1px solid #ccd5db;
    // border-right: 1px solid #ccd5db;
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
        height: calc(100% - 48px);
        .list {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: flex-start;
            align-items: center;
            padding-top: 8px;
            .item {
                width: 96px;
                height: 44px;
                margin: 8px 10px 8px 10px;
                background: #eceef0 center/contain no-repeat;
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
}
</style>
