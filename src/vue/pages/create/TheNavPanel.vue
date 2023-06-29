<template>
    <div
        :class="{show: navPanel.show}"
        class="eqc-nav-panel"
    >
        <div class="panel">
            <nav-template
                v-if="navStatusArray.template.render"
                v-show="navStatusArray.template.show"
                class="content"
            />
            <nav-text
                v-if="navStatusArray.text.render"
                v-show="navStatusArray.text.show"
                class="content"
            />
            <nav-background
                v-if="navStatusArray.background.render"
                v-show="navStatusArray.background.show"
                class="content"
            />
            <nav-qrcode
                v-if="navStatusArray.qrcode.render"
                v-show="navStatusArray.qrcode.show"
                class="content"
            />
            <nav-upload
                v-if="navStatusArray.upload.render"
                v-show="navStatusArray.upload.show"
                class="content"
            />
            <nav-tool
                v-if="navStatusArray.tool.render"
                v-show="navStatusArray.tool.show"
                class="content"
            />
            <!-- 不做show的控制，如果该项display:none导致画布上图片容器显示无效，原因未找到 -->
            <!-- nav-material 一定要在最下 不然放在下面的panel会被覆盖 -->
            <nav-material
                v-if="navStatusArray.image.render"
                class="content"
            />
        </div>
        <nav-template-preview />
        <material-item-preview />
        <material-more-condition />
        <material-config />
        <!-- 模板颜色选择面板 -->
        <template-color-panel />
        <!-- 模板设置面板 -->
        <template-config />
        <!-- 模板全部分类面板 -->
        <template-category-panel />
    </div>
</template>

<script>
import NavTemplate from './nav/NavTemplate.vue'
import NavMaterial from './nav/NavMaterial.vue'
import NavUpload from './nav/NavUpload.vue'
import NavText from './nav/NavText.vue'
import NavBackground from './nav/NavBackground.vue'
import NavQrcode from './nav/NavQrcode.vue'
import NavTemplatePreview from './nav/NavTemplatePreview.vue'
import MaterialItemPreview from './nav/material/MaterialItemPreview.vue'
import MaterialMoreCondition from './nav/material/MaterialMoreCondition.vue'
import MaterialConfig from './nav/material/MaterialConfig.vue'
import TemplateColorPanel from './nav/template/TemplateColorPanel.vue'
import TemplateConfig from './nav/template/TemplateConfig.vue'
import TemplateCategoryPanel from './nav/template/TemplateCategoryPanel.vue'
import NavTool from './nav/NavTool.vue'
import util from '../../../utils/util'

export default {
    components: {
        NavTemplate,
        NavMaterial,
        NavUpload,
        NavText,
        NavBackground,
        NavQrcode,
        NavTemplatePreview,
        NavTool,
        MaterialItemPreview,
        MaterialMoreCondition,
        MaterialConfig,
        TemplateColorPanel,
        TemplateConfig,
        TemplateCategoryPanel
    },
    data() {
        return {
            navStatusArray: {
                template: {
                    render: true && !this.isBatch(),
                    show: true && !this.isBatch()
                },
                text: {
                    render: false || this.isBatch(),
                    show: false || this.isBatch()
                },
                image: {
                    render: false,
                    show: false
                },
                background: {
                    render: false,
                    show: false
                },
                qrcode: {
                    render: false,
                    show: false
                },
                tool: {
                    render: false,
                    show: false
                },
                upload: {
                    render: false,
                    show: false
                }
            }
        }
    },
    computed: {
        layout() {
            return this.$store.state.layout
        },
        navSelectedItem() {
            return this.layout.nav.selectedItem
        },
        navPanel() {
            return this.layout.navPanel
        }
    },
    watch: {
        navSelectedItem() {
            this.refreshNavStatus(this.navSelectedItem.type)
        }
    },
    mounted() {
        this.refreshNavStatus(this.navSelectedItem.type)
    },
    methods: {
        refreshNavStatus(pNavName) {
            for (const key in this.navStatusArray) {
                if (key === pNavName) {
                    this.navStatusArray[key].render = true
                    this.navStatusArray[key].show = true
                } else {
                    this.navStatusArray[key].show = false
                }
            }
        },
        isBatch() {
            return util.getIsBatchCreate()
        }
    }
}
</script>

<style lang="scss">
.eqc-nav-panel {
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
        // box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
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
