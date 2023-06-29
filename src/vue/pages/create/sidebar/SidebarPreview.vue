<template>
    <div class="ifr-preview">
        <iframe
            :src="`${client}/h2/preview.html?t=${Date.now()}`"
            name="previewIframe"
            class="ifr"
            onload="focus()"
            frameborder="0"
        />
    </div>
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
        sceneJson() {
            return Vue.store.state.scene.eqxScene.sceneJson
        },
        client() {
            return this.env.host.client
        },
        userInfo() {
            return Vue.store.state.user.userInfo
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
            const { type, params } = e.data || {}
            switch (type) {
                case 'close':
                    if (params) {
                        this.close(params)
                    } else {
                        this.close()
                    }
                    break
                case 'publish': {
                    let promise = Promise.resolve()
                    if (!this.userInfo.id) {
                        this.notifier.info('发布功能需登录后才能使用')
                        return
                    }
                    if (!this.userInfo.phone && this.userInfo.type !== 21) {
                        promise = this.dialog.openBindPhone()
                    }
                    promise
                        .then(res => this.api.file.previewRelease(params))
                        .then(() => this.close())
                        .catch(err => err && this.logger.error(err))
                    break
                }
                case 'updateConfig':
                    Object.assign(this.sceneJson, params)
            }
        }
    }
}
</script>

<style lang="scss">
.ifr-preview {
    .ifr {
        width: 100%;
        height: 100%;
    }
    .close {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        right: 24px;
        top: 24px;
        width: 28px;
        height: 28px;
        font-size: 22px;
        color: #fff;
        background: #2f3c4d;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s;
        &:hover {
            background: #ff2a6a;
        }
    }
}
</style>
