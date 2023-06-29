<template>
    <div
        :style="{width: eqxPage.width + 'px', height: eqxPage.height + 'px', transform: `translate(${eqxPage.moveX}px, ${eqxPage.moveY}px)`}"
        class="eqc-grid-line"
    >
        <div
            v-for="x of grid.colNum - 1"
            :key="'x' + x"
            :style="{top: x / grid.colNum * 100 + '%'}"
            class="line x"
        />
        <div
            v-for="y of grid.rowNum - 1"
            :key="'y' + y"
            :style="{left: y / grid.rowNum * 100 + '%'}"
            class="line y"
        />
    </div>
</template>

<script>
export default {
    computed: {
        grid() {
            return this.$store.state.guideLine.grid
        },
        eqxPage() {
            return this.$store.state.scene.eqxPage
        }
    }
}
</script>

<style lang="scss">
.eqc-grid-line {
    position: absolute;
    pointer-events: none;
    .line {
        position: absolute;
        &.x {
            left: 0;
            width: 100%;
            height: 0;
            border-bottom: 1px dashed #ff2a6a;
        }
        &.y {
            top: 0;
            width: 0;
            height: 100%;
            border-right: 1px dashed #ff2a6a;
        }
    }
}
</style>
