import user from '../../../../../api/user'

function checkPayBeforeAdd(item) {
    return new Promise((resolve, reject) => {
        checkUserIsLogin().then(() => {
            // TODO 判断是否已购买  价格小于0 会免(这个商品是会免 且 用户是会员) 已经购买过
            if (item.price > 0 && !(item.attrMap.memberFreeFlag && checkUserIsMember())) {
                hasFavoriteOrHasBuy(item.id).then(state => {
                    if (!state) {
                        // 商品名称去掉文件后缀
                        let name = item.name
                        const lastPointIndexOf = name.lastIndexOf('.')
                        if (lastPointIndexOf > 0) {
                            name = name.substring(0, lastPointIndexOf)
                        }
                        const goodsInfo = {
                            goodsId: item.id,
                            goodsName: name,
                            goodsCount: 1,
                            goodsUnitPrice: item.price,
                            goodsElementType: item.elementType
                        }
                        // 支付
                        pay(goodsInfo).then(() => {
                            // 购买完毕 设置item购买状态
                            item.hasBuyFlag = true
                            // 添加到已购买列表
                            addToAlreadyBuyList(
                                item.id,
                                item.elementType,
                                2
                            ).then(() => {
                                resolve()
                            }).catch(err => {
                                err && Vue.logger.error(err)
                                resolve()
                            })
                        }).catch(err => {
                            err && Vue.logger.error(err)
                            reject()
                        })
                    } else {
                        // 已经买过了 直接resolve
                        resolve()
                    }
                })
            } else {
                // 价格小于等于0、已购买直接resolve
                resolve()
            }
        })
    })
}

function checkUserIsLogin() {
    return new Promise((resolve, reject) => {
        const userId = Vue.store.state.user.userInfo.id
        if (!userId) {
            Vue.dialog.openLogin()
                .then(() => Vue.user.auth())
                .then(() => resolve())
                .catch(err => err && Vue.logger.error(err))
        } else {
            resolve()
        }
    })
}

function checkUserIsMember() {
    const userInfo = Vue.store.state.user.userInfo
    // 7,8,9 Vip
    const vipMemberAuth = [7, 8, 9].includes(userInfo.memberType) || (userInfo.members && userInfo.members.some(item => [7, 8, 9].includes(item.memberId)))
    // 营销云 vip
    const yinxiaoVipMemberAuth = userInfo.members && userInfo.members.some(item => [202, 203, 204].includes(item.memberId))
    // 创意 vip
    const chuangyiVipMemberAuth = userInfo.members && userInfo.members.some(item => [14].includes(item.memberId))
    return vipMemberAuth || yinxiaoVipMemberAuth || chuangyiVipMemberAuth
}

function hasFavoriteOrHasBuy(productId) {
    return new Promise((resolve, reject) => {
        // type: 1：收藏，2：已购
        Vue.api.product.hasFavoriteOrHasBuy(productId, 2).then(data => {
            if (Number(data.data.obj) === 1) {
                resolve(true) // 已购买
            } else {
                resolve(false) // 没有购买
            }
        }).catch(() => {
            resolve(false)
        })
    })
}

/**
 * 添加商品到已购买
 * @param {商品id} productId
 * @param {素材分类id} categoryId
 * @param {类型} type  1收藏 2已购
 */
function addToAlreadyBuyList(productId, categoryId, type) {
    return new Promise((resolve, reject) => {
        Vue.api.product.addFavoriteOrHasBuy({ productId, categoryId, type })
            .then(res => {
                resolve()
            })
            .catch(() => {
                reject()
            })
    })
}

/**
 * 支付弹窗
 * @param {商品信息} goodsInfo
 * @param {*} resolve
 * @param {*} reject
 */
function pay(goodsInfo) {
    return new Promise((resolve, reject) => {
        const orderAppId = 1301
        // 产品code 固定
        const productCode = 'P010005'
        // 商品id
        const goodsId = goodsInfo.goodsId
        // 商品名称
        const goodsName = goodsInfo.goodsName
        // 商品数量
        const goodsCount = goodsInfo.goodsCount
        // 商品价格 数量*单价
        const totalPrice = goodsCount * goodsInfo.goodsUnitPrice
        const orderTradeId = ''
        // 获取签名需要的参数
        const signParams = {
            productName: goodsName,
            orderProductId: goodsId,
            orderAmount: totalPrice,
            orderType: 'PAYXB',
            orderAppId: orderAppId,
            returnUrl: '',
            orderRemark: '',
            properties: '',
            orderTradeId: orderTradeId
        }
        // 获取签名
        user.productSign(signParams).then(res => {
            const prefix = ((Vue.env.host.benefit.indexOf('cc') > -1) || (Vue.env.host.benefit.indexOf('cn') > -1)) ? Vue.env.host.benefit.replace('https://', 'http://') : Vue.env.host.benefit.replace('http://', 'https://')
            const cbUrl = `${prefix}/print/notify/notify-async-material`
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
            Vue.dialog.openPayBenefits(data).then(res => {
                // 支付成功
                if (res.data.success) {
                    const merchantOrderNo = res.data.obj.merchantOrderNo
                    Vue.loading.open('正在查询订单')
                    Vue.api.product.getBenefitOrderStatus(merchantOrderNo)
                        .then(res => {
                            Vue.loading.close()
                            resolve()
                        })
                        .catch(() => {
                            Vue.loading.close()
                            Vue.notifier.fail('购买失败，请联系客服处理')
                            reject()
                        })
                } else {
                    Vue.notifier.fail('支付失败，请联系客服处理')
                    reject()
                }
            }).catch(err => {
                err && Vue.logger.error(err)
            })
        })
    })
}

export default {
    checkPayBeforeAdd
}
