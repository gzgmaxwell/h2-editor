
import wechat from '../../../../../img/helper/qrhelper_wechat.png'
import card from '../../../../../img/helper/qrhelper_card.png'
import text from '../../../../../img/helper/qrhelper_text.png'
import link from '../../../../../img/helper/qrhelper_link.png'
import upload from '../../../../../img/helper/qrhelper_upload.png'
import work from '../../../../../img/helper/qrhelper_work.png'
import map from '../../../../../img/helper/qrhelper_map.png'

const artQrcodeHelperData = [
    {
        type: 'wechat',
        title: '微信公众号二维码', // 主标题
        subTitle: '主要用于公众号推广', // 副标题
        content: wechat
    }, {
        type: 'text',
        title: '文本二维码', // 主标题
        subTitle: '主要用于文本信息的展示', // 副标题
        content: text
    }, {
        type: 'card',
        title: '名片二维码', // 主标题
        subTitle: '主要用于个人名片的展示', // 副标题
        content: card
    }, {
        type: 'work',
        title: '作品二维码', // 主标题
        subTitle: '可以更方便的展示您的作品', // 副标题
        content: work
    }, {
        type: 'link',
        title: '链接二维码', // 主标题
        subTitle: '主要用于网页浏览', // 副标题
        content: link
    }, {
        type: 'map',
        title: '地图二维码', // 主标题
        subTitle: '主要用于查看地址', // 副标题
        content: map
    }, {
        type: 'upload',
        title: '上传二维码', // 主标题
        subTitle: '通过电脑、手机、粘贴上传，更便捷', // 副标题
        content: upload
    }
]

export default artQrcodeHelperData
