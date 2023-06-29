<template>
    <i
        v-if="show"
        :style="css"
        class="eqc-red-point"
    />
</template>

<script>
import storageLocal from '../../utils/storageLocal'

export default {
    props: {
        storageKey: {
            type: String,
            default: ''
        },
        storageVersion: {
            type: String,
            default: ''
        },
        css: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            show: storageLocal.getItem(this.storageKey) !== this.storageVersion
        }
    },
    mounted() {
        if (this.show) {
            const $parent = this.$el.parentElement
            const clickHandle = () => {
                $parent.removeEventListener('click', clickHandle)
                storageLocal.setItem(this.storageKey, this.storageVersion)
                this.show = false
            }
            $parent.addEventListener('click', clickHandle)
        }
    }
}
</script>

<style lang="scss">
.eqc-red-point {
    position: absolute;
    right: 8px;
    top: 8px;
    width: 8px;
    height: 8px;
    background: $red-normal;
    border-radius: 50%;
}
</style>
