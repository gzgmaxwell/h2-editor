
/**
 * 生成guid
 */
function guid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }
    // return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
    return S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4()
}

/**
 * 让七牛支持多文件上传
 */
export function uploadQiniu(options) {
    var defaultOptions = {
        token: '',
        files: [],
        mimeType: [],
        maxFileName: 50,
        maxFileSize: 10,
        maxCount: 20,
        onFilesAdded() { },
        onUploadProgress() { },
        onFileUploaded() { },
        onError() { }
    }

    options = Object.assign(defaultOptions, options)

    options.onFilesAdded()

    // 多文件串行上传
    var result = Promise.resolve()
    options.files.forEach(function (file, i) {
        result = result.then(function () {
            return uploadWithSDK(options, i)
        })
    })
    result
        .catch(function (err) {
            options.onError(err)
        })
}

/**
 * 使用七牛2.x版sdk上传
 */
function uploadWithSDK(options, i) {
    return new Promise(function (resolve, reject, notify) {
        var config = {
            useCdnDomain: true,
            disableStatisticsReport: false,
            retryCount: 6
            // region: window.qiniu.region.z2
        }
        var putExtra = {
            fname: '',
            params: {},
            mimeType: options.mimeType
        }
        var observer = {
            next: function (res) {
                // 计算单个在总数中的进度
                var percent = (i / options.files.length * 100) + (1 / options.files.length * res.total.percent)
                options.onUploadProgress(percent)

                options.uploadProgressEach && options.uploadProgressEach(res.total.percent, i)
            },
            error: function (err) {
                options.uploadProgressEach && options.uploadProgressEach(0, i, -1)
                reject(err)
            },
            complete: function (res) {
                var isEnd = options.files.length === i + 1
                options.onFileUploaded(res, isEnd)
                resolve(res)
            }
        }
        var observable = window.qiniu.upload(options.files[i], guid(), options.token, putExtra, config)
        observable.subscribe(observer)
    })
}
