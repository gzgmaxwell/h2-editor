import elementType from '../../../../config/enum.element.type'

// 构造图片组件的json
function getImageJson(width, height, src) {
    const elementJson = {
        type: elementType.image,
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
            left: 0,
            top: 0,
            width: Math.round(width) + 'px',
            height: Math.round(height) + 'px',
            border: '1px solid transparent'
        }
    }

    return elementJson
}

export default {
    getImageJson
}
