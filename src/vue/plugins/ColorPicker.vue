<template>
    <div
        :style="css"
        class="eqc-color-picker"
        @mousedown.stop
    >
        <color-picker
            :sucker-canvas="canvasSucker"
            :sucker-area="suckerArea"
            :color="color"
            :colors-history-key="colorPickerHistory"
            :sucker-enabled="suckerEnable"
            @change="changeColor"
            @openSucker="openSucker"
        />
    </div>
</template>

<script>
import EqxScene from '../../core/scene'
import EqxPage from '../../core/html/page'
import storageLocal from '../../utils/storageLocal'
import colorPicker from './ColorPickerPro.vue'
import imgSucker from '../../img/sucker.png'

export default {
    components: {
        colorPicker
    },
    props: {
        model: {
            type: Object,
            default: null
        },
        modelKey: {
            type: String,
            default: ''
        },
        css: {
            type: Object,
            default: null
        },
        // 增加是否开放吸管功能
        suckerEnable: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            color: this.model[this.modelKey],
            isOpenSucker: false, // 在其它地方会用到这个属性
            canvasSucker: null,
            suckerArea: [],
            mask: null,
            colorPickerHistory: storageLocal.key.colorPickerHistory
        }
    },
    computed: {
        eqxPage() {
            return Vue.store.state.scene.eqxPage
        }
    },
    methods: {
        changeColor(rgba) {
            this.model[this.modelKey] = rgba.toRgbaString()
        },
        openSucker(isOpen) {
            if (isOpen) {
                Vue.notifier.info('按esc键或者再次点击吸管，退出取色模式')

                this.isOpenSucker = true
                this.css.pointerEvents = 'auto'
                document.body.css({
                    pointerEvents: 'none'
                })

                const { pageJson, eqxScene, scale } = this.eqxPage
                const eqxSceneNew = new EqxScene(JSON.parse(JSON.stringify(eqxScene.sceneJson)))
                const eqxPageNew = new EqxPage(JSON.parse(JSON.stringify(pageJson)), eqxSceneNew)
                // 生成图片时，默认背景是白色，传null刚为透明
                eqxPageNew.page2Canvas({ scale }, false)
                    .then(canvas => {
                        // 如果很快就按下esc，就无须再下执行了
                        if (!this.isOpenSucker) {
                            return
                        }
                        this.setSuckerCanvas(canvas)
                        this.suckerArea = this.getSuckerArea()
                        this.mask = this.createMask(this.suckerArea)
                        this.eqxPage.$el.appendChild(canvas)
                        document.body.appendChild(this.mask)
                        // 这些里有子元素的pointerEvents为auto，会有影响，所以先隐藏
                        const rulers = document.querySelectorAll('.eqc-ruler-bar, .eqc-ruler-line, .eqc-grid-line') || []
                        rulers.forEach(item => item.css({ display: 'none' }))
                        this.canvasSucker = canvas
                    })
                    .catch(err => err && this.logger.error(err))
            } else {
                this.isOpenSucker = false
                this.mask && this.mask.remove()
                this.canvasSucker && this.canvasSucker.remove()
                delete this.css.pointerEvents
                document.body.css({
                    pointerEvents: ''
                })
                const rulers = document.querySelectorAll('.eqc-ruler-bar, .eqc-ruler-line, .eqc-grid-line') || []
                rulers.forEach(item => item.css({ display: '' }))
            }
        },
        setSuckerCanvas(canvas) {
            // 设置需要被取色的canvas的位置
            canvas.css({
                position: 'absolute',
                left: 0,
                top: 0,
                opacity: 0,
                pointerEvents: 'auto',
                cursor: `url(${imgSucker}) 0 32, default`,
                zIndex: 1002 // 层级需要在组件选择框之上
            })
            // 避免点击workspace时，右侧组件设置面板隐藏的问题
            canvas.addEventListener('mousedown', e => e.stopPropagation())
        },
        getSuckerArea() {
            const pageRect = this.eqxPage.$el.getBoundingClientRect()
            const workspaceRect = this.eqxPage.$el.parentElement.getBoundingClientRect()

            return [
                Math.max(workspaceRect.left, pageRect.left),
                Math.max(workspaceRect.top, pageRect.top),
                Math.min(workspaceRect.right, pageRect.right),
                Math.min(workspaceRect.bottom, pageRect.bottom)
            ]
        },
        createMask([left, top, right, bottom]) {
            // 用canvas制作一个挖空区域
            const canvasMask = this.canvasMask = document.createElement('canvas')
            const ctx = canvasMask.getContext('2d')
            canvasMask.width = document.body.clientWidth
            canvasMask.height = document.body.clientHeight
            canvasMask.setAttribute('id', 'suckerMaskId')
            ctx.fillStyle = 'rgba(0,0,0,0.7)'
            ctx.fillRect(0, 0, canvasMask.width, canvasMask.height)
            ctx.clearRect(left, top, right - left, bottom - top)
            canvasMask.css({
                position: 'absolute',
                left: 0,
                top: 0,
                outline: '10000px solid rgba(0,0,0,0.7)',
                zIndex: 6 // 层级需要比左侧nav高
            })

            return canvasMask
        }
    }
}

</script>

<style lang="scss">
.eqc-color-picker {
    position: absolute;
    z-index: 96;
}
</style>
