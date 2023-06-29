
/**
 * 手机海报、gif海报——>手机海报
    手机截屏、朋友圈邀请函、手机壁纸——>朋友圈邀请函
    酒水菜单、证书（竖版）、信纸、日报简讯、简历——>日报简讯
    社交配图  公众号底部二维码 ->社交配图
    微信朋友圈方图  头像   ——> 朋友圈
    邀请函 祝福贺卡 -> 邀请函
    移动端banner  微博焦点图-> 移动端banner
    日签 全屏海报 -> 日签
*/
const sceneType = {
    product: {
        63: 16, // 手机海报、gif海报——>手机海报
        17: 15, // 手机截屏、朋友圈邀请函、手机壁纸——>朋友圈邀请函
        35: 15,
        29: 45, // 酒水菜单、证书（竖版）、信纸、日报简讯、简历——>日报简讯
        32: 45,
        44: 45,
        28: 45,
        66: 11, // 社交配图  公众号底部二维码 ->社交配图
        54: 14, // 微信朋友圈方图  头像   ——> 朋友圈
        55: 42, // 邀请函 祝福贺卡 -> 邀请函
        13: 38, // 移动端banner  微博焦点图-> 移动端banner
        65: 24 // 日签 全屏海报 -> 日签

    },
    stage: { // 预发布和 生产的配置一样
        63: 16,
        17: 15,
        35: 15,
        29: 45,
        32: 45,
        44: 45,
        28: 45,
        66: 11,
        54: 14,
        55: 42,
        13: 38,
        65: 24

    }
    // 'test': { 暂时不配置测试
    //     57: 16,
    //     17: 15,
    //     35: 15,
    //     29: 45,
    //     32: 45,
    //     44: 45,
    //     28: 45,
    //     66: 11,
    //     54: 14,
    //     55: 42,
    //     13: 38,
    //     65: 24

    // }
}
export default sceneType
