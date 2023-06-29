<template>
    <div class="eqc-home-head">
        <div class="wrap">
            <i class="logo eqf-eqxiulogoorgin" />
            <div class="photo-box">
                <div
                    :style="{backgroundImage: getBackgroundImage(userInfo.headImg)}"
                    class="photo"
                >
                    <i
                        v-if="!userInfo.headImg"
                        class="icon eqf-user-f"
                    />
                </div>
                <div class="dropdown">
                    <a
                        :href="`${host.client}/site/homepage`"
                        class="item"
                    >返回首页</a>
                    <a
                        class="item"
                        @click="logout"
                    >安全退出</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    computed: {
        host() {
            return this.env.host
        },
        userInfo() {
            return this.$store.state.user.userInfo
        }
    },
    methods: {
        getBackgroundImage(src) {
            src = Vue.filter('qiniuZoom')(src, 40)
            return Vue.filter('backgroundImage')(src)
        },
        logout() {
            this.api.user.logout()
                .then(() => {
                    location.href = this.host.client
                })
                .catch(err => err && this.logger.error(err))
        }
    }
}
</script>

<style lang="scss">
.eqc-home-head {
    position: relative;
    height: 60px;
    width: 100%;
    left: 0;
    top: 0;
    z-index: 1; // 需要固定在最上面且不被下面的内容遮挡
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
    background: #fff;
    .wrap {
        max-width: 1200px;
        height: 60px;
        margin: auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .logo {
            font-size: 36px;
            color: #1593ff;
        }
        .photo-box {
            position: relative;
            z-index: 1;
            padding: 10px 0;
            &:hover {
                padding: 10px 0 10px 110px;
                .dropdown {
                    display: block;
                }
            }
            .photo {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #1593ff no-repeat center/cover;
                .icon {
                    font-size: 24px;
                    color: #fff;
                }
            }
            .dropdown {
                position: absolute;
                right: 0;
                top: 60px;
                display: none;
                box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
                background: #fff;
                .item {
                    display: block;
                    width: 150px;
                    height: 40px;
                    line-height: 40px;
                    text-align: center;
                    transition: all 0.3s;
                    cursor: pointer;
                    &:nth-child(even) {
                        background: #f7f7f7;
                    }
                    &:hover {
                        color: #fff;
                        background: #1593ff;
                    }
                }
            }
        }
    }
}
</style>
