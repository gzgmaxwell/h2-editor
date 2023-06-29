<template>
    <div class="eqc-dialog-chrome dialog">
        <i class="icon" />
        <i
            class="close eqf-no"
            @click="cancel"
        />
        <p v-if="isChrome && chromeVersion < 55">
            为了更好的用户体验<br>请升级到最新版浏览器<br>或使用Chrome谷歌浏览器
        </p>
        <p v-if="!isChrome || isEdge">
            为了更好的用户体验<br>请使用Chrome谷歌浏览器
        </p>
        <base-button
            class="btn blue h36"
            target="_blank"
            @click.native="downloadChrome"
        >
            下载安装
        </base-button>
    </div>
</template>

<script>
import util from '../../../../utils/util'

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
    computed: {
        isChrome() {
            return util.isChrome
        },
        isEdge() {
            return util.isEdge
        },
        chromeVersion() {
            return util.getChromeVersion()
        }
    },
    methods: {
        cancel() {
            this.close()
        },
        downloadChrome() {
            const winx64ChromeDownLoadUrl = 'https://pc.qq.com/detail/18/detail_21258.html'
            const winx86ChromeDownLoadUrl = 'https://pc.qq.com/detail/1/detail_2661.html'
            const macChromeDownLoadUrl = 'https://www.google.cn/intl/zh-CN/chrome/'
            let downLoadUrl
            if (util.isWin) {
                if (util.isWin64) {
                    downLoadUrl = winx64ChromeDownLoadUrl
                } else {
                    downLoadUrl = winx86ChromeDownLoadUrl
                }
            } else {
                downLoadUrl = macChromeDownLoadUrl
            }
            window.open(downLoadUrl)
        }
    }
}
</script>

<style lang="scss">
.eqc-dialog-chrome {
    position: relative;
    padding: 28px;
    text-align: center;
    cursor: default;
    .icon {
        display: inline-block;
        width: 100px;
        height: 100px;
        margin: 30px;
        background: url("../../../../img/chrome.svg") no-repeat center;
    }
    .close {
        position: absolute;
        right: 28px;
        top: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        font-size: 22px;
        cursor: pointer;
        transition: all 0.3s;
        &:hover {
            color: #ff2a6a;
        }
    }
    p {
        line-height: 1.5;
        font-size: 16px;
        text-align: center;
    }
    .btn {
        width: 100%;
        margin-top: 20px;
    }
}
</style>
