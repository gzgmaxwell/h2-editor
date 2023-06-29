<template>
    <div
        :style="{right:`${noticeArr[type].right}px`,bottom:`${noticeArr[type].bottom}px`}"
        class="eqc-head-notice"
    >
        <div class="left">
            <img
                v-if="type === 0"
                :src="notice1"
            >
            <img
                v-if="type === 1 || type === 3"
                :src="notice2"
            >
            <img
                v-if="type === 2"
                :src="notice3"
            >
        </div>
        <div class="right">
            <div class="title">
                {{ noticeArr[type].title }}
            </div>
            <div class="desc">
                {{ noticeArr[type].content }}
            </div>
        </div>
    </div>
</template>
<script>
import notice1 from '../../../../img/notice_img.png'
import notice2 from '../../../../img/notice_video.png'
import notice3 from '../../../../img/notice_line.png'
export default {
    props: {
        option: {
            type: Object,
            default: () => ({
                right: null,
                bottom: null
            })
        },
        type: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            notice1,
            notice2,
            notice3,
            noticeArr: [
                { // 图片
                    title: '查看路径：图片库>我的图片',
                    content: '在制作H5、轻设计、长页面、易表单、视频、互动时均可直接使用',
                    right: this.option.right ? this.option.right : 23,
                    bottom: this.option.bottom ? this.option.bottom : 66
                },
                { // video
                    title: '查看路径：视频库>我的视频',
                    content: '在使用其他编辑器时均可直接使用',
                    right: this.option.right ? this.option.right : 23,
                    bottom: this.option.bottom ? this.option.bottom : 66
                },
                { // 参考线
                    title: '确保重要内容在参考线以内，可以 有更好的自动播放效果',
                    content: '微信朋友圈小视频目前会自动播放，但只会显示参考线范围内的内容',
                    right: this.option.right ? this.option.right : 131,
                    bottom: this.option.bottom ? this.option.bottom : 66
                },
                { // video
                    title: '查看路径：视频库>我的视频',
                    content: '在使用其他编辑器时均可直接使用',
                    right: this.option.right ? this.option.right : 23,
                    bottom: this.option.bottom ? this.option.bottom : 90
                }
            ]
        }
    }

}
</script>
<style lang="scss">
.eqc-head-notice {
    width: 452px;
    height: 192px;
    position: absolute;
    padding: 27px 28px;
    display: flex;
    background: white;
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
    border-radius: 3px;
    .left {
        width: 142px;
        height: 138px;
        margin-right: 20px;
        img {
            width: 142px;
            height: 138px;
        }
    }
    .right {
        .title {
            font-size: 15px;
            font-weight: 600;
            color: rgba(34, 34, 34, 1);
            line-height: 20px;
        }
        .desc {
            margin-top: 16px;
            font-size: 13px;
            font-weight: 400;
            color: rgba(102, 102, 102, 1);
            line-height: 21px;
        }
    }
}
</style>
