<template>
    <div class="base-normal-tab">
        <ul class="tab">
            <li
                v-for="(item,i) in tabOption"
                :key="i"
                :class="{active: selectedCategory === item.name}"
                class="item"
                @click="chooseCategory(item)"
            >
                {{ item.name }}
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    props: {
        tabOption: {
            type: Array,
            default: null
        }
    },
    data() {
        return {
            selectedCategory: ''
        }
    },
    mounted() {
        if (this.tabOption.length > 1) {
            // 默认展示第一个
            this.selectedCategory = this.tabOption[0].name
        }
    },
    methods: {
        chooseCategory(item) {
            this.selectedCategory = item.name
            this.$emit('selectTab', item)
        }
    }
}
</script>

<style lang="scss">
.base-normal-tab {
    .tab {
        display: flex;
        align-content: space-between;
        .item {
            position: relative;
            width: 100%;
            height: 40px;
            line-height: 40px;
            font-size: 12px;
            border-bottom: 1px solid #ccd5db;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
            &:hover,
            &.active {
                color: #1593ff;
                &::after {
                    opacity: 1;
                }
            }
            &::after {
                content: "";
                position: absolute;
                left: 0;
                bottom: -1px;
                width: 100%;
                height: 2px;
                background: #1593ff;
                opacity: 0;
                transition: all 0.3s;
            }
        }
    }
}
</style>
