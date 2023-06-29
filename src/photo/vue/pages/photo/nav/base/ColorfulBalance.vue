<template>
    <div class="erc-photo-base-color-balance">
        <div class="header">
            <span>色彩平衡</span>
            <div class="show-num">
                <span>{{ qhNum }}</span>
                <span>{{ ylNum }}</span>
                <span style="margin:0">{{ hlNum }}</span>
            </div>
        </div>
        <div>
            <normal-drag-line
                v-for="(option,i) in colorConfig"
                :key="i"
                :option="option"
                @onchange="colorChange"
            />
        </div>
    </div>
</template>
<script>
import NormalDragLine from '../../../../comps/NormalDragLine.vue'
export default {
    components: {
        NormalDragLine
    },
    data() {
        return {
            qhNum: 0,
            ylNum: 0,
            hlNum: 0,
            colorConfig: [
                {
                    type: 3,
                    nameLeft: '青色',
                    nameRight: '红色',
                    key: 'balanceQh', // 青红
                    css: {
                        background: 'linear-gradient(90deg,rgba(0,247,255,1) 0%,rgba(255,0,0,1) 100%)'
                    },
                    range: ['#00f7ff', '#ff0000'],
                    colorConfig: [
                        { r: 0, g: 247, b: 255, percent: 0 },
                        { r: 255, g: 0, b: 0, percent: 100 }
                    ]
                },
                {
                    type: 3,
                    nameLeft: '洋红',
                    nameRight: '绿色',
                    key: 'balanceYl', // 洋绿
                    css: {
                        background: 'linear-gradient(90deg,rgba(255,0,216,1) 0%,rgba(20,239,26,1) 100%)'
                    },
                    range: ['#ff00d8', '#14ef1a'],
                    colorConfig: [
                        { r: 255, g: 0, b: 216, percent: 0 },
                        { r: 20, g: 239, b: 26, percent: 100 }
                    ]
                },
                {
                    type: 3,
                    nameLeft: '黄色',
                    nameRight: '蓝色',
                    key: 'balanceHl', // 黄蓝
                    css: {
                        background: 'linear-gradient(90deg,rgba(255,219,0,1) 0%,rgba(0,76,255,1) 100%)'
                    },
                    range: ['#ffdb00', '#004cff'],
                    colorConfig: [
                        { r: 255, g: 219, b: 0, percent: 0 },
                        { r: 0, g: 76, b: 255, percent: 100 }
                    ]
                }
            ]
        }
    },
    methods: {
        colorChange(key, val) {
            if (key === 'balanceQh') {
                this.qhNum = val
            } else if (key === 'balanceYl') {
                this.ylNum = val
            } else if (key === 'balanceHl') {
                this.hlNum = val
            }
        }
    }
}
</script>
<style lang="scss">
.erc-photo-base-color-balance {
    .header {
        display: flex;
        justify-content: space-between;
        height: 24px;
        font-size: 12px;
        color: #222222;
        line-height: 24px;
        .show-num {
            span {
                display: inline-block;
                margin-right: 8px;
                width: 15px;
                text-align: right;
            }
        }
    }
}
</style>
