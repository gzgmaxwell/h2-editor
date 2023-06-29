<template>
    <div
        :style="{width: width, height: height, top: top, left: left, transform: transform ? transform : ''}"
        class="eqc-toolbar-original"
    >
        <div
            :style="{background: `url(${originImage}) no-repeat center/contain`}"
            class="image-origin"
        />
    </div>
</template>

<script>
export default {
    data() {
        return {
            width: 0,
            height: 0,
            top: 0,
            left: 0,
            transform: null
        }
    },
    computed: {
        photoScene() {
            return Vue.store.state.photoScene
        },
        eqxPage() {
            return this.photoScene.eqxPage
        },
        originImage() {
            return this.photoScene.originImage
        }
    },
    watch: {

    },
    mounted() {
        const $editor = this.eqxPage.$el
        const $elWorkspace = $editor.parentElement
        if ($editor.style.transform) this.transform = $editor.style.transform
        this.width = $editor.offsetWidth + 'px'
        this.height = $editor.offsetHeight + 'px'
        this.top = ($elWorkspace.offsetHeight - $editor.offsetHeight) / 2 + 'px'
        this.left = ($elWorkspace.offsetWidth - $editor.offsetWidth) / 2 + 'px'
    },
    methods: {

    }
}
</script>

<style lang="scss">
.eqc-toolbar-original {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 2;
    .image-origin {
        width: 100%;
        height: 100%;
    }
}
</style>
