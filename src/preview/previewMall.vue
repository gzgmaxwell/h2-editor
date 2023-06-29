<template>
    <div
        class="preview-mall"
    >
        <div class="swiper-container">
            <div class="swiper-wrapper">
                <div
                    v-for="(item,index) in covers"
                    :key="index"
                    class="swiper-slide"
                >
                    <div class="swiper-zoom-container">
                        <img :src="getPath(item)">
                    </div>
                </div>
            </div>
        </div>
        <div
            v-if="!isMobile"
            class="action-bar"
        >
            <div
                class="amplification"
                @click="fullScreen"
            >
                {{ isFullScreen ? '返回':'查看大图' }}
            </div>
            <div class="upDown">
                <div
                    class="zoom-out eqf-zoom-out"
                    @click="zoom('out')"
                />
                <div
                    class="zoom-in eqf-zoom-in"
                    @click="zoom('in')"
                />
                <div
                    class="up eqf-menu-up"
                    @click="up"
                />
                <div class="page-number">
                    {{ currentPage }}&nbsp;/&nbsp;{{ totalCount }}
                </div>
                <div
                    class="down eqf-menu-down"
                    @click="down"
                />
            </div>
        </div>
    </div>
</template>

<script>
import delayLoad from '../utils/delayLoad'
import message from '../utils/message'

export default {
    data() {
        return {
            mySwiper: null,
            covers: [], // 封面图
            currentPage: 1,
            totalCount: 0,
            isMobile: false,
            isFullScreen: false // 是否是全屏
        }
    },
    created() {
        // window.addEventListener('message', this.onMessage)
        const loadSwipercss = delayLoad.delayLoadCSS(Vue.plugin.swipercss)
        const loadSwiperjs = delayLoad.delayLoadJS(Vue.plugin.swiperjs)
        Promise.all([loadSwipercss, loadSwiperjs]).then(() => {
            this.getData()
        }).catch(err => err && this.logger.error(err))
        this.isMobile = this.isMobilePlt()
    },
    destroyed() {
        // window.removeEventListener('message', this.onMessage)
    },
    methods: {
        isMobilePlt() {
            return /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)
        },
        getPath(item) {
            return Vue.env.host.file + item
        },
        setBannerData() {
            this.$nextTick(function () {
                // eslint-disable-next-line
                const swiper = new Swiper('.swiper-container', {
                    autoplay: false,
                    direction: 'vertical',
                    zoom: true,
                    on: {
                        slideChange: () => {
                            this.currentPage = this.mySwiper.activeIndex + 1
                        }
                    }
                })
                this.mySwiper = swiper
            })
        },
        // 获取数据
        getData() {
            const id = location.href.split('?')[0].split('/q/')[1]
            // 添加埋点作品id对象
            let pid = id
            if (id.split('_')[0]) {
                pid = id.split('_')[0] // id_code 形式需要分离id
            }
            window.scene = { id: pid }
            Vue.api.getCoversBySourceId(id).then(res => {
                if (res.data && res.data.list) {
                    this.covers = res.data.list[0] ? res.data.list[0][pid] : []
                    this.totalCount = this.covers.length
                    this.setBannerData()
                } else {
                    console.log('no covers found')
                }
            })
        },
        // 全屏展示
        fullScreen() {
            if (!this.isFullScreen) {
                message.success({
                    msg: 'fullScreen'
                })
                this.isFullScreen = true
            } else {
                message.success({
                    msg: 'exitFullScreen'
                })
                this.isFullScreen = false
            }
        },
        up(e) {
            this.mySwiper.slidePrev()
        },
        down(e) {
            this.mySwiper.slideNext()
        },
        zoom(type) {
            if (type === 'out') {
                this.mySwiper.zoom.in()
            } else {
                this.mySwiper.zoom.out()
            }
        }
    }
}
</script>

<style lang="scss">
.preview-mall {
    width: 100%;
    height: 100%;
    background: #e6ebed;
    .swiper-container {
        width: 100%;
        height: 100%;
    }
    .swiper-slide {
        text-align: center;
        font-size: 18px;
        background: #e6ebed;
        /* Center slide text vertically */
        display: -webkit-box;
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
        -webkit-box-pack: center;
        -ms-flex-pack: center;
        -webkit-justify-content: center;
        justify-content: center;
        -webkit-box-align: center;
        -ms-flex-align: center;
        -webkit-align-items: center;
        align-items: center;
    }
    .action-bar {
        height: 100%;
        // width: 40px;
        padding: 24px 0;
        position: absolute;
        right: 24px;
        top: 0px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        color: #fff;
        z-index: 1;
        .amplification {
            width: auto;
            height: auto;
            font-size: 14px;
            color: #ffffff;
            text-align: center;
            line-height: 14px;
            padding: 7px 14px;
            border-radius: 16px;
            transition: all 0.3s;
            cursor: pointer;
            background: #000;
            opacity: 0.3;
        }
        .zoom-in,
        .zoom-out,
        .up,
        .down {
            width: 40px;
            height: 40px;
            transition: all 0.3s;
            background: #000;
            opacity: 0.2;
            border-radius: 3px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 25px;
        }
        .amplification:hover,
        .zoom-in:hover,
        .zoom-out:hover,
        .up:hover,
        .down:hover {
            opacity: 1;
        }
        .zoom-in,
        .zoom-out {
            margin-bottom: 16px;
        }
        .page-number {
            text-align: center;
            color: #333;
            font-size: 14px;
            margin: 12px 0;
        }
    }
}
</style>
