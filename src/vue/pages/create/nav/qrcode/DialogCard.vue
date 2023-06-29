<template>
    <div>
        <div
            v-if="showHelper"
            class="helper-card"
        >
            <i
                class="helper-close eqf-no-f"
                @click="closeHelper()"
            />
            <div class="head">
                <p class="title">
                    名片二维码
                </p>
                <p class="sub">
                    主要用于个人名片的展示
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
        <div class="eqc-dialog-card dialog">
            <div class="head">
                <span>名片二维码</span>
                <i
                    class="close eqf-no"
                    @click="cancle"
                />
            </div>
            <div class="content">
                <p>姓名</p>
                <input
                    v-model.trim="card.name"
                    :class="{error: showNameTip}"
                    type="text"
                    placeholder="请输入姓名"
                    @input="changeValue('name')"
                    @keydown.enter="ok"
                >
                <p
                    v-show="showNameTip"
                    class="tip"
                >
                    姓名不能为空
                </p>
                <p class="title">
                    手机号
                </p>
                <input
                    v-model.trim="card.phone"
                    :class="{error: showPhoneTip}"
                    type="text"
                    placeholder="请输入手机号"
                    @input="changeValue('phone')"
                    @keydown.enter="ok"
                >
                <p
                    v-show="showPhoneTip"
                    class="tip"
                >
                    请输入正确的手机号
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

import img1 from '../../../../../img/help_qr_card_1.png'
import img2 from '../../../../../img/help_qr_card_2.png'
import img3 from '../../../../../img/help_qr_card_3.png'

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
            card: {},
            showNameTip: false,
            showPhoneTip: false,
            showHelper: true,
            helpList: [
                {
                    src: img1,
                    text: '输入姓名和手机号',
                    text2: '生成二维码'
                },
                {
                    src: img2,
                    text: '用户扫描图片上的二维码',
                    text2: '可打开您的个人信息页面'
                },
                {
                    src: img3,
                    text: '直接拨打电话或者将您',
                    text2: '的电话保存到手机通讯簿中'
                }
            ]
        }
    },
    mounted() {
        this.card = this.data
    },
    methods: {
        cancle() {
            this.close()
        },
        ok() {
            this.check()
                .then(() => {
                    this.showNameTip = false
                    this.showPhoneTip = false
                    this.close({ card: this.card })
                })
                .catch((res) => {
                    this.showNameTip = false
                    this.showPhoneTip = false
                    if (res.message === 'name') {
                        this.showNameTip = true
                    }
                    if (res.message === 'phone') {
                        this.showPhoneTip = true
                    }
                })
        },
        changeValue(item) {
            if (this.card[item].length > 20) {
                this.card[item] = this.card[item].substr(0, 20)
            }
        },
        check() {
            return new Promise((resolve, reject) => {
                if (this.card.name.length === 0) {
                    reject(new Error('name'))
                }
                if (!/^1[34578]\d{9}$/.test(this.card.phone)) {
                    reject(new Error('phone'))
                }
                resolve()
            })
        },
        closeHelper() {
            this.showHelper = false
        }
    }
}
</script>

<style lang="scss">
.helper-card {
    position: absolute;
    top: 67px;
    left: 80px;
    width: 340px;
    height: 517px;
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
.eqc-dialog-card {
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
            margin-top: 8px;
        }
        p {
            font-size: 14px;
            font-weight: bold;
            color: #111;
            margin-top: 8px;
        }
        .title {
            margin-top: 16px;
        }
        .error {
            border: 1px solid rgba(255, 84, 72, 1);
        }
        .tip {
            font-size: 14px;
            font-weight: 400;
            color: rgba(255, 84, 72, 1);
            line-height: 20px;
            margin: 0;
            padding: 0;
        }
        .foot {
            margin-top: 24px;
            display: flex;
            justify-content: flex-end;
            .btn {
                width: 100%;
            }
        }
    }
}
</style>
