<template>
    <div
        class="eqc-table-style-item"
        :style="{borderColor:config[2]}"
        @click="tableClick"
    >
        <span
            v-for="(item,i) in totalCells"
            :key="i"
            class="table-item"
            :style="{background:showBackground(item),borderColor:config[2]}"
            :class="{columnHeader:item%4===1&&item!==0,rowHeader:item<=4}"
        />
    </div>
</template>
<script>
export default {
    props: {
        config: {
            type: Array,
            // 第一个是顶栏、左侧栏、分割线、内容区域
            default: () => ['#E5F1F5', '#F0F3F4', '#CCD5DB', '#FFFFFF']
        }
    },
    data() {
        return {
            totalCells: 16
        }
    },
    computed: {
        showBackground() {
            return (i) => {
                if (i <= 4) {
                    return this.config[0] // 顶栏颜色
                } else if (i % 4 === 1) {
                    return this.config[1]
                } else {
                    return this.config[3]
                }
            }
        }
    },
    methods: {
        tableClick() {
            this.$emit('tableClick', this.config)
        }
    }
}
</script>
<style lang="scss">
.eqc-table-style-item {
    display: grid;
    border-top: 1px solid rgba(204, 213, 219, 1);
    border-left: 1px solid rgba(204, 213, 219, 1);
    width: 112px;
    height: 52px;
    display: grid;
    grid-template-rows: repeat(4, 1fr);
    grid-template-columns: repeat(4, 1fr);
    cursor: pointer;

    .table-item {
        border-right: 1px solid rgba(204, 213, 219, 1);
        border-bottom: 1px solid rgba(204, 213, 219, 1);
    }
}
</style>
