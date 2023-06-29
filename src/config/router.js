import storageSession from '../utils/storageSession'

import VisitIndex from '../vue/pages/visit/Index.vue'
import HomeIndex from '../vue/pages/home/Index.vue'

import TheCreate from '../vue/pages/eip/TheCreate.vue'
import DialogEmptyCreate from '../vue/pages/eip/DialogEmptyCreate.vue'
import DialogBatchCreate from '../vue/pages/eip/DialogBatchCreate.vue'
import DialogApply from '../vue/pages/home/DialogApply.vue'

import CreateSign from '../vue/pages/sign/Index.vue'
import PhotoIndex from '../photo/vue/pages/photo/Index.vue'


const CreateIndex = () => import('../vue/pages/create/Index.vue')
const CreateIndexEditor = () => import('../vue/pages/create/IndexEditor.vue')
const CreateExpress = () => import('../vue/pages/create/IndexExpress.vue')
const CreateQrcode = () => import('../vue/pages/artqrcode/IndexQrcode.vue')
const CreateMatting = () => import('../vue/pages/aimatting/IndexMatting.vue')
const CreateTcloud = () => import('../vue/pages/tcloud/IndexTcloud.vue')
const CreatePuzzle = () => import('../vue/pages/puzzle/IndexPuzzle.vue')

const router = Vue.router = new VueRouter({
    base: 'h2',
    mode: 'history',
    linkActiveClass: 'active',
    routes: [
        {
            path: '/',
            redirect: '/visit',
        },
        {
            name: 'visit',
            path: '/visit',
            component: VisitIndex,
            beforeEnter(to, from, next) {
                // 1001 未登录
                Vue.api.user.getUserInfo(true)
                    .then(res => {
                        if (res.data && res.data.code === 1001) {
                            next()
                        } else {
                            window.location.href = `${Vue.env.host.auth}/eip/scene?type=h2`
                        }
                    })
                    .catch(err => err && Vue.logger.error(err))
            }
        },
        {
            path: '/eip',
            children: [
                {
                    path: '',
                    redirect: 'scene'
                },
                {
                    name: 'scene',
                    path: 'scene',
                },
                {
                    name: 'template',
                    path: 'template',
                }
            ],
            beforeEnter(to, from, next) {
                // 旧工作台路由，废弃，全部转到visit
                Vue.router.replace({ path: '/visit' })
            }
        },
        {
            name: 'home',
            path: '/home',
            component: HomeIndex,
            meta: {
                requireAuth: true
            }
        },
        {
            path: '/dialog',
            component: TheCreate,
            children: [
                {
                    path: '',
                    redirect: 'empty'
                },
                {
                    name: 'empty',
                    path: 'empty',
                    component: DialogEmptyCreate,
                    meta: {
                        requireAuth: true
                    }
                },
                {
                    name: 'batch',
                    path: 'batch',
                    component: DialogBatchCreate,
                    meta: {
                        requireAuth: true
                    }
                },
                {
                    name: 'apply',
                    path: 'apply',
                    component: DialogApply,
                    meta: {
                        requireAuth: true
                    }
                }
            ],
            beforeEnter(to, from, next) {
                if (Vue.user.allow('eip') || Vue.store.state.user.userInfo.identityType === '1') {
                    next()
                } else {
                    next({ path: '/home' })
                }
            }
        },
        {
            name: 'qrcodecreate',
            path: '/qrcode',
            component: CreateQrcode,
            beforeEnter(to, from, next) {
                Vue.api.user.getUserInfo(true)
                    .then(res => {
                        const isVistor = res.data.code === 1001 // 未登录
                        // 游客模式
                        if (isVistor) {
                            storageSession.setItem(storageSession.key.visit, true)
                        } else {
                            storageSession.setItem(storageSession.key.login, true)
                            Vue.store.commit('USER_SET', { userInfo: res.data.obj })
                        }
                        next()
                    })
            }
        },
        {
            name: 'matting',
            path: '/aimatting',
            component: CreateMatting,
            beforeEnter(to, from, next) {
                Vue.api.user.getUserInfo(true)
                    .then(res => {
                        const isVistor = res.data.code === 1001 // 未登录
                        // 游客模式
                        if (isVistor) {
                            storageSession.setItem(storageSession.key.visit, true)
                        } else {
                            storageSession.setItem(storageSession.key.login, true)
                            Vue.store.commit('USER_SET', { userInfo: res.data.obj })
                        }
                        next()
                    })
            }
        },
        {
            name: 'batchcreate',
            path: '/batch/:id/:templateId/:editorCount',
            component: CreateIndex,
            beforeEnter(to, from, next) {
                try {
                    const productId = parseInt(to.params.id)
                    const templateId = parseInt(to.params.templateId)
                    const editorCount = parseInt(to.params.editorCount)
                    Vue.store.commit('ADD_BATCH_PRODUCT_TEMPLATE_RELATION', {
                        productId,
                        templateId,
                        editorCount
                    })
                } catch (err) {
                    err && Vue.logger.error(err)
                }
                Vue.store.commit('LAYOUT_LOGO', { show: true })

                if (storageSession.getItem(storageSession.key.visit)) {
                    next()
                } else if (storageSession.getItem(storageSession.key.login)) {
                    storageSession.removeItem(storageSession.key.login)
                    next()
                } else {
                    Vue.user.auth()
                        .then(() => next())
                        .catch(err => err && Vue.logger.error(err))
                }
            }
        },
        {
            name: 'create',
            path: '/create/:id',
            component: CreateIndex,
            beforeEnter(to, from, next) {
                Vue.store.commit('LAYOUT_LOGO', { show: true })

                if (storageSession.getItem(storageSession.key.visit)) {
                    next()
                } else if (storageSession.getItem(storageSession.key.login)) {
                    storageSession.removeItem(storageSession.key.login)
                    next()
                } else {
                    Vue.user.auth()
                        .then(() => next())
                        .catch(err => err && Vue.logger.error(err))
                }
            }
        },
        {
            name: 'createeditor',
            path: '/createeditor/:id',
            component: CreateIndexEditor,
            beforeEnter(to, from, next) {
                Vue.store.commit('LAYOUT_LOGO', { show: true })

                if (storageSession.getItem(storageSession.key.visit)) {
                    next()
                } else if (storageSession.getItem(storageSession.key.login)) {
                    storageSession.removeItem(storageSession.key.login)
                    next()
                } else {
                    Vue.user.auth()
                        .then(() => next())
                        .catch(err => err && Vue.logger.error(err))
                }
            }
        },
        {
            name: 'express',
            path: '/express/:id',
            component: CreateExpress,
            beforeEnter(to, from, next) {
                const { pageId, referrer } = to.query
                if (pageId) {
                    storageSession.setItem(storageSession.key.expressPageId, pageId)
                } else {
                    storageSession.removeItem(storageSession.key.expressPageId)
                }
                if (referrer) {
                    if (/^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/.test(referrer)) {
                        storageSession.setItem(storageSession.key.expressReferrer, referrer)
                    } else {
                        console.error('参数错误：非法referrer')
                        return
                    }
                }
                Vue.loading.open('加载中')
                if (storageSession.getItem(storageSession.key.visit)) {
                    next()
                } else if (storageSession.getItem(storageSession.key.login)) {
                    storageSession.removeItem(storageSession.key.login)
                    next()
                } else {
                    Vue.user.auth()
                        .then(() => next())
                        .catch(err => err && Vue.logger.error(err))
                }
            }
        },
        {
            name: 'sign',
            path: '/sign',
            component: CreateSign,
            beforeEnter(to, from, next) {
                // 获取用户信息
                Vue.api.user.getUserInfo(true)
                    .then(res => {
                        if (res.data.code === 1001) {
                            console.log('未登录')
                        } else {
                            if (res.data.obj) {
                                const { name, nick, loginName, id, property } = res.data.obj
                                // console.log(name, nick, loginName, id, property)
                                if (property) {
                                    const wxObj = JSON.parse(property)
                                    let unionId = ''
                                    let openId = ''
                                    for (let key in wxObj) {
                                        if (key.indexOf('unionId_') > -1) {
                                            unionId = wxObj[key]
                                        }
                                        if (key.indexOf(Vue.env.wxAppId) > -1) {
                                            openId = wxObj[key]
                                        }
                                    }
                                    Vue.store.commit('SIGN_USER', {
                                        userId: id, // 用户id
                                        unionId: unionId, //
                                        mpOpenId: openId, // 创意云公号openid
                                        name,
                                        nick,
                                        loginName
                                    })
                                    next()
                                }
                            }
                        }
                    })
                    .catch(err => {
                        err && Vue.logger.error(err)
                    })
            }
        },
        {
            path: '/create',
            beforeEnter(to, from, next) {
                const { type, width, height, unit, tid, pid, qrcodeUrl, qrcodeLogo, history, mark, qrcodeDes, pTitle, pImg, h5, templateId, editorCount, batch, msgType, createType, title, code } = to.query
                let newH5Parms = { h5, tid }
                // 是否是新的h5美化图片和二维码模式
                if (h5 === '1') {
                    if (tid === '') {
                        console.error('模板tid为空！无法创建')
                        return
                    }

                    // 二维码描述
                    if (qrcodeDes) {
                        newH5Parms.qrcodeDes = qrcodeDes
                    }
                    // H5作品标题
                    if (pTitle) {
                        newH5Parms.pTitle = pTitle
                    }
                    // H5作品封面图片
                    if (pImg) {
                        newH5Parms.pImg = pImg
                    }
                    // 消息类型，用于回传给其他编辑器
                    if (msgType) {
                        newH5Parms.msgType = msgType
                    }
                    // 二维码作品
                    if (qrcodeUrl) {
                        newH5Parms.qrcodeUrl = qrcodeUrl
                    }
                    // 二维码logo
                    if (qrcodeLogo) {
                        newH5Parms.qrcodeLogo = qrcodeLogo
                    }
                }
                Vue.api.user.getUserInfo(true)
                    .then(res => {
                        const needHistory = !!history
                        const isVistor = res.data.code === 1001 // 未登录
                        // 游客模式
                        if (isVistor) {
                            storageSession.setItem(storageSession.key.visit, true)
                        } else {
                            storageSession.setItem(storageSession.key.login, true)
                            Vue.store.commit('USER_SET', { userInfo: res.data.obj })
                        }
                        // 二维码作品
                        if (h5 !== '1' && qrcodeUrl) {
                            storageSession.setItem(storageSession.key.qrcodeUrl, qrcodeUrl)
                        }
                        // 二维码logo
                        if (h5 !== '1' && qrcodeLogo) {
                            storageSession.setItem(storageSession.key.qrcodeLogo, qrcodeLogo)
                        }
                        // 添加二维码组件
                        if (mark === '1') {
                            storageSession.setItem(storageSession.key.mark, mark)
                        }


                        if (type || type === 0) {
                            // 通过分类创建作品
                            let scene = {
                                type,
                                width,
                                height,
                                unit
                            }
                            if (title && title !== '') {
                                scene.title = title
                            }
                            let cType = 2
                            if (createType) {
                                cType = createType
                            }
                            Vue.api.scene.addScene(scene, isVistor, cType)
                                .then(res => {
                                    let route
                                    if (batch) {
                                        route = { path: `/batch/${res.data.obj.id}/${templateId}/${editorCount}` }
                                    } else {
                                        route = { path: `/create/${res.data.obj.id}_${res.data.obj.code}` }
                                    }
                                    needHistory
                                        ? Vue.router.push(route)
                                        : Vue.router.replace(route)
                                })
                                .catch(err => err && Vue.logger.error(err))
                        } else if (tid) {
                            // 通过模板id创建作品
                            let createStyle = 1
                            if (h5 === '1') {
                                createStyle = 5
                            }
                            Vue.api.scene.addSceneByTemplate(tid, isVistor, createStyle)
                                .then(res => {
                                    const pid = res.data.obj.id
                                    const code = res.data.obj.code

                                    if (h5 === '1') {
                                        storageSession.setItem(`${pid}_${code}`, JSON.stringify(newH5Parms))
                                    } else {
                                        Vue.store.commit('PRODUCT_ID', { productId: tid })
                                    }
                                    const route = { path: `/create/${pid}_${code}` }
                                    needHistory
                                        ? Vue.router.push(route)
                                        : Vue.router.replace(route)
                                })
                                .catch(err => err && Vue.logger.error(err))
                        } else if (pid) {
                            // 直接进入作品
                            if (code) {
                                Vue.router.push({ path: `/create/${pid}_${code}` })
                            } else {
                                console.warn('路由未更新，请及时联系lirui')
                                Vue.router.push({ path: `/create/${pid}` })
                            }

                        }
                    })
                    .catch(err => err && Vue.logger.error(err))
            }
        },
        {
            path: '/createeditor',
            beforeEnter(to, from, next) {
                const { type, width, height, unit } = to.query
                Vue.api.user.login({ password: '123456', username: '13980509859', version: '1.1.5', channel: '72' })
                    .then(res => {
                        Vue.api.user.getUserInfo(true)
                            .then(res => {
                                const scene = {
                                    type,
                                    width,
                                    height,
                                    unit
                                }
                                Vue.api.scene.addScene(scene, false, 4)
                                    .then(res => {
                                        const route = { path: `/createeditor/${res.data.obj.id}` }
                                        Vue.router.replace(route)
                                    })
                                    .catch(err => err && Vue.logger.error(err))
                            })
                            .catch(err => err && Vue.logger.error(err))

                    })
                    .catch(err => err && Vue.logger.error(err))
            }
        },
        {
            path: '/express',
            beforeEnter(to, from, next) {
                const maxSize = 5000
                const minSize = 40
                const { width, height, material, referrer } = to.query
                Vue.api.user.getUserInfo(true)
                    .then(res => {
                        const needHistory = !!history
                        const isVistor = res.data.code === 1001 // 未登录
                        // 游客模式
                        if (isVistor) {
                            console.error('需要在登录状态下使用')
                            return
                        } else {
                            storageSession.setItem(storageSession.key.login, true)
                            Vue.store.commit('USER_SET', { userInfo: res.data.obj })
                        }
                        if (!width || !height) {
                            console.error('参数错误：必填参数width||height为空')
                            return
                        }
                        if (referrer) {
                            if (/^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/.test(referrer)) {
                                storageSession.setItem(storageSession.key.expressReferrer, referrer)
                            } else {
                                console.error('参数错误：非法referrer')
                                return
                            }
                        } else {
                            if (!material) {
                                console.error('参数错误：必填参数material为空')
                                return
                            }
                        }

                        if (width < minSize || height < minSize) {
                            console.error('参数错误：宽高最小值为' + minSize)
                            return
                        }
                        if (width > maxSize || height > maxSize) {
                            console.error('参数错误：宽高最大值为' + maxSize)
                            return
                        }
                        let promise = Promise.resolve()
                        // 图片素材
                        if (material) {
                            storageSession.setItem(storageSession.key.expressMaterial, material)
                            promise = new Promise((resolve, reject) => {
                                Vue.api.file.getImageInfo(material)
                                    .then(res => {
                                        if (res.data.format === 'gif') {
                                            console.error('参数错误：图片格式错误，暂不支持gif格式编辑')
                                            reject()
                                        } else {
                                            resolve()
                                        }
                                    })
                                    .catch(err => { err && reject(err) })
                            })
                        }
                        promise.then(() => {
                            // 简易版的画布大小根据图片大小决定
                            const scene = {
                                type: 0, // 自定义类型
                                width,
                                height,
                                unit: 'px',
                                title: '易企秀轻设计制作'
                            }
                            Vue.api.scene.addScene(scene, isVistor, 7)
                                .then(res => {
                                    const route = { path: `/express/${res.data.obj.id}_${res.data.obj.code}` }
                                    needHistory
                                        ? Vue.router.push(route)
                                        : Vue.router.replace(route)
                                })
                                .catch(err => err && Vue.logger.error(err))
                        })

                    })
                    .catch(err => err && Vue.logger.error(err))
            }
        },
        {
            path: '/create/:id/*',
            redirect: { name: 'create' }
        },
        {
            name: 'photo',
            path: '/photo',
            component: PhotoIndex,
            beforeEnter(to, from, next) {
                Vue.api.user.getUserInfo(true)
                    .then(res => {
                        const isVistor = res.data.code === 1001 // 未登录
                        // 游客模式
                        if (isVistor) {
                            storageSession.setItem(storageSession.key.visit, true)
                        } else {
                            storageSession.setItem(storageSession.key.login, true)
                            Vue.store.commit('USER_SET', { userInfo: res.data.obj })
                        }
                        next()
                    })
            }
        },
        {
            name: 'tcloud',
            path: '/tcloud',
            component: CreateTcloud,
            beforeEnter(to, from, next) {
                Vue.api.user.getUserInfo(true)
                    .then(res => {
                        const isVistor = res.data.code === 1001 // 未登录
                        // 游客模式
                        if (isVistor) {
                            storageSession.setItem(storageSession.key.visit, true)
                        } else {
                            storageSession.setItem(storageSession.key.login, true)
                            Vue.store.commit('USER_SET', { userInfo: res.data.obj })
                        }
                        next()
                    })
            }
        },
        {
            name: 'puzzle',
            path: '/puzzle/:id',
            component: CreatePuzzle,
            beforeEnter(to, from, next) {
                Vue.store.commit('LAYOUT_LOGO', { show: true })

                if (storageSession.getItem(storageSession.key.visit)) {
                    next()
                } else if (storageSession.getItem(storageSession.key.login)) {
                    storageSession.removeItem(storageSession.key.login)
                    next()
                } else {
                    Vue.user.auth()
                        .then(() => next())
                        .catch(err => err && Vue.logger.error(err))
                }
            }
        },
        {
            path: '/puzzle',
            beforeEnter(to, from, next) {
                const { mode } = to.query
                if (mode) {
                    Vue.store.commit('PUZZLE_LAYOUT_MODE', mode)
                }
                Vue.api.user.getUserInfo(true)
                    .then(res => {
                        const isVistor = res.data.code === 1001 // 未登录
                        // 游客模式
                        if (isVistor) {
                            storageSession.setItem(storageSession.key.visit, true)
                        } else {
                            storageSession.setItem(storageSession.key.login, true)
                            Vue.store.commit('USER_SET', { userInfo: res.data.obj })
                        }
                        const scene = {
                            type: 0,
                            width: 800,
                            height: 800,
                            unit: 'px',
                            title: '易企秀轻设计制作'
                        }
                        Vue.api.scene.addScene(scene, isVistor, 2)
                            .then(res => {
                                const route = { path: `/puzzle/${res.data.obj.id}_${res.data.obj.code}` }
                                Vue.router.replace(route)
                            })
                            .catch(err => err && Vue.logger.error(err))
                    })
            }
        },
        {
            path: '*',
            component: {
                created() {
                    this.logger.info('not found')
                },
                render: h => h('div', 'not found')
            }
        }
    ]
})

router.beforeEach((to, from, next) => {
    Vue.dialog.close()
    Vue.slide.close()
    Vue.arrowNotifier.close()
    Vue.helpnotifier.close()
    Vue.wordcloudpalette.close()
    if (to.meta.requireAuth) {
        Vue.user.auth()
            .then(() => next())
            .catch(err => err && Vue.logger.error(err))
    } else {
        next()
    }
})

router.afterEach((to, from) => {
    // 单页应用取页面pv，刷新时不记录，由track.js的onload记录
    // 如果是单页间的跳转，from.matched里有相应的匹配项
    if (from.matched.length) {
        const base = Vue.env.host.client + '/h2'
        const params = {
            url: base + to.fullPath,
            ref: base + from.fullPath
        }
        window._tracker_api_ && window._tracker_api_.pageView(params)
    }
})

export default router
