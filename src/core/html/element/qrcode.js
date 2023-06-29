import EqxElement from '../element'
import elementType from '../../../config/enum.element.type'
import qrCodeType from '../../../config/enum.qrcode.type'
import { plugin } from '../../../config/env'
import loader from '../../../utils/loader'
import logger from '../../../utils/logger'
import storageSession from '../../../utils/storageSession'
import delayLoad from '../../../utils/delayLoad'
import qrcodeLogo from '../../../img/qrcode_logo.png'
import qrcodeWork from '../../../img/qrcode_work.png'
import qrcodeLink from '../../../img/qrcode_link.png'
import qrcodeMap from '../../../img/qrcode_map.png'
import qrcodeCard from '../../../img/qrcode_card.png'
import qrcodeText from '../../../img/qrcode_text.png'

export default class EqxQrcode extends EqxElement {
    constructor(elementJson, eqxPage) {
        super(eqxPage)

        // 如果有值则是已有组件，否则是新组件
        if (!elementJson.id) {
            const css = EqxElement.defaultCss
            const elements = eqxPage.pageJson.elements
            elementJson.id = EqxElement.newId(elements)
            elementJson.type = elementType.qrcode
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
                borderColor: css.borderColor,
                background: css.backgroundColor
            }, elementJson.css, { zIndex: EqxElement.newZIndex(elements) })
            elementJson.property = elementJson.property || {}
        }
        if (!Object.prototype.hasOwnProperty.call(elementJson.property, 'isArt')) {
            elementJson.property.isArt = false
        }
        if (!Object.prototype.hasOwnProperty.call(elementJson.property, 'isThreeD')) {
            elementJson.property.isThreeD = false
        }
        if (!elementJson.property.art) {
            elementJson.property.art = {
                // 其他元素 以后再说
                materials: {
                    eye: '',
                    row2col2: '',
                    row2col3: '',
                    row3col2: '',
                    row2: '',
                    row3: '',
                    row4: '',
                    col2: '',
                    col3: '',
                    col4: '',
                    corner: '',
                    single: ''
                }
            }
        }

        this.elementJson = elementJson
    }

    render() {
        super.render()
        this.setQrcodeImage()
    }

    setQrcodeImage() {
        const isArt = this.elementJson.property.isArt
        if (isArt) {
            this.setArtQrcodeImage()
        } else {
            this.updateCss({ background: this.elementJson.css.borderColor })
            this.setNormalQrcodeImage()
        }
    }

    formatUrl(url) {
        return /https?:/.test(url) ? url : 'http://' + url
    }

    updateCss(css) {
        super.updateCss(css)
        super.setScale()
        if (Object.prototype.hasOwnProperty.call(css, 'border')) {
            delete css.border
        }
        this.$image && this.$image
            .css(css)
            .css({
                // 清除不需要的属性
                left: '',
                top: '',
                zIndex: '',
                transform: this.elementJson.property.isThreeD ? 'rotateX(45deg)' : '',
                verticalAlign: 'top',
                boxSizing: 'content-box'
            })
    }

    storageWeChatQrcodeUrl(obj) {
        const tmp = storageSession.getItem(storageSession.key.wechatQrcode)
        let arr = []
        if (tmp) {
            arr = JSON.parse(tmp)
            if (arr.indexOf(obj) === -1) {
                arr.push(obj)
            }
        } else {
            arr.push(obj)
        }
        storageSession.setItem(storageSession.key.wechatQrcode, JSON.stringify(arr))
    }

    appendImageQrcode(qrcodeImg) {
        const $image = this.$image = qrcodeImg
        this.updateCss(this.elementJson.css)
        this.$el.innerHTML = ''
        this.$el.appendChild($image)
    }

    requestWCQrImg(imgSrc, text) {
        // 公号二维码图片域名存在跨域，需要服务器中转一次
        Vue.api.file.getLegalImageUrl(imgSrc)
            .then(res => {
                if (res.data.success) {
                    const qrcodeImg = new Image()
                    qrcodeImg.src = `${Vue.env.host.file}${res.data.obj}`
                    this.appendImageQrcode(qrcodeImg)
                    this.storageWeChatQrcodeUrl({ text, src: qrcodeImg.src })
                }
            })
            .catch(err => { err && Vue.logger.error(err) })
    }

    setArtQrcodeImage() {
        const imgSrc = Vue.env.host.file + this.elementJson.property.src
        const qrcodeImg = new Image()
        qrcodeImg.src = imgSrc.split('?')[0]
        if (this.elementJson.property.isThreeD) {
            qrcodeImg.src += '?imageMogr2/background/bm9uZQ==/rotate/-45'
        }
        this.appendImageQrcode(qrcodeImg)
        // 清空 普通二维码转为艺术二维码不需要延迟等待
        this.$el.classList.remove('h2-core-check-ele')
    }

    setNormalQrcodeImage() {
        let { text, foregroundColor, backgroundColor, centerIcon, type, qcType, card } = this.elementJson.property
        const size = parseInt(this.elementJson.css.width)
        let imgSrc = qrcodeLogo
        let textStr = this.formatUrl(text || 'http://www.eqxiu.com')
        switch (qcType) {
            case qrCodeType.work:
                imgSrc = qrcodeWork
                break
            case qrCodeType.map:
                imgSrc = qrcodeMap
                break
            case qrCodeType.link:
                imgSrc = qrcodeLink
                break
            case qrCodeType.card:
                imgSrc = qrcodeCard
                textStr = 'BEGIN:VCARD   \r\nFN:' + card.name + ' \r\nTEL;CELL;VOICE:' + card.phone + ' \r\nEND:VCARD'
                break
            case qrCodeType.text:
                imgSrc = qrcodeText
                textStr = text
                break
            case qrCodeType.wechat:
                imgSrc = qrcodeText
                textStr = text
                break
        }
        if (type === 1) { // type: 0 无图片, 1 有图片
            centerIcon = centerIcon || imgSrc
        }
        const options = {
            render: 'canvas',
            ecLevel: 'H',
            typeNumber: -1,
            text: textStr,
            size,
            fill: foregroundColor,
            background: backgroundColor
        }
        let promise = delayLoad.delayLoadJS(plugin.jquery)
            .then(() => delayLoad.delayLoadJS(plugin.qrcode))
        if (centerIcon && type === 1) { // type: 0 无图片, 1 有图片
            promise = promise
                .then(() => loader.image(centerIcon))
                .then(image => {
                    Object.assign(options, {
                        mode: 4,
                        mSize: 30 * 0.01,
                        mPosX: 50 * 0.01,
                        mPosY: 50 * 0.01,
                        image
                    })
                })
        }
        promise
            .then(() => {
                const $image = this.$image = window.$('<div>').qrcode(options).children().get(0)
                this.updateCss(this.elementJson.css)
                this.$el.innerHTML = ''
                this.$el.appendChild($image)
                this.$el.classList.add('h2-core-check-ele')
            })
            .catch(err => err && logger.error(err))
    }

    updateProperty(property) {
        super.updateProperty(property)
        // 用户更新二维码图标为无图标时，需要删去默认的qrcode参数，不然用户修改无效
        if (property && property.type === 0) {
            storageSession.removeItem(storageSession.key.qrcodeUrl)
            storageSession.removeItem(storageSession.key.qrcodeLogo)
        }
        this.setQrcodeImage()
    }
}
