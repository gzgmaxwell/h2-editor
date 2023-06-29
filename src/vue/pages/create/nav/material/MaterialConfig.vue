<template>
    <transition name="rotate-y-left">
        <div
            v-if="materialConfig.show"
            class="eqc-material-config"
            @mouseleave="mouseleave"
        >
            <div class="config-panel">
                <div class="title">
                    素材库设置
                </div>
                <div class="content">
                    <span>经过素材时放大预览</span>
                    <base-radio
                        :value="previewAuthor"
                        type="special"
                        @change="radioChange"
                    />
                </div>
            </div>
        </div>
    </transition>
</template>
<script>
import storageLocal from '../../../../../utils/storageLocal'

export default {
    data() {
        return {

        }
    },
    computed: {
        previewAuthor() {
            return Vue.store.state.layout.materialConfig.previewAuthor
        },
        materialConfig() {
            return Vue.store.state.layout.materialConfig
        }
    },
    mounted() {
        this.getConfigHistory()
    },
    methods: {
        radioChange(val) {
            Vue.store.commit('MATERIAL_PREVIEW_AUTHOR_CHANGE', { previewAuthor: val })
            this.setConfigHistory()
        },
        mouseleave() {
            Vue.store.commit('MATERIAL_PREVIEW_AUTHOR_CHANGE', { show: false })
        },
        getConfigHistory() {
            const key = storageLocal.key.materialConfigHistory
            const res = storageLocal.getItem(key)
            if (res) {
                Vue.store.commit('MATERIAL_PREVIEW_AUTHOR_CHANGE', { previewAuthor: res.previewAuthor })
            }
        },
        setConfigHistory() {
            const key = storageLocal.key.materialConfigHistory
            storageLocal.setItem(key, this.materialConfig)
        }
    }
}
</script>
<style lang="scss">
.eqc-material-config {
    position: absolute;
    left: 278px;
    top: 10px;
    width: 184px;
    height: 94px;
    // transition: height 0.3s;
    background: #ffffff;
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
    border-radius: 2px;
    z-index: 4;
    padding: 16px 12px;
    font-size: 13px;
    color: #111;
    line-height: 18px;
    transform-origin: left;
    .title {
        font-weight: 600;
    }
    .content {
        font-weight: 400;
        margin-top: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
}
</style>
