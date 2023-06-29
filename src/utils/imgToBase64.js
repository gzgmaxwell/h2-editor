
export default function getBase64Image(src) {
    const canvas = document.createElement('canvas')
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    const ctx = canvas.getContext('2d')
    img.src = src
    return new Promise((resolve, reject) => {
        img.onload = function () {
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            const url = canvas.toDataURL()
            resolve(url)
        }
    })
}
