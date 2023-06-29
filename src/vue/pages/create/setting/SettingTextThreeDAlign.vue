<template>
    <ul class="eqc-setting-text-align">
        <li
            :class="{active: value === 'left'}"
            class="icon fl eqf-align-left"
            @click="setAlign('left')"
        />
        <li
            :class="{active: value === 'center'}"
            class="icon fl eqf-align-center"
            @click="setAlign('center')"
        />
        <li
            :class="{active: value === 'right'}"
            class="icon fl eqf-align-right"
            @click="setAlign('right')"
        />
    </ul>
</template>

<script>
export default {
    props: {
        eqxElement: {
            type: Object,
            default: null
        },
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
            value: this.model[this.modelKey]
        }
    },
    methods: {
        setAlign(align) {
            this.value = this.model[this.modelKey] = align
            this.eqxElement.updatePosition({
                textAlign: align
            })
        }
    }
}
</script>

<style lang="scss">
.eqc-setting-text-align {
    display: flex;
    position: relative;
    width: 100%;
    height: 30px;
    margin-top: 12px;
    border: 1px solid #ccd5db;
    background: #f7f8f9;
    cursor: pointer;
    .icon {
        font-size: 20px;
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
    .active {
        color: #1593ff;
        background: red;
    }
    i {
        height: 100%;
    }

    .rotateLeft:before {
        content: "\e952";
        transform: rotateZ(90deg);
    }
    .rotateCenter:before {
        content: "\e950";
        transform: rotateZ(90deg);
    }
    .rotateRight:before {
        content: "\e953";
        transform: rotateZ(90deg);
    }
}
</style>
