<template>
    <div
        class="platform-mobile"
    >
        <section
            ref="section"
            :class="{justcenter: hasFlex}"
        >
            <div
                ref="box"
                :style="{width: box.width, height: box.height}"
                class="box"
            >
                <div
                    ref="imgContainer"
                    class="img-container"
                    style="top: 0px;"
                >
                    <img
                        v-for="(cover, index) in data.coverList"
                        :key="index"
                        :src="createSrc(index)"
                        width="100%"
                    >
                </div>
            </div>
            <div
                v-show="showBall"
                ref="ctrlBar"
                class="ctrl-bar"
            >
                <div class="progress">
                    <div
                        ref="blue"
                        class="blue-bar"
                    />
                    <div
                        ref="ball"
                        class="ball"
                        style="top: -6px"
                        @touchstart="touchCtrlBar"
                    />
                </div>
            </div>
            <div
                ref="fp"
                class="final-page"
            >
                <div
                    ref="logo"
                    :style="{background: logoSrc}"
                    class="logo"
                />
                <div class="product-status">
                    {{ productStatus }}
                </div>
                <a
                    id="toApp"
                    :href="toApp"
                    class="preview-button"
                >
                    使用易企秀轻设计
                </a>
                <a
                    id="toWeb"
                    :href="toWeb"
                    class="official"
                >www.eqxiu.com</a>
            </div>
            <div class="arrow">
                <i class="up eqf-up" />
            </div>
        </section>
    </div>
</template>
<script>
export default {
    props: {
        showBall: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            pages: 1,
            // 接收数据
            data: {},
            alreadyShare: false,
            productStatus: '',
            logoSrc: '',
            box: {
                height: 0,
                width: 0
            },
            hasFlex: false,
            // 显示右侧控制杆
            ballData: {
                startY: 0,
                endY: 0,
                ballStartY: 0,
                ballL: 0,
                icTop: 0,
                blueHeight: 0
            }
        }
    },
    created() {
    },
    mounted() {
        this.getData()
        this.turnPage()
        this.finalPage()
    },
    methods: {
        getData() {
            const id = location.href.split('?')[0].split('/q/')[1]
            Vue.api.getShareInfo(id).then((res) => {
                this.data = res.data.obj
                this.$emit('showTp', this.data.share)
                if (Number(this.data.height) <= 1280) {
                    this.showBall = false
                } else {
                    this.showBall = true
                }
                this.data.title = this.data.title || '易企秀轻设计制作'
                this.data.description = this.data.description || '轻松制作海报、邀请函、微信公号头图'
                this.hasShare = true
                if (this.data.coverList) {
                    this.logoSrc = `${this.getBackgroundImage(this.data.coverList[0])} no-repeat center/contain`
                }
                this.createImage()
            })
        },
        createImage() {
            const offsetWidth = this.$refs.section.offsetWidth
            const section = this.$refs.section
            const scale = this.data.height / this.data.width
            if (this.data.width > offsetWidth) {
                this.box.height = offsetWidth * scale + 'px'
                this.box.width = parseFloat(this.box.height) / scale + 'px'
            } else {
                this.box.height = this.data.height + 'px'
                this.box.width = this.data.width + 'px'
            }
            if (parseFloat(this.box.height) <= section.offsetHeight) {
                this.hasFlex = true
                this.$refs.ctrlBar.style.display = 'none'
            } else {
                this.hasFlex = false
                this.$refs.ctrlBar.style.display = 'flex'
            }
        },
        // 移动端操作尾页
        finalPage() {
            setTimeout(() => {
                const fp = this.$refs.fp
                const section = this.$refs.section
                let start = 0
                let end = 0
                fp.ontouchstart = function (e) {
                    e.stopPropagation()
                    start = e.touches[0].pageY
                }
                fp.ontouchmove = function (e) {
                    e.stopPropagation()
                    end = e.touches[0].pageY
                }
                fp.ontouchend = function (e) {
                    e.stopPropagation(e)
                    if (end - start > 0) {
                        $(fp).stop().animate({ top: section.offsetHeight + 'px' }, 300)
                    }
                }
            }, 300)
        },
        // 加载翻页
        turnPage() {
            const fp = this.$refs.fp
            const ball = this.$refs.ball
            const ic = this.$refs.imgContainer
            const blue = this.$refs.blue
            document.ontouchstart = (e) => {
                if (e.target === this.$refs.ctrlBar) {
                    return
                }
                this.ballData.startY = e.touches[0].pageY
            }
            document.ontouchmove = (e) => {
                if (e.target === this.$refs.ctrlBar) {
                    return
                }
                this.ballData.endY = e.touches[0].pageY
            }
            document.ontouchend = (e) => {
                if (e.target === this.$refs.ctrlBar) {
                    return
                }
                const data = this.data
                if (this.ballData.endY !== 0) {
                    if (this.ballData.endY - this.ballData.startY > 0) {
                        --this.pages
                        if (this.pages <= 1) {
                            this.pages = 1
                        }
                    } else {
                        ++this.pages
                        if (this.pages > data.coverList.length) {
                            this.pages = data.coverList.length
                            this.productStatus = data.title
                            fp.style.display = 'flex'
                            $(fp).stop().animate({ top: '0px' }, 300)
                        }
                    }
                    ball.style.top = '-6px'
                    blue.style.height = '0px'
                    this.ballData.blueHeight = 0
                    this.ballData.icTop = 0
                    $(ic).stop().animate({ top: -(this.pages - 1) * (parseFloat(this.$refs.box.style.height)) + 'px' }, 300)
                }
            }
        },
        // 触摸右侧控制杆
        touchCtrlBar(e) {
            const ball = this.$refs.ball
            const ic = this.$refs.imgContainer
            const blue = this.$refs.blue
            const box = this.$refs.box
            const section = this.$refs.section
            this.ballData.ballL = parseFloat(ball.style.top)
            this.ballData.ballStartY = e.touches[0].pageY
            const ontouchmove = (e) => {
                e.stopPropagation()
                blue.style.height = e.touches[0].pageY - this.ballData.ballStartY + this.ballData.blueHeight + 'px'
                ball.style.top = e.touches[0].pageY - this.ballData.ballStartY + this.ballData.ballL + 'px'
                ic.style.top = -(this.pages - 1) * parseFloat(box.style.height) - ((e.touches[0].pageY - this.ballData.ballStartY) / 104 * (parseFloat(box.style.height) - section.offsetHeight)) + this.ballData.icTop + 'px'
                if (parseFloat(ball.style.top) >= 95) {
                    ball.style.top = '95px'
                    blue.style.height = '104px'
                    ic.style.top = -(this.pages - 1) * parseFloat(box.style.height) - (104 / 104 * (parseFloat(box.style.height) - section.offsetHeight)) + 'px'
                } else if (parseFloat(ball.style.top) <= -7) {
                    ball.style.top = '-7px'
                    blue.style.height = '0px'
                    ic.style.top = -(this.pages - 1) * parseFloat(box.style.height) - (0 / 104 * (parseFloat(box.style.height) - section.offsetHeight)) + 'px'
                }
            }
            const ontouchend = (e) => {
                e.stopPropagation()
                this.ballData.icTop = parseFloat(ic.style.top)
                this.ballData.blueHeight = parseFloat(blue.style.height)
            }
            ball.ontouchmove = ontouchmove
            ball.ontouchend = ontouchend
        },
        // 生成图片src
        createSrc(index) {
            return /base64|http/.test(this.data.coverList[index]) ? this.data.coverList[index] : Vue.env.host.file + this.data.coverList[index]
        },
        // 获取背景图片
        getBackgroundImage(src) {
            return Vue.filter('backgroundImage')(src)
        },
        // 改变在安卓或者苹果系统下 按钮的作用
        changeButton() {
            const u = navigator.userAgent
            var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1 // g
            var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) // ios终端
            if (isAndroid) {
                // 安卓
                this.toApp = '//download.sj.qq.com/upload/connAssitantDownload/upload/MobileAssistant_1.apk'
            }
            if (isIOS) {
                // ios
                this.toApp = 'https://itunes.apple.com/cn/app/%E6%98%93%E4%BC%81%E7%A7%80-%E4%BC%81%E4%B8%9A%E7%A7%BB%E5%8A%A8%E8%87%AA%E8%90%A5%E9%94%80%E6%8E%A8%E5%B9%BF%E5%B7%A5%E5%85%B7/id933128780?mt=8'
            }
            this.toWeb = 'http://topic.eqxiu.com/topic/1068.html'
        }
    }
}
</script>
<style lang="scss">
.platform-mobile {
    width: 100%;
    height: 100%;
    section {
        position: relative;
        width: 100%;
        height: 100%;
        background: #eceef0;
        position: fixed;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        &.justcenter {
            justify-content: flex-start;
        }
        .box {
            position: relative;
            overflow: hidden;
            .img-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
            }
        }
        .ctrl-bar {
            display: flex;
            width: 24px;
            height: 120px;
            border-radius: 4px 0px 0px 4px;
            box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.16);
            background: #fff;
            position: fixed;
            right: 0;
            top: 50%;
            transform: translate(0, -50%);
            align-items: center;
            justify-content: center;
            .progress {
                position: relative;
                width: 2px;
                border-radius: 2px;
                height: 104px;
                background: #ccd5db;
                .blue-bar {
                    position: absolute;
                    top: 0px;
                    left: 0px;
                    width: 2px;
                    height: 0px;
                    background: #1593ff;
                }
                .ball {
                    position: absolute;
                    top: -7px;
                    left: -7px;
                    height: 16px;
                    width: 16px;
                    border-radius: 100%;
                    background: #fff;
                    border: 1px solid #ccd5db;
                    z-index: 20;
                }
            }
        }
        .final-page {
            display: none;
            flex-direction: column;
            align-items: center;
            position: fixed;
            width: 100%;
            top: 100%;
            left: 0;
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
                font-family: HelveticaNeue;
                cursor: pointer;
                font-size: 14px;
                color: #666;
                position: absolute;
                left: 50%;
                top: 85%;
                transform: translate(-50%, -85%);
            }
        }
        .arrow {
            width: 100%;
            height: 50px;
            position: fixed;
            bottom: 0;
            left: 0;
            display: flex;
            justify-content: center;
            .up {
                color: #eceef0;
                position: absolute;
                top: 20px;
                font-size: 40px;
                animation: move 1s infinite;
            }
            @keyframes move {
                form {
                    top: 20px;
                }
                to {
                    top: 0px;
                }
            }
        }
    }
}
</style>
