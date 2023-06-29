Vue.filter('backgroundImage', (src, url) => {
    if (src) {
        src = /base64|http/.test(src) ? src : Vue.env.host.file + src
        return 'url(' + src + ')'
    } else if (url) {
        return 'url(' + url + ')'
    } else {
        return ''
    }
})

Vue.filter('backgroundImageAbsoluteUrl', (src, url) => {
    if (src) {
        src = /base64|http/.test(src) ? src : Vue.env.host.file + src
        return src
    } else if (url) {
        return url
    } else {
        return ''
    }
})
