/*
纯色:
{
type: 0, // 0为纯色
color: '',
opacity: 0.6
}

渐变色
{
type: 1, // 1为渐变色
colors: []
rotate: 0, // 旋转角度，90度的倍数
opacity: 0.6
}

自定义图片
{
type: 1, // 1为自定义图片
src: '',
crop: {},
size: 1,
opacity: 1
}

纹理图片
{
type: 0, // 0为纹理
src: '',
size: 1,
opacity: 1
}
*/

import { host } from '../../config/env'

export default class EqxBackground {
    constructor(eqxPage) {
        this.eqxPage = eqxPage
        this.pageJson = eqxPage.pageJson
        this.$el = null

        this.render()
    }

    /**
     * 渲染背景
     */
    render() {
        this.$el = document.createElement('div').css({
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden'
        })
        this.$bgBottom = document.createElement('div').css({
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%'
        })
        this.$bgMiddle = this.$bgBottom.clone()
        this.$bgTop = this.$bgBottom.clone()
        this.$el.attr({ class: 'eqc-background' })
        this.$el.appendChild(this.$bgBottom)
        this.$el.appendChild(this.$bgMiddle)
        this.$el.appendChild(this.$bgTop)
    }

    /**
     * 设置背景颜色或图片 或模糊
     * @param {*} background
     */
    setBackground(background) {
        this.pageJson.properties.background = background
        this.setBackgroundBottom(background.bottom)
        this.setBackgroundMiddle(background.middle)
        this.setBackgroundTop(background.top)
        if (!background.blur) {
            background.blur = 0
        }
        this.setBackgroundBlur(background.blur)
    }

    /**
     * 设置下层背景
     * @param {*} background
     */
    setBackgroundBottom(background) {
        this.pageJson.properties.background.bottom = background
        setBackgroundColor.call(this, background, this.$bgBottom)
    }

    /**
     * 设置中层背景
     * @param {*} background
     */
    setBackgroundMiddle(background) {
        this.pageJson.properties.background.middle = background
        let { type, src, size, opacity, crop } = background
        this.$bgMiddle.css('background', '')
        if (src) {
            src = src.split('?')[0] + '?imageMogr2/auto-orient'
            this.setBackgroundImage(type, src, size, opacity, crop)
        }
    }

    /**
     * 设置图片
     */
    setBackgroundImage(type, src, size, opacity, crop) {
        if (crop) {
            src = src + `/crop/!${crop.width}x${crop.height}a${crop.left}a${crop.top}`
        }
        // type： 0 纹理 1 图片
        if (type === 0) {
            size = size * 100 + '%'
        } else {
            size = 'cover'
        }
        this.$bgMiddle.css(Object.assign({
            background: `url(${host.file + src}) center / ${size}`,
            opacity
        }))
    }

    /**
    * 设置模糊度
    */
    setBackgroundBlur(num) {
        this.pageJson.properties.background.blur = num
        this.$bgMiddle.css({
            filter: `blur(${num}px)`
        })
    }

    /**
     * 设置上层背景
     * @param {*} background
     */
    setBackgroundTop(background) {
        this.pageJson.properties.background.top = background
        setBackgroundColor.call(this, background, this.$bgTop)
    }

    /**
     * 设置背景缩放
     */
    setScale() {
        // const { width, height } = this.eqxPage
        // const sizeCss = {
        //     width: width + 'px',
        //     height: height + 'px'
        // }
        // this.$el.css(sizeCss)
    }

    /**
     * 清除背景
     */
    clearBackground() {
        this.clearBackgroundBottom()
        this.clearBackgroundMiddle()
        this.clearBackgroundTop()
    }

    /**
     * 清除下层背景
     */
    clearBackgroundBottom() {
        const background = {
            type: 0,
            color: '',
            colors: ['', ''],
            rotate: 0
        }
        this.setBackgroundBottom(background)
    }

    /**
     * 清除中层背景
     */
    clearBackgroundMiddle() {
        const background = {
            type: 0,
            src: '',
            size: 1,
            opacity: 1
        }
        this.setBackgroundMiddle(background)
    }

    /**
     * 清除上层背景
     */
    clearBackgroundTop() {
        const background = {
            type: 0,
            color: '',
            colors: ['', ''],
            rotate: 0,
            opacity: 0.4
        }
        this.setBackgroundTop(background)
    }
}

/**
 * 设置背景颜色
 * @param {*} background
 * @param {*} $bg
 */
function setBackgroundColor(background, $bg) {
    const { type, color, colors, rotate, opacity } = background
    let css = {}
    $bg = $bg || this.$bgBottom
    $bg.css('background', '')
    if (type === 0) { // 纯色
        css = {
            background: color,
            opacity
        }
    } else if (type === 1) { // 渐变色
        css = {
            background: `linear-gradient(${rotate}deg, ${colors[0] || 'transparent'} 0%, ${colors[1] || 'transparent'} 100%)`,
            opacity
        }
    }
    $bg.css(css)
}
