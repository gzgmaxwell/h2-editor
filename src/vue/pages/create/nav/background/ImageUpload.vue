<template>
    <div class="eqc-background-upload">
        <div
            v-upload="uploadOptions"
            class="custom"
        >
            <div
                ref="progress"
                class="progress"
            />
            <span class="text">{{ isUploading ? '上传中…' : '电脑上传' }}</span>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            isUploading: false,
            uploadOptions: {
                type: 'background',
                maxCount: 1,
                onFilesAdded: this.onFilesAdded,
                onUploadProgress: this.onUploadProgress,
                onUploadComplete: this.onUploadComplete,
                onError: this.onError
            }
        }
    },
    computed: {
        eqxPage() {
            return this.$store.state.scene.eqxPage
        },
        background() {
            return this.eqxPage.pageJson.properties.background.middle
        }
    },
    methods: {
        onFilesAdded() {
            this.isUploading = true
        },
        onUploadProgress(percent) {
            const style = this.$refs.progress.style
            style.opacity = 1
            style.width = percent + '%'
        },
        onUploadComplete(result) {
            this.infiniteScroll.clearKey({ tab: 'upload' })
            this.resetBtn()
            this.crop(result.key)
        },
        onError() {
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
        crop(src) {
            const { width, height } = this.eqxPage.eqxScene.sceneJson
            const options = {
                ratio: width / height,
                src,
                crop: this.background.crop,
                hideOptions: true,
                type: 'background'
            }
            return this.dialog.openImageCrop(options)
                .then(result => {
                    const crop = result.crop
                    const background = {
                        type: 1,
                        src,
                        crop,
                        size: 1,
                        opacity: 1
                    }
                    this.eqxPage.eqxBackground.setBackgroundMiddle(background)
                    this.eqxPage.eqxHistory.add(this.eqxPage)
                })
                .catch(err => err && this.logger.error(err))
        },
        recrop() {
            this.crop(this.background.src.split('?')[0])
        }
    }
}
</script>

<style lang="scss">
.eqc-background-upload {
    display: flex;
    justify-content: space-between;
    .custom {
        position: relative;
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 48px;
        width: 96px;
        // border-radius: 3px;
        font-size: 13px;
        color: #252b3f;
        // background: #1593ff;
        cursor: pointer;
        transition: all 0.3s;
        &:hover {
            color: #1593ff;
        }
        .progress {
            position: absolute;
            left: 0;
            bottom: 0;
            width: 0;
            height: 100%;
            border-radius: 3px;
            background: #eceef0;
            transition: all 0.3s;
        }
        .text {
            position: relative;
        }
    }
    // .crop {
    //     width: 120px;
    //     margin-left: 16px;
    //     font-size: 12px;
    // }
}
</style>
