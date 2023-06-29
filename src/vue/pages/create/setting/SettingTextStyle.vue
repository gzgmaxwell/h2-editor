<template>
    <ul class="eqc-setting-text-style">
        <li
            :class="{active: model.fontWeight === 'bold'}"
            class="icon fl eqf-b"
            @click="setFontWeight()"
        />
        <li
            :class="{active: model.fontStyle === 'italic'}"
            class="icon fl eqf-i"
            @click="setFontStyle()"
        />
        <li
            v-show="isShowUnderline"
            :class="{active: isUnderline}"
            class="icon fl eqf-u"
            @click="setTextDecoration('underline')"
        />
        <li
            v-show="isShowLineThrough"
            :class="{active: isLineThrough}"
            class="icon fl eqf-s"
            @click="setTextDecoration('line-through')"
        />
    </ul>
</template>

<script>
import tType from '../../../../config/enum.text.type'

export default {
    props: {
        model: {
            type: Object,
            default: null
        },
        textType: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            isUnderline: this.model.textDecoration === 'underline',
            isLineThrough: this.model.textDecoration === 'line-through'
        }
    },
    computed: {
        scene() {
            return this.$store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        isShowUnderline() {
            return this.textType !== tType.gradient && this.textType !== tType.chartlet && this.textType !== -1
        },
        isShowLineThrough() {
            return this.textType !== tType.gradient && this.textType !== tType.chartlet && this.textType !== -1
        }
    },
    watch: {
        model: {
            handler() {
                this.isUnderline = this.model.textDecoration === 'underline'
                this.isLineThrough = this.model.textDecoration === 'line-through'
            },
            deep: true
        }
    },
    methods: {
        setFontWeight() {
            this.model.fontWeight = this.model.fontWeight ? '' : 'bold'
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        setFontStyle() {
            this.model.fontStyle = this.model.fontStyle ? '' : 'italic'
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        setTextDecoration(type) {
            if (type === 'underline') {
                this.isLineThrough = false
                this.isUnderline = !this.isUnderline
                this.model.textDecoration = this.isUnderline ? 'underline' : ''
            } else if (type === 'line-through') {
                this.isUnderline = false
                this.isLineThrough = !this.isLineThrough
                this.model.textDecoration = this.isLineThrough ? 'line-through' : ''
            }
            this.eqxPage.eqxHistory.add(this.eqxPage)
        }
    }
}
</script>

<style lang="scss">
.eqc-setting-text-style {
    display: flex;
    position: relative;
    width: 100%;
    height: 30px;
    margin-top: 12px;
    border: 1px solid #ccd5db;
    background: #f7f8f9;
    cursor: pointer;
    .icon {
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-grow: 1;
        color: #76838f;
        transition: all 0.3s;
        &:not(:last-child) {
            border-right: 1px solid #ccd5db;
        }
        &:hover,
        &.active {
            color: #1593ff;
            background: #fff;
        }
    }
}
</style>
