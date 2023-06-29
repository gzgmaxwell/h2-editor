<template>
    <div
        class="eqc-base-config"
        :style="{top:type==='2'?'22px':'20px'}"
        :class="{active:state}"
        @click="configClick"
        @mousemove="configMove"
    >
        <i
            v-if="type === '1'"
            class="eqf-setting-l"
        />
        <span v-else>管理</span>
    </div>
</template>
<script>
export default {
    props: {
        type: {
            type: String,
            default: '1' // 1 正常 2 展示为文字
        },
        state: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        configClick() {
            this.$emit('configClick')
        },
        configMove() {
            this.$emit('configMove')
        }
    }
}
</script>
<style lang="scss">
.eqc-base-config {
    position: absolute;
    top: 20px;
    right: 16px;
    display: inline-flex;
    font-size: 16px;
    cursor: pointer;
    color: #252b3f;
    &.active {
        color: #1593ff;
    }
    &:hover {
        color: #1593ff;
    }

    span {
        font-size: 13px !important;
    }
}
</style>
