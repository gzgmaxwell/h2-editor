<template>
    <iframe
        :src="url"
        :style="style"
        class="eqc-dialog-pay"
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
    data() {
        return {
            url: `${this.env.host.pay}/pay/purchaseConfirm?t=${Date.now()}`,
            style: {
                height: '420px'
            }
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
                this.logger.warn('postMessage\'s e.data is not string of pay')
                return
            }
            try {
                const data = JSON.parse(e.data)
                if (data.msgType === 'done') {
                    this.$el.contentWindow.postMessage(this.data, '*')
                } else if (data.msgType === 'resize') {
                    this.style.height = data.iframeHeight + 'px'
                } else if (data.msgType === 'close') {
                    this.close()
                } else { // notLogin successInfo errorInfo
                    this.close(data)
                }
            } catch (err) {
                this.logger.error(err)
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-dialog-pay {
    position: relative;
    width: 600px;
    max-height: 600px;
    transition: height 0.3s;
}
</style>
