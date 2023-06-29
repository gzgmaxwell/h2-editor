import dom2canvas from '../../utils/dom2canvas'
import elementType from '../../config/enum.element.type'

export default page2Canvas

/**
 * 获取需要检测的异步元素
 * 普通二维码，svg形状，svg嵌入框,3D字，拼图
 * @param {*} elements
 */
function checkCount(elements) {
    let checkCount = 0
    elements.map((v) => {
        if ((v.type === elementType.qrcode && !v.property.isArt) ||
            v.type === elementType.shape ||
            v.type === elementType.frame ||
            v.type === elementType.textThreeD ||
            v.type === elementType.puzzle) {
            checkCount++
        }
    })
    return checkCount
}

/**
 * 检测异步元素是否可读
 * @param {*} checkNum
 */
function isPageDOMRenderFinished(checkNum) {
    return new Promise((resolve, reject) => {
        let timer
        const check = (start) => {
            if (start) {
                timer = setInterval(() => {
                    // 检测$tempDiv下的异步元素
                    const $tmp = document.getElementById('h2-tmp-div')
                    const $checks = $tmp.querySelectorAll('.h2-core-check-ele')
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

function page2Canvas(options, pageJson = null) {
    const pageJsonData = pageJson || this.pageJson
    const checkNum = checkCount(pageJsonData.elements) // 获取需要检测的dom
    const $tempDiv = document.createElement('div')
    document.body.appendChild($tempDiv)
    this.mount($tempDiv)
    $tempDiv.attr({ id: 'h2-tmp-div' })
    this.renderPage(JSON.parse(JSON.stringify(pageJsonData)))
    $tempDiv.css({
        zIndex: -1 // 避免盖在当前页面上
    })
    $tempDiv.querySelector('.eqc-range').remove()
    $tempDiv.querySelector('.eqc-element-boxs').remove()
    const _self = this
    return new Promise((resolve, reject) => {
        // 将原来的setTimeout等待改为检测异步元素，
        // 避免粗暴设置一个等待时间，可能不够（元素缺失），可能等待过长（浪费时间）的情况
        isPageDOMRenderFinished(checkNum).then(res => {
            if (res) {
                dom2canvas($tempDiv, options)
                    .then(canvas => {
                        $tempDiv.remove()
                        // 销毁3D立体字
                        _self.eqxElements.forEach(element => {
                            if (element.elementJson.type === elementType.textThreeD) {
                                element.dispose()
                            }
                        })
                        canvas.css({
                            width: '',
                            height: ''
                        })
                        resolve(canvas)
                    })
                    .catch(err => reject(err))
            }
        }).catch(err => reject(err))
    })
}
