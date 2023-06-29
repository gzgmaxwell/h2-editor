<template>
    <div class="eqc-photo-filter">
        <div
            ref="groupList"
            v-scroll-bar
            class="group-list"
        >
            <ul class="group-list-ui">
                <filter-group-item
                    v-for="(item,i) in filterConfig"
                    :key="i"
                    :item="item"
                    :all-data="filterConfig"
                />
            </ul>
        </div>
    </div>
</template>
<script>
import filterConfig from '../../../config/filterConfig.js'
import FilterGroupItem from './filter/FilterGroup.vue'
import filterHelper from '../../../../util/filterHelper'
export default {
    components: {
        FilterGroupItem
    },
    data() {
        return {
            filterConfig,
            glCanvas: null,
            texture: null
        }
    },
    computed: {
        selectType() {
            return Vue.store.state.photoLayout.nav.selectedItem.type
        },
        photoFilter() {
            return Vue.store.state.photoFilter
        },
        primaryImgData() {
            return this.photoFilter.primaryImgData
        },
        photoScene() {
            return Vue.store.state.photoScene
        },
        eqxPage() {
            return this.photoScene.eqxPage
        },
        originImage() {
            return this.photoScene.originImageShot
        },
        isBackToOriginState() {
            return this.photoFilter.isBackToOriginState
        },
        sceneJson() {
            return this.photoScene.eqxScene.sceneJson
        },
        isHistoryChangeNav() {
            return this.photoScene.isHistoryChangeNav
        },
        executeFilter() {
            return this.photoFilter.executeFilter
        }
    },
    watch: {
        selectType(newVal, oldVal) {
            if (newVal === 'filter') {
                this.initEnvironment().then(() => {
                    if (!this.isHistoryChangeNav) {
                        filterHelper.initSnapshot()
                    }
                })
                Vue.store.commit('PHOTO_FILTER_FIRST_ADD_HISTORY', true)
            }
            if (oldVal === 'filter') {
                this.closeAllConfig()
                // 切走的时候 要把webgl canvas 转换为2d的canvas
                const rendering2dCanvas = document.getElementsByClassName('eqc-photo-background-image')[0]
                const ctx = rendering2dCanvas.getContext('2d')
                ctx.drawImage(this.glCanvas, 0, 0)
            }
            if (newVal !== 'base' && oldVal === 'filter') {
                // 切走其他非base的场景 要把rendering2d的canvas 展示出来
                const rendering2dCanvas = document.getElementsByClassName('eqc-photo-background-image')[0]
                const webglCanvas = document.getElementsByClassName('eqc-photo-background-image-webgl')[0]
                rendering2dCanvas.style.display = 'block'
                webglCanvas.style.display = 'none'
            }
        },
        executeFilter() {
            if (this.selectType === 'filter' && this.primaryImgData) {
                // 用户前进或者回退时，导致primaryImgData与当前的不一致，则强制使其一致
                Vue.loading.open('加载中')
                this.getNewImgByData(this.primaryImgData, this.photoFilter.width, this.photoFilter.height).then(() => {
                    // 再去生成快照
                    filterHelper.initSnapshot()
                    Vue.loading.close()
                })
                // 左边配置全部还原
                setTimeout(() => {
                    this.closeAllConfig()
                })
            }
        },
        primaryImgData(newData) {
            if (this.selectType === 'filter' && newData) {
                const canvasNode = document.getElementsByClassName('eqc-photo-background-image-webgl')[0]
                if (canvasNode.toDataURL() !== newData) {
                // 用户前进或者回退时，导致primaryImgData与当前的不一致，则强制使其一致
                    Vue.loading.open('加载中')
                    this.getNewImgByData(newData, this.photoFilter.width, this.photoFilter.height).then(() => {
                        // 再去生成快照
                        filterHelper.initSnapshot()
                        Vue.loading.close()
                    })
                }
                // 左边配置全部还原
                setTimeout(() => {
                    this.closeAllConfig()
                })
            }
        },
        originImage(newOriginImage) {
            if (this.selectType === 'filter' && newOriginImage) {
                Vue.store.commit('PHOTO_FILTER_FIRST_ADD_HISTORY', true)
                // 原图发生了改变
                const { width, height } = Vue.store.state.photoScene.originImageSize
                this.getNewImgByData(newOriginImage, width, height).then(() => {
                    // 保存变化了的  注释的理由是 initSnapshot 里面有
                    // Vue.store.commit('PHOTO_FILTER_PRIMARY_IMG_CHANGE', newOriginImage)
                    // 原图发生改变之后 快照也要跟着变
                    filterHelper.initSnapshot().then(() => {
                        this.setHistory()
                    })
                })
            }
        },
        isBackToOriginState() {
            if (this.selectType === 'filter') {
                Vue.store.commit('PHOTO_FILTER_FIRST_ADD_HISTORY', true)
                const { width, height } = Vue.store.state.photoScene.originImageSize
                this.getNewImgByData(this.originImage, width, height).then(() => {
                    // 原图发生改变之后 快照也要跟着变
                    filterHelper.initSnapshot().then(() => {
                        this.setHistory()
                    })
                })
                // 左边配置全部还原
                setTimeout(() => {
                    this.closeAllConfig()
                })
            }
        },
        filterConfig: {
            handler() {
                setTimeout(() => this.$refs.groupList && this.$refs.groupList.myScroll.refresh(), 300)
            },
            deep: true
        }
    },
    created() {
        this.glCanvas = document.getElementsByClassName('eqc-photo-background-image-webgl')[0]
        filterHelper.initSnapshot()
        this.initEnvironment().then(() => {
            filterHelper.initSnapshot()
        })
    },
    methods: {
        // 更新webgl的canvas
        updateMainCanvasAndTexture(canvas) {
            return new Promise((resolve, reject) => {
                const imgNode = new Image()
                imgNode.src = canvas.toDataURL()
                const glCanvas = document.getElementsByClassName('eqc-photo-background-image-webgl')[0]
                imgNode.onload = function () {
                    const texture = glCanvas.texture(imgNode)
                    glCanvas.draw(texture).update()
                    resolve()
                }
            })
        },
        setHistory() {
            const canvasNode = document.getElementsByClassName('eqc-photo-background-image-webgl')[0]
            const background = {
                src: canvasNode.toDataURL(),
                width: canvasNode.width,
                height: canvasNode.height
            }
            this.eqxPage.eqxBackground.setBackground(background)
        },
        closeAllConfig() {
            this.filterConfig.map(groupItem => {
                groupItem.state = false
                groupItem.list.map(item => {
                    item.state = false
                })
            })
        },
        // 初始化生成快照
        initSnapshot() {
            filterHelper.initSnapshot()
        },
        // 初始化环境  打开webglcanvas 关闭rendering2d的canvas
        initEnvironment() {
            return new Promise((resolve, reject) => {
                const rendering2dCanvas = document.getElementsByClassName('eqc-photo-background-image')[0]
                const webglCanvas = document.getElementsByClassName('eqc-photo-background-image-webgl')[0]
                this.updateMainCanvasAndTexture(rendering2dCanvas).then(() => {
                    rendering2dCanvas.style.display = 'none'
                    webglCanvas.style.display = 'block'
                    resolve()
                })
            })
        },
        getNewImgByData(data, width, height) {
            return new Promise((resolve, reject) => {
                const glCanvas = document.getElementsByClassName('eqc-photo-background-image-webgl')[0]
                const imgNode = new Image()
                imgNode.src = data
                const that = this
                if (width && height) {
                    imgNode.style.width = this.sceneJson.width + 'px'
                    imgNode.style.height = this.sceneJson.height + 'px'
                }
                // this.testImgNode(imgNode)
                imgNode.onload = function () {
                    // 有则更新 无则新建
                    if (that.texture) {
                        that.texture.loadContentsOf(imgNode)
                    } else {
                        that.texture = glCanvas.texture(imgNode)
                    }
                    glCanvas.draw(that.texture).update()
                    that.setHistory() // 添加到背景 不然下载会不生效
                    resolve()
                }
            })
        },
        // 测试选中的imgNode 对不对
        testImgNode(imgNode) {
            const $tempDiv2 = document.createElement('div')
            document.body.appendChild($tempDiv2)
            // $tempDiv.attr({ id: 'h2-photo-tmp-div-img' })
            $tempDiv2.css({
                position: 'fixed',
                top: 0,
                left: 500,
                width: this.glCanvas.width + 'px',
                height: this.glCanvas.height + 'px',
                zIndex: 1000 // 避免盖在当前页面上
            })
            $tempDiv2.append(imgNode)
        }
    }
}
</script>
<style lang="scss">
.eqc-photo-filter {
    padding: 0 16px;
    .group-list {
        height: 100%;
    }
}
</style>
