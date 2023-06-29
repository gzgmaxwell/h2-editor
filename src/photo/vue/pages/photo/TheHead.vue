<template>
    <div class="eqc-photo-header">
        <i
            v-show="!isUploadImage&&false"
            class="icon eqf-eqxiulogo"
        />
        <ul
            :style="`right:${mode===1?72:56}px`"
            class="list"
        >
            <li
                v-show="isUploadImage&&mode!==photoMode.setting"
                :class="['btn-re-upload',isUploadImage?'btn':'btn-disable']"
                class="li-btn"
                @click="reUpload"
            >
                更换图片
            </li>
            <li
                v-show="isUploadImage && mode !== photoMode.setting"
                class="line"
            />
            <li
                v-show="mode === photoMode.tool"
                :class="[isUploadImage ? 'btn' : 'btn-disable']"
                class="li-btn"
                @click="insert()"
            >
                插入画布
                <span
                    v-if="limitedTimeFree"
                    class="limited-time-free"
                >限免</span>
            </li>
            <li
                v-show="mode === photoMode.tool"
                class="line"
            />
            <li
                v-show="mode!==photoMode.setting"
                :class="[isUploadImage ? 'btn' : 'btn-disable']"
                class="li-btn"
                @click="exportImageLibrary"
            >
                存入图片库
                <span
                    v-if="limitedTimeFree"
                    class="limited-time-free"
                >限免</span>
            </li>
            <li class="line" />
            <li
                v-show="mode!== photoMode.setting"
                :class="[{'download-disable':!isUploadImage},{'download':isUploadImage}]"
                @click="downloadPc"
            >
                下载到电脑
                <span
                    v-if="limitedTimeFree"
                    class="limited-time-free"
                >限免</span>
            </li>
            <li
                v-show="mode===photoMode.setting"
                :class="['btn-complete']"
                class="li-btn"
                @click="complete"
            >
                完成
            </li>
        </ul>
        <div
            v-if="mode === photoMode.independent"
            class="exit hint--bottom-left hint--rounded"
            data-hint="回到我的作品"
            @click="closeClick"
        >
            退出
        </div>
        <i
            v-if="mode !== photoMode.independent"
            class="close eqf-no"
            @click="closeClick"
        />
    </div>
</template>

<script>
import { dataURL2Blob } from '../../../../utils/blob'
import EqxScene from '../../../core/scene'
import EqxPage from '../../../core/html/page'
import Compressor from '../../../../utils/compressor.min'
import PhotoMode from '../../../../config/enum.photoMode.type'
import elementType from '../../../../config/enum.element.type'
import statistic from '../../../../config/statistic'

export default {
    components: {
    },
    props: {
        mode: {
            type: Number,
            default: 1
        },
        close: {
            type: Function,
            default: null
        }
    },
    data() {
        return {
            photoMode: PhotoMode,
            // 是否限时免费
            limitedTimeFree: true
        }
    },
    computed: {
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        scene() {
            return Vue.store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        photoScene() {
            return Vue.store.state.photoScene
        },
        photoEqxPage() {
            return this.photoScene.eqxPage
        },
        scale() {
            return this.eqxPage.scale
        },
        isUploadImage() {
            return this.photoScene.isUploadImage
        }
    },
    watch: {
    },
    methods: {
        // 重新上传
        reUpload() {
            Vue.store.commit('PHOTO_RE_UPLOAD_IMAGE', { reUploadImage: new Date().getTime() })
        },
        // 下载到本地
        downloadPc() {
            if (!this.isUploadImage) {
                return
            }
            Vue.loading.open('生成中')
            const { pageJson, eqxScene } = this.photoEqxPage
            const eqxSceneNew = new EqxScene(JSON.parse(JSON.stringify(eqxScene.sceneJson)))
            const eqxPageNew = new EqxPage(JSON.parse(JSON.stringify(pageJson)), eqxSceneNew)
            eqxPageNew.page2Canvas()
                .then(res => {
                    const fileName = `${(eqxScene.sceneJson.title || '无标题')}_ ${new Date().format('yyyyMMddhhmmss')}.png`
                    const data = res.toDataURL('image/png', 1.0)
                    this.compressFile(dataURL2Blob(data)).then(res => {
                        const URL = window.URL || window.webkitURL
                        const a = document.createElement('a')
                        a.download = fileName
                        a.href = URL.createObjectURL(res)
                        a.trigger('click')
                        Vue.loading.close()
                        window._hmt.push(['_trackEvent',
                            statistic.category.F,
                            statistic.action.PHOTO,
                            statistic.opt_label.PHOTO.download])
                    })
                })
                .catch(err => {
                    err && this.logger.error(err)
                    Vue.loading.close()
                })
        },
        // 导出到图片库
        exportImageLibrary() {
            if (!this.isUploadImage) {
                return
            }
            Vue.loading.open('导出中')
            Vue.store.dispatch('PHOTO_PAGE_SAVE', { eqxPage: this.photoEqxPage, needCover: true })
                .then(res => {
                    Vue.api.file.saveToH5(Vue.env.h5TagId, [{ path: res.cover }], 0)
                        .then((res) => {
                            Vue.loading.close()
                            Vue.notifier.info('导出成功，刷新图片库可查看')
                            window._hmt.push(['_trackEvent',
                                statistic.category.F,
                                statistic.action.PHOTO,
                                statistic.opt_label.PHOTO.expH5])
                        })
                        .catch(err => {
                            err && this.logger.error(err)
                            Vue.loading.close()
                            Vue.notifier.info('导出失败，请稍后重试')
                        })
                })
                .catch(err => {
                    err && this.logger.error(err)
                    Vue.loading.close()
                })
        },
        // 入口三点击完成
        complete() {
            Vue.loading.open('正在处理')
            // 清除裁切组件
            this.photoEqxPage.clearCrop()
            const width = this.photoEqxPage.width
            const height = this.photoEqxPage.height
            Vue.store.dispatch('PHOTO_PAGE_SAVE', { eqxPage: this.photoEqxPage, needCover: true })
                .then(res => {
                    this.close({
                        key: res.cover,
                        width,
                        height
                    })
                    Vue.loading.close()
                    // 完成-清空workspace
                    Vue.store.commit('PHOTO_SCENE_CLEAR')
                    window._hmt.push(['_trackEvent',
                        statistic.category.F,
                        statistic.action.PHOTO,
                        statistic.opt_label.PHOTO.finish])
                })
                .catch(err => {
                    err && this.logger.error(err)
                    Vue.loading.close()
                })
        },
        // 关闭
        closeClick() {
            if (this.mode === PhotoMode.independent) {
                if (this.userInfo.id) {
                    window.location.href = `${Vue.env.host.auth}/eip/scene?type=h2`
                } else {
                    this.$router.push({ path: '/visit' })
                }
            } if ([this.photoMode.tool, this.photoMode.setting].includes(this.mode)) {
                // 设置上传过图片
                Vue.store.commit('PHOTO_IS_UPLOAD_IMAGE', false)
                this.close()
            }
            // 关闭-成功清空workspace
            Vue.store.commit('PHOTO_SCENE_CLEAR')
        },
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
        },
        // 入口2 插入画布
        insert() {
            if (!this.isUploadImage) {
                return
            }
            Vue.loading.open('插入中')
            Vue.store.dispatch('PHOTO_PAGE_SAVE', { eqxPage: this.photoEqxPage, needCover: true })
                .then(res => {
                    this.insertCanvas(res.cover)
                    Vue.loading.close()
                    // 设置上传过图片
                    Vue.store.commit('PHOTO_IS_UPLOAD_IMAGE', false)
                    // 关闭-成功清空workspace
                    Vue.store.commit('PHOTO_SCENE_CLEAR')
                    this.close()
                    window._hmt.push(['_trackEvent',
                        statistic.category.F,
                        statistic.action.PHOTO,
                        statistic.opt_label.PHOTO.insert])
                })
                .catch(err => {
                    err && this.logger.error(err)
                    Vue.loading.close()
                })
        },
        insertCanvas(src) {
            const imgWidth = parseInt(this.photoEqxPage.width)
            const imgHeight = parseInt(this.photoEqxPage.height)
            const pageWidth = parseInt(this.eqxPage.width)
            const pageHeight = parseInt(this.eqxPage.height)
            let insertImgWidth, insertImgHeight
            if (imgWidth / imgHeight >= 1) {
                if (imgWidth <= pageWidth) {
                    insertImgWidth = imgWidth
                    insertImgHeight = imgHeight
                } else {
                    insertImgWidth = pageWidth
                    insertImgHeight = pageWidth / (imgWidth / imgHeight)
                }
            } else {
                if (imgHeight <= pageHeight) {
                    insertImgWidth = imgWidth
                    insertImgHeight = imgHeight
                } else {
                    insertImgHeight = pageHeight
                    insertImgWidth = insertImgHeight * (imgWidth / imgHeight)
                }
            }
            insertImgWidth = insertImgWidth / this.scale
            insertImgHeight = insertImgHeight / this.scale
            const result = this.eqxPage.getElementPosOfCenter(insertImgWidth, insertImgHeight, this.scale)
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
                    width: Math.round(insertImgWidth) + 'px',
                    height: Math.round(insertImgHeight) + 'px',
                    border: '1px solid transparent'
                }
            }

            this.eqxPage.addElement(elementJson)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        }
    }
}
</script>

<style lang="scss">
$nav-blue: rgba(21, 147, 255, 1);
.eqc-photo-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    height: 60px;
    font-size: 13px;
    color: #4f5d69;
    background: #fff;
    box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.16);
    z-index: 2;
    cursor: default;
    .eqf-eqxiulogo {
        color: $nav-blue;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 60px;
        font-size: 43px;
        margin-left: 13px;
    }
    ul {
        position: absolute;
        right: 12px;
        list-style: none;
        li {
            position: relative;
            float: left;
        }
        .li-btn {
            background: rgba(255, 255, 255, 1);
            border-radius: 3px;
            padding: 11px 20px;
            font-size: 13px;
            font-weight: 400;
            color: #252b3f;
            text-align: center;
            cursor: pointer;
        }
        li.line {
            width: 1px;
            height: 20px;
            background: rgba(230, 235, 237, 1);
            margin-top: 8px;
        }

        // 正常状态
        li.btn {
            color: #252b3f;
            cursor: pointer;
            &:hover {
                color: #1593ff;
            }
        }
        // 禁用状态
        li.btn-disable {
            color: #ccd5db;
            cursor: not-allowed;
            &:hover {
                // background: #ccd5db;
                color: #ccd5db;
            }
        }
        li.btn-complete {
            // 完成
            width: 92px;
            height: 40px;
            padding: 0;
            background: #1593ff;
            color: #ffffff;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            cursor: pointer;
            &:hover {
                background: #1593ff;
                color: #ffffff;
            }
        }
        // 限免
        .limited-time-free {
            top: -2px;
            right: -10px;
            position: absolute;
            z-index: 1;
            width: 32px;
            height: 16px;
            line-height: 16px;
            background: rgba(255, 41, 106, 1);
            border-radius: 8px;
            text-align: center;
            font-size: 12px;
            font-weight: 400;
            color: rgba(255, 255, 255, 1);
        }
    }
    // 关闭
    .close {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 28px;
        height: 28px;
        font-size: 22px;
        color: #fff;
        background: #252b3f;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s;
        position: absolute;
        right: 16px;
        &:hover {
            background: #ff2a6a;
        }
    }
    // 退出
    .exit {
        right: 24px;
        width: 36px;
        height: 36px;
        line-height: 36px;
        color: #252b3f;
        border-radius: 3px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        &:hover {
            color: #ff2a6a;
        }
    }
    .download {
        width: 106px;
        height: 40px;
        padding: 0;
        background: #1593ff;
        color: #ffffff;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
        cursor: pointer;
        &:hover {
            background: #1593ff;
            color: #ffffff;
        }
    }
    .download-disable {
        width: 106px;
        height: 40px;
        padding: 0;
        background: #ccd5db;
        color: #ffffff;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
        cursor: not-allowed;
        &:hover {
            background: #ccd5db;
            color: #ffffff;
        }
    }
}
</style>
