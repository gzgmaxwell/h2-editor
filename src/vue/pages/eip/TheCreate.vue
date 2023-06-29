<template>
    <div class="eqc-h2-eip-create">
        <div
            class="mask"
            @click="close()"
        />
        <div class="content">
            <router-view
                :data="data"
                :close="close"
            />
        </div>
    </div>
</template>

<script>
import message from '../../../utils/message'
export default {
    data() {
        return {
            data: null
        }
    },
    beforeRouteEnter(to, from, next) {
        next()
    },
    mounted() {
        document.querySelector('body').style.background = 'transparent'
    },
    methods: {
        close(value) {
            let msg = 'close'
            if (value && value.apply) {
                msg = 'apply'
            }
            message.success({ msg })
        }
    }
}
</script>

<style lang="scss">
%pos {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
}

.eqc-h2-eip-create {
    @extend %pos;
    z-index: 100;
    animation: fade-in 0.3s;
    > .mask {
        @extend %pos;
        background: rgba(0, 0, 0, 0.6);
    }
    > .content {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        .dialog {
            position: relative;
            background: #fff;
            box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
            border-radius: 4px;
            > .head {
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 60px;
                padding: 0 28px;
                font-size: 18px;
                font-weight: bold;
                color: #111;
                > .close {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 16px;
                    height: 16px;
                    font-size: 22px;
                    color: #666;
                    cursor: pointer;
                    transition: all 0.3s;
                    &:hover {
                        color: #ff2a6a;
                    }
                }
            }
        }
    }
    &.close {
        animation: fade-out 0.3s;
    }
}
</style>
