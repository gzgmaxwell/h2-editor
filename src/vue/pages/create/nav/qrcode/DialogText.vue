<template>
    <div>
        <div
            v-if="showHelper"
            class="helper-text"
        >
            <i
                class="helper-close eqf-no-f"
                @click="closeHelper()"
            />
            <div class="head">
                <p class="title">
                    文本二维码
                </p>
                <p class="sub">
                    主要用于文本信息的展示
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
        <div class="eqc-dialog-text dialog">
            <div class="head">
                <span>文本二维码</span>
                <i
                    class="close eqf-no"
                    @click="cancle"
                />
            </div>
            <div class="content">
                <textarea
                    v-model.trim="text"
                    :class="{error: showTip}"
                    type="text"
                    placeholder="请输入文本"
                    @input="changeValue"
                />
                <p
                    v-show="showTip"
                    class="tip"
                >
                    文本不能为空
                </p>
                <div class="foot">
                    <base-button
                        class="btn ok blue h36"
                        @click.native="ok"
                    >
                        确定
                    </base-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import img1 from '../../../../../img/help_qr_text_1.png'
import img2 from '../../../../../img/help_qr_text_2.png'
import img3 from '../../../../../img/help_qr_text_3.png'

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
                    text: '输入文本，生成二维码',
                    text2: ''
                },
                {
                    src: img2,
                    text: '用户扫描图片上的二维码',
                    text2: '可快速打开您的文本页面'
                },
                {
                    src: img3,
                    text: '复制您提供的文本信息',
                    text2: '如：淘口令等'
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
                this.text.length > 0 ? resolve() : reject()
            })
        },
        closeHelper() {
            this.showHelper = false
        }
    }
}
</script>

<style lang="scss">
.helper-text {
    position: absolute;
    top: 67px;
    left: 80px;
    width: 340px;
    height: 487px;
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
.eqc-dialog-text {
    width: 336px;
    .content {
        padding: 0 28px 28px 28px;
        textarea {
            width: 100%;
            line-height: 22px;
            height: 66px;
            padding: 0 12px;
            color: #333;
            border: 1px solid #ccd5db;
            border-radius: 3px;
            resize: none;
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
