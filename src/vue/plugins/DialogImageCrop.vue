<template>
    <div class="eqc-image-crop dialog">
        <div class="head">
            <span>图片裁切</span>
            <i
                class="close eqf-no"
                @click="cancel"
            />
        </div>
        <div class="content">
            <div class="preview">
                <div class="wrap">
                    <img
                        ref="image"
                        :src="host.file + src"
                        alt=""
                    >
                </div>
            </div>
        </div>
        <div
            v-if="!data.hideOptions"
            class="option"
        >
            <base-radio
                id="ratio_1"
                v-model="selectedRatio"
                value="fixed"
                name="selectedRatio"
            />
            <label for="ratio_1">固定比例</label>
            <base-radio
                id="ratio_2"
                v-model="selectedRatio"
                value="0"
                name="selectedRatio"
            />
            <label for="ratio_2">自由裁切</label>
            <base-radio
                id="ratio_3"
                v-model="selectedRatio"
                value="1"
                name="selectedRatio"
            />
            <label for="ratio_3">1:1</label>
        </div>
        <div class="foot">
            <base-button
                class="btn white h36"
                @click.native="cancel"
            >
                取消
            </base-button>
            <base-button
                :class="['btn','blue','h36','ok',buttonEnable?'':'disable']"
                @click.native="ok"
            >
                确定
            </base-button>
        </div>
    </div>
</template>

<script>
import utilDelayLoad from '../../utils/delayLoad'

export default {
    props: {
        data: {
            type: Object,
            default: null
        },
        close: {
            type: Function,
            default: null
        }
    },
    data() {
        return {
            cropper: null,
            selectedRatio: 'fixed',
            buttonEnable: false
        }
    },
    computed: {
        host() {
            return this.env.host
        },
        src() {
            return this.data.src.split('?')[0] // 拿原图进行裁切
        }
    },
    watch: {
        selectedRatio(newVal) {
            const radio = newVal === 'fixed' ? this.data.ratio : newVal
            this.cropper.setAspectRatio(radio)
        }
    },
    mounted() {
        const _self = this
        const image = this.$refs.image
        utilDelayLoad.delayLoadJS(Vue.env.plugin.cropper)
            .then(() => {
                const rotateX = this.data.rotateX ? -1 : 1
                const rotateY = this.data.rotateY ? -1 : 1
                const type = this.data.type
                const sceneWHRatio = this.data.ratio
                this.cropper = new Cropper(image, {
                    viewMode: 2,
                    dragMode: 'move',
                    aspectRatio: sceneWHRatio,
                    minContainerWidth: 1, // 设置成0会恢复成默认
                    minContainerHeight: 1, // 设置成0会恢复成默认
                    checkCrossOrigin: false,
                    guides: false,
                    center: false,
                    background: false,
                    movable: false,
                    zoomable: false,
                    toggleDragModeOnDblclick: false,
                    ready() {
                        // 设置旋转
                        this.cropper.scaleX(rotateY)
                        this.cropper.scaleY(rotateX)
                        // 如果是背景裁切把裁切框在保持比例不变的情况下放最大居中
                        if (type === 'background') {
                            // 设置裁切框最大
                            const setDataObj = {}
                            const imageData = this.cropper.imageData
                            const imageWHRatio = imageData.aspectRatio
                            if (sceneWHRatio === imageWHRatio) {
                                setDataObj.width = imageData.naturalWidth
                                setDataObj.height = imageData.naturalHeight
                            } else if (sceneWHRatio < imageWHRatio) {
                                setDataObj.height = imageData.naturalHeight
                            } else if (sceneWHRatio > imageWHRatio) {
                                setDataObj.width = imageData.naturalWidth
                            }
                            this.cropper.setData(setDataObj)
                            // 设置裁切框居中
                            const cropBoxData = this.cropper.cropBoxData
                            if (sceneWHRatio < imageWHRatio) {
                                this.cropper.setCropBoxData({
                                    left: (imageData.width - cropBoxData.width) / 2
                                })
                            } else if (sceneWHRatio > imageWHRatio) {
                                this.cropper.setCropBoxData({
                                    top: (imageData.height - cropBoxData.height) / 2
                                })
                            }
                        }
                        _self.buttonEnable = true
                    }
                })
            })
            .catch(err => err && this.logger.error(err))

        // 设置裁切位置
        const crop = this.data.crop
        if (crop) {
            image.addEventListener('ready', function () {
                this.cropper.setData({
                    x: crop.left,
                    y: crop.top,
                    width: crop.width,
                    height: crop.height
                })
            })
        }
    },
    methods: {
        cancel() {
            this.close()
            this.cropper && this.cropper.destroy()
        },
        ok() {
            if (!this.buttonEnable) {
                return
            }
            if (!this.cropper) {
                return
            }
            let { x: left, y: top, width, height, scaleX, scaleY } = this.cropper.getData(true)
            // 对于旋转后需要裁切的图片保存时需要重新计算top和left
            const imageData = this.cropper.getImageData()
            left = scaleX === -1 ? (imageData.naturalWidth - left - width) : left
            top = scaleY === -1 ? (imageData.naturalHeight - top - height) : top
            this.close({
                selectedRatio: this.selectedRatio,
                crop: { left, top, width, height, scaleX: scaleX === -1, scaleY: scaleY === -1 }
            })
        }
    }
}
</script>

<style lang="scss">
.eqc-image-crop {
    .content {
        padding: 0 20px;
        .preview {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 740px;
            height: 380px;
            background: url("../../img/opacity.png") center;
            .wrap {
                display: inline-block;
                img {
                    max-width: 740px;
                    max-height: 380px;
                }
            }
        }
    }
    .option {
        display: flex;
        align-items: center;
        padding: 20px 20px 0;
        div:not(:first-of-type) {
            margin-left: 20px;
        }
        label {
            cursor: pointer;
            padding-left: 6px;
        }
    }
    .foot {
        display: flex;
        justify-content: flex-end;
        padding: 20px;
        .btn {
            width: 90px;
        }
        .ok {
            margin-left: 7px;
        }
    }
}
</style>
