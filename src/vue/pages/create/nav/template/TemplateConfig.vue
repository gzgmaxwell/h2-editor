<template>
    <transition name="rotate-y-left">
        <div
            v-if="templateConfig.show"
            class="eqc-template-config"
            @mouseleave="mouseleave"
        >
            <div class="config-panel">
                <div class="title">
                    模板库设置
                </div>
                <div class="content">
                    <span>经过模板时放大预览</span>
                    <base-radio
                        :value="templateConfig.previewAuthor"
                        type="special"
                        @change="radioChangePreviewAuthor"
                    />
                </div>
                <div class="content">
                    <span>开启推荐</span>
                    <base-radio
                        :value="templateConfig.recommendAuthor"
                        type="special"
                        @change="radioChangeRecommendAuthor"
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
        templateConfig() {
            return Vue.store.state.layout.templateConfig
        }
    },
    mounted() {
        this.getConfigHistory()
    },
    methods: {
        radioChangePreviewAuthor(val) {
            Vue.store.commit('TEMPLATE_CONFIG', { previewAuthor: val })
            this.setConfigHistory()
        },
        radioChangeRecommendAuthor(val) {
            Vue.store.commit('TEMPLATE_CONFIG', { recommendAuthor: val })
            this.setConfigHistory()
        },
        mouseleave() {
            Vue.store.commit('TEMPLATE_CONFIG', { show: false })
        },
        getConfigHistory() {
            const key = storageLocal.key.templateConfigHistory
            const res = storageLocal.getItem(key)
            if (res) {
                Vue.store.commit('TEMPLATE_CONFIG', { previewAuthor: res.previewAuthor })
                Vue.store.commit('TEMPLATE_CONFIG', { recommendAuthor: res.recommendAuthor })
            }
        },
        setConfigHistory() {
            const key = storageLocal.key.templateConfigHistory
            storageLocal.setItem(key, this.templateConfig)
        }
    }
}
</script>
<style lang="scss">
.eqc-template-config {
    position: absolute;
    left: 278px;
    top: 10px;
    width: 184px;
    height: auto;
    background: #ffffff;
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
    border-radius: 2px;
    z-index: 4;
    padding: 16px 12px;
    font-size: 13px;
    color: #111;
    line-height: 18px;
    transform-origin: left;
    perspective: 640px;
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
