
import pageApi from '../../api/page'
import sceneApi from '../../api/scene'
import elementType from '../../config/enum.element.type'
import stringUtil from '../../utils/string'

/**
 * 自动创建页面
 * @param {*} pageId
 * @param {*} printId
 * @param {*} productId
 */
function autoCreatePage(pInfo) {
    Vue.store.commit('FONT_STYLE_ISLOAD', false)
    return new Promise((resolve, reject) => {
        for (const key in pInfo) {
            if (pInfo[key] === "''") {
                pInfo[key] = ''
            }
        }
        pageApi.getPage(pInfo.pageId, pInfo.printId, pInfo.productId).then(res => {
            return res.data.obj
        }).then(obj => {
            const scene = Vue.store.state.scene
            const eqxPage = scene.eqxPage
            const { elements, properties } = obj
            if (elements === null || elements.length === 0) {
                resolve(null)
            }
            eqxPage.setScale('1', pInfo.sizeHeight, pInfo.sizeWidth)
            replaceInfo(elements, pInfo, 0).then(res => {
                // 过滤无效元素
                const elements2 = elements.filter((item, index, arr) => {
                    if (item.type === elementType.text) {
                        return stringUtil.isNotEmpty(item.property.content)
                    } else if (item.type === elementType.image) {
                        return stringUtil.isNotEmpty(item.property.src)
                    }
                    return true
                })
                eqxPage.renderPage({ elements: elements2, properties })
                Vue.store.dispatch('PAGE_SAVE', { eqxPage: eqxPage, needCover: false })
                tracker(scene.eqxScene.sceneJson.id)
                resolve(elements)
            })
        })
    })
}

/**
 * 转赠
 */
function transferScene(pSceneId, pUserName) {
    sceneApi.transferScene(pSceneId, pUserName)
}

/**
 * 替换
 * @param {*} pEelements
 * @param {*} pInfo
 * @param {*} pIndex
 */
function replaceInfo(pEelements, pInfo, pIndex) {
    return new Promise((resolve, reject) => {
        replace(pEelements, pInfo, pIndex, resolve)
    })
}

/**
 * 替换内容
 * @param {*} pEelements
 * @param {*} pInfo
 */
function replace(pEelements, pInfo, pIndex, resolve) {
    if (pIndex === pEelements.length) {
        resolve()
        return
    }
    const item = pEelements[pIndex++]
    if (item.type === elementType.text) {
        if (item.property.markLabel) {
            replaceText(item, pInfo)
        }
        replaceFontName(item)
        replace(pEelements, pInfo, pIndex, resolve)
    } else if (item.type === elementType.image) {
        if (item.property.markLabel === 'LOGO' || item.property.markLabel === '二维码') {
            replaceImage(item, pInfo, pEelements, pIndex, resolve)
        } else {
            replace(pEelements, pInfo, pIndex, resolve)
        }
    } else if (item.type === elementType.date) {
        replaceFontName(item)
        replace(pEelements, pInfo, pIndex, resolve)
    } else {
        replace(pEelements, pInfo, pIndex, resolve)
    }
}

/**
 * 替换图片
 * @param {*} item
 * @param {*} pInfo
 * @param {*} pEelements
 * @param {*} pIndex
 * @param {*} resolve
 */
function replaceImage(item, pInfo, pEelements, pIndex, resolve) {
    const val = item.property.markLabel === 'LOGO' ? pInfo.logo : pInfo.qrcode
    if (stringUtil.isNotEmpty(stringUtil.trimToEmpty(val))) {
        // 源logo尺寸
        const originWidth = parseInt(item.css.width)
        const originHeight = parseInt(item.css.height)
        // 源logo位置
        const originLeft = parseInt(item.css.left)
        const originTop = parseInt(item.css.top)
        // 源logo中心坐标
        const originX = originLeft + originWidth / 2
        const originY = originTop + originHeight / 2
        // 画布屏幕坐标
        const sceneCenterX = pInfo.sizeWidth / 2
        const sceneCenterY = pInfo.sizeHeight / 2
        // 计算源logo中心坐标在第几象限
        const quadrant = calcQuadrant(originX, sceneCenterX, originY, sceneCenterY)
        const newLog = new Image()
        newLog.src = Vue.env.host.file + val
        newLog.onload = (img) => {
            // 新的logo尺寸
            const logoWidth = img.currentTarget.width
            const logoHeight = img.currentTarget.height
            // 源尺寸宽高比
            const originRatio = originWidth / originHeight
            // 新尺寸宽高比
            const logoRatio = logoWidth / logoHeight
            calcImageStyle(originRatio, logoRatio, originWidth, logoWidth, item, logoHeight, originHeight, val, quadrant)
            replace(pEelements, pInfo, pIndex, resolve)
        }
    } else {
        item.property.src = ''
        replace(pEelements, pInfo, pIndex, resolve)
    }
}

/**
 * 计算图片样式
 * @param {*} originRatio
 * @param {*} logoRatio
 * @param {*} originWidth
 * @param {*} logoWidth
 * @param {*} item
 * @param {*} logoHeight
 * @param {*} originHeight
 * @param {*} val
 * @param {*} quadrant
 */
function calcImageStyle(originRatio, logoRatio, originWidth, logoWidth, item, logoHeight, originHeight, val, quadrant) {
    if (originRatio >= logoRatio) {
        if (originWidth >= logoWidth) {
            item.css.width = logoWidth
            item.css.height = logoHeight
        } else {
            item.css.width = originWidth
            item.css.height = originWidth / logoRatio
        }
    } else {
        if (originHeight >= logoHeight) {
            item.css.width = logoWidth
            item.css.height = logoHeight
        } else {
            item.css.height = originHeight
            item.css.width = originHeight * logoRatio
        }
    }
    delete item.property.crop
    item.property.src = val
    item.css.width += 'px'
    item.css.height += 'px'
    const newWidth = parseInt(item.css.width)
    const newHeight = parseInt(item.css.height)
    const top = parseInt(item.css.top)
    const left = parseInt(item.css.left)
    if (quadrant === 1) {
        item.css.left = (left + originWidth - newWidth) + 'px'
    } else if (quadrant === 3) {
        item.css.top = (top + originHeight - newHeight) + 'px'
    } else if (quadrant === 4) {
        item.css.left = (left + originWidth - newWidth) + 'px'
        item.css.top = (top + originHeight - newHeight) + 'px'
    }
}

/**
 * 替换文本
 * @param {*} item
 * @param {*} pInfo
 */
function replaceText(item, pInfo) {
    if (item.property.markLabel === '公司名称/产品名称') {
        if (stringUtil.isNotEmpty(stringUtil.trimToEmpty(pInfo.name))) {
            item.property.content = pInfo.name
        } else {
            item.property.content = ''
        }
    } else if (item.property.markLabel === '地址') {
        if (stringUtil.isNotEmpty(stringUtil.trimToEmpty(pInfo.address))) {
            item.property.content = item.property.markLabel + '：' + pInfo.address
        } else {
            item.property.content = ''
        }
    } else if (item.property.markLabel === '电话') {
        if (stringUtil.isNotEmpty(stringUtil.trimToEmpty(pInfo.tel))) {
            item.property.content = item.property.markLabel + '：' + pInfo.tel
        } else {
            item.property.content = ''
        }
    }
}

/**
 * 计算在第几象限
 * @param {*} originX
 * @param {*} sceneCenterX
 * @param {*} originY
 * @param {*} sceneCenterY
 */
function calcQuadrant(originX, sceneCenterX, originY, sceneCenterY) {
    let quadrant
    if (originX === sceneCenterX && originY === sceneCenterY) {
        quadrant = 2
    } else if (originX === sceneCenterX) {
        if (originY <= sceneCenterY) {
            quadrant = 2
        } else {
            quadrant = 3
        }
    } else if (originY === sceneCenterY) {
        if (originX <= sceneCenterX) {
            quadrant = 2
        } else {
            quadrant = 1
        }
    } else {
        if (originX > sceneCenterX && originY < sceneCenterY) {
            quadrant = 1
        } else if (originX < sceneCenterX && originY < sceneCenterY) {
            quadrant = 2
        } else if (originX < sceneCenterX && originY > sceneCenterY) {
            quadrant = 3
        } else if (originX > sceneCenterX && originY > sceneCenterY) {
            quadrant = 4
        }
    }
    return quadrant
}

/**
* opType: local:下载到本地 lib:导出到素材库
* enableResolution: 是否获取分辨率设置
*/
function tracker(sceneId) {
    const downloadType = 'JPG'
    const userId = Vue.store.state.user.userInfo.id
    const ed = `op_type=local&file_type=image&extension=${downloadType}&resolution=原图&is_watermark=0&order_id=null`

    const params = {
        // 产品线缩写
        product: 'print',
        // 业务线类型
        b_t: 'download',
        // 事件分类
        cat: 'download',
        // 图片类型
        img_type: downloadType,
        // 用户id
        u_i: userId,
        // 元素事件
        e_t: 'element_click',
        // 作品id
        works_id: sceneId,
        // 作品创建者id
        w_u: userId,
        // 下载位置
        loc: '',
        // 来源端
        f_p: 'PC',
        // 其他参数
        e_d: ed,
        // 新增act 与opType 相同
        act: 'local',
        // 时长 固定传0
        dur: 0
    }
    window._tracker_api_ && window._tracker_api_.report(params)
}

function install() {
    Vue.autoCreatePage = Vue.prototype.autoCreatePage = {
        autoCreatePage,
        transferScene,
        calcQuadrant,
        calcImageStyle
    }
}

export default {
    calcQuadrant,
    calcImageStyle
}

function replaceFontName(item) {
    const h2Realfont = [
        {
            fontFamilyReal: 'fangzheng_ktjt',
            realName: '方正楷体简体'
        },
        {
            fontFamilyReal: 'fangzheng_xhyjt',
            realName: '方正细黑一简体'
        },
        {
            fontFamilyReal: 'fangzheng_lsjt',
            realName: '方正隶书简体'
        },
        {
            fontFamilyReal: 'NGwangtianxiziti',
            realName: '南构王天喜字体'
        },
        {
            fontFamilyReal: 'fangzheng_htjt',
            realName: '方正黑体简体'
        },
        {
            fontFamilyReal: 'fangzheng_ytjt',
            realName: '方正姚体简体'
        },
        {
            fontFamilyReal: 'fangzheng_zyjt',
            realName: '方正综艺简体'
        },
        {
            fontFamilyReal: 'fangzheng_s1jt',
            realName: '方正宋一简体'
        },
        {
            fontFamilyReal: 'fangzheng_lbjt',
            realName: '方正隶变简体'
        },
        {
            fontFamilyReal: 'iekieBaiJiaHeiTi',
            realName: '义启白加黑体'
        },
        {
            fontFamilyReal: 'hanyi_zhyt',
            realName: '汉仪中圆简'
        },
        {
            fontFamilyReal: 'fangzheng_ssjt',
            realName: '方正书宋简体'
        },
        {
            fontFamilyReal: 'fangzheng_s3jt',
            realName: '方正宋三简体'
        },
        {
            fontFamilyReal: 'fangzheng_bsjt',
            realName: '方正报宋简体'
        },
        {
            fontFamilyReal: 'Y_hanyi_qihei35',
            realName: '汉仪旗黑35简'
        },
        {
            fontFamilyReal: 'fangzheng_dhtjt',
            realName: '方正大黑简体'
        },
        {
            fontFamilyReal: 'BaiBianMaDing',
            realName: '百变马丁'
        },
        {
            fontFamilyReal: 'YuJianTi',
            realName: '遇见体'
        },
        {
            fontFamilyReal: 'iekieMengMeiTi',
            realName: '义启萌妹体'
        },
        {
            fontFamilyReal: 'iekieZiShuiJingTi',
            realName: '义启紫水晶体'
        },
        {
            fontFamilyReal: 'Kekegangbixingkai',
            realName: '可可钢笔行楷'
        },
        {
            fontFamilyReal: 'YGYyifengjian',
            realName: '叶根友依凤简'
        },
        {
            fontFamilyReal: 'fangzheng_fst',
            realName: '方正仿宋简体'
        },
        {
            fontFamilyReal: 'fangzheng_wbjt',
            realName: '方正魏碑简体'
        },
        {
            fontFamilyReal: 'fangzheng_xkjt',
            realName: '方正行楷简体'
        },
        {
            fontFamilyReal: 'TTShuSongF',
            realName: '腾祥嘉丽书宋繁'
        },
        {
            fontFamilyReal: 'TTYingLiF',
            realName: '腾祥铁山硬隶繁'
        },
        {
            fontFamilyReal: 'TTZhiLiF',
            realName: '腾祥铚谦隶书繁'
        },
        {
            fontFamilyReal: 'TTCuYuanF',
            realName: '腾祥嘉丽粗圆繁'
        },
        {
            fontFamilyReal: 'TTRuiHeiJ-W6',
            realName: '腾祥睿黑简-W6'
        },
        {
            fontFamilyReal: 'TTQianYingJ',
            realName: '腾祥倩影简'
        },
        {
            fontFamilyReal: 'TTRiLiTiJ',
            realName: '腾祥日历体简'
        },
        {
            fontFamilyReal: 'TTXianHeiJ',
            realName: '腾祥嘉丽线黑简'
        },
        {
            fontFamilyReal: 'HYDianYaTiJ',
            realName: '汉仪典雅体简'
        },
        {
            fontFamilyReal: 'HYYiSongW',
            realName: '汉仪意宋W'
        },
        {
            fontFamilyReal: 'Y_hanyi_dieyu',
            realName: '汉仪蝶语体简'
        },
        {
            fontFamilyReal: 'XYouHeiTi',
            realName: 'X-幼黑体'
        },
        {
            fontFamilyReal: 'iekieZhongQiuTi',
            realName: '义启中秋体'
        },
        {
            fontFamilyReal: 'iekieWanShengTi',
            realName: '义启万圣体'
        },
        {
            fontFamilyReal: 'iekieShengDanTi',
            realName: '义启圣诞体'
        },
        {
            fontFamilyReal: 'iekieDuanWuTi',
            realName: '义启端午体'
        },
        {
            fontFamilyReal: 'iekieXiaoKaiShu',
            realName: '义启小楷书'
        },
        {
            fontFamilyReal: 'iekiepaomadeng',
            realName: '义启跑马灯'
        },
        {
            fontFamilyReal: 'iekieQiaoHeiTi',
            realName: '义启俏黑体'
        },
        {
            fontFamilyReal: 'XiaoKeDouZhaoMaMa',
            realName: '小蝌蚪找妈妈'
        },
        {
            fontFamilyReal: 'InpinHaiSong',
            realName: '印品嗨宋'
        },
        {
            fontFamilyReal: 'MingLieQianMao',
            realName: '名列前茅'
        },
        {
            fontFamilyReal: 'inpinYaYuanTi',
            realName: '印品雅圆体'
        },
        {
            fontFamilyReal: 'inpinYaYaTi',
            realName: '印品丫丫体'
        },
        {
            fontFamilyReal: 'Zhengqingkehuangyouti',
            realName: '郑庆科黄油体Regular '
        },
        {
            fontFamilyReal: 'Pangmenzhengdaobiaotiti',
            realName: '庞门正道标题体'
        },
        {
            fontFamilyReal: 'iekieDuDuTi',
            realName: '义启嘟嘟体'
        },
        {
            fontFamilyReal: 'X-HuaYangMeiNan',
            realName: 'X-花样美男'
        },
        {
            fontFamilyReal: 'Arual',
            realName: 'Arual'
        },
        {
            fontFamilyReal: 'AiDeep',
            realName: 'AiDeep'
        },
        {
            fontFamilyReal: 'Zhankukuaileti',
            realName: '站酷快乐体2016修订版'
        },
        {
            fontFamilyReal: 'Zhankuwenyiti',
            realName: '站酷文艺体'
        },
        {
            fontFamilyReal: 'Zhankugaoduanhei',
            realName: '站酷高端黑'
        },
        {
            fontFamilyReal: 'Zhankukuhei',
            realName: '站酷酷黑'
        },
        {
            fontFamilyReal: 'ZhankuxiaoweiLOGOti',
            realName: '站酷小薇LOGO体'
        },
        {
            fontFamilyReal: 'RZY_SongHei',
            realName: '锐字云字库宋黑GB'
        },
        {
            fontFamilyReal: 'Yangrendongzhushiticu',
            realName: '杨任东竹石体-Bold'
        },
        {
            fontFamilyReal: 'Yangrendongzhushiti',
            realName: '杨任东竹石体-Regular'
        },
        {
            fontFamilyReal: 'Yangrendongzhushitixi',
            realName: '杨任东竹石体-Extralight'
        },
        {
            fontFamilyReal: 'RZY_RuiSongCu',
            realName: '锐字云字库锐宋粗GB'
        },
        {
            fontFamilyReal: 'RZY_XiaoBiaoSong',
            realName: '锐字云字库小标宋GB'
        },
        {
            fontFamilyReal: 'ReejiCloudZhongSongGBK',
            realName: '锐字云字库中长宋GB'
        },
        {
            fontFamilyReal: 'RZY_XiYuan',
            realName: '锐字云字库细圆GB'
        },
        {
            fontFamilyReal: 'ReejiCloudZongYiGBK',
            realName: '锐字云字库综艺GB'
        },
        {
            fontFamilyReal: 'NGchenhuaqingshu',
            realName: 'NGchenhuaxingshu'
        },
        {
            fontFamilyReal: 'NGwangtianxixingshujian',
            realName: '南构王天喜行书简'
        },
        {
            fontFamilyReal: 'NGwangbenyouxingshu',
            realName: '南构汪本友行书'
        },
        {
            fontFamilyReal: 'RZY_CCHei',
            realName: '锐字云字库超粗黑GB'
        },
        {
            fontFamilyReal: 'YGYlixianxingshu',
            realName: '叶根友离贤行书'
        },
        {
            fontFamilyReal: 'iekieHandBoy',
            realName: 'iekie HandBoy'
        },
        {
            fontFamilyReal: 'iekieCallasweet',
            realName: 'iekie Callasweet'
        },
        {
            fontFamilyReal: 'RZY_CuYuan',
            realName: '锐字云字库粗圆GB'
        },
        {
            fontFamilyReal: 'Kekeluoyunxingkai',
            realName: '可可落云行楷'
        },
        {
            fontFamilyReal: 'iekieSparkling',
            realName: 'iekie Sparkling'
        },
        {
            fontFamilyReal: 'RZY_XiHeiT',
            realName: '锐字云字库细黑体GB'
        },
        {
            fontFamilyReal: 'RZY_CaiYunJ',
            realName: '锐字云字库彩云GB'
        },
        {
            fontFamilyReal: 'ReejiCloudShuiZhuGBK',
            realName: '锐字云字库水柱GB'
        },
        {
            fontFamilyReal: 'ReejiCloudXingCaoGBK',
            realName: '锐字云字库行草GB'
        },
        {
            fontFamilyReal: 'YGYqianqiuziti',
            realName: '叶根友千秋字体08'
        },
        {
            fontFamilyReal: 'XiaTianTi',
            realName: '夏天体'
        },
        {
            fontFamilyReal: 'ReejiCloudShuTiGBK',
            realName: '锐字云字库舒体GB'
        },
        {
            fontFamilyReal: 'ReejiCloudMeiHeiGBK',
            realName: '锐字云字库美黑GB'
        },
        {
            fontFamilyReal: 'Kekemiaoxiaozhu',
            realName: '可可喵小主'
        },
        {
            fontFamilyReal: 'ReejiCloudRuiQianGBK',
            realName: '锐字云字库锐倩GB'
        },
        {
            fontFamilyReal: 'Kekezhenshangshuqingsi',
            realName: '可可枕上书情思'
        },
        {
            fontFamilyReal: 'NGbandiao',
            realName: '南构半调'
        },
        {
            fontFamilyReal: 'Kekeniumengguaiguaiti',
            realName: '可可泥萌怪怪体'
        },
        {
            fontFamilyReal: 'iekieduanmeiti',
            realName: '印品断眉体'
        },
        {
            fontFamilyReal: 'Kekexiashuiliuying',
            realName: '可可夏水流萤'
        },
        {
            fontFamilyReal: 'Kekemianhuatang',
            realName: '可可棉花糖'
        },
        {
            fontFamilyReal: 'InpinPiaoYiTi',
            realName: '印品飘艺体'
        },
        {
            fontFamilyReal: 'InpinTianYiHei',
            realName: '印品天逸黑'
        },
        {
            fontFamilyReal: 'Kekeyugongqinyin',
            realName: '可可雨润琴音'
        },
        {
            fontFamilyReal: 'Kekeqingqianjixiangsi',
            realName: '可可清浅寄相思'
        },
        {
            fontFamilyReal: 'Kekenaiyoupaofu',
            realName: '可可奶油泡芙'
        }
    ]
    if (item.css.fontFamily !== '') {
        const result = h2Realfont.filter(v => {
            return item.css.fontFamily === v.fontFamilyReal
        })
        if (result && result.length > 0) {
            item.css.fontFamily = result[0].realName
        }
    }
}

Vue.use(install)
