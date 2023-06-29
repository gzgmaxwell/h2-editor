<template>
    <div class="eqc-visit">
        <the-head />
        <div class="content">
            <the-template />
        </div>
    </div>
</template>

<script>
import TheHead from './TheHead.vue'
import TheTemplate from './TheTemplate.vue'

export default {
    components: {
        TheHead,
        TheTemplate
    }
}
</script>

<style lang="scss">
.eqc-visit {
    > .content {
        position: fixed;
        top: 60px;
        width: 100%;
        height: calc(100% - 60px);
    }
}
</style>
