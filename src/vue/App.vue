<template>
    <div class="eqc-app">
        <router-view />
        <transition name="fade">
            <the-logo v-if="logo.show" />
        </transition>
    </div>
</template>

<script>
import { apiClearExpired } from '../utils/apiCache'
import TheLogo from './pages/create/TheLogo.vue'

export default {
    components: {
        TheLogo
    },
    computed: {
        logo() {
            return this.$store.state.layout.logo
        }
    },
    created() {
        apiClearExpired()
    }
}
</script>

<style lang="scss">
.eqc-app {
    height: 100%;
}
</style>
