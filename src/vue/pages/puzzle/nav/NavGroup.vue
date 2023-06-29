<template>
    <div class="eqc-puzzle-nav-group">
        <div
            v-scroll-bar
            class="list"
        >
            <ul
                class="list-warp"
            >
                <li
                    v-for="(item,i) of groupList"
                    :ref="`group${i}`"
                    :key="i"
                    @click="selectGroup(item)"
                />
            </ul>
        </div>
        <a
            class="feedback"
            href="//h5.ebdan.net/ls/LGdSNor9"
            target="_blank"
        >没有想要的拼图？</a>
    </div>
</template>

<script>
import groupList from './groupList'
import loader from '../../../../utils/loader'
import defualtFrameImgSrc from '../../../../img/frame.svg'
import elementType from '../../../../config/enum.element.type'

export default {
    components: {

    },
    props: {

    },
    data() {
        return {
            groupList
        }
    },
    computed: {
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        scene() {
            return Vue.store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        scale() {
            return this.eqxPage.scale
        },
        eqxElements() { // 页面元素
            return this.eqxPage.eqxElements
        },
        eqxBackground() { // 页面背景
            return this.eqxPage.eqxBackground
        }
    },
    watch: {

    },
    mounted() {
        for (let i = 0; i < groupList.length; i++) {
            this.formatSvg(groupList[i].url, `group${i}`)
        }
    },
    methods: {
        selectGroup(item) {
            if (item.url) {
                this.addElement(item.url)
            }
        },
        updateImageAttr($svg) {
            const cps = $svg.querySelectorAll('.insideG')
            for (let i = 0; i < cps.length; i++) {
                const $clip = cps[i]
                const { x, y, width, height } = $clip.getBBox()
                const imageId = `#${$clip.attr('data')}_img`
                const $image = $svg.querySelector(imageId)
                if ($image) {
                    $image.attr({ x })
                    $image.attr({ y })
                    if (width > height) {
                        $image.attr({ width })
                    } else {
                        $image.attr({ height })
                    }
                }
            }
        },
        formatSvg(url, groupRef) {
            loader.svg(url).then(($svgTemp) => {
                const $clips = $svgTemp.getElementsByTagName('g') // 获取clips
                const $svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
                const width = parseFloat($svgTemp.attr('width'))
                const height = parseFloat($svgTemp.attr('height'))
                const svgName = 'group' + new Date().getTime()
                $svg.css({
                    width: '100%',
                    height: '100%'
                }).attr({
                    width,
                    height,
                    opacity: 1,
                    viewBox: `0 0 ${width} ${height}`,
                    preserveAspectRatio: 'none'
                })

                let tempHtml = ''
                for (let i = 0; i < $clips.length; i++) {
                    const image = `<image  id="${svgName}_${i}_img"  xlink:href='${defualtFrameImgSrc}'/>`
                    tempHtml += `<g>
                                    <g class="insideG" data="${svgName}_${i}" opacity="0">
                                        ${$clips[i].innerHTML}
                                    </g>
                                    <g>
                                        <defs>
                                            <clipPath class="clip" id="${svgName}_${i}">
                                            ${$clips[i].innerHTML}
                                            </clipPath>
                                        </defs>
                                        <g  style="clip-path:url(#${svgName}_${i})">
                                            ${image}
                                        </g>
                                    </g>
                                </g>`
                }
                $svg.innerHTML = tempHtml
                this.$refs[groupRef][0].appendChild($svg)
                this.updateImageAttr($svg)
            })
        },
        // 替换拼图时保留已插入的图片
        // 1、重新以新拼图各部分位置大小计算frame
        formatFrames() {
            const eqxElement = this.eqxElements[0]
            const { frames } = eqxElement.elementJson.property
            const { width, height } = eqxElement.elementJson.css
            const target = {
                width: parseInt(width),
                height: parseInt(height)
            }

            const framesData = []
            for (let i = 0; i < frames.length; i++) {
                const frame = frames[i]
                const img = frame.img
                const crop = {
                    left: 0,
                    top: 0,
                    width: img.width,
                    height: img.height
                }
                // 拖拽到容器的图片居中显示
                const imgRatio = img.width / img.height
                const targetRatio = target.width / target.height
                // 拖拽的图片比容器宽，横向细长型
                if (imgRatio > targetRatio) {
                    crop.width = Math.round(img.height * targetRatio)
                    crop.left = Math.round((img.width - crop.width) / 2)
                } else {
                    crop.height = Math.round(img.width / targetRatio)
                    crop.top = Math.round((img.height - crop.height) / 2)
                }
                framesData.push({
                    src: frame.src,
                    crop,
                    img: {
                        width: img.width,
                        height: img.height
                    }
                })
            }
            return framesData
        },
        addElement(src) {
            let framesData = []
            // clear page first if alreay has puzzle element
            if (this.eqxElements.length > 0) {
                framesData = this.formatFrames()
                this.eqxPage.clearPage()
                Vue.store.commit('ELEMENT_SELECT', { eqxElements: [] })
            } else {
                this.eqxBackground.clearBackground()
            }

            const result = this.eqxPage.getElementPosOfCenter(800, 800, this.scale)
            const left = result.left
            const top = result.top
            const elementJson = {
                type: elementType.puzzle,
                property: {
                    src, // svg url
                    name: 'puzzle' + new Date().getTime(), // name
                    frames: framesData // 存放每一块数据
                },
                css: {
                    left: left + 'px',
                    top: top + 'px',
                    width: '800px',
                    height: '800px'
                }
            }
            this.eqxPage.addElement(elementJson)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        }
    }
}
</script>

<style lang="scss">
.eqc-puzzle-nav-group {
    position: relative;
    background-color: #ffffff;
    width: 100%;
    height: 100%;
    .list {
        position: relative;
        padding: 16px;
        height: calc(100% - 48px);
        .list-warp {
            display: flex;
            flex-wrap: wrap;
            > li {
                width: 124px;
                height: 124px;
                background: rgba(246, 249, 250, 1);
                margin: 0 0 8px 8px;
                cursor: pointer;
                &:nth-child(odd) {
                    margin-left: 0;
                }
                &:hover {
                    box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.16);
                }
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
        background: #ffffff;
        &:hover {
            color: #1593ff;
        }
    }
}
</style>
