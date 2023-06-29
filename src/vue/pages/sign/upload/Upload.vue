<template>
    <div class="eqc-sign-image-upload">
        <div
            v-upload="uploadOptions"
            class="upload-box"
        >
            <div
                :style="{background: `${getBackgroundImage(getQiniuImage(previewImage))} no-repeat center/contain`}"
                class="preview"
            />
            <div
                v-show="previewImage === ''"
                class="add"
            >
                <i class="icon eqf-plus" />
            </div>
            <div class="progress-box">
                <div
                    ref="progress"
                    class="progress"
                />
            </div>
            <div
                v-show="previewImage !== ''"
                class="upload"
            >
                重新上传
            </div>
        </div>
        <div
            v-show="previewImage !== ''"
            class="delete"
            @click="deleteImage()"
        >
            删除
        </div>
    </div>
</template>

<script>
export default {
    props: {
        onDelete: {
            type: Function,
            default: null
        },
        onComplete: {
            type: Function,
            default: null
        },
        previewImage: {
            type: String,
            default: ''
        },
        type: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            isUploading: false,
            uploadOptions: {
                onFilesAdded: this.onFilesAdded,
                onUploadProgress: this.onUploadProgress,
                onUploadComplete: this.onUploadComplete,
                onError: this.onError,
                type: this.type
            }
        }
    },
    computed: {
        thumbSize() {
            return 80
        }
    },
    methods: {
        getQiniuImage(src) {
            return Vue.filter('qiniuZoom')(src, this.thumbSize)
        },
        getBackgroundImage(src) {
            return Vue.filter('backgroundImage')(src)
        },
        onFilesAdded(up, files) {
            this.isUploading = true
        },
        onUploadProgress(percent) {
            const style = this.$refs.progress.style
            style.opacity = 1
            style.width = percent + '%'
        },
        onUploadComplete(res) {
            this.resetBtn()
            this.onComplete(res)
        },
        onError(up, err, errTip) {
            this.resetBtn()
        },
        resetBtn() {
            this.isUploading = false
            const style = this.$refs.progress.style
            style.opacity = 0
            setTimeout(() => {
                style.width = 0
            }, 100)
        },
        deleteImage() {
            this.onDelete()
        }
    }
}
</script>

<style lang="scss">
.eqc-sign-image-upload {
    position: relative;
    .upload-box {
        height: 80px;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: flex-start;
        position: relative;
        .preview {
            width: 80px;
            height: 80px;
            background: #ffffff;
            border-radius: 4px;
            border: 1px solid rgba(204, 204, 204, 1);
        }
        .add {
            width: 80px;
            height: 80px;
            border-radius: 4px;
            border: 1px solid rgba(204, 204, 204, 1);
            display: flex;
            justify-content: center;
            align-items: center;
            position: absolute;
            top: 0;
            left: 0;
            .add-icon {
                font-size: 24px;
                color: #ccc;
            }
        }
        .progress-box {
            position: absolute;
            width: 70px;
            height: 10px;
            left: 5px;
            top: 45%;
            .progress {
                position: absolute;
                left: 0;
                bottom: 0;
                width: 0;
                height: 100%;
                border-radius: 3px;
                background: #5c61ff;
                transition: all 0.3s;
            }
        }

        .upload {
            font-size: 14px;
            color: rgba(21, 147, 255, 1);
            line-height: 20px;
            border-radius: 15px;
            border: 1px solid rgba(21, 147, 255, 1);
            padding: 3px 15px;
            margin: 10px 0 0 10px;
        }
    }
    .delete {
        font-size: 14px;
        color: #1593ff;
        line-height: 20px;
        border-radius: 15px;
        border: 1px solid #1593ff;
        padding: 3px 15px;
        width: 88px;
        text-align: center;
        position: absolute;
        top: 55%;
        left: 90px;
    }
}
</style>
