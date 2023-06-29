Vue.filter('px2mm', (px, unit) => {
    return unit === 'mm' ? Math.round(px / 300 * 25.4) : px
})

Vue.filter('mm2px', mm => {
    return Math.round(mm / 25.4 * 300)
})
