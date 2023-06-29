<template>
    <div class="eqc-upload-pdf dialog">
        <i class="pdf" />
        <i
            class="close eqf-no"
            @click="cancel"
        />
        <div class="desc">
            <p>1、建议上传单页PDF尺寸符合当前作品分类尺寸(<span>{{ data.width }}px * {{ data.height }}px</span>)。</p>
            <p>2、为保证上传速度，PDF文件大小不超过20M。</p>
            <p>3、部分嵌入、剪切等特效将无法完全呈现。</p>
            <p>4、暂解析第一页PDF。</p>
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
                accept=".pdf"
            >
        </div>
    </div>
</template>

<script>
import delayLoad from '../../../../utils/delayLoad'
import elementType from '../../../../config/enum.element.type'
import { uploadQiniu } from '../../../../utils/qiniuUpload'
import { host } from '../../../../config/env'
import textType from '../../../../config/enum.text.type'
import EqxPage from '../../../../core/html/page'
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
    computed: {
        eqxPage() {
            return Vue.store.state.scene.eqxPage
        },
        scene() {
            return Vue.store.state.scene
        },
        eqxScene() {
            return this.scene.eqxScene
        }
    },
    mounted() {
        const self = this
        // const eqxPage = Vue.store.state.scene.eqxPage
        // const { psd } = Vue.env.plugin
        this.$refs.file.onchange = function () {
            const options = {
                mimeType: ['application/pdf'],
                files: Array.from(this.files),
                onFileUploaded: res => {
                    self.isUploading = false
                    self.getAnalyseDataFromPdf(res.key)
                }
            }
            const file = this.files[0]
            if (!file) {
                return
            }
            if (file.size > 20 * 1024 * 1024) {
                self.notifier.warn('PDF文件大小不能超过20M')
                return
            }
            // const token = ''
            self.isUploading = true

            const promise1 = Vue.api.file.getUploadToken('attach')
            const promise2 = delayLoad.delayLoadJS(Vue.env.plugin.qiniu2)
            Promise.all([promise1, promise2])
                .then(([token]) => {
                    options.token = token
                    uploadQiniu(options)
                })
                .catch(err => {
                    err && Vue.logger.error(err)
                    // resetInput(options)
                })
        }
    },
    methods: {
        getAnalyseDataFromPdf(key) {
            const self = this
            const url = host.file + key
            Vue.api.scene.getAnalyseDataFromPdf(url).then(data => {
                const eqxElements = []
                self.totalCount = data.data.obj.pageList.length
                data.data.obj.pageList.map((pageData, i) => {
                    self.uploadedCount++
                    if (i === 0) {
                        pageData.textList.map(textData => {
                            eqxElements.push(this.addText(textData, pageData.width, pageData.height))
                        })
                        pageData.imageList.map(imageData => {
                            eqxElements.push(this.addImage(imageData, pageData.width, pageData.height))
                        })
                        Vue.store.commit('ELEMENT_SELECT', { eqxElements })
                    }
                })

                this.cancel()
            }).catch(err => {
                console.error(err)
            })
        },
        addPage() {
            // 如果当前页有修改，则先保存再新增
            // 新增页的方式是前端新建空白页，再将新页保存
            return new Promise((resolve, reject) => {
                this.currentPage = Vue.store.state.scene.eqxPage
                const eqxPage = new EqxPage(null, this.eqxScene)
                const promise = this.eqxPage.isModified
                    ? Vue.store.dispatch('PAGE_SAVE', { eqxPage: this.eqxPage, needCover: true })
                    : Promise.resolve()

                promise
                    .then(() => Vue.store.dispatch('PAGE_SAVE', { eqxPage, needCover: true }))
                    .then(() => {
                        resolve()
                    })
                    .catch(err => err && this.logger.error(err))

                // 处理数据需放在api的后面
                // 添加和保存同步进行，虽然保存失败的话会有风险，但体验会好一些  新增的页面插到当前页面之后
                Vue.store.commit('PAGE_ADD', { eqxPage })
            })
        },
        addText(config, pageWidth, pageHeight) {
            // 解析出来的定位是相对于左下角的 现在要改为左上角
            const width = (config.baseLine.x2 - config.baseLine.x1 + 20)
            const lineHeigt = 1.2
            const padding = 4 / this.eqxPage.scale
            const height = config.fontSize * lineHeigt
            const elementJson = {
                type: elementType.text,
                property: {
                    type: textType.text,
                    content: config.text,
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
                    wordSpacing: config.wordSpacing + 'px',
                    left: Math.round(config.baseLine.x1) + 'px',
                    top: Math.round(pageHeight - config.baseLine.y1) + 'px',
                    width: Math.round(width) + 'px',
                    height: Math.round(height) + 'px',
                    padding: Math.round(padding) + 'px',
                    border: '1px solid transparent',
                    color: config.fillColor,
                    transform: 'rotateZ(0deg)',
                    opacity: 1
                }
            }
            const eqxElement = this.eqxPage.addElement(elementJson)
            return eqxElement
        },
        addImage(config, pageWidth, pageHeight) {
            const eqxPage = Vue.store.state.scene.eqxPage
            let rotateAngle = 0
            if (config.matrix[1] !== 0 && config.matrix[3] !== 0) {
                rotateAngle = Math.asin(-config.matrix[1] / config.matrix[0]) * 180 / Math.PI
            }
            const elementJson = {
                type: elementType.image,
                property: {
                    src: config.qiniuCode,
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
                    transform: `rotateZ(${rotateAngle}deg)`,
                    left: config.matrix[6] + 'px',
                    top: (pageHeight - config.matrix[7]) + 'px',
                    width: Math.abs(config.matrix[0]) + 'px',
                    height: Math.abs(config.matrix[4]) + 'px'
                }
            }
            const eqxElement = eqxPage.addElement(elementJson)
            return eqxElement
        },
        cancel() {
            this.close()
        }
    }
}
</script>

<style lang="scss">
.eqc-upload-pdf {
    position: relative;
    padding: 28px;
    cursor: default;
    .pdf {
        // background: #001d26;
        width: 60px;
        height: 72px;
        display: block;
        font-size: 56px;
        color: #00dbfe;
        text-align: center;
        line-height: 60px;
        background: url("../../../../img/pdf.svg") center center/cover;
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
