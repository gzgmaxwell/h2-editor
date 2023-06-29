<template>
    <div class="eqc-photo-filter-item">
        <div
            class="img-item"
            @click="showEffect"
            @mouseover="showNameState = true"
            @mouseleave="showNameState = false"
        >
            <div
                ref="canvasWraper"
                :style="{background:`url('${snapshotEffectData}') center center/cover`}"
                class="img"
            />
            <div
                v-if="showNameState"
                :style="{height:showNameState?'35px':'0'}"
                class="hover"
            >
                <span>{{ item.name }}</span>
            </div>
        </div>

        <div
            :style="{height:item.state?'93px':'0'}"
            class="config"
        >
            <div class="slider-area">
                <filter-slider
                    :option="item"
                />
            </div>
            <div class="footer">
                <span
                    class="cancel"
                    @click="cancelClick"
                >取消</span>
                <span
                    class="application"
                    @click="applicationClick"
                >应用</span>
            </div>
        </div>
    </div>
</template>
<script>
import FilterSlider from './FilterSlider.vue'
import filterHelper from '../../../../../util/filterHelper'
import historyType from '../../../../../../config/enum.photoHistory.type'
export default {
    components: {
        FilterSlider
    },
    props: {
        item: {
            type: Object,
            default: () => ({})
        },
        groupItem: {
            type: Object,
            default: () => ({})
        },
        allData: {
            type: Array,
            default: () => ({})
        }
        // glcanvas: {
        //     type: HTMLCanvasElement,
        //     default: () => ({})
        // }
    },
    data() {
        return {
            historyType,
            // glCanvas: null,
            snapshotEffectData: null, // 快照的效果源
            mainGlCanvas: null,
            showNameState: false,
            configHeight: 0
        }
    },
    computed: {
        photoFilter() {
            return Vue.store.state.photoFilter
        },
        snapshot() {
            return this.photoFilter.snapshot
        },
        primaryImgData() {
            return this.photoFilter.primaryImgData
        },
        glCanvas() {
            return this.photoFilter.glCanvas
        },
        photoScene() {
            return Vue.store.state.photoScene
        },
        eqxPage() {
            return this.photoScene.eqxPage
        },
        firstAddHistory() {
            return this.photoFilter.firstAddHistory
        },
        photoHistory() { // 历史记录
            return Vue.store.state.photoHistory
        },
        selectType() {
            return Vue.store.state.photoLayout.nav.selectedItem.type
        },
        isHistoryChangeNav() {
            return this.photoScene.isHistoryChangeNav
        }
    },
    watch: {
        snapshot(newVal) {
            // 快照改变 立马刷新效果
            this.initImgEffect(newVal)
        }
    },
    mounted() {
        this.initImgEffect(this.snapshot)
    },
    methods: {
        setHistoryInGroup(config) {
            // 组内历史
            const background = {
                src: this.mainGlCanvas.toDataURL(),
                width: this.mainGlCanvas.width,
                height: this.mainGlCanvas.height
            }
            this.eqxPage.eqxBackground.setBackground(background)
            const operating = JSON.parse(JSON.stringify(config))
            const canvasNode = document.getElementsByClassName('eqc-photo-background-image-webgl')[0]
            operating.snapshot = this.snapshot
            this.photoHistory.history.insert(operating, canvasNode.toDataURL(), this.historyType.filter, true)
        },
        closeOthers() {
            this.allData.map(groupItem => {
                // 确保当前这个group 不被关闭
                if (groupItem !== this.groupItem) {
                    groupItem.state = false
                }
                groupItem.list.map(item => {
                    if (item !== this.item) {
                        item.state = false
                    }
                })
            })
        },
        // 展示效果
        showEffect() {
            this.closeOthers()
            // 用该item的配置去配置画布的主图
            this.item.state = !this.item.state
            if (this.item.state) {
                this.initEffectByConfig() // 配置打开 初始化主图
            } else {
                this.cancelEffect() // 配置关上  还原主图
            }
        },
        // 打开或者关闭该列表
        cancelClick() {
            this.item.state = false
            // 关掉就是取消特效
            this.cancelEffect()
        },
        // 应用
        applicationClick() {
            Vue.loading.open('加载中')
            // 点击应用之后 用当前画布的主图替换store里面的 然后刷新快照 储存历史记录
            // 把当前确定的效果图 保存到primiary_img 中 便于回退的时候 使用
            Vue.store.commit('PHOTO_FILTER_PRIMARY_IMG_CHANGE', this.mainGlCanvas.toDataURL())
            // 刷新快照
            filterHelper.initSnapshot().then(() => {
                Vue.loading.close()
                // 添加历史
                this.setHistoryInGroup(this.item.effect)
                // 关闭配置下拉 加timeout是为了 收缩的更平滑
                setTimeout(() => {
                    this.item.state = false
                })
            })
        },
        // 根据配置初始化特效
        initImgEffect(base64Data) {
            if (base64Data) {
                filterHelper.generateSnapshotDataByConfig(this.item.effect).then(data => {
                    this.snapshotEffectData = data
                })
            }
        },
        initEffectByConfig() {
            // 根据配置 初始化主图
            const canvasNode = document.getElementsByClassName('eqc-photo-background-image-webgl')[0]
            const glCanvas = canvasNode
            filterHelper.getEffectCanvasByConfig(glCanvas, this.primaryImgData, this.item.effect)
            this.mainGlCanvas = glCanvas
        },
        cancelEffect() {
            const imgNode = new Image()
            imgNode.src = this.primaryImgData
            const mainGlCanvas = this.mainGlCanvas
            imgNode.onload = function () {
                const texture = mainGlCanvas.texture(imgNode)
                mainGlCanvas.draw(texture).update()
            }
        }
    }
}
</script>
<style lang="scss">
.eqc-photo-filter-item {
    .img-item {
        position: relative;
        .img {
            width: 256px;
            height: 80px;
            background: #f6f9fa;
            cursor: pointer;
            margin-top: 12px;
        }
        .hover {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10;
            height: 35px;
            background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.5));
            display: flex;
            justify-content: flex-end;
            transition: all 1s;
            span {
                font-size: 12px;
                color: white;
                line-height: 35px;
                margin-right: 15px;
            }
        }
    }

    .config {
        transition: all 0.3s;
        overflow: hidden;
        .slider-area {
            height: 53px;
        }
        .footer {
            display: flex;
            justify-content: space-between;
            span {
                height: 30px;
                width: 122px;
                border: 1px solid #ccd5db;
                font-size: 13px;
                background: white;
                border-radius: 2px;
                font-weight: 400;
                cursor: pointer;
                line-height: 30px;
                text-align: center;
            }
            .cancel {
                color: #2f3c4d;
            }
            .application {
                background: #1593ff;
                color: white;
            }
        }
    }
}
</style>
