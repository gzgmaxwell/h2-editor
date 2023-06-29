import WordCloud from '../../../utils/wordcloud2'
import imgToBase64 from '../../../utils/imgToBase64'
import color from '../../../utils/color'

export default class Tcloud {
    constructor() {
        this.rendered = false // 是否生成过
        this.userSelectTextColor = []// 用户选择的文字色
        this.wordWeight = [11, 9, 6, 6, 5, 4, 3, 3]// 权重量级
        this.words = [] // 词汇
        this.$canvas = null
        this.maxMaskCanvas = { width: 100, height: 100 }
        this.drawShapeNum = 0 // 已绘制的蒙版计数
        this.maskCanvasList = [] // 需要绘制的形状蒙版list
        this.isCreating = false // 是否在生成中
        this.maxFontSize = 200 // 最大字号
        this.bgTransOpacity = 0.01 // 形状背景透明度
        this.bgTransparent = false // 形状背景是否透明
        this.isBgColorCustomized = false // 形状背景颜色自定义
        this.userSelectBgColor = 'rgba(0, 0, 0, 1)' // 自定义颜色
        this.isTextColorCustomized = false // 文字颜色自定义
        this.createOption = {
            // drawOutOfBound: true,
            clearCanvas: false,
            ellipticity: 1,
            weightFactor: (size) => {
                let res = (Math.pow(size, 2.6) * this.$canvas.width / 1024)
                if (this.maxFontSize > 0 && res > this.maxFontSize) {
                    res = this.maxFontSize
                }
                return res
            }
        }

        this.initWordCloud()
    }

    initWordCloud() {
        this.$canvas = document.getElementById('wcpCanvas')

        if (!this.$canvas) {
            Vue.logger.error('init fail, $canvas is null')
            return
        }
        this.$canvas.addEventListener('wordcloudstop', () => {
            this.drawShapeNum++
            if (this.drawShapeNum < this.maskCanvasList.length) {
                this.run(this.maskCanvasList[this.drawShapeNum])
            } else {
                this.drawShapeNum = 0
                this.isCreating = false
                Vue.loading.close()
            }
        })
        this.$canvas.addEventListener('wordcloudstart', () => {
            // console.log('wordcloudstart')
        })
    }

    // 清理canvas
    clearCanvas() {
        var ctx = this.$canvas.getContext('2d')
        ctx.clearRect(0, 0, this.$canvas.width, this.$canvas.height)
        this.rendered = false
    }

    // 绘制字云
    run(currentShape) {
        if (this.drawShapeNum === 0) {
            Vue.loading.open('字云生成中')
            this.rendered = true
        }
        this.isCreating = true
        this.setOptionShape(currentShape)
        WordCloud(this.$canvas, this.createOption)
    }

    // 检查形状图片是否符合使用条件
    checkShape(url) {
        return new Promise((resolve, reject) => {
            Vue.api.file.getImageInfo(url)
                .then(res => {
                    if (res.data.format !== 'png') {
                        Vue.notifier.fail('形状图片格式需为PNG，请重新选择')
                        reject()
                    }
                    if (res.data.size / 1024 / 1024 > 2) {
                        Vue.notifier.fail('形状图片需小于2M，请重新选择')
                        reject()
                    }
                    resolve()
                })
        })
    }

    // 提取形状
    getShapes(url) {
        return new Promise((resolve, reject) => {
            let pixelNum = 0
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
                const { targetWidth, targetHeight } = this.fixSize(this.maxMaskCanvas.width, this.maxMaskCanvas.height, img.width, img.height)
                var temp = document.createElement('canvas')
                temp.width = this.maxMaskCanvas.width
                temp.height = this.maxMaskCanvas.height

                const ctx = temp.getContext('2d')
                ctx.drawImage(img, (temp.width - targetWidth) / 2, (temp.height - targetHeight) / 2, targetWidth, targetHeight)
                const imageData = ctx.getImageData(0, 0, temp.width, temp.height)
                pixelNum = imageData.data.length / 4
                const shapes = {}
                for (var i = 0; i < imageData.data.length; i += 4) {
                    var alpha = imageData.data[i + 3]
                    if (alpha > 69) {
                        var key = `${imageData.data[i]}rgba${imageData.data[i + 1]}rgba${imageData.data[i + 2]}rgba${imageData.data[i + 3]}`
                        if (!shapes[key]) {
                            shapes[key] = []
                        }
                        shapes[key].push(i)
                    }
                }
                for (const key in shapes) {
                    if (shapes[key].length < pixelNum * 0.02) { delete shapes[key] }
                }
                resolve(shapes)
            }
            img.src = url
        })
    }

    // 设置形状
    setShapes(shapes) {
        return new Promise((resolve, reject) => {
            const getShapeCanvas = (color, data) => {
                const rgba = color.split('rgba')
                const r = Number(rgba[0])
                const g = Number(rgba[1])
                const b = Number(rgba[2])
                const a = Number(rgba[3])
                const bgColor = `rgba(${r},${g},${b},0.9)`
                const textColor = `rgba(${r},${g},${b},1)`
                return new Promise((resolve, reject) => {
                    const mCanvas = document.createElement('canvas')
                    mCanvas.width = this.maxMaskCanvas.width
                    mCanvas.height = this.maxMaskCanvas.height

                    var ctx = mCanvas.getContext('2d')
                    ctx.fillStyle = 'red'
                    ctx.fillRect(0, 0, mCanvas.width, mCanvas.height)
                    const imageData = ctx.getImageData(0, 0, mCanvas.width, mCanvas.height)
                    const newImageData = ctx.createImageData(imageData)

                    for (var i = 0; i < imageData.data.length; i += 4) {
                        if (data.indexOf(i) === -1) {
                            // Area not to draw
                            newImageData.data[i] =
                                newImageData.data[i + 1] =
                                newImageData.data[i + 2] = 255
                            newImageData.data[i + 3] = 0
                        } else {
                            // Area to draw
                            newImageData.data[i] = r
                            newImageData.data[i + 1] = g
                            newImageData.data[i + 2] = b
                            newImageData.data[i + 3] = a
                        }
                    }
                    ctx.putImageData(newImageData, 0, 0)
                    resolve({ mCanvas, bgColor, textColor })
                })
            }
            const shapeReqs = []
            for (const key in shapes) {
                const data = shapes[key]
                const color = key
                shapeReqs.push(getShapeCanvas(color, data))
            }
            Promise.all(shapeReqs).then((res) => {
                resolve(res)
            }).catch((error) => { reject(error) })
        })
    }

    setTcouldShape(path) {
        this.checkShape(path)
            .then(() => {
                this.clearCanvas()
                const url = Vue.env.host.file + path
                imgToBase64(url).then(res => {
                    this.getShapes(url)
                        .then((res) => {
                            this.setShapes(res)
                                .then(res => {
                                    this.maskCanvasList = res

                                    if (this.words.length > 0) {
                                        this.run(this.maskCanvasList[0])
                                    } else {
                                        Vue.notifier.warn('请添加文字')
                                    }
                                })
                        })
                })
            })
            .catch(err => {
                err && Vue.logger.error(err)
            })
    }

    // 设置形状mask
    setShapeMask(mask) {
        let bctx = document.createElement('canvas').getContext('2d')
        bctx.fillStyle = this.createOption.backgroundColor || '#fff'
        bctx.fillRect(0, 0, 1, 1)
        let bgPixel = bctx.getImageData(0, 0, 1, 1).data

        let maskCanvasScaled = document.createElement('canvas')
        maskCanvasScaled.width = this.$canvas.width
        maskCanvasScaled.height = this.$canvas.height

        let ctx = maskCanvasScaled.getContext('2d')
        // 把shape canvas 缩放成 main canvas 大小
        ctx.drawImage(mask, 0, 0, mask.width, mask.height, 0, 0, maskCanvasScaled.width, maskCanvasScaled.height)
        // document.body.appendChild(maskCanvasScaled)
        // 复制像素值
        let imageData = ctx.getImageData(0, 0, this.$canvas.width, this.$canvas.height)
        // 创建一个新的imageData，宽高与canvas一致，里面的像素为透明
        let newImageData = ctx.createImageData(imageData)
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i + 3] > 128) {
                // shape区域
                newImageData.data[i] = bgPixel[0]
                newImageData.data[i + 1] = bgPixel[1]
                newImageData.data[i + 2] = bgPixel[2]
                newImageData.data[i + 3] = bgPixel[3]// 0:透明~ 255：不透明
            } else {
                // shape 之外区域
                newImageData.data[i] = bgPixel[0]
                newImageData.data[i + 1] = bgPixel[1]
                newImageData.data[i + 2] = bgPixel[2]
                newImageData.data[i + 3] = this.bgTransparent ? (bgPixel[3] - 1) : 0
            }
        }
        ctx.putImageData(newImageData, 0, 0)
        ctx = this.$canvas.getContext('2d')
        ctx.drawImage(maskCanvasScaled, 0, 0)
        maskCanvasScaled = ctx = imageData = newImageData = bctx = bgPixel = undefined
    }

    setAutoColor(bgColor, textColor) {
        // 背景色
        if (!this.isBgColorCustomized) {
            if (Number(this.bgTransOpacity) === 0) {
                this.createOption.backgroundColor = 'rgba(255,255,255,0.01)'
            } else {
                if (bgColor.indexOf('#') > -1) {
                    const rgba = color.hex2rgba(bgColor)
                    bgColor = `rgba(${rgba.r},${rgba.g},${rgba.b},${this.bgTransOpacity})`
                } else {
                    const rgba = bgColor.match(/(\d(\.\d+)?)+/g)
                    bgColor = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${this.bgTransOpacity})`
                }
                this.createOption.backgroundColor = bgColor
            }
        }
        // 文字颜色
        if (!this.isTextColorCustomized) {
            this.createOption.color = textColor
        }
    }

    // 设置当前绘制的形状 循环调用
    setOptionShape(shapeInfo) {
        if (shapeInfo) {
            this.createOption.clearCanvas = false
            this.setAutoColor(shapeInfo.bgColor, shapeInfo.textColor)
            this.setShapeMask(shapeInfo.mCanvas)
        }
    }

    // 1、自定义形状背景颜色和透明度
    setOptionBgColor() {
        if (this.isBgColorCustomized) {
            if (this.userSelectBgColor === 'transparent') {
                this.bgTransparent = true
                this.createOption.backgroundColor = 'rgba(255,255,255,0.01)'
            } else {
                this.bgTransparent = false
                if (Number(this.bgTransOpacity) === 0) {
                    this.createOption.backgroundColor = 'rgba(255,255,255,0.01)'
                } else {
                    let mixBgColor = this.userSelectBgColor
                    if (mixBgColor.indexOf('#') > -1) {
                        const rgba = color.hex2rgba(mixBgColor)
                        mixBgColor = `rgba(${rgba.r},${rgba.g},${rgba.b},${this.bgTransOpacity})`
                    } else {
                        const rgba = mixBgColor.match(/(\d(\.\d+)?)+/g)
                        mixBgColor = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${this.bgTransOpacity})`
                    }

                    this.createOption.backgroundColor = mixBgColor
                }
            }
        }
    }

    // 2、字体
    setOptionFontStyle(fontFamily) {
        this.createOption.fontFamily = fontFamily
    }

    // 3、最大字号
    setOptionMaxFontSize(size) {
        this.maxFontSize = size
    }

    // 4、紧密度
    setOptionGridSize(size) {
        this.createOption.gridSize = size
    }

    // 5、旋转角度
    setOptionRotate(item) {
        this.createOption.rotateRatio = item.rotateRatio
        this.createOption.minRotation = item.minRotation
        this.createOption.maxRotation = item.maxRotation
        this.createOption.rotationSteps = item.rotationSteps
    }

    // 6、自定义文字颜色
    setOptionTextColor() {
        // text color set
        if (this.isTextColorCustomized) {
            this.createOption.color = this.setTextColorOption()
        }
    }

    // 7、文字
    setOptionWords() {
        // word list set
        this.createOption.list = this.setWordListOption()
    }

    // 设置文字颜色
    setTextColorOption() {
        const count = this.userSelectTextColor.length
        let colors = this.userSelectTextColor
        const weightCount = this.wordWeight.length
        let random = true
        if (count < weightCount) { // 颜色数量小于权重等级则补全，每个权重一种颜色
            const minCount = weightCount - count
            const dif = parseInt(minCount / count)
            const rem = parseInt(minCount % count)
            const tmp = [...colors]
            for (let i = 0; i < dif; i++) {
                colors = colors.concat(tmp)
            }
            if (rem > 0) {
                colors = colors.concat(tmp.slice(0, rem + 1))
            }
        } else if (count > weightCount) { // 颜色数量大于权重等级则每个词随机选择一种颜色
            random = true
        }
        let colorObj = {}
        if (!random) {
            this.wordWeight.map((v, i) => {
                colorObj = Object.assign(colorObj, { [v]: colors[i] })
            })
        }

        return (word, weight, fontSize, distance, theta) => {
            if (random) {
                const index = this.getRandomIntInclusive(0, count - 1)
                return colors[index]
            } else {
                return colorObj[weight]
            }
        }
    }

    getRandomIntInclusive(min, max) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    // 设置词组
    setWordListOption() {
        const wordList = []
        const nums = this.wordWeight.slice(1)
        const keyword = this.words[0]
        const levelCount = 30
        const wordCount = this.words.length
        if (wordCount < levelCount) {
            const minCount = levelCount - wordCount
            if (minCount < wordCount) {
                this.words = this.words.concat(this.words.slice(0, minCount + 1))
            } else {
                const dif = parseInt(minCount / wordCount)
                const rem = parseInt(minCount % wordCount)
                const tmp = [...this.words]
                for (let i = 0; i < dif; i++) {
                    this.words = this.words.concat(tmp)
                }
                if (rem > 0) {
                    this.words = this.words.concat(tmp.slice(0, rem + 1))
                }
            }
            nums.forEach((n, i) => {
                const tmp = this.words.slice(0, levelCount / nums.length * (i + 1))
                tmp.forEach((w) => {
                    wordList.push([w, n])
                })
            })
        } else {
            let copyWords = [...this.words]
            nums.forEach((n, i) => {
                const tmpCount = parseInt(levelCount / nums.length * (i + 1))
                if (copyWords.length < tmpCount) {
                    copyWords = copyWords.concat(copyWords, this.words.slice(0, tmpCount - copyWords.length))
                }
                const tmp = copyWords.splice(0, tmpCount)
                tmp.forEach((w) => {
                    wordList.push([w, n])
                })
            })
        }
        wordList.unshift([keyword, this.wordWeight[0]])
        return wordList
    }

    fixSize(maxWidth, maxHeight, imgWidth, imgHeight) {
        const originWidth = imgWidth
        const originHeight = imgHeight
        let targetWidth = originWidth
        let targetHeight = originHeight
        // 尺寸超过限制
        if (originWidth > maxWidth || originHeight > maxHeight) {
            if (originWidth / originHeight > maxWidth / maxHeight) {
                targetWidth = maxWidth
                targetHeight = Math.floor(maxWidth * (originHeight / originWidth))
            } else {
                targetHeight = maxHeight
                targetWidth = Math.floor(maxHeight * (originWidth / originHeight))
            }
        } else { // 上传形状图片小于目标尺寸，则按长边放大到目标尺寸
            if (originWidth > originHeight) {
                targetWidth = maxWidth
                targetHeight = Math.floor(maxWidth * (originHeight / originWidth))
            } else {
                targetHeight = maxHeight
                targetWidth = Math.floor(maxHeight * (originWidth / originHeight))
            }
        }

        return { targetWidth, targetHeight }
    }
}
