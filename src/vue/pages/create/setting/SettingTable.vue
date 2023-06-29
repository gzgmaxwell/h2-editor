<template>
    <div
        class="eqc-setting-table"
    >
        <div
            class="title-box"
            @click="toggleClick('table')"
        >
            <span class="name">表格</span>
            <i :class="{'eqf-down':tableHeight,'eqf-right':!tableHeight}" />
        </div>
        <div
            class="table-box"
            :style="{height:tableHeight+'px',borderBottom:tableHeight?'1px solid #ccd5db':''}"
        >
            <div class="inline-title">
                <span>风格</span>
            </div>
            <div
                class="table-model"
                @click="openTableStyleLayer"
            >
                <table-style-item :config="showTableStyle" />
                <i class="eqf-menu-right" />
            </div>
            <div class="inline-title">
                <span>描边颜色</span>
            </div>
            <setting-color
                :model="tableCss"
                model-key="borderColor"
            />
            <div class="row-column">
                <div class="box row">
                    <span class="name">行</span>
                    <input
                        v-model.number="rows"
                        class="value"
                        @blur="rowsChange"
                    >
                </div>
                <div class="box column">
                    <span class="name">列</span>
                    <input
                        v-model.number="columns"
                        class="value"
                        @blur="columnsChange"
                    >
                </div>
            </div>
        </div>
        <div
            class="title-box"
            @click="toggleClick('cell')"
        >
            <span class="name">单元格样式</span>
            <i :class="{'eqf-down':cellHeight,'eqf-right':!cellHeight}" />
        </div>
        <div
            class="cell-box"
            :style="{height:cellHeight+'px',borderBottom:cellHeight?'1px solid #ccd5db':''}"
        >
            <div class="inline-title">
                <span class="name">字体</span>
            </div>
            <div
                class="font-style-btn"
                @click="fontTextSelect()"
            >
                <span>{{ showFontFamilyName }}</span>
                <i class="icon eqf-menu-right" />
            </div>
            <div class="inline-title">
                文字颜色字号
            </div>
            <div
                class="content"
            >
                <div class="left">
                    <setting-color
                        :model="cellCss"
                        :is-muti="colorIsMuti"
                        model-key="color"
                    />
                </div>
                <div
                    class="right"
                >
                    <base-input
                        :model="cellCss"
                        :min="12"
                        :is-muti="fontIsMuti"
                        model-key="fontSize"
                    />
                </div>
            </div>
            <div class="inline-title">
                <span>背景颜色</span>
            </div>
            <setting-color
                :model="cellCss"
                model-key="background"
                :is-muti="backgroundIsMuti"
            />
            <setting-text-align
                :model="cellCss"
                model-key="justifyContent"
                :state="0"
                :is-muti="justifyContentIsMuti"
            />
            <setting-text-style
                :model="cellCss"
            />
        </div>
    </div>
</template>
<script>
import SettingColor from './SettingColor.vue'
import SettingTextAlign from './SettingTextAlign.vue'
import SettingTextStyle from './SettingTextStyle.vue'
import TableStyleItem from './TableStyleItem.vue'
export default {
    components: {
        SettingColor, SettingTextAlign, SettingTextStyle, TableStyleItem
    },
    props: {
        eqxElement: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            tableModelItems: 16,
            tableHeight: 222,
            cellHeight: 298,
            rows: 0,
            columns: 0,
            isAllow: true,
            tableCss: {
                borderColor: ''
            },
            cellCss: {
                fontSize: 13,
                color: 'black',
                background: 'white',
                justifyContent: 'center',
                fontWeight: '',
                fontStyle: '',
                textDecoration: ''
            },
            colorIsMuti: false,
            fontIsMuti: false,
            backgroundIsMuti: false,
            justifyContentIsMuti: false
        }
    },
    computed: {
        scene() {
            return this.$store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        showFontFamilyName() {
            // 展示fontFamilyName 如果是多个不一致的 则展示... 一致则展示为fontfamily name
            const selectedCells = this.eqxElement.getAllSelectedCell()
            if (selectedCells.length === 0) {
                return '默认字体'
            } else if (selectedCells.length === 1) {
                let showName = '默认字体'
                if (selectedCells[0].property && selectedCells[0].property.fontFamilyName) {
                    showName = selectedCells[0].property.fontFamilyName
                }
                return showName || '默认字体'
            } else {
                let showName = selectedCells[0].property.fontFamilyName
                selectedCells.map(cell => {
                    if (showName !== cell.property.fontFamilyName) {
                        showName = '...'
                    }
                })
                return showName
            }
        },
        fontTextLayer() {
            return this.$store.state.fontStyle.text
        },
        tableHeightShow() {
            return 222
        },
        cellHeightShow() {
            return 298
        },
        property() {
            return this.eqxElement.elementJson.property
        },
        tableClickTimestamp() {
            return Vue.store.state.scene.tableClickTimestamp
        },
        tableStyleLayer() {
            return Vue.store.state.scene.tableStyleLayer
        },
        showTableStyle() {
            if (this.property.headerColor) {
                const { headerColor, leftHeaderColor, borderColor, backgroundColor } = this.property
                return [headerColor, leftHeaderColor, borderColor, backgroundColor]
            } else {
                return ['#E5F1F5', '#F0F3F4', '#CCD5DB', '#FFFFFF']
            }
        }
    },
    watch: {
        property: {
            handler(newValue) {
                this.rows = newValue.rows
                this.columns = newValue.columns
            },
            deep: true
        },
        tableCss: {
            handler(newCss) {
                // 只做borderColor的 更新
                this.eqxElement.elementJson.tableCss.borderColor = newCss.borderColor
                this.eqxElement.updateTableCss(newCss)
                this.eqxPage.eqxHistory.add(this.eqxPage)
            },
            deep: true
        },
        cellCss: {
            handler() {
                if (this.isAllow) {
                    const copyCss = JSON.parse(JSON.stringify(this.cellCss))
                    if (this.cellCss.background === '...') {
                        delete copyCss.background
                    }
                    if (this.cellCss.color === '...') {
                        delete copyCss.color
                    }
                    this.eqxElement.updateCellCss(copyCss)
                    this.eqxPage.eqxHistory.add(this.eqxPage)
                } else {
                    this.isAllow = true
                }
            },
            deep: true
        },
        tableClickTimestamp() {
            // 每次点击cell 都会变
            this.isAllow = false
            this.colorIsMuti = false
            this.fontIsMuti = false
            this.backgroundIsMuti = false
            this.justifyContentIsMuti = false
            const selectedCells = this.eqxElement.getAllSelectedCell()
            if (selectedCells.length === 1) {
                const css = selectedCells[0].css
                this.cellCss.color = css.color
                this.cellCss.fontSize = css.fontSize
                this.cellCss.background = css.background
                this.cellCss.justifyContent = css.justifyContent
                this.cellCss.fontWeight = css.fontWeight
                this.cellCss.fontStyle = css.fontStyle
                this.cellCss.textDecoration = css.textDecoration
            } else {
                const css = selectedCells[0].css
                let fontWeightFlag = true
                let fontStyleFlag = true
                let textDecorationFlag = true
                selectedCells.map(cell => {
                    if (css.color !== cell.css.color) {
                        this.cellCss.color = '...'
                    }
                    if (css.fontSize !== cell.css.fontSize) {
                        this.fontIsMuti = true
                    }
                    if (css.background !== cell.css.background) {
                        // this.backgroundIsMuti = true
                        this.cellCss.background = '...'
                    }
                    if (css.justifyContent !== cell.css.justifyContent) {
                        this.justifyContentIsMuti = true
                    }
                    if (css.fontWeight !== cell.css.fontWeight) {
                        fontWeightFlag = false
                    }
                    if (css.fontStyle !== cell.css.fontStyle) {
                        fontStyleFlag = false
                    }
                    if (css.textDecoration !== cell.css.textDecoration) {
                        textDecorationFlag = false
                    }
                })
                if (fontWeightFlag) {
                    this.cellCss.fontWeight = selectedCells[0].css.fontWeight
                } else {
                    this.cellCss.fontWeight = ''
                }
                if (fontStyleFlag) {
                    this.cellCss.fontStyle = selectedCells[0].css.fontStyle
                } else {
                    this.cellCss.fontStyle = ''
                }
                if (textDecorationFlag) {
                    this.cellCss.textDecoration = selectedCells[0].css.textDecoration
                } else {
                    this.cellCss.textDecoration = ''
                }
            }
            setTimeout(() => {
                this.isAllow = true
            }, 200)
        }
    },
    mounted() {
        this.rows = this.property.rows
        this.columns = this.property.columns
    },
    methods: {
        toggleClick(type) {
            if (type === 'table') {
                this.tableHeight = this.tableHeight === this.tableHeightShow ? 0 : this.tableHeightShow
            } else {
                this.cellHeight = this.cellHeight === this.cellHeightShow ? 0 : this.cellHeightShow
            }
            // 高度改变了 要通知上层
            const totalHeiget = 40 + 40 + this.tableHeight + this.cellHeight
            this.$emit('heightChange', totalHeiget)
        },
        fontTextSelect() {
            this.$store.commit('FONT_TEXT_LAYER', { show: !this.fontTextLayer.show })
        },
        columnsChange() {
            if (this.checkRowsAndColumns() && this.columns !== this.property.columns) {
                if (this.columns > this.property.columns) {
                    for (let i = this.property.columns; i < this.columns; i++) {
                        this.eqxElement.addNewColumns(i)
                    }
                } else {
                    for (let i = this.property.columns; i > this.columns; i--) {
                        this.eqxElement.deleteColumnByIndex(i - 1)
                    }
                }
                this.property.columns = this.columns
                this.eqxPage.eqxHistory.add(this.eqxPage)
            }
        },
        rowsChange() {
            if (this.checkRowsAndColumns() && this.rows !== this.property.rows) {
                if (this.rows > this.property.rows) {
                    for (let i = this.property.rows; i < this.rows; i++) {
                        this.eqxElement.addNewRows(i)
                    }
                } else {
                    for (let i = this.property.rows; i > this.rows; i--) {
                        this.eqxElement.deleteRowByIndex(i - 1)
                    }
                }
                this.property.rows = this.rows
                this.eqxPage.eqxHistory.add(this.eqxPage)
            }
        },
        checkRowsAndColumns() {
            const { maxCol, maxRow, maxWidth, maxHeight } = this.eqxElement.elementJson.property
            let pass = false
            if (this.columns * 40 > maxWidth) {
                Vue.notifier.warn(`表格最大宽度不能超过${maxWidth}px`)
                this.rows = this.property.rows
                this.columns = this.property.columns
            } else if (this.rows * 40 > maxHeight) {
                Vue.notifier.warn(`表格最大高度不能超过${maxHeight}px`)
                this.rows = this.property.rows
                this.columns = this.property.columns
            } else if (this.rows > 20) {
                Vue.notifier.warn(`表格最多限制${maxRow}行`)
                this.rows = this.property.rows
            } else if (this.columns > 20) {
                Vue.notifier.warn(`表格最多限制${maxCol}列`)
                this.columns = this.property.columns
            } else if (this.rows > 0 && this.columns > 0 && this.rows + this.columns >= 3) {
                pass = true
            } else {
                Vue.notifier.warn('行和列之和不能小于3！')
                this.rows = this.property.rows
                this.columns = this.property.columns
            }
            return pass
        },
        openTableStyleLayer() {
            this.$store.commit('SCENE_TABLE_STYLE_LAYER_CHANGE', { show: !this.tableStyleLayer.show })
        }
    }
}
</script>
<style lang="scss">
.eqc-setting-table {
    font-size: 12px;
    color: #2f3c4d;
    cursor: pointer;
    font-size: 12px;
    .title-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: white;
        width: 184px;
        height: 40px;
        border-bottom: 1px solid #ccd5db;
        padding: 0 16px;
        cursor: pointer;
        i {
            font-size: 16px;
        }
    }
    .inline-title {
        height: 36px;
        line-height: 36px;
    }
    .table-box {
        background: rgb(248, 248, 250);
        width: 184px;
        padding: 0 16px;
        transition: all 0.3s;
        overflow: hidden;
        .table-model {
            width: 152px;
            height: 62px;
            border-radius: 2px;
            border: 1px solid rgba(204, 213, 219, 1);
            display: flex;
            justify-content: space-between;
            padding: 6px;
            align-items: center;
            background: white;
            i {
                font-size: 16px;
            }
        }
        .color-box {
            width: 152px;
            height: 30px;
            background: rgba(225, 232, 236, 1);
            border-radius: 2px;
            border: 1px solid rgba(204, 213, 219, 1);
        }
        .row-column {
            display: flex;
            justify-content: space-between;
            height: 30px;
            margin-top: 12px;
            .box {
                width: 72px;
                border-radius: 2px;
                border: 1px solid rgba(204, 213, 219, 1);
                display: flex;
                justify-content: space-between;
                .name {
                    height: 28px;
                    width: 30px;
                    border-right: 1px solid rgba(204, 213, 219, 1);
                    line-height: 30px;
                    text-align: center;
                }
                .value {
                    width: 41px;
                    line-height: 30px;
                    background: white;
                    padding-left: 12px;
                }
            }
        }
    }
    .cell-box {
        background: rgb(248, 248, 250);
        width: 184px;
        padding: 0 16px;
        transition: all 0.3s;
        overflow: hidden;
        .font-style-btn {
            position: relative;
            width: 100%;
            height: 30px;
            line-height: 28px;
            padding: 0 28px 0 12px;
            background: #fff;
            border: 1px solid #ccd5db;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            font-size: 12px;
            cursor: pointer;
            .icon {
                position: absolute;
                right: 0;
                top: 0;
                width: 28px;
                height: 28px;
                font-size: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
        .content {
            display: flex;
            justify-content: space-between;
            > div {
                flex: 3;
            }

            .left,
            .right {
                margin-right: 4px;
                display: flex;
                .iconbox {
                    flex: 1;
                    border: 1px solid #ccd5db;
                    border-right: none;
                    background: #f7f8f9;
                    color: #76838f;
                }
                .input {
                    flex: 2;
                }
            }
            p {
                flex: 2;
                margin: 0 4px;
                border: 1px solid #ccd5db;
            }
            .right {
                margin-left: 4px;
                margin-right: 0;
            }
            .icon {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                font-size: 18px;
            }
        }
    }
}
</style>
