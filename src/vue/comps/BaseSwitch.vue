<template>
    <div
        :class="{open: isOpen}"
        class="eqc-switch"
        @click.stop="change"
    >
        <i class="switch" />
    </div>
</template>

<script>
export default {
    props: {
        isOpen: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        change() {
            this.$emit('onChange')
        }
    }
}
</script>

<style lang="scss">
.eqc-switch {
    display: inline-block;
    width: 40px;
    padding: 2px;
    border-radius: 10px;
    background: #999;
    cursor: pointer;
    .switch {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #fff;
        float: left;
    }
    &.open {
        background: #1593ff;
        .switch {
            float: right;
        }
    }
}
</style>
