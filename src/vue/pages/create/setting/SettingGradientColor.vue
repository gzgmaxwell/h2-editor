<template>
    <div
        class="eqc-setting-gradient-color"
    >
        <div
            class="current"
        >
            <div
                :class="{border:showBorder}"
                :style="{backgroundImage: backgroundImage}"
                class="color"
            />
            <div class="box">
                <div class="left">
                    <div class="arrow" />
                    <setting-color
                        :model="model"
                        :model-key="modelKey"
                        model-key-type="0"
                        class="color-hover"
                    />
                </div>
                <div class="dir-btn">
                    <i
                        class="change eqf-refresh-cw"
                        @click="switchColorDirection"
                    />
                </div>
                <div class="right">
                    <div class="arrow" />
                    <setting-color
                        :model="model"
                        :model-key="modelKey"
                        model-key-type="1"
                        class="color-hover"
                    />
                </div>
            </div>
        </div>
        <div
            class="contentColor"
        >
            <p
                v-for="(item,index) of colors"
                :key="index"
                :style="{background: 'linear-gradient(90deg, '+item[0]+' 0%, '+item[1]+' 100%)'}"
                class="colors"
                @click="selsectColor(item)"
            />
        </div>
    </div>
</template>

<script>
import SettingColor from './SettingColor.vue'

export default {
    components: {
        SettingColor
    },
    props: {
        model: {
            type: Object,
            default: null
        },
        modelKey: {
            type: String,
            default: null
        },
        eqxElement: {
            type: Object,
            default: null
        },
        showBorder: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            colors: [
                { 0: '#626262', 1: '#000000' }, { 0: '#FFFFFF', 1: '#D9D9D9' }, { 0: '#FFA449', 1: '#FFE623' }, { 0: '#D8FF00', 1: '#5FE793' }, { 0: '#73E1FF', 1: '#1BC7B1' },

                { 0: '#FF3A19', 1: '#F47365' }, { 0: '#FF7896', 1: '#FFB243' }, { 0: '#5D61FF', 1: '#FF15F5' }, { 0: '#FF104F', 1: '#FC3CAD' }, { 0: '#753A16', 1: '#5B3D13' },

                { 0: '#1593FF', 1: '#5D61FF' }, { 0: '#ABABF3', 1: '#729FE4' }, { 0: '#FBC1FF', 1: '#8D91FF' }, { 0: '#7762FF', 1: '#4B4FFF' }, { 0: '#B4EC51', 1: '#429321' }
            ],
            backgroundImage: '',
            selected: []
        }
    },
    computed: {
        scene() {
            return this.$store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        }
    },
    watch: {
        model: {
            handler(newVal) {
                const { gradient } = this.eqxElement.elementJson.property
                if (gradient) {
                    this.backgroundImage = `linear-gradient(90deg, ${gradient.colors[0]} 0%, ${gradient.colors[1]} 100%)`
                }
            },
            deep: true
        }
    },
    mounted() {
        const { gradient } = this.eqxElement.elementJson.property
        if (gradient) {
            this.backgroundImage = `linear-gradient(90deg, ${gradient.colors[0]} 0%, ${gradient.colors[1]} 100%)`
        }
    },
    methods: {
        selsectColor(item) {
            this.backgroundImage = `linear-gradient(90deg, ${item[0]} 0%, ${item[1]} 100%)`
            if (this.model[this.modelKey]) {
                this.model[this.modelKey].colors = item
                this.model[this.modelKey].angle = 90
                this.model[this.modelKey].enabled = true
            }
        },
        switchColorDirection() {
            const { gradient } = this.eqxElement.elementJson.property
            let rotate = gradient.angle
            rotate += 90
            if (rotate >= 360) {
                rotate -= 360
            }

            this.eqxElement.updateProperty({ gradient: { enabled: true, angle: rotate, colors: gradient.colors } })
            this.eqxPage.eqxHistory.add(this.eqxPage)
        }
    }
}
</script>

<style lang="scss">
.eqc-setting-gradient-color {
    width: 100%;
    position: relative;
    .current {
        .border {
            border: 2px solid #1593ff !important;
        }
        .color {
            width: 100%;
            height: 28px;
            border: 1px solid rgba(204, 213, 219, 1);
        }
        .box {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            .left,
            .right {
                width: 28px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                .arrow {
                    width: 0;
                    height: 0;
                    border-width: 5px;
                    border-style: solid;
                    border-color: transparent transparent #76838f transparent;
                }
                .color-hover:hover {
                    border: 1px solid rgb(8, 161, 239);
                }
                .color-hover {
                    .color:hover {
                        border: 1px solid rgb(8, 161, 239);
                    }
                }
                &:hover .arrow {
                    border-color: transparent transparent rgb(8, 161, 239) transparent;
                }
            }
            .dir-btn {
                width: 40px;
                height: 30px;
                background: rgba(255, 255, 255, 1);
                border-radius: 2px;
                border: 1px solid rgba(204, 213, 219, 1);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            }
        }
    }
    .contentColor {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        margin-top: 8px;
        p {
            transition: all 0.1s linear;
            width: 28px;
            height: 28px;
            margin-bottom: 3px;
            cursor: pointer;
            &:hover {
                transform: scale(1.2);
                box-shadow: $boxShadow;
            }
        }
    }
}
</style>
