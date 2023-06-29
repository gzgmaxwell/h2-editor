<template>
    <div
        v-upload="uploadOptions"
        :style="css"
        class="eqc-image-upload"
    >
        <div
            ref="progress"
            class="progress"
        />
        <!-- <i class="icon eqf-cloudupload-l"></i> -->
        <span class="text">{{ isUploading ? '上传中…' : '上传封面' }}</span>
    </div>
</template>

<script>
export default {
    props: {
        onComplete: {
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
        }
    },
    data() {
        return {
            isUploading: false,
            uploadOptions: {
                onFilesAdded: this.onFilesAdded,
                onUploadProgress: this.onUploadProgress,
                onUploadComplete: this.onUploadComplete,
                onError: this.onError
            }
        }
    },
    methods: {
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
    width: 68px;
    height: 28px;
    border-radius: 3px;
    font-size: 12px;
    color: #fff;
    background: #575758;
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
        background: #292929;
    }
    .progress {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 0;
        height: 100%;
        border-radius: 3px;
        background: #292929;
        transition: all 0.3s;
    }
    .text {
        position: relative;
    }
}
</style>
