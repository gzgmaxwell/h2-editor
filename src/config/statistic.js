/**
 * 百度统计对照表
 * _hmt.push(['_trackEvent', category, action, opt_label, opt_value]);
 */
const hmtDict = {
    category: {
        F: '功能使用',
        M: '素材使用'
    },
    action: {
        QR: '二维码', // QR code
        BC: '批量生成', // batches created
        SC: '更改尺寸', // size changed
        SE: '扩展尺寸', // size expand
        SBTN: '分享按钮点击', // share btn click
        ST: '分享渠道', // share trench
        LBTN: '图层面板按钮点击', // layer btn click
        LLAUL: '图层锁定解锁', // layer lock and unlock
        LCAUC: '图层组合取消', // layer combine and uncombined
        UP: '上传功能', // upload
        PE: '作品导出类型', // print export type
        GIF: 'GIF功能', // gif
        PC: '画布裁切', // pic cut
        MBTN: '画布会员购买按钮点击', // members btn click
        MBTNDOWN: '下载页面会员购买按钮点击',
        WC: '字云按钮点击',
        OPD: '运营弹窗位点击',
        LG: 'LOGO按钮点击',
        ARTQRCODE: '艺术二维码按钮点击',
        BATCH: '批量创建',
        EXPRESS: '简易编辑器',
        PUBLISH: '分享发布',
        NOWMDOWNLOAD: '去水印下载',
        AIMATTING: '智能抠图',
        PHOTO: '照片编辑器',
        PUZZLE: '拼图编辑器'
    },
    opt_label: {
        QR: { work: '我的作品', link: '链接', map: '地图', card: '名片', text: '文本', wechat: '公众号' },
        BC: { in: '进入', gen: '生成' },
        SE: { in: '进入', gen: '生成' },
        ST: { qqfriend: 'QQ好友', qqzone: 'QQ空间', webo: '微博' },
        LLAUL: { lock: '锁定', unlock: '解锁' },
        LCAUC: { combine: '组合', uncombined: '取消组合' },
        UP: { pc: '电脑上传', mobile: '手机上传', drag: '拖拽上传', ctrlv: '复制粘贴上传' },
        PE: { jpg: 'JPG', png: 'PNG', pdf: 'PDF', gif: 'GIF', gifTpl: 'GIF模板' },
        GIF: { in: '进入', gen: '生成' },
        WC: { open: '打开字云弹窗', h5: '导出到H5素材', exp: '导出到电脑', draw: '添加到画布', custom: '自定义形状' },
        OPD: { open: '打开链接', close: '关闭弹窗' },
        LG: { open: '打开字云弹窗', h5: '导出到H5素材', exp: '导出到电脑', draw: '添加到画布' },
        ARTQRCODE: { open: '打开艺术二维码', buildSquare: '生成方形艺术二维码', buildDynamic: '生成动态艺术二维码', buildThreeD: '生成立体艺术二维码', h5: '导出到H5素材', exp: '导出到电脑', complete: '完成', addToCanvas: '添加到画布' },
        BATCH: { open: '点击批量创建', selectScene: '选择批量创建场景', create: '批量生成', editTemplate: '编辑模板', export: '导出zip', editProduct: '编辑作品' },
        EXPRESS: { openImg: '图片打开编辑器', openProduct: '轻设计作品打开编辑器', expGif: '导出gif', expPic: '导出img', openThird: '开放平台打开编辑器' },
        PUBLISH: { click: '点击发布按钮' },
        NOWMDOWNLOAD: { click: '点击去水印下载按钮' },
        PHOTO: { clickTool: '从工具箱点击进入', clickSetting: '从图片设置点击进入', download: '下载', expH5: '导出到图片库', finish: '完成', insert: '插入画布' },
        AIMATTING: { clickTool: '从工具箱点击进入', clickSetting: '从图片设置点击进入', download: '下载', expH5: '导出到图片库', finish: '完成', insert: '插入画布' },
        PUZZLE: { clickTool: '从工具箱点击进入', clickSetting: '从设置点击进入', download: '合并下载', split: '分别下载', expH5: '导出到图片库', finish: '完成', insert: '插入画布' }
    }
}

export default hmtDict
