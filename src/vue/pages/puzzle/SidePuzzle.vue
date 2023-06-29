<template>
    <div class="ifr-preview">
        <iframe
            :src="`${client}/h2/puzzle?mode=${data.mode}&t=${Date.now()}`"
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
        client() {
            return this.env.host.client
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
            const { source, success, value } = e.data || {}
            if (source === 'h2' && success) {
                switch (value.msg) {
                    case 'close': {
                        this.close()
                        break
                    }
                    case 'insert': {
                        this.close({ type: 'insert', data: value.svg })
                        break
                    }
                    case 'finish': {
                        this.close({ type: 'finish', data: value.svg })
                        break
                    }
                }
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
