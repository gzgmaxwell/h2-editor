import { uploadQiniu } from '../../utils/qiniuUpload'
import delayLoad from '../../utils/delayLoad'
import statistic from '../../config/statistic'
export default {
    bind($el, binding) {
        const defaultOptions = {
            token: '',
            files: [],
            mimeType: ['image/png', 'image/jpeg'],
            maxFileName: 50,
            maxFileSize: 10,
            maxCount: 1, // 上传的封面图片只允许一个
            onFilesAdded() { },
            onUploadProgress() { },
            onFileUploaded() { },
            onUploadComplete() { },
            onError() { }
        }
        const value = Object.assign(defaultOptions, binding.value)
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
    options.$input.addEventListener('change', function () {
        options.files = Array.from(this.files)

        checkFiles(options).then(state => {
            if (state) {
                uploadFile(options)
            }
        })
    })
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
/**
 * 检查上传的文件是否符合要求
 * @param {*} options
 */
function checkFiles(options) {
    let fileNameTips = false
    let fileSizeTips = false
    let flag = true
    if (!options.files.length) {
        flag = false
    }

    return new Promise((resolve) => {
        options.files.forEach(file => {
            if (file.name.length >= options.maxFileName) {
                fileNameTips = true
            }
            if (file.size / 1024 / 1024 > options.maxFileSize) {
                fileSizeTips = true
            }
        })
        if (fileNameTips) {
            Vue.notifier.warn('文件名称限制在' + options.maxFileName + '个字符内')
            flag = false
        }
        if (fileSizeTips) {
            Vue.notifier.warn('文件大小限制在' + options.maxFileSize + 'M内')
            flag = false
        }
        if (options.maxCount && options.files.length > options.maxCount) {
            Vue.notifier.warn('文件个数限制在' + options.maxCount + '个内')
            flag = false
        }

        var reader = new FileReader()
        reader.readAsDataURL(options.files[0])
        reader.onload = function (evt) {
            var image = new Image()
            image.onload = function () {
                var width = this.width
                var height = this.height
                if (width !== height) {
                    Vue.notifier.warn('上传的封面必须是正方形！')
                    flag = false
                } else if (width < 300 || width > 1000 || height < 300 || height > 1000) {
                    Vue.notifier.warn('长宽的范围为300px到1000px之间！')
                    flag = false
                }
                resolve(flag)
            }
            image.src = evt.target.result
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
            params.onUploadComplete(res)
        },
        onError(err) {
            resetInput(options)
            console.log(err)
            if ((err + '').indexOf('file type doesn\'t match with what you specify') !== -1) {
                Vue.notifier.fail('暂不支持该类型的文件上传！')
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
            err && console.log(err)
            resetInput(options)
        })
}
