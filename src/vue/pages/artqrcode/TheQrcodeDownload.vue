<template>
    <div class="eqc-qrcode-export">
        <div
            class="preview-container"
        >
            <img
                :style="getQrcodeImgStyle"
                :src="getQrcodeImgUrl"
            >
        </div>
        <div class="export-setting">
            <div class="head">
                <label>二维码下载</label>
                <i
                    class="close eqf-no"
                    @click="redo"
                />
            </div>
            <div class="price-card-box">
                <price-card ref="priceCard" />
            </div>
            <div class="export">
                <div class="export-btns">
                    <base-button
                        :class="['white','h20','export-to-phone',showExportToPhone?'disable':'']"
                        @click.native="exportToPhone"
                    >
                        下载到手机
                    </base-button>
                    <base-button
                        class="white h20 export-to-h5"
                        @click.native="exportH5"
                    >
                        <span>图片库</span>
                        <i
                            class="icon why eqf-why-f"
                            @mouseover="showNotice(0)"
                            @mouseleave="hideNotice"
                        />
                        <div
                            class="time-limit-free"
                        >
                            限免
                        </div>
                    </base-button>
                </div>
                <base-button
                    :class="['export-pc',showExportToPhone?'disable':'']"
                    @click.native="exportPcPay"
                >
                    下载到电脑
                </base-button>
            </div>
        </div>
        <head-notice
            v-show="showNoticeState"
            :option="noticeOption"
            :type="noticeType"
            style="z-index:1;"
        />
        <export-to-phone
            ref="exportToPhone"
            :url-arr="null"
            :scene-json-out="selectedItem.qrcodeSceneJson"
            @onClose="exportToPhoneClose"
        />
    </div>
</template>

<script>
import priceCard from '../../plugins/priceCard.vue'
import HeadNotice from '../../pages/create/head/HeadNotice.vue'
import artQrcodeMode from '../../../config/enum.artQrcodeMode.type'
import statistic from '../../../config/statistic'
import imgToBase64 from '../../../utils/imgToBase64'
import { dataURL2Blob } from '../../../utils/blob'
import util from '../../../utils/util'
import ExportToPhone from '../create/head/ExportToPhone.vue'
import artQrcodeTemplateType from '../../../config/enum.artQrcodeTemplate.type'
import elementType from '../../../config/enum.element.type'
import qrcodeTypeConfig from '../../../config/enum.qrcode.type'
import EqxScene from '../../../core/scene'

export default {
    components: {
        priceCard,
        HeadNotice,
        ExportToPhone
    },
    props: {
        mode: {
            type: Number,
            default: null
        },
        back: {
            type: Function,
            default: null
        }
    },
    data() {
        return {
            artQrcodeMode,
            showNoticeState: false,
            noticeType: 0,
            noticeOption: {
                right: 256,
                bottom: 14
            },
            showExportToPhone: false// 是否显示导出到手机二维码
        }
    },
    computed: {
        layout() {
            return Vue.store.state.layout
        },
        scene() {
            return Vue.store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        scale() {
            return this.eqxPage.scale
        },
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        qrcode() {
            return Vue.store.state.artQrcode
        },
        // 当前导航栏
        nav() {
            return this.qrcode.qrcodeNav
        },
        // 当前左侧选中的二维码的类型
        selectedItem() {
            return this.nav.selectedItem
        },
        // 当前选择模板的类型
        selectedTemplateType() {
            return this.qrcode.selectedTemplateType
        },
        getQrcodeImgUrl() {
            return `${Vue.env.host.file + this.selectedItem.qrcodeKey}`
        },
        getQrcodeImgStyle() {
            const qrcodeKey = this.selectedItem.qrcodeKey
            if (qrcodeKey === null || qrcodeKey === '') {
                return ''
            }
            if ([artQrcodeTemplateType.square].includes(this.selectedItem.qrcodeTemplateType)) {
                return 'background-color:#ffffff;width:384px;'
            } else {
                return 'height:460px;width:356px;'
            }
        },
        // 7,8,9 Vip
        vipMemberAuth() {
            return this.userInfo && ([7, 8, 9].includes(this.userInfo.memberType) || (this.userInfo.members && this.userInfo.members.some(item => [7, 8, 9].includes(item.memberId))))
        },
        // 营销云 vip
        yinxiaoVipMemberAuth() {
            return this.userInfo.members && this.userInfo.members.some(item => [202, 203, 204].includes(item.memberId))
        },
        // 创意 vip
        chuangyiVipMemberAuth() {
            return this.userInfo.members && this.userInfo.members.some(item => [14].includes(item.memberId))
        },
        // 是否是会员
        isMember() {
            return this.vipMemberAuth || this.yinxiaoVipMemberAuth || this.chuangyiVipMemberAuth
        }
    },
    mounted() {
    },
    methods: {
        redo() {
            this.back()
        },
        showNotice(type) {
            this.noticeType = type
            this.showNoticeState = true
        },
        hideNotice() {
            this.showNoticeState = false
        },
        // 导出到手机
        exportToPhone() {
            if (this.showExportToPhone) {
                return
            }
            const urlArr = []
            urlArr.push({
                path: this.selectedItem.qrcodeKey,
                noWaterPath: this.selectedItem.qrcodeKey.split('?')[0]
            })
            this.$refs.exportToPhone.setUrlArr(urlArr)
            if (this.isMember) {
                this.showExportToPhone = true
                this.$refs.exportToPhone.open()
            } else {
                this.$refs.priceCard.pay().then(res => {
                    if (res.success) {
                        this.showExportToPhone = true
                        if (res.waterMark) { // 用户选择下载带水印的
                            this.$refs.exportToPhone.open(true, false)
                        } else {
                            res.callback()
                            this.$refs.exportToPhone.open()
                        }
                    }
                })
            }
            this.createProduct()
        },
        exportToPhoneClose() {
            this.showExportToPhone = false
        },
        // 导出到图片库
        exportH5() {
            if (this.selectedItem.qrcodeTemplate === null) {
                return
            }
            this.loading.open('导出中...')
            const urlArr = [{
                extName: 'png',
                path: this.selectedItem.qrcodeKey.split('?')[0],
                name: this.selectedItem.qrcodeKey.split('?')[0],
                tmbPath: this.selectedItem.qrcodeKey.split('?')[0]
            }]
            Vue.api.file.saveToH5(Vue.env.h5TagId, urlArr, this.selectedItem.qrcodeSceneJson.id)
                .then((res) => {
                    this.tracker('lib', false)
                    window._hmt.push(['_trackEvent',
                        statistic.category.F,
                        statistic.action.ARTQRCODE,
                        statistic.opt_label.ARTQRCODE.h5])
                    this.loading.close()
                    this.notifier.info('导出成功，刷新H5素材库可查看')
                })
                .catch(err => {
                    err && this.logger.error(err)
                    this.loading.close()
                    this.notifier.fail('服务器异常，请稍后重试')
                })
        },
        // 导出到电脑支付
        exportPcPay() {
            if (this.showExportToPhone) {
                return
            }
            if (this.selectedItem.qrcodeTemplate === null) {
                this.exportPc(false)
            } else {
                this.$refs.priceCard.pay().then(res => {
                    if (res.success) {
                        this.exportPc(res.waterMark, res.merchantOrderNo).then(() => {
                            res.callback()
                        })
                    }
                })
            }
            this.createProduct()
        },
        // 导出到电脑
        exportPc(pWaterMark, orderId = '') {
            return new Promise((resolve, reject) => {
                if (this.selectedItem.qrcodeSceneJson && this.selectedItem.qrcodeSceneJson.id) {
                    this.tracker('local', pWaterMark, orderId)
                }
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.ARTQRCODE,
                    statistic.opt_label.ARTQRCODE.exp])
                let key = this.selectedItem.qrcodeKey
                // 去水印
                if (!pWaterMark) {
                    key = key.split('?')[0]
                }
                const fileUrl = Vue.env.host.file + key
                const fileName = '轻设计_二维码'
                if ([artQrcodeTemplateType.dynamic].includes(this.selectedItem.qrcodeTemplateType)) {
                    util.downloadGifFile(fileName + '.gif', fileUrl)
                    resolve()
                } else {
                    imgToBase64(fileUrl).then(base64Str => {
                        const url = URL.createObjectURL(dataURL2Blob(base64Str))
                        util.downloadFile(fileName + '.png', url)
                        resolve()
                    })
                }
            })
        },
        /**
         * opType: local:下载到本地 lib:导出到素材库
         * enableResolution: 是否获取分辨率设置
         */
        tracker(opType = 'local', needWatermark, hasOrderId = '') {
            const wm = needWatermark ? 1 : 0
            const orderId = needWatermark ? 'null' : hasOrderId
            const ed = `op_type=${opType}&file_type=image&extension=PNG&resolution=原图&is_watermark=${wm}&order_id=${orderId}`
            const loc = opType === 'local' ? '二维码-导出作品-导出到电脑' : '二维码-导出作品-导出到H5素材库'
            const params = {
                // 产品线缩写
                product: 'print',
                // 业务线类型
                b_t: 'download',
                // 事件分类
                cat: 'download',
                // 图片类型
                img_type: 'PNG',
                // 用户id
                u_i: this.userInfo.id,
                // 元素事件
                e_t: 'element_click',
                // 作品id`
                works_id: this.selectedItem.qrcodeSceneJson.id + '',
                // 作品创建者id
                w_u: this.userInfo.id,
                // 下载位置
                loc,
                // 来源端
                f_p: 'PC',
                // 其他参数
                e_d: ed,
                // 新增act 与opType 相同
                act: opType,
                // 时长 固定传0
                dur: 0
            }
            window._tracker_api_ && window._tracker_api_.report(params)

            const useData = {
                printId: this.selectedItem.qrcodeSceneJson.id,
                operateType: 1, // 1:下载
                resolutionType: 3,
                watermarkType: needWatermark ? 1 : 2,
                fileFormat: 'png'
            }
            Vue.api.scene.saveWorkUseInfo(useData)
        },
        /**
         * 创建作品
         */
        createProduct(pStyle, qrCodeTemplateType, key, inputContent, qrcodeType) {
            if (this.mode !== artQrcodeMode.tool || this.selectedItem.qrcodeTemplate === null) {
                return
            }
            pStyle = this.selectedItem.qrcodeTemplate
            qrCodeTemplateType = this.selectedItem.qrcodeTemplate.templateType
            key = this.selectedItem.qrcodeKey
            inputContent = this.selectedItem.qrcodeText
            qrcodeType = this.selectedItem.qrcodeType
            if (pStyle && pStyle !== null && pStyle.template) {
                const cacheData = this.$parent.downLoadCache[qrCodeTemplateType]
                if (cacheData) {
                    const { eqxScene, pageJson } = cacheData
                    if ([artQrcodeTemplateType.square].includes(qrCodeTemplateType)) {
                        // 修改二维码元素的值
                        this.updateElementByStyle(pageJson, pStyle, key, inputContent, qrcodeType)
                        // 修改cover的值 并且保存page
                        this.savePage(pageJson, key)
                    } else if ([artQrcodeTemplateType.dynamic, artQrcodeTemplateType.threeD].includes(qrCodeTemplateType)) {
                        // 更新pageJson中的elements 和 property
                        pageJson.elements = pStyle.pageJson.elements
                        pageJson.properties = pStyle.pageJson.properties
                        // 更新二维码的值
                        this.updateElementByStyle(pageJson, pStyle, key, inputContent, qrcodeType)
                        // 动态和立体  都走这儿
                        this.$store.dispatch('ART_PAGE_SAVE', { eqxPage: { eqxScene, pageJson } }).then(data => {
                            // 修改cover的值 并且保存page
                            this.savePage(pageJson, data.data.key)
                        }).catch(err => err && this.logger.error(err))
                    }
                } else {
                    // 创建新作品
                    const createStyle = 8
                    Vue.api.scene.addSceneByTemplate(pStyle.template.id, false, createStyle).then(res => {
                        Vue.store.commit('PRODUCT_ID', { productId: pStyle.template.id })
                        Vue.api.scene.getScene(res.data.obj + '', true).then(res2 => {
                            const eqxScene = new EqxScene(res2.data.obj)
                            Vue.store.commit('QRCODE_SCENE_JSON', eqxScene.sceneJson)
                            const pageJson = eqxScene.sceneJson.pages[0]
                            // 缓存 data
                            this.$emit('setDownLoadCache', qrCodeTemplateType, { eqxScene, pageJson })
                            if ([artQrcodeTemplateType.square].includes(qrCodeTemplateType)) {
                                // 修改二维码元素的值
                                this.updateElementByKey(pageJson, key, inputContent, qrcodeType)
                                // 修改cover的值 并且保存page
                                this.savePage(pageJson, key)
                            } else if ([artQrcodeTemplateType.dynamic, artQrcodeTemplateType.threeD].includes(qrCodeTemplateType)) {
                                // 修改二维码元素的值
                                this.updateElementByKey(pageJson, key, inputContent, qrcodeType)
                                // 动态和立体  都走这儿
                                this.$store.dispatch('ART_PAGE_SAVE', { eqxPage: { eqxScene, pageJson } }).then(data => {
                                    // 修改cover的值 并且保存page
                                    this.savePage(pageJson, data.data.key)
                                }).catch(err => err && this.logger.error(err))
                            }
                        })
                    })
                }
            }
        },
        // 更新艺术二维码元素
        updateElementByKey(pageJson, key, content, qrcodeType) {
            pageJson.elements.forEach(element => {
                if (element.type === elementType.qrcode) {
                    element.property.text = content
                    element.property.src = key
                    element.property.cover = key
                    element.property.qcType = qrcodeType
                    if (qrcodeType === qrcodeTypeConfig.card) {
                        const startIndex = content.indexOf('TEL')
                        const endIndex = content.indexOf('END')
                        const name = content.substr(19, startIndex - 2 - 19)
                        const phone = content.substr(startIndex + 15, endIndex - startIndex - 18)

                        element.property.card = {
                            name: name,
                            phone: phone
                        }
                    }
                }
            })
        },
        updateElementByStyle(pageJson, pStyle, key, content, qrcodeType) {
            pageJson.elements.forEach(element => {
                if (element.type === elementType.qrcode) {
                    element.css = pStyle.elementJson.css
                    element.property = pStyle.elementJson.property
                    element.type = pStyle.elementJson.type
                    element.property.text = content
                    element.property.src = key
                    element.property.cover = key
                    element.property.qcType = qrcodeType
                    if (qrcodeType === qrcodeTypeConfig.card) {
                        const startIndex = content.indexOf('TEL')
                        const endIndex = content.indexOf('END')
                        const name = content.substr(19, startIndex - 2 - 19)
                        const phone = content.substr(startIndex + 15, endIndex - startIndex - 18)

                        element.property.card = {
                            name: name,
                            phone: phone
                        }
                    }
                }
            })
        },
        savePage(pageJson, key) {
            pageJson.cover = key
            Vue.api.page.savePage(pageJson)
                .catch(err => {
                    err && Vue.logger.error(err)
                })
        }
    }
}
</script>

<style lang='scss'>
$width: calc(100% - 256px);
$height: calc(100%);
.eqc-qrcode-export {
    width: 100%;
    height: 100%;
    background: #303030;
    display: flex;
    position: relative;
    .preview-container {
        width: $width;
        height: 100%;
        float: left;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
            background-color: #ffffff;
        }
    }
    .export-setting {
        width: 256px;
        background: #ffffff;
        padding: 18px 24px 0px 24px;
        display: flex;
        flex-direction: column;
        position: relative;
        .head {
            width: 100%;
            height: 28px;
            font-size: 17px;
            font-weight: bold;
            color: rgba(17, 17, 17, 1);
            line-height: 28px;
            i.close {
                right: 0px;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 24px;
                height: 24px;
                font-size: 16px;
                color: #fff;
                background: #2f3c4d;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s;
                margin: 0px 0px 0px 0px;
                float: right;
                &:hover {
                    background: #ff2a6a;
                }
            }
        }
        .price-card-box {
            margin-top: 20px;
            flex: 1;
        }
        .export {
            height: auto;
            width: 256px;
            left: -24px;
            position: relative;
            .export-title {
                width: 100%;
                height: 20px;
                font-size: 14px;
                font-weight: 600;
                color: rgba(17, 17, 17, 1);
                line-height: 20px;
            }
            .export-btns {
                width: 100%;
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: space-between;
                align-items: center;
                border-top: 1px solid rgba(230, 235, 237, 1);
                padding: 14px 0px;
                .export-to-phone {
                    border-right: 1px solid rgba(230, 235, 237, 1) !important;
                    &.disable {
                        color: #999;
                        background: #ffffff;
                    }
                }
                .white {
                    width: 100%;
                    color: #2f3c4d;
                    position: relative;
                    border: 0px;
                    border-radius: 0;
                    cursor: pointer;
                    span {
                        margin-right: 8px;
                    }
                }
                .time-limit-free {
                    font-size: 12px;
                    background: #ff2a6a;
                    color: #fff;
                    padding: 2px 4px;
                    border-radius: 10px;
                    text-align: center;
                    position: absolute;
                    top: -23px;
                    right: 6px;
                }
            }
            .export-pc {
                width: 100%;
                height: 60px;
                font-size: 14px;
                font-weight: 400;
                background: rgba(21, 147, 255, 1);
                color: rgba(255, 255, 255, 1);
                cursor: pointer;
                &.disable {
                    color: #999;
                    background: #f7f8f9;
                }
                &.eqc-btn {
                    border-radius: 0px;
                }
            }
        }
    }
}
</style>
