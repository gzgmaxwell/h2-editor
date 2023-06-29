<template>
    <iframe
        :src="url"
        class="eqc-dialog-login"
        frameborder="0"
        scrolling="no"
    />
</template>

<script>
export default {
    props: {
        data: {
            type: Object,
            default() {
                return {
                    type: 'login'
                }
            }
        },
        close: {
            type: Function,
            default: null
        }
    },
    computed: {
        url() {
            return `${this.env.host.auth}/auth/${this.data.type}?t=${Date.now()}`
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
                return
            }
            try {
                const data = JSON.parse(e.data)
                if (data.type === 'close') {
                    this.close()
                } else {
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
.eqc-dialog-login {
    position: relative;
    width: 600px;
    height: 536px;
    background: #fff;
    transition: height 0.3s;
}
</style>
