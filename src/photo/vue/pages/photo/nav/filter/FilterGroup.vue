<template>
    <li class="eqc-photo-filter-group">
        <div
            class="header"
            @click="openOrClose"
        >
            <span class="title">{{ item.groupName }}</span>
            <span><i :class="{'eqf-down':item.state,'eqf-right':!item.state}" /></span>
        </div>
        <div
            :style="{height:itemListHeight+'px'}"
            class="item-list"
        >
            <filter-item
                v-for="(filterItem,i) in item.list"
                :key="i"
                :item="filterItem"
                :all-data="allData"
                :group-item="item"
            />
        </div>
    </li>
</template>
<script>
import FilterItem from './FilterItem.vue'
export default {
    components: {
        FilterItem
    },
    props: {
        item: {
            type: Object,
            default: () => ({})
        },
        allData: {
            type: Array,
            default: () => ({})
        }
    },
    data() {
        return {
            itemListHeight: 92
        }
    },
    computed: {

    },
    watch: {
        item: {
            handler() {
                this.initItemListHeight()
            },
            deep: true
        }
    },
    methods: {
        // 打开或者关闭该列表
        openOrClose() {
            this.closeOtherGroup()
            this.item.state = !this.item.state
        },
        // 关闭其他打开的group
        closeOtherGroup() {
            this.allData.map(groupItem => {
                if (groupItem !== this.item) {
                    groupItem.state = false
                }
            })
        },
        initItemListHeight() {
            if (this.item.state) {
                // 打开状态
                const childState = this.item.list.some(child => child.state)
                const otherHeight = childState ? 105 : 0
                this.itemListHeight = 92 * this.item.list.length + otherHeight
            } else {
                // 关闭状态 就展示一个
                const childState = this.item.list[0].state
                const otherHeight = childState ? 105 : 0
                this.itemListHeight = 92 + otherHeight
            }
        }
    }
}
</script>
<style lang="scss">
.eqc-photo-filter-group {
    .header {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: #111;
        font-weight: 600;
        margin: 16px 0 0 0;
        transition: all 0.3s;
        padding: 8px 0px;
        cursor: pointer;
        i {
            font-size: 16px;
        }
        &:hover {
            background: #f7f8f9;
        }
    }
    .item-list {
        margin-top: -12px;
        overflow: hidden;
        transition: all 0.3s;
    }
}
</style>
