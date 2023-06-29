<template>
    <li
        v-drag-in="dragInOptions"
        :style="{backgroundImage: getBackgroundImage(item)}"
        class="eqc-image-item"
        @mouseover="showPreview(item,$event)"
        @mouseleave="hidePreview(item)"
        @click="selectImage(item)"
    >
        <material-star
            v-if="showStart"
            :item="item"
        />
        <material-others :item="item" />
        <ul
            v-show="isUpload && !isManage && showConfig"
            class="menu"
        >
            <li
                v-if="category === 'h2'"
                class="icon box"
                @mousedown.stop
                @mousemove="showConfigPanel=true"
            >
                <span class="name"><i class="eqf-menu-p" /></span>
            </li>
            <li
                class="icon delete"
                @click.stop="deleteImage(item)"
                @mousedown.stop
            >
                <i class="eqf-no" />
            </li>
            <li
                v-if="category === 'h2'"
                class="config-box"
                :style="{height:showConfigPanel?'64px':0}"
            >
                <ul class="box-wrapper">
                    <li @click.stop="setBackground(item)">
                        设为背景
                    </li>
                    <li @click.stop="openBeautiTool(item)">
                        编辑美化
                    </li>
                </ul>
            </li>
        </ul>
        <i
            v-show="isManage"
            :class="{active: item.isSelected}"
            class="select eqf-yes"
        />
    </li>
</template>

<script>
import elementType from '../../../../../config/enum.element.type'
import textType from '../../../../../config/enum.text.type'
import loader from '../../../../../utils/loader'
import EnumSceneType from '../../../../../config/enum.scene.type'
import { host } from '../../../../../config/env'
import gifParse from '../../../../../utils/gifParsing'
import MaterialStar from './MaterialStar.vue'
import MaterialOthers from './MaterialOthers.vue'
import pay from './pay.js'
import util from '../../../../../utils/util'
import PhotoIndex from '../../../../../photo/vue/pages/photo/Index.vue'
import PhotoMode from '../../../../../config/enum.photoMode.type'
import statistic from '../../../../../config/statistic'
export default {
    components: {
        MaterialStar,
        MaterialOthers
    },
    props: {
        item: {
            type: Object,
            default: null
        },
        isUpload: {
            type: Boolean,
            default: false
        },
        isManage: {
            type: Boolean,
            default: false
        },
        category: { // 类型 h2 主编辑器  tcloud 字云编辑器
            type: String,
            default: 'h2'
        }
    },
    data() {
        return {
            showStart: false, // 是不是展示收藏start
            timeoutId: null,
            showConfigPanel: false,
            showConfig: false
        }
    },
    computed: {
        thumbSize() {
            return 124
        },
        viewSize() {
            return 180
        },
        eqxPage() {
            return Vue.store.state.scene.eqxPage
        },
        scale() {
            return this.eqxPage.scale
        },
        dragInOptions() {
            let option = {
                types: [elementType.image, elementType.qrcode, elementType.frame, elementType.shape, elementType.puzzle],
                textTypes: [textType.chartlet],
                thumbSize: this.thumbSize,
                viewSize: this.viewSize,
                path: this.item.productTypeMap ? this.item.productTypeMap.path : this.item.path,
                qiniuPath: this.getQiniuImage(this.item),
                onDragEnd: this.onDragEnd,
                item: this.item
            }
            if (this.category === 'tcloud') {
                option = null
            }
            return option
        },
        previewAuthor() {
            return Vue.store.state.layout.materialConfig.previewAuthor
        },
        navType() {
            return Vue.store.state.layout.nav.selectedItem.type
        },
        puzzleMode() {
            return Vue.store.state.scene.puzzleMode
        }
    },
    mounted() {
        this.item.elementType = elementType.image
    },
    methods: {
        // 预览展示
        showPreview(item, $event) {
            //  只有素材的时候 才展示收藏标识
            this.showConfig = true
            if (this.navType === 'image') {
                this.showStart = true
            }
            if (this.previewAuthor) {
                clearTimeout(this.timeoutId)
                this.timeoutId = setTimeout(() => {
                    const height = $event.clientY - $event.offsetY
                    const itemCopy = JSON.parse(JSON.stringify(item))
                    itemCopy.elementType = elementType.image
                    Vue.store.commit('MATERIAL_ITEM_PREVIEW', { show: true, item: itemCopy, height })
                }, 300)
            }
        },
        // 预览关闭
        hidePreview(item) {
            this.showStart = false
            this.showConfigPanel = false
            setTimeout(() => {
                // 让动画走完
                this.showConfig = false
            }, 300)
            if (this.previewAuthor) {
                clearTimeout(this.timeoutId)
                this.timeoutId = setTimeout(() => {
                    Vue.store.commit('MATERIAL_ITEM_PREVIEW', { show: false })
                }, 300)
            }
        },
        checkFramesBeforeAdd(gifPath) {
            this.loading.open('gif帧校验，请稍后')
            return new Promise((resolve, reject) => {
                const src = host.file + gifPath
                gifParse.getCanvasList(src).then(canvas => {
                    this.loading.close()
                    if (canvas.length > 30) {
                        Vue.notifier.warn('gif组件帧数不能高于30帧！')
                        resolve(false)
                    } else {
                        resolve(true)
                    }
                }).catch(err => {
                    this.loading.close()
                    resolve(false)
                    console.log(err)
                })
            })
        },
        addElement(type, img, src, left = 0, top = 0, width, height, ignoreFlag, name) {
            const scale = this.scale
            const viewScale = img.width / img.height
            let newWidth = 0
            let newHeight = 0
            if (viewScale > 1) {
                newWidth = this.viewSize / scale
                newHeight = newWidth / viewScale
            } else {
                newHeight = this.viewSize / scale
                newWidth = newHeight * viewScale
            }
            if (type === 'click') {
                const result = this.eqxPage.getElementPosOfCenter(newWidth, newHeight, scale)
                left = result.left
                top = result.top
            }
            let eleType = elementType.image
            this.getFileType(src).then(res => {
                const filesuffiex = res
                if (res === 'gif') {
                    eleType = elementType.gif
                    if (!this.checkGif()) {
                        return
                    }
                    this.checkFramesBeforeAdd(src).then(state => {
                        if (state) {
                            this.addElementToPage(eleType, src, left, top, width, height, ignoreFlag, newWidth, newHeight, filesuffiex)
                        }
                    })
                } else {
                    this.addElementToPage(eleType, src, left, top, width, height, ignoreFlag, newWidth, newHeight, filesuffiex, name)
                }
            })
        },
        addElementToPage(eleType, src, left, top, width, height, ignoreFlag, newWidth, newHeight, filesuffiex, name) {
            const elementJson = {
                type: eleType,
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
                    },
                    isSvg: /\.svg$/.test(name)
                },
                css: {
                    left: Math.round(left) + 'px',
                    top: Math.round(top) + 'px',
                    width: ignoreFlag ? Math.round(width) + 'px' : Math.round(newWidth) + 'px',
                    height: ignoreFlag ? Math.round(height) + 'px' : Math.round(newHeight) + 'px',
                    border: '1px solid transparent'
                }
            }

            this.eqxPage.addElement(elementJson)
            this.eqxPage.eqxHistory.add(this.eqxPage)

            // 打开帮助提示框
            if (filesuffiex !== 'gif') {
                this.helpnotifier.open('pic', '从左侧素材或上传中拖动图片可进行替换')
            }
        },
        checkGif() {
            const allElements = Vue.store.state.scene.eqxPage.eqxElements
            let pass = true
            allElements.map(item => {
                if (item.elementJson.type === elementType.gif) {
                    Vue.notifier.warn('一个作品中只允许存在一个gif素材哦！')
                    pass = false
                }
            })
            const sceneType = this.eqxPage.eqxScene.sceneJson.type
            if (pass && !EnumSceneType.isAllowAddGifToScene(sceneType)) {
                Vue.notifier.warn('需秀客账号在gif场景中添加！')
                pass = false
            }
            if (pass && !this.user.allow('gifUploadUsing')) {
                Vue.notifier.warn('gif素材只能由秀客和超级账号用户添加！')
                pass = false
            }
            return pass
        },
        selectImage(item) {
            pay.checkPayBeforeAdd(item).then(() => {
                if (this.isManage) {
                    this.$set(item, 'isSelected', !item.isSelected)
                } else {
                    const path = item.productTypeMap ? item.productTypeMap.path : item.path
                    const src = this.getQiniuImage(item)
                    loader.image(src)
                        .then(img => {
                            if (this.category === 'tcloud') {
                                const tcloud = Vue.store.state.tcloud.instance
                                tcloud.setTcouldShape(path)
                            } else if (this.category === 'puzzle') {
                                Vue.notifier.success('请拖拽到画布上要嵌入的位置')
                            } else {
                                this.addElement('click', img, path, null, null, null, null, null, item.name)
                            }
                        })
                }
            }).catch(err => err && Vue.logger.error(err))
        },
        onDragEnd(type, result) {
            // 保证图片path没有后缀
            result.path = result.path.split('?')[0]
            // 拼图编辑器只能拖拽到拼图里，其他事件不响应
            if (this.puzzleMode && type !== 'replace') {
                Vue.notifier.warn('请拖拽到拼图里')
                return
            }
            if (type === 'replace') {
                const path = this.item.productTypeMap ? this.item.productTypeMap.path : this.item.path
                this.getFileType(path).then(res => {
                    if (res === 'gif') {
                        Vue.notifier.warn('gif素材暂不允许拖拽替换！')
                    } else {
                        const elType = result.eqxElement.elementJson.type
                        if (elType === elementType.shape) {
                            const eqxElement = result.eqxElement
                            const left = parseFloat(eqxElement.elementJson.css.left)
                            const top = parseFloat(eqxElement.elementJson.css.top)
                            const width = parseFloat(eqxElement.elementJson.css.width)
                            const height = parseFloat(eqxElement.elementJson.css.height)
                            this.addElement('drag', result.image, result.path, left, top, width, height, true)
                            this.eqxPage.deleteElements([eqxElement])
                            this.eqxPage.eqxHistory.add(this.eqxPage)
                        } else {
                            const property = result.eqxElement.elementJson.property

                            if (/\.svg$/.test(result.path)) {
                                property.src = result.path
                                property.crop = undefined // 用于删除，svg不需要裁切相关的属性
                                result.eqxElement.updateProperty(property)
                                this.eqxPage.eqxHistory.add(this.eqxPage)
                            } else {
                                loader.image(result.path)
                                    .then(source => {
                                        const css = result.eqxElement.elementJson.css
                                        const target = {
                                            width: parseInt(css.width),
                                            height: parseInt(css.height)
                                        }
                                        const crop = {
                                            left: 0,
                                            top: 0,
                                            width: source.width,
                                            height: source.height
                                        }
                                        // 拖拽到容器的图片居中显示
                                        const sourceRatio = source.width / source.height
                                        const targetRatio = target.width / target.height
                                        // 拖拽的图片比容器宽，横向细长型
                                        if (sourceRatio > targetRatio) {
                                            crop.width = Math.round(source.height * targetRatio)
                                            crop.left = Math.round((source.width - crop.width) / 2)
                                        } else {
                                            crop.height = Math.round(source.width / targetRatio)
                                            crop.top = Math.round((source.height - crop.height) / 2)
                                        }
                                        if (elementType.frame === elType) {
                                            // 嵌入框
                                            property.src = result.path
                                            property.frames = {
                                                0: {
                                                    src: result.path,
                                                    crop: crop
                                                }

                                            }
                                        } else if (elementType.puzzle === elType) {
                                            // 拼图
                                            const item = {
                                                imgId: `#${result.eqxElement.clipId}_img`,
                                                src: result.path,
                                                crop: crop,
                                                img: {
                                                    width: source.width,
                                                    height: source.height
                                                }
                                            }
                                            if (property.frames) {
                                                let index = -1
                                                property.frames.map((v, i) => {
                                                    if (v.imgId === `#${result.eqxElement.clipId}_img`) {
                                                        index = i
                                                    }
                                                })
                                                if (index > -1) {
                                                    property.frames.splice(index, 1, item)
                                                } else {
                                                    property.frames.push(item)
                                                }
                                            }
                                        } else {
                                            // 图片
                                            property.src = result.path
                                            property.crop = crop
                                        }
                                        result.eqxElement.updateProperty(property)
                                        this.eqxPage.eqxHistory.add(this.eqxPage)
                                    })
                                    .catch(err => err && this.logger.error(err))
                            }
                        }
                    }
                })
            } else if (type === 'replaceFontBackgroundImage') {
                const css = { backgroundImage: result.path }
                result.eqxElement.updateProperty(css)
                this.eqxPage.eqxHistory.add(this.eqxPage)
            } else if (type === 'add') {
                this.addElement('drag', result.image, result.path, result.left, result.top)
                this.eqxPage.eqxHistory.add(this.eqxPage)
            } else if (type === 'insert') {
                if (result.eqxElement && result.eqxElement.elementJson.type === elementType.qrcode && result.eqxElement.elementJson.property.isArt) {
                    return
                }
                const options = {
                    ratio: 1,
                    src: result.path,
                    hideOptions: true
                }
                this.dialog.openImageCrop(options)
                    .then(data => {
                        const { left, top, width, height } = data.crop
                        const src = result.path + `?imageMogr2/auto-orient/crop/!${width}x${height}a${left}a${top}`
                        if (result.eqxElement.elementJson.type === elementType.qrcode) {
                            result.eqxElement.updateProperty({ centerIcon: src })
                        } else {
                            result.eqxElement.updateProperty({ src })
                        }
                        this.eqxPage.eqxHistory.add(this.eqxPage)
                    })
                    .catch(err => err && this.logger.error(err))
            }
        },
        getQiniuImage(item) {
            const path = item.productTypeMap ? item.productTypeMap.path : item.path
            if (/\.svg$/.test(item.name)) {
                return path
            } else {
                return Vue.filter('qiniuZoom')(path, this.thumbSize)
            }
        },
        getBackgroundImage(item) {
            const path = item.productTypeMap ? item.productTypeMap.path : item.path
            // svg格式图片不展示缩略图
            let src = path
            let fileType = ''
            if (item.name && item.name.lastIndexOf('.') !== -1) {
                fileType = item.name.substr(item.name.lastIndexOf('.') + 1)
            }

            if (fileType !== 'svg') {
                src = this.getQiniuImage(item)
            }
            return Vue.filter('backgroundImage')(src)
        },
        deleteImage(image) {
            this.$emit('delete', [image.id])
        },
        setBackground(item) {
            const src = item.productTypeMap ? item.productTypeMap.path : item.path
            this.getFileType(src).then(res => {
                if (res === 'gif') {
                    const sceneType = this.eqxPage.eqxScene.sceneJson.type
                    if (!EnumSceneType.isAllowAddGifToScene(sceneType) || !this.user.allow('gifUploadUsing')) {
                        Vue.notifier.warn('需秀客账号在gif场景中才能设置！')
                    }
                } else {
                    const { width, height } = this.eqxPage.eqxScene.sceneJson
                    const options = {
                        ratio: width / height,
                        src,
                        hideOptions: true
                    }
                    this.dialog.openImageCrop(options)
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
                }
            })
        },
        getFileType(path) {
            if (path.indexOf('?') > 0) {
                path = path.split('?')[0]
            }
            return new Promise((resolve, reject) => {
                Vue.api.file.getImageInfo(path)
                    .then(res => {
                        resolve(res.data.format)
                    })
                    .catch(err => {
                        err && Vue.logger.error(err)
                        reject()
                    })
            })
        },
        // 打开美化工具
        openBeautiTool(item) {
            // 打开美化之后 要添加到页面上 并且保存一份在我的上传里面
            const src = item.path
            if (src) {
                util.getBase64ImageWithSize(host.file + src).then(res => {
                    const options = {
                        component: PhotoIndex,
                        data: {
                            mode: PhotoMode.setting,
                            zIndex: 104
                        }
                    }
                    this.slide.open(options)
                        .then((res) => {
                            if (res && res.key) {
                                loader.image(res.key)
                                    .then(img => {
                                        this.addElement('click', img, res.key, null, null, null, null, null, item.name)
                                    })
                                this.saveToUpload(item, res.key)
                            }
                        })
                        .catch((err) => {
                            err && this.logger.error(err)
                        })
                    setTimeout(() => {
                        Vue.store.commit('PHOTO_SET_ORIGIN_IMAGE_INFO', {
                            imageBase64: res.base64,
                            imgWidth: res.width,
                            imgHeight: res.height,
                            imgKey: src.split('?')[0],
                            timeStamp: Number(new Date())
                        })
                    })
                })
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.PHOTO,
                    statistic.opt_label.PHOTO.clickSetting])
            }
        },
        // 保存到我的上传里面
        saveToUpload(item, key) {
            const data = [{
                path: key,
                tmbPath: key,
                name: name,
                size: item.size,
                fileType: item.fileType,
                tagId: Vue.store.state.scene.chooseUploadTagId,
                storageType: 0, // 用户上传 1 作品转素材  2 二次编辑转存素材
                source: 'P010005',
                uploadType: 0 // 0 PC本地上传 1 app上传 2 手机扫码上传 3 小程序本地上传
            }]
            Vue.api.file.batchSaveFile(JSON.stringify(data)).then(() => {
                // 刷新上传栏
                this.$emit('uploadComplete', -1)
            }).catch(err => err && Vue.logger.error(err))
        }
    }
}
</script>

<style lang="scss">
.eqc-image-item {
    position: relative;
    width: 124px;
    height: 124px;
    margin-top: 8px;
    background: #ffffff center/contain no-repeat;
    box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.16);
    border-radius: 3px;
    cursor: pointer;
    &:nth-child(1),
    &:nth-child(2) {
        margin-top: 0;
    }
    &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: #000;
        opacity: 0;
        transition: all 0.3s;
    }
    &:hover {
        box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.16);
        border-radius: 3px;
    }
    .menu {
        position: absolute;
        left: 0;
        top: 0;
        // display: none;
        width: 124px;
        height: 124px;
        padding: 8px;
        .icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            background: #2f3c4d;
            transition: all 0.3s;
            font-size: 12px;
        }
        .box {
            width: 24px;
            height: 16px;
            border-radius: 8px;
            &:hover {
                background: $blue-normal;
            }
        }
        .delete {
            width: 16px;
            height: 16px;
            float: right;
            border-radius: 50%;
            &:hover {
                background: #ff296a;
            }
        }
        .config-box {
            width: 96px;
            height: 64px;
            background: white;
            box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
            border-radius: 2px;
            margin-top: 8px;
            overflow: hidden;
            transition: all 0.3s;
            .box-wrapper {
                margin-top: 8px;
                li {
                    height: 24px;
                    padding-left: 12px;
                    font-size: 12px;
                    line-height: 24px;
                    &:hover {
                        background: $blue-normal;
                        color: white;
                    }
                }
            }
        }
    }
    .select {
        position: absolute;
        right: 6px;
        top: 6px;
        width: 24px;
        height: 24px;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        font-size: 16px;
        color: #fff;
        background: #2f3c4d;
        transition: all 0.3s;
        &:hover,
        &.active {
            background: $blue-normal;
        }
    }
}
</style>
