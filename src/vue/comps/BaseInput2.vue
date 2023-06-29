<template>
    <div
        class="eqc-base-input2"
    >
        <input
            :id="'baseinput2_' + id"
            ref="input"
            v-model="value"
            :placeholder="placeholder"
            :style="'border-color:' + (warn ? 'rgba(255, 84, 72, 1)' : '#ccd5db')"
            :maxlength="maxLength"
            type="text"
        >
        <label>{{ value.length }}/{{ maxLength }}</label>
    </div>
</template>
<script>
export default {
    props: {
        id: {
            type: Number,
            default: 0
        },
        require: {
            type: Boolean,
            default: false
        },
        maxLength: {
            type: Number,
            default: 20
        },
        placeholder: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            value: '',
            warn: false
        }
    },
    watch: {
        value(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.$emit('change', this.id, newVal)
            }
        }
    },
    mounted() {
        const $input = this.$refs.input
        $input.addEventListener('mousedown', e => {
            this.check()
        })
        $input.addEventListener('input', e => {
            this.check()
        })
        $input.addEventListener('blur', e => {
            this.check()
        })
        $input.addEventListener('focus', e => {
            this.check()
        })
    },
    methods: {
        check() {
            this.warn = this.require && this.value === ''
        }
    }
}
</script>

<style lang="scss">
.eqc-base-input2 {
    width: 100%;
    height: 100%;
    input {
        width: 100%;
        height: 100%;
        border-radius: 3px;
        border: 1px solid rgba(204, 213, 219, 1);
        font-size: 13px;
        font-weight: 400;
        color: rgba(17, 17, 17, 1);
        text-indent: 10px;
        padding-right: 46px;
        cursor: text;
    }
    label {
        position: absolute;
        top: 11px;
        right: 8px;
        width: 38px;
        direction: rtl;
        font-size: 12px;
        color: rgba(153, 153, 153, 1);
    }
}
</style>
