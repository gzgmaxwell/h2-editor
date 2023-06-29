<template>
    <div
        :class="{active: checked}"
        class="eqc-base-checkbox"
    >
        <i class="icon eqf-yes" />
        <input
            :id="id"
            type="checkbox"
            @change="$emit('change', $event.target.checked ? trueValue : falseValue)"
        >
    </div>
</template>

<script>
export default {
    model: {
        prop: 'checked',
        event: 'change'
    },
    props: {
        id: {
            type: String,
            default: ''
        },
        trueValue: {
            type: null,
            default: true
        },
        falseValue: {
            type: null,
            default: false
        },
        checked: {
            type: null,
            default: null
        }
    }
}
</script>

<style lang="scss">
.eqc-base-checkbox {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: 1px solid #ccd5db;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.3s;
    &.active {
        border: 1px solid #1593ff;
        background: #1593ff;
        .icon {
            opacity: 1;
        }
    }
    .icon {
        color: #fff;
        opacity: 0;
        transition: all 0.3s;
    }
    input {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        pointer-events: none;
    }
}
</style>
