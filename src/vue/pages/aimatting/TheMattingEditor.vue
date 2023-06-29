<template>
    <div class="eqc-aimatting-editor">
        <div class="matting-box">
            <div class="matting-content" />
        </div>
    </div>
</template>

<script>
import delayLoad from '../../../utils/delayLoad'
import color from '../../../utils/color'

export default {
    components: {

    },
    props: {
        data: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            isFillingColor: false, // 正在填充颜色
            lastFilledColor: null, // 最后一次填充色
            isReady: false,
            ps: null, // ps对象
            isInitPs: false
        }
    },
    computed: {
        host() {
            return this.env.host
        },
        matting() {
            return Vue.store.state.aiMatting
        },
        mattingSrc() {
            return this.matting.src
        },
        penMode() {
            return this.matting.penMode
        },
        penWidth() {
            return this.matting.penWidth
        },
        smoothness() {
            return this.matting.smoothness
        },
        fillColor() {
            return this.matting.filledColor
        },
        isOpenDrag() {
            return this.matting.isOpenDrag
        },
        scale() {
            return this.matting.scale
        },
        undo() {
            return this.matting.undo
        },
        redo() {
            return this.matting.redo
        }
    },
    watch: {
        mattingSrc: {
            handler(newVal) {
                if (newVal !== '' && !this.isInitPs) {
                    // 初始化
                    this.initEqxPS()
                    this.isInitPs = true
                } else {
                    // 更换图片
                    // const url = `${this.host.file}${newVal.split('?')[0]}?imageMogr2/thumbnail/2000x2000>/strip`
                    // this.ps && this.ps.changeImg(url)
                    // 重新初始化
                    $('.eqx-editor-ps-workspace').remove()
                    this.ps = null
                    this.initEqxPS()
                }
            }
        },
        penMode: {
            handler(newVal) {
                if (newVal === 'keep') {
                    this.ps && this.ps.changPenMode(false)
                } else if (newVal === 'drop') {
                    this.ps && this.ps.changPenMode(true)
                }
            }
        },
        penWidth: {
            handler(newVal) {
                this.ps && this.ps.changPenSize(newVal)
            }
        },
        smoothness: {
            handler(newVal) {
                if (this.ps.historyStatus() !== 'first' && newVal !== 0) { // 必须有history才能羽化
                    this.ps && this.ps.changeFeatherRadius(newVal)
                    this.clearCustomColor()
                }
            }
        },
        fillColor: {
            handler(newVal) {
                if (newVal === 'transparent') {
                    return
                }
                if (this.isFillingColor) {
                    return
                }
                // this.fillCustomColor(newVal).then(() => {
                //     this.lastFilledColor = color
                // })
                const color = this.getCustomColor(newVal)
                if (color) {
                    this.fillCustomColor(color, true).then(() => {
                        this.lastFilledColor = color
                    })
                }
            }
        },
        'undo.random': {
            handler() {
                this.ps && this.ps.back()
                this.clearCustomColor()
                const $rework = this.$el.parentElement.querySelector('.rework')
                const $back = this.$el.parentElement.querySelector('.back')
                if (this.ps.historyStatus() === 'first') {
                    $rework.style = 'color:#76838f !important;cursor: pointer;pointer-events:auto;'
                    $back.style = 'color:#ccd5db !important;cursor: auto; pointer-events:none;'
                } else if (this.ps.historyStatus() === 'last') {
                    $rework.style = 'color:#ccd5db !important;cursor: auto; pointer-events:none;'
                    $back.style = 'color:#76838f !important;cursor: pointer;pointer-events:auto;'
                } else {
                    $rework.style = 'color:#76838f !important;cursor: pointer;pointer-events:auto;'
                    $back.style = 'color:#76838f !important;cursor: pointer;pointer-events:auto;'
                }
            }
        },
        'redo.random': {
            handler() {
                this.ps && this.ps.forward()
                this.clearCustomColor()
                const $rework = this.$el.parentElement.querySelector('.rework')
                const $back = this.$el.parentElement.querySelector('.back')
                if (this.ps.historyStatus() === 'first') {
                    $rework.style = 'color:#76838f !important;cursor: pointer;pointer-events:auto;'
                    $back.style = 'color:#ccd5db !important;cursor: auto; pointer-events:none;'
                } else if (this.ps.historyStatus() === 'last') {
                    $rework.style = 'color:#ccd5db !important;cursor: auto; pointer-events:none;'
                    $back.style = 'color:#76838f !important;cursor: pointer;pointer-events:auto;'
                } else {
                    $rework.style = 'color:#76838f !important;cursor: pointer;pointer-events:auto;'
                    $back.style = 'color:#76838f !important;cursor: pointer;pointer-events:auto;'
                }
            }
        },
        scale: {
            handler(newVal) {
                this.ps && this.ps.changeScale(this.scale)
                this.clearCustomColor()
            }
        },
        isOpenDrag: {
            handler(newVal) {
                if (this.isOpenDrag) {
                    this.ps.openDrag()
                } else {
                    this.ps.closeDrag()
                }
            }
        }
    },
    created() {
        this.initPs()
    },
    mounted() {
        const screenHeight = document.body.clientHeight
        const $content = this.$el.querySelector('.matting-content')
        $content.style = `height:${screenHeight - 60}px `
    },
    methods: {
        clearCustomColor() {
            this.lastFilledColor = null
            Vue.store.commit('AIMATTING_MATTING_FILL_COLOR', 'transparent')
        },
        getCustomColor(selectColor) {
            let r = 0
            let g = 0
            let b = 0
            let a = 0
            if (selectColor === '' || selectColor === 'transparent') {
                return null
            }
            if (selectColor.indexOf('#') > -1) {
                const rgba = color.hex2rgba(selectColor)
                r = rgba.r
                g = rgba.g
                b = rgba.b
                a = rgba.a
            } else {
                const rgba = selectColor.match(/(\d(\.\d+)?)+/g)
                r = rgba[0]
                g = rgba[1]
                b = rgba[2]
                a = rgba[3]
            }
            return { r: Number(r), g: Number(g), b: Number(b), a: parseInt(Number(a) * 255) }
        },
        fillCustomColor(color, reverse = false) {
            return new Promise((resolve, reject) => {
                Vue.loading.open('填色中')
                this.isFillingColor = true
                const canvas = this.ps.exportCanvas()
                const ctx = canvas.getContext('2d')
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

                for (var i = 0; i < imageData.data.length; i += 4) {
                    const alpha = imageData.data[i + 3]
                    if (!this.lastFilledColor) {
                        if (reverse) {
                            if (alpha > 128) {
                                imageData.data[i] = color.r
                                imageData.data[i + 1] = color.g
                                imageData.data[i + 2] = color.b
                                imageData.data[i + 3] = color.a
                            }
                        } else {
                            if (alpha < 3) {
                                imageData.data[i] = color.r
                                imageData.data[i + 1] = color.g
                                imageData.data[i + 2] = color.b
                                imageData.data[i + 3] = color.a
                            }
                        }
                    } else {
                        if (imageData.data[i] === this.lastFilledColor.r &&
                    imageData.data[i + 1] === this.lastFilledColor.g &&
                    imageData.data[i + 2] === this.lastFilledColor.b &&
                    imageData.data[i + 3] === this.lastFilledColor.a) {
                            imageData.data[i] = color.r
                            imageData.data[i + 1] = color.g
                            imageData.data[i + 2] = color.b
                            imageData.data[i + 3] = color.a
                        }
                    }
                }

                ctx.putImageData(imageData, 0, 0)

                // this.ps.fillBackground(color)
                Vue.loading.close()
                this.isFillingColor = false
                resolve()
            })
        },
        getMattingResult(needUpload = true) {
            return new Promise((resolve, reject) => {
                const canvasPromise = this.ps.exportCanvas()
                const tokenPromise = Vue.api.file.getUploadToken()
                if (!needUpload) {
                    resolve({ canvas: canvasPromise })
                } else {
                    Promise.all([tokenPromise, canvasPromise])
                        .then(([token, canvas]) => {
                            resolve(Vue.api.file.uploadBase64(canvas.toDataURL().split(',')[1], token))
                        })
                        .catch(err => reject(err))
                }
            })
        },
        startMatting() {
            Vue.loading.open('AI抠图中')
        },
        endMatting() {
            if (this.ps && this.ps.historyStatus() === 'last') {
                const $rework = this.$el.parentElement.querySelector('.rework')
                const $back = this.$el.parentElement.querySelector('.back')
                $rework.style = 'color:#ccd5db !important;cursor: auto; pointer-events:none;'
                $back.style = 'color:#76838f !important;cursor: pointer;pointer-events:auto;'

                const $pright = this.$el.parentElement.querySelector('.pright')
                $pright.classList.remove('btn-disabled')

                Vue.store.commit('AIMATTING_MATTING_STATUS', true)
            }
            Vue.loading.close()
            this.clearCustomColor()
        },
        initPs() {
            delayLoad.delayLoadJS(this.env.plugin.jquery)
                .then(() => delayLoad.delayLoadJS(this.env.plugin.eqxPs))
                .then(() => {
                    this.isReady = true
                    if (this.mattingSrc !== '') {
                        this.initEqxPS()
                    }
                })
                .catch(err => err && this.logger.error(err))
        },
        initEqxPS() {
            const config = {
                $dom: $('.matting-content'),
                img: `${this.host.file}${this.mattingSrc.split('?')[0]}?imageMogr2/auto-orient/thumbnail/2000x2000>/strip`,
                appId: 'h2',
                startLoadCb: this.startMatting,
                endLoadCb: this.endMatting
            }
            /* global EqxEditorPS */
            this.ps = new EqxEditorPS(config)
        }
    }
}
</script>

<style lang="scss">
.eqc-aimatting-editor {
    .matting-box {
        width: 100%;
        overflow: hidden;
    }
    .matting-content {
        width: auto;
        min-height: 500px;
        position: relative;
    }
}
</style>
