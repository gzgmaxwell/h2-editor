<template>
    <div class="eqc-dialog-video-player">
        <div class="content">
            <video
                :src="data.url"
                :poster="data.poster ? data.poster : ''"
                controls="controls"
                autoplay="autoplay"
                width="850"
                height="480"
            />
            <i
                class="close eqf-no-l"
                @click="cancel"
            />
        </div>
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
    methods: {
        cancel() {
            this.close({})
        }
    }
}
</script>

<style lang="scss">
.eqc-dialog-video-player {
    width: 850px;
    position: relative;
    transition: height 0.3s;
    .content {
        position: relative;
        .close {
            font-size: 26px;
            position: absolute;
            top: -30px;
            right: -30px;
            background: rgba(0, 0, 0, 0.2);
            color: rgba(255, 255, 255, 0.5);
            border-radius: 30px;
        }
    }
}
</style>
