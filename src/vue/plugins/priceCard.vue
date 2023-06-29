<template>
    <div
        :style="'width:'+(mode<100?'':'100%;')"
        class="eqx-price-card"
    >
        <!-- 批量、按张导出-无限 -->
        <div
            v-if="mode===101&&!isQrcodeExport"
            class="infinite"
        >
            <div class="common-row-info common-row-margin-bottom-12">
                <label class="name">下载{{ isBatch?'次':'张' }}数</label>
                <label class="value">{{ exportCount }}</label>
            </div>
            <div class="common-row-info">
                <label class="name">免费去水印{{ isBatch?'次':'张' }}数</label>
                <label class="value">无限</label>
            </div>
        </div>
        <!-- 批量、按张导出-会员 -->
        <div
            v-if="mode===102&&!isQrcodeExport"
            class="member"
        >
            <div class="common-row-info common-row-margin-bottom-12">
                <label class="name">下载{{ isBatch?'次':'张' }}数</label>
                <label class="value">{{ exportCount }}</label>
            </div>
            <div class="common-row-info common-row-margin-bottom-12">
                <label class="name">免费去水印{{ isBatch?'次':'张' }}数</label>
                <label class="value">无限</label>
            </div>
            <div class="common-row-solid-line common-row-margin-bottom-12" />
            <div class="common-row-tips common-row-margin-bottom-8">
                <label>续费会员去水印图片免费下载</label>
            </div>
            <div
                class="common-row-botton renew-member"
                :style="{backgroundImage: bannnerImgSrc}"
                @click="memberRePay"
            />
        </div>
        <!-- 批量、按张导出-次数||购买 -->
        <div
            v-if="mode===104||mode===105||mode===106||mode===107"
            class="normal-buy"
        >
            <div
                style="height:38px;line-height: 38px;"
                class="common-row-info common-row-margin-bottom-0 mode"
            >
                <span
                    :class="waterMark?'radio-uncheck':'radio-check'"
                    @click="waterMark=false"
                >
                    <span />
                </span>
                <label
                    class="name"
                    @click="waterMark=false"
                >去水印</label>
                <label class="value price">{{ unitPrice }}秀点/{{ isBatch?'次':'张' }}</label>
            </div>
            <div
                style="height:38px;line-height: 38px;"
                class="common-row-info common-row-margin-bottom-8 mode"
            >
                <span
                    :class="waterMark?'radio-check':'radio-uncheck'"
                    @click="waterMark=true"
                >
                    <span />
                </span>
                <label
                    class="name"
                    @click="waterMark=true"
                >有水印</label>
            </div>
            <div class="common-row-dotted-line-all common-row-margin-bottom-14" />
            <div
                v-if="!isBatch"
                class="common-row-info common-row-margin-bottom-12"
            >
                <label class="name">下载{{ isBatch?'次':'张' }}数</label>
                <label class="value">{{ exportCount }}</label>
            </div>
            <div
                v-if="!waterMark"
                class="common-row-info common-row-margin-bottom-14"
            >
                <label class="name">剩余免费去水印{{ isBatch?'下载次':'张' }}数</label>
                <label class="value">{{ userSurplusAmount }}</label>
            </div>
            <div
                v-if="!waterMark"
                class="common-row-dotted-line common-row-margin-bottom-17"
            />
            <div
                v-if="!waterMark"
                class="common-row-info common-row-margin-bottom-14"
            >
                <label class="name">支付秀点</label>
                <label
                    v-if="exportCount>userSurplusAmount"
                    class="value pay-price"
                >{{ (exportCount-userSurplusAmount) * unitPrice }}</label>
                <label
                    v-else
                    class="value pay-price"
                >0</label>
            </div>
            <div
                v-if="!isXiuKe"
                class="common-row-botton"
                :style="{backgroundImage: bannnerImgSrc}"
                @click="memberRePay"
            />
        </div>
        <!------------------------- 二维码 ------------------------->
        <!-- 二维码-无限 -->
        <div
            v-if="mode===101&&isQrcodeExport"
            class="qrcode-infinite"
        >
            <div class="common-row-info">
                <label class="name">剩余免费去水印张数</label>
                <label class="value">无限</label>
            </div>
        </div>
        <!-- 二维码-会员 -->
        <div
            v-if="mode===102&&isQrcodeExport"
            class="qrcode-member"
        >
            <div class="common-row-info common-row-margin-bottom-12">
                <label class="name">免费去水印张数</label>
                <label class="value">无限</label>
            </div>
            <div class="common-row-solid-line common-row-margin-bottom-12" />
            <div class="common-row-tips common-row-margin-bottom-8">
                <label>续费会员去水印图片免费下载</label>
            </div>
            <div
                class="common-row-botton renew-member"
                :style="{backgroundImage: bannnerImgSrc}"
                @click="memberRePay"
            />
        </div>
        <!-- 二维码-次数||购买 -->
        <div
            v-if="mode===204||mode===205"
            class="qrcode-buy"
        >
            <div
                style="height:38px;line-height: 38px;"
                class="common-row-info common-row-margin-bottom-0 mode"
            >
                <span
                    :class="waterMark?'radio-uncheck':'radio-check'"
                    @click="waterMark=false"
                >
                    <span />
                </span>
                <label
                    class="name"
                    @click="waterMark=false"
                >去水印</label>
                <label class="value price">{{ unitPrice }}秀点/张</label>
            </div>
            <div
                style="height:38px;line-height: 38px;"
                class="common-row-info common-row-margin-bottom-8 mode"
            >
                <span
                    :class="waterMark?'radio-check':'radio-uncheck'"
                    @click="waterMark=true"
                />
                <label
                    class="name"
                    @click="waterMark=true"
                >有水印</label>
            </div>
            <div
                class="common-row-dotted-line-all common-row-margin-bottom-14"
            />
            <div
                v-if="!waterMark"
                class="common-row-info common-row-margin-bottom-14"
            >
                <label class="name">剩余免费去水印张数</label>
                <label class="value">{{ userSurplusAmount }}</label>
            </div>
            <div
                v-if="!waterMark"
                class="common-row-dotted-line common-row-margin-bottom-12"
            />
            <div
                v-if="!waterMark"
                class="common-row-info common-row-margin-bottom-12"
            >
                <label class="name">支付秀点</label>
                <label
                    v-if="exportCount>userSurplusAmount"
                    class="value pay-price"
                >
                    {{ (exportCount-userSurplusAmount) * unitPrice }}</label>
                <label
                    v-else
                    class="value pay-price"
                >
                    0
                </label>
            </div>
            <div
                v-if="!isXiuKe"
                class="common-row-tips common-row-margin-bottom-8"
            >
                <label>开通会员去水印图片免费下载</label>
            </div>
            <div
                v-if="!isXiuKe"
                class="common-row-botton"
                :style="{backgroundImage: bannnerImgSrc}"
                @click="memberRePay"
            />
        </div>
    </div>
</template>

<script>
import util from '../../utils/util'
import user from '../../api/user'
import statistic from '../../config/statistic'
import product from '../../api/product'
export default {
    props: {
        // 是否是批量导出
        isBatchExport: {
            type: Boolean,
            default: false
        },
        // 是否是二维码导出
        isQrcodeExport: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            mode: '',
            // 会员到期时间
            memberExpiryTime: '',
            // 包月到期时间
            monthlyExpiryTime: '',
            // 用户权益次数
            userSurplusAmount: 0,
            // 单价
            unitPrice: 3,
            // 常规导出张数、二维码导出次数、批量导出次数
            exportCount: 1,
            // 水印选项
            waterMark: false,
            // 配置运营位banner的src
            bannnerImgSrc: ''
        }
    },
    computed: {
        isBatch() {
            return util.getIsBatchCreate()
        },
        productInfo() {
            return Vue.store.state.product
        },
        templateId() {
            return this.productInfo.productId
        },
        isPrintId() {
            return Vue.store.state.product.isSourceId
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
        buyMemberAuth() {
            return this.user.allow('buyMember')
        },
        // 是否是秀客
        isXiuKe() {
            return [4].includes(this.userInfo.type)
        }
    },
    created() {
        this.initBannerInfo()
        this.init()
    },
    methods: {
        // 初始化运营配置
        initBannerInfo() {
            const bannerType = Vue.env.banner.downBannerType
            Vue.api.product.getPrintBannerByType(bannerType).then(data => {
                this.bannnerImgSrc = Vue.filter('backgroundImage')(data.data.obj.cover)
            })
        },
        init() {
            return new Promise((resolve, reject) => {
                if (this.vipMemberAuth) {
                    // 会员类型【7，8,9】：显示无限
                    this.mode = 101
                    resolve()
                } else if (this.yinxiaoVipMemberAuth) {
                    // 会员类型：营销云会员【202,203,204】
                    // 获取轻设计标清去水印下载/导出权益【49】
                    user.getUserBenefits(Vue.env.benefits.download).then(res => {
                        let surplusAmount = parseInt(res.data.obj)
                        if (res && res.data && res.data.list && res.data.list.length > 0) {
                            // 权益数量，为-1时表示无上限
                            let infinite = false
                            res.data.list.forEach(item => {
                                if (!infinite && item.surplusAmount === -1) {
                                    infinite = true
                                }
                                surplusAmount += parseInt(item.surplusAmount)
                            })
                            if (infinite) {
                                surplusAmount = -1
                            }
                        }
                        this.userSurplusAmount = surplusAmount
                        if (surplusAmount === -1) {
                        // 【无上限】显示无限
                            this.mode = 101
                        } else if (surplusAmount >= this.exportCount) {
                        // 【次数】>=导出张数，显示张数使用
                            if (this.isBatchExport) {
                                this.mode = 104 // 批量导出次数
                            } else if (this.isQrcodeExport) {
                                this.mode = 205 // 二维码-按张导出次数
                            } else {
                                this.mode = 105 // 按张导出张数
                            }
                        } else {
                        // 【次数】<导出张数，显示支付
                            if (this.isBatchExport) {
                                this.mode = 106 // 批量导出购买
                            } else if (this.isQrcodeExport) {
                                this.mode = 204 // 二维码-按张导出购买
                            } else {
                                this.mode = 107 // 按张导出购买
                            }
                        }
                        resolve()
                    }).catch(err => {
                        err && this.logger.error(err)
                    })
                } else if (this.chuangyiVipMemberAuth) {
                    // 会员类型：创意云会员【14】
                    // 获取轻设计标清去水印下载/导出权益【49】
                    user.getUserBenefits(Vue.env.benefits.download).then(res => {
                        let surplusAmount = parseInt(res.data.obj)
                        if (res && res.data && res.data.list && res.data.list.length > 0) {
                            // 权益数量，为-1时表示无上限
                            let infinite = false
                            res.data.list.forEach(item => {
                                if (!infinite && item.surplusAmount === -1) {
                                    infinite = true
                                }
                                surplusAmount += parseInt(item.surplusAmount)
                            })
                            if (infinite) {
                                surplusAmount = -1
                            }
                        }
                        this.userSurplusAmount = surplusAmount
                        if (surplusAmount === -1) {
                        // 【无上限】显示会员，有效期使用会员有效期
                            this.mode = 102
                            this.memberExpiryTime = this.userInfo.members.filter(item => { return item.memberId === 14 })[0].expiryTime
                        } else if (surplusAmount >= this.exportCount) {
                        // 【次数】>=导出张数，显示张数使用
                            if (this.isBatchExport) {
                                this.mode = 104 // 批量导出次数
                            } else if (this.isQrcodeExport) {
                                this.mode = 205 // 二维码-按张导出次数
                            } else {
                                this.mode = 105 // 按张导出张数
                            }
                        } else {
                        // 【次数】<导出张数，显示支付
                            if (this.isBatchExport) {
                                this.mode = 106 // 批量导出购买
                            } else if (this.isQrcodeExport) {
                                this.mode = 204 // 二维码-按张导出购买
                            } else {
                                this.mode = 107 // 按张导出购买
                            }
                        }
                        resolve()
                    }).catch(err => {
                        err && this.logger.error(err)
                    })
                } else {
                    // 非会员
                    // 获取轻设计标清去水印下载/导出权益【49】
                    user.getUserBenefits(Vue.env.benefits.download).then(res => {
                        let surplusAmount = parseInt(res.data.obj)
                        if (res && res.data && res.data.list && res.data.list.length > 0) {
                            // 权益数量，为-1时表示无上限
                            let infinite = false
                            res.data.list.forEach(item => {
                                if (!infinite && item.surplusAmount === -1) {
                                    infinite = true
                                }
                                surplusAmount += parseInt(item.surplusAmount)
                            })
                            if (infinite) {
                                surplusAmount = -1
                            }
                        }
                        this.userSurplusAmount = surplusAmount
                        if (surplusAmount === -1) {
                        // 【无上限】显示包月
                            this.mode = 103
                            // 包月有效期
                            this.monthlyExpiryTime = res.data.list[0].expiryTime
                        } else if (surplusAmount >= this.exportCount) {
                        // 【次数】>=导出张数，显示张数使用
                            if (this.isBatchExport) {
                                this.mode = 104 // 批量导出次数
                            } else if (this.isQrcodeExport) {
                                this.mode = 205 // 二维码-按张导出次数
                            } else {
                                this.mode = 105 // 按张导出张数
                            }
                        } else {
                        // 【次数】<导出张数，显示支付
                            if (this.isBatchExport) {
                                this.mode = 106 // 批量导出购买
                            } else if (this.isQrcodeExport) {
                                this.mode = 204 // 二维码-按张导出购买
                            } else {
                                this.mode = 107 // 按张导出购买
                            }
                        }
                        resolve()
                    }).catch(err => {
                        err && this.logger.error(err)
                    })
                }
            }).catch(err => {
                err && this.logger.error(err)
            })
        },
        // 支付函数
        pay() {
            const _self = this
            return new Promise((resolve, reject) => {
                this.init().then(() => {
                    if ([106, 107, 204].includes(this.mode) && !this.waterMark) {
                        const orderAppId = 1301
                        // 产品code 固定
                        const productCode = 'P010005'
                        // 商品id
                        const goodsId = '10155'
                        // 商品名称
                        const goodsName = '轻设计图片去水印下载（按张）'
                        // 商品数量
                        const goodsCount = this.exportCount - this.userSurplusAmount
                        // 商品价格
                        const totalPrice = goodsCount * this.unitPrice
                        // 创建业务订单
                        this.createPrintOrders(totalPrice)
                            .then(res => {
                                const orderTradeId = res || ''
                                // 获取签名
                                user.benefitSign({
                                    productName: goodsName,
                                    orderProductId: goodsId,
                                    orderAmount: totalPrice,
                                    orderType: 'PAYXB',
                                    orderAppId: orderAppId,
                                    returnUrl: '',
                                    orderRemark: '',
                                    properties: '',
                                    orderTradeId: orderTradeId
                                }).then(res => {
                                    const prefix = ((Vue.env.host.benefit.indexOf('cc') > -1) || (Vue.env.host.benefit.indexOf('cn') > -1)) ? Vue.env.host.benefit.replace('https://', 'http://') : Vue.env.host.benefit.replace('http://', 'https://')
                                    const cbUrl = `${prefix}/print/notify/notify-async-benefit`
                                    // 秀点消耗弹窗
                                    const data = {
                                        goods: [ // 原buyItems，商品信息
                                            {
                                                id: goodsId, // 商品ID；
                                                type: '', //  可选，商品类型，消耗优惠券
                                                name: goodsName, // 商品名称；
                                                price: totalPrice, // 商品价格
                                                count: goodsCount
                                            }
                                        ],
                                        params: {
                                            // 发送给接口的数据，可从各业务线签名接口中的数据找对应关系
                                            // 签名接口返回
                                            notifyUrl: cbUrl, // 订单通知url
                                            sign: res.data.obj, // 签名
                                            // 咨询后端，各业务线ID不同
                                            orderAppId: orderAppId, // 调用者ID（善维）
                                            orderTradeId: orderTradeId, // 业务流水号
                                            productCode: productCode, // 产品编码
                                            returnUrl: '' // 可选，支付成功后的回调地址
                                        }
                                    }
                                    // 支付弹窗
                                    this.dialog.openPayBenefits(data).then(res => {
                                        // 支付成功
                                        if (res.data.success) {
                                            const merchantOrderNo = res.data.obj.merchantOrderNo

                                            this.loading.open('正在查询订单...')
                                            return this.api.product.getBenefitOrderStatus(merchantOrderNo)
                                                .then(res => {
                                                    this.loading.close()
                                                    // 刷新权益面板
                                                    this.init()
                                                    this.dialog.openConfirm({
                                                        msg: '支付成功，是否立即导出',
                                                        confirmName: '立即导出',
                                                        cancelName: '取消'
                                                    }).then(() => {
                                                        this.init().then(() => {
                                                            if (![106, 107, 204].includes(this.mode)) {
                                                                resolve({
                                                                    success: true,
                                                                    waterMark: this.waterMark,
                                                                    merchantOrderNo,
                                                                    callback: function () {
                                                                        _self.useUserBenefits()
                                                                    }
                                                                })
                                                            } else {
                                                                this.notifier.fail('导出' + (this.isBatch ? '次' : '张') + '数不足，请重新购买')
                                                                resolve({
                                                                    success: false,
                                                                    waterMark: this.waterMark,
                                                                    merchantOrderNo
                                                                })
                                                            }
                                                        }).catch(err => {
                                                            err && this.logger.error(err)
                                                        })
                                                    })
                                                })
                                                .catch(() => {
                                                    this.loading.close()
                                                    this.notifier.fail('购买失败，请联系客服处理')
                                                    return Promise.reject()
                                                })
                                        } else {
                                            this.notifier.fail('支付失败，请稍后重试')
                                            resolve({
                                                success: false,
                                                waterMark: this.waterMark,
                                                merchantOrderNo: ''
                                            })
                                        }
                                    }).catch(err => {
                                        err && this.logger.error(err)
                                    })
                                })
                            })
                    } else {
                        resolve({
                            success: true,
                            waterMark: this.waterMark,
                            merchantOrderNo: '',
                            callback: function () {
                                _self.useUserBenefits()
                            }
                        })
                    }
                }).catch(err => {
                    err && this.logger.error(err)
                })
            }).catch(err => {
                err && this.logger.error(err)
            })
        },
        // 刷新权益面板
        setExportCount(pExportCount = 1) {
            if (pExportCount < 0) {
                return
            }
            this.exportCount = pExportCount
            this.init()
        },
        // 权益消耗
        useUserBenefits() {
            if (this.waterMark) {
                return
            }
            // 无水印才调用权益消耗
            user.useUserBenefits(Vue.env.benefits.download, this.exportCount).then(res => {
                this.init()
            }).catch(err => {
                err && this.logger.error(err)
            })
        },
        // 会员续费
        memberRePay() {
            if (this.buyMemberAuth) {
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.MBTNDOWN])
                const options = {
                    benefitId: Vue.env.benefits.download
                }
                this.dialog.openMember(options).then(res => {
                    if (res.success) {
                        this.notifier.success('支付成功，请刷新页面')
                        this.init()
                    } else {
                        this.notifier.fail('支付失败，请稍后重试')
                    }
                }).catch(err => {
                    err && this.logger.error(err)
                })
            }
        },
        // 更新订单信息
        updatePrintOrders(pOrderId) {
            const templateId = this.templateId || -1 // 未使用模板 传-1
            if (pOrderId) {
                product.updatePrintOrders(pOrderId, templateId, this.isPrintId)
            }
        },
        // 创建订单
        createPrintOrders(price) {
            return new Promise((resolve, reject) => {
                const postInfo = {
                    name: '轻设计图片去水印下载（按张）',
                    price: price || 0,
                    templateId: this.productInfo.productId || -1,
                    status: 2,
                    sourceUser: this.productInfo.sourceUser
                }
                product.createPrintOrders(postInfo)
                    .then(res => {
                    // obj 回调凭据
                        if (res && res.data && res.data.obj) {
                            resolve(res.data.obj)
                        } else {
                            resolve()
                        }
                    })
                    .catch(err => {
                        err && this.logger.error(err)
                        // 业务订单生产失败还是去支付,不影响支付流程，
                        // 只是信息记录不完整
                        resolve()
                    })
            })
        }
    }
}
</script>

<style lang='scss'>
.eqx-price-card {
    width: 208px;
    height: auto;
    background: rgba(255, 255, 255, 1);
    border-radius: 3px;
    font-size: 14px;
    border-top: 1px dashed rgba(230, 235, 237, 1);
    // 二维码-无限
    .qrcode-infinite {
        height: auto;
        padding: 16px 0px 0px 0px;
    }
    // 二维码-会员
    .qrcode-member {
        height: auto;
        padding: 16px 0px 0px 0px;
    }
    // 二维码-导出次数||购买
    .qrcode-buy {
        height: auto;
        padding: 16px 0px 0px 0px;
    }
    // 无限
    .infinite {
        height: auto;
        padding: 16px 0px 0px 0px;
    }
    // 会员
    .member {
        height: auto;
        padding: 16px 0px 0px 0px;
    }
    // 包月
    .monthly {
        padding: 24px 16px 24px 16px;
        height: 189px;
        .main-title {
            height: 53px;
            line-height: 33px;
            border-bottom: 1px solid #ccd5db;
        }
        .sub-title {
            height: 68px;
            padding-top: 14px;
            line-height: 25px;
            label {
                display: block;
            }
        }
        .link-button {
            font-size: 13px;
            height: 20px;
            line-height: 25px;
        }
    }
    // 批量导出次数
    .batch-exp {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        padding: 16px 0px 0px 0px;
        .main-title {
            height: 28px;
            line-height: 28px;
        }
        .link-button {
            height: 18px;
            line-height: 18px;
        }
    }
    // 按张导出张数
    .normal-exp {
        height: auto;
        padding: 16px 0px 0px 0px;
    }
    // 批量导出购买
    .batch-buy {
        height: 189px;
        padding: 16px 16px 20px 16px;
        .main-title {
            height: 53px;
            line-height: 33px;
            border-bottom: 1px solid #ccd5db;
        }
        .sub-title {
            height: 18px;
            line-height: 18px;
            margin-top: 12px;
            font-size: 12px;
            font-weight: 400;
            color: rgba(79, 93, 105, 1);
        }
        .pay-price {
            height: 22px;
            line-height: 18px;
            margin-top: 7px;
            div {
                display: inline-block;
            }
            .calc-before {
                font-size: 14px;
                color: rgba(47, 60, 77, 1);
            }
            .calc-result {
                font-size: 28px;
                color: rgba(255, 41, 106, 1);
                position: relative;
                top: 2px;
            }
            .calc-unit {
                font-size: 12px;
                color: rgba(255, 41, 106, 1);
            }
        }
        .link-button {
            height: 18px;
            line-height: 18px;
            margin-top: 15px;
        }
    }
    // 按张导出购买
    .normal-buy {
        height: auto;
        padding: 8px 0px 0px 0px;
    }
    .main-title {
        font-weight: bold;
        color: rgba(47, 60, 77, 1);
    }
    .sub-title {
        font-weight: 400;
        color: rgba(79, 93, 105, 1);
    }
    .link-button {
        color: rgba(21, 147, 255, 1);
        cursor: pointer;
    }
    // 公共样式
    // 每行名称+值
    .common-row-info {
        display: block;
        width: 100%;
        height: 18px;
        line-height: 18px;
        font-size: 13px;
        font-weight: 400;
        .radio-check {
            width: 16px;
            height: 16px;
            background: rgba(21, 147, 255, 1);
            border-radius: 8px;
            vertical-align: text-bottom;
            display: inline-block;
            margin-right: 4px;
            span {
                width: 6px;
                height: 6px;
                background: rgba(255, 255, 255, 1);
                border-radius: 3px;
                display: block;
                margin-left: 5px;
                margin-top: 5px;
            }
        }
        .radio-uncheck {
            width: 16px;
            height: 16px;
            background: rgba(255, 255, 255, 1);
            border-radius: 8px;
            border: 1px solid rgba(204, 213, 219, 1);
            vertical-align: text-bottom;
            display: inline-block;
            margin-right: 4px;
        }
        .name {
            color: rgba(102, 102, 102, 1);
        }
        .value {
            color: rgba(17, 17, 17, 1);
            float: right;
            font-weight: bold;
        }
        .pay-price {
            color: #111111;
            font-weight: bold;
            float: right;
        }
        .price {
            float: right;
            color: #111111;
            font-weight: 600;
        }
        &.mode {
            width: 228px;
            position: relative;
            left: -10px;
            text-indent: 10px;
            padding-right: 10px;
            border-radius: 2px;
            &:hover {
                background: #f0f3f4;
            }
        }
    }
    // 实线
    .common-row-solid-line {
        width: 100%;
        height: 1px;
        border-top: 1px solid rgba(204, 213, 219, 1);
    }
    .common-row-dotted-line-all {
        width: 100%;
        height: 1px;
        border-top: 1px dashed rgba(230, 235, 237, 1);
        position: relative;
    }
    // 虚线
    .common-row-dotted-line {
        width: 100%;
        height: 1px;
        border-top: 1px dashed rgba(204, 213, 219, 1);
    }
    // 黄色单排文字
    .common-row-tips {
        display: block;
        width: 100%;
        height: 18px;
        line-height: 18px;
        font-size: 12px;
        font-weight: 400;
        color: rgba(192, 150, 90, 1);
        text-align: left;
    }
    // 按钮
    .common-row-botton {
        width: 232px;
        position: relative;
        left: -12px;
        height: 136px;
        border-radius: 2px;
        font-size: 13px;
        font-weight: 400;
        color: rgba(255, 255, 255, 1);
        text-align: center;
        line-height: 32px;
        cursor: pointer;
        background-size: cover !important;
    }
    .common-row-margin-bottom-20 {
        margin-bottom: 20px;
    }
    .common-row-margin-bottom-18 {
        margin-bottom: 18px;
    }
    .common-row-margin-bottom-17 {
        margin-bottom: 17px;
    }
    .common-row-margin-bottom-14 {
        margin-bottom: 14px;
    }
    .common-row-margin-bottom-12 {
        margin-bottom: 12px;
    }
    .common-row-margin-bottom-8 {
        margin-bottom: 8px;
    }
    .common-row-margin-bottom-0 {
        margin-bottom: 0px;
    }
}
</style>
