import logger from './logger'

const key = {
    visit: 'H2-EDITOR-VISIT',
    login: 'H2-EDITOR-LOGIN',
    qrcodeLogo: 'H2-EDITOR-QRCODE-LOGO',
    qrcodeUrl: 'H2-EDITOR-QRCODE-URL',
    mark: 'H2-EDITOR-MARK',
    shareInfo: 'SHARE-INFO',
    wechatQrcode: 'H2-EDITOR-WECHAT-QRCODE',
    fontStyle: 'H2-EDITOR-FONT-STYLE',
    expressMaterial: 'H2-EXPRESS-MATERIAL',
    expressPageId: 'H2-EXPRESS-PAGEID',
    expressReferrer: 'H2-EXPRESS-REFERRER',
    userType: 'H2-USER-TYPE',
    isKeepWatermark: 'H2-KEEP-WATERMARK',
    userInfo: 'H2-USER-INFO',
    puzzleInfo: 'H2-PUZZLE-INFO'
}

export default {
    setItem,
    getItem,
    removeItem,
    key
}

function setItem(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value))
}

function getItem(key) {
    const value = sessionStorage.getItem(key)
    try {
        return JSON.parse(value)
    } catch (err) {
        // 只要是通过这里的setItem设置的都不会转换失败，这里只是做一个万一
        logger.error(err)
        return value
    }
}

function removeItem(key) {
    sessionStorage.removeItem(key)
}
