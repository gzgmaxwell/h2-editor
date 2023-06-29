<template>
    <div class="eqc-template-h2">
        <the-template
            :hide-more-btn="true"
            :show-back-btn="false"
            class="content"
        />
    </div>
</template>

<script>
import TheTemplate from '../home/TheTemplate.vue'

export default {
    components: {
        TheTemplate
    },
    mounted() {
        // setTimeout(() => this.$parent.sidebarNav.setActiveTab('创意模板'))
    }
}
</script>

<style lang="scss">
.eqc-template-h2 {
    height: calc(100% - 60px);
    overflow-y: auto;
    .content .bg {
        color: #333;
        background: transparent;
        .wrap {
            max-width: inherit;
            margin: 0 40px;
            .head .menu .item {
                border: none;
                border-radius: 3px;
                color: #fff;
                background: #1593ff;
                &:hover {
                    background: #198ae7;
                }
            }
            .template {
                &.border {
                    border-bottom: 1px solid #ccd5db;
                }
                .custom .icon {
                    border: 2px solid #666;
                    &:hover {
                        border: 2px solid #fff;
                        box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
                        background: #fff;
                    }
                }
            }
        }
    }
}
</style>
