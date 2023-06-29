<template>
    <div class="eqc-dialog-link dialog">
        <div class="head">
            <span>链接二维码</span>
            <i
                class="close eqf-no"
                @click="cancle()"
            />
        </div>
        <div class="content">
            <input
                v-model.trim="text"
                :class="{error: showTip}"
                type="text"
                placeholder="请输入链接"
                @input="changeValue"
                @keydown.enter="ok(true)"
            >
            <p
                v-show="showTip"
                class="tip"
            >
                链接不能为空
            </p>
            <div class="foot">
                <base-button
                    class="btn ok blue h36"
                    @click.native="ok(true)"
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
            text: '',
            showTip: false
        }
    },
    mounted() {
        this.text = this.data.text
    },
    methods: {
        cancle() {
            this.close()
        },
        ok() {
            this.check()
                .then(() => {
                    this.showTip = false
                    this.close({ text: this.text })
                })
                .catch(() => {
                    this.showTip = true
                })
        },
        changeValue() {
            try {
                if (this.text && this.text.length > 300) {
                    this.text = this.text.substr(0, 300)
                }
            } catch (error) {
                console.log(error)
            }
        },
        check() {
            return new Promise((resolve, reject) => {
                // let res = /http[s]{0,1}:\/\/([\w.]+\/?)\S*/.test(this.text)
                // res ? resolve() : reject()
                this.text.length > 0 ? resolve() : reject()
            })
        }
    }
}
</script>

<style lang="scss">
.eqc-dialog-link {
    width: 336px;
    .content {
        padding: 0 28px 28px 28px;
        input {
            width: 100%;
            height: 36px;
            padding: 0 12px;
            color: #333;
            border: 1px solid #ccd5db;
            border-radius: 3px;
        }
        .error {
            border: 1px solid rgba(255, 84, 72, 1);
        }
        .tip {
            font-size: 14px;
            font-weight: 400;
            color: rgba(255, 84, 72, 1);
            line-height: 20px;
        }
        .foot {
            margin-top: 24px;
            .btn {
                width: 100%;
            }
        }
    }
}
</style>
