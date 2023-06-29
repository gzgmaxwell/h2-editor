import qrcodeType from '../../../../../config/enum.qrcode.type'
import qrcodeWork from '../../../../../img/qrcode_work.png'
import qrcodeLink from '../../../../../img/qrcode_link.png'
import qrcodeMap from '../../../../../img/qrcode_map.png'
import qrcodeText from '../../../../../img/qrcode_text.png'
import qrcodeCard from '../../../../../img/qrcode_card.png'
import qrcodeWeChat from '../../../../../img/qrcode_wechat.png'

const qrcodeList = [
    {
        name: '我的作品',
        qcType: qrcodeType.work,
        imgSrc: qrcodeWork
    }, {
        name: '链接',
        qcType: qrcodeType.link,
        imgSrc: qrcodeLink
    }, {
        name: '公众号',
        qcType: qrcodeType.wechat,
        imgSrc: qrcodeWeChat
    }, {
        name: '地图',
        qcType: qrcodeType.map,
        imgSrc: qrcodeMap
    }, {
        name: '名片',
        qcType: qrcodeType.card,
        imgSrc: qrcodeCard
    },
    {
        name: '文本',
        qcType: qrcodeType.text,
        imgSrc: qrcodeText
    }
]

export default qrcodeList
