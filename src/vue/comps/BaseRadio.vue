<template>
    <div class="eqc-base-radio">
        <div
            v-if="type === 'normal'"
            :class="{active: model === value}"
            class="radio-normal"
        >
            <input
                :id="id"
                :name="name"
                :value="value"
                type="radio"
                @change="$emit('change', $event.target.value)"
            >
        </div>
        <div
            v-if="type === 'special'"
            ref="spanBox"
            class="radio-special"
            @click="chooseClick"
        >
            <span ref="span" />
        </div>
    </div>
</template>

<script>
export default {
    model: {
        prop: 'model',
        event: 'change'
    },
    props: {
        type: {
            type: String,
            default: 'normal' // normal 是正常那种 special 是滑动的那种
        },
        id: {
            type: String,
            default: ''
        },
        name: {
            type: String,
            default: ''
        },
        value: {
            type: null,
            default: null
        },
        model: {
            type: null,
            default: null
        }
    },
    data() {
        return {
            specialValue: false
        }
    },
    mounted() {
        if (this.type === 'special') {
            this.specialValue = this.value
            this.initSpecialEffect()
        }
    },
    methods: {
        chooseClick() {
            this.specialValue = !this.specialValue
            this.initSpecialEffect()
            this.$emit('change', this.specialValue)
        },
        initSpecialEffect() {
            const span = this.$refs.span
            const spanBox = this.$refs.spanBox
            if (this.specialValue) {
                span.style.marginLeft = '12px'
                spanBox.style.background = '#1593ff'
            } else {
                span.style.marginLeft = '0'
                spanBox.style.background = '#CCD5DB'
            }
        }

    }
}
</script>

<style lang="scss">
.eqc-base-radio {
    display: inline-flex;
    .radio-normal {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        border: 1px solid #ccd5db;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s;
        &.active {
            border: 1px solid #1593ff;
            background: #1593ff;
            &::after {
                opacity: 1;
            }
        }
        &::after {
            content: "";
            position: absolute;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #fff;
            pointer-events: none;
            opacity: 0;
            transition: all 0.3s;
        }
        input {
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
        }
    }
    .radio-special {
        display: inline-flex;
        width: 28px;
        height: 16px;
        background: #ccd5db;
        border-radius: 8px;
        padding: 1px;
        align-items: center;
        overflow: hidden;
        cursor: pointer;
        span {
            display: inline-flex;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: white;
            transition: all 0.3s;
        }
    }
}
</style>
