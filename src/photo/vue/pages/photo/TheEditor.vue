<template>
    <div class="eqc-photo-editor" />
</template>

<script>
export default {
    computed: {
        scene() {
            return Vue.store.state.photoScene
        },
        eqxPage() {
            return this.scene.eqxPage
        }
    },
    watch: {
        eqxPage: {
            handler() {
                this.$nextTick(() => this.renderPage())
            },
            // 避免首次eqxPage改变时，watch还未执行的问题
            immediate: true
        }
    },
    methods: {
        renderPage() {
            const width = this.$parent.$el.offsetWidth
            const height = this.$parent.$el.offsetHeight
            const eqxPage = this.eqxPage
            eqxPage.mount(this.$el)
            eqxPage.initSize(width, height)
            eqxPage.setMove(0, 0)
            eqxPage.renderPage(JSON.parse(JSON.stringify(eqxPage.pageJson)))
        }
    }
}
</script>
