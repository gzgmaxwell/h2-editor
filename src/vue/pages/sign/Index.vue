<template>
    <div class="eqc-sign">
        <div class="content">
            <the-introduce v-if="layout === 'INTRO'" />
            <the-edit v-if="layout === 'EDIT'" />
            <the-notice v-if="layout === 'NOTICE'" />
            <the-sub-info v-if="layout === 'INFO'" />
        </div>
    </div>
</template>

<script>
import TheIntroduce from './TheIntroduce.vue'
import TheEdit from './TheEdit.vue'
import TheNotice from './TheNotice.vue'
import TheSubInfo from './TheSubInfo.vue'

export default {
    components: {
        TheIntroduce,
        TheEdit,
        TheNotice,
        TheSubInfo
    },
    data() {
        return {

        }
    },
    computed: {
        layout() {
            return Vue.store.state.sign.subscribe.layout
        }
    },
    watch: {
        layout: {
            handler(newVal) {
                this.setPageTitle()
            }
        }
    },
    mounted() {

    },
    created() {
        this.setPageTitle()
    },
    methods: {
        setPageTitle() {
            if (this.layout === 'INTRO') {
                document.title = '轻设计日签来啦~'
            } else if (this.layout === 'INFO') {
                document.title = '订阅信息'
            } else {
                document.title = '日签订阅'
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-sign {
    > .content {
        position: relative;
        width: 100%;
        overflow-y: scroll;
        background: #ffffff;
    }
}
</style>
