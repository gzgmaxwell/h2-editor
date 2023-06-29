import './artqrcode'
import delayLoad from './delayLoad'
import artQrcodeTemplateType from '../config/enum.artQrcodeTemplate.type'
import qrcodeTypeConfig from '../config/enum.qrcode.type'
// 常规使用
function initArtQrcode(option) {
    return new window.QRCode(option.$el, {
        // text: 'http://www.baidu.com',
        text: option.text,
        /**
         * width,height 是输出图的宽高
         * codeWidth,codeHeight 是二维码的宽高
         * top,left 是二维码区域的定位
         */
        width: 500,
        height: 500,
        codeWidth: option.border ? 400 : 490,
        codeHeight: option.border ? 400 : 490,
        top: option.border ? 55 : 5,
        left: option.border ? 55 : 5,
        /**
         * 素材配置
         */
        materials: {
            border: option.border,
            eye: option.eye,
            row2: option.row2,
            row3: option.row3,
            row4: option.row4,
            col2: option.col2,
            col3: option.col3,
            col4: option.col4,
            row2col2: option.row2col2,
            row2col3: option.row2col3,
            row3col2: option.row3col2,
            corner: option.corner,
            single: option.single
        },
        onComplete: option.onComplete,
        onerror: option.onerror
    })
}
function uploadImg(data) {
    return new Promise((resolve, reject) => {
        Vue.api.file.getUploadToken().then(token => {
            Vue.api.file.uploadBase64(data.split(',')[1], token)
                .then(res => {
                    resolve(res.data.key)
                }).catch(err => {
                    err && Vue.logger.error(err)
                    reject(err)
                })
        }).catch(err => {
            err && Vue.logger.error(err)
            reject(err)
        })
    })
}
function formatUrl(url) {
    return /https?:/.test(url) ? url : 'http://' + url
}
function loadAllImage(option) {
    const promiseContainer = []
    const artConfig = ['border', 'eye', 'corner', 'single', 'row2', 'row3', 'row4', 'col2', 'col3', 'col4', 'row2col2', 'row2col3', 'row3col2']
    artConfig.map(item => {
        if (option.materials[item] !== '') {
            const promiseItem = new Promise((resolve, reject) => {
                const img = new Image()
                img.crossOrigin = 'anonymous'
                img.src = option.materials[item]
                img.onload = function () {
                    resolve()
                }
            })
            promiseContainer.push(promiseItem)
        }
    })
    return promiseContainer
}
// 给二维码组件使用
function getArtQrcode(qrcodeElement) {
    return new Promise((resolve, reject) => {
        let { qcType, art, card, text } = qrcodeElement.elementJson.property
        const materials = art.materials
        const materialsCopy = {}
        if (qcType === 4) {
            // 如果是名片
            text = 'BEGIN:VCARD   \r\nFN:' + card.name + ' \r\nTEL;CELL;VOICE:' + card.phone + ' \r\nEND:VCARD'
        } else if ([2, 3].includes(qcType)) {
            text = formatUrl(qrcodeElement.elementJson.property.text || 'http://www.eqxiu.com')
        }
        for (const key in materials) {
            if (materials[key]) {
                materialsCopy[key] = Vue.env.host.file + materials[key] + '?' + Number(new Date())
            } else {
                materialsCopy[key] = ''
            }
        }
        materialsCopy.colorLight = qrcodeElement.elementJson.property.backgroundColor
        // 判断 materialsCopy 是不是都为空
        let isEmpty = true
        for (const key in materialsCopy) {
            if (materialsCopy[key]) {
                isEmpty = false
            }
        }
        const finish = resolve
        const undo = reject
        new Promise((resolve, reject) => {
            // 只有文本和明信片，公众号 不生成短连接其余的都生成
            if (![qrcodeTypeConfig.text, qrcodeTypeConfig.card, qrcodeTypeConfig.wechat].includes(qcType)) {
                Vue.api.scene.getNewShortURL(encodeURI(text)).then(data => {
                    resolve(data.data.obj)
                }).catch(() => {
                    resolve(text)
                })
            } else {
                resolve(text)
            }
        }).then(text => {
            const option = {
                text: text,
                /**
                 * width,height 是输出图的宽高
                 * codeWidth,codeHeight 是二维码的宽高
                 * top,left 是二维码区域的定位
                 */
                width: 500,
                height: 500,
                codeWidth: materialsCopy.border ? 390 : 470,
                codeHeight: materialsCopy.border ? 390 : 470,
                top: materialsCopy.border ? 55 : 15,
                left: materialsCopy.border ? 55 : 15,
                // colorLight: materialsCopy.colorLight, // 背景颜色 更改背景暂时不上
                /**
                 * 素材配置
                 */
                materials: {
                    border: materialsCopy.border,
                    eye: materialsCopy.eye,
                    row2: materialsCopy.row2,
                    row3: materialsCopy.row3,
                    row4: materialsCopy.row4,
                    col2: materialsCopy.col2,
                    col3: materialsCopy.col3,
                    col4: materialsCopy.col4,
                    row2col2: materialsCopy.row2col2,
                    row2col3: materialsCopy.row2col3,
                    row3col2: materialsCopy.row3col2,
                    corner: materialsCopy.corner,
                    single: materialsCopy.single
                },
                onComplete: function (data) {
                    // resolve(data)
                    uploadImg(data).then(key => {
                        qrcodeElement.elementJson.property.isArt = true
                        qrcodeElement.elementJson.css.borderWidth = 0 // 艺术二维码不要border
                        qrcodeElement.elementJson.css.background = 'transparent' // 艺术二维码设置背景为透明
                        qrcodeElement.elementJson.property.src = key
                        qrcodeElement.updateProperty()
                        finish(true)
                    })
                },
                onerror: function (data) {
                    undo(data)
                }
            }
            isEmpty && delete option.materials // 全部条件都为空 生成黑白
            if (option.materials) {
                Promise.all(loadAllImage(option)).then(() => {
                    /* eslint-disable no-new */
                    new window.QRCode(null, option)
                })
            } else {
                /* eslint-disable no-new */
                new window.QRCode(null, option)
            }
        })
    })
}
function getArtQrcodeByJson(elementJson, watermark = false, qrCodeTemplateType) {
    return new Promise((resolve, reject) => {
        const { qcType, text } = elementJson.property
        const finish = resolve
        const undo = reject
        if (qrCodeTemplateType === artQrcodeTemplateType.blackWhite) {
            // 只有文本和明信片，公众号 不生成短连接其余的都生成
            new Promise((resolve, reject) => {
                if (![qrcodeTypeConfig.text, qrcodeTypeConfig.card, qrcodeTypeConfig.wechat].includes(qcType)) {
                    Vue.api.scene.getNewShortURL(encodeURI(text)).then(data => {
                        resolve(data.data.obj)
                    }).catch(() => {
                        resolve(text)
                    })
                } else {
                    resolve(text)
                }
            }).then(text => {
                // 普通二维码
                delayLoad.delayLoadJS(Vue.env.plugin.jquery).then(() => {
                    delayLoad.delayLoadJS(Vue.env.plugin.qrcode).then(() => {
                        const $canvas = window.$('<div>').qrcode({
                            render: 'canvas',
                            ecLevel: 'H',
                            text: text,
                            size: 1000,
                            fill: '#000',
                            background: '#fff'
                        }).children().get(0)
                        // 拿到canvas 转dataurl 然后上传拿到key
                        uploadImg($canvas.toDataURL()).then(key => {
                            finish(key)
                        })
                    })
                })
            })
        } else {
            // 艺术二维码
            let art = elementJson.property.art
            if (!art) {
                // 如果art 结构不完整 补充完整
                art = {
                    materials: {}
                }
            }
            const materials = art.materials
            const materialsCopy = {}
            for (const key in materials) {
                if (materials[key]) {
                    materialsCopy[key] = Vue.env.host.file + materials[key] + '?' + Number(new Date())
                } else {
                    materialsCopy[key] = ''
                }
            }
            materialsCopy.colorLight = elementJson.property.backgroundColor
            // 判断 materialsCopy 是不是都为空
            let isEmpty = true
            for (const key in materialsCopy) {
                if (materialsCopy[key]) {
                    isEmpty = false
                }
            }

            new Promise((resolve, reject) => {
                // 只有文本和明信片，公众号 不生成短连接其余的都生成
                if (![qrcodeTypeConfig.text, qrcodeTypeConfig.card, qrcodeTypeConfig.wechat].includes(qcType)) {
                    Vue.api.scene.getNewShortURL(encodeURI(text)).then(data => {
                        resolve(data.data.obj)
                    }).catch(() => {
                        resolve(text)
                    })
                } else {
                    resolve(text)
                }
            }).then(text => {
                const option = {
                    text: text,
                    /**
                     * width,height 是输出图的宽高
                     * codeWidth,codeHeight 是二维码的宽高
                     * top,left 是二维码区域的定位
                     */
                    width: 500,
                    height: 500,
                    codeWidth: materialsCopy.border ? 390 : 490,
                    codeHeight: materialsCopy.border ? 390 : 490,
                    top: materialsCopy.border ? 55 : 5,
                    left: materialsCopy.border ? 55 : 5,
                    // colorLight: materialsCopy.colorLight, // 背景颜色
                    /**
                     * 素材配置
                     */
                    materials: {
                        border: materialsCopy.border,
                        eye: materialsCopy.eye,
                        row2: materialsCopy.row2,
                        row3: materialsCopy.row3,
                        row4: materialsCopy.row4,
                        col2: materialsCopy.col2,
                        col3: materialsCopy.col3,
                        col4: materialsCopy.col4,
                        row2col2: materialsCopy.row2col2,
                        row2col3: materialsCopy.row2col3,
                        row3col2: materialsCopy.row3col2,
                        corner: materialsCopy.corner,
                        single: materialsCopy.single
                    },
                    onComplete: function (data) {
                        // resolve(data)
                        uploadImg(data).then(key => {
                            finish(key)
                        })
                    },
                    onerror: function (data) {
                        undo(data)
                    }
                }
                isEmpty && delete option.materials // 全部条件都为空 生成黑白
                if (watermark && option.materials) {
                    option.materials.watermark = true
                }
                if (option.materials) {
                    Promise.all(loadAllImage(option)).then(() => {
                        /* eslint-disable no-new */
                        new window.QRCode(null, option)
                        if (elementJson.css && elementJson.css.background) {
                            elementJson.css.background = 'transparent'
                        }
                    })
                } else {
                    /* eslint-disable no-new */
                    new window.QRCode(null, option)
                }
            })
        }
    })
}
export default { initArtQrcode, getArtQrcode, getArtQrcodeByJson }
