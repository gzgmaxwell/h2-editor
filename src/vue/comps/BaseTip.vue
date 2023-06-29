<template>
    <transition name="fade">
        <div
            v-if="showDragTip"
            :style="css"
            class="eqc-tip"
        >
            <span>{{ tip }}</span>
            <i
                class="close eqf-no"
                @click="hideTip"
            />
        </div>
    </transition>
</template>

<script>
import storageLocal from '../../utils/storageLocal'

export default {
    props: {
        storageKey: {
            type: String,
            default: ''
        },
        tip: {
            type: String,
            default: ''
        },
        css: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            showDragTip: true
        }
    },
    created() {
        const time = parseFloat(storageLocal.getItem(this.localStrorageKey))
        if (time) {
            this.showDragTip = Date.now() - time > 1000 * 3600 * 24 // 一天有效期
        }
    },
    methods: {
        hideTip() {
            storageLocal.setItem(this.localStrorageKey, Date.now())
            this.showDragTip = false
        }
    }
}
</script>

<style lang="scss">
.eqc-tip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 40px;
    padding: 0 16px;
    font-size: 12px;
    color: #fff;
    background: rgba(47, 60, 77, 0.8);
    .close {
        font-size: 20px;
        color: #fff;
        cursor: pointer;
        transition: all 0.3s;
        &:hover {
            color: #ff2a6a;
        }
    }
}
</style>
