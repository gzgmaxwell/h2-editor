<template>
    <iframe
        :src="url"
        class="eqc-dialog-cooperation"
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
        scene() {
            return Vue.store.state.scene.eqxScene
        },
        sceneJson() {
            return this.scene.sceneJson
        },
        url() {
            return `${Vue.env.host.auth}/eip/coorperationSetting?id=${this.sceneJson.id}&type=h2`
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
                if (data) {
                    if (data.type === 'closeCoorperationModal') {
                        this.close()
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
.eqc-dialog-cooperation {
    position: relative;
    width: 600px;
    height: 600px;
    // transition: height 0.3s;
}
</style>
