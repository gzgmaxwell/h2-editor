<template>
    <li
        ref="frame"
        class="eqc-photo-crop-svg-item"
        @click="selected(item)"
    />
</template>

<script>
import loader from '../../../../../utils/loader'
import imgSrc from '../../../../../img/frame.svg'
export default {
    props: {
        item: {
            type: Object,
            default: null
        },
        selected: {
            type: Function,
            default: () => {}
        }
    },
    data() {
        return {
            svgHtml: ''
        }
    },
    computed: {
    },
    mounted() {
        this.formatSvg(this.item.productTypeMap.path)
    },
    methods: {
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
                    style: 'width: 54px;height: 54px'
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
        }
    }
}
</script>

<style lang="scss">
.eqc-photo-crop-svg-item {
    position: relative;
    width: 54px;
    height: 54px;
    margin-top: 8px;
    background: #ffffff center/contain no-repeat;
    // box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.16);
    border-radius: 3px;
    cursor: pointer;
    &:hover {
        // box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.16);
        border-radius: 3px;
    }
}
</style>
