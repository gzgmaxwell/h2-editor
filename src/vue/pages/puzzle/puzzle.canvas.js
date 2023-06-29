import dom2canvas from '../../../utils/dom2canvas'

export default puzzle2Canvas

function getCanvas($svg, data, count, multiples = 1, size = 800) {
    const { x, y, width, height } = data
    const $tempDiv = document.createElement('div')
    document.body.appendChild($tempDiv)
    $tempDiv.attr({ id: 'h2-puzzle-tmp-div' })
    $tempDiv.css({
        position: 'fixed',
        top: 0,
        left: 0,
        width: size * multiples + 'px',
        height: size * multiples + 'px',
        overflow: 'hidden',
        zIndex: -1 // 避免盖在当前页面上
    })
    let vWidth = width
    let vHeight = height
    if (vWidth > vHeight) {
        vHeight = vWidth
    } else {
        vWidth = vHeight
    }
    const $gs = $svg.querySelectorAll('.partG')
    for (let i = 0; i < $gs.length; i++) {
        const opacity = i === count ? 1 : 0
        $gs[i].attr({ opacity })
    }
    $svg.css({
        width: size * multiples + 'px',
        height: size * multiples + 'px'
    })
    $svg.attr({
        viewBox: `${x} ${y} ${vWidth} ${vHeight}`
    })
    $tempDiv.append($svg)
    return new Promise((resolve, reject) => {
        dom2canvas($tempDiv)
            .then(canvas => {
                $tempDiv.remove()
                resolve(canvas)
            })
            .catch(err => reject(err))
    })
}
function puzzle2Canvas(options) {
    const cpsData = options.data.property.cpsData
    const $svg = options.ele.$svg.cloneNode(true)
    const multiples = options.multiples
    const size = options.size
    return new Promise((resolve, reject) => {
        const canvas = []
        let count = 0
        const request = (data) => {
            getCanvas($svg, data, count, multiples, size).then(res => {
                canvas.push(res)
                count++
                if (count === cpsData.length) {
                    resolve(canvas)
                } else {
                    request(cpsData[count])
                }
            }).catch(err => reject(err))
        }
        request(cpsData[count])
    })
}
