
let webSocket = null
let webSocketDestroyed = false
let webSocketHeartId = 0
const webSocketReadyState = {
    connecting: 0,
    open: 1,
    closing: 2,
    closed: 3
}

export default {
    bind($el, binding) {
        const { upload, uuid, artqrcode, editor, background, tcloud, puzzle } = binding.value
        // const { upload, artqrcode } = binding.value
        // const url = Vue.env.host.p1.replace('http', 'ws') + '/m/print/websocket'
        const url = Vue.env.host.ws.replace('http', 'ws') + '/websocket?' + uuid
        const connect = url => {
            const ws = webSocket = new WebSocket(url)
            ws.onopen = event => {
                // 发送心跳，nginx默认是60s就会断开，所以这里50秒发一次
                webSocketHeartId = setInterval(() => {
                    ws.readyState === webSocketReadyState.open && ws.send('1')
                }, 50000)
            }
            ws.onmessage = event => {
                const data = event.data
                // const data = JSON.parse(event.data)
                // if (data.platform === 'h2') {
                if (typeof data === 'string' && data.indexOf('h2') > -1) {
                    if (artqrcode) {
                        // 艺术二维码-手机上传
                        Vue.store.commit('QRCODE_UPLOAD_BY_PHONE_AND_KEYBOARD', { success: true, type: 'phone', key: '' })
                        setTimeout(() => Vue.store.commit('QRCODE_UPLOAD_RELOAD'))
                    } else if (background) {
                        // 背景手机上传完毕之后通知去裁剪
                        Vue.store.commit('SCENE_BACKGROUND_PHONE_UPLOAD_FINISH', true)
                    } else if (upload) {
                        // h2主编辑器nav上传-手机上传
                        Vue.store.commit('LAYOUT_NAV', { item: upload })
                        Vue.store.commit('LAYOUT_NAV_PANEL', { show: true })
                        setTimeout(() => Vue.store.commit('LAYOUT_NAV_UPLOAD_RELOAD')) // 需要页面准备好后再生成随机数，才能被监控到变化
                        this.unbind()
                    } else if (editor) {
                        // 编辑器新上传组件-手机上传
                        editor.uploadCompleted()
                    } else if (tcloud) {
                        // 字云编辑器nav上传-手机上传
                        Vue.store.commit('TCLOUD_NAV', { item: tcloud })
                        Vue.store.commit('TCLOUD_NAV_PANEL', { show: true })
                    } else if (puzzle) {
                        // 拼图编辑器nav上传-手机上传
                        Vue.store.commit('PUZZLE_NAV', { item: puzzle })
                        Vue.store.commit('PUZZLE_NAV_PANEL', { show: true })
                    }
                }
            }

            ws.onclose = event => {
                if (!webSocketDestroyed) {
                    setTimeout(() => connect(url), 2000)
                }
            }

            ws.onerror = event => {
                console.error('error')
            }
        }
        // 本地开发不连接websocket
        if (['test', 'pre', 'pro'].includes(Vue.env.name)) {
            connect(url)
        }
        // 测试本地
        // connect(url)
    },
    unbind() {
        webSocketDestroyed = true
        clearInterval(webSocketHeartId)
        webSocket && webSocket.readyState === webSocketReadyState.open && webSocket.close()
    }
}
