// 账号类型
// (userType == 1) "普通账号";
// (userType == 2) “企业账号”
// (userType == 21) “老的企业账号的子账号”
// (userType == 22) “新的营销云会员的子账号”
// (userType == 5) “公共账号”
// (userType == 51) “公共账号的子账号”
// (userType == 4) “服务商账号”，即“秀客账号”
// (userType == 98) “代理商账号”
// (userType == 99) “运维账号”，即“超级账号”

const env = require('env')
const type = {
    applyTpl: [4],
    uploadPsd: [4, 99],
    uploadPdf: [4, 99],
    eip: [1, 4, 98, 99, 2, 21, 22],
    buyMember: [1, 2, 99],
    gifUploadUsing: [4, 99], // gif upload只开放给秀客账号,超级账号
    layerControl: [4, 99], // 组件标签控制
    previewAllowUpload: [4, 99], // [4,99] 只允许秀客和超级账号才能上传封面
    showComponentWarning: [4], // 只有秀客才提示组件提醒
    showArtQrcode: [4, 99], // 只有秀客和超级账户才能看到和编辑艺术二维码
    baseImageEditor: [99], // 图片美化目前开放给超级账号
    fullImageBaseRights: [99] // 只有超级账号才有图片编辑器基础模块的全部权限
}

const role = {
    copyright: env.role.copyright
}

export default {
    type,
    role
}
