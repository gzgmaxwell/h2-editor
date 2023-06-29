<template>
    <div
        :style="css"
        class="eqc-circular"
        @click="toTopClick"
    >
        <i
            v-if="showIconFlag"
            class="icon eqf-ontop"
        />
        {{ text }}
    </div>
</template>

<script>

export default {
    props: {
        text: {
            type: String,
            default: '置顶'
        },
        click: {
            type: Function,
            default: () => {
            }
        },
        showIconFlag: {
            type: Boolean,
            default: true
        },
        css: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
        }
    },
    methods: {
        toTopClick() {
            this.click()
        }
    }
}
</script>

<style lang="scss">
.eqc-circular {
    width: 44px;
    height: 44px;
    background: rgba(255, 255, 255, 1);
    opacity: 0.9;
    border: 1px solid rgba(204, 213, 219, 1);
    border-radius: 22px;
    // 文字
    font-size: 12px;
    font-weight: 400;
    color: rgba(118, 131, 143, 1);
    line-height: 0;
    text-align: center;
    cursor: pointer;
    // 图标
    .eqf-ontop {
        display: block;
        line-height: 27px;
    }
    &:hover {
        color: #1593ff;
    }
}
</style>
