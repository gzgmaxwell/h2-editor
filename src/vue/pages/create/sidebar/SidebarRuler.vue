<template>
    <div
        class="eqc-panel-ruler"
        @mousedown.stop
        @click.stop
    >
        <div class="switch">
            <span>显示标尺</span>
            <base-switch
                :is-open="ruler.show"
                @onChange="showRuler"
            />
        </div>
        <base-button
            class="blue h36"
            @click.native="clearRuleLine"
        >
            清除参考线
        </base-button>
    </div>
</template>

<script>
import storageLocal from '../../../../utils/storageLocal'
export default {
    computed: {
        ruler() {
            return this.$store.state.guideLine.ruler
        }
    },
    methods: {
        showRuler() {
            this.$store.commit('RULER_SHOW', { show: !this.ruler.show })
            this.setConfigHistory()
        },
        clearRuleLine() {
            this.$store.commit('RULER_CLEAR')
            this.setConfigHistory()
        },
        setConfigHistory() {
            const key = storageLocal.key.rulerConfigHistory
            storageLocal.setItem(key, this.ruler)
        }
    }
}
</script>

<style lang="scss">
.eqc-panel-ruler {
    padding: 28px;
    background: #ffffff;
    border-radius: 4px;
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
    cursor: default;
    transform-origin: right;
    > .switch {
        height: 36px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        color: #111111;
    }
    .blue {
        width: 160px;
        margin-top: 16px;
    }
}
</style>
