<template>
    <div class="eqx-preview">
        <Preview-Pc
            v-if="isPC"
            @showTp="showTpage"
        />
        <Preview-Mobile
            v-if="isMobile"
            @showTp="showTpage"
        />
        <Preview-Mall
            v-if="isMall"
            @showTp="showTpage"
        />
        <div
            :style="{display: `${alreadyShare ? 'none' : 'flex'}`}"
            class="trailer-page"
        >
            <div class="logo" />
            <div class="product-status">
                {{ productStatus }}
            </div>
            <a
                href="http://store.eqxiu.com/h2/"
                class="preview-button"
            >
                使用易企秀轻设计
            </a>
            <a
                href="http://www.eqxiu.com"
                class="official"
            >www.eqxiu.com</a>
        </div>
    </div>
</template>

<script>
import PreviewPc from './previewPc.vue'
import PreviewMobile from './previewMobile.vue'
import PreviewMall from './previewMall.vue'

export default {
    components: {
        PreviewMobile,
        PreviewPc,
        PreviewMall
    },
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
            isPC: false,
            isMobile: false,
            isMall: false,
            alreadyShare: true
        }
    },
    created() {
        this.choosePlatform()
    },
    mounted() {
    },
    destroyed() {
    },
    methods: {
        // 判断当前是什么平台
        choosePlatform() {
            if (this.getUrlParams().isMall) {
                this.isMall = true
            } else {
                const judge = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)
                if (judge && this.alreadyShare) {
                    this.isMobile = true
                } else if (!judge) {
                    this.isPC = true
                }
            }
        },
        showTpage(showOrHide) {
            switch (showOrHide) {
                case 3:
                    this.alreadyShare = true
                    break
                case 4:
                    this.alreadyShare = false
                    this.productStatus = '作品违规'
                    break
                case 5:
                    this.alreadyShare = false
                    this.productStatus = '作品审核中'
                    break
                default:
                    this.alreadyShare = false
                    this.productStatus = '作品未发布'
            }
        },
        getUrlParams() {
            var obj = {}
            var params = location.href.split('?')[1] || ''
            params.split('&').forEach(function (item) {
                var val = item.split('=')
                obj[val[0]] = val[1]
            })
            return obj
        }
    }
}
</script>
<style lang="scss">
html,
body {
    height: 100%;
    width: 100%;
}
::-webkit-scrollbar {
    width: 0;
    height: 0px;
}
* {
    margin: 0;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
}
.eqx-preview {
    position: relative;
    height: 100%;
    overflow: hidden;
    .trailer-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #eceef0;
        z-index: 10; // 需要遮盖住所有的元素
        a {
            text-decoration: none;
        }
        .logo {
            width: 211px;
            height: 211px;
            font-size: 211px;
            color: #1593ff;
            margin-top: 60px;
            background: url("../img/cover.png") center;
            background-size: cover;
        }
        .product-status {
            height: 40px;
            margin-top: 5%;
            line-height: 40px;
            text-align: center;
            color: #111;
            font-size: 18px;
        }
        .preview-button {
            position: absolute;
            display: block;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 211px;
            height: 56px;
            background: #1593ff;
            box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.16);
            border-radius: 28px;
            font-size: 18px;
            cursor: pointer;
            left: 50%;
            top: 80%;
            transform: translate(-50%, -80%);
        }
        .official {
            cursor: pointer;
            font-size: 14px;
            color: #666;
            position: absolute;
            left: 50%;
            top: 85%;
            font-family: HelveticaNeue;
            transform: translate(-50%, -85%);
        }
    }
}
</style>
