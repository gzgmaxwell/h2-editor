<template>
    <div
        :style="{height:screenHeight}"
        class="eqc-sign-image-crop"
    >
        <div class="content">
            <div
                :style="{width:screenWidth, height:croperHeight}"
                class="preview"
            >
                <div class="wrap">
                    <img
                        ref="image"
                        :style="{width:screenWidth, height:croperHeight}"
                        :src="host.file + src"
                        alt=""
                    >
                </div>
            </div>
        </div>
        <div
            class="foot"
        >
            <base-button
                class="btn h36"
                @click.native="cancel"
            >
                取消
            </base-button>
            <base-button
                v-if="isReady"
                class="btn h36"
                @click.native="ok"
            >
                确定
            </base-button>
        </div>
    </div>
</template>

<script>
import utilDelayLoad from '../../../../utils/delayLoad'

export default {
    props: {
        data: {
            type: Object,
            default: null
        },
        onComplete: {
            type: Function,
            default: null
        }
    },
    data() {
        return {
            cropper: null,
            isReady: false
        }
    },
    computed: {
        host() {
            return this.env.host
        },
        src() {
            return this.data.src.split('?')[0] // 拿原图进行裁切
        },
        screenWidth() {
            return document.body.clientWidth + 'px'
        },
        screenHeight() {
            return document.body.clientHeight + 'px'
        },
        croperHeight() {
            return (document.body.clientHeight - 48) + 'px'
        }
    },
    watch: {

    },
    mounted() {
        const image = this.$refs.image
        utilDelayLoad.delayLoadJS(Vue.env.plugin.cropper)
            .then(() => {
                this.cropper = new Cropper(image, {
                    // dragMode: 'move',
                    // aspectRatio: 1,
                    // autoCropArea: 0.95,
                    // restore: false,
                    // guides: false,
                    // center: false,
                    // highlight: false,
                    // cropBoxMovable: false,
                    // cropBoxResizable: false,
                    // toggleDragModeOnDblclick: false,
                    // ready() {

                    // }
                    aspectRatio: 1,
                    viewMode: 1,
                    background: false,
                    zoomable: false,
                    ready: () => {
                        this.isReady = true
                    }
                })
            })
            .catch(err => err && this.logger.error(err))
    },
    methods: {
        cancel() {
            this.cropper && this.cropper.destroy()
            Vue.store.commit('SIGN_SHOW_CROP', false)
        },
        ok() {
            if (!this.cropper) {
                return
            }
            this.crop()
        },
        crop() {
            const cropperCanvas = this.cropper.getCroppedCanvas()
            const tokenPromise = Vue.api.file.getUploadToken()
            Promise.all([tokenPromise, cropperCanvas])
                .then(([token, canvas]) => {
                    Vue.api.file.uploadBase64(canvas.toDataURL().split(',')[1], token)
                        .then(res => {
                            this.onComplete(res)
                        })
                        .catch(err => {
                            console.log(err)
                            this.onComplete(err)
                        })
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }
}
</script>

<style lang="scss">
.eqc-sign-image-crop {
    position: fixed;
    top: 0;
    left: 0;
    background: #000;
    width: 100%;
    // z-index: 999;
    > .content {
        .preview {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: calc(100% - 48px);
            .wrap {
                display: inline-block;
                img {
                    width: 100%;
                    height: calc(100% - 48px);
                }
            }
        }
    }
    .foot {
        color: #fff;
        display: flex;
        justify-content: space-between;
        height: 47px;
        border-top: 1px solid #aaa;
        align-items: center;
        .btn {
            width: 90px;
        }
        .ok {
            margin-left: 7px;
        }
    }
}
</style>
