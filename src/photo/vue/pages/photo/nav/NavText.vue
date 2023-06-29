<template>
    <div class="eqc-photo-nav-text">
        <div
            class="text doc-title"
            @click="addText(list[0])"
        >
            标题
        </div>
        <div
            class="text doc-sub-title"
            @click="addText(list[1])"
        >
            副标题
        </div>
        <div
            class="text doc-body"
            @click="addText(list[2])"
        >
            正文
        </div>
    </div>
</template>

<script>
import elementType from '../../../../../config/enum.element.type'
import textType from '../../../../../config/enum.text.type'
import historyType from '../../../../../config/enum.photoHistory.type'

export default {
    data() {
        return {
            historyType,
            list: [{
                text: '标题',
                height: 60,
                property: {
                    fontstylename: '无样式',
                    type: textType.text,
                    dropShadow: {
                        color: 'rgba(0,0,0,0)',
                        x: 0,
                        y: 0,
                        blur: 0,
                        transparency: 100
                    },
                    angle: 45,
                    cube: [{ size: 0, color: '#FF2A6A' }],
                    stroke: {
                        size: 0,
                        color: '#5D61FF',
                        distance: 0
                    },
                    borderRadius: {
                        lt: true,
                        rt: true,
                        lb: true,
                        rb: true,
                        val: 0
                    }
                },
                css: {
                    fontSize: '34px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#000000'
                },
                style: {
                    fontSize: '18px',
                    color: '#000000',
                    fontWeight: 'bold'
                }
            }, {
                text: '副标题',
                height: 52,
                property: {
                    fontstylename: '无样式',
                    type: textType.text,
                    dropShadow: {
                        color: 'rgba(0,0,0,0)',
                        x: 0,
                        y: 0,
                        blur: 0,
                        transparency: 100
                    },
                    angle: 45,
                    cube: [{ size: 0, color: '#FF2A6A' }],
                    stroke: {
                        size: 0,
                        color: '#5D61FF',
                        distance: 0
                    },
                    borderRadius: {
                        lt: true,
                        rt: true,
                        lb: true,
                        rb: true,
                        val: 0
                    }
                },
                css: {
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#000000'
                },
                style: {
                    fontSize: '16px',
                    color: '#000000',
                    fontWeight: 'bold'
                }
            }, {
                text: '正文',
                height: 36,
                property: {
                    fontstylename: '无样式',
                    type: textType.text,
                    dropShadow: {
                        color: 'rgba(0,0,0,0)',
                        x: 0,
                        y: 0,
                        blur: 0,
                        transparency: 100
                    },
                    angle: 45,
                    cube: [{ size: 0, color: '#FF2A6A' }],
                    stroke: {
                        size: 0,
                        color: '#5D61FF',
                        distance: 0
                    },
                    borderRadius: {
                        lt: true,
                        rt: true,
                        lb: true,
                        rb: true,
                        val: 0
                    }
                },
                css: {
                    fontSize: '16px',
                    textAlign: 'center',
                    color: '#000000',
                    fontWeight: '400'
                },
                style: {
                    fontSize: '14px',
                    color: '#000000'
                }
            }],
            font: {
                list: []
            }
        }
    },
    computed: {
        photoLayout() {
            return Vue.store.state.photoLayout
        },
        photoScene() {
            return Vue.store.state.photoScene
        },
        eqxScene() {
            return this.photoScene.eqxScene
        },
        eqxPage() {
            return this.photoScene.eqxPage
        },
        // 历史记录
        photoHistory() {
            return Vue.store.state.photoHistory
        },
        selectType() {
            return Vue.store.state.photoLayout.nav.selectedItem.type
        }
    },
    created() {
        this.getProductsFont()
    },
    methods: {
        getProductsFont() {
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
                })
                .catch(err => err && this.logger.error(err))
        },
        addText(item) {
            item = JSON.parse(JSON.stringify(item))
            const src = this.chooseFont(item)
            const scale = this.eqxPage.scale
            const padding = 4 / scale
            const fontSize = parseInt(item.css.fontSize || 36) / scale
            const lineHeigt = 1.2
            const width = 280 / scale
            const height = fontSize * lineHeigt
            const { left, top } = this.eqxPage.getElementPosOfCenter(width + padding * 2, height + padding * 2, scale)
            if (src) {
                item.property.src = src
            }
            if (item.property.shadow) {
                item.property.shadow.h = Math.round(item.property.shadow.h / scale)
                item.property.shadow.v = Math.round(item.property.shadow.v / scale)
                item.property.shadow.blur = Math.round(item.property.shadow.blur / scale)
            }
            if (item.property.cube) {
                item.property.cube[0].size = Math.round(item.property.cube[0].size / scale)
            }
            if (item.property.shake) {
                item.property.shake.size = Math.round(item.property.shake.size / scale)
            }
            if (item.property.stroke) {
                item.property.stroke.size = Math.round(item.property.stroke.size / scale)
            }
            const elementJson = {
                type: elementType.photoText,
                property: {
                    content: '双击进行编辑'
                },
                css: {
                    left: Math.round(left) + 'px',
                    top: Math.round(top) + 'px',
                    width: Math.round(width) + 'px',
                    height: Math.round(height) + 'px',
                    padding: Math.round(padding) + 'px',
                    border: '1px solid transparent'
                }
            }
            if (item.css.fontFamily) {
                item.css.fontFamily = item.css.fontFamily.replace(this.preArt, '')
            }
            Object.assign(elementJson.css, item.css, { fontSize: Math.round(fontSize) + 'px' })
            Object.assign(elementJson.property, item.property)
            this.eqxPage.addElement(elementJson)
        },
        chooseFont(item) {
            const fontList = this.font.list
            let src = ''
            for (let i = 0; i < fontList.length; i++) {
                if (fontList[i] && fontList[i].fontFamily === item.css.fontFamily) {
                    if (fontList[i].src && !document.querySelector('#' + fontList[i].fontFamilyReal)) {
                        src = fontList[i].src
                        const $style = document.createElement('style')
                        $style.id = fontList[i].fontFamilyReal
                        $style.innerHTML = `@font-face{font-family: "${fontList[i].fontFamilyReal}";src: url(${this.env.host.file + fontList[i].src}) format("woff")}\r\n`
                        document.head.appendChild($style)
                    }
                }
            }
            return src
        }
    }
}
</script>

<style lang="scss">
.eqc-photo-nav-text {
    padding: 24px;
    .text {
        width: 240px;
        height: 44px;
        background: rgba(255, 255, 255, 1);
        border-radius: 3px;
        border: 1px solid rgba(204, 213, 219, 1);
        text-align: center;
        line-height: 42px;
        cursor: pointer;
        transition: all 0.3s;
        &:hover {
            box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.16);
        }
    }
    .doc-title {
        font-size: 18px;
        font-weight: 600;
        color: rgba(29, 32, 37, 1);
    }
    .doc-sub-title {
        font-size: 16px;
        font-weight: 600;
        color: rgba(29, 32, 37, 1);
        margin-top: 12px;
    }
    .doc-body {
        font-size: 16px;
        font-weight: 400;
        color: rgba(29, 32, 37, 1);
        margin-top: 12px;
    }
}
</style>
