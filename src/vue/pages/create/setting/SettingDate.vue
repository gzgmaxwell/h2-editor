<template>
    <div
        class="eqc-setting-date"
    >
        <div class="name">
            类型
        </div>
        <div
            @mouseover="showDropdown('dateType')"
            @mouseleave="hideDropdown('dateType')"
        >
            <div class="current">
                <span>{{ dateType.selectedItem && dateType.selectedItem.name }}</span>
                <i class="icon eqf-menu-down" />
            </div>
            <base-drop-down
                v-if="dateType.show"
                :list="dateType.list"
                :selected-item="dateType.selectedItem"
                :css="{width: '152px', paddingTop: '8px', fontSize: '14px', zIndex: 1}"
                item-key="name"
                @choose="chooseDateType"
            />
        </div>
        <div
            v-show="dateFormat.list.length > 0"
            class="name"
        >
            形式
        </div>
        <div
            v-show="dateFormat.list.length > 0"
            @mouseover="showDropdown('dateFormat')"
            @mouseleave="hideDropdown('dateFormat')"
        >
            <div class="current">
                <span>{{ dateFormat.selectedItem && dateFormat.selectedItem.name }}</span>
                <i class="icon eqf-menu-down" />
            </div>
            <base-drop-down
                v-if="dateFormat.show"
                :list="dateFormat.list"
                :selected-item="dateFormat.selectedItem"
                :css="{width: '152px', paddingTop: '8px', fontSize: '14px', zIndex: 1}"
                item-key="name"
                @choose="chooseDateFormat"
            />
        </div>
        <div
            v-show="dateSeparator.list.length > 0"
            class="name"
        >
            格式
        </div>
        <div
            v-show="dateSeparator.list.length > 0"
            @mouseover="showDropdown('dateSeparator')"
            @mouseleave="hideDropdown('dateSeparator')"
        >
            <div class="current">
                <span>{{ dateSeparator.selectedItem && dateSeparator.selectedItem.name }}</span>
                <i class="icon eqf-menu-down" />
            </div>
            <base-drop-down
                v-if="dateSeparator.show"
                :list="dateSeparator.list"
                :selected-item="dateSeparator.selectedItem"
                :css="{width: '152px', paddingTop: '8px', fontSize: '14px', zIndex: 1}"
                item-key="name"
                @choose="chooseDateSeparator"
            />
        </div>
    </div>
</template>

<script>
import dateJson from './settingDateList.js'
export default {
    props: {
        model: {
            type: Object,
            default: null
        },
        modelKey: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            dateType: {
                list: [
                    { name: '日', value: '+dd' },
                    { name: '月', value: '+mm' },
                    { name: '年', value: '+yyyy' },
                    { name: '星期', value: '+zddd' },
                    { name: '月-日', value: '+mm-+dd' },
                    { name: '年-月', value: '+yyyy-+mm' },
                    { name: '年-月-日', value: '+yyyy-+mm-+dd' },
                    { name: '阴历年', value: '+cy' },
                    { name: '阴历月', value: '+cm' },
                    { name: '阴历日', value: '+cd' }
                ],
                selectedItem: null,
                show: false
            },
            dateFormat: {
                list: [],
                selectedItem: null,
                show: false
            },
            dateSeparator: {
                list: [],
                selectedItem: null,
                show: false
            },
            // 类型
            typeVal: '',
            // 形式
            formatVal: '',
            // 格式
            separatorVal: ''

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
    },
    created() {
        this.initDateList()
    },
    methods: {
        chooseDateType(item) {
            this.dateType.selectedItem = item
            this.dateType.show = false
            this.typeVal = item.value
            this.changeType()
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        chooseDateFormat(item) {
            this.dateFormat.selectedItem = item
            this.dateFormat.show = false
            this.formatVal = item.value
            this.changeFormat()
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        chooseDateSeparator(item) {
            this.dateSeparator.selectedItem = item
            this.dateSeparator.show = false
            this.separatorVal = item.value
            this.changeSeparator()
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        initDateList() {
            this.getDateFormat()
            this.setFormatSeparatorList()
            this.initSelected()
        },
        initSelected() {
            this.dateType.list.forEach((v, i) => {
                if (v.value === this.typeVal) {
                    this.dateType.selectedItem = v
                }
            })
            this.dateFormat.list.forEach((v, i) => {
                if (v.value === this.formatVal) {
                    this.dateFormat.selectedItem = v
                }
            })
            this.dateSeparator.list.forEach((v, i) => {
                if (v.value === this.separatorVal) {
                    this.dateSeparator.selectedItem = v
                }
            })
        },
        updateListHeigth() {
            let count = 3
            if (this.dateFormat.list.length === 0) {
                count--
            }
            if (this.dateSeparator.list.length === 0) {
                count--
            }
            this.$emit('changeList', { count })
        },
        setFormatSeparatorList() {
            this.dateFormat.list = dateJson[this.typeVal].format || []
            this.dateSeparator.list = dateJson[this.typeVal].separator[this.formatVal] || []
            this.updateListHeigth()
        },
        getDateFormat() {
            const curDateStr = this.model[this.modelKey]
            const t3 = curDateStr
            let t1 = t3.replace('年', '-')
                .replace('月', '-')
                .replace('日', '')
                .replace(/\./g, '-')
                .replace(/\//g, '-')

            if (t1.endsWith('-')) {
                t1 = t1.substring(0, t1.length - 1)
            }

            const t2 = t1
            t1 = t1.toLowerCase()
            if (t1 !== '+zddd') {
                t1 = t1.split('')
                for (var i = 0; i < t1.length; i++) {
                    if (t1[i] === 'z') {
                        t1[i] = t1[i + 1]
                    }
                }
                t1 = t1.join('')
            }
            // 年
            if (t1 === '+yy' || t1 === '+zyyy') t1 = '+yyyy'
            // 月
            if (t1 === '+zm' || t1 === '+mmm' || t1 === '+mmmm') t1 = '+mm'
            // 日
            if (t1 === '+zd') t1 = '+dd'
            // 星期
            if (t1 === '+dddd') t1 = '+zddd'

            this.typeVal = t1
            this.formatVal = t2
            this.separatorVal = t3
        },
        changeType() {
            this.dateFormat.list = dateJson[this.typeVal].format || []
            if (this.dateFormat.list.length === 0) {
                this.dateSeparator.list = []
                this.model[this.modelKey] = this.typeVal
                this.updateListHeigth()
                return
            }
            this.formatVal = this.dateFormat.list[0].value
            this.dateFormat.list.forEach((v, i) => {
                if (v.value === this.formatVal) {
                    this.dateFormat.selectedItem = v
                }
            })

            this.dateSeparator.list = dateJson[this.typeVal].separator[this.formatVal] || []
            if (this.dateSeparator.list.length === 0) {
                this.model[this.modelKey] = this.formatVal
                this.updateListHeigth()
                return
            }
            this.separatorVal = this.dateSeparator.list[0].value
            this.dateSeparator.list.forEach((v, i) => {
                if (v.value === this.separatorVal) {
                    this.dateSeparator.selectedItem = v
                }
            })
            this.model[this.modelKey] = this.separatorVal
            this.updateListHeigth()
        },
        changeFormat() {
            this.dateSeparator.list = dateJson[this.typeVal].separator[this.formatVal] || []
            if (this.dateSeparator.list.length === 0) {
                this.model[this.modelKey] = this.formatVal
                this.updateListHeigth()
                return
            }
            this.separatorVal = this.dateSeparator.list[0].value
            this.dateSeparator.list.forEach((v, i) => {
                if (v.value === this.separatorVal) {
                    this.dateSeparator.selectedItem = v
                }
            })
            this.model[this.modelKey] = this.separatorVal
            this.updateListHeigth()
        },
        changeSeparator() {
            this.model[this.modelKey] = this.separatorVal
            this.updateListHeigth()
        },
        showDropdown(current) {
            this[current].show = true
        },
        hideDropdown(current) {
            this[current].show = false
        }
    }
}
</script>

<style lang="scss">
.eqc-setting-date {
    font-size: 12px;
    color: #2f3c4d;
    cursor: pointer;
    .name {
        height: 36px;
        line-height: 36px;
        font-size: 12px;
        color: #4f5d69;
        display: flex;
        > p {
            flex: 1;
        }
    }
    .current {
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
}
</style>
