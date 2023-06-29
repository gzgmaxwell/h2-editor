<template>
    <div class="eqc-color-linear">
        <div class="color-selected main">
            <div class="color-bg show">
                <div
                    :style="{background: setStyleBackground(background.colors, 90)}"
                    class="color"
                />
            </div>
            <div
                class="value rotate"
                @click="addLove"
            >
                <i class="eqf-star-l" />
            </div>
        </div>
        <div class="color-selected linear">
            <div class="color-box">
                <!-- <div class="arrow"/> -->
                <div class="color-bg item">
                    <div
                        :style="{background: background.colors[0]}"
                        class="color"
                        @click="showColorPanel($event, 0)"
                    />
                </div>
                <span v-if="!background.colors[0]">透明</span>
                <span v-if="background.colors[0]">{{ background.colors[0] | rgb2hex(true) }}</span>
            </div>
            <div
                class="rotate-box"
                @click="setRotate"
            >
                <i class="eqf-flip" />
            </div>
            <div class="color-box">
                <!-- <div class="arrow"/> -->
                <div class="color-bg item">
                    <div
                        :style="{background: background.colors[1]}"
                        class="color"
                        @click="showColorPanel($event, 1)"
                    />
                </div>
                <span v-if="!background.colors[1]">透明</span>
                <span v-if="background.colors[1]">{{ background.colors[1] | rgb2hex(true) }}</span>
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
                :style="{background: index === 0 ? '' : setStyleBackground(item)}"
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
                :style="{background: setStyleBackground(item)}"
                class="item"
                @click="chooseColor(item)"
            >
                <i
                    class="delete eqf-no"
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
            clientHeight: document.documentElement.clientHeight || document.body.clientHeight,
            colorIndex: 0,
            hotColors: [
                ['', ''], /** align **/ ['#626262', '#000000'], ['#FFFFFF', '#D9D9D9'], ['#FF1919', '#960000'], ['#FF3A19', '#F47365'], ['#FF7433', '#FFB243'], ['#FFA449', '#FFF623'],
                ['#D8FF00', '#5FE793'], ['#73FFB0', '#00B644'], ['#B4EC51', '#429321'], ['#00E5FF', '#1593FF'], ['#1593FF', '#5D61FF'], ['#1F66E1', '#1C1FA3'], ['#ABABF3', '#729FE4'],
                ['#FBC1FF', '#8D91FF'], ['#7762FF', '#4B4FFF'], ['#FF8FE6', '#FF52AF'], ['#A470E9', '#BF3DCE'], ['#FF104F', '#FC3CAD'], ['#7F1862', '#3F0D2F'], ['#C67D7D', '#985353']
            ],
            colorKey: storageLocal.key.bgLinearColor,
            loveColors: []
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
            return this.background.colors[0] + this.background.colors[1] === '' // 没有颜色不能设置透明度
        },
        isBackgroundBottom() {
            return this.tab === 'bottom'
        }
    },
    watch: {
        'customColor.color': function (color) {
            const colors = this.background.colors.slice() // 需要一个新对象，才能监测到变化
            colors[this.colorIndex] = color
            this.background.colors = colors
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
        setStyleBackground(item, rotate = 0) {
            return `linear-gradient(${rotate}deg, ${item[0] || 'transparent'} 0%, ${item[1] || 'transparent'} 100%)`
        },
        setRotate() {
            let rotate = this.background.rotate
            rotate += 90
            if (rotate >= 360) {
                rotate -= 360
            }
            this.background.rotate = rotate
            this.setBackground(this.background)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        chooseColor(colors) {
            this.background.colors = colors
            if (!this.isBackgroundBottom) {
                this.background.opacity = 0.4
            }
            this.background.type = 1
            this.setBackground(this.background)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        setBackground(background) {
            this.isBackgroundBottom
                ? this.eqxPage.eqxBackground.setBackgroundBottom(background)
                : this.eqxPage.eqxBackground.setBackgroundTop(background)
        },
        addLove() {
            const colors = this.background.colors
            const loveColors = this.loveColors
            // 空颜色不能收藏
            if (!colors[0] && !colors[1]) {
                return
            }
            // 如果收藏过这个颜色，则删除重新收藏
            if (loveColors.includes(colors)) {
                const index = loveColors.indexOf(colors)
                loveColors.splice(index, 1)
            }
            // 如果收藏有20个了，则第一个删除，重新收藏
            if (loveColors.length >= 20) {
                loveColors.splice(0, 1)
            }
            loveColors.unshift(colors)
            storageLocal.setItem(this.colorKey, loveColors)
        },
        deleteLove(index) {
            this.loveColors.splice(index, 1)
            storageLocal.setItem(this.colorKey, this.loveColors)
        },
        showColorPanel(e, index) {
            document.addEventListener('mousedown', this.hideColorPanel)
            this.customColor.color = this.background.colors[index]
            this.colorIndex = index
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
.eqc-color-linear {
    padding: 16px 0;
    .color-selected {
        height: 30px;
        // margin-bottom: 16px;
        display: flex;
        justify-content: space-between;
        &.main {
            border: 1px solid #ccd5db;
        }
        .color-box {
            display: flex;
            // justify-content: center;
            align-items: center;
            width: 96px;
            height: 30px;
            border: 1px solid #ccd5db;
            .item {
                width: 24px;
                height: 24px;
                border: 0px;
                margin-left: 3px;
                margin-right: 8px;
            }
            span {
                font-size: 13px;
            }
        }
        .rotate-box {
            width: 40px;
            height: 30px;
            border: 1px solid #ccd5db;
            text-align: center;
            line-height: 30px;
            margin: 0 12px;
            cursor: pointer;
            transition: all 0.3s;
            &:hover {
                color: #fff;
                background: $blue-normal;
                border: 1px solid $blue-normal;
            }
        }
        .color-bg {
            width: 28px;
            height: 28px;
            border: 1px solid #ccd5db;
            background: url("../../../../../img/opacity.png") center;
            cursor: pointer;
            &:hover {
                border: 1px solid rgb(8, 161, 239);
            }
            .color {
                height: 100%;
            }
            &.show {
                border: 0px solid #ccd5db;
                width: 226px;
                cursor: default;
            }
        }
        .value {
            width: 76px;
            height: 100%;
            border-left: 1px solid #ccd5db;
            background: #fff;
            line-height: 28px;
            text-align: center;
            &.rotate {
                width: 30px;
                cursor: pointer;
                transition: all 0.3s;
                &:hover {
                    color: #fff;
                    background: $blue-normal;
                    border: 1px solid $blue-normal;
                }
            }
        }
    }
    .linear {
        height: auto;
        margin-top: 12px;
        margin-bottom: 16px;
    }
    .property {
        display: flex;
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
                color: #76838f;
                background: #fff;
                transition: all 0.3s;
                &:hover {
                    color: #fff;
                    background: $blue-normal;
                    border: 1px solid $blue-normal;
                    transform: scale(1);
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
                color: #fff;
                background: #2f3c4d;
                border-radius: 100px;
                transition: all 0.3s;
                &:hover {
                    background: $red-normal;
                }
            }
            &:hover {
                box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.16);
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
