<template>
    <div
        v-photoKeymap
        v-scroll
        class="eqc-photo-workspace"
    >
        <!-- 编辑器 -->
        <the-editor
            v-show="isUploadImage"
            :style="`visibility:${toobarOriginal.show?'hidden':'visible'};`"
        />
        <!-- 上传图片组件 -->
        <the-editor-upload
            v-if="isShowEditorUpload&&mode!==PhotoMode.setting"
            ref="editorUpload"
            :close-btn="needCloseBtn"
            :paste-upload-completed="uploadCompleted"
            :pc-upload-completed="uploadCompleted"
            :mobile-upload-completed="uploadCompleted"
            :close-editor-upload="closeEditorUpload"
            :file-size-limit="10"
            editor-type="photo"
        />
        <!-- 原图对比 -->
        <original v-if="toobarOriginal.show" />
        <!-- 底部工具栏 -->
        <the-toolbar v-if="isUploadImage" />
        <!-- 缩略图 -->
        <scale-preview v-if="isUploadImage" />
    </div>
</template>

<script>
import TheEditor from './TheEditor.vue'
import TheToolbar from './TheToolbar.vue'
import ScalePreview from './workspace/ScalePreview.vue'
import scroll from './workspace/scroll'
import Original from './toolbar/Original.vue'
import TheEditorUpload from '../../../../vue/pages/aimatting/TheEditorUpload.vue'
import util from '../../../../utils/util'
import { host } from '../../../../config/env'
import PhotoMode from '../../../../config/enum.photoMode.type'
import dom2canvas from '../../../../utils/dom2canvas'
import renderDisplay from './workspace/elementDisplay'
import combineInitor from './workspace/combine.box.js'
import elementType from '../../../../config/enum.element.type'
import historyType from '../../../../config/enum.photoHistory.type'

export default {
    components: {
        TheEditor,
        TheToolbar,
        ScalePreview,
        Original,
        TheEditorUpload
    },
    directives: {
        scroll
    },
    props: {
        mode: {
            type: Number,
            default: 1
        }
    },
    data() {
        return {
            historyType,
            exeFlag: true,
            mouseState: false,
            PhotoMode,
            isShowEditorUpload: true,
            needCloseBtn: false
        }
    },
    computed: {
        photoScene() {
            return Vue.store.state.photoScene
        },
        setOriginImageInfo() {
            return Vue.store.state.photoScene.setOriginImageInfo
        },
        isUploadImage() {
            return this.photoScene.isUploadImage
        },
        eqxScene() {
            return this.photoScene.eqxScene
        },
        eqxPage() {
            return this.photoScene.eqxPage
        },
        eqxElementsSelected() {
            return this.photoScene.eqxElementsSelected
        },
        layout() {
            return Vue.store.state.photoLayout
        },
        toobarOriginal() {
            return this.layout.toobarOriginal
        },
        toolCrop() {
            return this.layout.toolCrop
        },
        reUploadImage() {
            return this.photoScene.reUploadImage
        },
        photoHistory() {
            return Vue.store.state.photoHistory
        },
        originImage() {
            return this.photoScene.originImage
        },
        originImageSize() {
            return this.photoScene.originImageSize
        }
    },
    watch: {
        originImage(newVal) {
            // 原图改变  立马执行缩略图策略
            // 根据原图生成缩略图
            if (newVal) {
                this.generateOriginImageShot(newVal, this.originImageSize.width, this.originImageSize.height, this.eqxPage.scale, this.eqxPage).then((size) => {
                // 清除所有历史记录
                    Vue.store.commit('PHOTO_HISTORY_UNDO_TO_ORIGINAL', { all: true })
                    // 添加一条初始历史记录
                    const config = {
                        operating: JSON.parse(JSON.stringify(Vue.store.state.photoBase.base)),
                        width: size.width,
                        height: size.height
                    }
                    this.photoHistory.history.insert(config, size.src, this.historyType.base, false)
                })
            }
        },
        eqxElementsSelected() {
            if (this.eqxElementsSelected.length > 1) {
                // 初始化combineBox 是针对按住ctrl 多选
                !this.mouseState && combineInitor.initCombine(this.eqxElementsSelected, this.eqxPage)
            }
            if (this.exeFlag) {
                this.exeFlag = false
                setTimeout(() => {
                    renderDisplay() // 重新绘制展示页面逻辑
                    this.exeFlag = true
                }, 0)
            }
        },
        reUploadImage(newVal, oldVal) {
            this.isShowEditorUpload = true
            this.needCloseBtn = true
        },
        setOriginImageInfo(newVal, oldVal) {
            if (newVal) {
                this.uploadImageComplete({
                    imageBase64: newVal.imageBase64,
                    imgWidth: newVal.imgWidth,
                    imgHeight: newVal.imgHeight,
                    imgKey: newVal.imgKey
                })
            }
        }
    },
    mounted() {
        const $el = this.$el
        // 工作区添加鼠标点击事件处理
        $el.addEventListener('mousedown', e => {
            // 如果存在颜色选择就关闭不执行后续操作
            if (document.querySelector('.eqc-color-picker') !== null) {
                Vue.colorPicker.close()
                return
            }
            // 判断如果存在裁切组件则不执行
            const elements = Vue.store.state.photoScene.eqxPage.pageJson.elements
            const cropResult = elements.filter(item => {
                return item.type === elementType.crop
            })
            if (cropResult.length > 0) {
                return
            }
            // 清除store里面所有组件的选中状态
            Vue.store.commit('PHOTO_ELEMENT_SELECT', { eqxElements: [] })
            // 清除画布上的组件选中状态
            this.eqxPage.clearElementsSelected()
            // 清除文字选择状态
            getSelection().removeAllRanges()
        })
        // 模拟选择图片
        // this.uploadCompleted({key: 'f396031e2bcb8cb22b641112622e5763'})
    },
    methods: {
        // 上传图片完成处理
        uploadImageComplete(res) {
            Vue.loading.open('初始化环境')
            const eqxPage = Vue.store.state.photoScene.eqxPage
            const { imageBase64, imgWidth, imgHeight, imgKey } = res
            // 设置当前用户源图key
            Vue.store.commit('PHOTO_ORIGIN_KEY', imgKey)
            // 设置当前用户源图
            Vue.store.commit('PHOTO_ORIGIN_IMAGE', imageBase64)
            // 设置当前用户源图尺寸信息
            Vue.store.commit('PHOTO_ORIGIN_IMAGE_SIZE', { width: imgWidth, height: imgHeight })
            // 设置上传过图片
            Vue.store.commit('PHOTO_IS_UPLOAD_IMAGE', true)
            // 隐藏上传组件
            this.isShowEditorUpload = false
            // 通知裁切关闭菜单
            Vue.store.commit('PHOTO_TOOL_CROP_CHANGE_EVENT', { action: 'newimg', params: { timeStamp: Number(new Date()) } })
            // 清除所有组件
            eqxPage.clearElements()
            // 清除裁切蒙层
            eqxPage.clearCrop()
            // 清除store里面所有组件的选中状态
            Vue.store.commit('PHOTO_ELEMENT_SELECT', { eqxElements: [] })
            document.querySelector('div.eqc-photo-nav-base.content > ul > li:nth-child(1) > div.title').click()
        },
        // 如果该图尺寸太大则根据适配的尺寸生成一张缩略图，原则上宽高积大于1500 * 900  才生成缩略图
        generateOriginImageShot(imageBase64, realWidth, realHeight, scale, eqxPage) {
            return new Promise((resolve, reject) => {
                if (realWidth * realHeight > 1500 * 900) {
                    const width = realWidth * scale
                    const height = realHeight * scale
                    const $tempDiv = document.createElement('div')
                    const $img = new Image()
                    $img.style.width = width + 'px'
                    $img.style.height = height + 'px'
                    $img.src = imageBase64 // 经测试用七牛裁切图和 直接的原图 生成的base64 都一样大小
                    // $img.src = `http://res1.eqh5.com/d741599afd91f255f373e08482f2418c?imageMogr2/auto-orient/!${width}x${height}a1260a0`
                    document.body.appendChild($tempDiv)
                    $tempDiv.css({
                        position: 'fixed',
                        top: 0,
                        left: 500,
                        width: width + 'px',
                        height: height + 'px',
                        // background: `url('${imageBase64}') center center/cover`,
                        zIndex: -1 // 避免盖在当前页面上
                    })
                    $tempDiv.append($img)
                    $img.onload = function () {
                        dom2canvas($tempDiv)
                            .then(canvas => {
                                $tempDiv.remove()
                                // 缩略图生成完毕
                                Vue.store.commit('PHOTO_ORIGIN_IMAGE_SHOT', { shotImage: canvas.toDataURL(), width, height })
                                // 更新图片
                                const background = {
                                    src: canvas.toDataURL(),
                                    width: width,
                                    height: height
                                }
                                eqxPage.eqxBackground.setBackground(background)
                                // 更新页面大小为图片大小
                                Vue.store.commit('PHOTO_SCENE_SIZE_CHANGE', { width, height })
                                const $elWorkspace = eqxPage.$el.parentElement
                                eqxPage.setScale('fit', $elWorkspace.offsetWidth, $elWorkspace.offsetHeight)
                                Vue.loading.close()
                                resolve({ src: background.src, width, height })
                            })
                    }
                } else {
                // 缩略图就用原图
                    Vue.store.commit('PHOTO_ORIGIN_IMAGE_SHOT', { shotImage: imageBase64, width: realWidth, height: realHeight })
                    // 更新图片
                    const background = {
                        src: imageBase64,
                        width: realWidth,
                        height: realHeight
                    }
                    eqxPage.eqxBackground.setBackground(background)
                    // 更新页面大小为图片大小
                    Vue.store.commit('PHOTO_SCENE_SIZE_CHANGE', { width: realWidth, height: realHeight })
                    const $elWorkspace = eqxPage.$el.parentElement
                    eqxPage.setScale('fit', $elWorkspace.offsetWidth, $elWorkspace.offsetHeight)
                    Vue.loading.close()
                    resolve({ src: background.src, width: realWidth, height: realHeight })
                }
            })
        },
        // 上传组件完成事件
        uploadCompleted(res) {
            const imgKey = res.key
            util.getBase64ImageWithSize(host.file + imgKey).then(res => {
                this.uploadImageComplete({
                    imageBase64: res.base64,
                    imgWidth: res.width,
                    imgHeight: res.height,
                    imgKey: imgKey
                })
            })
        },
        // 上传图片关闭事件
        closeEditorUpload() {
            this.isShowEditorUpload = false
        }
    }
}
</script>

<style lang="scss">
.eqc-photo-workspace {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 0; // 画面放大后，这个尺寸也是固定的。虽然不知道为何要给一个固定值
    height: calc(100% - 60px);
    background: #eceef0;
    overflow: hidden;
    .eqc-photo-select-box {
        display: none;
        position: absolute;
        border: 1px solid #1593ff;
        background: rgba(21, 147, 255, 0.1);
    }
    .scale-tip {
        position: absolute;
        top: 8px;
        left: 50%;
        height: 36px;
        padding-right: 10px;
        line-height: 36px;
        box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
        border-radius: 3px;
        color: #1593ff;
        background: #fff;
        transform: translateX(-50%);
        .icon {
            margin: 10px;
            font-size: 16px;
        }
    }
    .art-font-tip {
        position: absolute;
        top: 50px;
        left: 50%;
        height: 36px;
        padding-right: 10px;
        line-height: 36px;
        box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
        border-radius: 3px;
        color: #1593ff;
        background: #fff;
        transform: translateX(-50%);
        .icon {
            margin: 10px;
            font-size: 16px;
        }
    }
    .eqc-photo-background {
        background: url("../../../img/opacity_40.png") center;
    }
    .empty-tip {
        z-index: 1;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
        .icon {
            width: 33px;
            height: 24px;
        }
        .text {
            margin-top: 10px;
            font-size: 12px;
            font-weight: 400;
            color: rgba(79, 93, 105, 1);
            line-height: 17px;
            .bg {
                color: #1593ff;
                cursor: pointer;
            }
        }
    }
}
</style>
