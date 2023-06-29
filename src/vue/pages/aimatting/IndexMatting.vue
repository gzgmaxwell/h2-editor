<template>
    <div class="eqc-aimatting">
        <the-matting-head
            :mode="mode"
            :close="closeMatting"
            :download="download"
            :export-to-h5="exportToH5"
            :finish="finish"
            :change-image="changeImage"
            :insert-to-page="insert"
        />
        <the-matting-editor ref="mattingEditor" />
        <the-matting-tool
            v-if="src !== ''"
            ref="mattingTool"
        />
        <the-editor-upload
            v-if="isShowEditorUpload && mode !== aiMattingMode.setting"
            ref="editorUpload"
            :close-btn="needCloseBtn"
            :paste-upload-completed="uploadCompleted"
            :pc-upload-completed="uploadCompleted"
            :mobile-upload-completed="uploadCompleted"
            :close-editor-upload="closeEditorUpload"
        />
        <div
            class="help-btn"
            @click="openHelper"
        >
            <i class="eqf-why-l" />
        </div>
    </div>
</template>

<script>
import aiMattingMode from '../../../config/enum.aiMattingMode.type'
import TheMattingHead from './TheMattingHead.vue'
import TheMattingEditor from './TheMattingEditor.vue'
import TheMattingTool from './TheMattingTool.vue'
import TheEditorUpload from './TheEditorUpload.vue'
import statistic from '../../../config/statistic'
import { dataURL2Blob } from '../../../utils/blob'
import storageLocal from '../../../utils/storageLocal'
import elementType from '../../../config/enum.element.type'

export default {
    components: {
        TheMattingHead,
        TheMattingEditor,
        TheMattingTool,
        TheEditorUpload
    },
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
            aiMattingMode,
            mode: this.data ? this.data.mode : aiMattingMode.independent,
            isShowEditorUpload: true,
            needCloseBtn: false
        }
    },
    computed: {
        matting() {
            return Vue.store.state.aiMatting
        },
        src() {
            return this.matting.src
        },
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        eqxPage() {
            return Vue.store.state.scene.eqxPage
        },
        scale() {
            return this.eqxPage.scale
        }
    },
    watch: {

    },
    created() {

    },
    mounted() {
        const key = storageLocal.key.aiMattingHelperShow
        const res = storageLocal.getItem(key)
        if (!res) {
            this.openHelper()
            storageLocal.setItem(key, true)
        }
        if (!this.userInfo.id) {
            this.openLogin()
        }
    },
    methods: {
        openLogin() {
            Vue.dialog.openLogin()
                .then(() => this.user.auth())
                .then(() => {})
                .catch(err => err && this.logger.error(err))
        },
        openHelper() {
            const url = '//video-1251586368.file.myqcloud.com/tencent/915dd4d5f72f4b3685422b97aa05f6b0/1576576807323-rt202rm6gr9.mp4'
            const poster = '//res1.eqh5.com/df27516c5f30c9625c44098209d3210d'
            Vue.dialog.openVideoPlayer({ url, poster })
                .then((res) => { })
                .catch(err => err && this.logger.error(err))
        },
        changeImage() {
            this.isShowEditorUpload = true
            this.needCloseBtn = true
        },
        closeEditorUpload() {
            this.isShowEditorUpload = false
        },
        closeMatting() {
            // reset matting tool
            this.$refs.mattingTool && this.$refs.mattingTool.resetTool()
            this.$refs.editorUpload && this.$refs.editorUpload.unbindWebsoket()
            this.close()
        },
        uploadCompleted(res) {
            // reset matting tool
            this.$refs.mattingTool && this.$refs.mattingTool.resetTool()
            this.isShowEditorUpload = false
            Vue.store.commit('AIMATTING_MATTING_IMAGE', res.key)
        },
        finish() {
            Vue.loading.open('生成中')
            this.$refs.mattingEditor.getMattingResult().then(res => {
                Vue.loading.close()
                if (res && res.data) {
                    this.close({ key: res.data.key })
                } else {
                    Vue.notifier.fail('下载失败请稍后重试')
                }
            })
            // reset matting tool
            this.$refs.mattingTool && this.$refs.mattingTool.resetTool()
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.AIMATTING,
                statistic.opt_label.AIMATTING.finish])
        },
        downloadFile(fileName, url) {
        // 判断浏览器
            const a = document.createElement('a')
            a.download = fileName
            a.href = url
            a.trigger('click')
        },
        download() {
            Vue.loading.open('生成中')
            this.$refs.mattingEditor.getMattingResult(false).then(res => {
                Vue.loading.close()
                if (res && res.canvas) {
                    const dateStr = new Date().format('yyyyMMddhhmmss')
                    const fileName = `轻设计${dateStr}.png`
                    const data = res.canvas.toDataURL()
                    const url = URL.createObjectURL(dataURL2Blob(data))
                    this.downloadFile(fileName, url)
                } else {
                    Vue.notifier.fail('下载失败请稍后重试')
                }
            })
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.AIMATTING,
                statistic.opt_label.AIMATTING.download])
        },
        exportToH5() {
            Vue.loading.open('导出中')
            this.$refs.mattingEditor.getMattingResult().then(res => {
                if (res && res.data) {
                    Vue.api.file.saveToH5(Vue.env.h5TagId, [{ path: res.data.key }], 0)
                        .then((res) => {
                            Vue.loading.close()
                            Vue.notifier.info('导出成功，刷新图片库可查看')
                        })
                        .catch(err => {
                            err && this.logger.error(err)
                            Vue.loading.close()
                            Vue.notifier.info('导出失败，请稍后重试')
                        })
                } else {
                    Vue.loading.close()
                    Vue.notifier.fail('导出失败请稍后重试')
                }
            })
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.AIMATTING,
                statistic.opt_label.AIMATTING.exportToH5])
        },
        // 绘制图片组件到画布
        addElement(src, width, height) {
            const result = this.eqxPage.getElementPosOfCenter(width, height, this.scale)
            const left = result.left
            const top = result.top
            const elementJson = {
                type: elementType.image,
                property: {
                    src,
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
                    left: Math.round(left) + 'px',
                    top: Math.round(top) + 'px',
                    width: Math.round(width) + 'px',
                    height: Math.round(height) + 'px',
                    border: '1px solid transparent'
                }
            }

            this.eqxPage.addElement(elementJson)
            this.eqxPage.eqxHistory.add(this.eqxPage)
            this.closeMatting()
        },
        // 入口2 插入画布
        insert() {
            Vue.loading.open('正在添加')
            this.$refs.mattingEditor.getMattingResult().then(res => {
                if (res && res.data) {
                    const key = res.data.key
                    Vue.api.file.getImageInfo(key).then(imageInfo => {
                        Vue.loading.close()
                        this.addElement(key, imageInfo.data.width, imageInfo.data.height)
                    }).catch(err => {
                        err && Vue.logger.error(err)
                        Vue.loading.close()
                        Vue.notifier.fail('服务器异常，请稍后重试')
                    })
                } else {
                    Vue.loading.close()
                    Vue.notifier.fail('添加失败请稍后重试')
                }
            })
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.AIMATTING,
                statistic.opt_label.AIMATTING.insert])
        }

    }

}
</script>

<style lang="scss">
.eqc-aimatting {
    width: 100%;
    position: relative;
    .help-btn {
        width: 36px;
        height: 36px;
        position: absolute;
        bottom: 24px;
        left: 24px;
        background: #ffffff;
        text-align: center;
        line-height: 39px;
        box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
        border-radius: 22px;
        font-size: 20px;
        cursor: pointer;
        &:hover {
            background: #1593ff;
            color: #ffffff;
        }
    }
}
</style>
