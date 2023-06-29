export default class EqxBackground {
    constructor(eqxPage) {
        this.eqxPage = eqxPage
        this.pageJson = eqxPage.pageJson
        this.$el = null

        this.render()
    }

    resetBackground($bg) {
        this.$bgImage = $bg
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
        this.$bgImage = document.createElement('canvas').css({
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%'
        })
        this.$el.attr({ class: 'eqc-photo-background' })
        this.$el.appendChild(this.$bgImage)
        this.$bgImage.attr({ class: 'eqc-photo-background-image' })
    }

    /**
     * 设置图片
     * @param {*} background
     */
    setBackground(background) {
        if (background) {
            this.pageJson.properties.background = background
            const { src, width, height } = background
            if (src) {
                let img = new Image()
                img.crossOrigin = 'anonymous'
                img.src = src
                img.onload = () => {
                    const ctx = this.$bgImage.getContext('2d')
                    this.$bgImage.height = height
                    this.$bgImage.width = width
                    ctx.drawImage(img, 0, 0)
                    img = null
                    this.$bgImage.classList.add('h2-photo-check-ele')
                }
            }
        }
    }

    setBackgroundPromise(background) {
        return new Promise((resolve, reject) => {
            if (background) {
                this.pageJson.properties.background = background
                const { src, width, height } = background
                if (src) {
                    let img = new Image()
                    img.crossOrigin = 'anonymous'
                    img.src = src
                    img.onload = () => {
                        const ctx = this.$bgImage.getContext('2d')
                        this.$bgImage.height = height
                        this.$bgImage.width = width
                        ctx.drawImage(img, 0, 0)
                        img = null
                        this.$bgImage.classList.add('h2-photo-check-ele')
                        resolve()
                    }
                }
            }
        })
    }

    /**
     * 清除背景
     */
    clearBackground() {
        const background = {
            src: '',
            size: 1,
            opacity: 1
        }
        this.setBackground(background)
    }
}
