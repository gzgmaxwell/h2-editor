<template>
    <div
        class="eqc-photo-upload-panel"
        @click="selectImage"
    >
        <input
            id="importFile"
            type="file"
            style="display: none"
            accept="image/jpeg,image/png"
            @change="importFileClick(this)"
        >
        <label class="main-title">
            <i class="eqf-plus-l" />
            上传图片
        </label>
        <label class="sub-title">
            jpg、png格式，小于10M
        </label>
    </div>
</template>

<script>
import Compressor from '../../../../utils/compressor.min'

export default {
    props: {
        complete: {
            type: Function,
            default: () => {}
        }
    },
    data() {
        return {
            FILE_MAX_SIZE: 10240, // 字节
            importFile: null
        }
    },
    computed: {
        photoScene() {
            return Vue.store.state.photoScene
        },
        reUploadImage() {
            return this.photoScene.reUploadImage
        }
    },
    watch: {
        reUploadImage(newVal, oldVal) {
            this.selectImage()
        }
    },
    mounted() {
        this.importFile = document.getElementById('importFile')
    },
    methods: {
        // 选择图片
        selectImage() {
            this.importFile.click()
        },
        // 导出图片
        importFileClick() {
            if (!this.importFile) {
                return
            }
            const file = this.importFile.files[0]
            if (!file) {
                return
            }
            // 判断是图片类型
            if (!['image/png', 'image/jpeg'].includes(file.type)) {
                this.notifier.fail('请选择正确图片格式！')
                return
            }
            // 判断图片大小
            if (file.size / 1024 > this.FILE_MAX_SIZE) {
                this.notifier.fail('请选择小于10M的图片')
                return
            }
            // 判断系统是否支持filderReader
            let reader
            if (window.FileReader) {
                reader = new FileReader()
            } else {
                this.notifier.fail('系统不支持')
                return
            }
            const _self = this
            // 加载图片
            reader.onload = function (event) {
                const image = new Image()
                image.onload = function (res) {
                    const imgWidth = this.width
                    const imgHeight = this.height
                    _self.importFile.value = null
                    _self.complete({ imageBase64: event.target.result, imgWidth, imgHeight })
                }
                image.src = event.target.result
            }
            this.compressFile(file).then(res => {
                reader.readAsDataURL(res)
            })
        },
        // 压缩图片
        compressFile(file) {
            return new Promise((resolve, reject) => {
                /* eslint-disable no-new */
                new Compressor(file, {
                    success(result) {
                        resolve(result)
                    },
                    error(err) {
                        console.log(err.message)
                        reject(err)
                    }
                })
            })
        }
    }
}
</script>

<style lang="scss">
.eqc-photo-upload-panel {
    width: 388px;
    height: 174px;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.06);
    border-radius: 3px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    label.main-title {
        font-size: 20px;
        font-weight: 400;
        color: rgba(47, 60, 77, 1);
        display: block;
        margin-top: 57px;
        cursor: pointer;
        i {
            font-size: 24px;
            vertical-align: text-bottom;
        }
    }
    label.sub-title {
        font-size: 14px;
        font-weight: 400;
        color: rgba(118, 131, 143, 1);
        display: block;
        margin-top: 16px;
        cursor: pointer;
    }
    &:hover {
        box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.2);
    }
}
</style>
