// 数组第一个为测试id 第二个为预发布id
// 图片
const tuPian = [891588, 893669] // 图片
// 图片 兼容 形状
const mianKouSuCai = [891589, 893670] // 免抠素材
const wenZiRongQi = [891590, 893671] // 文字容器
const zhuangShi = [891592, 893673] // 装饰
const xingZhuang = [891593, 893674] // 形状
const tuBiao = [891594, 893675] // 图标
// 形状
// 嵌入框
const tuPianRongQi = [891591, 893672] // 图片容器
// 组合元素
const wenZiZuHe = [891595, 893911] // 文字组合
const tuPianZuHe = [891596] // 图片组合
const tuWenZuHe = [891597, 893912] // 图文组合

/**
 * 商品类型
 */
const goodsType = {
    all: [...tuPian, ...mianKouSuCai, ...wenZiRongQi, ...zhuangShi, ...xingZhuang, ...tuBiao, ...tuPianRongQi, ...wenZiZuHe, ...tuPianZuHe, ...tuWenZuHe],
    image: [...tuPian, ...mianKouSuCai, ...wenZiRongQi, ...zhuangShi, ...xingZhuang, ...tuBiao], // 图片
    shape: [], // 形状
    frame: [...tuPianRongQi], // 嵌入框
    combine: [...wenZiZuHe, ...tuPianZuHe, ...tuWenZuHe]// 组合元素
}

/**
 * 是否为图片
 * @param {分类id} pId
 */
function isImage(pId) {
    return goodsType.image.includes(pId)
}

/**
 * 是否为形状
 * @param {分类id} pId
 */
function isShape(pId) {
    return goodsType.shape.includes(pId)
}

/**
 * 是否为嵌入框
 * @param {分类id} pId
 */
function isFrame(pId) {
    return goodsType.frame.includes(pId)
}

/**
 * 是否为组合元素
 * @param {分类id} pId
 */
function isCombine(pId) {
    return goodsType.combine.includes(pId)
}

/**
 * 判断是否为组合字
 * @param {分类id} pId
 */
function isCombineText(pId) {
    return wenZiZuHe.includes(pId)
}

/**
 * 是否未知分类
 * @param {分类id} pId
 * @return true:未知分类  false:已知分类
 */
function isUnknown(pId) {
    return !goodsType.all.includes(pId)
}

export default {
    isImage,
    isShape,
    isFrame,
    isCombine,
    isCombineText,
    isUnknown,
    goodsType
}
