import photo from '../../../img/emp/emp_0.png'
import print from '../../../img/emp/emp_1.png'
import ikon from '../../../img/emp/emp_2.png'
import page from '../../../img/emp/emp_3.png'
import mobile from '../../../img/emp/emp_4.png'
import video from '../../../img/emp/emp_5.png'

const emptyList = [
    {
        name: '照片',
        list: [
            { config: true, cover: photo, name: '1寸', width: 295, height: 413, unit: 'px' },
            { config: true, cover: photo, name: '2寸', width: 413, height: 625, unit: 'px' },
            { config: true, cover: photo, name: '小1寸', width: 259, height: 377, unit: 'px' },
            { config: true, cover: photo, name: '小2寸', width: 413, height: 531, unit: 'px' },
            { config: true, cover: photo, name: '护照', width: 390, height: 567, unit: 'px' },
            { config: true, cover: photo, name: '赴美签证', width: 602, height: 602, unit: 'px' },
            { config: true, cover: photo, name: '驾照', width: 260, height: 378, unit: 'px' },
            { config: true, cover: photo, name: '日本签证', width: 531, height: 531, unit: 'px' }
        ]
    },
    {
        name: '打印',
        list: [
            { config: true, cover: print, name: 'A4', width: 210, height: 297, unit: 'mm' },
            { config: true, cover: print, name: 'A3', width: 297, height: 420, unit: 'mm' },
            { config: true, cover: print, name: 'A5', width: 148, height: 210, unit: 'mm' },
            { config: true, cover: print, name: 'A6', width: 105, height: 148, unit: 'mm' },
            { config: true, cover: print, name: 'B4', width: 250, height: 353, unit: 'mm' },
            { config: true, cover: print, name: 'B5', width: 176, height: 250, unit: 'mm' },
            { config: true, cover: print, name: 'C5', width: 162, height: 229, unit: 'mm' },
            { config: true, cover: print, name: 'C6', width: 114, height: 162, unit: 'mm' }
        ]
    },
    {
        name: '图稿和插图',
        list: [
            { config: true, cover: ikon, name: '1000 像素网格', width: 1000, height: 1000, unit: 'px' },
            { config: true, cover: ikon, name: '2000 像素网格', width: 2000, height: 2000, unit: 'px' },
            { config: true, cover: ikon, name: '明信片', width: 1200, height: 1800, unit: 'px' },
            { config: true, cover: ikon, name: '1080p', width: 1920, height: 1080, unit: 'px' },
            { config: true, cover: ikon, name: '720p', width: 1280, height: 720, unit: 'px' }
        ]
    },
    {
        name: '网页',
        list: [
            { config: true, cover: page, name: '网页-最常见尺寸', width: 1366, height: 768, unit: 'px' },
            { config: true, cover: page, name: '网页-大尺寸', width: 1920, height: 1080, unit: 'px' },
            { config: true, cover: page, name: '网页-中尺寸', width: 1440, height: 900, unit: 'px' },
            { config: true, cover: page, name: '网页-最小尺寸', width: 1024, height: 768, unit: 'px' },
            { config: true, cover: page, name: '网页-小尺寸', width: 1280, height: 800, unit: 'px' },
            { config: true, cover: page, name: 'MacBook Pro 12', width: 2560, height: 1600, unit: 'px' },
            { config: true, cover: page, name: 'MacBook Pro 15', width: 2880, height: 1800, unit: 'px' },
            { config: true, cover: page, name: 'iMac 27', width: 2560, height: 1440, unit: 'px' }
        ]
    },
    {
        name: '移动设备',
        list: [
            { config: true, cover: mobile, name: 'iPhone X', width: 1125, height: 2436, unit: 'px' },
            { config: true, cover: mobile, name: 'iPhone 8/7/6 Plus', width: 1242, height: 2208, unit: 'px' },
            { config: true, cover: mobile, name: 'iPhone 8/7/6', width: 750, height: 1334, unit: 'px' },
            { config: true, cover: mobile, name: 'Android 1080p', width: 1080, height: 1920, unit: 'px' },
            { config: true, cover: mobile, name: 'iPhone 5', width: 640, height: 1136, unit: 'px' }
        ]
    },
    {
        name: '视频',
        list: [
            { config: true, cover: video, name: 'HDTV 1080p', width: 1920, height: 1080, unit: 'px' },
            { config: true, cover: video, name: 'HDV/HDTV 720p', width: 1280, height: 720, unit: 'px' },
            { config: true, cover: video, name: 'HDV 1080p', width: 1140, height: 1080, unit: 'px' },
            { config: true, cover: video, name: 'DVCPRO HD 720p', width: 960, height: 720, unit: 'px' },
            { config: true, cover: video, name: 'DVCPRO HD 1080p', width: 1280, height: 1080, unit: 'px' },
            { config: true, cover: video, name: 'DCI 2K 1080p', width: 2048, height: 1080, unit: 'px' },
            { config: true, cover: video, name: 'UHDTV/4K 2160p', width: 3840, height: 2160, unit: 'px' },
            { config: true, cover: video, name: 'NTSC CV ', width: 720, height: 480, unit: 'px' }
        ]
    }
]

export default emptyList
