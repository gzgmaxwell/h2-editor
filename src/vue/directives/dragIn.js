import util from '../../utils/util'
import loader from '../../utils/loader'
import imgSrc from '../../img/frame.svg'
import elementType from '../../config/enum.element.type'
import textType from '../../config/enum.text.type'

export default {
    bind($el, binding) {
        $el.addEventListener('mousedown', e => {
            // 阻止mousemove默认会选中其它元素的情况
            e.preventDefault()

            const value = binding.value
            if (!value) {
                return
            }

            if (Vue.store.state.layout.uploadManage.show) {
                return
            }
            // 触发到收藏标识了 直接返回
            if (e.target.className === 'eqf-star-l') {
                return
            }
            const eqxPage = Vue.store.state.scene.eqxPage
            const threshold = 2
            const initX = e.pageX
            const initY = e.pageY
            let moveX = 0
            let moveY = 0
            let isDragEnd = true
            let image = null // 这里获取过了，在添加到画布时，则直接使用这个，不用再获取了
            let $clone = null
            let targetEqxElement = null // 需要替换的组件
            // 由图片是背景模式改成图片是真实模式，需要偏移的量
            const fixed = {
                left: 0,
                top: 0
            }
            // 工作区的位置，用来判断添加和替换区域
            const workspaceRect = eqxPage.$el.parentElement.getBoundingClientRect()
            // 要拖拽的图片的初始位置
            const rect = $el.getBoundingClientRect()
            // 获取目标组件及位置
            const eqxElements = getEqxElements(eqxPage, value.types, value.textTypes)
            // 添加预览遮罩层
            initMask(eqxPage, eqxElements)

            const mousemove = e => {
                moveX = e.pageX - initX
                moveY = e.pageY - initY
                if ($clone && (Math.abs(moveX) > threshold || Math.abs(moveY) > threshold)) {
                    $clone.css({
                        left: rect.left + fixed.left + moveX + 'px',
                        top: rect.top + fixed.top + moveY + 'px',
                        pointerEvents: '',
                        transform: `scale(${value.viewSize / value.thumbSize})`,
                        transition: 'transform 0.3s'
                    })
                }
                targetEqxElement = getReplaceElement(e, eqxElements, workspaceRect)
            }
            const mouseup = e => {
                isDragEnd = false
                document.removeEventListener('mousemove', mousemove)
                document.removeEventListener('mouseup', mouseup)
                if (util.isFunction(value.onDragEnd)) {
                    if (targetEqxElement) {
                        // 拖拽替换 画布中的目标组件
                        const result = {
                            image,
                            path: value.path,
                            eqxElement: targetEqxElement
                        }
                        checkUserCanDrag(value.item).then(() => {
                            if (targetEqxElement.elementJson.type === elementType.qrcode) {
                                // 目标组件是二维码，则替换中心图片
                                value.onDragEnd('insert', result)
                            } else if (targetEqxElement.elementJson.type === elementType.text && targetEqxElement.elementJson.property.type === textType.chartlet) {
                                // 目标组件是贴图文字，则替换背景图
                                value.onDragEnd('replaceFontBackgroundImage', result)
                            } else {
                                value.onDragEnd('replace', result)
                            }
                        }).catch(err => err && Vue.logger.error(err))
                    } else if ($clone) {
                        // 拖拽添加 到画布
                        const result = getLeftAndTop(eqxPage, $clone)
                        if (result) {
                            checkUserCanDrag(value.item).then(() => {
                                Object.assign(result, {
                                    image,
                                    path: value.path
                                })
                                value.onDragEnd('add', result)
                            }).catch(err => err && Vue.logger.error(err))
                        }
                    }
                }

                clearMask(eqxElements)
                // 最后删除，否则获取不到位置
                $clone && $clone.remove()
            }

            document.addEventListener('mousemove', mousemove)
            document.addEventListener('mouseup', mouseup)

            loader.image(value.qiniuPath)
                .then(img => {
                    image = img
                    createClone(img, value.thumbSize, fixed, rect, value).then((res) => {
                        $clone = res
                        document.body.appendChild($clone)
                        // 拖拽时，这里比mousemove执行得快
                        // mac轻触触摸板时，这里会比mouseup执行得慢，所以需要在这里删除
                        if (!isDragEnd) {
                            $clone.remove()
                        }
                    })
                })
                .catch(err => err && Vue.logger.error(err))
        })
    }
}
/***
 * 判断用户能不能拖拽替换
 * 能替换的场景：（上传菜单可以随意替换）
 * 1. price小于0 可以替换
 * 2. 该素材是付费但是却是会免  且用户是会员
 * 3. 该素材是付费 但是用户曾经购买过该素材
*/
function checkUserCanDrag(item) {
    return new Promise((resolve, reject) => {
        const userInfo = Vue.store.state.user.userInfo
        if (item && item.price) {
            if (Number(item.price) <= 0) {
                resolve()
            } else if (item.attrMap.memberFreeFlag && checkUserIsMember()) {
                resolve()
            } else if (!userInfo.id) {
                Vue.notifier.info('请先登录再进行购买！')
                reject()
            } else {
                hasFavoriteOrHasBuy(item.id).then(state => {
                    if (state) {
                        // 重复购买过
                        resolve()
                    } else {
                        //  没有购买过
                        Vue.notifier.info('请先购买再进行拖拽替换！')
                        reject()
                    }
                })
            }
        } else {
            resolve()
        }
    })
}
// 检测用户是不是购买过
function hasFavoriteOrHasBuy(productId) {
    return new Promise((resolve, reject) => {
        // type: 1：收藏，2：已购
        Vue.api.product.hasFavoriteOrHasBuy(productId, 2).then(data => {
            if (Number(data.data.obj) === 1) {
                resolve(true) // 已购买
            } else {
                resolve(false) // 没有购买
            }
        }).catch(() => {
            resolve(false)
        })
    })
}
// 检测用户是不是会员
function checkUserIsMember() {
    const userInfo = Vue.store.state.user.userInfo
    // 7,8,9 Vip
    const vipMemberAuth = [7, 8, 9].includes(userInfo.memberType) || (userInfo.members && userInfo.members.some(item => [7, 8, 9].includes(item.memberId)))
    // 营销云 vip
    const yinxiaoVipMemberAuth = userInfo.members && userInfo.members.some(item => [202, 203, 204].includes(item.memberId))
    // 创意 vip
    const chuangyiVipMemberAuth = userInfo.members && userInfo.members.some(item => [14].includes(item.memberId))
    return vipMemberAuth || yinxiaoVipMemberAuth || chuangyiVipMemberAuth
}
/**
 * 设置目标组件位置并返回
 * 目标组件：types
 * 目标文字：textTypes
 * @param {*} eqxElement
 */
function getEqxElements(eqxElement, types, textTypes) {
    const eqxElements = []
    eqxElement.eqxElements.forEach(eqxElement => {
        const { type, property } = eqxElement.elementJson
        // 画布上未锁定的目标类型组件
        if (!property.lock && (types.includes(type) || (type === elementType.text && textTypes.includes(property.type)))) {
            eqxElement.rect = eqxElement.$el.getBoundingClientRect()
            if (type === elementType.puzzle) {
                // 拼图组件需要计算每块的位置
                const clipsRect = []
                const $clips = eqxElement.$el.querySelectorAll('.insideG')
                for (let i = 0; i < $clips.length; i++) {
                    const { top, left, bottom, right, width, height } = $clips[i].getBoundingClientRect()
                    const clipId = $clips[i].attr('data')
                    clipsRect.push({ top, left, bottom, right, width, height, clipId })
                }
                if (clipsRect.length > 0) {
                    eqxElement.clipsRect = clipsRect
                }
            }
            eqxElements.push(eqxElement)
        }
    })
    return eqxElements
}

/**
 * 创建一样的dom，并出现在同一位置
 * @param {*} img
 * @param {*} maxSize
 * @param {*} fixed
 * @param {*} rect
 */
function createClone(img, maxSize, fixed, rect, value) {
    const viewScale = img.width / img.height
    let width = 0
    let height = 0
    if (viewScale > 1) {
        width = maxSize
        height = width / viewScale
        fixed.top = (maxSize - height) / 2
    } else {
        height = maxSize
        width = height * viewScale
        fixed.left = (maxSize - width) / 2
    }
    return new Promise((resolve, reject) => {
        if (value.types[0] === elementType.frame) {
            formatSvg(value.path, value.thumbSize).then((res) => {
                const boxDom = creatDom(width, height, rect, fixed, 'div')
                boxDom.appendChild(res)
                resolve(boxDom)
            })
        } else {
            const imgDom = creatDom(width, height, rect, fixed, 'img').attr({ src: img.src })
            resolve(imgDom)
        }
    })
}

/**
 * 创建dom
 * @param {*} width
 * @param {*} height
 * @param {*} react
 * @param {*} rect
 * @param {*} fixed
 * @param {*} nodeName
 */
function creatDom(width, height, rect, fixed, nodeName) {
    return document.createElement(nodeName).css({
        position: 'absolute',
        left: rect.left + fixed.left + 'px',
        top: rect.top + fixed.top + 'px',
        width: width + 'px',
        height: height + 'px',
        zIndex: 10, // 需要一个比较高的层级，比页面其它dom层级高，比如左侧nav
        cursor: 'move',
        opacity: 0.8,
        pointerEvents: 'none'
    })
}
/**
 * 当元素的类型为嵌入框时 加载svg
 * @param {*} src
 */
function formatSvg(url, thumbSize) {
    return new Promise((resolve, reject) => {
        loader.svg(url).then(($svgTemp) => {
            // 从xml中筛选出svg元素，没有直接用这个svg而是新创建了一个，是为了setScale
            const $svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
            const width = parseFloat($svgTemp.attr('width'))
            const height = parseFloat($svgTemp.attr('height'))
            let image = `<image width='${width}'  xlink:href='${imgSrc}'/>`
            if (width < height) {
                image = `<image height='${height}'  xlink:href='${imgSrc}'/>`
            }
            $svg.attr({
                width,
                height,
                viewBox: `0 0 ${width} ${height}`,
                style: `width: ${thumbSize}px;height: ${thumbSize}px`
            })
                .innerHTML = `
                        <g>
                            <defs>
                                <clipPath   id="${url}">
                                ${$svgTemp.innerHTML}
                                </clipPath>
                            </defs>

                            <g  style="clip-path:url(#${url})" >
                                ${image}
                            </g>
                        </g>
            `
            resolve($svg)
        })
    })
}

/**
 * 初始化每个组件的遮罩
 * @param {*} eqxElements
 */
function initMask(eqxPage, eqxElements) {
    const scale = eqxPage.scale

    eqxElements.forEach(eqxElement => {
        const { type } = eqxElement.elementJson

        const $mask = document.createElement('div').css({
            display: 'block',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            background: 'rgba(0,0,0,0.3)',
            opacity: 0
        })
        eqxElement.$el.appendChild($mask)

        if (type === elementType.puzzle) {
            // 拼图组件需要添加每块区域的遮罩
            if (eqxElement.clipsRect) {
                for (let i = 0; i < eqxElement.clipsRect.length; i++) {
                    const maskRect = $mask.getBoundingClientRect()
                    const { top, left, width, height } = eqxElement.clipsRect[i]
                    const $clipMask = document.createElement('div').css({
                        display: 'none',
                        position: 'absolute',
                        left: Math.round((left - maskRect.left) / scale) + 'px',
                        top: Math.round((top - maskRect.top) / scale) + 'px',
                        width: Math.round(width / scale) + 'px',
                        height: Math.round(height / scale) + 'px',
                        background: 'rgba(0,0,0,0.3)'
                    })
                    eqxElement.clipsRect[i].$mask = $clipMask
                    $mask.appendChild($clipMask)
                }
            }
        }

        eqxElement.$mask = $mask
    })
}

/**
 * 清除每个组件的遮罩
 * @param {*} eqxElements
 */
function clearMask(eqxElements) {
    eqxElements.forEach(eqxElement => {
        eqxElement.$mask.remove()
        delete eqxElement.$mask
    })
}

/**
 * 获取要添加的组件的位置
 * @param {*} eqxPage
 * @param {*} $clone
 */
function getLeftAndTop(eqxPage, $clone) {
    const scale = eqxPage.scale
    const $editor = eqxPage.$el
    const $workspace = $editor.parentElement
    const editorRect = $editor.getBoundingClientRect()
    const workspaceRect = $workspace.getBoundingClientRect()
    const cloneRect = $clone.getBoundingClientRect()
    cloneRect.centerX = cloneRect.left + cloneRect.width / 2
    cloneRect.centerY = cloneRect.top + cloneRect.height / 2
    // 组件中心在工作区才能添加
    if (cloneRect.centerX > workspaceRect.left &&
        cloneRect.centerX < workspaceRect.right &&
        cloneRect.centerY > workspaceRect.top &&
        cloneRect.centerY < workspaceRect.bottom) {
        return {
            left: Math.round((cloneRect.left - editorRect.left) / scale),
            top: Math.round((cloneRect.top - editorRect.top) / scale)
        }
    }
    return null
}

/**
 * 获取可替换的组件
 * @param {*} e
 * @param {*} eqxElements
 */
function getReplaceElement(e, eqxElements, workspaceRect) {
    const stack = []
    let topEqxElement = null
    eqxElements.forEach(eqxElement => {
        eqxElement.$mask.css({ display: 'none' })
        const rect = eqxElement.rect
        if (e.pageX > workspaceRect.left &&
            e.pageX < workspaceRect.right &&
            e.pageY > workspaceRect.top &&
            e.pageX > rect.left &&
            e.pageX < rect.right &&
            e.pageY > rect.top &&
            e.pageY < rect.bottom) {
            stack.push(eqxElement)
        }
    })
    // 获取层级最高的组件，并显示遮罩，避免层叠时选中多个
    stack.sort((a, b) => b.elementJson.css.zIndex - a.elementJson.css.zIndex)
    topEqxElement = stack[0]

    if (topEqxElement) {
        const clipsRect = topEqxElement.clipsRect
        if (clipsRect) {
            topEqxElement.$mask.css({ display: 'block', opacity: 1, background: 'rgba(0,0,0,0)' })

            // 拼图遮罩含有children，判断显示哪一块
            let inClipNum = 0
            let $curClip = null
            let curClipId = null
            for (let i = 0; i < clipsRect.length; i++) {
                const cRect = clipsRect[i]
                cRect.$mask.css({ display: 'none' })

                if (e.pageX > cRect.left &&
                    e.pageX < cRect.right &&
                    e.pageY > cRect.top &&
                    e.pageY < cRect.bottom) {
                    inClipNum++
                    $curClip = cRect.$mask
                    curClipId = cRect.clipId
                }
            }
            if (inClipNum === 1) {
                // show clip mask
                $curClip.css({ display: 'block' })
                inClipNum = 0
                topEqxElement.clipId = curClipId
            }
        } else {
            topEqxElement.$mask.css({ display: 'block', opacity: 1 })
        }
    }

    return topEqxElement
}
