<template>
    <div>
        <div
            v-if="showHelper"
            class="helper-wechat"
        >
            <i
                class="helper-close eqf-no-f"
                @click="closeHelper()"
            />
            <div class="head">
                <p class="title">
                    微信公众号二维码
                </p>
                <p class="sub">
                    主要用于公众号推广
                </p>
            </div>
            <ul class="list">
                <li
                    v-for="item of helpList"
                    :key="item.src"
                >
                    <img :src="item.src">
                    <p>{{ item.text }}<br>{{ item.text2 }}</p>
                </li>
            </ul>
        </div>
        <div class="eqc-dialog-wechat dialog">
            <div class="head">
                <span>微信公众号</span>
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
                    placeholder="请输入公众号微信号，如：eqshow"
                    @input="changeValue"
                    @keydown.enter="ok(true)"
                >
                <p
                    v-show="showTip"
                    class="tip"
                >
                    请输入正确的公众号微信号，不要输入公众号名称
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
    </div>
</template>

<script>
import img1 from '../../../../../img/help_qr_wechat_1.png'
import img2 from '../../../../../img/help_qr_wechat_2.png'
import img3 from '../../../../../img/help_qr_wechat_3.png'

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
            showTip: false,
            showHelper: true,
            helpList: [
                {
                    src: img1,
                    text: '点击公众号右上角的 “···” ',
                    text2: '再点击“更多资料”'
                },
                {
                    src: img2,
                    text: '复制您的公众号微信号',
                    text2: ''
                },
                {
                    src: img3,
                    text: '输入微信号',
                    text2: ''
                }
            ]
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
            this.checkWeChatCode()
                .then(() => {
                    this.showTip = false
                    Vue.api.file.qrcodeReader(`https://open.weixin.qq.com/qr/code?username=${this.text}`).then((res) => {
                        if (res.data && res.data.success) {
                            this.close({ text: res.data.obj, name: this.text })
                        } else {
                            this.close({ text: 'http://weixin.qq.com/r/1i0nP4vEQtY9rc9c93jE', name: 'eqshow' })
                        }
                    })
                })
                .catch(() => {
                    this.showTip = true
                })
        },
        changeValue() {

        },
        checkWeChatCode() {
            return new Promise((resolve, reject) => {
                var qrcodeImg = new Image()
                qrcodeImg.src = `https://open.weixin.qq.com/qr/code?username=${this.text}`
                qrcodeImg.onload = res => {
                    resolve()
                }
                qrcodeImg.onerror = err => {
                    console.log(err.type === 'error')
                    reject()
                }
            })
        },
        closeHelper() {
            this.showHelper = false
        }
    }
}
</script>

<style lang="scss">
.helper-wechat {
    position: absolute;
    top: 67px;
    left: 80px;
    width: 340px;
    height: 507px;
    background: rgba(0, 0, 0, 0.3);
    color: #ffffff;
    border-radius: 3px;
    .helper-close {
        color: rgba(255, 255, 255, 0.3);
        position: absolute;
        right: 16px;
        top: 16px;
        font-size: 24px;
    }
    .head {
        .title {
            font-size: 20px;
            font-weight: 600;
            color: rgba(255, 255, 255, 1);
            line-height: 28px;
            padding: 16px 24px 0 24px;
        }
        .sub {
            font-size: 14px;
            font-weight: 400;
            color: rgba(255, 255, 255, 1);
            line-height: 20px;
            padding: 1px 24px 0 24px;
        }
    }
    .list {
        li {
            margin: 0 24px;
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: space-between;
            align-items: center;
            padding: 26px 0 26px 0;
            img {
                width: 42%;
            }
            p {
                width: 55%;
                font-size: 13px;
                font-weight: 400;
                color: rgba(255, 255, 255, 1);
                line-height: 18px;
                text-align: right;
                opacity: 0.8;
            }
        }
        li:nth-child(2) {
            border-top: 1px dashed;
            border-bottom: 1px dashed;
            border-color: #7d7d7d;
        }
    }
}
.eqc-dialog-wechat {
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
