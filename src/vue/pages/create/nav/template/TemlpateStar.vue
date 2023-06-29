<template>
    <div
        ref="star"
        :class="{active:item.collectionFlag === 1 || showActive}"
        class="eqc-template-star"
        @mousemove="showActive = true"
        @mouseleave="showActive = false"
        @click="collectClick($event)"
    >
        <span class="start">
            <i
                v-if="item.collectionFlag||showActive"
                class="eqf-star-f"
            />
            <i
                v-else
                class="eqf-star-l"
            />
        </span>
    </div>
</template>
<script>
export default {
    props: {
        item: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            showActive: false
        }
    },
    computed: {
        userId() {
            return Vue.store.state.user.userInfo.id
        }
    },
    methods: {
        collectClick($event) {
            $event.stopPropagation()
            if (this.userId) {
                const data = {
                    productId: this.item.id,
                    categoryId: this.item.elementType,
                    type: 1
                }
                if (this.item.collectionFlag === 1) {
                    // 删除收藏
                    Vue.api.product.deleteFavorite(data.productId).then(data => {
                        Vue.notifier.info('取消收藏成功')
                        // 刷新收藏列表
                        Vue.store.commit('TEMPLATE_COLLECT_LIST_CHANGE')
                    }).catch(() => {
                        Vue.notifier.warn('取消收藏失败')
                    })
                } else {
                    // 添加收藏
                    Vue.api.product.addFavoriteOrHasBuy(data).then(data => {
                        if (Number(data.data.obj) === 1) {
                            Vue.notifier.warn('已收藏，请勿重复添加')
                        } else {
                            Vue.notifier.info('收藏成功')
                        }
                    }).catch(() => {
                        Vue.notifier.warn('收藏失败')
                    })
                }
            } else {
                // 游客模式 弹窗购买
                this.dialog.openLogin()
                    .then(() => this.user.auth())
                    .then(() => this.api.scene.transferScene(this.eqxScene.sceneJson.id, this.userInfo.loginName, true))
                    .catch(err => err && this.logger.error(err))
            }
        }
    }
}
</script>
<style lang="scss">
.eqc-template-star {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 24px;
    height: 24px;
    display: inline-flex;
    border-radius: 2px;
    background: rgb(147, 149, 150);
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.3s;
    z-index: 4;
    &.active {
        color: #ffe623;
    }
    i {
        font-size: 15px;
    }
}
</style>
