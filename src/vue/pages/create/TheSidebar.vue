<template>
    <div class="eqc-sidebar">
        <ul class="list">
            <li
                :class="{disable: disableBack}"
                :data-hint="isMac ? '撤销 ⌘Z' : '撤销 Ctrl Z'"
                class="item hint--left hint--rounded"
                @click="back"
            >
                <i class="icon eqf-back" />
            </li>
            <li
                :class="{disable: disableForward}"
                :data-hint="isMac ? '恢复 ⌘Y' : '恢复 Ctrl Y'"
                class="item hint--left hint--rounded"
                @click="forward"
            >
                <i class="icon eqf-rework" />
            </li>
            <li
                v-if="!expressMode && !puzzleMode"
                class="item hint--left hint--rounded"
                data-hint="预览和设置"
                @click="openPreview('setting')"
            >
                <i class="icon eqf-ppt-l" />
            </li>
            <li
                v-if="!puzzleMode"
                :class="{active: showGridPanel}"
                class="item hint--left hint--rounded"
                data-hint="网格"
                @mousedown.stop
                @click="openGrid"
            >
                <i class="icon eqf-net" />
                <base-new
                    :css="{right: '6px', top: '6px'}"
                    :storage-key="storageLocalKey.newGrid"
                    storage-version="1"
                />
                <div class="panel">
                    <transition name="rotate-y-right">
                        <sidebar-grid v-show="showGridPanel" />
                    </transition>
                </div>
            </li>
            <li
                v-if="!puzzleMode"
                :class="{active: showRulerPanel}"
                data-hint="标尺"
                class="item hint--left hint--rounded"
                @mousedown.stop
                @click="openRuler"
            >
                <i class="icon eqf-ruler" />
                <base-new
                    :css="{right: '6px', top: '6px'}"
                    :storage-key="storageLocalKey.newRuler"
                    storage-version="1"
                />
                <div class="panel">
                    <transition name="rotate-y-right">
                        <sidebar-ruler v-show="showRulerPanel" />
                    </transition>
                </div>
            </li>
            <li
                v-if="!puzzleMode"
                :class="{active: layer.show}"
                :data-hint="layer.show ? '隐藏图层面板' : '显示图层面板'"
                class="item hint--left hint--rounded"
                @click="openLayer"
            >
                <i class="icon eqf-layers-l" />
                <!-- <base-new
                    :css="{right: '6px', top: '6px'}"
                    :storage-key="storageLocalKey.newLayout"
                    storage-version="2"/> -->
            </li>
            <li
                v-if="!puzzleMode"
                class="item hint--left hint--rounded"
                data-hint="清空"
                @click="clear"
            >
                <i class="icon eqf-clear-l" />
            </li>
        </ul>
        <ul
            v-if="!puzzleMode"
            class="list bottom"
        >
            <li
                v-if="user.allow('showComponentWarning')"
                class="item notice"
            >
                <div
                    class="box"
                    @click="skipToComparePage"
                >
                    三端功能对比
                </div>
            </li>
            <li
                v-if="!isChrome || isEdge"
                class="item chrome"
                @click="openChrome"
            >
                <i class="icon" />
            </li>
            <li
                v-if="allowUploadPdf"
                class="item pdf"
                @click="openPdf"
            >
                <i class="icon" />
            </li>
            <li
                v-if="allowUploadPsd"
                class="item ps"
                @click="openPs"
            >
                <i class="icon eqf-ps" />
            </li>
        </ul>
    </div>
</template>

<script>
import util from '../../../utils/util'
import storageLocal from '../../../utils/storageLocal'
import storageSession from '../../../utils/storageSession'
import SidebarPreview from './sidebar/SidebarPreview.vue'
import SidebarGrid from './sidebar/SidebarGrid.vue'
import SidebarRuler from './sidebar/SidebarRuler.vue'
import DialogPsd from './sidebar/DialogPsd.vue'
import DialogChrome from './sidebar/DialogChrome.vue'
import statistic from '../../../config/statistic'
import EnumSceneType from '../../../config/enum.scene.type'
import DialogPdf from './sidebar/DialogPdf.vue'

export default {
    components: {
        SidebarGrid,
        SidebarRuler
    },
    data() {
        return {
            showGridPanel: false,
            showRulerPanel: false,
            showSceneCut: true
        }
    },
    computed: {
        scene() {
            return this.$store.state.scene
        },
        eqxScene() {
            return this.scene.eqxScene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        disableBack() {
            return this.scene.disableBack
        },
        disableForward() {
            return this.scene.disableForward
        },
        allowUploadPsd() {
            return this.user.allow('uploadPsd')
        },
        allowUploadPdf() {
            return this.user.allow('uploadPdf')
        },
        isChrome() {
            return util.isChrome
        },
        isEdge() {
            return util.isEdge
        },
        chromeVersion() {
            return util.getChromeVersion()
        },
        layout() {
            return this.$store.state.layout
        },
        layer() {
            return this.layout.layer
        },
        ruler() {
            return this.$store.state.guideLine.ruler
        },
        isMac() {
            return util.isMac
        },
        storageLocalKey() {
            return storageLocal.key
        },
        userInfo() {
            return this.$store.state.user.userInfo
        },
        isSaving() {
            return this.scene.isSaving
        },
        type() {
            return this.eqxPage.eqxScene.sceneJson.type
        },
        expressMode() {
            return this.$store.state.scene.expressMode
        },
        puzzleMode() {
            return this.$store.state.scene.puzzleMode
        }
    },
    watch: {
        type(newVal) {
            // 如果是gif场景的话 隐藏size切换
            this.showSceneCut = !EnumSceneType.isAllowAddGifToScene(newVal)
        }
    },
    created() {
        if ((this.isChrome && this.chromeVersion < 55) || !this.isChrome || this.isEdge) {
            this.openChrome()
        }
    },
    mounted() {
        setTimeout(() => {
            this.scale = this.eqxPage.scale
        }, 100)
        const sceneType = this.eqxPage.eqxScene.sceneJson.type
        this.showSceneCut = !EnumSceneType.isAllowAddGifToScene(sceneType)
    },
    methods: {
        back() {
            !this.disableBack && this.$store.commit('HISTORY_BACK')
        },
        forward() {
            !this.disableForward && this.$store.commit('HISTORY_FORWORD')
        },
        // 这样会触发清除组件的选中状态，能让修改中的文字即时生效
        clearWorkspace() {
            return new Promise((resolve, reject) => {
                this.eqxPage.$el.parentElement.trigger('mousedown')
                document.trigger('mouseup')
                const allElements = this.eqxPage.eqxElements
                allElements.map(item => {
                    const { border } = item.elementJson.css
                    if (border) { // 只有组合模式下 预览的时候边框来不及去掉  现在强制去掉
                        delete item.elementJson.css.border // 去掉所有组件的border
                        item.updateCss(item.elementJson.css) // 解决临时组合预览之后留下的边框问题
                    }
                })
                setTimeout(() => {
                    resolve()
                }, 100)
            })
        },
        openSide(infoObj) {
            const eqxPages = this.eqxPage.eqxScene.eqxPages
            eqxPages.forEach(element => {
                infoObj.coverList.push(element.pageJson.cover)
            })
            infoObj.currentCover = this.eqxPage.pageJson.cover
            storageSession.setItem(storageSession.key.shareInfo, infoObj)
            storageSession.setItem(storageSession.key.userInfo, Vue.store.state.user.userInfo)
            this.slide.open({ component: SidebarPreview })
                .catch(err => err && this.logger.error(err))
        },
        openPreview(way) {
            // 预览的时候把用户信息存入localstorage中  在预览页面判断用户类型 只有秀客和超级账号才能上传封面
            storageLocal.setItem(this.storageLocalKey.userInfo, this.userInfo)
            const infoObj = {
                currentCover: '',
                coverList: [],
                width: this.eqxPage.width / this.eqxPage.scale,
                height: this.eqxPage.height / this.eqxPage.scale,
                title: this.eqxScene.sceneJson.title,
                description: this.eqxScene.sceneJson.description,
                scale: this.scale,
                printId: this.eqxScene.sceneJson.id,
                userId: this.userInfo.id,
                bindPhone: this.userInfo.phone,
                type: this.userInfo.type,
                share: this.eqxScene.sceneJson.isShare,
                way: way || ''
            }
            if (this.isSaving) {
                return
            }
            this.clearWorkspace().then(() => {
                if (this.eqxPage.isModified) {
                    this.loading.open('正在保存')
                    this.$store.dispatch('PAGE_SAVE', { eqxPage: this.eqxPage, needCover: true })
                        .then(() => {
                            this.loading.close()
                            this.openSide(infoObj)
                        })
                        .catch(err => {
                            this.loading.close()
                            err && Vue.logger.error(err)
                        })
                } else {
                    this.openSide(infoObj)
                }
            })
        },
        openGrid() {
            const mousedown = () => {
                this.showGridPanel = false
                document.removeEventListener('mousedown', mousedown)
            }

            this.showGridPanel = !this.showGridPanel

            if (this.showGridPanel) {
                this.showRulerPanel = false
                document.removeEventListener('mousedown', mousedown)
                document.addEventListener('mousedown', mousedown)
            }
        },
        openRuler() {
            const mousedown = () => {
                this.showRulerPanel = false
                document.removeEventListener('mousedown', mousedown)
            }

            this.showRulerPanel = !this.showRulerPanel

            if (this.showRulerPanel) {
                this.showGridPanel = false
                document.removeEventListener('mousedown', mousedown)
                document.addEventListener('mousedown', mousedown)
            }
        },
        openLayer() {
            this.$store.commit('LAYOUT_LAYER', { show: !this.layer.show })
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.LBTN])
        },
        clear() {
            this.eqxPage.clearPage()
            this.$store.commit('ELEMENT_SELECT', { eqxElements: [] })
        },
        openChrome() {
            this.dialog.open({
                component: DialogChrome
            })
                .catch(err => err && this.logger.error(err))
        },
        openPs() {
            const { width, height } = this.eqxScene.sceneJson
            this.dialog.open({
                component: DialogPsd,
                data: {
                    width,
                    height
                }
            })
                .catch(err => err && this.logger.error(err))
        },
        skipToComparePage() {
            window.open('https://shimo.im/sheets/hWr33wwC9PrV8Qcd/Rlv7R/')
        },
        openPdf() {
            this.dialog.open({
                component: DialogPdf,
                data: {
                    width: 800,
                    height: 800
                }
            })
                .catch(err => err && this.logger.error(err))
        }
    }
}
</script>

<style lang="scss">
.eqc-sidebar {
    position: relative;
    width: 49px;
    height: 100%;
    border-right: 1px solid rgba(204, 213, 219, 1);
    border-left: 1px solid rgba(204, 213, 219, 1);
    background: #fdfdfd;
    .list {
        &.bottom {
            position: absolute;
            bottom: 0;
        }
        .notice {
            height: 108px !important;
            font-size: 12px;
            color: #2f3c4d;
            writing-mode: vertical-lr;
            .box {
                width: 28px !important;
                height: 108px !important;
                border: 1px solid #ccd5db;
                display: flex;
                justify-content: center;
                align-items: center;
                letter-spacing: 2px;
                background: rgba(247, 248, 249, 1);
            }
        }
        .item {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 48px;
            height: 48px;
            cursor: pointer;
            .icon {
                font-size: 20px;
                color: rgba(37, 43, 63, 1);
                transition: all 0.3s;
            }
            &.chrome {
                &:hover {
                    .icon {
                        animation-play-state: running;
                    }
                }
                .icon {
                    display: block;
                    width: 50%;
                    height: 50%;
                    background: url("../../../img/chrome.svg");
                    animation: rotate-infinite 3s linear infinite;
                    animation-play-state: paused;
                }
            }
            &.ps {
                .icon {
                    border: 2px solid #00dbfe;
                    color: #00dbfe;
                    background: #001d26;
                }
                &:hover {
                    .icon {
                        color: #00dbfe;
                        border: 2px solid #001d26;
                    }
                }
            }
            &.pdf {
                .icon {
                    width: 30px;
                    height: 30px;
                    background: url("../../../img/pdf.svg") center no-repeat;
                }
            }
            &.disable {
                cursor: default;
                .icon {
                    color: #ccd5db !important;
                }
            }
            &:hover,
            &.active {
                .icon {
                    color: #1593ff;
                }
            }
            > .panel {
                position: absolute;
                right: 48px;
                top: 0;
                z-index: 1000002; // 层级需要比hint的箭头高
                perspective: 500px;
            }
        }
    }
}
</style>
