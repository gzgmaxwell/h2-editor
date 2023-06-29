<template>
    <iframe
        :src="url"
        class="eqc-dialog-bind-phone"
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
            url: `${Vue.env.host.auth}/mobile/bindphone.html`
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
            let data = e.data
            if (!data) {
                data = {}
            }
            if (data.closeBindBox) {
                this.close()
            } else if (data.bindSuccess) {
                Vue.store.commit('USER_PHONE_CHANGE', { phone: data.bindSuccessPhone })
                this.close({})
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-dialog-bind-phone {
    position: relative;
    width: 600px;
    height: 300px;
    background: #fff;
    transition: height 0.3s;
}
</style>
