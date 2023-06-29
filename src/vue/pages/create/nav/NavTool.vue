<template>
    <div
        ref="toolSetting"
        v-scroll-bar
        class="eqc-tool"
    >
        <div class="tool-head">
            <p class="title">
                工具箱
            </p>
            <a
                class="tech-btn"
                href="http://yqxiuairdesign.eqxiuzhan.com/gongjuxiang.html"
                target="_blank"
            >帮助</a>
        </div>
        <ul class="list">
            <li
                v-for="item in toolList"
                :key="item.type"
            >
                <div
                    v-if="item.type !== 'baseimage' || (item.type === 'baseimage' && showBaseImageEditor)"
                    class="head"
                    @click="selectToolClick(item)"
                >
                    <div class="headBox">
                        <div class="left">
                            <div
                                v-if="item.imgPath"
                                :style="{
                                    borderRadius:'2px',
                                    width:'68px',
                                    height:'68px',
                                    backgroundColor:item.backgroundColor,
                                    backgroundImage:`url(${item.imgPath})`,
                                    backgroundRepeat:'no-repeat',
                                    backgroundSize: `${item.imgWidth}`,
                                    backgroundPosition: `center`
                                }"
                            />
                        </div>
                        <div class="right">
                            <div class="title">
                                {{ item.name }}
                                <span
                                    v-if="item.degree"
                                    class="new-notifier"
                                >{{ item.degree }}</span>
                            </div>
                            <span class="desc">{{ item.label }}</span>
                        </div>
                    </div>
                    <div
                        v-if="item.type === 'qrcode' && openQrcodePanel"
                        class="arrowBox"
                    >
                        <div class="line" />
                        <span />
                    </div>
                </div>
                <div
                    v-if="item.type === 'qrcode'"
                    :style="{height: openQrcodePanel ? '530px':0}"
                    class="content"
                >
                    <qrcode v-if="item.type === 'qrcode'" />
                </div>
            </li>
        </ul>
        <a
            class="feedback"
            href="//h5.ebdan.net/ls/dsH9oydE"
            target="_blank"
        >没有想要的工具？</a>
    </div>
</template>

<script>
import toolList from './tool/toolList'
import qrcode from './tool/qrcode.vue'
import statistic from '../../../../config/statistic'
import uploadDrag from '../../../pages/create/index/uploadDrag'
import websocket from '../../../pages/create/index/websocket'

import IndexQrcode from '../../../pages/artqrcode/IndexQrcode.vue'
import artQrcodeMode from '../../../../config/enum.artQrcodeMode.type'

import IndexMatting from '../../../pages/aimatting/IndexMatting.vue'
import AIMattingMode from '../../../../config/enum.aiMattingMode.type'

import PhotoMode from '../../../../config/enum.photoMode.type'
import PhotoIndex from '../../../../photo/vue/pages/photo/Index.vue'
import elementType from '../../../../config/enum.element.type'

import IndexTcloud from '../../../pages/tcloud/IndexTcloud.vue'
import tcloudMode from '../../../../config/enum.tcloudMode.type'

import SidePuzzle from '../../../pages/puzzle/SidePuzzle.vue'
import puzzleMode from '../../../../config/enum.puzzleMode.type'

export default {
    components: {
        qrcode
    },
    data: function () {
        return {
            toolList,
            type: '',
            openQrcodePanel: false
        }
    },
    computed: {
        expressMode() {
            return this.$store.state.scene.expressMode
        },
        showBaseImageEditor() {
            // return this.user.allow('baseImageEditor')
            return true
        },
        eqxPage() {
            return this.$store.state.scene.eqxPage
        },
        scale() {
            return this.eqxPage.scale
        }
    },
    created() {
        // 弹窗编辑器不开放艺术二维
        if (this.expressMode) {
            toolList.splice(0, 1)
        }
    },
    methods: {
        // 绘制拼图组件到画布
        addPuzzleElement(ele) {
            const { css, property } = ele
            const result = this.eqxPage.getElementPosOfCenter(800, 800, this.scale)
            const left = result.left
            const top = result.top
            const elementJson = {
                type: elementType.puzzle,
                property: Object.assign({}, property),
                css: Object.assign({}, css, {
                    left: left + 'px',
                    top: top + 'px',
                    width: '800px',
                    height: '800px'
                })
            }
            this.eqxPage.addElement(elementJson)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        setMainEditorView(show) {
            websocket.unbind()
            uploadDrag.unbind()
            Vue.store.commit('MAIN_EDITOR_VIEW', { show })
        },
        selectToolClick(item) {
            this.type = item.type

            if (this.type === 'qrcode') {
                this.openQrcodePanel = !this.openQrcodePanel
            } else if (this.type === 'wordCloud') {
                this.setMainEditorView(false)
                const options = {
                    component: IndexTcloud,
                    data: {
                        mode: tcloudMode.tool,
                        zIndex: 104
                    }
                }
                this.slide.open(options)
                    .then((res) => {
                        this.setMainEditorView(true)
                    })
                    .catch((err) => {
                        err && this.logger.error(err)
                        this.setMainEditorView(true)
                    })
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.WC,
                    statistic.opt_label.WC.open])
            } else if (this.type === 'logo') {
                Vue.logo.open()
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.LG,
                    statistic.opt_label.LG.open])
            } else if (this.type === 'artQrcode') {
                this.setMainEditorView(false)
                const options = {
                    component: IndexQrcode,
                    data: {
                        mode: artQrcodeMode.tool,
                        zIndex: 104
                    }
                }
                this.slide.open(options)
                    .then((res) => {
                        this.setMainEditorView(true)
                    })
                    .catch((err) => {
                        err && this.logger.error(err)
                        this.setMainEditorView(true)
                    })
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.ARTQRCODE,
                    statistic.opt_label.ARTQRCODE.open])
            } else if (this.type === 'baseimage') {
                this.setMainEditorView(false)
                const options = {
                    component: PhotoIndex,
                    data: {
                        mode: PhotoMode.tool,
                        zIndex: 104
                    }
                }
                this.slide.open(options)
                    .then((res) => {
                        this.setMainEditorView(true)
                    })
                    .catch((err) => {
                        err && this.logger.error(err)
                        this.setMainEditorView(true)
                    })
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.PHOTO,
                    statistic.opt_label.PHOTO.clickTool])
            } else if (this.type === 'matting') {
                this.setMainEditorView(false)
                Vue.store.commit('AIMATTING_MATTING_IMAGE', '')
                const options = {
                    component: IndexMatting,
                    data: {
                        mode: AIMattingMode.tool,
                        zIndex: 104
                    }
                }
                this.slide.open(options)
                    .then((res) => {
                        this.setMainEditorView(true)
                    })
                    .catch((err) => {
                        err && this.logger.error(err)
                        this.setMainEditorView(true)
                    })
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.AIMATTING,
                    statistic.opt_label.AIMATTING.clickTool])
            } else if (this.type === 'table') {
                const result = this.eqxPage.getElementPosOfCenter(540, 200, this.scale)
                const left = result.left
                const top = result.top
                const elementJson = {
                    type: elementType.table,
                    property: {
                        rows: 5,
                        columns: 5,
                        tableData: []
                    },
                    css: {
                        left: left + 'px',
                        top: top + 'px',
                        width: '540px',
                        height: '200px'
                    }
                }
                this.eqxPage.addElement(elementJson)
                this.eqxPage.eqxHistory.add(this.eqxPage)
            } else if (this.type === 'puzzle') {
                this.setMainEditorView(false)
                const options = {
                    component: SidePuzzle,
                    data: {
                        mode: puzzleMode.tool
                    }
                }
                this.slide.open(options)
                    .then((res) => {
                        this.setMainEditorView(true)
                        if (res && res.type === 'insert') {
                            this.addPuzzleElement(res.data)
                        }
                    })
                    .catch((err) => {
                        err && this.logger.error(err)
                        this.setMainEditorView(true)
                    })
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.PUZZLE,
                    statistic.opt_label.PUZZLE.clickTool])
            }

            setTimeout(() => this.$refs.toolSetting && this.$refs.toolSetting.myScroll.refresh(), 300)
        }
    }
}
</script>

<style lang="scss">
.eqc-tool {
    position: relative;
    height: 100%;
    background: white;
    .tool-head {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-between;
        align-items: center;
        height: 60px;
        margin: 0 16px;
        .title {
            font-size: 14px;
            font-weight: 600;
            color: rgba(17, 17, 17, 1);
        }
        .tech-btn {
            cursor: pointer;
            color: #252b3f;
            font-size: 13px;
            margin-top: -2px;
            &:hover {
                color: #1593ff;
            }
        }
    }
    .list > li:first-child .headBox {
        padding-top: 0;
    }
    .head {
        &:hover {
            background: #f7f8f9;
            cursor: pointer;
        }
        .headBox {
            padding: 12px 16px;
            display: flex;
            .left {
                height: 68px;
                width: 68px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 16px;
                i {
                    color: #1593ff;
                }
            }
            .right {
                flex: 1;
                display: flex;
                flex-direction: column;
                position: relative;
                .title {
                    line-height: 21px;
                    margin-top: 3px;
                    margin-bottom: 5px;
                    display: flex;
                    font-size: 14px;
                    font-weight: 450;
                    color: rgba(51, 51, 51, 1);
                }
                .desc {
                    font-size: 12px;
                    line-height: 17px;
                    font-weight: 300;
                    color: #777;
                }
                .new-notifier {
                    position: relative;
                    top: -9px;
                    left: 2px;
                    font-weight: normal;
                    font-size: 12px;
                    color: #ff296a;
                }
                .eqc-red-point {
                    position: relative;
                    top: -3px;
                    left: 2px;
                }
            }
        }
        .arrowBox {
            height: 8px;
            overflow: hidden;
            .line {
                position: relative;
                top: auto;
                bottom: -7px;
                width: 100%;
                height: 1px;
                background: #eceef0;
            }
            span {
                display: inline-block;
                left: 50%;
                top: auto;
                bottom: 0;
                width: 13px;
                height: 13px;
                transform: rotateZ(45deg);
                position: relative;
                top: 3px;
                background: #eceef0;
            }
        }
    }
    .content {
        overflow: hidden;
        transition: all 0.3s ease-in-out;
        background-color: #f7f8f9;
        position: relative;
    }
    .feedback {
        width: 100%;
        height: 48px;
        border-top: 1px solid #ccd5db;
        position: absolute;
        bottom: 0;
        left: 0;
        text-align: center;
        line-height: 48px;
        &:hover {
            color: #1593ff;
        }
    }
}
</style>
