const pro = require('./pro')

module.exports = Object.assign({}, pro, {
    name: 'test',
    docker: 'test',
    host: {
        cdn: '//www.yqxiu.cn',
        client: '//www.yqxiu.cn',
        auth: '//www.yqxiu.cn',
        pay: '//www.yqxiu.cn',
        payBenefits: '//pay.yqxiu.cn',
        service: '//member.yqxiu.cn',
        lpservice: '//lpservice.yqxiu.cn',
        hdcapi: '//hdc-api.yqxiu.cn',
        passport: '//passport.yqxiu.cn',
        mall: '//mall.yqxiu.cn',
        p1: '//p1.yqxiu.cn',
        p1_sign: '//p1-sign.yqxiu.cn',
        xiutui: '//t.yqxiu.cn',
        font: '//font.eqxiu.cc',
        layout: '//lib.yqxiu.cn',
        file: '//test.res.eqh5.com/',
        xz: '//member.xz.yqxiu.cn',
        server_1: '//s1.yqxiu.cn/',
        shareUrl: '//h2.yqxiu.cn',
        h5: '//h5.yqxiu.cn',
        hdh5: '//www.yqxiu.cn',
        s2: '//s2.yqxiu.cn',
        wxMiniProShareUrl: '//m3.eqxiu.com',
        video: '//share.video.yqxiu.cn',
        videoservice: '//vv-api.video.yqxiu.cn',
        videoFile: '//video-test-1251586368.file.myqcloud.com',
        videoImage: '//video-test-1251586368.image.myqcloud.com',
        ws: '//ws-api.yqxiu.cn',
        benefit: '//p1.yqxiu.cn',
        iwork: '//lwork-api.yqxiu.cn'
    },
    mall: {
        // templateId: 300, // 模板的一级分类
        materialId: 891587, // 素材一级分类
        backgroundId: 890674, // 背景纹理分类
        backgroundImageId: 891588, // 背景图片
        shapeCategoryId: 891593, // 形状分类id
        materialCategoryId: 891589, // 免扣素材分类id
        fontId: 891087, // 字体分类
        wordCloudId: 892723, // 字云形状分类
        tcloudId: 890672, // 字云编辑器素材分类id
        shapeRect: 'store/fd59587802ab1b69470e8c4eb49db7a6.svg', // 增加底部标记需要用到的形状
        apiCode: [94231, 96114, 96046], // 94231：图片类素材, 96114：字体, 96046：单页模板类（组合字，图文组合） 新search查素材需要用
        gifSceneType: 57,
        artQrcodeTemplatePropertyOfStyleId: [616, 616, 616], // 艺术二维码模板风格属性id : [基础,立体,动态]
        artQrcodeTemplateType: [61, 62, 63]// 艺术二维码模板分类id:[基础,立体,动态]
    },
    role: {
        copyright: 35809 // 模板可商用
    },
    h5TagId: 588248,
    wxAppId: 'wx1c2251ce5fbdea98', // 创意云公号appid
    benefits: {
        buildGif: 52, // 合并导出gif权益
        buildVideo: 53, // 合并导出视频权益
        batchCreate: 51, // 批量制作权益
        shareWithoutWM: 50, // 无水印分享权益
        download: 49, // 下载权益
        multiSizeDownload: 55, // 多倍图下载权益
        uploadLimit: 56 // 上传文件最大限制权益 会员15M 普通10M
    },
    debug3DText: false,
    threeDTextMaxLength: 21,
    banner: {
        headBannerType: 58, // 运营位 头部——去水印
        downBannerType: 59 // 运营位下载续费会员
    }
})
