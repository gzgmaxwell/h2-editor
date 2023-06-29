import dom2canvas from '../../utils/dom2canvas'

let glCanvas = null
function getEffectWithTexture(glCanvas, texture, config) {
    const get = (key) => {
        if (config[key]) {
            return config[key] / 100
        } else {
            return 0
        }
    }
    const excute = glCanvas.draw(texture)
    // 判断 亮度和 对比度 范围：-1 - 1
    if (get('contrast') !== 0 || get('brightness') !== 0) {
        excute.brightnessContrast(get('brightness'), get('contrast'))
    }
    // 判断 色调和饱和度 范围：-1 - 1
    if (get('hue') !== 0 || get('saturation') !== 0) {
        excute.hueSaturation(get('hue'), get('saturation'))
    }
    // 判断噪音 范围： 0 - 1
    if (get('noise') !== 0) {
        excute.noise(get('noise'))
    }
    // 判断褐色 范围：0 - 1
    if (get('sepia') !== 0) {
        excute.sepia(get('sepia'))
    }
    // 判断亮丽度 范围： -1 - 1
    if (get('vibrance') !== 0) {
        excute.vibrance(get('vibrance'))
    }
    // 判断暗角 范围： 0 - 1  size amount
    if (get('vignette') !== 0) {
        excute.vignette(0.35, get('vignette'))
    }
    // 判断降噪 范围： 0 - 50  size amount
    if (get('denoise') !== 0) {
        excute.denoise(get('denoise') * 50)
    }
    // 判断锐利 范围： 半径0 - 200  强度 0 - 5
    if (get('unsharpMask') !== 0) {
        excute.unsharpMask(30, get('unsharpMask') * 5)
    }
    // 判断模糊 范围： 0 - 30
    if (get('triangleBlur') !== 0) {
        excute.triangleBlur(get('triangleBlur') * 30)
    }
    // 判断梦幻醉 范围 0 - 50 三个参数：radius brightness angle
    if (get('lensBlur') !== 0) {
        excute.lensBlur(get('lensBlur') * 50, 1, 0.5)
    }
    // 判断梦幻醉 范围 0 - 1
    if (get('ink') !== 0) {
        excute.ink(get('ink'))
    }
    excute.update()
}
// 根据配置生成快照的效果图
function generateSnapshotDataByConfig(config) {
    return new Promise((resolve, reject) => {
        if (!glCanvas) {
            glCanvas = window.fx.canvas()
        }
        const imgNode = new Image()
        imgNode.src = Vue.store.state.photoFilter.snapshot
        const get = (key) => {
            if (config[key]) {
                return config[key] / 100
            } else {
                return 0
            }
        }
        imgNode.onload = function () {
            const texture = glCanvas.texture(imgNode)
            const excute = glCanvas.draw(texture)
            // 判断 亮度和 对比度 范围：-1 - 1
            if (get('contrast') !== 0 || get('brightness') !== 0) {
                excute.brightnessContrast(get('brightness'), get('contrast'))
            }
            // 判断 色调和饱和度 范围：-1 - 1
            if (get('hue') !== 0 || get('saturation') !== 0) {
                excute.hueSaturation(get('hue'), get('saturation'))
            }
            // 判断噪音 范围： 0 - 1
            if (get('noise') !== 0) {
                excute.noise(get('noise'))
            }
            // 判断褐色 范围：0 - 1
            if (get('sepia') !== 0) {
                excute.sepia(get('sepia'))
            }
            // 判断亮丽度 范围： -1 - 1
            if (get('vibrance') !== 0) {
                excute.vibrance(get('vibrance'))
            }
            // 判断暗角 范围： 0 - 1  size amount
            if (get('vignette') !== 0) {
                excute.vignette(0.35, get('vignette'))
            }
            // 判断降噪 范围： 0 - 50  size amount
            if (get('denoise') !== 0) {
                excute.denoise(get('denoise') * 50)
            }
            // 判断锐利 范围： 半径0 - 200  强度 0 - 5
            if (get('unsharpMask') !== 0) {
                excute.unsharpMask(30, get('unsharpMask') * 5)
            }
            // 判断模糊 范围： 0 - 30
            if (get('triangleBlur') !== 0) {
                excute.triangleBlur(get('triangleBlur') * 30)
            }
            // 判断梦幻醉 范围 0 - 50 三个参数：radius brightness angle
            if (get('lensBlur') !== 0) {
                excute.lensBlur(get('lensBlur') * 50, 1, 0.5)
            }
            // 判断梦幻醉 范围 0 - 1
            if (get('ink') !== 0) {
                excute.ink(get('ink'))
            }
            excute.update()
            resolve(glCanvas.toDataURL())
        }
    })
}
function getEffectCanvasByConfig(glCanvas, baseData, config) {
    return new Promise((resolve, reject) => {
        if (!baseData) {
            return
        }
        const imgNode = new Image()
        imgNode.src = baseData
        const get = (key) => {
            if (config[key]) {
                return config[key] / 100
            } else {
                return 0
            }
        }
        imgNode.onload = function () {
            const texture = glCanvas.texture(imgNode)
            const excute = glCanvas.draw(texture)
            // 判断 亮度和 对比度 范围：-1 - 1
            if (get('contrast') !== 0 || get('brightness') !== 0) {
                excute.brightnessContrast(get('brightness'), get('contrast'))
            }
            // 判断 色调和饱和度 范围：-1 - 1
            if (get('hue') !== 0 || get('saturation') !== 0) {
                excute.hueSaturation(get('hue'), get('saturation'))
            }
            // 判断噪音 范围： 0 - 1
            if (get('noise') !== 0) {
                excute.noise(get('noise'))
            }
            // 判断褐色 范围：0 - 1
            if (get('sepia') !== 0) {
                excute.sepia(get('sepia'))
            }
            // 判断亮丽度 范围： -1 - 1
            if (get('vibrance') !== 0) {
                excute.vibrance(get('vibrance'))
            }
            // 判断暗角 范围： 0 - 1  size amount
            if (get('vignette') !== 0) {
                excute.vignette(0.35, get('vignette'))
            }
            // 判断降噪 范围： 0 - 50  size amount
            if (get('denoise') !== 0) {
                excute.denoise(get('denoise') * 50)
            }
            // 判断锐利 范围： 半径0 - 200  强度 0 - 5
            if (get('unsharpMask') !== 0) {
                excute.unsharpMask(30, get('unsharpMask') * 5)
            }
            // 判断模糊 范围： 0 - 30
            if (get('triangleBlur') !== 0) {
                excute.triangleBlur(get('triangleBlur') * 30)
            }
            // 判断梦幻醉 范围 0 - 50 三个参数：radius brightness angle
            if (get('lensBlur') !== 0) {
                excute.lensBlur(get('lensBlur') * 50, 1, 0.5)
            }
            // 判断梦幻醉 范围 0 - 1
            if (get('ink') !== 0) {
                excute.ink(get('ink'))
            }
            excute.update()
            resolve()
        }
    })
}
// 初始化快照
function initSnapshot() {
    /**  快照尺寸大小 256px * 80px
            * 快照生成策略：
            *  1. 把原图的宽度缩小到256px 然后高度截图中间
            *  2. 如果宽度不够则放大图片宽度到256  然后高度截取中间
           */
    const canvasNode = document.getElementsByClassName('eqc-photo-background-image-webgl')[0]

    const $tempDiv = document.createElement('div')
    document.body.appendChild($tempDiv)
    // $tempDiv.attr({ id: 'h2-photo-tmp-div-img' })
    $tempDiv.css({
        position: 'fixed',
        top: 0,
        left: 500,
        width: '256px',
        height: '80px',
        background: `url('${canvasNode.toDataURL()}') center center/cover`,
        zIndex: -1 // 避免盖在当前页面上
    })
    Vue.store.commit('PHOTO_FILTER_PRIMARY_IMG_CHANGE', canvasNode.toDataURL())
    return new Promise((resolve, reject) => {
        dom2canvas($tempDiv)
            .then(canvas => {
                $tempDiv.remove()
                // 快照生成完毕
                Vue.store.commit('PHOTO_FILTER_SNAPSHOT_CHANGE', canvas.toDataURL())
                resolve()
            })
            .catch(err => reject(err))
    })
}
export default {
    getEffectCanvasByConfig,
    generateSnapshotDataByConfig,
    initSnapshot,
    getEffectWithTexture
}
