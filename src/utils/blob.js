/**
 * 将dataURL转换为blob
 * @param {*} dataURL
 */
function dataURL2Blob(dataURL) {
    const arr = dataURL.split(',')
    const type = arr[0].match(/:(.*?);/)[1]
    const text = window.atob(arr[1]) // 将base64转换成文本
    let n = text.length
    const uint8Array = new Uint8Array(n)
    while (n--) {
        uint8Array[n] = text.charCodeAt(n)
    }
    return new Blob([uint8Array], { type })
}

/**
 * 将blob转换为dataURL
 * @param {*} blob
 */
function blob2DataURL(blob) {
    return new Promise(resolve => {
        const fileReader = new FileReader()
        fileReader.onload = e => resolve(e.target.result)
        fileReader.readAsDataURL(blob)
    })
}

export {
    dataURL2Blob,
    blob2DataURL
}
