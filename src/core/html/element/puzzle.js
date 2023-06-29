import EqxElement from '../element'
import elementType from '../../../config/enum.element.type'
import { host } from '../../../config/env'
import loader from '../../../utils/loader'
import imgToBase64 from '../../../utils/imgToBase64'
import defualtFrameImgSrc from '../../../img/frame.svg'

export default class EqxPuzzle extends EqxElement {
    constructor(elementJson, eqxPage) {
        super(eqxPage)
        // 如果有值则是已有组件，否则是新组件
        if (!elementJson.id) {
            const css = EqxElement.defaultCss
            const elements = eqxPage.pageJson.elements
            elementJson.id = EqxElement.newId(elements)
            elementJson.type = elementType.puzzle
            elementJson.css = Object.assign({
                left: css.left,
                top: css.top,
                width: css.width,
                height: css.height,
                opacity: css.opacity,
                transform: css.transform,
                display: css.display,
                borderWidth: css.borderWidth,
                borderStyle: css.borderStyle,
                borderColor: css.borderColor
            }, elementJson.css, { zIndex: EqxElement.newZIndex(elements) })
            elementJson.property = elementJson.property || {
                frames: [] // 拼图每一块数据
            }
        }
        this.elementJson = elementJson
        this.clipBox = null // clip编辑框
    }

    render() {
        super.render()
        const property = this.elementJson.property
        this.setSvg(property.name, property.src)
    }

    getClips($svgTemp) {
        return $svgTemp.getElementsByTagName('g')
    }

    getInnerHtml($clips, name, url) {
        let tempHtml = ''
        for (let i = 0; i < $clips.length; i++) {
            const image = `<image  id="${name}_${i}_img"  xlink:href='${url}'/>`
            tempHtml += `<g class="partG">
                                <g class="insideG" data="${name}_${i}" opacity="0">
                                    ${$clips[i].innerHTML}
                                </g>
                                <g>
                                    <defs>
                                        <clipPath class="clip" id="${name}_${i}">
                                            ${$clips[i].innerHTML}
                                        </clipPath>
                                    </defs>
                                    <g  style="clip-path:url(#${name}_${i})">
                                        ${image}
                                    </g>
                                </g>
                            </g>`
        }
        return tempHtml
    }

    setSvg(name, src) {
        const css = this.elementJson.css
        const newCss = Object.assign({}, css, {
            left: '', // 清除多余的样式
            top: '',
            transform: '',
            zIndex: '',
            verticalAlign: 'top',
            boxSizing: 'content-box'
        })

        return Promise.all([loader.svg(src), imgToBase64(defualtFrameImgSrc)]).then(([$svgTemp, url]) => {
            const $clips = this.getClips($svgTemp) // 获取clips
            const $svg = this.$svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
            const width = parseFloat($svgTemp.attr('width'))
            const height = parseFloat($svgTemp.attr('height'))

            $svg.css(newCss)
                .attr({
                    width,
                    height,
                    opacity: 0,
                    viewBox: `0 0 ${width} ${height}`,
                    preserveAspectRatio: 'none'
                })

            $svg.innerHTML = this.getInnerHtml($clips, name, url)
            this.$el.appendChild($svg)
            this.updateImageAttr()
            this.updateProperty(this.elementJson.property)
            this.$el.classList.add('h2-core-check-ele')
        })
    }

    updateImageAttr() {
        const cps = this.$svg.querySelectorAll('.insideG')
        const cpsData = []
        for (let i = 0; i < cps.length; i++) {
            const $clip = cps[i]
            const { x, y, width, height } = $clip.getBBox()
            cpsData.push({ x, y, width, height })
            const imageId = `#${$clip.attr('data')}_img`
            const $image = this.$svg.querySelector(imageId)
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

        this.elementJson.property.cpsData = cpsData
    }

    getImageSrc(frame) {
        let tail = ''
        if (frame.crop) {
            const { width, height, top, left } = frame.crop
            tail = `?imageMogr2/auto-orient/crop/!${width}x${height}a${left}a${top}`
        }
        return new Promise((resolve, reject) => {
            const imgSrc = host.file + frame.src + tail
            resolve(imgSrc)
        })
    }

    setImageSrc(frames) {
        for (let i = 0; i < frames.length; i++) {
            const curFrame = frames[i]
            if (curFrame.src !== '') {
                const name = this.elementJson.property.name
                const imageId = curFrame.imgId ? curFrame.imgId : `#${name}_${i}_img`
                const $image = this.$svg && this.$svg.querySelector(imageId)
                if ($image) {
                    curFrame.imgId = imageId
                    this.getImageSrc(curFrame).then(res => {
                        $image.attr({
                            'xlink:href': res
                        })
                    })
                }
            }
        }
    }

    updateCss(css) {
        super.updateCss(css)
        super.setScale()
        if (Object.prototype.hasOwnProperty.call(css, 'border')) {
            delete css.border
        }
        this.$svg && this.$svg.css(css).css({
            // 清除不需要的属性
            left: '',
            top: '',
            zIndex: '',
            transform: ''
        })
    }

    updateProperty(property) {
        if (property.frames) {
            this.setImageSrc(property.frames)
        }
        super.updateProperty(property)
    }

    updateSvg(property) {
        return Promise.all([loader.svg(property.src), imgToBase64(defualtFrameImgSrc)]).then(([$svgTemp, url]) => {
            const $clips = this.getClips($svgTemp) // 获取clips
            const width = parseFloat($svgTemp.attr('width'))
            const height = parseFloat($svgTemp.attr('height'))

            if (this.$svg) {
                this.$svg.attr({
                    width,
                    height,
                    opacity: 0,
                    viewBox: `0 0 ${width} ${height}`,
                    preserveAspectRatio: 'none'
                })
                this.$svg.innerHTML = this.getInnerHtml($clips, property.name, url)
                this.updateImageAttr()
                this.updateProperty(property)
            }
        })
    }

    setClipBox(clipBox) {
        this.clipBox = clipBox
    }
}
