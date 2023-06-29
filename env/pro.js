
module.exports = {
    version: '3.54.2',
    name: 'pro',
    docker: 'product',
    host: {
        cdn: '//www.eqxiu.com',
        client: '//www.eqxiu.com',
        auth: '//www.eqxiu.com',
        pay: '//www.eqxiu.com',
        payBenefits: '//pay.eqxiu.com',
        service: '//member.eqxiu.com',
        lpservice: '//lpservice.eqxiu.com',
        hdcapi: '//hdc-api.eqxiu.com',
        passport: '//passport.eqxiu.com',
        mall: '//store.eqxiu.com',
        p1: '//p1.eqxiu.com',
        p1_sign: '//p1-sign.eqxiu.com',
        xiutui: '//xt.eqxiu.com',
        font: '//font.eqh5.com',
        layout: '//lib.eqh5.com',
        file: '//res1.eqh5.com/',
        xz: '//member.xz.eqxiu.com',
        server_1: '//s1.eqxiu.com/',
        shareUrl: '//h2.veqxiu.net',
        h5: '//h5.eqxiu.com',
        hdh5: '//hd.yiqixiua.com',
        s2: '//s2.eqxiu.com',
        wxMiniProShareUrl: '//m3.eqxiu.com',
        video: '//www.bestyqxiu.com',
        videoservice: '//vv-api.eqxiu.com',
        videoFile: '//video-1251586368.file.myqcloud.com',
        videoImage: '//video-1251586368.image.myqcloud.com',
        ws: '//ws-api.eqxiu.com',
        benefit: '//p1.eqxiu.com',
        iwork: '//lwork-api.eqxiu.com'
    },
    mall: {
        templateId: 300, // 模板的一级分类
        materialId: 893668, // 素材的一级分类id
        backgroundId: 891383, // 背景纹理分类
        backgroundImageId: 893669, // 背景图片
        shapeCategoryId: 893674, // 形状分类id
        materialCategoryId: 893670, // 免扣素材分类id
        fontId: 891381, // 字体分类
        wordCloudId: 894363, // 字云形状分类
        tcloudId: 891380, // 字云编辑器素材分类id
        shapeRect: 'group1/M00/B1/A3/yq0KXFZysi-ACYaKAAACDQH4Nes625.svg', // 增加底部标记需要用到的形状
        apiCode: [94231, 96114, 96046], // 94231：图片类素材, 96114：字体, 96046：单页模板类（组合字，图文组合） 新search查素材需要用
        gifSceneType: 63,
        artQrcodeTemplatePropertyOfStyleId: [488, 488, 488], // 艺术二维码模板风格属性id: [基础,立体,动态]
        artQrcodeTemplateType: [75, 76, 77]// 艺术二维码模板分类id: [基础,立体,动态]
    },
    role: {
        copyright: 346315 // 模板可商用
    },
    plugin: {
        vue: '//lib.eqh5.com/vue/2.5.13/vue.runtime.min.js',
        vueRouter: '//lib.eqh5.com/vue-router/3.0.1/vue-router.min.js',
        vuex: '//lib.eqh5.com/vuex/3.0.1/vuex.min.js',
        axios: '//lib.eqh5.com/axios/0.17.1/axios.min.js',
        jquery: '//lib.eqh5.com/jquery/2.2.4/jquery.min.js',
        cropper: '//lib.eqh5.com/cropperjs/1.3.5/cropper.min.js',
        qrcode: '//lib.eqh5.com/@eqxiu/lrsjng.jquery-qrcode/0.14.0.1/jquery-qrcode.min.js',
        psd: '//lib.eqh5.com/psd.js/3.2.0/psd.min.js',
        coreJs: '//lib.eqh5.com/core-js/2.5.7/shim.min.js',
        qiniu2: '//lib.eqh5.com/qiniu-js/2.4.0/qiniu.min.js',
        handsontablecss: '//lib.eqh5.com/handsontable/6.2.0/handsontable.full.min.css',
        handsontablejs: '//lib.eqh5.com/handsontable/6.2.0/handsontable.full.min.js',
        jsPDF: '//lib.eqh5.com/jspdf/1.4.1/jspdf.min.js',
        sha1: '//lib.eqh5.com/jsSHA/2.0.2/sha1.js',
        wx: '//lib.eqh5.com/weixin/1.0.0/jweixin-1.0.0.js',
        xlsx: '//lib.eqh5.com/xlsx/0.11.14/xlsx.full.min.js',
        swipercss: '//lib.eqh5.com/Swiper/4.5.0/swiper.min.css',
        swiperjs: '//lib.eqh5.com/Swiper/4.5.0/swiper.min.js',
        fileSaver: '//lib.eqh5.com/FileSaver/FileSaver.js',
        eqxPs: '//lib.eqh5.com/@eqxiu/eqx-ps/1.0.3/eqx-ps-1.0.3.js'
    },
    h5TagId: 1923200,
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
        headBannerType: 79, // 运营位 头部——去水印
        downBannerType: 80 // 运营位下载续费会员
    }
}
