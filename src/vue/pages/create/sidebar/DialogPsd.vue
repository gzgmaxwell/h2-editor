<template>
    <div class="eqc-upload-ps dialog">
        <i class="ps eqf-ps" />
        <i
            class="close eqf-no"
            @click="cancel"
        />
        <div class="desc">
            <p>1、建议上传单页PSD尺寸符合当前作品分类尺寸(<span>{{ data.width }}px * {{ data.height }}px</span>)。</p>
            <p>2、为保证上传速度，PSD文件大小不超过30M，图层不超过30个。</p>
            <p>3、为保证图片质量，建议上传前将效果尽量合并至图层中。</p>
        </div>
        <div
            class="btn"
            @click="$refs.file.click()"
        >
            <div
                :style="{width: uploadedCount / totalCount * 100 + '%'}"
                class="progress"
            />
            <span class="tip">{{ isUploading ? '上传中…' : '开始上传' }}</span>
            <input
                ref="file"
                class="file"
                type="file"
                accept=".psd"
            >
        </div>
    </div>
</template>

<script>
import delayLoad from '../../../../utils/delayLoad'
import elementType from '../../../../config/enum.element.type'
import textType from '../../../../config/enum.text.type'

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
            isUploading: false,
            totalCount: 0,
            uploadedCount: 0
        }
    },
    mounted() {
        const self = this
        const eqxPage = Vue.store.state.scene.eqxPage
        const { psd } = Vue.env.plugin
        this.$refs.file.onchange = function () {
            const file = this.files[0]
            if (!file) {
                return
            }
            if (file.size > 30 * 1024 * 1024) {
                self.notifier.warn('PSD文件大小不能超过30M')
                return
            }
            let token = ''
            self.isUploading = true
            Promise.all([
                self.api.file.getUploadToken(),
                delayLoad.delayLoadJS(psd)
            ])
                .then(([t]) => {
                    token = t
                    return window.require('psd').fromDroppedFile(file) // 这里没有window会报错
                })
                .then(psd => {
                    const res = getImagesAndText(psd.tree())

                    if (res.images.length + res.texts.length > 30) {
                        self.notifier.warn('图层不能超过30个')
                        return Promise.reject()
                    }
                    return res
                })
                .then(res => {
                    const { images, texts } = res
                    self.totalCount = images.length
                    self.uploadedCount = 0
                    const textJsons = texts.map(text => {
                        const { top, left, width, height } = text.layer
                        const { text: info } = text.export()
                        const color = info.font && info.font.colors ? info.font.colors[0] : [0, 0, 0, 255]
                        const textColor = `rgba(${color[0]},${color[1]},${color[2]},${color[3]})`
                        const textAlign = info.font && info.font.alignment ? info.font.alignment[0] : 'center'
                        const fontSize = info.font && info.font.sizes ? info.font.sizes[0] : 16
                        const elementJson = {
                            type: elementType.text,
                            property: {
                                type: textType.text,
                                content: info.value,
                                dropShadow: {
                                    color: 'rgba(0,0,0,0)',
                                    x: 0,
                                    y: 0,
                                    blur: 0,
                                    transparency: 100
                                },
                                angle: 45,
                                cube: [{ size: 0, color: '#FF2A6A' }],
                                stroke: {
                                    size: 0,
                                    color: '#5D61FF',
                                    distance: 0
                                },
                                borderRadius: {
                                    lt: true,
                                    rt: true,
                                    lb: true,
                                    rb: true,
                                    val: 0
                                }
                            },
                            css: {
                                left: left + 'px',
                                top: top + 'px',
                                width: (width + 10) + 'px',
                                height: height + 'px',
                                border: '1px solid transparent',
                                fontSize: fontSize + 'px',
                                textAlign,
                                color: textColor,
                                transform: 'rotateZ(0deg)',
                                opacity: 1,
                                lineHeight: 1.2,
                                padding: '10px',
                                backgroundColor: '#ffffff'

                            }
                        }
                        return elementJson
                    })
                    const imageJsons = images.map(image => {
                        const currentImageBase64 = image.layer.image.toBase64().split(',')[1]
                        return self.api.file.uploadBase64(currentImageBase64, token)
                            .then(res => {
                                const { top, left, width, height } = image.layer
                                const elementJson = {
                                    type: elementType.image,
                                    property: {
                                        src: res.data.key,
                                        dropShadow: {
                                            color: 'rgba(0,0,0,0)',
                                            x: 0,
                                            y: 0,
                                            blur: 0,
                                            transparency: 100
                                        },
                                        borderRadius: {
                                            lt: true,
                                            rt: true,
                                            lb: true,
                                            rb: true,
                                            val: 0
                                        }
                                    },
                                    css: {
                                        left: left + 'px',
                                        top: top + 'px',
                                        width: width + 'px',
                                        height: height + 'px'
                                    }
                                }
                                self.uploadedCount++
                                return elementJson
                            })
                    })

                    return Promise.all([].concat(imageJsons, textJsons))
                })
                .then(res => {
                    if (res) {
                        const eqxElements = eqxPage.addElements(res)
                        Vue.store.commit('ELEMENT_SELECT', { eqxElements })
                        eqxPage.eqxHistory.add(eqxPage)
                    }

                    setTimeout(() => self.cancel(), 1000)
                })
                .catch(err => {
                    err && self.logger.error(err)
                    err && self.notifier.fail('上传异常，请稍后重试')
                    self.isUploading = false
                    // 将file清空，避免再次选择同一个文件时不生效的问题
                    this.value = ''
                })
        }

        function getImagesAndText(tree) {
            const images = []
            const texts = []
            function loopTree(tree) {
                if (tree.hasChildren()) {
                    const children = tree.children()
                    for (let i = children.length - 1; i >= 0; i--) {
                        if (children[i].visible()) {
                            loopTree(children[i])
                        }
                    }
                } else {
                    if (tree.type === 'layer' && tree.width !== 0 && tree.height !== 0) {
                        const exp = tree.export()
                        if (exp.text) { // 图层（含文本，处理成文字组件）
                            texts.push(tree)
                        } else { // 图层（不含文本，处理成图片）
                            images.push(tree)
                        }
                    }
                }
            }
            loopTree(tree)
            return { images, texts }
        }
    },
    methods: {
        cancel() {
            this.close()
        }
    }
}
</script>

<style lang="scss">
.eqc-upload-ps {
    position: relative;
    padding: 28px;
    cursor: default;
    .ps {
        background: #001d26;
        width: 72px;
        height: 72px;
        display: block;
        font-size: 56px;
        color: #00dbfe;
        border: 6px solid #00dbfe;
        text-align: center;
        line-height: 60px;
    }
    .close {
        position: absolute;
        right: 28px;
        top: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        font-size: 22px;
        cursor: pointer;
        transition: all 0.3s;
        &:hover {
            color: #ff2a6a;
        }
    }
    .desc {
        width: 200px;
        margin: 20px 0;
        font-size: 12px;
        line-height: 18px;
        color: #999;
        span {
            color: #1593ff;
        }
    }
    .btn {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 36px;
        border-radius: 3px;
        font-size: 14px;
        color: #fff;
        background: #1593ff;
        overflow: hidden;
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
            background: #5c61ff;
            transition: all 0.3s;
        }
        .tip {
            position: relative;
        }
        .file {
            width: 100%;
            height: 100%;
            position: absolute;
            left: 0;
            top: 0;
            z-index: -1;
            cursor: pointer;
        }
    }
}
</style>
