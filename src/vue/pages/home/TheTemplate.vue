<template>
    <div class="eqc-home-template">
        <div
            :style="{height: isShowMore ? '' : minHeight + 'px'}"
            class="bg"
        >
            <div class="wrap">
                <div class="head">
                    <span class="title">热门分类</span>
                    <ul class="menu">
                        <li
                            class="item"
                            @click="toMall"
                        >
                            <i class="icon eqf-template-l" />
                            <span>模板商城</span>
                        </li>
                        <li
                            v-if="showBackBtn"
                            class="item back"
                            style="background: rgba(79, 93, 105, 1)"
                            @click="goBack"
                        >
                            <span>返回</span>
                        </li>
                        <!-- <li class="item" @click="openSize">
                        <i class="icon eqf-plus"></i>
                        <span>自定义创建</span>
                    </li> -->
                        <li
                            v-if="!hideMoreBtn"
                            class="item"
                            @click="showMore"
                        >
                            <i
                                :style="{transform: isShowMore ? 'rotate(180deg)' : ''}"
                                class="icon eqf-down more"
                            />
                            <span>{{ isShowMore ? '收起' : '展开' }}分类</span>
                        </li>
                    </ul>
                </div>
                <!-- 为了实现动画效果，拆成两个循环 -->
                <ul
                    v-if="banners[0]"
                    class="template border"
                >
                    <li
                        v-for="(item, index) of banners[0].list"
                        :key="item.id"
                        :_tracker_data_="`{text: '${item.name}'}`"
                        :style="{animationDelay: index * 50 + 'ms'}"
                        :act="item.name"
                        rdt="3"
                        cat="print"
                        class="item animation-fade-scale"
                    >
                        <div>
                            <img
                                :src="getImage(item.cover)"
                                class="cover"
                                alt=""
                                @click="addScene(item.type)"
                            >
                        </div>
                        <div class="name">
                            {{ item.name }}
                        </div>
                        <div class="size">
                            {{ `${item.width}*${item.height} ${item.unit === 'mm' ? '毫米' : '像素'}` }}
                        </div>
                    </li>
                    <li
                        class="custom"
                        @click="openSize"
                    >
                        <i class="icon eqf-plus" />
                        <div class="name">
                            自定义尺寸
                        </div>
                    </li>
                </ul>
                <div
                    v-for="(banner, index1) of banners.slice(1)"
                    :key="banner.name"
                >
                    <div
                        v-if="isShowMore"
                        class="title"
                    >
                        {{ banner.name }}
                    </div>
                    <ul
                        v-if="isShowMore"
                        class="template"
                    >
                        <li
                            v-for="(item, index2) of banner.list"
                            :key="item.id"
                            :_tracker_data_="`{text: '${item.name}'}`"
                            :style="{animationDelay: (index1 * banner.list.length + index2) * 50 + 'ms'}"
                            :act="item.name"
                            rdt="3"
                            cat="print"
                            class="item animation-fade-scale"
                        >
                            <div>
                                <img
                                    :src="getImage(item.cover)"
                                    class="cover"
                                    alt=""
                                    @click="addScene(item.type)"
                                >
                            </div>
                            <div class="name">
                                {{ item.name }}
                            </div>
                            <div class="size">
                                {{ `${item.width}*${item.height} ${item.unit === 'mm' ? '毫米' : '像素'}` }}
                            </div>
                        </li>
                        <li
                            v-if="banner.name === '热门分类'"
                            class="custom"
                            @click="openSize"
                        >
                            <i class="icon eqf-plus" />
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div
            v-if="!hideMoreBtn"
            class="more"
            @click="showMore"
        >
            <i
                :style="{transform: isShowMore ? 'rotate(180deg)' : ''}"
                class="icon eqf-down"
            />
        </div>
    </div>
</template>

<script>
import DialogSize from './DialogSize.vue'

export default {
    props: {
        hideMoreBtn: {
            type: Boolean,
            default: false
        },
        showBackBtn: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isShowMore: false,
            banners: [],
            minHeight: 233 + 96 - 1
        }
    },
    computed: {
        host() {
            return this.env.host
        }
    },
    created() {
        if (this.hideMoreBtn) {
            this.isShowMore = true
        }
        this.api.banner.getSceneBanners()
            .then(res => {
                this.banners = res.data.list
            })
            .catch(err => err && this.logger.error(err))
    },
    methods: {
        getImage(src) {
            return this.host.file + Vue.filter('qiniuZoom')(src, 160)
        },
        toMall() {
            window.open(this.env.host.mall + '/h2/', '_blank')
        },
        showMore() {
            this.isShowMore = !this.isShowMore
            if (!this.isShowMore) {
                window.scrollTo(0, 0)
            }
        },
        openSize() {
            const options = {
                component: DialogSize
            }
            this.dialog.open(options)
                .then(data => this.addScene(data.type, data.width, data.height, data.unit))
                .catch(err => err && this.logger.error(err))
        },
        addScene(type, width, height, unit) {
            const route = {
                path: '/create',
                query: {
                    type,
                    width,
                    height,
                    unit,
                    history: true
                }
            }
            // 改为新打开一个tab
            const routeData = this.$router.resolve(route)
            window.open(routeData.href, '_blank')
        },
        goBack() {
            this.$router.push({ name: 'scene' })
        }
    }
}
</script>

<style lang="scss">
.eqc-home-template {
    position: relative;
    .bg {
        overflow: hidden;
        color: #fff;
        background-image: linear-gradient(0deg, #1593ff 0%, #5d61ff 100%);
        transition: all 0.3s;
        .wrap {
            max-width: 1200px;
            margin: auto;
            .head {
                height: 96px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                .title {
                    font-size: 28px;
                }
                .menu {
                    display: flex;
                    .item {
                        display: flex;
                        align-items: center;
                        height: 36px;
                        padding: 0 16px;
                        font-size: 14px;
                        text-align: center;
                        border: 2px solid #fff;
                        border-radius: 18px;
                        cursor: pointer;
                        transition: all 0.3s;
                        &:not(:nth-child(1)) {
                            margin-left: 12px;
                        }
                        &:hover {
                            background: rgba(255, 255, 255, 0.2);
                        }
                        .icon {
                            position: relative;
                            right: 4px;
                            font-size: 16px;
                            &.more {
                                font-size: 20px;
                                transition: all 0.3s;
                            }
                        }
                    }
                }
            }
            .template {
                display: flex;
                flex-wrap: wrap;
                align-items: flex-end;
                padding-bottom: 20px;
                border-bottom: 1px solid transparent;
                &.border {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.4);
                }
                .item {
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    width: 160px;
                    height: 212px;
                    margin: 0 38px 24px 0;
                    text-align: center;
                    pointer-events: none;
                    &:hover {
                        .cover {
                            box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
                            transform: translateY(-4px);
                        }
                        .size {
                            opacity: 1;
                        }
                    }
                    .cover {
                        max-width: 160px;
                        max-height: 160px;
                        vertical-align: top;
                        transition: all 0.3s;
                        pointer-events: auto;
                        cursor: pointer;
                    }
                    .name {
                        height: 36px;
                        line-height: 36px;
                    }
                    .size {
                        height: 16px;
                        line-height: 16px;
                        font-size: 12px;
                        opacity: 0;
                        transition: all 0.3s;
                    }
                }
                .custom {
                    display: inline-flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-end;
                    width: 160px;
                    height: 212px;
                    margin-right: 48px;
                    padding-bottom: 40px;
                    .icon {
                        width: 100px;
                        height: 100px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: 2px solid #fff;
                        border-radius: 4px;
                        font-size: 20px;
                        cursor: pointer;
                        transition: all 0.3s;
                        &:hover {
                            background: rgba(255, 255, 255, 0.2);
                        }
                    }
                    .name {
                        height: 36px;
                        line-height: 36px;
                    }
                }
            }
            .title {
                height: 84px;
                padding: 24px 0;
                line-height: 36px;
                font-size: 18px;
            }
        }
    }
    > .more {
        position: absolute;
        left: 50%;
        bottom: -20px;
        width: 48px;
        height: 48px;
        margin-left: -20px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #1bc7b1;
        box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s;
        &:hover {
            background: #00b49d;
        }
        .icon {
            font-size: 36px;
            color: #fff;
            transition: all 0.3s;
        }
    }
}
</style>
