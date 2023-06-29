<template>
    <div
        :class="{show: navPanel.show}"
        class="eqc-puzzle-panel"
    >
        <div class="panel">
            <nav-group
                v-if="nav.selectedItem.type === 'group'"
                class="content"
            />
            <nav-material
                v-if="nav.selectedItem.type === 'image'"
                class="content"
                category="puzzle"
            />
            <nav-upload
                v-if="nav.selectedItem.type === 'upload'"
                class="content"
                category="puzzle"
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
import NavGroup from './nav/NavGroup.vue'
import NavMaterial from '../create/nav/NavMaterial.vue'
import NavUpload from '../create/nav/NavUpload.vue'
import MaterialItemPreview from '../create/nav/material/MaterialItemPreview.vue'
import MaterialMoreCondition from '../create/nav/material/MaterialMoreCondition.vue'
import MaterialConfig from '../create/nav/material/MaterialConfig.vue'

export default {
    components: {
        NavGroup,
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
        puzzle() {
            return Vue.store.state.puzzle
        },
        navPanel() {
            return this.puzzle.navPanel
        },
        nav() {
            return this.puzzle.nav
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
.eqc-puzzle-panel {
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
