const dateMap = [1750378, 339370, 6020516, 405156, 314698, 4934293, 371351, 279894, 2804405, 346837, 8115922, 419666, 331429, 4961866, 394827, 297627, 3880278, 370026, 281433, 1759058, 345938, 6019877, 412453, 313931, 4936875, 377517, 288107, 1764201, 355753, 7093650, 429714, 331045, 4954701, 395862, 303798, 3872181, 370388, 282281, 1769106, 347794, 6016294, 402731, 313943, 4936374, 379738, 296660, 2821833, 354121, 7075475, 420499, 329003, 5991003, 387757, 304490, 3881813, 371620, 281417, 1759891, 346773, 7058733, 402742, 314029, 4945322, 378290, 290213, 2825546, 363850, 8120981, 412311, 329046, 5999285, 387797, 304850, 3878565, 372389, 280138, 2796695, 338587, 7066970, 402794, 314217, 4945746, 387922, 289573, 3864139, 354891, 8123563, 410285, 320877, 5999465, 396713, 306578, 3882277, 372005, 10246733, 428630, 336566, 6006197, 403157, 315049, 4947602, 388754, 298278, 2812502, 346711, 8123606, 418650, 321237, 4953801, 395081, 304787, 3872043, 361771, 272987, 1758554, 337258, 7060309, 412580, 322377, 4938387, 379541, 288045, 3861165, 346805, 9172394, 419282, 331173, 6004042, 396618, 306325, 3880238, 361814, 273077, 1758642, 345810, 6008485, 403237, 312907, 4934807, 371883, 288090, 2812630, 355177, 11269970, 420690, 330533, 6003275, 387659, 296107, 4916571, 361901, 273258, 1760082, 347538, 7068965, 404773, 313941, 4936877, 378038, 279989, 2813354, 356041, 8142482, 421522, 331046, 5999190, 387671, 296150, 3868373, 362325, 280393, 2797203, 337555, 7058731, 402731, 305755, 4937050, 378218, 289637, 3864394, 355146, 8125077, 420501, 320813, 5991085, 387765, 304554, 3869605, 363941, 281930, 2808981, 339094, 7059790, 402774, 314037, 4937138, 378578, 290469, 3870282, 345675, 8113303, 410795, 320859, 5991126, 387946, 304978, 3880741, 363301, 273035, 1750171, 337067]

const data = {
    YEAR_MIN: 1890,
    YEAR_MAX: 2100,
    map: dateMap,
    monthNames: ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'],
    dayNames: ['', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'],
    //  天干
    heavenlyStems: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
    // 地支
    earthlyBranches: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
    // 生肖
    animals: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
}

const commonData = {
    zddd: [
        '星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'
    ],
    ddd: [
        'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'
    ],
    Ddd: [
        'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
    ],
    DDD: [
        'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'
    ],
    Dddd: [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ],
    dddd: [
        'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
    ],
    DDDD: [
        'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'
    ],
    mmm: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    mmmm: [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ]
}

const HZDict = {
    0: '零',
    1: '一',
    2: '二',
    3: '三',
    4: '四',
    5: '五',
    6: '六',
    7: '七',
    8: '八',
    9: '九',
    10: '十',
    11: '十一',
    12: '十二',
    13: '十三',
    14: '十四',
    15: '十五',
    16: '十六',
    17: '十七',
    18: '十八',
    19: '十九',
    20: '二十',
    21: '二十一',
    22: '二十二',
    23: '二十三',
    24: '二十四',
    25: '二十五',
    26: '二十六',
    27: '二十七',
    28: '二十八',
    29: '二十九',
    30: '三十',
    31: '三十一'
}

const lunarDate = {
    year: '',
    month: '',
    day: '',
    gYear: '',
    zYear: '',
    animal: '',
    leap: ''
}

function extract(bin, info) {
    info.map = bin & ((1 << 13) - 1)
    info.day = (bin >> 13) & 31
    info.month = bin >> 18 & 1
    info.leapMonth = (bin >> 20) & 15
    info.hasLeapMonth = !!(bin & 1 << 19)
}

function extend(lDate) {
    const offsetYear = lDate.year - 1890 + 26
    lunarDate.gYear = offsetYear % 10
    lunarDate.zYear = offsetYear % 12
    lunarDate.animal = lDate.zYear
}

/**
 * 转为阴历对象
 * 算法参考H5
 * @param {*} date
 */
function convertLunar(date) {
    const sy = date.getFullYear()
    const sm = date.getMonth()
    const sd = date.getDate()
    const map = data.map

    let index = sy - data.YEAR_MIN
    const yearInfo = {}

    lunarDate.year = sy
    extract(map[index], yearInfo)

    if (sm < yearInfo.month || (sm === yearInfo.month && sd < yearInfo.day)) {
        index = index - 1
        lunarDate.year = sy - 1
        extract(map[index], yearInfo)
    }

    const firstDay = new Date(lunarDate.year, yearInfo.month, yearInfo.day)
    const diffDays = (date.getTime() - firstDay.getTime()) / 86400000 >> 0
    let days = 0
    let lunarDays = 0
    let m = 0

    while (m < 14) {
        lunarDays = (yearInfo.map & 1 << m) ? 30 : 29
        days = days + lunarDays
        if (diffDays < days) {
            lunarDate.day = lunarDays - (days - diffDays) + 1
            break
        }

        m = m + 1
    }

    lunarDate.leap = false
    if (yearInfo.hasLeapMonth) {
        if (m === yearInfo.leapMonth + 1) {
            lunarDate.leap = true
        }

        if (m > yearInfo.leapMonth) {
            m = m - 1
        }
    }

    lunarDate.month = m
    extend(lunarDate)

    lunarDate.year = data.heavenlyStems[lunarDate.gYear] + data.earthlyBranches[lunarDate.zYear]
    lunarDate.month = data.monthNames[lunarDate.month]
    lunarDate.day = data.dayNames[lunarDate.day]
    lunarDate.gYear = data.heavenlyStems[lunarDate.gYear]
    lunarDate.zYear = data.earthlyBranches[lunarDate.zYear]
    lunarDate.animal = data.animals[lunarDate.animal]
    lunarDate.leap = lunarDate.leap ? '闰' : ''

    return lunarDate
}

/**
 * 获取日期对象
 * @param {*} date
 */
function parseGDate(date) {
    var timezone = 8 // 目标时区时间，东八区
    var offsetGMT = date.getTimezoneOffset() // 本地时间和格林威治的时间差，单位为分钟
    var nowDate = date.getTime() // 本地时间距 1970 年 1 月 1 日午夜（GMT 时间）之间的毫秒数
    var targetDate = new Date(nowDate + offsetGMT * 60 * 1000 + timezone * 60 * 60 * 1000)

    return {
        year: targetDate.getFullYear(),
        month: targetDate.getMonth(),
        mDay: targetDate.getDate(),
        wDay: targetDate.getDay()
    }
}
/**
 * 数字转换成中文日期
 * @param {*} str 数字日期
 * @param {*} split 是否单个转（仅年需要，月|日直接读取)
 */
function transferHZ(str, split) {
    let res = ''
    if (split) {
        const list = ('' + str).split('')
        list.map((v, i) => {
            res += HZDict[v] + ''
        })
    } else {
        res = HZDict[str]
    }
    return res
}

/**
 * str前截断
 * @param {*} str 原字符串
 * @param {*} len 截取个数
 */
function cutout(str, len) {
    str = '' + str
    return str.substr(str.length - len)
}

/**
 * 向str前面添加字符
 * @param {*} str 原字符串
 * @param {*} count 补全后总个数
 * @param {*} char 字符
 */
function complement(str, count, char) {
    str = '' + str
    if (str.length >= count) return str
    let i = 0
    str = str.split('')
    while (i < (count - str.length)) {
        str.unshift(char)
        i++
    }
    let res = ''
    str.map(v => { res += v })
    return res
}

function dateParse(date = new Date(), format = 'zyyy zy cy yyyy yy MMMM Mmmm mmmm MMM Mmm mmm mm m DDDD dddd DDD ddd dd d ') {
    var gDate = parseGDate(date)
    var nDate = convertLunar(date) // 转为阴历对象
    return format
        .replace('+zyyy', transferHZ(gDate.year, true))
        .replace('+zy', transferHZ(cutout(gDate.year, 2)))
        .replace('+yyyy', gDate.year)
        .replace('+yy', cutout(gDate.year, 2))

        .replace('+MMMM', commonData.mmmm[gDate.month].toUpperCase())
        .replace('+Mmmm', commonData.mmmm[gDate.month])
        .replace('+mmmm', commonData.mmmm[gDate.month].toLowerCase())

        .replace('+MMM', commonData.mmm[gDate.month].toUpperCase())
        .replace('+Mmm', commonData.mmm[gDate.month])
        .replace('+mmm', commonData.mmm[gDate.month].toLowerCase())

        .replace('+mm', complement(gDate.month + 1, 2, '0'))
        .replace('+zm', transferHZ(gDate.month + 1))
        .replace('+m', gDate.month + 1)

        .replace('+DDDD', commonData.dddd[gDate.wDay].toUpperCase())
        .replace('+dddd', commonData.dddd[gDate.wDay])
        .replace('+Dddd', commonData.dddd[gDate.wDay].charAt(0).toUpperCase() + commonData.dddd[gDate.wDay].substr(1))
        .replace('+ddd', commonData.dddd[gDate.wDay].substr(0, 3))
        .replace('+Ddd', commonData.dddd[gDate.wDay].charAt(0).toUpperCase() + commonData.dddd[gDate.wDay].substr(1, 2))
        .replace('+DDD', commonData.dddd[gDate.wDay].substr(0, 3).toUpperCase())
        .replace('+zddd', commonData.zddd[gDate.wDay])

        .replace('+dd', complement(gDate.mDay, 2, '0'))
        .replace('+zd', transferHZ(gDate.mDay))
        .replace('+d', gDate.mDay)

        .replace('+cy', nDate.year)
        .replace('+cm', nDate.month)
        .replace('+cd', nDate.day)
}

export {
    dateParse
}
