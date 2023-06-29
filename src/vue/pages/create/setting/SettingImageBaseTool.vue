<template>
    <ul class="eqc-setting-image-base-tool">
        <li
            v-if="!expressMode"
            :class="{active:currentSelect === 'matting'}"
            class="bs bs-matting"
            @click="mattingImage"
        >
            <i class="eqf-cut" />
            <span class="tip">抠图</span>
        </li>
        <li
            class="bs bs-crop"
            :class="{active:currentSelect === 'crop'}"
            @click="cropImage"
        >
            <i class="eqf-cutpic" />
            <span class="tip">裁切</span>
        </li>
        <li
            v-if="showBaseImageEditor && !expressMode"
            :class="{active:currentSelect === 'base'}"
            class="bs bs-base"
            @click="base"
        >
            <i class="eqf-magic" />
            <span class="tip">美化</span>
        </li>
        <li
            :class="{active:currentSelect === 'replace'}"
            class="bs bs-replace"
            @click="replace('image')"
        >
            <i class="eqf-image-l" />
            <span class="tip">替换</span>
        </li>
        <!-- <li
            v-if="!expressMode"
            class="bs bs-set2bg"
            @click="set2bg"
        >
            设为背景
        </li> -->
    </ul>
</template>

<script>
import expressType from '../../../../config/enum.express.type'
import IndexMatting from '../../../pages/aimatting/IndexMatting.vue'
import AIMattingMode from '../../../../config/enum.aiMattingMode.type'
import PhotoIndex from '../../../../photo/vue/pages/photo/Index.vue'
import PhotoMode from '../../../../config/enum.photoMode.type'
import util from '../../../../utils/util'
import { host } from '../../../../config/env'
import statistic from '../../../../config/statistic'

export default {
    props: {
        model: {
            type: Object,
            default: null
        },
        modelKey: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            expressType,
            currentSelect: ''
        }
    },
    computed: {
        scene() {
            return this.$store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        eqxElementsSelected() {
            return this.scene.eqxElementsSelected
        },
        eqxElement() {
            return this.eqxElementsSelected[0]
        },
        showBaseImageEditor() {
            // return this.user.allow('baseImageEditor')
            return true
        },
        expressMode() {
            return this.scene.expressMode
        },
        nav() {
            return this.$store.state.layout.nav
        }
    },
    watch: {

    },
    mounted() {

    },
    methods: {
        mattingImage() {
            this.currentSelect = 'matting'
            const property = this.eqxElement.elementJson.property
            const src = property.src
            if (src) {
                Vue.store.commit('AIMATTING_MATTING_IMAGE', src)
                const options = {
                    component: IndexMatting,
                    data: {
                        mode: AIMattingMode.setting,
                        zIndex: 104
                    }
                }
                this.slide.open(options)
                    .then((res) => {
                        this.currentSelect = ''
                        if (res && res.key) {
                            property.src = res.key
                            if (property.crop) {
                                delete property.crop
                            }
                            this.eqxElement.updateProperty(property)
                        }
                    })
                    .catch((err) => {
                        err && this.logger.error(err)
                        this.currentSelect = ''
                    })
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.AIMATTING,
                    statistic.opt_label.AIMATTING.clickSetting])
            }
        },
        cropImage() {
            this.currentSelect = 'crop'
            const { css, property } = this.eqxElement.elementJson
            const oldWidth = parseInt(css.width)
            const oldHeight = parseInt(css.height)
            const oldRatio = oldWidth / oldHeight
            const options = {
                ratio: oldRatio,
                src: property.src,
                crop: property.crop,
                hideOptions: false,
                rotateX: Object.prototype.hasOwnProperty.call(property, 'rotateX') && property.rotateX,
                rotateY: Object.prototype.hasOwnProperty.call(property, 'rotateY') && property.rotateY
            }
            this.dialog.openImageCrop(options)
                .then(result => {
                    this.currentSelect = ''
                    const { selectedRatio, crop } = result
                    this.eqxElement.updateProperty({
                        crop
                    })
                    if (selectedRatio === 'fixed') {
                        // 不用处理
                    } else {
                        let newWidth = 0
                        let newHeight = 0
                        const newRatio = crop.width / crop.height

                        // 基于原来的最大边处理，所以多次裁切后的的图片会越来越小
                        if (oldRatio > newRatio) {
                            newHeight = oldHeight
                            newWidth = Math.round(newHeight * newRatio)
                        } else {
                            newWidth = oldWidth
                            newHeight = Math.round(newWidth / newRatio)
                        }
                        this.eqxElement.updateCss({
                            width: newWidth + 'px',
                            height: newHeight + 'px'
                        })
                    }
                    this.eqxPage.eqxHistory.add(this.eqxPage)
                })
                .catch(err => {
                    err && this.logger.error(err)
                    this.currentSelect = ''
                })
        },
        set2bg() {
            const { property } = this.eqxElement.elementJson
            const src = property.src
            const { width, height } = this.eqxPage.eqxScene.sceneJson
            const options = {
                ratio: width / height,
                src,
                hideOptions: true,
                type: 'background',
                rotateX: Object.prototype.hasOwnProperty.call(property, 'rotateX') && property.rotateX,
                rotateY: Object.prototype.hasOwnProperty.call(property, 'rotateY') && property.rotateY
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
        },
        replace() {
            this.currentSelect = 'replace'
            this.dialog.openMaterialLib()
                .then(res => {
                    this.currentSelect = ''
                    if (res && res.success) {
                        Vue.api.file.getImageInfo(res.path).then(data => {
                            if (data.data.format === 'gif') {
                                Vue.notifier.fail('gif文件不能被替换')
                            } else {
                                const property = this.eqxElement.elementJson.property
                                property.src = res.path
                                if (property.crop) {
                                    delete property.crop
                                }
                                this.eqxElement.updateProperty(property)
                            }
                        })
                    }
                })
                .catch(err => {
                    this.currentSelect = ''
                    err && this.logger.error(err)
                })
        },
        base() {
            this.currentSelect = 'base'
            const property = this.eqxElement.elementJson.property
            const src = property.src.split('?')[0]
            if (src) {
                util.getBase64ImageWithSize(host.file + src).then(res => {
                    const options = {
                        component: PhotoIndex,
                        data: {
                            mode: PhotoMode.setting,
                            zIndex: 104
                        }
                    }
                    const eqxElement = this.eqxElement
                    const eqxElementJsonCss = eqxElement.elementJson.css
                    this.slide.open(options)
                        .then((res) => {
                            this.currentSelect = ''
                            if (res && res.key) {
                                property.src = res.key
                                if (property.crop) {
                                    delete property.crop
                                }
                                eqxElement.updateProperty(property)
                                const originWidth = parseInt(eqxElementJsonCss.width)
                                const originHeight = parseInt(eqxElementJsonCss.height)
                                const originRatio = originWidth / originHeight
                                const newWidth = res.width
                                const newHeight = res.height
                                const newRatio = newWidth / newHeight
                                let width, height
                                if (originRatio > newRatio) {
                                    height = originHeight
                                    width = height * newRatio
                                } else {
                                    width = originWidth
                                    height = width / newRatio
                                }
                                eqxElementJsonCss.width = width + 'px'
                                eqxElementJsonCss.height = height + 'px'
                                eqxElement.updateCss(eqxElementJsonCss)
                                this.eqxElementsSelected.length && this.$store.commit('ELEMENT_SELECT', { eqxElements: [] })
                                this.eqxPage.clearElementsSelected()
                                this.eqxPage.eqxHistory.add(this.eqxPage)
                            }
                        })
                        .catch((err) => {
                            err && this.logger.error(err)
                            this.currentSelect = ''
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
        }
    }
}
</script>

<style lang="scss">
.eqc-setting-image-base-tool {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
    padding: 4px 16px 16px;
    border-bottom: 1px solid #ccd5db;
    > li {
        margin-top: 12px;
        &:nth-child(odd) {
            margin-right: 12px;
        }
    }
    .bs {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 70px;
        height: 30px;
        border: 1px solid #ccd5db;
        background: #fff;
        transition: all 0.3s;
        font-size: 16px;
        cursor: pointer;
        .tip {
            margin-left: 6px;
            font-size: 12px;
        }
        &:hover {
            color: $blue-normal;
        }
    }
    .bs-set2bg {
        font-size: 12px;
    }
    .active {
        background: #1593ff;
        color: #ffffff;
        &:hover {
            background: #1593ff;
            color: #ffffff;
        }
    }
}
</style>
