<template>
    <a class="eqc-btn">
        <slot />
    </a>
</template>

<style lang="scss">
.eqc-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    border-radius: 3px;
    transition: all 0.3s;
    cursor: pointer;
    &.blue {
        color: #fff;
        background: #1593ff;
        border: 1px solid #1593ff;
        &:hover {
            background: #198ae7;
            border: 1px solid #198ae7;
        }
    }
    &.red {
        color: #fff;
        background: #ff2a6a;
        border: 1px solid #ff2a6a;
        &:hover {
            background: #ff004d;
            border: 1px solid #ff2a6a;
        }
    }
    &.white {
        color: #666;
        background: #fff;
        border: 1px solid #ccd5db;
        &:hover {
            color: #1593ff;
            border: 1px solid #1593ff;
        }
        &.white-blue {
            &:hover {
                color: #fff;
                background: #198ae7;
                border: 1px solid #1593ff;
            }
        }
        &.white-red {
            background: #fff;
            &:hover {
                color: #fff;
                background: #ff004d;
                border: 1px solid #ff2a6a;
            }
        }
    }
    &.opacity {
        color: #666;
        border: 1px solid #ccd5db;
        &:hover {
            color: #1593ff;
            border: 1px solid #1593ff;
        }
        &.opacity-blue {
            &:hover {
                color: #fff;
                background: #198ae7;
                border: 1px solid #1593ff;
            }
        }
        &.opacity-red {
            background: #fff;
            &:hover {
                color: #fff;
                background: #ff004d;
                border: 1px solid #ff2a6a;
            }
        }
    }
    &.disable {
        color: #ccd5db;
        background: #fff;
        border: 1px solid #eee;
        pointer-events: none;
    }
    &.h20 {
        height: 20px;
    }
    &.h48 {
        height: 48px;
    }
    &.h36 {
        height: 36px;
    }
    &.h32 {
        height: 32px;
    }
    &.h30 {
        height: 30px;
    }
    &.w52 {
        width: 52px;
    }
    &.w72 {
        width: 72px;
    }
    &.w96 {
        width: 96px;
    }
    &.w112 {
        width: 112px;
    }
    &.w152 {
        width: 152px;
    }
    &.w120 {
        width: 120px;
    }
    &.w144 {
        width: 144px;
    }
    &.w256 {
        width: 256px;
    }
    &.w268 {
        width: 268px;
    }
}
</style>
