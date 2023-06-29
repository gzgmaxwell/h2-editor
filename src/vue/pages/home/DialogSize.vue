<template>
    <div class="eqc-dialog-size dialog">
        <div class="head">
            <span>自定义尺寸</span>
            <i
                class="close eqf-no"
                @click="cancel"
            />
        </div>
        <div class="content">
            <div class="form">
                <div
                    class="text width"
                    data-name="宽"
                >
                    <input
                        v-model.number="width"
                        type="number"
                        placeholder="宽"
                    >
                </div>
                <i class="icon eqf-link" />
                <div
                    class="text height"
                    data-name="高"
                >
                    <input
                        v-model.number="height"
                        type="number"
                        placeholder="高"
                    >
                </div>
                <div
                    class="text unit"
                    data-name="单位"
                >
                    <input
                        type="text"
                        value="px(像素)"
                        disabled
                    >
                </div>
            </div>
            <div class="foot">
                <base-button
                    class="btn cancel white h36"
                    @click.native="cancel"
                >
                    取消
                </base-button>
                <base-button
                    class="btn ok blue h36"
                    @click.native="ok"
                >
                    确定
                </base-button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        data: {
            type: Object,
            default: null
        },
        close: {
            type: Function,
            default: null
        }
    },
    data() {
        return {
            width: 800,
            height: 800,
            unit: 'px'
        }
    },
    methods: {
        cancel() {
            this.close()
        },
        ok() {
            // 正整数
            var reg = /^[1-9]\d*$/
            if (!(reg.test(this.width) && reg.test(this.height))) {
                this.notifier.warn('请输入有效的尺寸信息')
            } else if (this.width > 5000 || this.height > 5000) {
                this.notifier.warn('宽高最大值为5000')
            } else {
                this.close({
                    type: 0,
                    width: this.width,
                    height: this.height,
                    unit: this.unit
                })
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-dialog-size {
    width: 600px;
    .content {
        padding: 28px;
        .form {
            display: flex;
            justify-content: center;
            .text {
                position: relative;
                input {
                    width: 80px;
                    height: 36px;
                    padding: 0 12px;
                    color: #333;
                    border: 1px solid #ccd5db;
                    border-radius: 3px;
                }
                &::after {
                    content: attr(data-name);
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 100%;
                    left: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            }
            .icon {
                width: 32px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .unit {
                margin-left: 24px;
            }
        }
        .foot {
            margin-top: 68px;
            display: flex;
            justify-content: flex-end;
            .btn {
                width: 96px;
            }
            .ok {
                margin-left: 16px;
            }
        }
    }
}
</style>
