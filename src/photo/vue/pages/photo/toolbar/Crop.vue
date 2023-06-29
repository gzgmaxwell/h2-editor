<template>
    <div
        :style="{width: width, height: height, transform: transform ? transform : '',zIndex:1}"
        class="eqc-photo-crop"
    >
        <img
            ref="image"
            :src="`${curImage}`"
        >
    </div>
</template>

<script>
import utilDelayLoad from '../../../../../utils/delayLoad'

export default {
    data() {
        return {
            width: 0,
            height: 0,
            top: 0,
            left: 0,
            transform: null,
            cropper: null,
            cropperLoad: 0
        }
    },
    computed: {
        photoLayout() {
            return Vue.store.state.photoLayout
        },
        photoScene() {
            return Vue.store.state.photoScene
        },
        eqxPage() {
            return this.photoScene.eqxPage
        },
        toolCropChangeEvent() {
            return this.photoLayout.toolCropChangeEvent
        },
        toolCrop() {
            return this.photoLayout.toolCrop
        },
        curImage() {
            return document.querySelector('.eqc-photo-background-image').toDataURL()
        }
    },
    watch: {
        toolCropChangeEvent: {
            handler(newVal, oldVal) {
                if (this.cropper !== null && newVal.sender === 'commander') {
                    this.update()
                }
            },
            immediate: true,
            deep: true
        }
    },
    mounted() {
        this.init()
    },
    methods: {
        init() {
            this.initSize()
            this.initCrop()
        },
        // 初始化尺寸
        initSize() {
            const $editor = this.eqxPage.$el
            const $elWorkspace = $editor.parentElement
            if ($editor.style.transform) this.transform = $editor.style.transform
            this.width = $editor.offsetWidth + 'px'
            this.height = $editor.offsetHeight + 'px'
            this.top = ($elWorkspace.offsetHeight - $editor.offsetHeight) / 2 + 'px'
            this.left = ($elWorkspace.offsetWidth - $editor.offsetWidth) / 2 + 'px'
        },
        // 初始化裁剪
        initCrop() {
            const _self = this
            utilDelayLoad.delayLoadJS(Vue.env.plugin.cropper)
                .then(() => {
                    const image = this.$refs.image
                    this.cropper = new Cropper(image, {
                        viewMode: 2,
                        dragMode: 'move',
                        cropBoxResizable: true,
                        // aspectRatio: parseInt(this.width) / parseInt(this.height),
                        minContainerWidth: 1, // 设置成0会恢复成默认
                        minContainerHeight: 1, // 设置成0会恢复成默认
                        checkCrossOrigin: false,
                        guides: true,
                        center: false,
                        background: false,
                        movable: false,
                        zoomable: false,
                        toggleDragModeOnDblclick: false,
                        crop() {
                            // if (_self.cropperLoad >= 3) {
                            Vue.store.commit('PHOTO_TOOL_CROP', {
                                status: undefined,
                                cropType: undefined,
                                params: {
                                    outerChange: false,
                                    cropBoxMode: _self.toolCrop.params.cropBoxMode, // 裁切框模式 free(自由)||fixed_WH_Ratio(固定宽高比)||fixed_WH(固定大小)
                                    cropBoxAllowReSize: _self.toolCrop.params.cropBoxAllowReSize, // 裁切框允改变大小 ture||false
                                    cropBoxWidth: parseInt(event.detail.width), // 裁切框宽度
                                    cropBoxHeight: parseInt(event.detail.height), // 裁切框高度
                                    cropBoxWHRatio: _self.toolCrop.params.cropBoxWHRatio, // 裁切框宽高比
                                    cropBoxTop: parseInt(event.detail.y), // 裁切框top值
                                    cropBoxLeft: parseInt(event.detail.x) // 裁切框left值
                                }
                            })
                            Vue.store.commit('PHOTO_TOOL_CROP_CHANGE_EVENT', {
                                sender: 'executor',
                                timeStamp: Number(new Date())
                            })
                            // } else {
                            //     _self.cropperLoad += 1
                            // }
                        },
                        ready() {
                            document.querySelector('.cropper-modal').style.opacity = 0.6
                            document.querySelector('.cropper-face').style.opacity = 0
                            _self.update()
                        }
                    })
                })
        },
        allowResize(pIsAllow) {
            // 设置8个点的显示与否
            const resizePointDomArray = document.querySelectorAll('.cropper-point')
            for (let i = 0; i < resizePointDomArray.length; i++) {
                const element = resizePointDomArray[i]// className
                if (pIsAllow) {
                    element.className = element.className.replace(' cropper-hidden', '')
                } else {
                    element.className = element.className + ' cropper-hidden'
                }
            }
            // 设置4条变的显示与否
            const cropperLineDomArray = document.querySelectorAll('.cropper-line')
            for (let i = 0; i < cropperLineDomArray.length; i++) {
                const element = cropperLineDomArray[i]// className
                if (pIsAllow) {
                    element.className = element.className.replace(' cropper-hidden', '')
                } else {
                    element.className = element.className + ' cropper-hidden'
                }
            }
        },
        update() {
            this.allowResize(this.toolCrop.params.cropBoxAllowReSize)
            // 允许改变裁切框大小
            if (this.toolCrop.params.cropBoxAllowReSize) {
                // todo... 这里需要判断如果本来就是free模式，则应用参数，否则获取现在裁切框的大小
                if (this.toolCrop.params.cropBoxMode === 'free') {
                    // 自由模式不固定比例 获取裁切框当前的width height top left 以保持裁切框不改变
                    let cropBoxWidth, cropBoxHeight, cropBoxTop, cropBoxLeft
                    if (this.toolCrop.params.outerChange) {
                        cropBoxWidth = this.toolCrop.params.cropBoxWidth
                        cropBoxHeight = this.toolCrop.params.cropBoxHeight
                        cropBoxTop = this.toolCrop.params.cropBoxTop
                        cropBoxLeft = this.toolCrop.params.cropBoxLeft
                    } else {
                        cropBoxWidth = this.cropper.getCropBoxData().width
                        cropBoxHeight = this.cropper.getCropBoxData().height
                        cropBoxTop = this.cropper.getCropBoxData().top
                        cropBoxLeft = this.cropper.getCropBoxData().left
                    }
                    this.cropper.setAspectRatio(this.toolCrop.params.cropBoxWHRatio)
                    this.cropper.setCropBoxData({
                        width: cropBoxWidth,
                        height: cropBoxHeight,
                        top: cropBoxTop,
                        left: cropBoxLeft
                    })
                } else {
                    // 裁切框固定比例
                    this.cropper.setAspectRatio(this.toolCrop.params.cropBoxWHRatio)
                }
            } else {
                // 裁切框固定大小
                const cropBoxWidth = this.toolCrop.params.cropBoxWidth
                const cropBoxHeight = this.toolCrop.params.cropBoxHeight
                const cropBoxTop = this.toolCrop.params.cropBoxTop
                const cropBoxLeft = this.toolCrop.params.cropBoxLeft
                this.cropper.setAspectRatio(0)
                this.cropper.setCropBoxData({
                    width: cropBoxWidth,
                    height: cropBoxHeight,
                    top: cropBoxTop,
                    left: cropBoxLeft
                })
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-photo-crop {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 2;
    img {
        width: 100%;
        height: 100%;
    }
}
</style>
