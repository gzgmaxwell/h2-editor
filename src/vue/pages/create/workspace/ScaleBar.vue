<template>
    <div
        class="eqc-scale-bar"
        @mousedown.stop
    >
        <div class="info">
            <input
                v-if="!showSceneLabel"
                v-model.number="width"
                :readonly="(isBatch || puzzleMode) ? 'readonly' : false"
                type="number"
                class="size"
                @blur="customSize"
                @keypress.enter="customSize"
            >
            <i
                v-if="!showSceneLabel"
                class="link eqf-no"
            />
            <input
                v-if="!showSceneLabel"
                v-model.number="height"
                :readonly="(isBatch || puzzleMode) ? 'readonly' : false"
                type="number"
                class="size"
                @blur="customSize"
                @keypress.enter="customSize"
            >
            <span
                v-if="!showSceneLabel"
                class="unit"
            >{{ sceneJson.unit === 'mm' ? '毫米' : '像素' }}</span>
            <span
                v-if="!showSceneLabel"
                class="divider"
            >|</span>
            <div
                v-if="!showSceneLabel && !puzzleMode"
                :class="{active: showCategories}"
                class="scene-cut"
            >
                <span
                    data-hint="点击后拖动画布右侧和底部滑块裁切画布"
                    class="hint--top hint--rounded"
                    @click="changeSize"
                >裁切画布</span>
            </div>
            <span
                v-if="showSceneLabel"
                class="unit"
            >{{ sceneLabel }}</span>
        </div>
        <div class="scene-name">
            {{ puzzleMode ? '拼图': name }}
        </div>
        <div class="scale">
            <span
                :data-hint="isMac ? '缩小 ⌘-' : '缩小 Ctrl -'"
                class="hint--top hint--rounded"
            >
                <span
                    class="icon eqf-zoom-in plus"
                    @click="setScale('-')"
                />

            </span>
            <span class="icon num">{{ scale }}</span>
            <span
                :data-hint="isMac ? '放大 ⌘+' : '放大 Ctrl +'"
                class="hint--top hint--rounded"
            >
                <span
                    class="icon eqf-zoom-out plus"
                    @click="setScale('+')"
                />
            </span>
            <span
                data-hint="适合画布"
                class="hint--top hint--rounded"
            >
                <span
                    class="icon eqf-bigger fit"
                    @click="setScale('fit')"
                />

            </span>
            <span
                data-hint="真实尺寸"
                class="hint--top hint--rounded"
            >
                <span
                    class="icon real border"
                    @click="setScale('1')"
                >1:1 </span>
            </span>
        </div>
    </div>
</template>

<script>
import util from '../../../../utils/util'
import HeadCreate from '../head/HeadCreate.vue'
import elementType from '../../../../config/enum.element.type'
import statistic from '../../../../config/statistic'
import EnumSceneType from '../../../../config/enum.scene.type'

export default {
    data() {
        return {
            scale: '',
            showList: false,
            width: 0,
            height: 0,
            categories: [],
            showCategories: false,
            currentPageIndex: 0, // 当前场景页的index
            showSceneLabel: false, // 只有gif场景下才展示
            sceneLabel: ''
        }
    },
    computed: {
        scene() {
            return this.$store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        isMac() {
            return util.isMac
        },
        eqxScene() {
            return this.scene.eqxScene
        },
        sceneJson() {
            return this.eqxScene.sceneJson
        },
        productType() {
            return this.$store.state.product.productType
        },
        name() {
            return this.productType[this.sceneJson.type]
        },
        userInfo() {
            return this.$store.state.user.userInfo
        },
        pageJson() {
            return this.eqxPage.pageJson
        },
        elements() {
            return this.pageJson.elements
        },
        filterCategories() {
            return this.categories.filter(item => item.type !== this.sceneJson.type && !EnumSceneType.geyAllowGifSceneType().includes(item.type))
        },
        isBatch() {
            return util.getIsBatchCreate()
        },
        layout() {
            return this.$store.state.layout
        },
        editorSize() {
            return this.layout.editorSize
        },
        puzzleMode() {
            return this.scene.puzzleMode
        }
    },
    watch: {
        'eqxPage.scale': {
            handler() {
                this.scale = parseInt(this.eqxPage.scale * 100) + '%'
            },
            // 避免首次eqxPage改变时，watch还未执行的问题
            immediate: true
        },
        'sceneJson.width'(newVal) {
            this.width = Vue.filter('px2mm')(newVal, this.sceneJson.unit)
        },
        'sceneJson.height'(newVal) {
            this.height = Vue.filter('px2mm')(newVal, this.sceneJson.unit)
        }
    },
    created() {
        const { width, height, unit } = this.sceneJson
        this.width = Vue.filter('px2mm')(width, unit)
        this.height = Vue.filter('px2mm')(height, unit)

        this.api.banner.getSceneBanners()
            .then(res => {
                // 将所有的分类取出来
                const list = [].concat(...res.data.list.slice(1).map(item => item.list))
                list.forEach(item => {
                    this.categories.push({
                        type: item.type,
                        name: `${item.name}: ${item.width}*${item.height} ${item.unit === 'mm' ? '毫米' : '像素'}`,
                        width: item.width,
                        height: item.height,
                        bleed: item.bleed,
                        unit: item.unit || 'px'
                    })
                })
            })
            .catch(err => err && this.logger.error(err))
    },
    mounted() {
        if (EnumSceneType.isAllowAddGifToScene(this.sceneJson.type)) {
            this.showSceneLabel = true
            this.sceneLabel = this.productType[this.sceneJson.type] + `（${this.width} x ${this.height} 像素）`
            this.user.allow('gifUploadUsing') && this.showGifCanUploadToast()
        }
    },
    methods: {
        setScale(type) {
            const $elWorkspace = this.$parent.$el
            const $stretchBar = $elWorkspace.querySelector('.eqc-stretch-bar')
            const workspaceWidth = $elWorkspace.offsetWidth
            const workspaceHeight = $elWorkspace.offsetHeight
            this.eqxPage.setScale(type, workspaceWidth, workspaceHeight)
            const { width, height } = this.eqxPage
            if (width <= workspaceWidth && height <= workspaceHeight) {
                $stretchBar && $stretchBar.css({
                    marginLeft: '0px',
                    marginTop: '0px'
                })
            }
        },
        //  批量生成
        openMessProduction() {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.BC,
                statistic.opt_label.BC.in])

            if (this.userInfo.id) {
                const hasText = this.elements.some(function (ele) {
                    return [elementType.text, elementType.image, elementType.qrcode].includes(ele.type)
                })
                if (hasText) {
                    const sceneJSON = this.eqxScene.sceneJson
                    const eleObj = {}
                    eleObj.eleArr = []
                    eleObj.otherEle = []
                    eleObj.pageJson = JSON.parse(JSON.stringify(this.pageJson))
                    const copyObj = {
                        width: sceneJSON.width,
                        height: sceneJSON.height,
                        unit: sceneJSON.unit,
                        type: sceneJSON.type
                    }
                    eleObj.pageJson = Object.assign(eleObj.pageJson, copyObj)
                    eleObj.value = 10
                    this.elements.forEach(ele => {
                        if ([elementType.text, elementType.image, elementType.qrcode].includes(ele.type)) {
                            eleObj.eleArr.push(ele)
                        } else {
                            eleObj.otherEle.push(ele)
                        }
                    })
                    const options = {
                        component: HeadCreate,
                        data: eleObj
                    }
                    this.slide.open(options)
                        .then((res) => {
                            if (res.go) {
                                this.exitGo()
                            }
                        })
                        .catch((err) => {
                            err && this.logger.error(err)
                        })
                } else {
                    this.notifier.warn('画布中没有可更改项')
                }
            } else {
                this.notifier.info('批量生成功能需登录后才能使用')
                this.showList = false
            }
        },
        exitGo() {
            if (this.userInfo.id) {
                // 工作台
                const path = `${Vue.env.host.auth}/eip/scene?type=h2`
                window.open(path, '_blank')
            } else {
                // 游客模式
                const routeData = this.$router.resolve({ path: '/visit' })
                window.open(routeData.href, '_blank')
            }
        },
        customSize() {
            if (this.isBatch) {
                return
            }
            const { width, height, unit } = this.eqxScene.sceneJson
            let newWidth = this.width
            let newHeight = this.height
            const maxSize = 5000
            const reg = /^[1-9]\d*$/
            if (!(reg.test(this.width) && reg.test(this.height))) {
                this.notifier.warn('请输入有效的尺寸信息')
                return
            }
            // 如果是毫米时，统一转换为像素处理
            if (unit === 'mm') {
                newWidth = Vue.filter('mm2px')(newWidth)
                newHeight = Vue.filter('mm2px')(newHeight)
            }
            // 未修改时不做处理
            if (newWidth === width && newHeight === height) {
                return
            }
            if (newWidth > maxSize || newHeight > maxSize) {
                this.notifier.warn('宽高最大值为' + maxSize)
                return
            }
            const info = {
                type: 0,
                width: this.width,
                height: this.height,
                unit,
                auto: true
            }
            this.changeCategory(info)
            Vue.store.commit('SCENE_SIZE_CHANGE', this.width + '|' + this.height)
        },
        showGifCanUploadToast() {
            Vue.arrowNotifier.open({
                title: '秀客可以在这里上传本地的gif素材，用于制作gif模板。',
                subTitle: '一个作品中只能存在一个gif素材哦！',
                iconType: 'warn',
                arrowDirection: 'left',
                // arrowDistance: '22px',
                width: '378px',
                height: '128px',
                left: '85px',
                type: 'can-upload-msg-gif',
                top: '380px'
            })
        },
        updatePages(pPageIndex = 0) {
            const promist = new Promise((resolve, reject) => {
                const page = this.eqxScene.eqxPages[pPageIndex]
                if (page) {
                    this.loading.open('正在智能调整中，请稍后...')
                    const $elWorkspace = this.eqxPage.$el.parentElement
                    Vue.store.commit('PAGE_CHANGE', { eqxPage: page })
                    setTimeout(() => {
                        page.setScale('changeCategoryFit', $elWorkspace.offsetWidth, $elWorkspace.offsetHeight)
                        Vue.store.dispatch('PAGE_SAVE', { eqxPage: page, needCover: true })
                        this.loading.close()
                        resolve()
                    }, 500)
                } else {
                    // 执行完了  跳会之前选中的那页
                    const currentPage = this.eqxScene.eqxPages[this.currentPageIndex]
                    // 切换和保存同步进行，虽然保存失败的话会有风险，但体验会好一些
                    Vue.store.commit('ELEMENT_SELECT', { eqxElements: [] })
                    this.$store.commit('PAGE_CHANGE', { eqxPage: currentPage })
                }
            })
            promist.then((res) => {
                this.updatePages(pPageIndex + 1)
            })
        },
        changeCategory({ type, width, height, bleed, unit, auto = false }) {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.SC])
            if (EnumSceneType.isAllowAddGifToScene(type)) {
                // 该提示目前只出现在gif分类且只提示秀客和超级账号 目前配置为手机海报 测试和上线时配置为gif场景
                this.user.allow('gifUploadUsing') && this.showGifCanUploadToast()
                // gif 场景下 隐藏画布的裁切
                this.$store.commit('LAYOUT_EDITOR_SIZE', { show: false })
                this.showSceneLabel = true
                this.sceneLabel = `Gif场景（${width} x ${height} 像素）`
            }

            // 如果是毫米时，统一转换为像素处理
            if (unit === 'mm') {
                width = Vue.filter('mm2px')(width)
                height = Vue.filter('mm2px')(height)
            }
            this.showCategories = false
            const sceneJson = this.sceneJson
            const info = {
                id: sceneJson.id,
                type,
                width,
                height,
                bleed,
                unit
            }
            this.api.scene.updateScene(info)
                .then(res => {
                    if (auto) {
                        sceneJson.oldWidth = sceneJson.width
                        sceneJson.oldHeight = sceneJson.height
                    }
                    sceneJson.type = type
                    sceneJson.width = width
                    sceneJson.height = height
                    sceneJson.bleed = bleed
                    sceneJson.unit = unit
                    this.currentPageIndex = this.eqxScene.eqxPages.indexOf(this.eqxPage)
                    this.updatePages()
                })
                .catch(err => err && this.logger.error(err))
        },
        changeSize() {
            this.$store.commit('LAYOUT_EDITOR_SIZE', { show: !this.editorSize.show })
            if (this.editorSize.show) {
                const $elWorkspace = this.eqxPage.$el.parentElement
                this.eqxPage.setScale('fit', $elWorkspace.offsetWidth, $elWorkspace.offsetHeight)
                this.notifier.info('拖动右侧和底部滑块裁切画布')
            }
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.PC])
        }
    }

}
</script>

<style lang="scss">
.eqc-scale-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    left: 0;
    height: 48px;
    bottom: 0;
    width: 100%;
    font-size: 12px;
    color: #fff;
    background: #fff;
    border-top: 1px solid rgba(204, 213, 219, 1);
    .info {
        font-size: 13px;
        color: #4f5d69;
        position: relative;
        display: flex;
        align-items: center;
        padding-left: 24px;
        z-index: 2;
        .divider {
            color: #ccd5db;
        }
        .size {
            width: 36px;
            height: 20px;
            color: #fff;
            background: rgba(37, 43, 63, 1);
            border-radius: 3px;
            text-align: center;
            font-size: 12px;
        }
        .link {
            font-size: 14px;
            margin: 0 6px;
        }
        .unit {
            margin: 0 12px 0 6px;
            color: #666666;
        }
        .scene-cut {
            position: relative;
            margin-left: 12px;
            display: flex;
            align-items: center;
            transition: all 0.3s;
            cursor: pointer;
            font-size: 13px;
            font-weight: 400;
            color: rgba(37, 43, 63, 1);
            .icon {
                margin-left: 4px;
                font-size: 22px;
                transition: all 0.3s;
            }
            &.active {
                color: rgb(79, 93, 105);
                .icon {
                    transform: rotate(180deg);
                }
            }
        }
    }
    .batch {
        color: #2f3c4d;
        font-size: 13px;
        cursor: pointer;
        &:hover {
            color: #1593ff;
        }
    }
    .icon {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        width: 28px;
        height: 28px;
        font-size: 16px;
        transition: all 0.3s;
        background: #fff;
        color: rgba(37, 43, 63, 1);
        cursor: pointer;

        &.real {
            width: 24px;
            height: 20px;
            justify-content: center;
            font-size: 12px;
            border-radius: 2px;
            background: rgba(37, 43, 63, 1);
            color: #fff;
            margin: 0 8px;
            &:hover {
                background: #1593ff;
                color: #fff;
            }
        }
        &.fit {
            width: 28px;
            margin: 0 1px;
            background: #fff;
            color: rgba(37, 43, 63, 1);
        }
        &.num {
            width: 40px;
            font-size: 12px;
            cursor: default;
            width: 40px;
            height: 20px;
            background: rgba(37, 43, 63, 1);
            border-radius: 2px;
            color: #fff;
            &:hover {
                color: #fff;
            }
        }
        &.back {
            background: #fff;
        }
        &.plus {
            width: 18px;
            margin: 0 10px;
            justify-content: flex-start;
        }
        &.border {
            &::after {
                position: absolute;
                right: -1px;
                top: 0;
                width: 1px;
                height: 100%;
                background: rgba(255, 255, 255, 0.3);
                content: "";
            }
        }
        &:hover {
            color: #1593ff;
        }
    }
    .scale {
        display: flex;
        align-items: center;
        margin-right: 14px;
        z-index: 2;
    }
    .scene-name {
        position: absolute;
        width: 100%;
        height: 48px;
        text-align: center;
        font-size: 13px;
        font-weight: 400;
        color: rgba(37, 43, 63, 1);
        line-height: 48px;
        z-index: 1;
        cursor: default;
    }
}
</style>
