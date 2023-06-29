<template>
    <li
        v-drag-in="dragInOptions"
        :style="{backgroundImage: getBackgroundImage(item.productTypeMap.path)}"
        class="eqc-image-item-small"
        @mouseover="showPreview(item,$event)"
        @mouseleave="hidePreview(item)"
        @click="selectImage(item)"
    >
        <MaterialStar
            v-if="showStart"
            :item="item"
        />
        <MaterialOthers :item="item" />
        <ul
            v-show="isUpload && !isManage"
            class="menu"
        >
            <li
                class="icon delete hint--left hint--rounded"
                data-hint="删除"
                @click.stop="deleteImage(item)"
                @mousedown.stop
            >
                <i class="eqf-delete-l" />
            </li>
            <li
                class="icon hint--left hint--rounded"
                data-hint="设为背景"
                @click.stop="setBackground(item)"
                @mousedown.stop
            >
                <i class="eqf-background-l" />
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
import MaterialStar from './MaterialStar.vue'
import MaterialOthers from './MaterialOthers.vue'
import pay from './pay.js'
export default {
    components: {
        MaterialStar, MaterialOthers
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
            timeoutId: null
        }
    },
    computed: {
        thumbSize() {
            return 80
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
                path: this.item.productTypeMap.path,
                qiniuPath: this.getQiniuImage(this.item.productTypeMap.path),
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
            this.showStart = true
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
            if (this.previewAuthor) {
                clearTimeout(this.timeoutId)
                this.timeoutId = setTimeout(() => {
                    Vue.store.commit('MATERIAL_ITEM_PREVIEW', { show: false })
                }, 300)
            }
        },
        addElement(type, img, src, left = 0, top = 0, width, height, ignoreFlag) {
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
                    width: ignoreFlag ? Math.round(width) + 'px' : Math.round(newWidth) + 'px',
                    height: ignoreFlag ? Math.round(height) + 'px' : Math.round(newHeight) + 'px',
                    border: '1px solid transparent'
                }
            }

            this.eqxPage.addElement(elementJson)
            this.eqxPage.eqxHistory.add(this.eqxPage)

            // 打开帮助提示框
            this.helpnotifier.open('pic', '从左侧素材或上传中拖动图片可进行替换')
        },
        selectImage(item) {
            pay.checkPayBeforeAdd(item).then(() => {
                if (this.isManage) {
                    this.$set(item, 'isSelected', !item.isSelected)
                } else {
                    const src = this.getQiniuImage(item.productTypeMap.path)
                    loader.image(src)
                        .then(img => {
                            if (this.category === 'tcloud') {
                                const tcloud = Vue.store.state.tcloud.instance
                                tcloud.setTcouldShape(item.productTypeMap.path)
                            } else if (this.category === 'puzzle') {
                                Vue.notifier.success('请拖拽到画布上要嵌入的位置')
                            } else {
                                this.addElement('click', img, item.productTypeMap.path)
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
                const elType = result.eqxElement.elementJson.type
                if (elType === elementType.shape) {
                    // 替换形状
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
                                // 拖入图片居中显示到目标组件
                                const sourceRatio = source.width / source.height
                                const targetRatio = target.width / target.height
                                if (sourceRatio > targetRatio) {
                                    // 拖拽的图片比容器宽，横向细长型
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
        getQiniuImage(src) {
            return Vue.filter('qiniuZoom')(src, this.thumbSize)
        },
        getBackgroundImage(src) {
            src = this.getQiniuImage(src)
            return Vue.filter('backgroundImage')(src)
        },
        deleteImage(image) {
            this.$emit('delete', [image.id])
        },
        setBackground(item) {
            const src = item.productTypeMap.path
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
    }
}
</script>

<style lang="scss">
.eqc-image-item-small {
    position: relative;
    width: 80px;
    height: 80px;
    margin-top: 8px;
    background: #ffffff center/contain no-repeat;
    box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.16);
    border-radius: 3px;
    cursor: pointer;
    &:nth-child(1),
    &:nth-child(2),
    &:nth-child(3) {
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
        // &::before {
        //     opacity: 0.1;
        // }
        .menu {
            display: block;
        }
    }
    .menu {
        position: absolute;
        right: 0;
        top: 0;
        display: none;
        .icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            color: #fff;
            background: #2f3c4d;
            border-radius: 3px;
            transition: all 0.3s;
            &:not(:first-child) {
                margin-top: 6px;
            }
            &:hover {
                background: $blue-normal;
                &.delete {
                    background: #ff296a;
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
