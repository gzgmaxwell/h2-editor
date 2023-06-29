<template>
    <div class="eqc-dialog-gif-alert dialog">
        <div
            class="content"
        >
            <i class="tip-icon eqf-alert-f" />
            <p class="tip">
                制作{{ data.type === 'video' ? '小视频' : 'GIF' }}需保证当前作品至少有2页<br>请在页面右侧复制或者新增一页！
            </p>
            <a
                :href="data.link"
                target="_blank"
                class="link"
            >点击查看如何制作一个酷炫的{{ data.type === 'video' ? '小视频' : 'GIF' }}>></a>
        </div>
        <div class="foot">
            <base-button
                class="btn blue h36 ok"
                @click.native="ok"
            >
                知道了
            </base-button>
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
    methods: {
        ok() {
            this.close({})
        },
        cancel() {
            this.close()
        }
    }
}
</script>

<style lang="scss">
.eqc-dialog-gif-alert {
    width: 460px;
    text-align: center;
    .content {
        font-size: 14px;
        color: #76838f;
        .tip {
            padding: 0 38px;
            margin: 29px 0px 12px 16px;
            font-size: 14px;
            font-weight: 400;
            color: rgba(51, 51, 51, 1);
            line-height: 22px;
        }
        .link {
            font-size: 12px;
            font-weight: 400;
            color: rgba(21, 147, 255, 1);
            line-height: 22px;
        }
        .tip-icon {
            position: absolute;
            left: 108px;
            top: 33px;
            color: #ffb243;
            cursor: pointer;
        }
    }
    .foot {
        margin: 20px 0;
        .btn {
            width: 90px;
        }
        .cancel {
            margin-left: 7px;
            vertical-align: top;
        }
    }
}
</style>
