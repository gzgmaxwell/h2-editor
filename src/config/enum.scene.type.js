import env from '../config/env'
// 允许添加gif的场景配置
const allowGifSceneType = [env.mall.gifSceneType, env.mall.artQrcodeTemplateType[2]]
// 配置场景风格 第一个参数测试环境风格的id  第二个是生产环境的风格id
const sceneStyle = [893997, 894413]
function isSceneStyle(id) {
    return sceneStyle.includes(id)
}
function isAllowAddGifToScene(id) {
    return allowGifSceneType.includes(id)
}
function geyAllowGifSceneType() {
    return allowGifSceneType
}
export default {
    isAllowAddGifToScene,
    geyAllowGifSceneType,
    isSceneStyle
}
