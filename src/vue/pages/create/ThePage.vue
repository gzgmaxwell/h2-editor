<template>
    <div class="eqc-page">
        <div
            id="page_content"
            ref="wrap"
            v-scroll-bar
            class="wrap"
        >
            <ul
                class="list"
            >
                <li
                    v-for="(item, index) of list"
                    :key="item.pageJson.id"
                    v-drag-page-item="{container: '#page_content', eqxPage: item, eqxPages: list, onMouseUp, code}"
                    :class="['item', {active: item.pageJson.id === eqxPage.pageJson.id}]"
                    @click="changePage(item)"
                >
                    <div
                        :style="{backgroundImage: getBackgroundImage(item.pageJson)}"
                        class="cover"
                    >
                        <div
                            v-if="userType === 4"
                            :style="{background: `url(${getWaterMarkImage()}) no-repeat center/contain`}"
                            style="width: 100%;height: 100%;"
                        />
                        <ul
                            v-if="(expressMode !== expressType.image)&&!isBatch"
                            class="menu"
                        >
                            <li
                                v-show="list.length > 1"
                                class="icon delete hint--left hint--rounded"
                                data-hint="删除"
                                @click.stop="deletePage(item)"
                            >
                                <i class="eqf-delete-l" />
                            </li>
                            <li
                                class="icon copy hint--left hint--rounded"
                                data-hint="复制"
                                @click.stop="copyPage(item)"
                            >
                                <i class="eqf-copy-l" />
                            </li>
                        </ul>
                    </div>
                    <div class="num">
                        {{ index + 1 }}
                    </div>
                </li>
                <li
                    v-if="showBottomBtn"
                    class="pad"
                >
                    <div class="menu" />
                </li>
            </ul>
            <div
                v-if="(expressMode !== expressType.image)&&!isBatch"
                :class="{'bottom-btn':showBottomBtn}"
                class="btn-area"
                @click="addPage"
            >
                <i
                    :class="{'eqf-plus':!isSaving,'eqf-loadingroll':isSaving, 'save-loading':isSaving}"
                    class="icon"
                />
                <span>新增一页</span>
            </div>
        </div>
    </div>
</template>

<script>
import EqxPage from '../../../core/html/page'
import dragPageItem from './page/dragPageItem'
import util from '../../../utils/util'
import expressType from '../../../config/enum.express.type'
import waterMarker from '../../../utils/watermarker'
import eqxiuMaskImg from '../../../img/wm/eqxiumask.svg'

export default {
    directives: {
        dragPageItem
    },
    data() {
        return {
            isMoved: false,
            expressType,
            showBottomBtn: false,
            currentPage: '',
            isSaving: false,
            copyFlag: false,
            addFlag: false,
            pageSortData: [], // 防止连续点击
            eqxiuLogoImage: null
        }
    },
    computed: {
        scene() {
            return this.$store.state.scene
        },
        eqxScene() {
            return this.scene.eqxScene
        },
        code() {
            return this.eqxScene.sceneJson.code
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        list() {
            return this.eqxScene.eqxPages
        },
        pageListLength() {
            return this.list.length
        },
        isBatch() {
            return util.getIsBatchCreate()
        },
        expressMode() {
            return this.$store.state.scene.expressMode
        },
        userType() {
            return this.$store.state.user.userInfo.type
        }
    },
    watch: {
        pageListLength(newVal, oldVal) {
            if (newVal * 184 + 60 > document.body.clientHeight - 50) {
                this.showBottomBtn = true
            } else {
                this.showBottomBtn = false
            }
            if (newVal > oldVal && !this.copyFlag && this.addFlag) {
                // 新增了一页 如果是copy新增的  不执行以下代码
                this.updatePageSort()
            }
            if (this.copyFlag) {
                this.copyFlag = !this.copyFlag
            }
            if (this.addFlag) {
                this.addFlag = !this.addFlag
            }
        }
    },
    created() {
        this.getEqxiuLogoImage().then(() => {})
    },
    mounted() {
        if (this.list.length * 184 + 60 > document.body.clientHeight - 10) {
            this.showBottomBtn = true
        }
    },
    methods: {
        getEqxiuLogoImage() {
            return new Promise((resolve, reject) => {
                const img = new Image()
                img.crossOrigin = 'anonymous'
                img.src = eqxiuMaskImg
                img.onload = () => {
                    this.eqxiuLogoImage = img
                    resolve()
                }
            })
        },
        updatePageSort() {
            // 把插入在最后的那个page插入到 this.currentPageId 后面
            const index = this.list.indexOf(this.currentPage)
            // 把最后一个元素插入到index后面 ，然后删除最后一个元素
            // Vue.store.commit('PAGE_ORDER_CHANGED', { oldIndex: this.list.length - 1, newIndex: index + 1 })
            const newPage = this.list[this.pageListLength - 1]
            this.list.splice(index + 1, 0, newPage)
            this.list.splice(this.pageListLength - 1, 1)
            const { printId, id } = this.eqxPage.pageJson
            this.pageSortData.push({
                printId,
                id,
                index: index + 2 // 服务器排序是从1开始的
            })
        },
        reSortPage() {
            // 排序
            this.list.map((item, i) => {
                item.pageJson.sort = i + 1
            })
            setTimeout(() => {
                if (this.pageSortData.length > 0) {
                    const data = this.pageSortData.shift()
                    const idcode = `${data.printId}_${this.eqxScene.sceneJson.code}`
                    Vue.api.page.updatePageSort(idcode, data.id, data.index).then(() => {
                        this.isSaving = false
                    }).catch(err => {
                        this.isSaving = false
                        // 服务器报错，还原本地顺序
                        // Vue.store.commit('PAGE_ORDER_CHANGED', { oldIndex: data.index + 1, newIndex: this.list.length })
                        err && Vue.logger.error(err)
                    })
                }
            }, 1000)
        },
        onMouseUp(isMoved) {
            this.isMoved = isMoved
        },
        getWaterMarkImage() {
            return waterMarker.logoMark(this.eqxiuLogoImage, this.eqxPage.sceneWidth, this.eqxPage.sceneHeight)
        },
        getBackgroundImage(pageJson) {
            const src = Vue.filter('qiniuZoom')(pageJson.cover, 136)
            return Vue.filter('backgroundImage')(src)
        },
        addPage() {
            // 如果当前页有修改，则先保存再新增
            // 新增页的方式是前端新建空白页，再将新页保存
            this.addFlag = true
            if (!this.isSaving) {
                this.isSaving = true
                this.currentPage = Vue.store.state.scene.eqxPage
                const eqxPage = new EqxPage(null, this.eqxScene)
                const promise = this.eqxPage.isModified
                    ? this.$store.dispatch('PAGE_SAVE', { eqxPage: this.eqxPage, needCover: true })
                    : Promise.resolve()

                promise
                    .then(() => this.$store.dispatch('PAGE_SAVE', { eqxPage, needCover: true }))
                    .then(() => {
                    // this.updatePageSort()
                        this.reSortPage()
                        this.notifier.success('添加成功')
                    })
                    .catch(err => err && this.logger.error(err))

                // 处理数据需放在api的后面
                // 添加和保存同步进行，虽然保存失败的话会有风险，但体验会好一些  新增的页面插到当前页面之后
                this.$store.commit('PAGE_ADD', { eqxPage })

                // dom更新后滚动到底部
                setTimeout(() => {
                    const myScroll = this.$refs.wrap.myScroll
                    myScroll.scrollToBottom()
                }, 100)
            }
        },
        deletePage(eqxPage) {
            this.dialog.openConfirm({ msg: '确定要删除吗？' })
                .then(() => this.api.page.deletePage(eqxPage.pageJson.id, this.eqxScene.sceneJson.id))
                .then(() => {
                    this.$store.commit('PAGE_DELETE', { eqxPage })
                    this.notifier.success('删除成功')
                })
                .catch(err => err && this.logger.error(err))
        },
        copyPage(eqxPage) {
            // 如果被复制的页有修改，则先保存再复制
            // 复制页的方式是前端新建页，再将被复制页复制到新页上，再将新页保存
            this.copyFlag = true
            const newPageJson = JSON.parse(JSON.stringify(eqxPage.pageJson))
            newPageJson.id = EqxPage.newPageId(this.eqxScene.sceneJson.pages)
            this.eqxScene.sceneJson.pages.map((v, i) => {
                if (v.sort > newPageJson.sort) {
                    v.sort = v.sort + 1
                }
            })
            newPageJson.sort = newPageJson.sort + 1

            const eqxPageNew = new EqxPage(newPageJson, this.eqxScene)
            const promise = eqxPage.isModified
                ? this.$store.dispatch('PAGE_SAVE', { eqxPage, needCover: true, isCopy: true })
                    .then(pageJson => { eqxPageNew.pageJson.cover = pageJson.cover }) // 复制时只生成一次图片就够了
                : Promise.resolve()

            promise
                .then(() => this.$store.dispatch('PAGE_SAVE', { eqxPage: eqxPageNew, isCopy: true }))
                .then(() => this.notifier.success('复制成功'))
                .catch(err => err && this.logger.error(err))

            // 处理数据需放在api的后面
            // 复制和保存同步进行，虽然保存失败的话会有风险，但体验会好一些
            this.$store.commit('PAGE_COPY', { eqxPage, eqxPageNew })
        },
        changePage(eqxPage) {
            if (this.isMoved) { // 当在拖拽时因为会触发click，判断不要选中
                return
            }

            this.eqxPage.isModified && this.$store.dispatch('PAGE_SAVE', { eqxPage: this.eqxPage, needCover: true })
                .catch(err => err && this.logger.error(err))
                // 处理数据需放在api的后面
                // 切换和保存同步进行，虽然保存失败的话会有风险，但体验会好一些
            Vue.store.commit('ELEMENT_SELECT', { eqxElements: [] })
            this.$store.commit('PAGE_CHANGE', { eqxPage })
        }
    }
}
</script>

<style lang="scss">
.eqc-page {
    position: relative; // 需要挡住sidebar右侧的阴影
    width: 184px;
    height: 100%;
    #page_content {
        background: white;
    }
    .wrap {
        position: relative;
        height: 100%;
        .list {
            .pad {
                height: 56px;
            }
            .item {
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                width: 184px;
                height: 184px;
                border-bottom: 1px solid #ccd5db;
                border-top: 1px solid #ccd5db;
                cursor: pointer;
                transition: background-color 0.3s;
                background-color: #f7f8f9;
                margin-top: -1px;
                &:hover {
                    background: #eceef0;
                    .cover .menu {
                        display: block;
                    }
                }
                &.active {
                    background: #eceef0;
                    .num {
                        color: #2f3c4d;
                    }
                }
                &:first-child {
                    margin-top: 0;
                }
                .cover {
                    position: relative;
                    width: 136px;
                    height: 136px;
                    background: no-repeat center/contain;
                    .menu {
                        display: none;
                        position: absolute;
                        right: 0;
                        top: 0;
                        .icon {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 24px;
                            height: 24px;
                            color: #fff;
                            background: #2f3c4d;
                            border-radius: 3px;
                            transition: all 0.3s;
                            &:not(:last-child) {
                                margin-bottom: 6px;
                            }
                            &:hover {
                                background: #1593ff;
                                &.delete {
                                    background: #ff296a;
                                }
                            }
                        }
                    }
                }
                .num {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 24px;
                    height: 24px;
                    font-size: 12px;
                    line-height: 24px;
                    text-align: center;
                    color: #a3afb7;
                }
            }
        }
        .btn-area {
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 1px solid #ccd5db;
            font-size: 13px;
            cursor: pointer;
            &:hover {
                color: #1593ff;
            }
            .save-loading {
                animation: rotate-infinite 3s linear infinite;
            }
            i {
                font-size: 16px;
                margin-bottom: -2px;
            }
            span {
                margin-left: 3px;
            }
        }
        .bottom-btn {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 184px;
            box-shadow: 0px -1px 3px 0px rgba(0, 0, 0, 0.08);
            background: white;
        }
    }
    .add {
        position: absolute;
        right: 24px;
        bottom: 24px;
        &:hover {
            .btn {
                color: #fff;
                background: #198ae7;
            }
        }
        .btn {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: #fff;
            background: #1593ff;
            border-radius: 50%;
            box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
            transition: all 0.3s;
            cursor: pointer;
        }
    }
}
</style>
