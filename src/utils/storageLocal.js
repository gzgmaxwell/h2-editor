import logger from './logger'

const key = {
    api: 'H2-API-',
    bgLinearColor: 'H2-EDITOR-BG-LINEAR-COLOR',
    bgPurityolor: 'H2-EDITOR-BG-PURITY-COLOR',
    imageDragTip: 'H2-EDITOR-IMAGE-DRAG-TIP',
    workspaceDragTip: 'H2-EDITOR-WORKSPACE-DRAG-TIP',
    newText: 'H2-EDITOR-NEW-TEXT',
    newQrcode: 'H2-EDITOR-NEW-QRCODE',
    newUpload: 'H2-EDITOR-NEW-UPLOAD',
    newHelp: 'H2-EDITOR-NEW-HELP',
    newLayout: 'H2-EDITOR-NEW-LAYOUT',
    newSize: 'H2-EDITOR-NEW-SIZE',
    newGrid: 'H2-EDITOR-NEW-GRID',
    newRuler: 'H2-EDITOR-NEW-RULER',
    newAdvance: 'H2-EDITOR-NEW-ADVANCE',
    newExport: 'H2-EDITOR-NEW-EXPORT',
    colorPickerHistory: 'H2-EDITOR-COLORPICKER-HISTORY',
    operation: 'H2-EDITOR-OPERATION',
    newMatting: 'H2-EDITOR-NEW-MATTING',
    newDate: 'H2-EDITOR-NEW-DATE',
    publishTime: 'H2-EDITOR-PUBLISH-TIME',
    saveTime: 'H2-EDITOR-SAVE-TIME',
    helpNotifier: 'H2-EDITOR-HELP-NOTIFIRER',
    arrowNotifier: 'H2-EDITOR-ARROW-NOTIFIRER',
    gifFileSize: 'H2-EDITOR-GIF-FILE-SIZE',
    wordCloudOpt: 'H2-EDITOR-WORD-CLOUD-OPTION',
    elementCopy: 'H2-EDITOR-ELEMENT-COPY',
    userInfo: 'H2-EDITOR-USER-INFO',
    mainCover: 'H2-EDITOR-MAIN-COVER',
    newCustomShape: 'H2-EDITOR-NEW-CUSTOM-SHAPE',
    qrcodeHelperShow: 'H2-EDITOR-QRCODE-HELPER-SHOW',
    aiMattingHelperShow: 'H2-AI-MATTING-HLEPER-SHOW',
    materialTips: 'H2-MATERIAL-TIPS-MATERIAL',
    templateTips: 'H2-MATERIAL-TIPS-TEMPLATE',
    uploadTips: 'H2-MATERIAL-TIPS-UPLOAD',
    emptyCreateHistory: 'H2-EMPTY-CREATE-HISTORY',
    templateConfigHistory: 'H2-TEMP-CONF-HISTORY',
    materialConfigHistory: 'H2-MATERIAL-CONF-HISTORY',
    rulerConfigHistory: 'H2-RULER-CONF-HISTORY',
    gridConfigHistory: 'H2-GRID-CONF-HISTORY'
}

export default {
    setItem,
    getItem,
    removeItem,
    key
}

function setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
}

function getItem(key) {
    const value = localStorage.getItem(key)
    try {
        return JSON.parse(value)
    } catch (err) {
        // 只要是通过这里的setItem设置的都不会转换失败，这里只是做一个万一
        logger.error(err)
        return value
    }
}

function removeItem(key) {
    localStorage.removeItem(key)
}
