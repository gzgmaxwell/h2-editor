<template>
    <iframe
        :src="url"
        class="eqc-dialog-member"
        frameborder="0"
        scrolling="no"
    />
</template>

<script>
import product from '../../api/product'

export default {
    props: {
        data: {
            type: Object,
            default: null
        },
        close: {
            type: Function,
            default: null
        }
    },
    computed: {
        url() {
            let url = `${Vue.env.host.auth}/mall-pay/member?sourceFrom=3`
            if (this.productInfo.productId) {
                url += `&sourceProductId=${this.productInfo.productId}`
            }
            if (this.productInfo.sourceUser) {
                url += `&sourceId=${this.productInfo.sourceUser}`
            }
            if (this.data && this.data.benefitId && typeof this.data.benefitId === 'number') {
                url += `&benefitId=${this.data.benefitId}`
            }
            return url
        },
        productInfo() {
            return Vue.store.state.product
        },
        templateId() {
            return Vue.store.state.product.productId
        }
    },
    created() {
        window.addEventListener('message', this.onMessage)
    },
    destroyed() {
        window.removeEventListener('message', this.onMessage)
    },
    methods: {
        onMessage(e) {
            if (typeof e.data !== 'string') {
                Vue.logger && Vue.logger.warn('postMessage\'s e.data is not string of pay')
                return
            }
            try {
                const data = JSON.parse(e.data)
                if (data.msgType === 'success') {
                    if (data.data) {
                        this.createPrintOrder(data.data)
                    }
                    this.close({
                        success: true
                    })
                } else if (data.msgType === 'close') {
                    this.close()
                } else if (data.msgType === 'fail') {
                    this.close({
                        success: false
                    })
                }
            } catch (err) {
                Vue.logger && Vue.logger.error(err)
            }
        },
        // 保存订单信息
        createPrintOrder(info) {
            const postInfo = {
                id: info.id || '',
                orderId: info.orderId || '',
                name: info.name || '创意云会员',
                price: info.price || 0,
                templateId: this.templateId || -1,
                status: 1,
                sourceUser: this.productInfo.sourceUser
            }
            product.createPrintOrders(postInfo)
        }
    }
}
</script>

<style lang="scss">
.eqc-dialog-member {
    position: relative;
    width: 600px;
    height: 600px;
    transition: height 0.3s;
}
</style>
