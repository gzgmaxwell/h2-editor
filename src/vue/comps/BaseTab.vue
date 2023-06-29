<template>
    <ul class="eqc-base-tab">
        <li
            v-for="item of list"
            :key="item.name"
            :class="{active: item === selectedItem}"
            class="item"
            @click="select(item)"
        >
            <span>{{ item.name }}</span>
            <span
                v-if="item.icon"
                class="badge"
            ><i class="eqf-tipvip" /></span>
        </li>
    </ul>
</template>

<script>
export default {
    props: {
        list: {
            type: Array,
            default: null
        },
        selectedItem: {
            type: Object,
            default: null
        }
    },
    methods: {
        select(item) {
            this.$emit('select', item)
        }
    }
}
</script>

<style lang="scss">
.eqc-base-tab {
    margin: 0 16px;
    display: flex;
    align-items: center;
    height: 60px;
    color: #252b3f;
    box-sizing: content-box;
    transition: all 0.3s;
    .item {
        position: relative;
        font-size: 14px;
        font-weight: 600;
        height: 58px;
        line-height: 56px;
        margin-right: 20px;
        cursor: pointer;
        border-top: 2px solid transparent;
        margin-top: -2px;
        transition: all 0.3s;
        &:hover {
            color: #1593ff;
        }
        &.active {
            color: #1593ff;
            border-top: 2px solid #1593ff;
        }
        .badge {
            position: absolute;
            top: 9px;
            right: -22px;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #c09659;
            font-weight: normal;
        }
    }
}
</style>
