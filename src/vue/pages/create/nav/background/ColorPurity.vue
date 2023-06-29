<template>
    <div class="eqc-color-purity">
        <div class="color-selected">
            <div class="color-bg">
                <div
                    :style="{background: background.color}"
                    class="color"
                    @click="showColorPanel($event, background.color)"
                />
            </div>
            <div
                v-if="!background.color"
                class="value"
            >
                透明
            </div>
            <div
                v-if="background.color"
                class="value"
            >
                {{ background.color | rgb2hex(true) }}
            </div>
            <div class="collect">
                <i
                    class="eqf-star-l"
                    @click="addLove"
                />
            </div>
        </div>
        <div
            v-if="!isBackgroundBottom"
            class="property"
        >
            <div class="name">
                透明度
            </div>
            <base-input
                :model="background"
                :min="0"
                :max="100"
                :reverse="true"
                :style="{pointerEvents: disableOpacity ? 'none' : '', background: disableOpacity ? '#ECEEF0' : ''}"
                class="input"
                model-key="opacity"
                unit=""
                unit-view="%"
            />
        </div>
        <div class="color-name">
            推荐颜色
        </div>
        <ul class="color-list">
            <li
                v-for="(item, index) of hotColors"
                :key="index"
                :style="{background: index === 0 ? '' : item,border:index===2?'1px solid #ccd5db':''}"
                :class="{clear: index === 0}"
                class="item"
                @click="chooseColor(item)"
            />
        </ul>
        <div class="color-name">
            收藏颜色
        </div>
        <ul class="color-list">
            <li
                class="item add"
                @click="addLove"
            >
                <i class="eqf-plus" />
            </li><li
                v-for="(item, index) of loveColors"
                :key="index"
                :style="{background: item}"
                class="item"
                @click="chooseColor(item)"
            >
                <i
                    class="delete eqf-minus-f"
                    @click="deleteLove(index)"
                />
            </li>
        </ul>
    </div>
</template>

<script>
import storageLocal from '../../../../../utils/storageLocal'

export default {
    props: {
        tab: {
            type: String,
            default: 'bottom' // top
        }
    },
    data() {
        return {
            customColor: {
                color: ''
            },
            hotColors: [
                '', /****/ '#000000', '#FFFFFF', '#FF1900', '#F47365', '#FFB243', '#FFE623',
                '#6EFF2A', '#5FE793', '#1BC7B1', '#00BEFF', '#2E81FF', '#8D91FF', '#5D61FF',
                '#FF89CF', '#FC3CAD', '#BF3DCE', '#8E00A7', '#66004A', '#A36565', '#5D1B1B'
            ],
            colorKey: storageLocal.key.bgPurityolor,
            loveColors: [],
            clientHeight: document.documentElement.clientHeight || document.body.clientHeight
        }
    },
    computed: {
        eqxPage() {
            return this.$store.state.scene.eqxPage
        },
        background() {
            const background = this.eqxPage.pageJson.properties.background
            return this.isBackgroundBottom ? background.bottom : background.top
        },
        disableOpacity() {
            return this.background.color === '' // 没有颜色不能设置透明度
        },
        isBackgroundBottom() {
            return this.tab === 'bottom'
        }
    },
    watch: {
        'customColor.color': function (color) {
            this.background.color = color
            this.setBackground(this.background)
        },
        'background.opacity': function (opacity) {
            this.background.opacity = opacity
            this.setBackground(this.background)
        }
    },
    created() {
        this.loveColors = storageLocal.getItem(this.colorKey) || []
    },
    methods: {
        chooseColor(color) {
            this.background.color = color
            if (!this.isBackgroundBottom) {
                this.background.opacity = 0.4
            }
            this.background.type = 0
            this.setBackground(this.background)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        setBackground(background) {
            this.isBackgroundBottom
                ? this.eqxPage.eqxBackground.setBackgroundBottom(background)
                : this.eqxPage.eqxBackground.setBackgroundTop(background)
        },
        addLove() {
            const color = this.background.color
            const loveColors = this.loveColors
            // 空颜色不能收藏
            if (!color) {
                return
            }
            // 如果收藏过这个颜色，则删除重新收藏
            if (loveColors.includes(color)) {
                const index = loveColors.indexOf(color)
                loveColors.splice(index, 1)
            }
            // 如果收藏有20个了，则第一个删除，重新收藏
            if (loveColors.length >= 20) {
                loveColors.splice(0, 1)
            }
            loveColors.unshift(color)
            storageLocal.setItem(this.colorKey, loveColors)
        },
        deleteLove(index) {
            this.loveColors.splice(index, 1)
            storageLocal.setItem(this.colorKey, this.loveColors)
        },
        showColorPanel(e, color) {
            document.addEventListener('mousedown', this.hideColorPanel)
            this.customColor.color = color
            const maxTop = this.clientHeight - 338
            let top = e.pageY
            if (top >= maxTop) {
                top = maxTop
            }
            this.colorPicker.open(this.customColor, 'color', { left: '356px', top: top + 'px' })
        },
        hideColorPanel() {
            if (!this.colorPicker.getState().isOpenSucker) {
                document.removeEventListener('mousedown', this.hideColorPanel)
                this.colorPicker.close()
                this.eqxPage.eqxHistory.add(this.eqxPage)
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-color-purity {
    padding: 16px 0;
    .color-selected {
        height: 30px;
        display: flex;
        justify-content: space-between;
        border: 1px solid #ccd5db;
        .color-bg {
            width: 158px;
            height: 100%;
            background: url("../../../../../img/opacity.png") center;
            cursor: pointer;
            .color {
                height: 100%;
            }
        }
        .value {
            width: 68px;
            height: 100%;
            background: #fff;
            line-height: 28px;
            text-align: center;
            border-left: 1px solid #ccd5db;
            border-right: 1px solid #ccd5db;
            font-size: 13px;
        }
        .collect {
            width: 28px;
            height: 100%;
            font-size: 14px;
            text-align: center;
            line-height: 28px;
            background: #f6f9fa;
            cursor: pointer;
            i {
                &:hover {
                    color: #1593ff;
                }
            }
        }
        &.linear {
            .color {
                width: 40px;
            }
            &.show {
                margin-bottom: 16px;
                .color {
                    width: 218px;
                }
                .value {
                    width: 30px;
                }
            }
        }
    }
    .property {
        display: flex;
        margin-top: 16px;
        .name {
            width: 88px;
            height: 30px;
            line-height: 30px;
            font-size: 12px;
        }
        .input {
            flex: 1;
        }
    }
    .color-name {
        height: 40px;
        line-height: 40px;
        font-size: 13px;
        color: #111;
        font-weight: bold;
    }
    .color-list {
        .item {
            // box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.16);
            border-radius: 3px;
            display: inline-block;
            width: 28px;
            height: 28px;
            margin: 10px 0 0 10px;
            vertical-align: top;
            cursor: pointer;
            transition: transform 0.1s;
            &:nth-child(7n + 1) {
                margin-left: 0;
            }
            &:nth-child(-n + 7) {
                margin-top: 0;
            }
            &.clear {
                background: url("../../../../../img/opacity.png") center;
            }
            &.add {
                display: inline-flex;
                justify-content: center;
                align-items: center;
                font-size: 18px;
                border: 1px solid #ccd5db;
                color: #2f3c4d;
                background: #f0f3f4;
                transition: all 0.3s;
                &:hover {
                    color: #fff;
                    background: $blue-normal;
                    border: 1px solid $blue-normal;
                    transform: scale(1);
                    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.16);
                }
            }
            .delete {
                position: relative;
                right: -8px;
                top: -8px;
                width: 16px;
                height: 16px;
                display: none;
                float: right;
                text-align: center;
                line-height: 16px;
                color: #2f3c4d;
                background: #fff;
                border: 1px solid white;
                border-radius: 50%;
                transition: all 0.3s;
                &:hover {
                    color: $red-normal;
                }
            }
            &:hover {
                transform: scale(1.2);
                box-shadow: $boxShadow;
                .delete {
                    display: block;
                }
            }
        }
    }
}
</style>
