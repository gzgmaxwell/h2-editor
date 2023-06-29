<template>
    <transition name="rotate-y-left">
        <div
            v-if="templateColorPanel.show"
            :style="{top:templateColorPanel.position.top+'px',left:templateColorPanel.position.left+'px'}"
            class="eqc-template-color-panel"
            @mouseleave="mouseleave"
        >
            <div class="color-panel">
                <div class="row">
                    <div
                        :class="['color-item', 'colours', isSelected(0,0) ? 'active' : '']"
                        @click="colorItemClick(0,0)"
                    />
                    <div
                        :class="['color-item', isSelected(0,1) ? 'active' : '']"
                        @click="colorItemClick(0,1)"
                    >
                        <div
                            :title="getColorItemTitle(0,1)"
                            :style="getColorItemStyle(0,1)"
                        />
                    </div>
                    <div
                        :class="['color-item', isSelected(0,2) ? 'active' : '']"
                        @click="colorItemClick(0,2)"
                    >
                        <div
                            :title="getColorItemTitle(0,2)"
                            :style="getColorItemStyle(0,2)"
                        />
                    </div>
                    <div
                        :class="['color-item', isSelected(0,3) ? 'active' : '']"
                        @click="colorItemClick(0,3)"
                    >
                        <div
                            :title="getColorItemTitle(0,3)"
                            :style="getColorItemStyle(0,3)"
                        />
                    </div>
                </div>
                <div class="row">
                    <div
                        :class="['color-item', isSelected(1,0) ? 'active' : '']"
                        @click="colorItemClick(1,0)"
                    >
                        <div
                            :title="getColorItemTitle(1,0)"
                            :style="getColorItemStyle(1,0)"
                        />
                    </div>
                    <div
                        :class="['color-item', isSelected(1,1) ? 'active' : '']"
                        @click="colorItemClick(1,1)"
                    >
                        <div
                            :title="getColorItemTitle(1,1)"
                            :style="getColorItemStyle(1,1)"
                        />
                    </div>
                    <div
                        :class="['color-item', isSelected(1,2) ? 'active' : '']"
                        @click="colorItemClick(1,2)"
                    >
                        <div
                            :title="getColorItemTitle(1,2)"
                            :style="getColorItemStyle(1,2)"
                        />
                    </div>
                    <div
                        :class="['color-item', isSelected(1,3) ? 'active' : '']"
                        @click="colorItemClick(1,3)"
                    >
                        <div
                            :title="getColorItemTitle(1,3)"
                            :style="getColorItemStyle(1,3)"
                        />
                    </div>
                </div>
                <div class="row">
                    <div
                        :class="['color-item', isSelected(2,0) ? 'active' : '']"
                        @click="colorItemClick(2,0)"
                    >
                        <div
                            :title="getColorItemTitle(2,0)"
                            :style="getColorItemStyle(2,0)"
                        />
                    </div>
                    <div
                        :class="['color-item', isSelected(2,1) ? 'active' : '']"
                        @click="colorItemClick(2,1)"
                    >
                        <div
                            :title="getColorItemTitle(2,1)"
                            :style="getColorItemStyle(2,1)"
                        />
                    </div>
                    <div
                        :class="['color-item', isSelected(2,2) ? 'active' : '']"
                        @click="colorItemClick(2,2)"
                    >
                        <div
                            class="white"
                            :title="getColorItemTitle(2,2)"
                            :style="getColorItemStyle(2,2)"
                        />
                    </div>
                    <div
                        :class="['color-item', isSelected(2,3) ? 'active' : '']"
                        @click="colorItemClick(2,3)"
                    >
                        <div
                            :title="getColorItemTitle(2,3)"
                            :style="getColorItemStyle(2,3)"
                        />
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>
<script>
export default {
    data() {
        return {
            colorList: [
                { color: '', value: '' },
                { color: '#ffaada', value: '粉色' },
                { color: '#ff0000', value: '红色' },
                { color: '#6600ff', value: '紫色' },
                { color: '#08a1ef', value: '蓝色' },
                { color: '#8fc31f', value: '青色' },
                { color: '#009944', value: '绿色' },
                { color: '#fff100', value: '黄色' },
                { color: '#f08300', value: '橙色' },
                { color: '#000000', value: '黑色' },
                { color: '#ffffff', value: '白色' },
                { color: '#a3afb7', value: '灰色' }
            ]
        }
    },
    computed: {
        templateColorPanel() {
            return Vue.store.state.layout.templateColorPanel
        }
    },
    methods: {
        getColorItemStyle(pRowIndex, pColIndex) {
            return {
                backgroundColor: this.colorList[pRowIndex * 4 + pColIndex].color
            }
        },
        getColorItemTitle(pRowIndex, pColIndex) {
            return this.colorList[pRowIndex * 4 + pColIndex].value
        },
        isSelected(pRowIndex, pColIndex) {
            const index = pRowIndex * 4 + pColIndex
            return this.templateColorPanel.colorSelectedIndex === index
        },
        colorItemClick(pRowIndex, pColIndex) {
            const index = pRowIndex * 4 + pColIndex
            Vue.store.commit('TEMPLATE_COLOR_PANEL_COLOR_SELECTED', {
                colorSelectedIndex: index,
                colorSelectedVal: this.colorList[pRowIndex * 4 + pColIndex].value,
                colorSelectedColor: this.colorList[pRowIndex * 4 + pColIndex].color
            })
        },
        mouseleave() {
            Vue.store.commit('TEMPLATE_COLOR_PANEL', { show: false })
        }
    }
}
</script>
<style lang="scss">
.eqc-template-color-panel {
    position: absolute;
    width: 152px;
    height: 120px;
    z-index: 4;
    transition: all 0.3s;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
    border-radius: 2px;
    perspective: 640px;
    transform-origin: left;
    .color-panel {
        width: 100%;
        height: 100%;
        padding: 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .row {
            height: 24px;
            display: flex;
            justify-content: space-between;
            .color-item {
                height: 24px;
                width: 24px;
                border-radius: 4px;
                cursor: pointer;
                &:hover:not(.active) {
                    transform: scale(1.166);
                    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
                }
                div {
                    width: 100%;
                    height: 100%;
                    border-radius: 2px;
                }
            }
            .colours {
                background: url("../../../../../img/color_bg.png") center center/cover;
                background-size: 24px;
                background-repeat: no-repeat;
            }
            .active {
                border: 1px solid rgba(21, 147, 255, 1);
                padding: 2px;
                transform: scale(1.25);
                background-size: 18px;
            }
            .white {
                border: 1px solid rgba(204, 213, 219, 1);
            }
        }
    }
}
</style>
