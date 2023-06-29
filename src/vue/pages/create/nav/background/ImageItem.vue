<template>
    <li
        :style="{backgroundImage: getBackgroundImage(item.productTypeMap.path)}"
        class="eqc-background-item"
        @click="selectBackground(item)"
    >
        <material-others
            v-if="item.useType === 1"
            :item="item"
        />
    </li>
</template>

<script>
import MaterialOthers from '../material/MaterialOthers.vue'
import pay from '../material/pay.js'
export default {
    components: {
        MaterialOthers
    },
    props: {
        item: {
            type: Object,
            default: null
        }
    },
    computed: {
        eqxPage() {
            return this.$store.state.scene.eqxPage
        },
        background() {
            return this.eqxPage.pageJson.properties.background.middle
        }
    },
    methods: {
        selectBackground(item) {
            if (item.useType === 1) {
                // 背景图
                pay.checkPayBeforeAdd(item).then(() => {
                    this.crop(item.productTypeMap.path)
                }).catch(err => err && Vue.logger.error(err))
            } else {
                // 背景纹理
                const background = {
                    type: 0,
                    src: item.productTypeMap.path,
                    size: 0.2,
                    opacity: 1
                }
                this.eqxPage.eqxBackground.setBackgroundMiddle(background)
                this.eqxPage.eqxHistory.add(this.eqxPage)
            }
        },
        getBackgroundImage(src) {
            src = Vue.filter('qiniuZoom')(src, 80)
            return Vue.filter('backgroundImage')(src)
        },
        crop(src) {
            const { width, height } = this.eqxPage.eqxScene.sceneJson
            const options = {
                ratio: width / height,
                src,
                crop: this.background.crop,
                hideOptions: true,
                type: 'background'
            }
            return this.dialog.openImageCrop(options)
                .then(result => {
                    const crop = result.crop
                    const background = {
                        type: 1,
                        src,
                        crop,
                        size: 1,
                        opacity: 1
                    }
                    this.eqxPage.eqxBackground.setBackgroundMiddle(background)
                    this.eqxPage.eqxHistory.add(this.eqxPage)
                })
                .catch(err => err && this.logger.error(err))
        }
    }
}
</script>

<style lang="scss">
.eqc-background-item {
    position: relative;
    width: 80px;
    height: 80px;
    margin-top: 8px;
    margin-left: 8px;
    background: #eceef0 center/contain no-repeat;
    cursor: pointer;
    &:nth-child(-n + 3) {
        margin-top: 0;
    }
    &:nth-child(3n + 1) {
        margin-left: 0;
    }
    &:hover {
        box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.16);
        border-radius: 3px;
    }
    &.clear {
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
