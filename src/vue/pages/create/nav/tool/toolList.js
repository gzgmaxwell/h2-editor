import artQrcode from '../../../../../img/tool-artqrcode.png'
import wordCloud from '../../../../../img/tool-wordcloud.png'
import logoHandle from '../../../../../img/tool-logohandle.png'
import tablePng from '../../../../../img/table.png'
import baseImage from '../../../../../img/tool-baseimg.png'
import puzzle from '../../../../../img/photos.svg'
const toolList = [{
    name: '艺术二维码',
    label: '各种好玩、有趣的创意二维码，让你的二维码也有艺术范儿',
    type: 'artQrcode',
    imgPath: artQrcode,
    imgWidth: '40px', // 图片会被嵌套在一个68*68的div中 注意图片宽高 不要设置来超过68*68
    imgHeight: '40px',
    backgroundColor: '#1593ff',
    degree: 'hot' // 程度 point hot new beta
},
{
    name: '自定义抠图',
    label: '通过涂抹的方式保留或抠除图像，两步就搞定',
    type: 'matting',
    imgPath: logoHandle,
    imgWidth: '40px',
    imgHeight: '40px',
    backgroundColor: '#1593ff'
    // degree: 'beta'
},
{
    name: '文字云',
    label: '输入您的关键词，选择形状，一键生成酷炫的文字云',
    type: 'wordCloud',
    imgPath: wordCloud,
    imgWidth: '40px',
    imgHeight: '40px',
    backgroundColor: '#1593ff',
    degree: 'v2.0'
},
// {
//     name: 'LOGO处理',
//     label: '一键抠除背景、背景颜色填充、LOGO颜色更换',
//     type: 'logo',
//     imgPath: logoHandle,
//     imgWidth: '40px',
//     imgHeight: '40px',
//     backgroundColor: 'rgba(80,213,226,1)',
//     degree: 'beta'
// },
// {
//     name: '二维码',
//     label: '支持作品、链接、微信公众号、位置、文本、名片等二维码',
//     type: 'qrcode',
//     imgPath: qrcode,
//     imgWidth: '40px', // 图片会被嵌套在一个68*68的div中 注意图片宽高 不要设置来超过68*68
//     imgHeight: '40px',
//     backgroundColor: 'rgba(47,60,77,1)'
// },
{
    name: '表格',
    label: '像编辑文字一样，轻松创建统计表格',
    type: 'table',
    imgPath: tablePng,
    imgWidth: '40px',
    imgHeight: '40px',
    backgroundColor: '#1593ff',
    degree: 'new'
},
{
    name: '拼图',
    label: '多张照片合成一张图片集合，排版更方便',
    type: 'puzzle',
    imgPath: puzzle,
    imgWidth: '68px',
    imgHeight: '68px',
    backgroundColor: '',
    degree: 'beta'
},
{
    name: '图片美化',
    label: '可以裁剪、旋转/矫正、美化图片调整颜色等基础功能',
    type: 'baseimage',
    imgPath: baseImage,
    imgWidth: '40px',
    imgHeight: '40px',
    backgroundColor: '#1593ff'
    // degree: 'beta'
}]

export default toolList
