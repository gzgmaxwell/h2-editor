import { uploadQiniu } from '../../utils/qiniuUpload'
import delayLoad from '../../utils/delayLoad'
import statistic from '../../config/statistic'
import authority from '../../config/authority'
import gifParse from '../../utils/gifParsing'
import Compressor from '../../utils/compressor.min'

export default {
    bind($el, binding) {
        const defaultOptions = {
            token: '',
            files: [],
            mimeType: ['image/png', 'image/jpeg'],
            maxFileName: 50,
            maxFileSize: 10,
            maxCount: 20,
            maxGifFrames: 30,
            onFilesAdded() { },
            onUploadProgress() { },
            onFileUploaded() { },
            onUploadComplete() { },
            onError() { },
            dataArr: [], // 用于批量提交保存的
            allData: [] // 用户存储批量上传返回的所有数据  便于一次性处理
        }
        if (checkUserCanUploadGif()) {
            defaultOptions.mimeType = ['image/png', 'image/jpeg', 'image/gif']
        }
        const value = Object.assign(defaultOptions, binding.value)

        if (value.type) {
            value.mimeType = ['image/png', 'image/jpeg'] // 背景图片上传不能有gif
            if (value.type === 'logo') {
                value.maxFileSize = 2
            }
            if (value.type === 'shape') { // 字云自定义形状图片 只允许上传2M内的png
                value.mimeType = ['image/png']
                value.maxFileSize = 2
            }
            if (value.type === 'sign') {
                value.mimeType = ['image/png', 'image/jpeg']
                value.maxFileName = 500
                value.maxFileSize = 5
            }
            if (value.type === 'customUploadQrcode') {
                value.mimeType = ['image/png', 'image/jpeg']
                value.maxFileSize = 5
            }
            if (value.type === 'artqrcode') {
                // 艺术二维码 border 允许上传不超过200k  其余的允许上传不超过50k
                value.mimeType = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/svg-xml'] // 艺术二维码允许上传svg格式的文件
                value.maxCount = 1 // 只允许上传一个文件
                if (value.subType) {
                    if (value.subType === 'border') {
                        value.maxFileSize = 0.2
                    } else if (value.subType === 'normal') {
                        value.maxFileSize = 0.05
                    } else if (value.subType === 'batch') {
                        value.maxCount = 20
                    }
                }
            }
            if (value.type === 'aimatting') {
                value.mimeType = ['image/png', 'image/jpeg']
                value.maxFileSize = 6
                value.maxCount = 1
            }
            if (value.type === 'photo') {
                value.mimeType = ['image/png', 'image/jpeg']
                value.maxFileSize = 10
                value.maxCount = 1
            }
        }
        const $input = createInput(value.mimeType, value.maxCount)
        const options = getOptions($el, $input, value)
        bindEvent(options)
        $el.appendChild($input)
        $el.addEventListener('click', () => {
            $el.querySelector('input').click()
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.UP,
                statistic.opt_label.UP.pc])
        })
    }
}
function checkUserCanUploadGif() {
    const userType = Vue.store.state.user.userInfo.type
    return authority.type.gifUploadUsing.includes(userType)
}
/**
 * 创建input元素
 * @param {*} mimeType
 * @param {*} maxCount
 */
function createInput(mimeType, maxCount) {
    const $input = document.createElement('input')
    $input.css({
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        cursor: 'pointer',
        zIndex: -1
    })
    $input.attr({
        type: 'file',
        accept: mimeType.join(',')
    })
    if (maxCount > 1) {
        $input.attr({ multiple: '' })
    }
    return $input
}

/**
 * 给input绑定change事件
 * @param {*} options
 */
function bindEvent(options) {
    const { type, subType } = options
    const ignore = type === 'artqrcode' && subType === 'batch'
    options.$input.addEventListener('change', function () {
        options.files = Array.from(this.files)
        if (options.onCheckStart) {
            // 全部文件都校验不过 直接return 循环遍历的去上传
            if (checkMemberFile(options)) {
                return
            }
        }
        compressFiles(options.files, options.mimeType, ignore).then(files => {
            options.files = files
            checkFiles(options).then(state => {
                if (state) {
                    options.allData = []
                    options.dataArr = []
                    uploadFile(options)
                }
            })
        })
    })
}
/**
 * checkMemberFile // 只校验图片格式和图片大小和图片数量
 * @param {*} options
 */
function checkMemberFile(options) {
    if (Vue.store.state.user.userInfo.rights.uploadLimit) {
        options.maxFileSize = Vue.store.state.user.userInfo.rights.uploadLimit
    } else {
        options.maxFileSize = 10
    }
    // 最多只能上传20个文件 有多余的话 截取前20个
    if (options.files.length > options.maxCount) {
        Vue.notifier.warn('文件个数限制在' + options.maxCount + '个内')
        options.files.length = 20
    }
    const fileArr = [] // 保存校验通过正确的文件
    const allFiles = [] // 保存全部的文件 包括失败的
    options.files.forEach(file => {
        // state: 0 等待上传 1 上传成功 2上传失败
        if (file.size / 1024 / 1024 > options.maxFileSize) {
            file.state = 2
            file.info = '超过' + options.maxFileSize + 'M'
        } else if (!options.mimeType.includes(file.type)) {
            file.state = 2
            file.info = '文件类型不对'
        } else if (file.name.length >= options.maxFileName) {
            file.state = 2
            file.info = '文件名超长'
        } else {
            file.state = 0
            fileArr.push(file)
        }
        allFiles.push(file)
    })
    options.files = fileArr
    options.allFiles = allFiles
    options.onCheckStart(options)
    return fileArr.length === 0
}

/**
 * 重置input元素
 * @param {*} options
 */
function resetInput(options) {
    options.$input.remove()
    options.$input = createInput(options.mimeType, options.maxCount)
    bindEvent(options)
    options.$el.appendChild(options.$input)
}
function getObjectURL(file) {
    let url = null
    if (window.createObjectURL !== undefined) {
        url = window.createObjectURL(file)
    } else if (window.webkitURL !== undefined) {
        url = window.webkitURL.createObjectURL(file)
    } else if (window.URL !== undefined) {
        url = window.URL.createObjectURL(file)
    }
    return url
}

// 校验gif帧数是否超过30帧
function checkGifFileFrame(url) {
    return new Promise(resolve => {
        gifParse.getArrayBuffer(url).then((result) => {
            return result
        }).then((result) => {
            // 第二步解析成帧
            return gifParse.getInfo(result)
        }).then(result => {
            resolve(result.frames.length > 30)
        })
    })
}
/**
 * 检查上传的文件是否符合要求
 * @param {*} options
 */
function checkFiles(options) {
    let fileNameTips = false
    let fileSizeTips = false
    let fileTypeTips = false
    let flag = true
    let gifFrameTips = false
    let gifFlag = false
    const gifCheckState = []
    let gifFileCount = 0
    const batchCheck = options.type === 'artqrcode' && options.subType === 'batch'

    if (!options.files.length) {
        flag = false
    }

    return new Promise((resolve) => {
        options.files.forEach(file => {
            if (file.name.length >= options.maxFileName) {
                fileNameTips = true
            }
            if (batchCheck) {
                if (file.name === 'border.svg') {
                    if (file.size / 1024 / 1024 > 0.2) {
                        fileSizeTips = true
                    }
                } else {
                    if (file.size / 1024 / 1024 > 0.05) {
                        fileSizeTips = true
                    }
                }
            } else {
                if (file.size / 1024 / 1024 > options.maxFileSize) {
                    fileSizeTips = true
                }
            }

            if (!options.mimeType.includes(file.type)) {
                fileTypeTips = true
            }
            if (checkUserCanUploadGif()) {
                const filesuffiex = file.name.substring(file.name.lastIndexOf('.') + 1)
                if (filesuffiex === 'gif') {
                    gifFileCount++
                    gifFlag = true
                    const url = getObjectURL(file)
                    checkGifFileFrame(url).then(state => {
                        gifFrameTips = state
                        gifCheckState.push(state)
                        if (gifFrameTips) {
                            Vue.notifier.warn('GIF文件帧数限制在' + options.maxGifFrames + '以内')
                            flag = false
                        }
                        if (gifCheckState.length === gifFileCount) {
                            const fileState = gifCheckState.every(item => item)
                            resolve(flag && !fileState)
                        }
                    })
                }
            }
        })
        if (fileTypeTips) {
            Vue.notifier.warn('文件类型不符合条件，请选择允许的文件格式上传！')
            flag = false
        }
        if (fileNameTips) {
            Vue.notifier.warn('文件名称限制在' + options.maxFileName + '个字符内')
            flag = false
        }
        if (fileSizeTips) {
            if (batchCheck) {
                Vue.notifier.warn('艺术二维码上传边框图片大小不能超过200k，其余元素不能超过50k！')
            } else {
                Vue.notifier.warn('文件大小限制在' + options.maxFileSize + 'M内')
            }
            flag = false
        }
        if (options.maxCount && options.files.length > options.maxCount) {
            Vue.notifier.warn('文件个数限制在' + options.maxCount + '个内')
            flag = false
        }
        if (!flag) {
            options.$input.value = ''
        }
        if (!gifFlag) {
            resolve(flag)
        }
    })
}

/**
 * 获取上传需要的参数
 * @param {*} upload
 */
function getOptions($el, $input, params) {
    const options = Object.assign({}, params)
    Object.assign(options, {
        $el,
        $input,
        onFileUploaded(res, isEnd) {
            const { key, name, size } = res
            const data = {
                path: key,
                tmbPath: key,
                name: name,
                size: parseInt(size / 1024),
                fileType: Vue.enum.fileType.printImage,
                tagId: Vue.store.state.scene.chooseUploadTagId,
                storageType: 0, // 用户上传 1 作品转素材  2 二次编辑转存素材
                source: 'P010005',
                uploadType: 0 // 0 PC本地上传 1 app上传 2 手机扫码上传 3 小程序本地上传
            }
            options.allData.push(res)
            options.dataArr.push(data)
            params.onFileUploaded(res, isEnd)
            if (isEnd) {
                if (options.type === 'artqrcode') {
                    // 艺术二维码的上传 不需要保存
                    resetInput(options)
                    Vue.notifier.success('上传成功')
                    res.allData = options.allData
                    params.onUploadComplete(res)
                } else {
                    Vue.api.file.batchSaveFile(JSON.stringify(this.dataArr)).then(() => {
                        resetInput(options)
                        Vue.notifier.success('上传成功')
                        res.allData = options.allData
                        params.onUploadComplete(res)
                    }).catch(err => err && Vue.logger.error(err))
                }
            }
        },
        onError(err) {
            let includeGifFlag = false
            const fileArr = options.files
            fileArr.forEach(item => {
                const filesuffiex = item.name.substring(item.name.lastIndexOf('.') + 1)
                if (filesuffiex === 'gif') {
                    includeGifFlag = true
                }
            })
            resetInput(options)
            Vue.logger.info(err)
            if (includeGifFlag && !checkUserCanUploadGif()) {
                Vue.notifier.fail('上传失败，您没有权限上传gif文件！')
            } else if (includeGifFlag && options.type && options.type === 'background') {
                Vue.notifier.fail('背景图暂不支持gif格式文件！')
            } else if (includeGifFlag && options.type && options.type === 'logo') {
                Vue.notifier.fail('LOGO暂不支持gif格式文件！')
            } else {
                Vue.notifier.fail('上传失败，请刷新后重试')
            }

            params.onError()
        }
    })
    return options
}

/**
 * 上传文件
 * @param {*} options
 */
function uploadFile(options) {
    const promise1 = Vue.api.file.getUploadToken()
    const promise2 = delayLoad.delayLoadJS(Vue.env.plugin.qiniu2)
    Promise.all([promise1, promise2])
        .then(([token]) => {
            options.token = token
            uploadQiniu(options)
        })
        .catch(err => {
            err && Vue.logger.error(err)
            resetInput(options)
        })
}

/**
 * 压缩文件
 */
function compressFiles(files, mimeType, ignore = false) {
    return new Promise((resolve, reject) => {
        const cpsReqs = []
        const imgComps = file => {
            return new Promise((resolve, reject) => {
                /* eslint-disable no-new */
                new Compressor(file, {
                    maxWidth: 5000,
                    maxHeight: 5000,
                    quality: 1.0,
                    convertSize: Infinity,
                    success(result) {
                        resolve(result)
                    },
                    error(err) {
                        console.log(err.message)
                        reject(err)
                    }
                })
            })
        }
        const gifComps = file => {
            return Promise.resolve(file)
        }
        const otherComps = file => {
            return Promise.resolve(file)
        }
        for (const item of files) {
            if (item.type === 'image/gif') { // gif文件不压缩
                cpsReqs.push(gifComps(item))
            } else if (mimeType.includes(item.type) && item.type !== 'image/svg+xml' && !ignore) { // 符合上传文件类型的才压缩
                cpsReqs.push(imgComps(item))
            } else { // 不符合上传文件类型的不压缩
                cpsReqs.push(otherComps(item))
            }
        }
        Promise.all(cpsReqs).then((res) => {
            resolve(res)
        }).catch((error) => { reject(error) })
    })
}
