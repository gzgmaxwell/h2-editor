const test = require('./test')
const pro = require('./pro')

module.exports = Object.assign({}, pro, test, {
    name: 'dev',
    docker: 'develop',
    host: {
        cdn: '//www.eqshow.cn',
        client: '//www.eqshow.cn',
        auth: '//www.eqshow.cn',
        pay: '//www.eqshow.cn',
        service: '//member.eqshow.cn',
        lpservice: '//lpservice.eqshow.cn',
        hdcapi: '//hdc-api.eqshow.cn',
        passport: '//passport.eqshow.cn',
        mall: '//mall.eqshow.cn',
        p1: '//p1.eqshow.cn',
        p1_sign: '//p1-sign.eqshow.cn',
        xiutui: '//xt.eqshow.cn',
        font: '//font.eqxiu.cc',
        layout: '//lib.eqshow.cn',
        file: '//test.res.eqh5.com/',
        xz: '//member.xz.yqxiu.cn',
        server_1: '//s1.eqshow.cn/',
        shareUrl: '//h2.yqxiu.cn',
        h5: '//h5.eqshow.cn',
        hdh5: '//www.eqshow.cn',
        s2: '//s2.eqshow.cn',
        wxMiniProShareUrl: '//m3.eqxiu.com',
        video: '//share.video.yqxiu.cn',
        videoservice: '//vv-api.video.eqshow.cn',
        videoImage: '//video-test-1251586368.image.myqcloud.com',
        ws: '//ws-api.eqshow.cn'

    }
})
