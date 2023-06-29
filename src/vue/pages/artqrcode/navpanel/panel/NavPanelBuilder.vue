<template>
    <div class="eqc-nav-artqrcode-builder">
        <label
            v-show="status===statusEnum.default"
            class="normal"
        >
            二维码预览区域
        </label>
        <div
            v-show="status===statusEnum.createing"
            class="createing"
        >
            <i class="eqf-loadingroll turn" />
            <label>正在生成中</label>
        </div>
        <div
            v-show="status===statusEnum.showNormalQrcode"
            :style="getQrcodeStyle"
            class="showQrcode"
        />
        <div
            v-show="status===statusEnum.showArtQrcode"
            :style="getQrcodeStyle"
            class="showQrcode"
        />
        <div
            v-show="status===statusEnum.error"
            class="error"
        >
            <i class="eqf-alert-f" />
            <label>生成失败，请重新生成</label>
        </div>
    </div>
</template>

<script>

import util from '../../../../../utils/util'
import Artqrcode from '../../../../../utils/initArtQrcode'
import EqxScene from '../../../../../core/scene'
import elementType from '../../../../../config/enum.element.type'
import qiniuWatermakr from '../../../../../utils/qiniuWatermark'
import artQrcodeMode from '../../../../../config/enum.artQrcodeMode.type'
import artQrcodeTemplateType from '../../../../../config/enum.artQrcodeTemplate.type'
import statistic from '../../../../../config/statistic'
import qrcodeTypeConfig from '../../../../../config/enum.qrcode.type'

export default {
    components: {

    },
    props: {
        mode: {
            type: Number,
            default: null
        },
        statusOut: {
            type: Number,
            default: null
        },
        qrcodeKeyOut: {
            type: String,
            default: null
        },
        qrcodeKeyStrOut: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            cache: {}, // 缓存 基础 立体 动态的数据
            statusEnum: {
                default: 100,
                createing: 101,
                showNormalQrcode: 200,
                showArtQrcode: 201,
                error: 999
            },
            status: 100,
            qrcodeKey: null,
            qrcodeKeyStr: '',
            qrcodeStyleIsCreateProduct: false,
            qrcodeSceneJson: null,
            qrcodePageJson: null // 用于保存页面
        }
    },
    computed: {
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
        },
        getQrcodeStyle() {
            if (this.qrcodeKey && this.qrcodeKey !== null && this.qrcodeKey !== '') {
                return `background-image:url("${Vue.env.host.file + this.qrcodeKey}")`
            } else if (this.qrcodeKeyStr !== '') {
                return `background-image:url("${this.qrcodeKeyStr}")`
            } else {
                return ''
            }
        },
        qrcode() {
            return Vue.store.state.artQrcode
        },
        // 当前模板选择类型
        selectedTemplateType() {
            return this.qrcode.selectedTemplateType
        },
        // 当前使用的模板
        qrcodeTemplateUse() {
            return this.qrcode.qrcodeTemplateUse
        },
        // 当前选中的二维码类型
        qrcodeType() {
            return this.qrcode.qrcodeNav.selectedItem.qrcodeType
        }
    },
    watch: {
    },
    created() {
        if (this.statusOut !== null) {
            this.status = this.statusOut
        }
        if (this.qrcodeKeyOut !== null) {
            this.qrcodeKey = this.qrcodeKeyOut
        }
        if (this.qrcodeKeyStrOut !== null) {
            this.qrcodeKeyStr = this.qrcodeKeyStrOut
        }
    },
    methods: {
        // 点击生成二维码按钮
        create(pInputContent, pStyle, pUserInputContent = '') {
            if (!util.login()) {
                return
            }
            let time = 10000
            if (this.selectedTemplateType !== '基础') {
                time = 40000 // 如果是动态或者立体 过期时间设置为30秒
            }
            return Promise.race([this.getArtCode(pInputContent, pStyle, this.qrcodeType), this.getArtQrcodeTimeOut(time)]).then(({ qrcodeKey, status }) => {
                this.qrcodeKey = qrcodeKey
                this.status = status
                Vue.store.commit('QRCODE_KEY', {
                    qrcodeKey: this.qrcodeKey,
                    qrcodeText: pInputContent,
                    qrcodeUserInput: pUserInputContent,
                    qrcodeTemplateType: this.qrcodeTemplateUse === null ? artQrcodeTemplateType.blackWhite : this.qrcodeTemplateUse.templateType
                })
            }).catch(() => {
                this.status = this.statusEnum.error
            })
        },
        // 获取艺术二维码
        getArtCode(pInputContent, pStyle, qrcodeType) {
            return new Promise((resolve, reject) => {
                if (pInputContent === '') {
                    return
                }
                this.status = this.statusEnum.createing
                let qrCodeTemplateType
                if (!pStyle || pStyle === null) {
                    pStyle = {
                        elementJson: { property: { text: pInputContent } }
                    }
                    // 黑白二维码
                    qrCodeTemplateType = artQrcodeTemplateType.blackWhite
                } else {
                    this.qrcodeStyle = pStyle
                    pStyle.elementJson.property.text = pInputContent
                    qrCodeTemplateType = pStyle.templateType
                }
                // 设置二维码的类型 便于生成短连接
                pStyle.elementJson.property.qcType = qrcodeType
                Artqrcode.getArtQrcodeByJson(pStyle.elementJson, false, qrCodeTemplateType).then((key) => {
                    // 百度统计埋点 begin
                    let optLabel = null
                    if (qrCodeTemplateType === artQrcodeTemplateType.square) {
                        optLabel = statistic.opt_label.ARTQRCODE.buildSquare
                    } else if (qrCodeTemplateType === artQrcodeTemplateType.threeD) {
                        optLabel = statistic.opt_label.ARTQRCODE.buildThreeD
                    } else if (qrCodeTemplateType === artQrcodeTemplateType.dynamic) {
                        optLabel = statistic.opt_label.ARTQRCODE.buildDynamic
                    }
                    if (optLabel !== null) {
                        window._hmt.push(['_trackEvent',
                            statistic.category.F,
                            statistic.action.ARTQRCODE,
                            optLabel])
                    }
                    // 百度统计埋点 end

                    let qrcodeKey, status
                    if (qrCodeTemplateType !== artQrcodeTemplateType.blackWhite && !this.isMember) {
                        // 艺术二维码 && 非会员
                        qrcodeKey = qiniuWatermakr.getLogoWaterMark(key)
                        status = this.statusEnum.showArtQrcode
                    } else {
                        // 黑白二维码
                        qrcodeKey = key
                        status = this.statusEnum.showNormalQrcode
                    }
                    // 黑白二维码 || 方形二维码
                    if ([artQrcodeTemplateType.blackWhite, artQrcodeTemplateType.square].includes(qrCodeTemplateType)) {
                        resolve({ qrcodeKey, status })
                    }
                    // 黑白二维码end
                    if ([artQrcodeTemplateType.blackWhite].includes(qrCodeTemplateType)) {
                        return
                    }
                    this.createProduct(pStyle, qrCodeTemplateType, qrcodeKey, pInputContent, qrcodeType).then(data => {
                        // 动态二维码 || 立体二维码
                        if (data && [artQrcodeTemplateType.dynamic, artQrcodeTemplateType.threeD].includes(qrCodeTemplateType)) {
                            // 非会员 添加水印
                            if (!this.isMember) {
                                data.qrcodeKey = qiniuWatermakr.getLogoWaterMark(data.qrcodeKey)
                            }
                            resolve(data)
                        }
                    })
                }).catch((e) => {
                    reject()
                })
            })
        },
        // 生成艺术二维码超时
        getArtQrcodeTimeOut(pMs) {
            return new Promise((resolve, reject) => {
                setTimeout(function (pMsg) {
                    reject()
                }, pMs)
            })
        },
        // 创建作品
        createProduct(pStyle, qrCodeTemplateType, key, inputContent, qrcodeType) {
            const _self = this
            const promise = new Promise((resolve, reject) => {
                if (_self.mode !== artQrcodeMode.independent) {
                    // 非独立入口这里不生成作品
                    resolve(false)
                    return
                }
                if (pStyle && pStyle !== null && pStyle.template) {
                    // 更新作品 this.qrcodeStyleIsCreateProduct
                    if (_self.cache[qrCodeTemplateType]) {
                        const { eqxScene, pageJson } = _self.cache[qrCodeTemplateType]
                        if ([artQrcodeTemplateType.square].includes(qrCodeTemplateType)) {
                            // 修改二维码元素的值
                            _self.updateElementByStyle(pageJson, pStyle, key, inputContent, qrcodeType)
                            // 修改cover的值 并且保存page
                            this.savePage(pageJson, key)
                        } else if ([artQrcodeTemplateType.dynamic, artQrcodeTemplateType.threeD].includes(qrCodeTemplateType)) {
                            // 更新pageJson中的elements 和 property
                            pageJson.elements = pStyle.pageJson.elements
                            pageJson.properties = pStyle.pageJson.properties
                            // pageJson = pStyle.pageJson
                            // 更新二维码的值
                            _self.updateElementByStyle(pageJson, pStyle, key, inputContent, qrcodeType)
                            // 动态和立体  都走这儿
                            _self.$store.dispatch('ART_PAGE_SAVE', { eqxPage: { eqxScene, pageJson } }).then(data => {
                                resolve({ qrcodeKey: data.data.key, status: _self.statusEnum.showArtQrcode })
                                // 修改cover的值 并且保存page
                                _self.savePage(pageJson, data.data.key)
                            }).catch(err => err && _self.logger.error(err))
                        }
                    } else {
                        // 创建新作品
                        const createStyle = 8
                        Vue.api.scene.addSceneByTemplate(pStyle.template.id, false, createStyle).then(res => {
                            Vue.store.commit('PRODUCT_ID', { productId: pStyle.template.id })
                            _self.qrcodeStyleIsCreateProduct = true
                            const pid = res.data.obj.id
                            const code = res.data.obj.code
                            Vue.api.scene.getScene(`${pid}_${code}`, true).then(res2 => {
                                const eqxScene = new EqxScene(res2.data.obj)
                                _self.qrcodeSceneJson = eqxScene.sceneJson
                                Vue.store.commit('QRCODE_SCENE_JSON', _self.qrcodeSceneJson)
                                const pageJson = eqxScene.sceneJson.pages[0]
                                // 缓存 data
                                _self.cache[qrCodeTemplateType] = { eqxScene, pageJson }

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
                                        resolve({ qrcodeKey: data.data.key, status: _self.statusEnum.showArtQrcode })
                                        // 修改cover的值 并且保存page
                                        this.savePage(pageJson, data.data.key)
                                    }).catch(err => err && this.logger.error(err))
                                }
                            })
                        })
                    }
                } else {
                    resolve(false)
                }
            })
            return promise
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
        },
        // 设置状态
        setStatus(pStatus = this.statusEnum.default) {
            this.status = pStatus
        }
    }
}
</script>

<style lang="scss">
.eqc-nav-artqrcode-builder {
    width: 268px;
    height: 268px;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.16);
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    .normal {
        font-size: 13px;
        font-weight: 400;
        color: rgba(153, 153, 153, 1);
    }
    .createing {
        font-size: 13px;
        font-weight: 400;
        color: rgba(21, 147, 255, 1);
        line-height: 34px;
        i {
            text-align: center;
            font-size: 20px;
            display: block;
            animation: turn 1s linear infinite;
        }
    }
    .showQrcode {
        width: 100%;
        height: 100%;
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center;
        padding: 16px;
    }
    .error {
        font-size: 13px;
        font-weight: 400;
        color: rgba(255, 75, 75, 1);
        line-height: 34px;
        i {
            text-align: center;
            font-size: 20px;
            display: block;
        }
    }
    @keyframes turn {
        0% {
            -webkit-transform: rotate(0deg);
        }
        25% {
            -webkit-transform: rotate(90deg);
        }
        50% {
            -webkit-transform: rotate(180deg);
        }
        75% {
            -webkit-transform: rotate(270deg);
        }
        100% {
            -webkit-transform: rotate(360deg);
        }
    }
}
</style>
