<template>
    <div class="eqc-visit-template">
        <the-template
            :hide-more-btn="true"
            class="content"
        />
    </div>
</template>

<script>
import TheTemplate from '../home/TheTemplate.vue'

export default {
    components: {
        TheTemplate
    }
}
</script>

<style lang="scss">
.eqc-visit-template {
    height: 100%;
    overflow-y: auto;
    .content .bg {
        color: #333;
        background: transparent;
        .wrap {
            max-width: inherit;
            margin: 0 40px;
            .head .menu {
                display: none;
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
