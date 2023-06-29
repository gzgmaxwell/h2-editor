<template>
    <div
        :class="{show: navPanel.show}"
        class="eqc-tcloud-panel"
    >
        <div class="panel">
            <nav-material
                v-if="nav.selectedItem.type === 'image'"
                class="content"
                category="tcloud"
            />
            <nav-upload
                v-if="nav.selectedItem.type === 'upload'"
                class="content"
                category="tcloud"
            />
        </div>
        <!--素材预览-->
        <material-item-preview />
        <!--素材筛选条件框-->
        <material-more-condition />
        <!--素材配置-->
        <material-config />
    </div>
</template>

<script>
import NavMaterial from '../create/nav/NavMaterial.vue'
import NavUpload from '../create/nav/NavUpload.vue'
import MaterialItemPreview from '../create/nav/material/MaterialItemPreview.vue'
import MaterialMoreCondition from '../create/nav/material/MaterialMoreCondition.vue'
import MaterialConfig from '../create/nav/material/MaterialConfig.vue'

export default {
    components: {
        NavMaterial,
        NavUpload,
        MaterialItemPreview,
        MaterialMoreCondition,
        MaterialConfig
    },
    data() {
        return {

        }
    },
    computed: {
        tcloud() {
            return Vue.store.state.tcloud
        },
        navPanel() {
            return this.tcloud.navPanel
        },
        nav() {
            return this.tcloud.nav
        }
    },
    watch: {

    },
    mounted() {

    },
    methods: {

    }
}
</script>

<style lang="scss">
.eqc-tcloud-panel {
    position: relative;
    flex: none;
    width: 0;
    height: 100%;
    background: #f7f8f9;
    opacity: 0;
    transition: all 0.3s;
    z-index: 4; // 需要在header之上才有阴影
    &.show {
        width: 288px;
        opacity: 1;
        border-right: 1px solid rgba(204, 213, 219, 1);
    }
    .panel {
        height: 100%;
        overflow: hidden;
        > .content {
            height: 100%;
            width: 288px;
        }
    }
}
</style>
