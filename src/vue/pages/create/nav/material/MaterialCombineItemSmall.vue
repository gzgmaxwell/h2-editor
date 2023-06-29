<template>
    <li
        ref="combine"
        :style="{backgroundImage: getBackgroundImage(item)}"
        class="eqc-combine-item-small"
        @mouseover="showPreview(item,$event)"
        @mouseleave="hidePreview(item)"
        @click="selectCombineElement(item)"
    >
        <MaterialStar
            v-if="showStart"
            :item="item"
        />
        <MaterialOthers :item="item" />
        <i
            v-show="isManage"
            :class="{active: item.isSelected}"
            class="select eqf-yes"
        />
    </li>
</template>

<script>
import translate2h2 from '../../../../../utils/translate2h2'
import combineInitor from '../../workspace/combine.box.js'
import elementType from '../../../../../config/enum.element.type'
import MaterialStar from './MaterialStar.vue'
import MaterialOthers from './MaterialOthers.vue'
import pay from './pay.js'
export default {
    components: {
        MaterialStar, MaterialOthers
    },
    props: {
        item: {
            type: Object,
            default: null
        },
        isManage: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            showStart: false, // 是不是展示收藏start
            timeoutId: null,
            eqxElements: [] // 需要绘制的组合元素数组
        }
    },
    computed: {
        eqxPage() {
            return this.$store.state.scene.eqxPage
        },
        eqxElementsSelected() {
            return this.$store.state.scene.eqxElementsSelected
        },
        previewAuthor() {
            return Vue.store.state.layout.materialConfig.previewAuthor
        }
    },
    mounted() {
        this.item.elementType = elementType.combine
    },
    methods: {
        // 预览展示
        showPreview(item, $event) {
            this.showStart = true
            if (this.previewAuthor) {
                clearTimeout(this.timeoutId)
                this.timeoutId = setTimeout(() => {
                    const height = $event.clientY - $event.offsetY
                    const itemCopy = JSON.parse(JSON.stringify(item))
                    itemCopy.elementType = elementType.combine
                    this.$store.commit('MATERIAL_ITEM_PREVIEW', { show: true, item: itemCopy, height })
                }, 300)
            }
        },
        // 预览关闭
        hidePreview(item) {
            this.showStart = false
            if (this.previewAuthor) {
                clearTimeout(this.timeoutId)
                this.timeoutId = setTimeout(() => {
                    this.$store.commit('MATERIAL_ITEM_PREVIEW', { show: false })
                }, 300)
            }
        },
        addElement(h2ElementsJson) {
            // 绘制到页面中
            Vue.store.commit('HISTORY_NO_FLAG', true)
            const eqxElements = this.eqxPage.addElements(h2ElementsJson)
            Vue.store.commit('ELEMENT_SELECT', { eqxElements })
            this.eqxElements = eqxElements
            // TODO：组合起来
            this.combine()
        },
        selectCombineElement(item) {
            pay.checkPayBeforeAdd(item).then(() => {
                if (!Object.prototype.hasOwnProperty.call(item, 'sourceId')) {
                    Vue.notifier.info('未找到sourceId')
                    return
                }
                if (item.sourceId === null) {
                    Vue.notifier.info('sourceId为空')
                    return
                }
                this.requestCombineElementData(item.sourceId)
                    .then((h5Elements) => {
                    // 转换h5数据为h2
                        let { h2Elements, elementFonts } = translate2h2(h5Elements)
                        this.addElement(h2Elements)
                        if (elementFonts && elementFonts.length > 0) {
                        // 去掉默认字体
                            elementFonts = elementFonts.filter((v, i) => v !== '')
                            if (elementFonts.length > 0) {
                            // 请求字体
                                const fonts = { fontFamily: elementFonts }
                                this.requestTextFont(fonts)
                            }
                        }
                    })
                    .catch(err => {
                        Vue.notifier.info('sourceId为空')
                        console.log(err)
                    })
            }).catch(err => err && Vue.logger.error(err))
        },
        requestCombineElementData(sourceId) {
            return new Promise((resolve, reject) => {
                Vue.api.product.getCombineElementDetail(sourceId)
                    .then((res) => {
                        if (res.data && res.data.success) {
                            resolve(res.data.obj)
                        } else {
                            reject(res.data.msg)
                        }
                    }).catch((err) => {
                        reject(err)
                    })
            })
        },
        requestTextFont(familys) {
            Vue.api.product.getFontDetailInfo(familys)
                .then((res) => {
                    if (res.data && res.data.success) {
                        const fontInfos = res.data.obj
                        const realFontFamily = []
                        if (fontInfos) {
                            for (const key in fontInfos) {
                                const item = fontInfos[key]
                                if (item) {
                                    realFontFamily.push({ src: item.woff_path, name: item.name, fontfamily: item.font_family })
                                }
                            }
                        }
                        // 更新对应组件字体样式
                        this.eqxElements.map((ele, i) => {
                            const eleFontFamily = ele.elementJson.css.fontFamily
                            if (eleFontFamily) {
                                const fontInfo = realFontFamily.filter((v, i) => v.fontfamily === eleFontFamily)
                                const fontSrc = fontInfo && fontInfo.length > 0 ? fontInfo[0].src : null
                                if (fontSrc) {
                                    ele.elementJson.property.src = fontSrc
                                    ele.createFontFace()
                                }
                            }
                        })
                    } else {
                        console.log(res.data.msg)
                    }
                })
        },
        combine() {
            const cb = combineInitor.initCombine(this.eqxElementsSelected, this.eqxPage)
            if (cb) {
                cb.isCombine = true
                cb.flatCombine(cb, this.eqxPage)
                this.eqxPage.eqxHistory.add(this.eqxPage)
            }
        },
        getBackgroundImage(pItem) {
            let src = ''
            if (Object.prototype.hasOwnProperty.call(pItem.productTypeMap, 'thumbSrc')) {
                src = pItem.productTypeMap.thumbSrc
            } else if (Object.prototype.hasOwnProperty.call(pItem.productTypeMap, 'tmbPath')) {
                src = pItem.productTypeMap.tmbPath
            }
            src = this.getQiniuImage(src)
            return Vue.filter('backgroundImage')(src)
        },
        getQiniuImage(src) {
            return Vue.filter('qiniuZoom')(src, this.thumbSize)
        }
    }
}
</script>

<style lang="scss">
.eqc-combine-item-small {
    position: relative;
    width: 80px;
    height: 80px;
    margin-top: 8px;
    background: #ffffff center/contain no-repeat;
    box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.16);
    border-radius: 3px;
    cursor: pointer;
    &:nth-child(1),
    &:nth-child(2),
    &:nth-child(3) {
        margin-top: 0;
    }
    &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: #000;
        opacity: 0;
        transition: all 0.3s;
    }
    &:hover {
        box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.16);
        border-radius: 3px;
        .menu {
            display: block;
        }
    }
    .menu {
        position: absolute;
        right: 0;
        top: 0;
        display: none;
        .icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            color: #fff;
            background: #2f3c4d;
            border-radius: 3px;
            transition: all 0.3s;
            &:not(:first-child) {
                margin-top: 6px;
            }
            &:hover {
                background: $blue-normal;
                &.delete {
                    background: #ff296a;
                }
            }
        }
    }
    .select {
        position: absolute;
        right: 6px;
        top: 6px;
        width: 24px;
        height: 24px;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        font-size: 16px;
        color: #fff;
        background: #2f3c4d;
        transition: all 0.3s;
        &:hover,
        &.active {
            background: $blue-normal;
        }
    }
}
</style>
