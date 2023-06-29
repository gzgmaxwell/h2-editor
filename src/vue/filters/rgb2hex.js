Vue.filter('rgb2hex', (value, upper) => {
    let color = ''
    if (/#/.test(value)) {
        color = value
    } else if (/rgb/.test(value)) {
        const rgba = /rgba?\((.*?)\)/.exec(value)[1].split(',')
        color = `#${change(rgba[0])}${change(rgba[1])}${change(rgba[2])}`
    }
    return upper ? color.toUpperCase() : color
})

function change(o2) {
    return ('0' + Number(o2).toString(16)).slice(-2)
}
