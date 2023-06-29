import dom2canvas from '../../../utils/dom2canvas'

export default page2Canvas

/**
 * 获取需要等待的元素
 * 背景
 * @param {*} pageJsonData
 */
function checkCount(pageJsonData) {
    let checkCount = 0
    if (pageJsonData.properties && pageJsonData.properties.background.src) {
        checkCount++
    }
    return checkCount
}

/**
 * 检测异步加载元素是否显示完毕
 * @param {*} checkNum
 */
function isPageRenderFinished(checkNum) {
    return new Promise((resolve, reject) => {
        let timer
        const check = (start) => {
            if (start) {
                timer = setInterval(() => {
                    // 检测$tempDiv下的异步元素
                    const $tmp = document.getElementById('h2-photo-tmp-div')
                    const $checks = $tmp.querySelectorAll('.h2-photo-check-ele')
                    if ($checks.length === checkNum) {
                        check.call(this, false)
                        resolve(true)
                    }
                }, 100)
            } else {
                clearInterval(timer)
                timer = null
            }
        }
        check(true)
    })
}
function page2Canvas(options, pageJson = null, drawBackground = true) {
    const pageJsonData = pageJson || this.pageJson
    const checkNum = checkCount(pageJsonData) // 获取需要检测个数
    const $tempDiv = document.createElement('div')
    document.body.appendChild($tempDiv)
    this.mount($tempDiv)
    $tempDiv.attr({ id: 'h2-photo-tmp-div' })
    this.renderPage(JSON.parse(JSON.stringify(pageJsonData)), drawBackground)
    $tempDiv.css({
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1 // 避免盖在当前页面上
    })
    $tempDiv.querySelector('.eqc-photo-element-boxs').remove()

    return new Promise((resolve, reject) => {
        isPageRenderFinished(checkNum).then(res => {
            // 移除裁切辅助线
            $tempDiv.querySelector('.eqc-photo-element-crop-rowline') && $tempDiv.querySelector('.eqc-photo-element-crop-rowline').remove()
            $tempDiv.querySelector('.eqc-photo-element-crop-colline') && $tempDiv.querySelector('.eqc-photo-element-crop-colline').remove()
            // 特殊处理 旋转的下载
            if (Vue.store.state.photoLayout.nav.selectedItem.type === 'rotate') {
                const $background = $tempDiv.firstElementChild
                const $canvas = $background.firstElementChild
                const config = Vue.store.state.photoRotate.record

                if ([-270, -90, 90, 270].includes(config.rotateAngle)) {
                    // 交换宽高
                    $tempDiv.css({
                        width: config.height + 'px',
                        height: config.width + 'px'
                    })
                    // 反向匹配
                    $background.css({
                        width: config.width + 'px',
                        height: config.height + 'px',
                        top: (config.width - config.height) / 2 + 'px',
                        left: (config.height - config.width) / 2 + 'px'
                    })
                    // 处理文字和贴纸等元素 处理原因： 因为旋转时用css旋转的 如果90旋转了，宽高颠倒，想对位置都需要改变
                    const allElementNodeArr = $tempDiv.querySelector('.eqc-photo-elements').childNodes
                    for (let i = 0; i < allElementNodeArr.length; i++) {
                        const elementNode = allElementNodeArr[i]
                        const left = parseFloat(elementNode.style.left)
                        const top = parseFloat(elementNode.style.top)
                        elementNode.style.left = left - (config.width - config.height) / 2 + 'px'
                        elementNode.style.top = top + (config.width - config.height) / 2 + 'px'
                    }
                }

                $background.style.transform = `rotate(${config.rotateAngle}deg) rotateX(${config.rotateXAngle}deg) rotateY(${config.rotateYAngle}deg)`
                $canvas.style.transform = `rotate(${config.dragAngle}deg) scale(${config.scaleSize})`
            }
            dom2canvas($tempDiv, options)
                .then(canvas => {
                    $tempDiv.remove()
                    canvas.css({
                        width: '',
                        height: ''
                    })
                    resolve(canvas)
                })
                .catch(err => reject(err))
        })
    })
}
