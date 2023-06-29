
// 传入key 返回 加了水印的图片地址
export default {
    getImageWatermark,
    getQrcodeWaterMark,
    getWaterMarkCover,
    getGifWatermark,
    getLogoWaterMark
}
function getGifWatermark(src) {
    const option = {
        src: src,
        mode: 2, // 1 图片水印 2 文字水印 4 文字平铺水印
        text: '易企秀轻设计',
        font: '微软雅黑',
        fontSize: '2000',
        gravity: 'Center', // 水印位置，为以下参数[NorthWest、North、NorthEast、West、Center、East、SouthWest、South、SouthEast]之一
        dx: 0, // 横轴边距，单位:像素(px)
        dy: 0, // 纵轴边距，单位:像素(px)
        fill: '#000000', // 配置字体颜色
        dissolve: 35 // 透明度，取值范围1-100，非必需，下同
    }
    return loadImageWatermark(option)
}
// 为秀客制作，秀客制作的cover都是干净的 但是生成的cover展示却需要加上水印
function getWaterMarkCover(src, width, height) {
    const { dw, dh, fontsize } = calculateWaterSize(width, height)
    const option = {
        src: src,
        mode: 4, // 1 图片水印 2 文字水印 4 文字平铺水印
        text: '易企秀轻设计',
        font: '微软雅黑',
        fontSize: parseInt(fontsize),
        fill: '#000000', // 配置字体颜色
        rotate: 45,
        uw: parseInt(dw),
        uh: parseInt(dh),
        resize: 1, // 默认为1，不缩放
        dissolve: 20 // 透明度，取值范围1-100，非必需，下同
    }
    return loadImageWatermark(option)
}
//  专门给艺术二维码的水印
function getQrcodeWaterMark(src) {
    const option = {
        src: src,
        mode: 4, // 1 图片水印 2 文字水印 4 文字平铺水印
        text: '易企秀轻设计',
        font: '微软雅黑',
        fontSize: 1012,
        fill: '#000000', // 配置字体颜色
        rotate: 45,
        uw: 330,
        uh: 500,
        resize: 1, // 默认为1，不缩放
        dissolve: 20 // 透明度，取值范围1-100，非必需，下同

    }
    return loadImageWatermark(option)
}

/**
 * 图片水印
 * @param {*} src
 */
function getLogoWaterMark(src) {
    const option = {
        src: src,
        mode: 1, // 1 图片水印 2 文字水印 4 文字平铺水印
        dissolve: 80, // 透明度，取值范围1-100，非必需，下同
        dx: 14,
        dy: 14
    }
    return loadImageWatermark(option)
}
/**
 * @param {*} src 图片的七牛key
 * @param {*} type 水印的类型
 * @returns 返回水印的追加参数
 */
function getImageWatermark(src, type) {
    /**
     * 水印算法：
     *  标准水印是一张图 6个文字(3*2)(2*3) 但是单个文字尺寸不能超过 500 * 500 也就是计算出来的dw dh 不能大于这个数，如果大于了适当的增加文字数
     *  计算出来的dw * dh / (150 * 150) 拿到一个比例值，开跟这个比例值再乘以1.25这个系数  得到的最后value * 300 就是这个水印的fontSize
    */
    return new Promise((resolve, reject) => {
        let option = {}
        let dw = 150
        let dh = 150
        let fontsize = 300
        // 拿到图片的原尺寸
        Vue.api.file.getImageInfo(src).then(res => {
            const data = res.data
            if (!checkSizeBeforeAddWater(data.width, data.height, data.format)) {
                // 不满足条件
                resolve(src)
                return
            }
            const obj = calculateWaterSize(data.width, data.height)
            dw = obj.dw
            dh = obj.dh
            fontsize = obj.fontsize
            if (type === 2) {
                option = {
                    src: src,
                    mode: 2, // 1 图片水印 2 文字水印 4 文字平铺水印
                    text: '易企秀轻设计',
                    font: '微软雅黑',
                    fontSize: '800',
                    gravity: 'Center', // 水印位置，为以下参数[NorthWest、North、NorthEast、West、Center、East、SouthWest、South、SouthEast]之一
                    dx: 0, // 横轴边距，单位:像素(px)
                    dy: 0, // 纵轴边距，单位:像素(px)
                    fill: 'white', // 配置字体颜色
                    dissolve: 20 // 透明度，取值范围1-100，非必需，下同

                }
            } else {
                option = {
                    src: src,
                    mode: 4, // 1 图片水印 2 文字水印 4 文字平铺水印
                    text: '易企秀轻设计',
                    font: '微软雅黑',
                    fontSize: parseInt(fontsize),
                    fill: 'white', // 配置字体颜色
                    rotate: 20,
                    uw: parseInt(dw),
                    uh: parseInt(dh),
                    resize: 1, // 默认为1，不缩放
                    dissolve: 20 // 透明度，取值范围1-100，非必需，下同

                }
            }
            resolve(loadImageWatermark(option))
        }).catch(err => {
            // 获取报错了
            reject(err)
        })
    })
}
function checkSizeBeforeAddWater(originWidth, originHeight, format) {
    let pass = true
    if (originWidth <= 30 || originHeight <= 30) {
        pass = false
    }
    if (format === 'gif') {
        pass = false
    }
    return pass
}

function calculateWaterSize(originWidth, originHeight) {
    // 根据宽高 设定水印的宽高和字体大小
    let dw = 150
    let dh = 150
    let fontsize = 300
    if (originWidth >= originHeight) {
        // 图片是宽大于高 按照3 * 2 排版
        const countW = originWidth / 500
        const countH = originHeight / 500
        if (countW <= 3) {
            dw = originWidth / 3
        } else {
            dw = originWidth / countW
        }
        if (countH <= 2) {
            dh = originHeight / 2
        } else {
            dh = originHeight / countH
        }
    } else {
        // 图片是宽大于高 按照2 * 3 排版
        const countW = originWidth / 500
        const countH = originHeight / 500
        if (countW <= 2) {
            dw = originWidth / 2
        } else {
            dw = originWidth / countW
        }
        if (countH <= 3) {
            dh = originHeight / 3
        } else {
            dh = originHeight / countH
        }
    }
    const val = dw * dh / (150 * 150)
    fontsize = Math.sqrt(val) * 1.25 * 300
    return {
        dw, dh, fontsize
    }
}
function loadImageWatermark(option) {
    let returnUrl = `${option.src}?watermark/${option.mode}`
    if (option.mode === 2) {
        returnUrl += '/text/' + urlSafeBase64Encode(option.text)
        returnUrl += '/font/' + urlSafeBase64Encode(option.font)
        returnUrl += '/fontsize/' + encodeURIComponent(option.fontSize)
        returnUrl += '/fill/' + urlSafeBase64Encode(option.fill)
        returnUrl += '/gravity/' + encodeURIComponent(option.gravity)
        returnUrl += '/dx/' + encodeURIComponent(option.dx)
        returnUrl += '/dy/' + encodeURIComponent(option.dy)
    } else if (option.mode === 4) {
        returnUrl += '/text/' + urlSafeBase64Encode(option.text)
        returnUrl += '/font/' + urlSafeBase64Encode(option.font)
        returnUrl += '/fontsize/' + encodeURIComponent(option.fontSize)
        returnUrl += '/fill/' + urlSafeBase64Encode(option.fill)
        returnUrl += '/rotate/' + encodeURIComponent(option.rotate)
        returnUrl += '/uw/' + encodeURIComponent(option.uw)
        returnUrl += '/uh/' + encodeURIComponent(option.uh)
        returnUrl += '/resize/' + encodeURIComponent(option.resize)
    } else if (option.mode === 1) {
        returnUrl += '/image/' + urlSafeBase64Encode('http://res1.eqh5.com/1b11c1de380f9a9f54e71200714cbef3')
        returnUrl += '/dx/' + encodeURIComponent(option.dx)
        returnUrl += '/dy/' + encodeURIComponent(option.dy)
    }

    returnUrl += '/dissolve/' + encodeURIComponent(option.dissolve)
    return returnUrl
}

/* eslint-disable */
function urlSafeBase64Encode(t) {
    return (t = (function (t) {
        var e = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
            n = void 0,
            r = void 0,
            o = void 0,
            i = void 0,
            a = void 0,
            s = void 0,
            u = void 0,
            c = void 0,
            f = 0,
            l = 0,
            h = '',
            p = []
        if (!t) return t
        t = (function (t) {
            if (t === null || void 0 === t) return ''
            var e = t + '',
                n = '',
                r = void 0,
                o = void 0,
                i = 0
            r = o = 0,
                i = e.length
            for (var a = 0; a < i; a++) {
                var s = e.charCodeAt(a),
                    u = null
                if (s < 128) o++
                else if (s > 127 && s < 2048) u = String.fromCharCode(s >> 6 | 192, 63 & s | 128)
                else if (63488 & s ^ !0) u = String.fromCharCode(s >> 12 | 224, s >> 6 & 63 | 128, 63 & s | 128)
                else {
                    if (64512 & s ^ !0) throw new RangeError('Unmatched trail surrogate at ' + a)
                    var c = e.charCodeAt(++a)
                    if (64512 & c ^ !0) throw new RangeError('Unmatched lead surrogate at ' + (a - 1))
                    s = ((1023 & s) << 10) + (1023 & c) + 65536,
                        u = String.fromCharCode(s >> 18 | 240, s >> 12 & 63 | 128, s >> 6 & 63 | 128, 63 & s | 128)
                }
                u !== null && (o > r && (n += e.slice(r, o)), n += u, r = o = a + 1)
            }
            return o > r && (n += e.slice(r, i)),
                n
        }(t + ''))
        do {
            n = t.charCodeAt(f++), r = t.charCodeAt(f++), o = t.charCodeAt(f++), i = (c = n << 16 | r << 8 | o) >> 18 & 63, a = c >> 12 & 63, s = c >> 6 & 63, u = 63 & c, p[l++] = e.charAt(i) + e.charAt(a) + e.charAt(s) + e.charAt(u)
        } while (f < t.length)
        switch (h = p.join(''), t.length % 3) {
            case 1:
                h = h.slice(0, -2) + '=='
                break
            case 2:
                h = h.slice(0, -1) + '='
        }
        return h
    }(t))).replace(/\//g, '_').replace(/\+/g, '-')
}
