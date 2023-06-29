import { uploadQiniu } from '../../../../../utils/qiniuUpload'
import delayLoad from '../../../../../utils/delayLoad'
import loader from '../../../../../utils/loader'
import util from '../../../../../utils/util'
import elementType from '../../../../../config/enum.element.type'
import statistic from '../../../../../config/statistic'
import authority from '../../../../../config/authority'

const viewSize = 180
const thumbSize = 124
let onDrop = null
let onDragOver = null
let onCopy = null
let onPaste = null
const scene = Vue.store && Vue.store.state.photoScene
const legalpages = ['/h2/create/', '/h2/qrcode', '/h2/photo', '/h2/aimatting']

export default {
    bind($el, binding) {
        const { upload, artqrcode, editor } = binding.value
        const options = getOptions(upload, artqrcode, editor)

        createInput($el)

        onDrop = e => {
            // firefox阻止图片在浏览器中打开
            e.preventDefault()

            options.files = Array.from(e.dataTransfer.files).filter(file => options.mimeType.includes(file.type))

            if (checkFiles(options)) {
                uploadFile(options)
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.UP,
                    statistic.opt_label.UP.drag])
            }
        }

        onDragOver = e => {
            // chrome阻止图片在浏览器中打开
            e.preventDefault()
        }

        onCopy = e => {
            // 非法页面则不执行
            if (legalpages.filter(v => { return window.location.href.indexOf(v) >= 0 }).length === 0) {
                return
            }

            // 如果别的地方为激活元素，则不执行，比如text、input
            if (document.activeElement !== document.body) {
                return
            }
            if (scene.eqxElementsSelected.length) {
                Vue.store.commit('PHOTO_ELEMENT_COPY')

                // 通过复制别的内容来清空剪切板
                const $input = document.querySelector('#input_copy')
                $input.select()
                document.execCommand('copy', false, null)
                $input.blur()
            }
        }

        // firefox61上测试，复制本地的单个文件会上传火狐默认的一张图，复制多个文件则为空
        // chrome68上测试，复制本地的单张图片是正常的，复制本地多张图片只会上传一张，复制其它文件则为空
        // 截图上传都是正常的
        onPaste = e => {
            // 非法页面则不执行
            if (legalpages.filter(v => { return window.location.href.indexOf(v) >= 0 }).length === 0) {
                return
            }

            // 如果别的地方为激活元素，则不执行，比如text、input
            if (document.activeElement !== document.body) {
                return
            }

            // chrome取files很慢，所以先提出来
            const files = e.clipboardData.files

            // 只能上传一张图片，哪怕选择了多张，浏览器最多也只识别一张，甚至无法识别
            if (files.length) {
                if (util.isChrome) {
                    options.files = Array.from(files).filter(file => options.mimeType.includes(file.type))

                    if (checkFiles(options)) {
                        if (editor) { // 编辑器新上传组件弹窗确认
                            editor.pasteConfirm().then((res) => {
                                if (res) {
                                    uploadFile(options)
                                }
                            }).catch(err => err && Vue.logger.error(err))
                        } else {
                            uploadFile(options)
                        }
                    }
                } else {
                    Vue.notifier.info('请使用chrome浏览器使用复制上传功能')
                }
            } else {
                Vue.store.commit('ELEMENT_PASTE')
            }
        }

        document.addEventListener('drop', onDrop)
        document.addEventListener('dragover', onDragOver)
        document.addEventListener('copy', onCopy)
        document.addEventListener('paste', onPaste)
    },
    unbind() {
        document.removeEventListener('drop', onDrop)
        document.removeEventListener('dragover', onDragOver)
        document.removeEventListener('copy', onCopy)
        document.removeEventListener('paste', onPaste)
    }
}
// 判断权限 只有秀客和超级账号有权限上传gif图
function checkUserCanUploadGif() {
    const userType = Vue.store.state.user.userInfo.type
    if (authority.type.gifUploadUsing.includes(userType)) {
        return true
    } else {
        return false
    }
}
/**
 * 创建清空剪切版需要的辅助元素
 * @param {*} $el
 */
function createInput($el) {
    document.body.querySelectorAll('#input_copy').forEach(dom => dom.remove())
    const $input = document.createElement('input')
    $input.css({
        position: 'absolute',
        left: '-10000px',
        top: '-10000px'
    })
    $input.value = ' '
    $input.id = 'input_copy'
    $el.appendChild($input)
    return $input
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
    return flag
}

/**
 * 获取上传需要的参数
 * @param {*} upload
 */
function getOptions(upload, artqrcode, editor) {
    const options = {
        mimeType: ['image/png', 'image/jpeg'],
        maxFileName: 50,
        maxFileSize: editor && editor.fileSizeLimit ? editor.fileSizeLimit : 10,
        maxCount: editor && editor.fileNumLimit ? editor.fileNumLimit : 20,
        onFileUploaded(res, isEnd) {
            const { key, name, size } = res
            if (checkUserCanUploadGif()) {
                options.mimeType = ['image/png', 'image/jpeg', 'image/gif']
            }
            const data = {
                path: key,
                tmbPath: key,
                name: name,
                size: parseInt(size / 1024),
                fileType: Vue.enum.fileType.printImage,
                tagId: -1,
                storageType: 0, // 用户上传 1 作品上素材  2 二次编辑转存素材
                source: 'P010005',
                uploadType: 0 // 0 PC本地上传 1 app上传 2 手机扫码上传 3 小程序本地上传
            }
            Vue.api.file.saveFile(data)
                .then(() => {
                    if (isEnd) {
                        if (artqrcode) { // 艺术二维码-粘贴上传
                            Vue.store.commit('QRCODE_UPLOAD_BY_PHONE_AND_KEYBOARD', { success: true, type: 'keyboard', key })
                            setTimeout(() => Vue.store.commit('QRCODE_UPLOAD_RELOAD'))
                        } else if (upload) { // nav上传-粘贴上传
                            Vue.store.commit('LAYOUT_NAV', { item: upload })
                            Vue.store.commit('LAYOUT_NAV_PANEL', { show: true })
                            setTimeout(() => Vue.store.commit('LAYOUT_NAV_UPLOAD_RELOAD')) // 需要页面准备好后再生成随机数，才能被监控到变化
                        } else if (editor) { // 编辑器新上传组件-粘贴上传
                            editor.pasteCompleted({ key })
                        }

                        Vue.notifier.success('上传成功')
                    }
                })
                .catch(err => err && Vue.logger.error(err))

            if (upload) {
                const src = Vue.filter('qiniuZoom')(key, thumbSize)
                loader.image(src)
                    .then(img => {
                        addElement(img, key)
                    })
            }
        },
        onError(err) {
            Vue.logger.error(err)
            Vue.notifier.fail('上传失败，请刷新后重试')
        }
    }
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
        .catch(err => err && Vue.logger.error(err))
    Vue.notifier.info('图片上传中…')
    window._hmt.push(['_trackEvent',
        statistic.category.F,
        statistic.action.UP,
        statistic.opt_label.UP.ctrlv])
}

/**
 * 上传后将组件添加到画布中
 * @param {*} img
 * @param {*} src
 * @param {*} left
 * @param {*} top
 */
function addElement(img, src, left = 0, top = 0) {
    const eqxPage = scene.eqxPage
    const scale = eqxPage.scale
    const viewScale = img.width / img.height
    let newWidth = 0
    let newHeight = 0
    if (viewScale > 1) {
        newWidth = viewSize / scale
        newHeight = newWidth / viewScale
    } else {
        newHeight = viewSize / scale
        newWidth = newHeight * viewScale
    }
    const elementJson = {
        type: elementType.image,
        property: {
            src,
            dropShadow: {
                color: 'rgba(0,0,0,0)',
                x: 0,
                y: 0,
                blur: 0,
                transparency: 100
            },
            borderRadius: {
                lt: true,
                rt: true,
                lb: true,
                rb: true,
                val: 0
            }
        },
        css: {
            left: left + 'px',
            top: top + 'px',
            width: Math.round(newWidth) + 'px',
            height: Math.round(newHeight) + 'px'
        }
    }

    eqxPage.addElement(elementJson)
    // eqxPage.eqxHistory.add(eqxPage)
}
