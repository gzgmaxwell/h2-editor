<template>
    <iframe
        :src="url"
        class="eqc-dialog-material-lib"
        frameborder="0"
        scrolling="no"
    />
</template>

<script>
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
            const type = this.data && this.data.type && this.data.type === 'shape' ? 'shape' : 'image'
            return `${Vue.env.host.auth}/material/${type}?t=${new Date().getTime()}&product=P010005`
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
            try {
                const data = e.data
                if (data.source === 'material') {
                    if (data.type === 'success') {
                        const path = data.data ? data.data[0].path : ''
                        this.close({
                            success: true,
                            path
                        })
                    } else if (data.type === 'close') {
                        this.close()
                    } else if (data.type === 'fail') {
                        this.close({
                            success: false
                        })
                    }
                }
            } catch (err) {
                Vue.logger && Vue.logger.error(err)
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-dialog-material-lib {
    position: relative;
    width: 100%;
    height: 100%;
    transition: height 0.3s;
}
</style>
