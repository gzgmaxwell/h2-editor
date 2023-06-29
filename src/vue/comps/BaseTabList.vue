<template>
    <ul class="eqc-base-tab-list">
        <li
            v-for="(item, index) in list"
            :key="item.type"
            :class="{active: item.name === beSelected, disabled: disable}"
            :style="`${iconStyle ? 'paddingLeft: 0' : ''}`"
            class="btl-item"
            @click="select(item)"
        >
            <span
                :style="`${iconStyle ? iconStyle.color ? item.name === beSelected ? 'color: white' : `color: ${iconStyle.color[index]}` : '' : ''}`"
                :class="iconStyle ? `${iconStyle.icon[index]} icon` : ''"
            />{{ item.name }}
        </li>
    </ul>
</template>

<script>
export default {
    props: {
        disable: {
            type: Boolean,
            default: false
        },
        list: {
            type: Array,
            default: null
        },
        beSelected: {
            type: String,
            default: null
        },
        iconStyle: {
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
.eqc-base-tab-list {
    display: flex;
    .btl-item {
        border: 1px solid #ccd5db;
        height: 36px;
        padding: 0 10px;
        font-size: 14px;
        color: #2f3c4d;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-around;
        margin-left: -1px;
        transition: all 0.3s;
        &:first-child {
            margin-left: 0;
            border-radius: 3px 0 0 3px;
        }
        &:last-child {
            border-radius: 0 3px 3px 0;
        }
        &:hover {
            color: $blue-normal;
        }
        &.active {
            z-index: 1; //层级变高，凸显变色的边框
            background: $blue-normal;
            color: white;
            border-color: $blue-normal;
            .icon {
                color: white;
            }
        }
        &.disabled {
            color: #999;
            pointer-events: none;
        }
        .icon {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 36px;
            width: 36px;
        }
    }
}
</style>
