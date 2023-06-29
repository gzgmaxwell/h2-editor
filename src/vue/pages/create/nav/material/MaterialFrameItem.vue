<template>
    <li
        ref="frame"
        v-drag-in="dragInOptions"
        class="eqc-frame-item"
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
import imgSrc from '../../../../../img/frame.svg'
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
            timeoutId: null,
            svgHtml: ''
        }
    },
    computed: {
        thumbSize() {
            return 124
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
            const path = this.item.productTypeMap ? this.item.productTypeMap.path : this.item.path
            return {
                types: [elementType.frame],
                textTypes: [],
                thumbSize: this.thumbSize,
                viewSize: this.viewSize,
                path: path,
                qiniuPath: path,
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
        this.item.elementType = elementType.frame
        // 兼容处理
        if (this.item.productTypeMap) {
            this.formatSvg(this.item.productTypeMap.path)
        } else {
            this.formatSvg(this.item.path)
        }
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
                    itemCopy.elementType = elementType.frame
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
        addElement(type, src, left = 0, top = 0, width, height) {
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
                type: elementType.frame,
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
                    }
                },
                css: {
                    left: Math.round(left) + 'px',
                    top: Math.round(top) + 'px',
                    width: Math.round(newWidth) + 'px',
                    height: Math.round(newHeight) + 'px'
                }
            }
            if (this.showComponentWarning) {
                Vue.notifier.warn('APP和小程序暂不支持图片容器', 8)
            }
            this.eqxPage.addElement(elementJson)
            this.eqxPage.eqxHistory.add(this.eqxPage)

            // 打开帮助提示框
            this.helpnotifier.open('frame', '从左侧素材或上传中拖动图片可进行替换')
        },
        formatSvg(url) {
            loader.svg(url).then(($svgTemp) => {
                // 从xml中筛选出svg元素，没有直接用这个svg而是新创建了一个，是为了setScale
                const $svg = this.svgHtml = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
                const width = parseFloat($svgTemp.attr('width'))
                const height = parseFloat($svgTemp.attr('height'))
                let image = `<image width='${width}'  xlink:href='${imgSrc}'/>`
                if (width < height) {
                    image = `<image height='${height}'  xlink:href='${imgSrc}'/>`
                }
                $svg.attr({
                    width,
                    height,
                    viewBox: `0 0 ${width} ${height}`,
                    style: 'width: 124px;height: 124px'
                })
                    .innerHTML = `
                            <g>
                                <defs>
                                    <clipPath   id="${url}">
                                    ${$svgTemp.innerHTML}
                                    </clipPath>
                                </defs>

                                <g  style="clip-path:url(#${url})" >
                                    ${image}
                                </g>
                            </g>
                `
                this.$refs.frame.appendChild(this.svgHtml)
            })
        },
        getSvg(src) {
            return loader.svg(src)
                .then($svg => {
                    const width = parseFloat($svg.attr('width'))
                    const height = parseFloat($svg.attr('height'))
                    return { $svg, width, height }
                })
        },
        selectShape(item) {
            pay.checkPayBeforeAdd(item).then(() => {
                const path = item.productTypeMap ? item.productTypeMap.path : item.path
                this.getSvg(path)
                    .then(svg => {
                        this.addElement('click', path, 0, 0, svg.width, svg.height)
                    })
            }).catch(err => err && Vue.logger.error(err))
        },
        onDragEnd(type, result) {
            if (type === 'add') {
                this.getSvg(result.path)
                    .then(svg => {
                        this.addElement('drag', result.path, result.left, result.top, svg.width, svg.height)
                    })
            } else if (type === 'replace') {
                const eqxElement = result.eqxElement
                eqxElement.$el.innerHTML = ''
                eqxElement.setSvg(result.path)
                    .then(() => {
                        const property = {
                            src: result.path,
                            frames: undefined
                        }
                        result.eqxElement.updateProperty(property)
                        this.eqxPage.eqxHistory.add(this.eqxPage)
                    })
            }
        },
        getBackgroundImage(src) {
            return Vue.filter('backgroundImage')(src)
        }
    }
}
</script>

<style lang="scss">
.eqc-frame-item {
    position: relative;
    width: 124px;
    height: 124px;
    margin-top: 8px;
    background: #ffffff center/contain no-repeat;
    box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.16);
    border-radius: 3px;
    cursor: pointer;
    &:nth-child(1),
    &:nth-child(2) {
        margin-top: 0;
    }
    // &::after {
    //     content: "";
    //     position: absolute;
    //     left: 0;
    //     top: 0;
    //     width: 100%;
    //     height: 100%;
    //     background: #000;
    //     opacity: 0;
    //     transition: all 0.3s;
    // }
    &:hover {
        box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.16);
        border-radius: 3px;
    }
}
</style>
