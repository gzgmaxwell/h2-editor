
export default function () {
    const $el = this.$el

    $el.addEventListener('dblclick', (e) => {
        e.stopPropagation()

        const { property } = this.elementJson
        const $clips = $el.querySelectorAll('.insideG')

        const updateElement = (path, crop) => {
            const item = {
                imgId: `#${currentClipId}_img`,
                src: path,
                crop: crop,
                img: {
                    width: crop.width,
                    height: crop.height
                }
            }
            if (property.frames) {
                let index = -1
                property.frames.map((v, i) => {
                    if (v.imgId === `#${currentClipId}_img`) {
                        index = i
                    }
                })
                if (index > -1) {
                    property.frames.splice(index, 1, item)
                } else {
                    property.frames.push(item)
                }
            }
            this.updateProperty(property)
        }
        const cropImage = (src) => {
            return new Promise((resolve, reject) => {
                const options = {
                    ratio: 1,
                    src,
                    hideOptions: true
                }
                Vue.dialog.openImageCrop(options)
                    .then(result => {
                        const { crop } = result
                        resolve(crop)
                    })
                    .catch(err => {
                        err && this.logger.error(err)
                        reject(err)
                    })
            })
        }

        let currentClipId = null
        for (let i = 0; i < $clips.length; i++) {
            const { top, left, bottom, right } = $clips[i].getBoundingClientRect()
            const clipId = $clips[i].attr('data')

            if (e.pageX > left &&
                e.pageX < right &&
                e.pageY > top &&
                e.pageY < bottom) {
                currentClipId = clipId
                break
            }
        }
        if (currentClipId) {
            Vue.dialog.openMaterialLib()
                .then(res => {
                    if (res && res.success) {
                        Vue.api.file.getImageInfo(res.path).then(data => {
                            if (data.data.format === 'gif') {
                                Vue.notifier.fail('gif文件不能被替换')
                            } else {
                                cropImage(res.path).then(crop => {
                                    updateElement(res.path, crop)
                                })
                            }
                        })
                    }
                })
                .catch(err => {
                    err && this.logger.error(err)
                })
        }
    })
}
