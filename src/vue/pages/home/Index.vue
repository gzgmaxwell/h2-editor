<template>
    <div class="eqc-home">
        <the-head />
        <div class="content">
            <the-template />
            <the-scene />
        </div>
    </div>
</template>

<script>
import TheHead from './TheHead.vue'
import TheTemplate from './TheTemplate.vue'
import TheScene from './TheScene.vue'

export default {
    components: {
        TheHead,
        TheTemplate,
        TheScene
    }
}
</script>

<style lang="scss">
.eqc-home {
    .content {
        position: absolute;
        height: calc(100% - 60px);
        width: 100%;
        overflow-y: auto;
    }
}
</style>
