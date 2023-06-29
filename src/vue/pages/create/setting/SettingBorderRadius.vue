<template>
    <div
        class="eqc-setting-border-radius"
    >
        <base-input
            :model="model"
            :min="0"
            :max="500"
            :model-key="modelKey"
        />
        <div
            class="current"
            @click="showSelectPanel($event)"
        >
            <div
                :style="{borderRadius:showRadius.replace(/8/g,'6')}"
                class="current-icon"
            />
            <i
                :class="{roate: showPanel}"
                class="icon eqf-menu-down"
            />
        </div>
        <div
            v-if="showPanel"
            class="select-panel"
        >
            <div
                :style="{borderRadius:showRadius}"
                class="inner"
            />
            <div
                :class="{'selected':selected.includes('lt')}"
                class="left-top"
                @click="setRadius('lt', $event)"
            />
            <div
                :class="{'selected':selected.includes('rt')}"
                class="right-top"
                @click="setRadius('rt', $event)"
            />
            <div
                :class="{'selected':selected.includes('lb')}"
                class="left-bottom"
                @click="setRadius('lb', $event)"
            />
            <div
                :class="{'selected':selected.includes('rb')}"
                class="right-bottom"
                @click="setRadius('rb', $event)"
            />
        </div>
    </div>
</template>

<script>
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
            selected: [],
            showPanel: false
        }
    },
    computed: {
        scene() {
            return this.$store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        showRadius() {
            const lt = this.selected.includes('lt') ? '8px' : '0px'
            const rt = this.selected.includes('rt') ? '8px' : '0px'
            const lb = this.selected.includes('lb') ? '8px' : '0px'
            const rb = this.selected.includes('rb') ? '8px' : '0px'
            return `${lt} ${rt} ${rb} ${lb}`
        }
    },
    watch: {
        model(newVal) {
            if (newVal.lt) {
                if (this.selected.indexOf('lt') === -1) {
                    this.selected.push('lt')
                }
            } else {
                const index = this.selected.indexOf('lt')
                if (index > -1) {
                    this.selected.splice(index, 1)
                }
            }
            if (newVal.rt) {
                if (this.selected.indexOf('rt') === -1) {
                    this.selected.push('rt')
                }
            } else {
                const index = this.selected.indexOf('rt')
                if (index > -1) {
                    this.selected.splice(index, 1)
                }
            }
            if (newVal.lb) {
                if (this.selected.indexOf('lb') === -1) {
                    this.selected.push('lb')
                }
            } else {
                const index = this.selected.indexOf('lb')
                if (index > -1) {
                    this.selected.splice(index, 1)
                }
            }
            if (newVal.rb) {
                if (this.selected.indexOf('rb') === -1) {
                    this.selected.push('rb')
                }
            } else {
                const index = this.selected.indexOf('rb')
                if (index > -1) {
                    this.selected.splice(index, 1)
                }
            }
        }
    },
    mounted() {
        if (this.model.lt) this.selected.push('lt')
        if (this.model.rt) this.selected.push('rt')
        if (this.model.lb) this.selected.push('lb')
        if (this.model.rb) this.selected.push('rb')
    },
    methods: {
        setRadius(item, event) {
            event.stopPropagation()
            const index = this.selected.indexOf(item)
            if (index === -1) {
                this.selected.push(item)
                this.model[item] = true
            } else {
                this.selected.splice(index, 1)
                this.model[item] = false
            }
        },
        showSelectPanel(event, show = true) {
            event.stopPropagation()
            this.showPanel = !this.showPanel
        },
        hideSelectPanel() {
            this.showPanel = false
        }
    }
}
</script>

<style lang="scss">
.eqc-setting-border-radius {
    font-size: 12px;
    color: #2f3c4d;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    position: relative;
    .current {
        position: relative;
        width: 45%;
        height: 30px;
        line-height: 28px;
        background: #fff;
        border-bottom: 1px solid #ccd5db;
        border-top: 1px solid #ccd5db;
        border-right: 1px solid #ccd5db;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        display: flex;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: center;
        background: #f7f8f9;
        .current-icon {
            width: 16px;
            height: 16px;
            border: 1px solid #ccd5db;
            border-radius: 6px 0 0 0;
            margin: 0 2px 0 8px;
        }
        .icon {
            width: 16px;
            height: 16px;
            font-size: 16px;
            transition: all 0.3s;
            &.roate {
                transform: rotateZ(180deg);
            }
        }
    }
    .select-panel {
        width: 88px;
        height: 88px;
        position: absolute;
        right: 0;
        top: 34px;
        z-index: 1;
        background: #fff;
        box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.08);
        .inner {
            width: 42px;
            height: 42px;
            border: 2px solid rgba(118, 131, 143, 1);
            margin: 22px;
        }
        .selected {
            background: rgba(21, 147, 255, 0.1) !important;
            border: 1px solid #1593ff !important;
        }
        .left-top {
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.3);
            border: 1px solid rgba(204, 213, 219, 1);
            position: absolute;
            top: 13px;
            left: 13px;
            &:hover {
                border: 1px solid #1593ff;
            }
        }

        .left-bottom {
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.3);
            border: 1px solid rgba(204, 213, 219, 1);
            position: absolute;
            bottom: 13px;
            left: 13px;
            &:hover {
                border: 1px solid #1593ff;
            }
        }
        .right-top {
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.3);
            border: 1px solid rgba(204, 213, 219, 1);
            position: absolute;
            right: 13px;
            top: 13px;
            &:hover {
                border: 1px solid #1593ff;
            }
        }
        .right-bottom {
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.3);
            border: 1px solid rgba(204, 213, 219, 1);
            position: absolute;
            right: 13px;
            bottom: 13px;
            &:hover {
                border: 1px solid #1593ff;
            }
        }
    }
}
</style>
