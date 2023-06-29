<template>
    <div
        v-if="!isClose"
        class="eqc-material-foot-tips"
        :style="{bottom:bottom+'px'}"
    >
        <div class="tips-content">
            <span class="tips">在这里上传图片</span>
            <span
                class="check"
                @click="checkBoxClick"
            >
                <base-checkbox
                    v-model="noNotice"
                />
                <label>不再提示</label>
            </span>
            <span
                class="know"
                @click="close"
            >知道了</span>
        </div>
        <div class="arrow" />
    </div>
</template>
<script>
import storageLocal from '../../../../../utils/storageLocal'
export default {
    props: {
        type: {
            type: String,
            default: 'material' // 枚举值： material template upload
        },
        bottom: {
            type: String,
            default: '48'
        }
    },
    data() {
        return {
            isClose: false, // 是否关闭
            noNotice: false
        }
    },
    created() {
        const flag = storageLocal.getItem(this.getKey())
        if (flag) {
            this.isClose = true
        }
    },
    methods: {
        getKey() {
            return storageLocal.key[this.type + 'Tips']
        },
        checkBoxClick() {
            this.noNotice = !this.noNotice
        },
        close() {
            storageLocal.setItem(this.getKey(), this.noNotice)
            this.isClose = true
        }
    }
}
</script>
<style lang="scss">
.eqc-material-foot-tips {
    position: absolute;
    left: 0;
    bottom: 48px;
    padding: 0 16px;
    margin-bottom: -8px;
    z-index: 1000;
    .tips-content {
        background: black;
        width: 256px;
        height: 45px;
        border-radius: 4px;
        font-size: 13px;
        line-height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        .tips {
            margin-right: 20px;
        }
        .check {
            margin-right: 12px;
            cursor: pointer;
        }
        .know {
            color: #1593ff;
            cursor: pointer;
        }
    }
    .arrow {
        margin-left: 122px;
        width: 0;
        height: 0;
        border-width: 8px;
        border-style: solid;
        border-color: black transparent transparent transparent;
    }
    .eqc-base-checkbox {
        background: transparent;
        // input:checked {
        //     -webkit-appearance: none;
        //     background: transparent;
        // }
    }
}
</style>
