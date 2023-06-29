<template>
    <li
        ref="shape"
        v-drag-in="dragInOptions"
        :style="{backgroundImage: getBackgroundImage(item.productTypeMap.path)}"
        class="eqc-shape-item-small"
        @mouseover="showPreview(item,$event)"
        @mouseleave="hidePreview(item)"
        @click="selectShape(item)"
    >
        <MaterialStar
            v-if="showStart"
            :item="item"
        />
        <MaterialOthers :item="item" />
    </li>
</template>

<script>
import elementType from '../../../../../config/enum.element.type'
import loader from '../../../../../utils/loader'
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
        }
    },
    data() {
        return {
            showStart: false, // 是不是展示收藏start
            timeoutId: null
        }
    },
    computed: {
        thumbSize() {
            return 80
        },
        viewSize() {
            return 180
        },
        eqxPage() {
            return this.$store.state.scene.eqxPage
        },
        scale() {
            return this.eqxPage.scale
        },
        dragInOptions() {
            return {
                types: [elementType.shape, elementType.image],
                textTypes: [],
                thumbSize: this.thumbSize,
                viewSize: this.viewSize,
                path: this.item.productTypeMap.path,
                qiniuPath: this.item.productTypeMap.path,
                onDragEnd: this.onDragEnd,
                item: this.item
            }
        },
        showComponentWarning() {
            return this.user.allow('showComponentWarning')
        },
        previewAuthor() {
            return Vue.store.state.layout.materialConfig.previewAuthor
        }
    },
    mounted() {
        this.item.elementType = elementType.shape
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
                    itemCopy.elementType = elementType.image
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
        addElement(type, src, left = 0, top = 0, items, width, height, ignoreFlag) {
            const scale = this.scale
            const viewScale = width / height
            let newWidth = 0
            let newHeight = 0
            if (viewScale > 1) {
                newWidth = this.viewSize / scale
                newHeight = newWidth / viewScale
            } else {
                newHeight = this.viewSize / scale
                newWidth = newHeight * viewScale
            }
            if (type === 'click') {
                const result = this.eqxPage.getElementPosOfCenter(newWidth, newHeight, scale)
                left = result.left
                top = result.top
            }
            const elementJson = {
                type: elementType.shape,
                property: {
                    items,
                    url: src,
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
                    gradient: {
                        angle: 90,
                        colors: { 0: '#5D61FF', 1: '#FF15F5' },
                        enabled: false
                    }
                },
                css: {
                    left: Math.round(left) + 'px',
                    top: Math.round(top) + 'px',
                    width: ignoreFlag ? Math.round(width) + 'px' : Math.round(newWidth) + 'px',
                    height: ignoreFlag ? Math.round(height) + 'px' : Math.round(newHeight) + 'px'
                }
            }
            if (this.showComponentWarning) {
                Vue.notifier.warn('APP和小程序无法支持svg文件', 8)
            }

            this.eqxPage.addElement(elementJson)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        getSvg(src) {
            return loader.svg(src)
                .then($svg => {
                    const width = parseFloat($svg.attr('width'))
                    const height = parseFloat($svg.attr('height'))
                    const $paths = $svg.querySelectorAll("[fill], [style*='fill:']")
                    const items = this.getShapeItems($paths)

                    return { $svg, width, height, items, $paths }
                })
        },
        getShapeItems($paths) {
            const items = []

            // 形状颜色是否可设置的限制条件
            if ($paths.length < 6) {
                $paths.forEach($path => {
                    const styleFill = $path.css('fill')
                    const attrFill = $path.attr('fill')
                    const fill = styleFill || attrFill || 'rgba(0,0,0,0)'
                    items.push({ fill })
                })
            }
            return items
        },
        selectShape(item) {
            pay.checkPayBeforeAdd(item).then(() => {
                this.getSvg(item.productTypeMap.path)
                    .then(svg => {
                        this.addElement('click', item.productTypeMap.path, 0, 0, svg.items, svg.width, svg.height)
                    })
            }).catch(err => err && Vue.logger.error(err))
        },
        onDragEnd(type, result) {
            if (type === 'add') {
                this.getSvg(result.path)
                    .then(svg => {
                        this.addElement('drag', result.path, result.left, result.top, svg.items, svg.width, svg.height)
                    })
            } else if (type === 'replace') {
                const eqxElement = result.eqxElement
                const eleType = eqxElement.elementJson.type
                if (eleType === elementType.shape) {
                    eqxElement.$el.innerHTML = ''
                    eqxElement.setSvg(result.path)
                        .then(() => {
                            const items = this.getShapeItems(eqxElement.$paths)
                            const property = {
                                items: items,
                                url: result.path
                            }
                            eqxElement.updateProperty(property)
                            this.eqxPage.eqxHistory.add(this.eqxPage)
                        })
                } else if (eleType === elementType.image) {
                    // 新增添加的  去掉原来的
                    this.getSvg(result.path)
                        .then(svg => {
                            const left = parseFloat(eqxElement.elementJson.css.left)
                            const top = parseFloat(eqxElement.elementJson.css.top)
                            const width = parseFloat(eqxElement.elementJson.css.width)
                            const height = parseFloat(eqxElement.elementJson.css.height)
                            this.addElement('drag', result.path, left, top, svg.items, width, height, true)
                        })
                    this.eqxPage.deleteElements([eqxElement])
                    this.eqxPage.eqxHistory.add(this.eqxPage)
                }
            }
        },
        getBackgroundImage(src) {
            return Vue.filter('backgroundImage')(src)
        }
    }
}
</script>

<style lang="scss">
.eqc-shape-item-small {
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
    &:hover {
        box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.16);
        border-radius: 3px;
    }
    &::after {
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
}
</style>
