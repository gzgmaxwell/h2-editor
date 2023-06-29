<template>
    <div class="eqc-nav-material-footer">
        <span
            class="item"
            @click="wantMore"
        >没有想要的素材？</span>
        <span class="line" />
        <span
            class="item"
            @click="pcUpload"
        ><i class="eqf-cloudupload-l" /> 电脑上传</span>
    </div>
</template>
<script>
export default {
    props: {
        category: {
            // 主编辑器素材栏：h2  字云工具素材栏：tcloud
            type: String,
            default: 'h2'
        }
    },
    data() {
        return {

        }
    },
    methods: {
        wantMore() {
            const feedback = this.category === 'tcloud' ? '//h5.ebdan.net/ls/YF863ScG' : '//h5.ebdan.net/ls/nS5l03Ih'
            window.open(feedback)
        },
        pcUpload() {
            const upload = {
                name: '上传',
                type: 'upload',
                icon: 'eqf-cloudupload-f'
            }
            const category = this.category === 'tcloud' ? 'TCLOUD' : 'LAYOUT'
            Vue.store.commit(`${category}_NAV`, { item: upload })
            Vue.store.commit(`${category}_NAV_PANEL`, { show: true })
        }
    }
}
</script>
<style lang="scss">
.eqc-nav-material-footer {
    position: absolute;
    left: 0;
    bottom: 0;
    background: #fff;
    height: 48px;
    border-top: 1px solid #ccd5db;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    .line {
        width: 1px;
        height: 24px;
        background: #ccd5db;
    }
    .item {
        width: 49%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        color: #252b3f;
        cursor: pointer;
        i {
            margin-right: 3px;
        }
        &:hover {
            color: #1593ff;
        }
    }
}
</style>
