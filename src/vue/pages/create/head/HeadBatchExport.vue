<template>
    <div class="eqc-batch-export">
        <div
            class="preview-container"
        >
            <template v-if="lodaPage">
                <div
                    id="container"
                    v-scroll-bar
                    class="picture-content"
                >
                    <ul
                        class="clearfix eqc-ul"
                    >
                        <li
                            v-for="(item, index) in pages"
                            :key="index"
                            class="li-style li-margin"
                        >
                            <div
                                :style="{backgroundImage: getPagePreviewBackgroundImage(item,168)}"
                                :class="['cover',`cover-${editorCount === 1 ? item.sort : (item[0].sort)}`]"
                            />
                            <div class="edit-mask">
                                <button @click="editPage(item)">
                                    编辑
                                </button>
                            </div>
                        </li>
                    </ul>
                </div>
            </template>
        </div>
        <div class="export-setting">
            <div class="setting-content">
                <div class="title">
                    导出作品
                    <i
                        class="back eqf-left"
                        @click="redo"
                    />
                </div>
                <div
                    class="format-content"
                >
                    <div class="format-text">
                        导出格式
                    </div>
                    <div class="format-setting">
                        <div
                            v-for="(item,index) of mode.list"
                            :key="index"
                        >
                            <base-radio
                                v-model="radioValue"
                                :class="{'disabled': exporting}"
                                :value="item.name"
                                name="exportFormat"
                                @change="chooseFormat(item)"
                            />
                            <label>{{ item.name }}</label>
                        </div>
                    </div>
                    <div class="price-card">
                        <price-card
                            ref="priceCard"
                            :is-batch-export="true"
                        />
                    </div>
                </div>
            </div>
            <div class="btns">
                <button
                    class="btn-back"
                    @click="redo"
                >
                    {{ continueaddtext }}
                </button>
                <button
                    class="btn-export"
                    @click="exportZipPay"
                >
                    导出
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { elementType } from '../../../../config/enum'
import delayLoad from '../../../../utils/delayLoad'
import EqxScene from '../../../../core/scene'
import EqxPage from '../../../../core/html/page'
import JSZip from 'jszip'
import util from '../../../../utils/util'
import statistic from '../../../../config/statistic'
import { dataURL2Blob } from '../../../../utils/blob'
import priceCard from '../../../plugins/priceCard.vue'
import qiniuWatermark from '../../../../utils/qiniuWatermark'
import waterMarker from '../../../../utils/watermarker'
import eqxiuMaskImg from '../../../../img/wm/eqxiumask.svg'

export default {
    components: {
        priceCard
    },
    props: {
        back: {
            type: Function,
            default: null
        },
        datarr: {
            type: Array,
            default: null
        },
        multifieldarray: {
            type: Array,
            default: null
        },
        continueaddtext: {
            type: String,
            default: '继续上传'
        }
    },
    data() {
        return {
            exporting: false,
            radioValue: 'JPG',
            mode: {
                list: [
                    {
                        name: 'JPG',
                        type: 'jpeg'
                    },
                    {
                        name: 'PNG',
                        type: 'png'
                    },
                    {
                        name: 'PDF',
                        type: 'pdf'
                    }
                ],
                selectedItem: {
                    name: 'JPG',
                    type: 'jpeg'
                }
            },
            pages: [],
            pagesOnServer: [],
            pagesBase64Arr: [],
            lodaPage: false,
            isGIFMode: false, // 是否是导出gif模式
            WATER_MARK_TEXT: '易企秀 轻设计 批量制作',
            eqxiuLogoImage: null
        }
    },
    computed: {
        scene() {
            return Vue.store.state.scene
        },
        eqxScene2() {
            return this.scene.eqxScene2
        },
        eqxPage2() {
            return this.scene.eqxPage2
        },
        eqxScene3() {
            return this.scene.eqxScene3
        },
        eqxPage3() {
            return this.scene.eqxPage3
        },
        editorCount() {
            return util.getBatchProductTemplateRelation().editorCount
        },
        userInfo() {
            return Vue.store.state.user.userInfo
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
        this.getEqxiuLogoImage().then(() => {
            this.init()
        })
    },
    methods: {
        getEqxiuLogoImage() {
            return new Promise((resolve, reject) => {
                const img = new Image()
                img.crossOrigin = 'anonymous'
                img.src = eqxiuMaskImg
                img.onload = () => {
                    this.eqxiuLogoImage = img
                    resolve()
                }
            })
        },
        chooseFormat(item) {
            this.radioValue = item.name
            this.mode.selectedItem = item
        },
        redo() {
            this.lodaPage = false
            this.back()
        },
        init() {
            Vue.store.commit('WATERMARK_COVER_CHANGE', true)
            Vue.store.commit('CLEAR_CACHE_IMAGE')
            this.pages = []
            this.pagesBase64Arr = []
            const promise = new Promise((resolve, reject) => {
                const asFileNameKey = this.getAsFileNameField()
                // 遍历多字段数据
                this.datarr.forEach((item, index) => {
                    // 整体promise
                    const promiseArr = []
                    // 页面promise
                    const page2CanvasPromiseArr = []
                    let fileName
                    // 编辑器个数
                    const editorCount = this.editorCount
                    const pageJsonArr = []
                    for (let i = 0; i < editorCount; i++) {
                        let { pageJson, eqxScene } = i === 0 ? this.eqxPage2 : this.eqxPage3
                        // 深拷贝
                        pageJson = JSON.parse(JSON.stringify(pageJson))
                        pageJson.elements.forEach(element => {
                            Object.keys(item).forEach(key => {
                                if (element.property.markLabel === key) {
                                    if (element.type === elementType.text) {
                                        element.property.content = item[key]
                                    } else if (element.type === elementType.image) {
                                        element.property.src = item[key]
                                    }
                                }
                            })
                        })
                        // 过滤掉没有路径的image元素
                        pageJson.elements = pageJson.elements.filter(element => {
                            let result = true
                            if (element.type === elementType.image) {
                                if (element.property.src === null || element.property.src === '') {
                                    result = false
                                } else {
                                    // 如果元素未显示但是是批量元素则显示出来
                                    if (element.css.display === 'none') {
                                        const multiFieldResult = this.multifieldarray.filter(multiField => {
                                            return multiField.name === element.property.markLabel
                                        })
                                        if (multiFieldResult.length > 0) {
                                            element.css.display = 'block'
                                        }
                                    }
                                }
                            }
                            return result
                        })
                        // 获取文件名称
                        if (asFileNameKey !== null) {
                            for (const key in item) {
                                if (key === asFileNameKey) {
                                    fileName = item[key]
                                    break
                                }
                            }
                        } else {
                            fileName = '易企秀轻设计制作'
                        }
                        pageJson.id = 1
                        pageJson.sort = index + 1
                        pageJson.index = index
                        pageJson.type = this.eqxScene2.sceneJson.type
                        pageJson.height = this.eqxScene2.sceneJson.height
                        pageJson.width = this.eqxScene2.sceneJson.width
                        pageJson.unit = this.eqxScene2.sceneJson.unit
                        pageJson.title = fileName
                        const eqxSceneNew = new EqxScene(JSON.parse(JSON.stringify(eqxScene.sceneJson)))
                        const eqxPageNew = new EqxPage(pageJson, eqxSceneNew)
                        const p = eqxPageNew.page2Canvas()
                        pageJsonArr.push(pageJson)
                        page2CanvasPromiseArr.push(p)
                    }
                    const uploadTokenPromise = this.api.file.getUploadToken()
                    // 1.获取上传token promise
                    promiseArr.push(uploadTokenPromise)
                    // 2.传递文件名称参数 promise
                    promiseArr.push(Promise.resolve(fileName))
                    // 3.pageJsonArr promise 一个或多个
                    // 4.page2Canvas promise 一个或多个
                    promiseArr.push(pageJsonArr[0])
                    promiseArr.push(page2CanvasPromiseArr[0])
                    if (editorCount === 2) {
                        promiseArr.push(pageJsonArr[1])
                        promiseArr.push(page2CanvasPromiseArr[1])
                    }
                    Promise.all(promiseArr)
                        .then((res) => {
                            const returnPromiseAllArr = []
                            const token = res[0]
                            const fileName = res[1]
                            const page1Json = res[2]
                            // 无水印jpg
                            const page1Base64Str = res[3].toDataURL('image/jpeg', 1.0).split(',')[1]
                            // 无水印png
                            const page1Base64Str2 = res[3].toDataURL().split(',')[1]
                            returnPromiseAllArr.push(Promise.resolve(fileName))// 文件名称
                            returnPromiseAllArr.push(Promise.resolve(page1Json))// page1Json
                            returnPromiseAllArr.push(Promise.resolve(page1Base64Str))// 第一页无水印jpg base64
                            returnPromiseAllArr.push(Promise.resolve(page1Base64Str2))// 第一页无水印png base64
                            returnPromiseAllArr.push(Promise.resolve(waterMarker.logoMarkToImage(res[3], 'image/jpeg', this.eqxiuLogoImage)))// 第一页有水印jpg base64
                            returnPromiseAllArr.push(Promise.resolve(waterMarker.logoMarkToImage(res[3], '', this.eqxiuLogoImage)))// 第一页有水印png base64
                            returnPromiseAllArr.push(this.api.file.uploadBase64(page1Base64Str, token))// 第一页上传cover之后得到的key
                            if (editorCount === 2) {
                                const page2Json = res[4]
                                // 无水印jpg
                                const page2Base64Str = res[5].toDataURL('image/jpeg', 1.0).split(',')[1]
                                // 无水印png
                                const page2Base64Str2 = res[5].toDataURL().split(',')[1]
                                returnPromiseAllArr.push(Promise.resolve(page2Json))// page2Json
                                returnPromiseAllArr.push(Promise.resolve(page2Base64Str))// 第二页无水印jpg base64
                                returnPromiseAllArr.push(Promise.resolve(page2Base64Str2))// 第二页无水印png base64
                                returnPromiseAllArr.push(Promise.resolve(waterMarker.logoMarkToImage(res[5], 'image/jpeg', this.eqxiuLogoImage)))// 第二页有水印jpg base64
                                returnPromiseAllArr.push(Promise.resolve(waterMarker.logoMarkToImage(res[5], '', this.eqxiuLogoImage)))// 第二页有水印png base64
                                returnPromiseAllArr.push(this.api.file.uploadBase64(page2Base64Str, token))// 第二页上传cover之后得到的key
                            }
                            return Promise.all(returnPromiseAllArr)
                        })
                        .then(([fileName, page1Json, page1Base64Str, page1Base64Str2, page1Base64StrWithWM, page1Base64Str2WithWM, page1Res, page2Json, page2Base64Str, page2Base64Str2, page2Base64StrWithWM, page2Base64Str2WithWM, page2Res]) => {
                            const page1Cover = page1Res.data.key
                            const page2Cover = page2Base64Str ? page2Res.data.key : null
                            if (editorCount === 1) {
                                page1Json.cover = page1Cover
                                this.pages.push(page1Json)
                            } else if (editorCount === 2) {
                                page1Json.cover = page1Cover
                                page2Json.cover = page2Cover
                                this.pages.push([page1Json, page2Json])
                            }
                            this.pagesBase64Arr.push({
                                fileName, // 文件名称
                                page1Cover, // 第一页cover key
                                page1Base64Str, // 第一页jpg格式的base64
                                page1Base64Str2, // 第一页png格式的base64
                                page1Base64StrWithWM, // 第一页jpg格式的base64 带水印
                                page1Base64Str2WithWM, // 第一页png格式的base64 带水印
                                page2Cover, // 第二页cover key
                                page2Base64Str: page2Base64Str || null, // 第二页jpg格式的base64
                                page2Base64Str2: page2Base64Str2 || null, // 第二页png格式的base64
                                page2Base64StrWithWM: page2Base64StrWithWM || null, // 第二页jpg格式的base64 带水印
                                page2Base64Str2WithWM: page2Base64Str2WithWM || null// 第二页png格式的base64 带水印
                            })
                            this.loading.close()
                            this.loading.open(`作品生成中 ${this.pages.length}/${this.datarr.length}`)
                            if (this.pages.length === this.datarr.length) {
                                this.lodaPage = true
                                this.loading.close()
                                resolve(this.pages)
                            }
                        })
                        .catch(err => reject(err))
                })
            })
            promise
                .then(pages => {
                    this.loading.open('正在保存')
                    pages.map((v, i) => {
                        v.sourceId = Vue.store.state.product.productId
                    })
                    return this.editorCount === 1 ? this.api.scene.massProduction(pages) : this.api.scene.massProductionMultipage(pages)
                })
                .then(res => {
                    this.pagesOnServer = res.data.list
                    this.lodaPage = true
                    this.loading.close()
                    Vue.store.commit('WATERMARK_COVER_CHANGE', false)
                })
                .catch(err => {
                    err && Vue.logger.error(err)
                    this.loading.close()
                })
        },
        // 编辑页面
        editPage(pPages) {
            const pageResult = this.pagesOnServer.filter(item => {
                return this.editorCount === 1 ? pPages.sort === item.pages[0].sort : pPages[0].sort === item.pages[0].sort
            })
            if (pageResult.length > 0) {
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.BATCH,
                    statistic.opt_label.BATCH.editProduct])
                const id = this.editorCount === 1 ? pageResult[0].id : pageResult[0].id
                window.open(`../../../create/${id}`, '_blank')
            } else {
                this.notifier.warn('没有批量数据，请添加后重试')
            }
        },
        // 获取页面预览背景  单页和双页 单页直接返回路径  双页拼接
        getPagePreviewBackgroundImage(pPages, pSize) {
            if (this.editorCount === 1) {
                return this.getBackgroundImage(pPages, pSize)
            } else if (this.editorCount === 2) {
                const promiseArr = [Promise.resolve(pPages)]
                pPages.forEach(page => {
                    promiseArr.push(new Promise((resolve, reject) => {
                        const img = new Image()
                        img.crossOrigin = 'Anonymous'
                        img.src = this.getBackgroundImageAbsoluteUrl(page.cover, pSize)
                        img.onload = function () {
                            resolve(img)
                        }
                    }))
                })
                Promise.all(promiseArr).then(([pages, img1, img2]) => {
                    Promise.all([Promise.resolve(pages), util.join2Image(img1, img2, 6)])
                        .then(([pages, imageBase64]) => {
                            document.querySelector(`.cover-${pages[0].sort}`).style.backgroundImage = `url(${imageBase64})`
                        })
                })
            }
        },
        // 获取背景图
        getBackgroundImage(pages, size) {
            let src
            if (this.isMember) {
                src = Vue.filter('qiniuZoom')(pages.cover, size)
            } else {
                const waterCover = pages.cover + qiniuWatermark.getLogoWaterMark('')
                src = Vue.filter('qiniuZoom')(waterCover, size)
            }
            const result = Vue.filter('backgroundImage')(src)
            return result
        },
        // 获取背景图片的绝对路径
        getBackgroundImageAbsoluteUrl(src, size) {
            src = Vue.filter('qiniuZoom')(src, size)
            return Vue.filter('backgroundImageAbsoluteUrl')(src)
        },
        // 导出压缩包支付
        exportZipPay() {
            this.$refs.priceCard.pay().then(res => {
                if (res.success) {
                    this.exportZip(res.waterMark, res.merchantOrderNo).then(() => {
                        res.callback()
                    })
                }
            })
        },
        tracker(needWatermark, hasOrderId = '') {
            let downloadType = 'PNG'
            if (this.mode.selectedItem.type === 'jpeg') {
                downloadType = 'JPG'
            } else if (this.mode.selectedItem.type === 'pdf') {
                downloadType = 'PDF'
            }
            const loc = '导出作品-导出到电脑'
            const watermark = needWatermark ? 1 : 0
            const orderId = needWatermark ? 'null' : hasOrderId
            const ed = `op_type=local&file_type=image&extension=${downloadType}&resolution=原图&is_watermark=${watermark}&order_id=${orderId}`
            const params = {
                // 产品线缩写
                product: 'print',
                // 业务类型
                b_t: 'download',
                // 事件分类
                cat: 'download',
                // 图片类型
                img_type: downloadType,
                // 用户id
                u_i: this.userInfo.id,
                // 元素事件
                e_t: 'element_click',
                // 作品id
                works_id: this.scene.eqxScene2.sceneJson.id + '',
                // 作品创建者id
                w_u: this.userInfo.id,
                // 下载位置
                loc,
                // 来源端
                f_p: 'PC',
                // 其他参数
                e_d: ed,
                // 新增act 与opType 相同
                act: 'local',
                // 时长 固定传0
                dur: 0

            }
            window._tracker_api_ && window._tracker_api_.report(params)

            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.BATCH,
                statistic.opt_label.BATCH.export])

            const useData = {
                printId: this.scene.eqxScene2.sceneJson.id,
                operateType: 1, // 1:下载
                resolutionType: 3,
                watermarkType: needWatermark ? 1 : 2,
                fileFormat: downloadType.toLocaleLowerCase()
            }
            Vue.api.scene.saveWorkUseInfo(useData)
        },
        // 导出压缩包
        exportZip(pWaterMark, orderId = '') {
            return new Promise((resolve, reject) => {
                this.tracker(pWaterMark, orderId)
                const _self = this
                this.loading.open('正在生成压缩包')
                var zip = new JSZip()
                delayLoad.delayLoadJS(this.env.plugin.jsPDF).then(() => {
                    let repeatIndex = 1
                    this.pagesBase64Arr.forEach((item, index) => {
                        // 判断是否有重名
                        let fileName = item.fileName
                        for (let j = 0; j < this.pagesBase64Arr.length; j++) {
                            if (j !== index) {
                                if (this.pagesBase64Arr[j].fileName === fileName) {
                                    fileName += `_${repeatIndex++}`
                                    break
                                }
                            }
                        }
                        const editorCount = util.getBatchProductTemplateRelation().editorCount
                        if (this.mode.selectedItem.type !== 'pdf') {
                            if (editorCount === 1) {
                                if (this.mode.selectedItem.type === 'jpeg') {
                                    zip.file(fileName + '.' + this.mode.selectedItem.type, dataURL2Blob('data:image/' + this.mode.selectedItem.type + ';base64,' + (pWaterMark ? item.page1Base64StrWithWM : item.page1Base64Str)), { base64: true })
                                } else if (this.mode.selectedItem.type === 'png') {
                                    zip.file(fileName + '.' + this.mode.selectedItem.type, dataURL2Blob('data:image/' + this.mode.selectedItem.type + ';base64,' + (pWaterMark ? item.page1Base64Str2WithWM : item.page1Base64Str2)), { base64: true })
                                }
                            } else if (editorCount === 2) {
                                if (this.mode.selectedItem.type === 'jpeg') {
                                    zip.file(fileName + '_正.' + this.mode.selectedItem.type, dataURL2Blob('data:image/' + this.mode.selectedItem.type + ';base64,' + (pWaterMark ? item.page1Base64StrWithWM : item.page1Base64Str)), { base64: true })
                                    zip.file(fileName + '_反.' + this.mode.selectedItem.type, dataURL2Blob('data:image/' + this.mode.selectedItem.type + ';base64,' + (pWaterMark ? item.page2Base64StrWithWM : item.page2Base64Str)), { base64: true })
                                } else if (this.mode.selectedItem.type === 'png') {
                                    zip.file(fileName + '_正.' + this.mode.selectedItem.type, dataURL2Blob('data:image/' + this.mode.selectedItem.type + ';base64,' + (pWaterMark ? item.page1Base64Str2WithWM : item.page1Base64Str2)), { base64: true })
                                    zip.file(fileName + '_反.' + this.mode.selectedItem.type, dataURL2Blob('data:image/' + this.mode.selectedItem.type + ';base64,' + (pWaterMark ? item.page2Base64Str2WithWM : item.page2Base64Str2)), { base64: true })
                                }
                            }
                        } else {
                            const direction = this.eqxScene2.sceneJson.width > this.eqxScene2.sceneJson.height ? 'l' : 'p'
                            // eslint-disable-next-line new-cap
                            let pdf = new jsPDF(direction, 'mm', [this.eqxScene2.sceneJson.width / 3.78, this.eqxScene2.sceneJson.height / 3.78])
                            pdf.addImage((pWaterMark ? item.page1Base64StrWithWM : item.page1Base64Str), 'jpg', 0, 0)
                            if (editorCount === 2) {
                                pdf = pdf.addPage()
                                pdf.addImage((pWaterMark ? item.page2Base64StrWithWM : item.page2Base64Str), 'jpg', 0, 0)
                            }
                            zip.file(fileName + '.' + this.mode.selectedItem.type, pdf.output('blob'))
                        }
                    })
                    zip.generateAsync({ type: 'blob' })
                        .then(function (content) {
                            const fileSaver = delayLoad.delayLoadJS(Vue.env.plugin.fileSaver)
                            Promise.all([fileSaver]).then(() => {
                            // eslint-disable-next-line
                            saveAs(content, `易企秀|轻设计_批量创建.zip`)
                                _self.loading.close()
                                resolve()
                            })
                        })
                })
            })
        },
        // 获取作为名称的字段
        getAsFileNameField() {
            const result = this.multifieldarray.filter(item => {
                return item.asFileName
            })
            if (result && result.length > 0) {
                return result[0].name
            } else {
                return null
            }
        }
    }
}
</script>

<style lang='scss'>
$width: calc(100% - 256px);
$height: calc(100%);
.eqc-batch-export {
    width: 100%;
    height: 100%;
    background: rgba(204, 213, 219, 1);
    display: flex;
    position: relative;
    .preview-container {
        width: $width;
        height: 100%;
        float: left;
        .picture-content {
            overflow: auto;
            position: relative;
            padding: 0 24px;
            height: $height;
            width: 100%;
            background: #ccd5db;
            .eqc-ul {
                padding-bottom: 24px;
            }
            .li-margin {
                margin-top: 24px;
            }
            .li-style {
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                position: relative;
                height: 184px;
                width: 184px;
                float: left;
                background: #eceef0;
                transition: all 0.3s;
                &:hover {
                    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
                }
                &.active {
                    background: #eceef0;
                    .check {
                        background: $blue-normal;
                    }
                }
                .cover {
                    position: relative;
                    width: 168px;
                    height: 168px;
                    background: no-repeat center/contain;
                }
                .edit-mask {
                    display: none;
                    width: 184px;
                    height: 184px;
                    position: absolute;
                    justify-content: center;
                    align-items: center;
                    background: rgba(3, 3, 3, 0.6);
                    button {
                        width: 72px;
                        height: 36px;
                        background: rgba(21, 147, 255, 1);
                        border-radius: 3px;
                        font-size: 14px;
                        font-weight: 400;
                        color: rgba(255, 255, 255, 1);
                        cursor: pointer;
                    }
                }
                &:hover {
                    .edit-mask {
                        display: flex;
                    }
                }
            }
            @media screen and (max-width: 685px) {
                .li-margin {
                    &:not(:nth-child(n + 1)) {
                        margin-left: calc(100% - 184px);
                    }
                }
            }
            @media screen and (min-width: 686px) and (max-width: 890px) {
                .li-margin {
                    &:not(:nth-child(2n + 1)) {
                        margin-left: calc((100% - 184px * 2) / 1);
                    }
                }
            }
            @media screen and (min-width: 892px) and (max-width: 1049px) {
                .li-margin {
                    &:not(:nth-child(3n + 1)) {
                        margin-left: calc((100% - 184px * 3) / 2);
                    }
                }
            }
            @media screen and (min-width: 1050px) and (max-width: 1279px) {
                .li-margin {
                    &:not(:nth-child(4n + 1)) {
                        margin-left: calc((100% - 184px * 4) / 3);
                    }
                }
            }
            @media screen and (min-width: 1280px) and (max-width: 1499px) {
                .li-margin {
                    &:not(:nth-child(5n + 1)) {
                        margin-left: calc((100% - 184px * 5) / 4);
                    }
                }
            }
            @media screen and (min-width: 1500px) and (max-width: 1919px) {
                .li-margin {
                    &:not(:nth-child(6n + 1)) {
                        margin-left: calc((100% - 184px * 6) / 5);
                    }
                }
            }
            @media screen and (min-width: 1920px) {
                .li-margin {
                    &:not(:nth-child(8n + 1)) {
                        margin-left: calc((100% - 184px * 8) / 7);
                    }
                }
            }
        }
    }
    .export-setting {
        width: 256px;
        background: #ffffff;
        padding: 18px 24px 28px 24px;
        display: flex;
        flex-direction: column;
        position: relative;
        .setting-content {
            width: 100%;
            height: calc(100% - 136px);
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
        }
        .title {
            width: 100%;
            height: 28px;
            font-size: 17px;
            font-weight: bold;
            color: rgba(17, 17, 17, 1);
            line-height: 28px;
            margin-bottom: 18px;
            .back {
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
                float: right;
                &:hover {
                    background: #ff2a6a;
                }
            }
        }
        .format-blank {
            width: 100%;
            height: calc(100% - 28px - 32px - 48px - 28px - 112px - 189px);
        }
        // 价格板
        .price-card {
            width: 100%;
            height: auto;
        }
        .format-text {
            width: 100%;
            height: 20px;
            line-height: 20px;
            font-size: 14px;
            font-weight: bold;
            color: rgba(47, 60, 77, 1);
        }
        .format-setting {
            width: 100%;
            height: 48px;
            border-radius: 3px;
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: space-between;
            padding-right: 12px;
            align-items: center;
        }
        .btns {
            width: 256px;
            border-top: 1px solid rgba(230, 235, 237, 1);
            height: auto;
            position: absolute;
            bottom: 0px;
            left: calc(50% - 128px);
            button {
                width: 100%;
                height: 36px;
                font-size: 14px;
                font-weight: 400;
            }
            .btn-export {
                height: 60px;
                background: rgba(21, 147, 255, 1);
                color: rgba(255, 255, 255, 1);
            }
            .btn-back {
                background: rgba(255, 255, 255, 1);
                height: 48px;
                color: rgba(47, 60, 77, 1);
            }
        }
    }
}
</style>
