import { host } from '../config/env'
import qs from 'qs'

let token = ''
let tokenTime = 0
const tokenExpired = 50 * 60 * 1000 // 50分钟重新调接口
export default {
    getUploadFiles,
    getUploadToken,
    saveFile,
    batchSaveFile,
    uploadBase64,
    deleteFiles,
    saveToH5,
    previewRelease,
    getLegalImageUrl,
    getImageInfo,
    getVideoByGif,
    getGifVideo,
    uploadVideo,
    updatePrintPage,
    qrcodeReader,
    getWSUploadCode
}

/**
 * 获取文件
 * @param url 接口
 * @param pageNo
 * @param pageSize
 * @param fileType 1 图片文件 2 音频文件 3 视频文件 4 文本文件 5 Office文件
 * @param bizType 0 所有业务线统一成0，由后端直接传，前端不用传
 * @param tagId
 * @returns {*}
 */
function getUploadFiles({ pageNo, pageSize, tagId }) {
    return axios.get(`${host.p1}/m/base/file/userList`, {
        params: {
            pageNo,
            pageSize,
            fileType: 1,
            tagId
        }
    })
}

/**
 * 获取上传文件需要的token
 */
function getUploadToken(type = 'image') {
    const notExpired = token && Date.now() - tokenTime <= tokenExpired
    return notExpired
        ? Promise.resolve(token)
        : axios.get(`${host.p1}/mobile/file/upload/uptoken`, {
            params: {
                mediaType: type
            }
        }).then(res => {
            token = res.data.obj
            tokenTime = Date.now()
            return token
        })
}

/**
 * 上传文件
 * @param {*} data
 */
function saveFile(data) {
    return axios.post(`${host.p1}/m/base/file/info/save`, data)
}
/**
 * 批量上传文件保存
 * @param {*} data
 */
function batchSaveFile(data) {
    return axios.post(`${host.p1}/m/base/file/info/batchSave`, data)
}

/**
 * 删除文件
 * @param fileIds
 * @param backup 是否进入回收站，不传值代码需要
 * @returns {*}
 */
function deleteFiles(fileIds, backup) {
    return axios.post(`${host.p1}/m/base/file/delete`, qs.stringify({ ids: fileIds, backup }, { arrayFormat: 'repeat' }))
}

/**
 * qiniu上传base64图片
 * @param base64
 * @param token
 */
function uploadBase64(base64, token) {
    return axios.post('//upload.qiniup.com/putb64/-1', base64, {
        withCredentials: false,
        ignoreInterceptor: true,
        headers: {
            'Content-Type': 'application/octet-stream',
            Authorization: 'UpToken ' + token
        }
    })
}

/**
 * 保存文件到h5
 * @param
 * @param
 */
function saveToH5(tagId, list, productionId) {
    if (list && list.length > 0) {
        list.map((v) => {
            v.storageType = 1 // 1 作品转素材
            v.source = 'P010005'
            v.uploadType = 0 // 0 PC本地上传
            v.productionId = productionId
            v.productionType = 0 // 0 表示从轻设计转到素材库的
        })
    }
    const obj = {
        tagId: tagId,
        list
    }
    return axios.post(`${host.p1}/m/print/save/file`, obj, {
        headers: {
            'Content-Type': 'text/plain; charset=UTF-8'
        }
    })
}
/**
 * 发布预览
 * @param
 * @param
 */
function previewRelease(params) {
    return axios.post(`${host.p1}/m/print/share/check`, params, {
        headers: {
            'Content-Type': 'text/plain; charset=UTF-8'
        }
    })
}

/**
 * 跨域图片上传后台
 * 返回七牛地址
 * @param path
 */
function getLegalImageUrl(filePath) {
    const url = `${host.p1}/print/matting/upload2QiniuByRemoteImage`
    return axios.post(url, { filePath })
}

/**
 * 返回七牛云图片的基本信息
 * 图片类型
 * 图片宽高
 * @param {sting} path
 */
function getImageInfo(path) {
    const url = `${host.file}${path}?imageInfo`
    return axios.get(url, {
        withCredentials: false,
        ignoreInterceptor: true
    })
}

/**
 * 通过gif 得到转换的视频
 * @param {Array} dataArr 数组 里面是gif的地址
 */
function getVideoByGif(dataArr) {
    const url = `${host.videoservice}/video/user/gif/getGif`
    return axios.post(url, dataArr, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

/**
 * gif转视频
 */
function getGifVideo(gifAddressArr) {
    const url = `${host.p1}/m/print/getGifVideo`
    return axios.post(url, gifAddressArr, {
        headers: { 'Content-Type': 'text/plain; charset=UTF-8' }
    })
}

/**
 * 上传video到视频库
 * @param {Array} dataArr 数组 里面是gif的地址
 */
function uploadVideo(videoUrl, title, fileType = 3) {
    const url = `${host.videoservice}/video/user/template/uploadN`
    return axios.post(url, {
        url: videoUrl, title, fileType
    }, {
        headers: {
            'Content-Type': 'application/json; charset=UTF-8'
        }
    })
}

/**
 * 上传video到视频库
 * @param {Array} dataArr 数组 里面是gif的地址
 */
function updatePrintPage(id, printId, pureCover) {
    const url = `${host.p1}/print/updatePrintPage`
    return axios.post(url, {
        id, printId, pureCover
    }, {
        headers: {
            'Content-Type': 'application/json; charset=UTF-8'
        }
    })
}

/**
 * 二维码识别
 * 返回识别内容
 * @param path  七牛图片地址
 */
function qrcodeReader(urlPath) {
    return axios.get(`${host.p1}/print/matting/deEncodeByUrlPath`, {
        params: {
            urlPath
        },
        ignoreInterceptor: true
    })
}

/**
 * 获取手机上传图片的code
 * 用于安全性验证使用
 */
function getWSUploadCode(path) {
    const url = `${host.p1}/m/print/user/encode`
    return axios.get(url, {
        ignoreInterceptor: true
    })
}
