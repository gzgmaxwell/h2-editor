<template>
    <div
        class="eqc-tcloud-preview"
    >
        <div class="canvas-container">
            <canvas
                id="wcpCanvas"
                :width="exportCanvasWidth"
                :height="exportCanvasHeight"
            />
        </div>
    </div>
</template>

<script>
import Tcloud from './tcloud'
import TcloudMode from '../../../config/enum.tcloudMode.type'
export default {
    props: {
        mode: {
            type: Number,
            default: null
        }
    },
    data() {
        return {
            exportCanvasWidth: 800,
            exportCanvasHeight: 800,
            tMode: TcloudMode
        }
    },
    computed: {

    },
    watch: {

    },
    mounted() {
        if (this.mode !== this.tMode.independent) {
            // 非独立入口时页面进入时有slide动画，
            // 动画有300ms延迟，之后页面才加载完成，故初始化字云参数需要延迟>300ms
            setTimeout(() => {
                Vue.store.commit('TCLOUD_INIT', { instance: new Tcloud() })
            }, 400)
        } else {
            Vue.store.commit('TCLOUD_INIT', { instance: new Tcloud() })
        }
    },
    methods: {

    }
}
</script>

<style lang="scss">
.eqc-tcloud-preview {
    position: relative;
    width: calc(100% - 400px);
    height: 100%;
    background: #f0f3f4;
    display: flex;
    align-items: center;
    justify-content: center;
    .canvas-container {
        width: 400px;
        height: 400px;
        background: #ffffff;
        box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.16);
        #wcpCanvas {
            width: 100%;
            height: 100%;
        }
    }
}
</style>
