import elementType from '../../../../config/enum.element.type'
const env = require('env')

const rectHeight = 160
const rectMargin = 20

function getTextJson1(width, height, content) {
    const fontSize = 32
    const lineHeigt = 1.2
    const elementJson = {
        type: elementType.text,
        property: {
            content
        },
        css: {
            left: rectHeight + 'px',
            top: height - rectHeight + 35 + 'px',
            width: width + 'px',
            height: Math.round(fontSize * lineHeigt) + 'px',
            fontSize: fontSize + 'px',
            textAlign: 'left',
            border: '1px solid transparent'
        }
    }
    return elementJson
}

function getTextJson2(width, height) {
    const fontSize = 24
    const lineHeigt = 1.2
    const elementJson = {
        type: elementType.text,
        property: {
            content: '长按识别或扫描二维码可查看详情'
        },
        css: {
            left: rectHeight + 'px',
            top: height - rectHeight + 100 + 'px',
            width: width + 'px',
            height: Math.round(fontSize * lineHeigt) + 'px',
            fontSize: fontSize + 'px',
            textAlign: 'left',
            color: '#999999',
            border: '1px solid transparent'
        }
    }
    return elementJson
}

function getShapeJson(width, height) {
    const elementJson = {
        type: elementType.shape,
        property: {
            items: [{ fill: 'rgba(255,255,255,1)' }],
            url: env.mall.shapeRect,
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
            left: 0 + 'px',
            top: height - rectHeight + 'px',
            width: width + 'px',
            height: rectHeight + 'px',
            border: '1px solid transparent'
        }
    }
    return elementJson
}

// 构造二维码组件的json
function getQrcodeJson(width, height, text, src) {
    const displaySize = rectHeight - rectMargin * 2
    const elementJson = {
        type: elementType.qrcode,
        property: {
            type: 0, // 无logo
            text,
            foregroundColor: '#000000',
            backgroundColor: '#ffffff'
        },
        css: {
            left: rectMargin + 'px',
            top: height - rectHeight + rectMargin + 'px',
            width: displaySize + 'px',
            height: displaySize + 'px',
            border: '1px solid transparent'
        }
    }
    if (src) {
        Object.assign(elementJson.property, {
            type: 1, // 有logo
            src
        })
    }
    return elementJson
}

function getMark(mark) {
    if (mark === '1') {
        return {
            getTextJson1,
            getTextJson2,
            getShapeJson,
            getQrcodeJson
        }
    }
}

export default {
    getMark
}
