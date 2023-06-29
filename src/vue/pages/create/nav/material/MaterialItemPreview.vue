<template>
    <div
        :style="{top:materialItem.height+'px'}"
        class="eqc-material-item-preview"
    >
        <transition name="rotate-y-left">
            <div
                v-if="materialItem.show"
                ref="preview"
                :style="{backgroundImage: materialItem.item.elementType !== 105? getBackgroundImage(materialItem.item):''}"
                class="preview-area"
                @mouseleave="mouseleave"
            />
        </transition>
    </div>
</template>
<script>
import elementType from '../../../../../config/enum.element.type'
import loader from '../../../../../utils/loader'
import imgSrc from '../../../../../img/frame.svg'
export default {
    data() {
        return {
            isFormFrameState: false// 是否形成了frame
        }
    },
    computed: {
        materialItem() {
            return Vue.store.state.layout.materialItem
        }
    },
    watch: {
        materialItem: {
            handler(newVal, oldVal) {
                if (this.materialItem.item) {
                    const type = this.materialItem.item.elementType
                    if (type === elementType.frame && !this.isFormFrameState) {
                        this.formatSvg(this.materialItem.item.productTypeMap.path)
                        this.isFormFrameState = true
                    } else {
                        if (this.$refs.preview) {
                            this.$refs.preview.innerHTML = ''
                        }
                    }
                }
                if (!this.materialItem.show) {
                    // 关闭的时候
                    this.isFormFrameState = false
                }
            },
            deep: true
        }
    },
    methods: {
        mouseleave() {
            Vue.store.commit('MATERIAL_ITEM_PREVIEW', { show: false })
        },
        getQiniuImage(src) {
            return Vue.filter('qiniuZoom')(src, 200)
        },
        getBackgroundImage(pItem) {
            let src = ''
            // 做个兼容处理
            if (pItem.productTypeMap) {
                if (pItem.elementType === elementType.combine) {
                    if (Object.prototype.hasOwnProperty.call(pItem.productTypeMap, 'thumbSrc')) {
                        src = pItem.productTypeMap.thumbSrc
                    } else if (Object.prototype.hasOwnProperty.call(pItem.productTypeMap, 'tmbPath')) {
                        src = pItem.productTypeMap.tmbPath
                    }
                } else if (pItem.elementType === elementType.image) {
                    src = pItem.productTypeMap.path
                } else if (pItem.elementType === elementType.shape) {
                    return Vue.filter('backgroundImage')(pItem.productTypeMap.path)
                }
            } else {
                src = pItem.path
            }

            src = this.getQiniuImage(src)
            return Vue.filter('backgroundImage')(src)
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
                    style: 'width: 200px;height: 200px'
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
                this.$refs.preview.appendChild(this.svgHtml)
            })
        }
    }
}
</script>
<style lang="scss">
.eqc-material-item-preview {
    position: absolute;
    left: 288px;
    top: 500px;
    z-index: 4;
    transition: all 0.3s;
    perspective: 640px;
    .preview-area {
        width: 200px;
        height: 200px;
        position: relative;
        background: #f7f8f9 no-repeat center/contain;
        box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
        transform-origin: left;
    }
}
</style>
