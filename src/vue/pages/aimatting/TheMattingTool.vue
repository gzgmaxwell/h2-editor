<template>
    <div class="eqc-aimatting-tool">
        <div class="tool-list">
            <div
                :class="{'tool-btn-selected' : penSelect === 'keep'}"
                class="tool-btn"
                @click="changePen('keep')"
            >
                <i
                    :style="{'color' : penSelect === 'keep' ? '#ffffff' : '#1593FF'}"
                    class="icon-keep eqf-plus-f"
                />
                <span>保留</span>
            </div>
            <div
                :class="{'tool-btn-selected' : penSelect === 'drop'}"
                class="tool-btn"
                @click="changePen('drop')"
            >
                <i
                    :style="{'color' : penSelect === 'drop' ? '#ffffff' : '#FF2A6A'}"
                    class="icon-drop eqf-minus-f"
                />
                <span>抠除</span>
            </div>
            <div class="pen-input pleft">
                <div class="name">
                    笔刷
                </div>
                <!--:style="{backgroundSize: penWidth/50*100 +'% 100%'}"-->
                <input
                    v-model="penWidth"
                    type="range"
                    min="1"
                    max="50"
                >
                <div class="input-bg" />
                <div class="unit">
                    {{ penWidth }}
                </div>
            </div>
            <div
                ref="smoothness"
                class="pen-input pright btn-disabled"
            >
                <div class="name">
                    羽化
                </div>
                <!--:style="{backgroundSize: smoothness/10*100 +'% 100%'}"-->
                <input
                    v-model="smoothness"
                    type="range"
                    min="1"
                    max="10"
                >
                <div class="unit">
                    {{ smoothness }}
                </div>
            </div>
            <div class="color-picker">
                <div
                    :class="[{clear:mattingStatus},{forbidden:!mattingStatus},{'btn-disabled':!mattingStatus}]"
                    class="color"
                >
                    <div
                        :style="{backgroundColor: filledColor}"
                        style="width:18px;height:18px;"
                        @mousedown.stop
                        @click="showColorPanel($event, filledColor)"
                    />
                </div>
                <div class="name">
                    填充
                </div>
            </div>
        </div>
        <a
            class="feedback"
            href="//h5.ebdan.net/ls/3aiQ0Yrp"
            target="_blank"
        >
            <i class="icon eqf-comment-l" />
            <p>反馈</p>
        </a>
    </div>
</template>

<script>

export default {
    props: {
        data: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            penSelect: 'keep',
            customColor: {
                color: ''
            },
            penColor: 'rgba(21,147,255,1)',
            penWidth: '20',
            smoothness: 0
        }
    },
    computed: {
        matting() {
            return Vue.store.state.aiMatting
        },
        filledColor() {
            return this.matting.filledColor
        },
        mattingStatus() {
            return this.matting.status
        }
    },
    watch: {
        'customColor.color': function (color) {
            Vue.store.commit('AIMATTING_MATTING_FILL_COLOR', color)
        },
        smoothness: {
            handler(newVal) {
                Vue.store.commit('AIMATTING_MATTING_SMOOTHNESS', newVal)
            }

        },
        penWidth: {
            handler(newVal) {
                Vue.store.commit('AIMATTING_MATTING_PEN_WIDTH', newVal)
            }
        }

    },
    created() {

    },
    methods: {
        changePen(type) {
            Vue.store.commit('AIMATTING_MATTING_PEN_MODE', type)
            this.penSelect = type
        },
        showColorPanel(e, color) {
            document.addEventListener('mousedown', this.hideColorPanel)
            this.customColor.color = color
            this.colorPicker.open(this.customColor, 'color', { left: '35%', bottom: '100px', zIndex: 100 }, false)
        },
        hideColorPanel() {
            if (!this.colorPicker.getState().isOpenSucker) {
                this.colorPicker.close()
                document.removeEventListener('mousedown', this.hideColorPanel)
            }
        },
        resetTool() {
            this.changePen('keep')
            this.penWidth = '20'
            this.smoothness = 0
            this.customColor.color = ''
            this.$refs.smoothness.classList.add('btn-disabled')
            Vue.store.commit('AIMATTING_MATTING_STATUS', false)
        }
    }
}
</script>

<style lang="scss">
.eqc-aimatting-tool {
    user-select: none;
    position: relative;
    .tool-list {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        left: calc(50% - 274px);
        height: 44px;
        bottom: 20px;
        width: 548px;
        background: #fff;
        box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.16);
        border-radius: 22px;
        z-index: 4;
        .tool-btn {
            width: 80px;
            height: 36px;
            line-height: 36px;
            background: #ffffff;
            border-radius: 18px;
            font-size: 14px;
            color: #2f3c4d;
            text-align: center;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            margin: 0 2px;
            cursor: pointer;
            &:hover {
                background: rgba(236, 238, 240, 1);
                color: #2f3c4d;
            }
            &:hover .icon-keep {
                color: #1593ff !important;
            }
            &:hover .icon-drop {
                color: #ff2a6a !important;
            }
            .icon-keep {
                color: #1593ff;
                margin-right: 10px;
            }
            .icon-drop {
                color: #ff2a6a;
                margin-right: 10px;
            }
        }
        .tool-btn-selected {
            background: #1593ff;
            color: #ffffff;
        }
        .pen-input {
            height: 20px;
            color: #2f3c4d;
            background: #fff;
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: center;
            align-items: center;
            font-size: 13px;
            .name {
                width: 34px;
                height: 100%;
                line-height: 20px;
                text-align: center;
            }
            input[type="range"] {
                width: 52px;
                height: 2px;
                // margin-left: 12px;
                font-size: 13px;
                color: #2f3c4d;
                background: #ccd5db;
                margin-right: 1px;
                -webkit-appearance: none !important;
                // background: -webkit-linear-gradient(#059cfa, #059cfa) no-repeat;
                background-size: 0% 100%;
            }
            input[type="range"]::-webkit-slider-thumb {
                // 滑块
                -webkit-appearance: none;
                cursor: pointer;
                width: 20px;
                height: 20px;
                background: #1593ff;
                border: 6px solid #ffffff;
                box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
                border-radius: 50%;
            }
            input[type="range"]::-moz-range-thumb {
                // 滑块
                -webkit-appearance: none;
                cursor: pointer;
                width: 8px;
                height: 8px;
                background: #1593ff;
                border: 6px solid #ffffff;
                border-radius: 50%;
                box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
            }

            .unit {
                width: 24px;
                font-size: 13px;
                text-align: center;
            }
        }
        .pleft {
            border-left: 1px solid #ccd5db;
            padding-left: 16px;
            margin-left: 10px;
            margin-right: 16px;
        }
        .pright {
            border-right: 1px solid #ccd5db;
            padding-right: 16px;
        }
        .btn-disabled {
            color: #ccd5db;
            cursor: auto;
            pointer-events: none;
        }
        .color-picker {
            height: 36px;
            color: #76838f;
            background: #fff;
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: center;
            align-items: center;
            margin-left: 16px;
            border-radius: 3px;
            .color {
                width: 18px;
                height: 18px;
                margin: 0 9px 0 0;
                border: 1px solid #ccd5db;
                border-radius: 3px;
                cursor: pointer;
                overflow: hidden;
            }
        }
        .clear {
            background: url("../../../img/opacity.png") center;
        }
        .forbidden {
            background: url("../../../img/line.png") center;
        }
    }
    .feedback {
        width: 80px;
        height: 36px;
        background: rgba(255, 255, 255, 1);
        box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
        border-radius: 18px;
        position: absolute;
        right: 24px;
        bottom: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        .icon {
            font-size: 16px;
            margin-right: 3px;
            margin-top: 2px;
        }
        p {
            font-size: 14px;
        }
        &:hover {
            background: #1593ff;
            color: #ffffff;
        }
    }
}
</style>
