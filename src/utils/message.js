/**
 * 发送信息
 * @param {*} info
 */
function send(info, source = true) {
    if (source) {
        info.source = 'h2' // 往回发消息的时候，让其能正确处理，因为当前页的别的插件也有可能往回发，比如浏览器插件
    }
    const origin = '*' // 没有什么机密信息就不指定域了，方便调试
    const parent = window.parent
    const opener = window.opener
    if (window !== window.top) parent.postMessage(info, origin) // parent会永远有值，不判断也行
    else if (opener) opener.postMessage(info, origin)
}

/**
 * 发送成功操作
 * @param {*} value
 */
function success(value) {
    send({
        success: true,
        value
    })
}

/**
 * 发送失败操作
 * @param {*} value
 */
function fail(value) {
    send({
        success: false,
        value
    })
}

/**
 * 发送退出消息
 * 接入创意云工具集
 * eventType: 'publishPage','quitPage'
 * editorType: 编辑器类型   h5:h5，长页面:lp，轻设计:design，易表单:lf，易互动:hd，排版:pb
 * id:  场景id
 */
function exit(id) {
    send({
        eventType: 'quitPage',
        editorType: 'design',
        id
    }, false)
}

export default {
    send,
    success,
    fail,
    exit
}
