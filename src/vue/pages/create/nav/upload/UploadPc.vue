<template>
    <div
        v-upload="uploadOptions"
        :style="isBtnHover ? (hoverCss ? hoverCss : css) : css"
        class="eqc-image-upload"
        @mouseover="isBtnHover = true"
        @mouseleave="isBtnHover = false"
    >
        <div
            ref="progress"
            class="progress"
        />
        <i
            v-if="showIcon"
            class="icon eqf-pc-l"
        />
        <span class="text">{{ isUploading ? '上传中…' : name }}</span>
    </div>
</template>

<script>
export default {
    props: {
        onComplete: {
            type: Function,
            default: null
        },
        onCheckStart: {
            type: Function,
            default: null
        },
        uploadProgressEach: {
            type: Function,
            default: null
        },
        tagIdAll: {
            type: Number,
            default: -1
        },
        css: {
            type: Object,
            default: null
        },
        name: {
            type: String,
            default: '电脑上传'
        },
        hoverCss: {
            type: Object,
            default: null
        },
        type: {
            type: String,
            default: ''
        },
        showIcon: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isBtnHover: false,
            isUploading: false,
            uploadOptions: {
                onFilesAdded: this.onFilesAdded,
                onUploadProgress: this.onUploadProgress,
                onUploadComplete: this.onUploadComplete,
                uploadProgressEach: this.uploadProgressEach,
                onCheckStart: this.onCheckStart,
                onError: this.onError,
                type: this.type

            }
        }
    },
    methods: {
        onFilesAdded(up, files) {
            this.isUploading = true
        },
        onUploadProgress(percent, options) {
            if (this.$refs.progress) {
                const style = this.$refs.progress.style
                style.opacity = 1
                style.width = percent + '%'
            }
        },
        onUploadComplete(res) {
            this.resetBtn()
            this.onComplete(this.tagIdAll, res)
        },
        onError(up, err, errTip) {
            this.resetBtn()
        },
        resetBtn() {
            this.isUploading = false
            if (this.$refs.progress) {
                const style = this.$refs.progress.style
                style.opacity = 0
                setTimeout(() => {
                    style.width = 0
                }, 100)
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-image-upload {
    position: relative;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 88px;
    height: 36px;
    border-radius: 3px;
    font-size: 12px;
    color: #fff;
    background: #1593ff;
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
        background: #198ae7;
    }
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
    .text {
        position: relative;
    }
    .icon {
        margin: 2px 4px 0 0;
    }
}
</style>
