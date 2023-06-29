<template>
    <div class="eqc-head-batch-create">
        <input
            id="importFile"
            type="file"
            style="display: none"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            @change="importFileClick(this)"
        >
        <a
            id="downlink"
            style="display: none"
        />
        <div
            class="batch-export"
        >
            <head-batch-export
                v-if="exportPage"
                :back="back"
                :datarr="exportData"
                :continueaddtext="categoryConfig.continueAddText"
                :multifieldarray="multiFieldArray"
            />
        </div>
        <div class="batch-template">
            <div class="template-preview">
                <the-editor2
                    v-if="getBatchCreateEditorCount()===1"
                    ref="editor2"
                />
                <the-editor3
                    v-if="getBatchCreateEditorCount()===2"
                    ref="editor2"
                />
                <div class="editor-mask" />
            </div>
            <div
                class="template-btn-edit"
                @click="editTemplate"
            >
                编辑模板
            </div>
        </div>
        <div
            class="batch-template-head"
        >
            <div class="title">
                {{ categoryConfig&&categoryConfig.title||'批量制作' }}
            </div>
            <i
                title="回到我的作品"
                class="close eqf-no"
                @click="exit"
            />
        </div>
        <div
            class="batch-template-setting"
        >
            <div
                class="step first"
            >
                <div
                    class="head"
                >
                    <span class="circle" />
                    {{ categoryConfig&&categoryConfig.stepOneText||'第一步：选择模板' }}
                </div>
                <div
                    class="content swiper-container swiper-no-swiping1"
                >
                    <div class="swiper-wrapper">
                        <div
                            v-for="(templateItem,index) in templateList"
                            :key="templateItem.id"
                            :class="'swiper-slide swiper-slide-'+templateItem.id"
                            :style="[itemCss, {backgroundImage: getSwiperItemBackGround(templateItem, itemCss.size)}]"
                            :data-index="index"
                        />
                    </div>
                    <div class="swiper-button swiper-button-next">
                        <i class="icon eqf-right" />
                    </div>
                    <div class="swiper-button swiper-button-prev">
                        <i class="icon eqf-left" />
                    </div>
                </div>
            </div>
            <div
                v-if="dataInitSuccess"
                class="step second"
            >
                <div
                    class="head"
                >
                    <span class="circle" />
                    {{ categoryConfig&&categoryConfig.stepTwoText }}
                </div>
                <div
                    class="content"
                >
                    <div
                        v-show="singleFieldRowCount <= 0"
                        class="blank"
                    >
                        暂无可填信息
                    </div>
                    <template
                        v-if="dataInitSuccess"
                        v-show="singleFieldRowCount > 0"
                    >
                        <div
                            v-for="rowIndex in singleFieldRowCount"
                            :key="'row-'+rowIndex"
                            class="row"
                        >
                            <!-- 文本输入 -->
                            <template
                                v-for="columnIndex in [0,1,2]"
                            >
                                <!-- 标题和输入框 -->
                                <div
                                    :key="'col-'+columnIndex"
                                    class="block"
                                >
                                    <!-- 文本控件 - 标题 -->
                                    <div
                                        v-if="getCellInfoByIndex(rowIndex-1,columnIndex).type==='text'"
                                        class="field-name"
                                    >
                                        <label class="field-name-require">
                                            {{ getCellInfoByIndex(rowIndex-1,columnIndex).require?'* ':'' }}
                                        </label>
                                        <label
                                            v-html="(getCellInfoByIndex(rowIndex-1,columnIndex).require?'&nbsp;&nbsp;&nbsp;':'')+getCellInfoByIndex(rowIndex-1,columnIndex).txt"
                                        />
                                    </div>
                                    <!-- 文本控件 - 输入框 -->
                                    <div
                                        v-if="getCellInfoByIndex(rowIndex-1,columnIndex).type==='text'"
                                        class="field-input"
                                    >
                                        <base-input2
                                            :id="getCellInfoByIndex(rowIndex-1,columnIndex).id"
                                            :require="getCellInfoByIndex(rowIndex-1,columnIndex).require"
                                            :max-length="getCellInfoByIndex(rowIndex-1,columnIndex).maxLength"
                                            @change="fieldChange"
                                        />
                                    </div>
                                    <!-- 图片控件 -->
                                    <div
                                        v-if="getCellInfoByIndex(rowIndex-1,columnIndex).type==='image'"
                                        class="field-image"
                                    >
                                        <template
                                            v-for="(imageInfo,index) in getCellImageInfo(rowIndex-1,columnIndex)"
                                        >
                                            <div
                                                :key="'image-'+index"
                                                class="image-item"
                                            >
                                                <div
                                                    v-if="imageInfo.value===null||imageInfo.value===''"
                                                    title="点击选择文件"
                                                    class="image-preview"
                                                    @click="imageFieldClick(imageInfo)"
                                                >
                                                    <i class="icon eqf-plus" />
                                                    {{ imageInfo.txt }}
                                                </div>
                                                <div
                                                    v-if="imageInfo.value!==null&&imageInfo.value!==''"
                                                    :style="{background: getImageFieldBackgroundImage(imageInfo.value) + 'no-repeat center/contain'}"
                                                    class="image-preview"
                                                >
                                                    <div
                                                        :title="imageInfo.txt"
                                                        class="image-replace"
                                                    >
                                                        <button
                                                            @click="imageFieldClick(imageInfo)"
                                                        >
                                                            替换
                                                        </button>
                                                    </div>
                                                    <i
                                                        class="close eqf-no"
                                                        @click="imageFieldClear(imageInfo)"
                                                    />
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                                <!-- 分隔块 -->
                                <div
                                    v-if="columnIndex < 2"
                                    :key="columnIndex"
                                    class="block split"
                                />
                            </template>
                        </div>
                    </template>
                </div>
            </div>
            <div
                v-if="dataInitSuccess"
                class="step third"
            >
                <div
                    class="head"
                >
                    <span class="circle" />
                    <label>{{ categoryConfig&&categoryConfig.stepThirdText }}</label>
                    <span
                        v-show="stepThirdVisible"
                        data-hint="也可以复制Excel中的列粘贴到下方表格中"
                        class="upload-excel hint--top hint--rounded"
                        @click="uploadExcel()"
                    >
                        上传Excel
                    </span>
                    <label
                        v-show="stepThirdVisible"
                        class="download-excel"
                        @click="downLoadExcelTemplate()"
                    >
                        下载Excel模板
                    </label>
                    <label
                        v-if="!buyMemberAuth&&!isXiuKe"
                        v-show="stepThirdVisible"
                        class="tips"
                    >
                        单次生成个数上限已为您升级到30个
                    </label>
                    <label
                        v-if="buyMemberAuth||isXiuKe"
                        v-show="stepThirdVisible"
                        class="tips"
                    >
                        单次生成最多支持10个{{ isXiuKe ? '' : ',' }}
                    </label>
                    <label
                        v-if="buyMemberAuth&&!isXiuKe"
                        v-show="stepThirdVisible"
                        class="upgrade"
                        @click="upgradeMember()"
                    >
                        升级到单次30个>>
                    </label>
                </div>
                <div
                    class="content"
                >
                    <div
                        v-show="!stepThirdVisible"
                        class="blank"
                    >
                        没有批量字段，请重新选择模板
                    </div>
                    <div
                        v-show="stepThirdVisible"
                        class="table"
                    >
                        <div
                            ref="hotT"
                            class="hot-table"
                        />
                        <div class="more-tools">
                            <ul>
                                <li @click="tableCellMoreToolsClick(0)">
                                    替换
                                </li>
                                <li @click="tableCellMoreToolsClick(1)">
                                    应用到整列
                                </li>
                                <li @click="tableCellMoreToolsClick(2)">
                                    删除
                                </li>
                            </ul>
                        </div>
                        <div class="dbclick-upload">
                            双击上传
                        </div>
                    </div>
                    <div
                        v-show="stepThirdVisible"
                        class="tools"
                    >
                        <div
                            class="tool addRow"
                            @click="showAddRowPanel"
                        >
                            <i class="icon eqf-plus" />
                            添加行
                        </div>
                        <div
                            v-show="addRowPanelVisible"
                            class="tool-addRow"
                        >
                            <div class="input-rowCount">
                                <input
                                    v-model="addRowCount"
                                    placeholder="填写添加个数"
                                    type="number"
                                    oninput="if(value.length>2)value=value.slice(0,2)"
                                >
                            </div>
                            <div class="input-buttom">
                                <div
                                    class="buttom btn-cancle"
                                    @click="showAddRowPanel"
                                >
                                    取消
                                </div>
                                <div
                                    class="buttom btn-sure"
                                    @click="addRowClick"
                                >
                                    确定
                                </div>
                            </div>
                        </div>
                        <div
                            class="tool clearAll"
                            @click="clearAll"
                        >
                            清空
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div
            :class="getBatchButtonClass"
            @click="batchButtonClick"
        >
            批量生成
        </div>
    </div>
</template>

<script>

import { elementType } from '../../../../config/enum'
import TheEditor2 from '../TheEditor2.vue'
import TheEditor3 from '../TheEditor3.vue'
import { uploadQiniu } from '../../../../utils/qiniuUpload'
import delayLoad from '../../../../utils/delayLoad'
import batchCreateTemplate from '../../../../config/batchCreateTemplate.js'
import loader from '../../../../utils/loader'
import PageHistoryType from '../../../../config/enum.pageHistory.type'
import HeadBatchExport from './HeadBatchExport.vue'
import util from '../../../../utils/util'
import autoCreatePage from '../../../plugins/autoCreatePage'
import EqxPage from '../../../../core/html/page'
import statistic from '../../../../config/statistic'
import user from '../../../../api/user'
// 默认获取的模板数量
const DEFAULT_TEMPLATE_LENGTH = 100
// 最大行数
const MAX_ADD_ROW_LENGTH = 30
// 最大行数 非会员
const MAX_ADD_ROW_LENGTH_NOT_MEMBER = 10
// 默认行数
const DEFALUT_ROW_LENGTH = 0
// 行头宽度
const ROW_HEADER_WIDTH = 45
// 行高
const ROW_HEIGHTS = 36
// 表头高度
const COLUMN_HEADER_HEIGHT = 36
// 工具栏列宽
const TOOL_COLUMN_WIDTH = 137

export default {
    components: {
        TheEditor2,
        TheEditor3,
        HeadBatchExport
    },
    props: {
        isSys: {
            type: Boolean,
            default: true
        },
        hide: {
            type: Function,
            default: null
        },
        close: {
            type: Function,
            default: null
        }
    },
    data() {
        return {
            // 模板id
            templateCategoryId: null,
            // 分类配置信息
            categoryConfig: null,
            // 单字段数组
            singleFieldArray: null,
            // 单字段显示需要的行
            singleFieldRowCount: 0,
            // 多字段数组
            multiFieldArray: null,
            // 数据初始化成功
            dataInitSuccess: false,
            // 第一步模板list
            templateList: [],
            // 第一步模板每一项样式
            itemCss: null,
            // 表格设置
            settings: {
                data: null,
                width: '100%',
                height: 110,
                stretchH: 'none', // 自适应列宽，默认值none，last 将最后一列拉伸到最大，all 将所有列均匀拉伸
                fillHandle: true, // 允许拖拽复制
                className: 'hot',
                autoRowSize: true,
                startRows: DEFALUT_ROW_LENGTH,
                maxRows: MAX_ADD_ROW_LENGTH,
                rowHeaders: true,
                rowHeights: ROW_HEIGHTS,
                rowHeaderWidth: ROW_HEADER_WIDTH,
                columns: null,
                colWidths: this.getColWidths,
                colHeaders: this.getColHeaders,
                columnHeaderHeight: COLUMN_HEADER_HEIGHT
            },
            // 当前行
            currentRow: 0,
            // 当前列
            currentCol: 0,
            // 当前表格key
            currentKey: '',
            // 表格textArea
            textAreaControl: null,
            // 表格textArea对应的元素的mark名称
            textAreaComponentName: null,
            // 表格的列
            tableColumns: [],
            // 添加行面板
            addRowPanelVisible: false,
            // 添加行数量
            addRowCount: '',
            // 上传配置
            uploadOptions: {
                files: [],
                onFilesAdded: this.onFilesAdded,
                onUploadProgress: this.onUploadProgress,
                onError: this.onError,
                onFileUploaded: this.onFileUploaded
            },
            // 当前上传图片的字段id
            curUploadImageField: null,
            // 第三步导入文件
            importFile: null,
            // 第三步导出文件
            exportFile: null,
            // 导出控件
            exportPage: false,
            // 导出数据
            exportData: null,
            // 是否是购买了
            isMember: false
        }
    },
    computed: {
        scene() {
            return Vue.store.state.scene
        },
        eqxScene() {
            return this.scene.eqxScene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        eqxScene2() {
            return this.scene.eqxScene2
        },
        eqxPage2() {
            return this.scene.eqxPage2
        },
        eqxScene3() {
            return this.scene.eqxScene3
        },
        eqxPage3() {
            return this.scene.eqxPage3
        },
        getBatchButtonClass() {
            return this.multiFieldArray && this.getColumns().length > 0 ? 'batch-template-batch-create enable' : 'batch-template-batch-create unable'
        },
        eqxSceneEditCompleteEvent() {
            return this.scene.eqxSceneEditCompleteEvent
        },
        stepThirdVisible() {
            return this.tableColumns && this.tableColumns.length > 0
        },
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        buyMemberAuth() {
            return !this.isMember
        },
        // 7,8,9 Vip
        vipMemberAuth() {
            return this.userInfo && ([7, 8, 9].includes(this.userInfo.memberType) || (this.userInfo.members && this.userInfo.members.some(item => [7, 8, 9].includes(item.memberId))))
        },
        // 是否是秀客
        isXiuKe() {
            return [4].includes(this.userInfo.type)
        }
    },
    watch: {
        eqxPage2(newVal, oldVal) {

        },
        eqxSceneEditCompleteEvent(newVal, oldVal) {
            this.renderPage()
            this.initData()
        },
        singleFieldArray(newVal, oldVal) {
            newVal.forEach(item => {
                if (item.enable && item.fillType === 'single') {
                    if (item.value && item.value !== null) {
                        const baseInput2Control = document.querySelector('#baseinput2_' + item.id)
                        if (baseInput2Control && baseInput2Control !== null) {
                            let result = item.value.replace(/(<br>)/g, '')
                            result = result.replace(/(&nbsp;)/g, ' ')
                            baseInput2Control.value = result
                            // 这里用于触发控件的input事件，让其v-modle的值改变
                            baseInput2Control.dispatchEvent(new Event('input'))
                        }
                    }
                }
            })
        }
    },
    created() {
        if (this.vipMemberAuth) {
            this.isMember = true
        } else {
            user.getUserBenefits(Vue.env.benefits.batchCreate).then(res => {
                if (res && res.data && res.data.list && res.data.list.length > 0) {
                    const surplusAmount = res.data.list[0].surplusAmount
                    if (surplusAmount === MAX_ADD_ROW_LENGTH) {
                        this.isMember = true
                    }
                }
            })
        }
    },
    mounted() {
        // 移除所有提示框
        Vue.arrowNotifier.close()
        this.initTemplateIdBySceneType()
        this.loadCss()
    },
    methods: {
        getBatchCreateEditorCount() {
            return util.getBatchProductTemplateRelation().editorCount
        },
        // 根据场景类型获取对应的模板id
        initTemplateIdBySceneType() {
            this.templateCategoryId = util.getBatchProductTemplateRelation().templateId
        },
        exit() {
            window.location.href = `${Vue.env.host.auth}/eip/scene?type=h2`
        },
        renderPage() {
            this.$refs.editor2.renderPage()
        },
        editTemplate() {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.BATCH,
                statistic.opt_label.BATCH.editTemplate])
            Vue.store.commit('SCENE2_EDIT_COMPLETE_EVENT', { eqxScene2EditCompleteEvent: new Date().getTime() })
            this.$refs.editor2.setFieldArray(this.singleFieldArray, this.multiFieldArray, this.getExportDataArr())
            this.hide()
        },
        loadCss() {
            this.loading.open('正在加载')
            const loadHandsontablecss = delayLoad.delayLoadCSS(Vue.env.plugin.handsontablecss)
            const loadHandsontablejs = delayLoad.delayLoadJS(Vue.env.plugin.handsontablejs)
            const loadSwipercss = delayLoad.delayLoadCSS(Vue.env.plugin.swipercss)
            const loadSwiperjs = delayLoad.delayLoadJS(Vue.env.plugin.swiperjs)
            const loadXlsx = delayLoad.delayLoadJS(Vue.env.plugin.xlsx)
            Promise.all([loadHandsontablecss, loadHandsontablejs, loadSwipercss, loadSwiperjs, loadXlsx]).then(() => {
                // 获取第一步模板列表
                Vue.api.product.getNewProducts({ categoryId: this.templateCategoryId, pageSize: DEFAULT_TEMPLATE_LENGTH, pageNo: 1 }).then(res => {
                    this.loading.close()
                    if (res.data.success && res.data.list && res.data.list.length > 0) {
                        // 设置模板项样式
                        this.setItemCss(this.eqxScene2.sceneJson)
                        // 初始化模板列表
                        this.templateList = res.data.list
                        // 默认点击第一个模板并加载
                        this.templateClick(this.templateList[0], 0)
                        const _self = this
                        // 刷新并加载效果
                        this.$nextTick(function () {
                            // eslint-disable-next-line
                            const swiper = new Swiper('.swiper-container', {
                                slidesPerView: 10,
                                spaceBetween: 8,
                                slidesPerGroup: 10,
                                loop: this.templateList.length > 10,
                                loopFillGroupWithBlank: this.templateList.length <= 10,
                                grabCursor: true,
                                freeMode: true,
                                navigation: {
                                    nextEl: '.swiper-button-next',
                                    prevEl: '.swiper-button-prev'
                                },
                                on: {
                                    click: function (event) {
                                        if (this.clickedSlide && this.clickedSlide !== null) {
                                            // 获取模板所在索引
                                            const clickTemplateItemIndex = this.clickedSlide.attr('data-index')
                                            // 将值传给theEditor2
                                            _self.$refs.editor2.setFieldArray(_self.singleFieldArray, _self.multiFieldArray, _self.getExportDataArr())
                                            // 模板点击事件
                                            _self.templateClick(_self.templateList[clickTemplateItemIndex], 1)
                                        }
                                    }
                                }
                            })
                        })
                    } else {
                        this.notifier.fail('模板数据获取失败，请稍后重试')
                    }
                })
            })
        },
        // 初始化数据
        init() {
            this.initData()
            this.$nextTick(function () {
                // 实例化表格
                // 设置表格最大行数
                this.settings.maxRows = (!this.buyMemberAuth && !this.isXiuKe) ? MAX_ADD_ROW_LENGTH : MAX_ADD_ROW_LENGTH_NOT_MEMBER
                this.hot = new Handsontable(this.$refs.hotT, this.settings)
                // 表格单元格点击事件
                this.hot.addHook('afterOnCellMouseDown', this.afterOnCellMouseDown)
                this.hot.addHook('afterCreateRow', this.afterCreateRow)
                this.hot.addHook('afterOnCellMouseOver', this.afterOnCellMouseOver)
                this.hot.addHook('afterOnCellMouseOut', this.afterOnCellMouseOut)
                this.hot.addHook('beforeChange', this.beforeChange)
                this.hot.addHook('afterDocumentKeyDown', this.afterDocumentKeyDown)
                // 新增默认行
                const tableDefaultRowCount = this.getTableDefaultRowCount()
                this.addRow(0, tableDefaultRowCount)
                // 修改标题栏颜色
                const TITLE_BG_COLOR = '#F6F9FA'
                if (this.settings.columns.length > 0) {
                    document.querySelector('div.ht_clone_top_left_corner.handsontable > div > div > div > table > thead > tr > th').style.background = TITLE_BG_COLOR
                    for (let i = 0; i < this.settings.columns.length; i++) {
                        document.querySelector(`div.ht_clone_top.handsontable > div > div > div > table > thead > tr > th:nth-child(${2 + i})`).style.background = TITLE_BG_COLOR
                    }
                }
            })
            this.importFile = document.getElementById('importFile')
            this.exportFile = document.getElementById('downlink')
        },
        // 设置模板项样式
        setItemCss(sceneJson) {
            const defaultSize = {
                itemWidthOfOneCol: 256,
                itemWidthOfTwoCol: 124
            }
            const ratio = sceneJson.width / sceneJson.height
            let newWidth = 0
            let newHeight = 0
            if (ratio > 8 / 5) {
                newWidth = defaultSize.itemWidthOfOneCol
                this.isTwoCol = false
            } else {
                newWidth = defaultSize.itemWidthOfTwoCol
                this.isTwoCol = true
            }
            newHeight = newWidth / ratio
            this.itemCss = {
                width: newWidth + 'px',
                height: newHeight + 'px',
                size: Math.max(newWidth, newHeight)
            }
        },
        // 初始化数据
        initData() {
            this.dataInitSuccess = false
            // 初始化当前模板分类配置信息
            const result = batchCreateTemplate.templateCategoryArray.filter(item => {
                return item.categoryId.includes(this.templateCategoryId)
            })
            this.categoryConfig = result.length === 0 ? null : result[0]
            if (this.categoryConfig === null) {
                return
            }
            // 初始化单字段数组
            this.singleFieldArray = this.categoryConfig.tags.filter(item => {
                let result = false
                if (item.fillType === 'single' && item.enable) {
                    // 过滤掉模板不存在的字段 所有page都要进行判断 只有存在一个就不过滤
                    // 遍历page寻找元素
                    const eqxPages = Vue.store.state.scene.eqxScene.eqxPages
                    for (let i = 0; i < eqxPages.length; i++) {
                        const page = eqxPages[i]
                        const element = page.pageJson.elements.filter(elementItem => {
                            return elementItem.property.markLabel === item.name
                        })
                        result = element && element.length === 1
                        if (result) {
                            break
                        }
                    }
                }
                return result
            })
            // 计算单字段所需行
            this.singleFieldRowCount = this.getSingleFieldRowCount()
            // 单字段赋默认值
            this.initSingleFieldDefaultValue()
            // 初始化多字段数组
            this.multiFieldArray = this.categoryConfig.tags.filter(item => {
                let result = false
                if (item.fillType === 'multi' && item.enable) {
                    // 过滤掉模板不存在的字段 所有page都要进行判断 只有存在一个就不过滤
                    // 遍历page寻找元素
                    const eqxPages = Vue.store.state.scene.eqxScene.eqxPages
                    for (let i = 0; i < eqxPages.length; i++) {
                        const page = eqxPages[i]
                        const element = page.pageJson.elements.filter(elementItem => {
                            return elementItem.property.markLabel === item.name
                        })
                        result = element && element.length === 1
                        if (result) {
                            break
                        }
                    }
                }
                return result
            })
            this.tableColumns = this.getColumns()
            this.settings.columns = this.tableColumns
            // 更新列
            if (this.hot) {
                this.hot.updateSettings({
                    columns: this.tableColumns
                })
            }
            this.dataInitSuccess = true
        },
        // 获取第二步需要的行数
        getSingleFieldRowCount() {
            const textFieldArrayLength = this.getSingleFieldArrayByType('text').length
            const imageFieldArrayLength = this.getSingleFieldArrayByType('image').length
            const imageBlockCount = parseInt(imageFieldArrayLength / 3) + (imageFieldArrayLength % 3 > 0 ? 1 : 0)
            const rowCount = parseInt((textFieldArrayLength + imageBlockCount) / 3) + ((textFieldArrayLength + imageBlockCount) % 3 > 0 ? 1 : 0)
            return rowCount
        },
        // 根据字段类型获取单字段数组
        getSingleFieldArrayByType(pType) {
            const fieldArray = this.singleFieldArray.filter(item => {
                return item.type === pType
            })
            return fieldArray
        },
        // 初始化单字段默认值
        initSingleFieldDefaultValue() {
            // 将模板当中的文字设置为文本的默认值，用于在清空输入后显示
            this.eqxPage.eqxElements.forEach(eqxElement => {
                const markLabel = eqxElement.elementJson.property.markLabel
                for (let i = 0; i < this.singleFieldArray.length; i++) {
                    const field = this.singleFieldArray[i]
                    if (field.name === markLabel && eqxElement.elementJson.type === elementType.text && field.defaultValue === null) {
                        field.defaultValue = eqxElement.$text.innerHTML
                        break
                    } else if (field.name === markLabel && eqxElement.elementJson.type === elementType.image && field.defaultValue === null) {
                        field.defaultValue = eqxElement.elementJson.property.src
                        break
                    }
                }
            })
        },
        // -----------------------第一步-----------------------
        // 模板点击事件
        templateClick(pItem, pClickIndex) {
            Vue.store.commit('PRODUCT_ID', { productId: pItem.id, needUpdate: true, sourceUser: pItem.sourceUser })
            this.replaceAllTemplmate(pItem, pClickIndex)
        },
        // 替换全部模板
        replaceAllTemplmate(pItem, pClickIndex) {
            this.loading.open('正在应用模板')
            const promiseArray = []
            let promise = Promise.resolve(JSON.parse(JSON.stringify(pItem)))
            if (this.isSys) {
                const covers = pItem.productTypeMap.cover ? JSON.parse(pItem.productTypeMap.cover) : []
                covers.forEach(coverItem => {
                    const pageId = Object.keys(coverItem)[0]
                    // 1016 未购买
                    // 1018 游客，需要登录才能访问
                    const idcode = `${pItem.sourceId}_${pItem.code}`
                    promise = this.api.page.getPage(pageId, idcode, pItem.id)
                        .then(res => {
                            const code = res.data.code
                            if (code === 1016) {
                                return this.buy(pItem)
                            } else if (code === 1018) {
                                this.notifier.info('付费模板需登录并购买后才能使用')
                                return Promise.reject()
                            } else {
                                return res
                            }
                        })
                        .then(res => res.data.obj)
                    promiseArray.push(promise)
                })
            }
            Promise.all(promiseArray)
                .then((res) => {
                    const promiseArray = []
                    // 删除非第一页
                    this.eqxScene.sceneJson.pages.forEach((item, index) => {
                        if (index !== 0) {
                            const promise = this.api.page.deletePage(item.id, this.eqxScene.sceneJson.id)
                            promiseArray.push(promise)
                        }
                    })
                    Promise.all(promiseArray).then((result) => {
                        this.eqxScene.eqxPages.forEach((eqxPage, index) => {
                            if (index !== 0) {
                                // TODO... 这里得优化改为异步操作,取消下面的setTimeout
                                Vue.store.commit('PAGE_DELETE', { eqxPage: this.eqxScene.eqxPages[index] })
                            }
                        })
                        setTimeout(() => {
                            // 第一页加载完成才能加载第二页
                            const firstPagePromise = new Promise((resolve, reject) => {
                                // 第一页采取替换的方式
                                this.handlePage(res[0]).then(() => {
                                    const { elements, properties } = res[0]
                                    this.eqxPage.renderPage({ elements, properties })
                                    this.eqxPage.eqxHistory.add(this.eqxPage, { type: PageHistoryType.replaceTemplate })
                                    Vue.store.commit('ELEMENT_SELECT', { eqxElements: [] })
                                    Vue.store.dispatch('PAGE_SAVE', { eqxPage: this.eqxPage, needCover: true }).then(res2 => {
                                        if (res.length > 1) {
                                            resolve(res[1])
                                        } else {
                                            pClickIndex === 0 ? this.init() : this.initData()
                                            this.renderPage()
                                            this.loading.close()
                                        }
                                    })
                                })
                            })
                            firstPagePromise.then(res3 => {
                            // 非第一页采取新增的方式
                                this.handlePage(res3).then(() => {
                                    const newPageJson = JSON.parse(JSON.stringify(res3))
                                    newPageJson.id = EqxPage.newPageId(this.eqxScene.sceneJson.pages)
                                    newPageJson.sort = EqxPage.newPageSort(this.eqxScene.sceneJson.pages)
                                    newPageJson.printId = this.eqxScene.eqxPages[0].pageJson.printId
                                    const eqxPage = new EqxPage(newPageJson, this.eqxScene)
                                    eqxPage.eqxHistory.add(eqxPage, { type: PageHistoryType.replaceTemplate })
                                    Vue.store.commit('PAGE_ADD', { eqxPage })
                                    Vue.store.commit('PAGE_CHANGE', { eqxPage: this.eqxScene.eqxPages[0] })
                                    Vue.store.dispatch('PAGE_SAVE', { eqxPage, needCover: false }).then(res2 => {
                                        pClickIndex === 0 ? this.init() : this.initData()
                                        this.renderPage()
                                        this.loading.close()
                                    })
                                })
                            })
                        }, 300)
                    })
                })
        },
        handlePage(pPage) {
            if (this.singleFieldArray && this.singleFieldArray !== null && this.singleFieldArray.length > 0) {
                return new Promise((resolve, reject) => {
                    let handleImageCount = 0
                    pPage.elements.forEach(item => {
                        const markLabel = item.property.markLabel
                        if (markLabel && markLabel !== null && markLabel !== '') {
                        // 设置默认值
                            for (let i = 0; i < this.singleFieldArray.length; i++) {
                                const field = this.singleFieldArray[i]
                                if (field.name === markLabel && item.type === elementType.text) {
                                    field.defaultValue = item.property.content
                                    break
                                } else if (field.name === markLabel && item.type === elementType.image) {
                                    field.defaultValue = item.property.src
                                    break
                                }
                            }
                            // 将单字段的值同步到新的模板里面
                            const elementField = this.singleFieldArray.filter(item2 => {
                                return item2.name === markLabel
                            })
                            if (elementField && elementField !== null && elementField.length === 1) {
                                if (item.type === elementType.text && elementField[0].value !== null) {
                                    item.property.content = elementField[0].value
                                } else if (item.type === elementType.image && elementField[0].value !== null) {
                                    handleImageCount++
                                    const imgSrc = elementField[0].value
                                    loader.image(imgSrc)
                                        .then(source => {
                                        // 源logo尺寸
                                            const originWidth = parseInt(item.css.width)
                                            const originHeight = parseInt(item.css.height)
                                            // 源logo位置
                                            const originLeft = parseInt(item.css.left)
                                            const originTop = parseInt(item.css.top)
                                            // 源logo中心坐标
                                            const originX = originLeft + originWidth / 2
                                            const originY = originTop + originHeight / 2
                                            // 画布屏幕坐标
                                            const sceneCenterX = this.eqxPage2.eqxScene.sceneJson.width / 2
                                            const sceneCenterY = this.eqxPage2.eqxScene.sceneJson.height / 2
                                            // 计算源logo中心坐标在第几象限
                                            const quadrant = autoCreatePage.calcQuadrant(originX, sceneCenterX, originY, sceneCenterY)
                                            // 新的logo尺寸
                                            const logoWidth = source.width
                                            const logoHeight = source.height
                                            // 源尺寸宽高比
                                            const originRatio = originWidth / originHeight
                                            // 新尺寸宽高比
                                            const logoRatio = logoWidth / logoHeight
                                            autoCreatePage.calcImageStyle(originRatio, logoRatio, originWidth, logoWidth, item, logoHeight, originHeight, imgSrc, quadrant)
                                            handleImageCount--
                                            if (handleImageCount === 0) {
                                                resolve()
                                            }
                                        })
                                }
                            }
                        }
                    })
                    if (handleImageCount === 0) {
                        resolve()
                    }
                })
            } else {
                return Promise.resolve()
            }
        },
        // 图片控件点击
        imageFieldClick(pImageField) {
            if (this.curUploadImageField !== null) {
                this.notifier.warn(`请等待 ${pImageField.txt} 的图片上传完成`)
                return
            }
            this.createInput(pImageField).click()
        },
        // 图片控件移除图片点击
        imageFieldClear(pImageField) {
            pImageField.value = null
            // 设置默认的图片
            this.setComponent(pImageField.name, pImageField.defaultValue)
        },
        // 创建文件选择框并监听事件
        createInput(pImageField) {
            const $input = document.createElement('input')
            $input.addEventListener('change', () => {
                this.uploadOptions.files = Array.from($input.files)
                if (this.uploadOptions.files[0].size / 1024 >= pImageField.maxSize) {
                    this.notifier.fail(`请上传小于${parseInt(pImageField.maxSize / 1024)}M的图片`)
                    return
                }
                if (this.uploadOptions.files[0].type === 'image/gif') {
                    this.notifier.fail('暂不支持gif格式图片')
                    return
                }
                this.curUploadImageField = pImageField
                this.uploadFile(this.uploadOptions)
            })
            $input.attr({
                type: 'file',
                accept: 'image/png, image/jpeg'
            })
            return $input
        },
        // 上传文件到七牛云
        uploadFile(options) {
            const promise1 = Vue.api.file.getUploadToken()
            const promise2 = delayLoad.delayLoadJS(Vue.env.plugin.qiniu2)
            Promise.all([promise1, promise2])
                .then(([token]) => {
                    options.token = token
                    uploadQiniu(options)
                })
                .catch(err => {
                    err && Vue.logger.error(err)
                })
        },
        onFilesAdded() {
        },
        onError() {
            this.curUploadImageField = null
        },
        onFileUploaded(res, isEnd) {
            if (isEnd) {
                if (this.curUploadImageField.fillType === 'single') {
                    for (let i = 0; i < this.singleFieldArray.length; i++) {
                        const item = this.singleFieldArray[i]
                        if (item.id === this.curUploadImageField.id) {
                            item.value = res.key
                            this.curUploadImageField = null
                            this.setComponent(item.name, item.value)
                            break
                        }
                    }
                } else if (this.curUploadImageField.fillType === 'multi') {
                    for (let i = 0; i < this.multiFieldArray.length; i++) {
                        const item = this.multiFieldArray[i]
                        if (item.id === this.curUploadImageField.id) {
                            item.value = res.key
                            this.curUploadImageField = null
                            this.setComponent(item.name, item.value)
                            // 更新单元格图片信息
                            this.hot.setDataAtCell(this.currentRow, this.currentCol, item.value)
                            break
                        }
                    }
                }
            }
        },
        onUploadProgress() {
        },
        fieldChange(pFieldId, pValue) {
            this.singleFieldArray.forEach(item => {
                if (item.id === pFieldId) {
                    item.value = pValue
                    if (pValue !== null && pValue !== '') {
                        this.setComponent(item.name, pValue)
                    } else {
                        this.setComponent(item.name, item.defaultValue)
                    }
                }
            })
        },
        getSwiperItemBackGround(pTemplateItem, pSize) {
            const cover = pTemplateItem.productTypeMap.cover ? JSON.parse(pTemplateItem.productTypeMap.cover) : []
            const coverCount = cover.length
            if (coverCount === 1) {
                return this.getBackgroundImage(cover[0][Object.keys(cover[0])[0]], pSize)
            } else if (coverCount === 2) {
                const promiseArr = [Promise.resolve(pTemplateItem)]
                cover.forEach(item => {
                    promiseArr.push(new Promise((resolve, reject) => {
                        const img = new Image()
                        img.crossOrigin = 'Anonymous'
                        img.src = this.getBackgroundImageAbsoluteUrl(item[Object.keys(item)[0]], pSize)
                        img.onload = function () {
                            resolve(img)
                        }
                    }))
                })
                Promise.all(promiseArr).then(([templateItem, img1, img2]) => {
                    const canvas = document.createElement('canvas')
                    const ctx = canvas.getContext('2d')
                    canvas.width = Math.max(img1.width, img2.width)
                    canvas.height = img1.height + 4 + img2.height
                    ctx.drawImage(img1, 0, 0, img1.width, img1.height, 0, 0, img1.width, img1.height)
                    ctx.drawImage(img2, 0, 0, img2.width, img2.height, 0, img1.height + 4, img2.width, img2.height)
                    const url = canvas.toDataURL()
                    const swiperSlideArr = document.querySelectorAll(`.swiper-slide-${templateItem.id}`)
                    if (swiperSlideArr && swiperSlideArr != null && swiperSlideArr.length > 0) {
                        swiperSlideArr.forEach(item => {
                            item.style.backgroundImage = `url(${url})`
                        })
                    }
                })
                return ''
            }
        },
        // -----------------------第二步-----------------------
        // 第二步图片控件获取背景
        getImageFieldBackgroundImage(src) {
            return this.getBackgroundImage(src, 35)
        },
        // 第二步获取背景
        getBackgroundImage(src, size) {
            src = Vue.filter('qiniuZoom')(src, size)
            return Vue.filter('backgroundImage')(src)
        },
        // 获取背景图片的绝对路径
        getBackgroundImageAbsoluteUrl(src, size) {
            src = Vue.filter('qiniuZoom')(src, size)
            return Vue.filter('backgroundImageAbsoluteUrl')(src)
        },
        // 获取第二步每一个格子的名称
        getCellInfoByIndex(rowIndex, columnIndex) {
            const fieldIndex = rowIndex * 3 + columnIndex
            if (fieldIndex >= this.singleFieldArray.length) {
                return {
                    type: null
                }
            }
            const fieldInfo = this.singleFieldArray[fieldIndex]
            return fieldInfo
        },
        // 获取第二步每一个格子的图片控件数组
        getCellImageInfo(pRowIndex, pColumnIndex) {
            // 在这个格子之前有多少个格子
            const beforeCellCount = pRowIndex * 3 + pColumnIndex
            let imageFieldIndex = 0
            for (let i = 0; i < beforeCellCount; i++) {
                if (imageFieldIndex >= this.singleFieldArray.length) {
                    break
                }
                if (this.singleFieldArray[imageFieldIndex].type === 'text') {
                    // 文本单独占一格
                    imageFieldIndex += 1
                } else if (this.singleFieldArray[imageFieldIndex].type === 'image') {
                    // 三个图片组件占一格
                    imageFieldIndex += 3
                }
            }
            const imageFieldInfoArray = this.singleFieldArray.filter((item, index) => {
                return imageFieldIndex <= index && index <= imageFieldIndex + 2
            })
            return imageFieldInfoArray
        },
        // -----------------------第三步-----------------------
        // 获取表格初始行数
        getTableDefaultRowCount() {
            const tablePosition = document.querySelector('.table').getBoundingClientRect()
            const tableTop = tablePosition.y
            const bodyHeight = document.body.clientHeight
            const tableHeight = bodyHeight - tableTop - 12 - 24 - 44
            let result = 2
            for (let i = 2; i < 13; i++) {
                if ((i * 36 + 36 + 2) <= tableHeight) {
                    result = i
                } else {
                    break
                }
            }
            if (this.buyMemberAuth) {
                // 非会员
                result = result > MAX_ADD_ROW_LENGTH_NOT_MEMBER ? MAX_ADD_ROW_LENGTH_NOT_MEMBER : result
            } else {
                // 会员
                result = result > MAX_ADD_ROW_LENGTH ? MAX_ADD_ROW_LENGTH : result
            }
            return result
        },
        // 上传excel
        uploadExcel() {
            this.importFile.click()
        },
        // 下载excel模板
        downLoadExcelTemplate() {
            const data = [{}]
            this.getColumns().forEach((item, index) => {
                // 最后一列是工具栏跳过
                if (index !== this.getColumns().length - 1) {
                    const resultArr = this.multiFieldArray.filter(multiField => {
                        return multiField.name === item.data && multiField.type === 'text'
                    })
                    if (resultArr.length === 1) {
                        data[0][item.data] = item.data
                    }
                }
            })
            this.downloadExl(data, '批量创建模板')
        },
        // 导入excel
        importFileClick() {
            this.loading.open('正在导入数据')
            const obj = this.importFile
            if (!obj.files) {
                return
            }
            var f = obj.files[0]
            var reader = new FileReader()
            const $t = this
            reader.onload = function (e) {
                var data = e.target.result
                if ($t.rABS) {
                    $t.wb = window.XLSX.read(btoa(this.fixdata(data)), { // 手动转化
                        type: 'base64'
                    })
                } else {
                    $t.wb = window.XLSX.read(data, {
                        type: 'binary'
                    })
                }
                const json = window.XLSX.utils.sheet_to_json($t.wb.Sheets[$t.wb.SheetNames[0]])
                $t.analysisExcelData(json)
                obj.value = null
            }
            if (this.rABS) {
                reader.readAsArrayBuffer(f)
            } else {
                reader.readAsBinaryString(f)
            }
        },
        fixdata: function (data) { // 文件流转BinaryString
            var o = ''
            var l = 0
            var w = 10240
            for (; l < data.byteLength / w; ++l) {
                o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)))
            }
            o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)))
            return o
        },
        // 解析上传的excel数据
        analysisExcelData(pData) {
            if (pData.length <= 0) {
                this.notifier.fail('请导入正确信息')
                this.loading.close()
                return
            }
            let headerMatch = true
            let excelHeader = Object.keys(pData[0])
            this.getColumns().forEach((item, index) => {
                if (index !== this.getColumns().length - 1) {
                    if (Object.hasOwnProperty.call(item, 'editor') && item.data !== excelHeader[index]) {
                        headerMatch = false
                    }
                }
            })
            const resultArray = []
            if (headerMatch) {
                // 过滤掉无效的excel列头
                excelHeader = excelHeader.filter(item => {
                    const result = this.getColumns().filter(item2 => {
                        return item === item2.data
                    })
                    return result.length > 0
                })
                // 匹配
                pData.forEach((item, index) => {
                    const obj = {}
                    excelHeader.forEach(item2 => {
                        obj[item2] = item[item2] || ''
                    })
                    resultArray.push(obj)
                })
            } else {
                // 不匹配
                // 将key作为第一行
                let obj = {}
                this.getColumns().forEach((item, index) => {
                    if (index !== this.getColumns().length - 1) {
                        obj[item.data] = excelHeader[index] || ''
                    }
                })
                resultArray.push(obj)
                // 从第二行开始添加
                pData.forEach((item, index) => {
                    obj = {}
                    this.getColumns().forEach((item2, index2) => {
                        if (index2 !== this.getColumns().length - 1) {
                            obj[item2.data] = item[excelHeader[index2]] || ''
                        }
                    })
                    resultArray.push(obj)
                })
            }
            this.loadExcelData(resultArray)
        },
        // 表格载入数据
        loadExcelData(pData) {
            // 判断尾部是否有空白数据
            const curCountRows = this.hot.countRows()
            let blankIndex = -1
            // 是否寻找结束
            let findEnd = false
            for (let i = curCountRows - 1; i >= 0; i--) {
                if (findEnd) {
                    break
                }
                const rowData = this.hot.getDataAtRow(i)
                let allCellNull = true
                rowData.forEach((item, index) => {
                    if (index !== rowData.length - 1) {
                        if (item !== null && item !== '') {
                            findEnd = true
                            allCellNull = false
                        }
                    }
                })
                blankIndex = allCellNull ? i : blankIndex
            }
            let beginAddRowIndex
            if (blankIndex >= 0) {
                // 从空白行开始添加
                beginAddRowIndex = blankIndex
                // 存在空白行 将表格剩余的行填充完
                // 计算空白行的总行数=表格总行数-空白行所在行数
                const blankRowCount = curCountRows - blankIndex
                if (blankRowCount >= pData.length) {
                    // 空白行总行数 >= 需要导入的总行数
                } else {
                    // 空白行总行数 < 需要导入的总行数
                    // 增加不够的行数
                    const needAddRowCount = pData.length - blankRowCount
                    this.addRow(curCountRows, needAddRowCount)
                }
            } else {
                // 从最新一行开始添加
                beginAddRowIndex = curCountRows
                this.addRow(curCountRows, pData.length)
            }
            // 遍历需要新增的行数
            for (let i = beginAddRowIndex; i < beginAddRowIndex + pData.length; i++) {
                // 遍历列添加数据
                this.getColumns().forEach((item, index) => {
                    // 最后一列是工具栏跳过
                    if (index !== this.getColumns().length - 1) {
                        // 更新单元格数据
                        let cellValue = pData[i - beginAddRowIndex][item.data]
                        if (cellValue && cellValue != null) {
                            cellValue = cellValue.length > 20 ? cellValue.substring(0, 20) : cellValue
                            this.hot.setDataAtCell(i, index, cellValue)
                        }
                    }
                })
            }
            this.updateTableHeight()
            this.loading.close()
        },
        // 生成excel并下载
        downloadExl: function (json, downName, type) { // 导出到excel
            const keyMap = [] // 获取键
            for (const k in json[0]) {
                keyMap.push(k)
            }
            const tmpdata = [] // 用来保存转换好的json
            json.map((v, i) => keyMap.map((k, j) => Object.assign({}, {
                v: v[k],
                position: (j > 25 ? this.getCharCol(j) : String.fromCharCode(65 + j)) + (i + 1)
            }))).reduce((prev, next) => prev.concat(next)).forEach(function (v) {
                tmpdata[v.position] = {
                    v: v.v
                }
            })
            const outputPos = Object.keys(tmpdata) // 设置区域,比如表格从A1到D10
            const tmpWB = {
                SheetNames: ['mySheet'], // 保存的表标题
                Sheets: {
                    mySheet: Object.assign({},
                        tmpdata, // 内容
                        {
                            '!ref': outputPos[0] + ':' + outputPos[outputPos.length - 1] // 设置填充区域
                        })
                }
            }
            const tmpDown = new Blob([this.s2ab(window.XLSX.write(tmpWB,
                { bookType: (type === undefined ? 'xlsx' : type), bookSST: false, type: 'binary' } // 这里的数据是用来定义导出的格式类型
            ))], {
                type: ''
            }) // 创建二进制对象写入转换好的字节流
            var href = URL.createObjectURL(tmpDown) // 创建对象超链接
            this.exportFile.download = downName + '.xlsx' // 下载名称
            this.exportFile.href = href // 绑定a标签
            this.exportFile.click() // 模拟点击实现下载
            setTimeout(function () { // 延时释放
                URL.revokeObjectURL(tmpDown) // 用URL.revokeObjectURL()来释放这个object URL
            }, 100)
        },
        s2ab: function (s) { // 字符串转字符流
            var buf = new ArrayBuffer(s.length)
            var view = new Uint8Array(buf)
            for (var i = 0; i !== s.length; ++i) {
                view[i] = s.charCodeAt(i) & 0xFF
            }
            return buf
        },
        // 从配置文件获取列
        getColumns() {
            if (this.multiFieldArray === null) {
                return []
            }
            const columnsArray = []
            this.multiFieldArray.forEach(item => {
                if (item.type === 'image') {
                    columnsArray.push({
                        data: item.name,
                        editor: false,
                        readOnly: true,
                        renderer: this.imageRenderer
                    })
                } else if (item.type === 'text') {
                    columnsArray.push({
                        data: item.name,
                        type: item.type
                    })
                }
            })
            if (this.multiFieldArray.length > 0) {
                columnsArray.push({
                    data: 'tool',
                    type: 'text',
                    editor: false,
                    width: TOOL_COLUMN_WIDTH,
                    renderer: this.toolRenderer
                })
            }
            return columnsArray
        },
        // 获取列名
        getColHeaders(index) {
            return index >= this.multiFieldArray.length ? '' : this.multiFieldArray[index].txt
        },
        // 获取列宽
        getColWidths(index) {
            return (document.querySelector('.table').clientWidth - ROW_HEADER_WIDTH - TOOL_COLUMN_WIDTH) / this.multiFieldArray.length
        },
        // 清空
        clearAll() {
            // 清空文本数据
            this.hot.clear()
            // 清空图片
            if (!this.multiFieldArray || this.multiFieldArray === null || this.multiFieldArray.length === 0) {
                return
            }
            const imageFieldArr = this.multiFieldArray.filter(item => {
                return item.type === 'image' && item.fillType === 'multi' && item.enable
            })
            imageFieldArr.forEach(imageField => {
                let columnIndex
                for (let i = 0; i < this.hot.getColHeader().length; i++) {
                    if (this.hot.getColHeader()[i] === imageField.name) {
                        columnIndex = i
                    }
                }
                const columnData = this.hot.getDataAtProp(imageField.name)
                columnData.forEach((cellData, cellRowIndex) => {
                    if (cellData && cellData !== null) {
                        this.hot.setDataAtCell(cellRowIndex, columnIndex, null)
                    }
                })
            })
        },
        // 图片列渲染
        imageRenderer(hotInstance, td, row, col, prop, value, cellProperties) {
            if (this.settings.data !== null && this.settings.data.length > row) {
                value = this.settings.data[row][col]
            }
            const d = document.createElement('div')
            d.className = value === null ? 'none' : 'has'
            d.css({
                height: '33px',
                width: '100%',
                background: `${this.getbackgroundImage(value)} no-repeat center/contain`,
                margin: '0px auto'
            })
            Handsontable.dom.addEvent(d, 'dblclick', (event) => {
                this.removeTableMore()
                this.removeTableCellTools()
                this.removeDbClickUpload()
                this.currentRow = row
                this.currentCol = col
                this.currentKey = prop
                event.preventDefault()
                const field = this.multiFieldArray.filter(item => {
                    return item.name === prop
                })
                this.createInput(field[0]).click()
            })
            Handsontable.dom.empty(td)
            td.appendChild(d)
        },
        getbackgroundImage(src) {
            src = Vue.filter('qiniuZoom')(src, 35)
            const res = Vue.filter('backgroundImage')(src)
            return res
        },
        // 工具栏渲染
        toolRenderer(hotInstance, td, row, col, prop, value, cellProperties) {
            const tools = document.createElement('div')
            tools.css({
                height: '100%',
                width: '100%'
            })
            const toolAdd = document.createElement('span')
            toolAdd.css({
                height: '100%',
                width: '50%',
                display: 'inline-table',
                paddingLeft: '18px',
                paddingTop: '8px',
                float: 'left'
            })
            const addIcon = document.createElement('i')
            addIcon.className = 'icon eqf-plus-f'
            toolAdd.append(addIcon)
            tools.append(toolAdd)
            const toolDel = document.createElement('span')
            toolDel.css({
                height: '100%',
                width: '50%',
                display: 'inline-table',
                paddingRight: '18px',
                paddingTop: '8px'
            })
            const delIcon = document.createElement('i')
            delIcon.className = 'icon eqf-minus-f'
            toolDel.append(delIcon)
            tools.append(toolDel)
            Handsontable.dom.empty(td)
            td.append(tools)
            // 添加事件
            Handsontable.dom.addEvent(addIcon, 'click', (event) => {
                const curCountRows = this.hot.countRows()
                if (curCountRows >= 30) {
                    this.notifier.info('单次最多生成30个')
                    return
                }
                this.addRow(row + 1, 1)
            })
            // 删除事件
            Handsontable.dom.addEvent(delIcon, 'click', (event) => {
                this.removeRow(row)
            })
        },
        // 点击添加行按钮
        showAddRowPanel() {
            const curCountRows = this.hot.countRows()
            if (!this.addRowPanelVisible && this.buyMemberAuth && curCountRows >= 10) {
                if (this.isXiuKe) {
                    this.notifier.info(`单次最多生成${MAX_ADD_ROW_LENGTH_NOT_MEMBER}个`)
                    return
                }
                this.dialog.openConfirm({
                    msg: '单次最多生成10个',
                    confirmName: '升级到单次30个',
                    cancelName: '知道了',
                    width: '120px'
                }).then(() => {
                    this.upgradeMember()
                })
            } else {
                this.addRowPanelVisible = !this.addRowPanelVisible
            }
        },
        // 升级到会员
        upgradeMember() {
            this.buyMember().then(res => {
                if (res) {
                    // 购买成功刷新页面
                    this.isMember = true
                }
            })
        },
        // 创意云会员购买弹窗
        buyMember() {
            return new Promise((resolve, reject) => {
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.MBTN])
                const options = {
                    benefitId: Vue.env.benefits.batchCreate
                }
                this.dialog.openMember(options).then(res => {
                    if (res.success) {
                        this.notifier.success('支付成功，请刷新页面')
                    } else {
                        this.notifier.fail('支付失败，请稍后重试')
                    }
                    resolve(res.success)
                }).catch(err => {
                    err && this.logger.error(err)
                })
            })
        },
        // 确定添加行
        addRowClick() {
            if (this.addRowCount === '') {
                this.notifier.warn('请填写添加个数')
                return
            }
            const reg = /^[1-9][0-9]?$/
            if (reg.test(this.addRowCount)) {
                const curCountRows = this.hot.countRows()
                // 根据用户会员状态判断最大行数量
                const maxLength = this.buyMemberAuth ? MAX_ADD_ROW_LENGTH_NOT_MEMBER : MAX_ADD_ROW_LENGTH
                if (curCountRows > maxLength ||
                    (curCountRows + parseInt(this.addRowCount)) > maxLength) {
                    this.notifier.info(`单次最多生成${maxLength}个`)
                    this.addRow(curCountRows, maxLength - curCountRows)
                } else {
                    this.addRow(curCountRows, parseInt(this.addRowCount))
                }
                this.showAddRowPanel()
            }
        },
        // 更新表格高度
        updateTableHeight() {
            const calcTbodyHeight = document.querySelector('div.ht_clone_left.handsontable > div > div > div > table > tbody').scrollHeight
            const calcCellHeight = this.hot.countRows() * 36
            this.hot.updateSettings({
                height: (calcTbodyHeight > calcCellHeight ? calcTbodyHeight : calcCellHeight) + 36 + 2
            })
        },
        // 增加行
        addRow(pIndex, pCount) {
            this.hot.alter('insert_row', pIndex, pCount)
            this.updateTableHeight()
        },
        // 移除行
        removeRow(pIndex, pCount = 1) {
            this.hot.alter('remove_row', pIndex, pCount)
            this.updateTableHeight()
        },
        // 表格textarea输入事件处理函数
        textAreaInputEventHandler(e) {
            const tbTextAreaControl = document.querySelector('div.handsontableInputHolder > textarea')
            this.setComponent(this.textAreaComponentName, tbTextAreaControl.value)
        },
        // 表格单元格点击事件
        afterOnCellMouseDown(event, coords, TD) {
            // border样式
            // document.querySelectorAll('div.ht_master.handsontable > div > div > div > div > div:nth-child(1) > div').forEach(item => {
            //     item.style.backgroundColor = '#CCD5DB'
            // })
            if (this.textAreaControl !== null) {
                this.textAreaControl.removeEventListener('input', this.textAreaInputEventHandler)
            }
            const curColumns = this.getColumns()[coords.col]
            if (curColumns.data !== 'tool') {
                // 限制textarea输入长度
                const tbTextAreaControl = document.querySelector('div.handsontableInputHolder > textarea')
                if (tbTextAreaControl && tbTextAreaControl !== null) {
                    this.textAreaControl = tbTextAreaControl
                    this.textAreaComponentName = curColumns.data
                    tbTextAreaControl.setAttribute('maxlength', 20)
                    tbTextAreaControl.addEventListener('input', this.textAreaInputEventHandler)
                }
            }
            // 当前行数据
            const rowData = this.hot.getDataAtRow(coords.row)
            // 获取到需要高亮显示的字段
            const columns = this.getColumns()
            // 遍历一遍看是否全部为null
            let allValueIsNull = true
            for (let i = 0; i < columns.length - 1; i++) {
                const componentValue = rowData[i]
                if (componentValue !== null && componentValue !== '') {
                    allValueIsNull = false
                }
            }
            if (allValueIsNull) {
                return
            }
            columns.forEach((item, index) => {
                if (index !== columns.length - 1) {
                    const componentTag = item.data
                    const componentValue = rowData[index]
                    this.setComponent(componentTag, componentValue)
                }
            })
        },
        // 新增行事件
        afterCreateRow(index, amount) {
            this.updateTableHeight()
        },
        // 更多工具栏按钮点击事件
        tableCellMoreToolsClick(pIndex) {
            if (pIndex === 0) {
                // 替换
                const field = this.multiFieldArray.filter(item => {
                    return item.name === this.currentKey
                })
                this.createInput(field[0]).click()
            } else if (pIndex === 1) {
                // 应用到整列
                for (let i = 0; i < this.hot.countRows(); i++) {
                    if (i !== this.currentRow) {
                        this.hot.setDataAtCell(i, this.currentCol, this.hot.getDataAtCell(this.currentRow, this.currentCol))
                    }
                }
            } else if (pIndex === 2) {
                // 删除
                this.setComponent(this.currentKey, null)
                this.hot.setDataAtCell(this.currentRow, this.currentCol, null)
            }
            this.removeTableMore()
            this.removeTableCellTools()
        },
        // 移出更多按钮工具栏
        removeTableCellTools() {
            const curMoreTools = document.querySelector('.more-tools')
            if (curMoreTools && curMoreTools !== null) {
                curMoreTools.style.display = 'none'
            }
        },
        // 移出更多按钮
        removeTableMore() {
            const curMoreMask = document.querySelector('.more-mask')
            if (curMoreMask && curMoreMask !== null) {
                curMoreMask.remove()
            }
        },
        // 移除滑动上传提示
        removeDbClickUpload() {
            const curDbClickUpload = document.querySelector('.dbclick-upload')
            if (curDbClickUpload && curDbClickUpload !== null) {
                curDbClickUpload.style.display = 'none'
            }
        },
        // 表格鼠标滑入事件
        afterOnCellMouseOver(event, coords, td) {
            const curColumnKey = this.hot.getColHeader()[coords.col]
            const field = this.multiFieldArray.filter(item => {
                return item.name === curColumnKey
            })
            if (field && field.length === 1 && field[0].type === 'image' && coords.row >= 0) {
                const table = document.querySelector('.table')
                const tableLeft = table.getBoundingClientRect().left
                const tableTop = table.getBoundingClientRect().top
                if (td.firstChild.className === 'has') {
                    this.removeTableMore()
                    this.removeTableCellTools()
                    this.removeDbClickUpload()
                    this.currentRow = coords.row
                    this.currentCol = coords.col
                    this.currentKey = this.hot.getColHeader()[coords.col]
                    const maskWidth = 56
                    const maskHeight = 24
                    const moreMask = document.createElement('div')
                    moreMask.innerText = '更多∨'
                    moreMask.className = 'more-mask'
                    moreMask.css({
                        width: `${maskWidth}px`,
                        height: `${maskHeight}px`,
                        margin: '0px auto',
                        background: 'rgba(0, 0, 0, 0.65)',
                        borderRadius: '17px',
                        position: 'absolute',
                        top: '6px',
                        left: `${(td.scrollWidth - maskWidth) / 2}px`,
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: 'rgba(255,255,255,1)',
                        lineHeight: '24px',
                        textAlign: 'center'
                    })
                    // 更多按钮点击事件 显示更多工具栏
                    moreMask.addEventListener('click', e => {
                        const curMoreToolsStatus = document.querySelector('.more-tools').css('display')
                        if (curMoreToolsStatus === 'none') {
                            document.querySelector('.more-tools').style.display = 'block'
                        } else {
                            document.querySelector('.more-tools').style.display = 'none'
                        }
                    })
                    td.style.position = 'relative'
                    td.appendChild(moreMask)
                    // 计算更多工具栏的位置
                    const moreMaskLeft = moreMask.getBoundingClientRect().left
                    const moreMaskTop = moreMask.getBoundingClientRect().top
                    const moreToolsWidth = 104
                    const moreTools = document.querySelector('.more-tools')
                    moreTools.css({
                        left: `${moreMaskLeft - tableLeft - (moreToolsWidth - maskWidth) / 2}px`,
                        top: `${moreMaskTop - tableTop + maskHeight}px`
                    })
                } else {
                    const DBCLICK_UPLOAD_WIDTH = 66
                    const DBCLICK_UPLOAD_HEIGHT = 31
                    const curDbClickUpload = document.querySelector('.dbclick-upload')
                    curDbClickUpload.css({
                        left: `${td.getBoundingClientRect().left - tableLeft + (td.scrollWidth - DBCLICK_UPLOAD_WIDTH) / 2}px`,
                        top: `${td.getBoundingClientRect().top - tableTop + td.scrollHeight / 2 - DBCLICK_UPLOAD_HEIGHT}px`,
                        display: 'block'
                    })
                }
            } else {
                this.removeTableMore()
                this.removeTableCellTools()
                this.removeDbClickUpload()
            }
        },
        // 表格鼠标移出事件
        afterOnCellMouseOut(event, coords, td) {
            if (coords.col === 5 && td.childNodes.length === 2) {
                const curMoreToolsStatus = document.querySelector('.more-tools').css('display')
                if (curMoreToolsStatus === 'none') {
                    td.removeChild(td.childNodes[1])
                    this.removeTableCellTools()
                }
            }
        },
        // 单元格内容改变发生之前事件
        beforeChange(changes, source) {
            // changes [row，prop，oldVal，newVal]
            // source CopyPaste.paste
            // 如果在粘贴的时候长度超过20个字符就截取，现在表格字段长度限制都是20个，如果后期有不一样则需要读取配置然后按实际配置截取
            if (source === 'CopyPaste.paste') {
                changes.forEach(item => {
                    if (item && item[3] && item[3].length > 20) {
                        item[3] = item[3].substring(0, 20)
                    }
                })
            }
        },
        // 键盘事件点击之后
        afterDocumentKeyDown(event) {
            const isClickKey = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Tab']
            if (isClickKey.includes(event.code)) {
                const selectedRange = this.hot.getSelectedRange()
                if (selectedRange && selectedRange.length === 1) {
                    this.afterOnCellMouseDown(null, {
                        col: selectedRange[0].from.col,
                        row: selectedRange[0].from.row
                    }, null)
                }
            }
        },
        // 设置编辑器中组件高亮
        setComponent(pComponentTag, pComponentValue) {
            if (pComponentValue === null) {
                pComponentValue = ''
            }
            // 更新元素
            const updateElement = eqxElements => {
                eqxElements.forEach(eqxElement => {
                    const markLabel = eqxElement.elementJson.property.markLabel
                    if (pComponentTag === markLabel) {
                        if (elementType.text === eqxElement.elementJson.type) {
                            const $text = eqxElement.$text
                            const content = eqxElement.formatContent(pComponentValue)
                            $text.innerHTML = content
                            eqxElement.updateProperty({
                                content
                            })
                            // 计算高度
                            const css = eqxElement.elementJson.css
                            const $elBox = eqxElement.elementBox.$el
                            if (css.writingMode && css.writingMode === 'vertical-rl') {
                            // 竖的时候 计算宽度
                                $text.css('width', '')
                                const boxWidth = $text.offsetWidth
                                const textWidth = $text.offsetWidth - parseInt(css.padding) * 2 - parseInt(css.borderWidth) * 2
                                $elBox.css('width', boxWidth + 'px')
                                $text.css('width', textWidth + 'px')
                                eqxElement.updateCss({ width: textWidth + 'px' })
                            } else {
                            // 横排的时候 计算高度
                                $text.css('height', '')
                                const boxHeight = $text.offsetHeight
                                const textHeight = $text.offsetHeight - parseInt(css.padding) * 2 - parseInt(css.borderWidth) * 2
                                $elBox.css('height', boxHeight + 'px')
                                $text.css('height', textHeight + 'px')
                                eqxElement.updateCss({ height: textHeight + 'px' })
                            }
                        } else if (elementType.image === eqxElement.elementJson.type) {
                        // 采用日签图片替换逻辑
                            if (pComponentValue === '') {
                                // 隐藏图片
                                eqxElement.updateCss({ display: 'none' })
                                return
                            }
                            loader.image(pComponentValue)
                                .then(source => {
                                // 源logo尺寸
                                    const originWidth = parseInt(eqxElement.elementJson.css.width)
                                    const originHeight = parseInt(eqxElement.elementJson.css.height)
                                    // 源logo位置
                                    const originLeft = parseInt(eqxElement.elementJson.css.left)
                                    const originTop = parseInt(eqxElement.elementJson.css.top)
                                    // 源logo中心坐标
                                    const originX = originLeft + originWidth / 2
                                    const originY = originTop + originHeight / 2
                                    // 画布屏幕坐标
                                    const sceneCenterX = eqxElement.eqxPage.eqxScene.sceneJson.width / 2
                                    const sceneCenterY = eqxElement.eqxPage.eqxScene.sceneJson.height / 2
                                    // 计算源logo中心坐标在第几象限
                                    const quadrant = autoCreatePage.calcQuadrant(originX, sceneCenterX, originY, sceneCenterY)
                                    // 新的logo尺寸
                                    const logoWidth = source.width
                                    const logoHeight = source.height
                                    // 源尺寸宽高比
                                    const originRatio = originWidth / originHeight
                                    // 新尺寸宽高比
                                    const logoRatio = logoWidth / logoHeight
                                    autoCreatePage.calcImageStyle(originRatio, logoRatio, originWidth, logoWidth, eqxElement.elementJson, logoHeight, originHeight, pComponentValue, quadrant)
                                    // 显示图片
                                    eqxElement.elementJson.css.display = 'block'
                                    eqxElement.updateCss(eqxElement.elementJson.css)
                                    eqxElement.updateProperty(eqxElement.elementJson.property)
                                })
                        }
                    }
                })
            }
            // 同步元素到预览
            updateElement(this.eqxPage2.eqxElements)
            if (this.eqxPage3 && this.eqxPage3 !== null) {
                updateElement(this.eqxPage3.eqxElements)
            }
        },
        batchButtonClick() {
            if (this.getColumns().length === 0) {
                return
            }
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.BATCH,
                statistic.opt_label.BATCH.create])
            // 检查单字段必填
            let checkRequireField = true
            let findFieldIsRequire = null
            for (let i = 0; i < this.singleFieldArray.length; i++) {
                const item = this.singleFieldArray[i]
                if (item.require && (!item.value || item.value === null || item.value === '')) {
                    checkRequireField = false
                    findFieldIsRequire = item
                    break
                }
            }
            if (!checkRequireField) {
                this.notifier.warn(`请填写${findFieldIsRequire.name}`)
                return
            }
            // 检查数据
            const exportDataArr = this.getExportDataArr()
            if (exportDataArr.length <= 0) {
                this.notifier.warn('没有批量数据，请添加后重试')
                return
            }
            this.loading.open('作品生成中')
            this.exportData = exportDataArr
            this.exportPage = true
            document.querySelector('.batch-export').css({
                transition: 'all 0.3s',
                transform: 'translateX(100%)'
            })
        },
        // 获取导出的数据
        getExportDataArr() {
            const exportDataArr = []
            for (let i = 0; i < this.hot.countRows(); i++) {
                // 判断当前行所有数据是否为空  为空则跳过
                let isAllNull = true
                const rowData = this.hot.getDataAtRow(i)
                try {
                    rowData.forEach((item, index) => {
                        if (index !== rowData.length - 1) {
                            if (item && item !== '') {
                                isAllNull = false
                                throw new Error()
                            }
                        }
                    })
                } catch (error) {}
                if (isAllNull) {
                    continue
                }
                const exportItem = {}
                let exportItemEffective = true
                this.multiFieldArray.forEach(item => {
                    try {
                        const key = item.name
                        this.getColumns().forEach((item2, index2) => {
                            if (item2.data === key) {
                                const val = rowData[index2]
                                if (item.require && (val === null || val === '')) {
                                    exportItemEffective = false
                                }
                                exportItem[key] = val
                            }
                        })
                    } catch (error) {}
                })
                if (exportItemEffective) {
                    exportDataArr.push(exportItem)
                }
            }
            return exportDataArr
        },
        back() {
            document.querySelector('.batch-export').css({
                transition: 'all 0.3s',
                transform: 'translateX(0)'
            })
            this.exportPage = false
            // this.reSize()
        },
        reSize() {
            const _self = this
            window.onresize = function () {
                const editorContainer = document.querySelector('.template-preview')
                const editor = document.querySelector('div.eqc-slide-base > div > div.batch-template > div.template-preview > div.eqc-editor')
                if (editor && editor !== null) {
                    const editorContainerHeight = editorContainer.offsetHeight - 1
                    const editorHieght = editor.offsetHeight
                    editor.style.transform = `scale(${editorContainerHeight / editorHieght})`
                }
                _self.hot.updateSettings({
                    colWidths: _self.getColWidths
                })
            }
        }
    }
}
</script>
<style lang='scss'>
$tableBorderColor: #ccd5db;
.eqc-head-batch-create {
    .batch-export {
        position: absolute;
        z-index: 999;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: rgba($color: #000000, $alpha: 0.3);
    }
    .batch-template {
        position: fixed;
        min-height: 635px;
        min-width: 480px;
        width: 480px;
        height: 100%;
        background: rgba(204, 213, 219, 1);
        padding: 24px 24px 24px 24px;
        .template-preview {
            width: 100%;
            height: calc(100% - 36px - 32px);
            background: rgba(236, 238, 240, 0);
            display: flex;
            justify-content: center;
            align-items: center;
            .eqc-editor {
                overflow: hidden;
            }
            .eqc-range {
                outline: #ccd5db solid 57px !important;
            }
            .editor-mask {
                background: rgba(0, 0, 0, 0);
                position: fixed;
                z-index: 1;
                height: calc(100% - 78px);
                width: 100%;
                width: 480px;
                left: 0px;
            }
        }
        .template-btn-edit {
            width: 200px;
            height: 36px;
            border: 1px solid rgba(21, 147, 255, 1);
            font-size: 14px;
            font-weight: 400;
            color: rgba(21, 147, 255, 1);
            text-align: center;
            line-height: 36px;
            margin: 0px auto;
            cursor: pointer;
            border-radius: 18px;
            position: absolute;
            left: 140px;
            bottom: 32px;
        }
    }
    .batch-template-head {
        min-width: 720px;
        width: calc(100% - 480px);
        background: #eceef0;
        left: 480px;
        position: fixed;
        height: 60px;
        line-height: 66px;
        z-index: 1;
        padding: 0px 24px 0px 24px;
        .title {
            font-size: 18px;
            font-weight: bold;
            color: rgba(17, 17, 17, 1);
            float: left;
        }
        .close {
            right: 0px;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 24px;
            height: 24px;
            font-size: 16px;
            color: #fff;
            background: #2f3c4d;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s;
            margin: 16px 0px 0px 0px;
            float: right;
            &:hover {
                background: #ff2a6a;
            }
        }
    }
    .batch-template-setting {
        min-width: 720px;
        width: calc(100% - 480px);
        height: calc(100% - 60px);
        background: #eceef0;
        left: 480px;
        position: absolute;
        overflow: auto;
        padding: 0px 24px 24px 24px;
        margin-top: 60px;
        .step {
            width: 100%;
            background: rgba(247, 248, 249, 1);
            border-radius: 3px;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            .head {
                height: 40px;
                font-size: 14px;
                font-weight: 600;
                color: rgba(17, 17, 17, 1);
                line-height: 40px;
                padding: 0px 12px 0px 12px;
                .circle {
                    width: 10px;
                    height: 10px;
                    display: inline-block;
                    background: rgba(255, 178, 67, 1);
                    border-radius: 5px;
                    margin-right: 4px;
                }
            }
            .content {
                height: calc(100% - 40px);
                padding: 0px 12px 12px 12px;
            }
        }
        .first {
            height: 166px;
            margin-bottom: 12px;
            .swiper-container {
                width: 100%;
                height: 100%;
                cursor: default !important;
            }
            .swiper-slide {
                text-align: center;
                font-size: 18px;
                /* Center slide text vertically */
                display: -webkit-box;
                display: -ms-flexbox;
                display: -webkit-flex;
                display: flex;
                -webkit-box-pack: center;
                -ms-flex-pack: center;
                -webkit-justify-content: center;
                justify-content: center;
                -webkit-box-align: center;
                -ms-flex-align: center;
                -webkit-align-items: center;
                align-items: center;
                background: rgba(0, 0, 0, 0) center/cover no-repeat;
                height: 114px !important;
                background-size: contain;
                cursor: default;
            }
            .swiper-button {
                width: 28px;
                height: 28px;
                background: rgba(0, 0, 0, 0.7);
                border-radius: 14px;
                top: 43px;
                margin-top: 0px;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 26px;
                color: #ffffff;
            }
        }
        .second {
            min-height: 188px;
            height: auto;
            margin-bottom: 12px;
            .content {
                padding: 0px 12px 0px 12px;
                .blank {
                    font-size: 13px;
                    font-weight: 400;
                    color: rgba(17, 17, 17, 1);
                    text-align: center;
                    height: 148px;
                    line-height: 196px;
                    background: url("../../../../img/blank_box.png");
                    background-repeat: no-repeat;
                    background-position: center;
                    background-size: 88px;
                    background-position-y: 11px;
                }
                .row {
                    width: 100%;
                    height: 74px;
                    padding-bottom: 12px;
                    display: flex;
                    flex-direction: row;
                    flex-wrap: nowrap;
                    justify-content: center;
                    align-items: center;
                    align-content: stretch;
                    div.block {
                        height: 100%;
                        .field-name {
                            width: 100%;
                            height: 26px;
                            font-size: 13px;
                            font-weight: bold;
                            color: rgba(47, 60, 77, 1);
                            line-height: 16px;
                            position: relative;
                            .field-name-require {
                                letter-spacing: -2px;
                                color: rgba(255, 84, 72, 1);
                                font-size: 18px;
                                vertical-align: -webkit-baseline-middle;
                                position: absolute;
                                top: 3px;
                            }
                        }
                        .field-input {
                            width: 100%;
                            height: 36px;
                            position: relative;
                            input {
                                width: 100%;
                                height: 100%;
                                border-radius: 3px;
                                border: 1px solid rgba(204, 213, 219, 1);
                                font-size: 13px;
                                font-weight: 400;
                                color: rgba(17, 17, 17, 1);
                                text-indent: 10px;
                                padding-right: 46px;
                            }
                            label {
                                position: absolute;
                                top: 11px;
                                right: 8px;
                                width: 38px;
                                direction: rtl;
                                font-size: 12px;
                                color: rgba(153, 153, 153, 1);
                            }
                        }
                        .field-image {
                            width: 100%;
                            height: 100%;
                            display: flex;
                            .image-item {
                                flex: none;
                                width: 62px;
                                .image-preview {
                                    width: 62px;
                                    height: 62px;
                                    margin: 0px auto;
                                    background: rgba(255, 255, 255, 1);
                                    border-radius: 3px;
                                    border: 1px solid rgba(204, 213, 219, 1);
                                    font-size: 12px;
                                    font-weight: 400;
                                    color: rgba(144, 153, 164, 1);
                                    text-align: center;
                                    line-height: 20px;
                                    position: relative;
                                    cursor: pointer;
                                    &:hover {
                                        .image-replace {
                                            display: block;
                                        }
                                        i.close {
                                            display: flex;
                                        }
                                    }
                                    .image-replace {
                                        display: none;
                                        width: 100%;
                                        height: 100%;
                                        background: rgba(0, 0, 0, 0.5);
                                        border-radius: 3px;
                                        cursor: default;
                                        button {
                                            width: 40px;
                                            height: 24px;
                                            background: rgba(21, 147, 255, 1);
                                            border-radius: 3px;
                                            font-size: 12px;
                                            color: rgba(255, 255, 255, 1);
                                            position: relative;
                                            top: 19px;
                                            cursor: pointer;
                                        }
                                    }
                                    i.icon {
                                        display: block;
                                        font-size: 22px;
                                        margin-top: 13px;
                                    }
                                    i.close {
                                        position: absolute;
                                        right: -8px;
                                        top: -8px;
                                        display: none;
                                        justify-content: center;
                                        align-items: center;
                                        width: 14px;
                                        height: 14px;
                                        font-size: 12px;
                                        color: #fff;
                                        background: #2f3c4d;
                                        border-radius: 50%;
                                        cursor: pointer;
                                        transition: all 0.3s;
                                        float: right;
                                        &:hover {
                                            background: #ff2a6a;
                                        }
                                    }
                                }
                            }
                            :nth-child(2) {
                                width: 62px;
                                margin-left: 16px;
                            }
                            :nth-child(3) {
                                width: 62px;
                                margin-left: 16px;
                            }
                        }
                    }
                    :nth-child(1) {
                        flex: 1;
                    }
                    :nth-child(2) {
                        width: 16px;
                    }
                    :nth-child(3) {
                        flex: 1;
                    }
                    :nth-child(4) {
                        width: 16px;
                    }
                    :nth-child(5) {
                        flex: 1;
                    }
                }
            }
        }
        .third {
            min-height: 158px;
            height: auto;
            margin-bottom: 44px;
            .blank {
                font-size: 13px;
                font-weight: 400;
                color: rgba(17, 17, 17, 1);
                text-align: center;
                height: 106px;
                line-height: 196px;
                background: url("../../../../img/blank_box.png");
                background-repeat: no-repeat;
                background-position: center;
                background-size: 88px;
                background-position-y: 11px;
            }
            .upload-excel {
                width: 85px;
                height: 24px;
                background: rgba(255, 255, 255, 1);
                border-radius: 3px;
                border: 1px solid rgba(204, 213, 219, 1);
                display: inline-block;
                line-height: 22px;
                margin-left: 22px;
                font-size: 12px;
                font-weight: 400;
                color: rgba(47, 60, 77, 1);
                text-indent: 23px;
                cursor: pointer;
                background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAACSElEQVRIS2OUzHf7z0BHwDhqIXpoywlLMGhIKjCoS8gzTNm7iuH/f9JiBGeQSgmIMqhJyMMNB1miKiHHwMXGAXeDbJEnw99//0hKASgWtgRnMejKqDCoSygw8HFyEzQIZCHIg4yM+JUiOwrFwlsd6xl4OLgIWgRTALJwX9lMsM/xAa2qEIYP3z6DlVBsYby1L4MwDz8DMxMzQ55rBMPxO5cYTty9DDY8wMiBQVFUmoGqFsKCi4OVjeFe92aGrm0LGSbsWga2cHFaM4Ozlhl1LVQSlWHgZGVnYGNhZdhU0M+w6OgWhmXHd4AtbArKZDBT0ibOQlCYN22cDU5EibZ+DLXrpjHsvHKCYX1uD4O0oBjYQKrHYfCUUoabzx8wbMjrY3DoSGMINHZkmBxThpItQNkEFH+gID3XuIxh8p4VDNP3rQGrmR5fyWCvbkycD0EaDt48yxA5vYpBWUyG4d7rpwwHK2YzqIjLYs2HVItDj94chkuPb4NT3LS4SpTUDwrScq8EBgl+YbAvQSFw9eldhuvP7oPVWasaMEgKiBDvQ1Cx5daTxXD16T36WLj14mGG1PktDCpisgx3Xz+hbZD++/ePwakrg+H3n98Mi9NbGOzaUmibaB68eQbOwG7aFgxe+jYM1WumMuy+dpK22YJQoQpKNFTL+IQsg2V8uhdtdC+8KaqeMp1CGPRl1Ri0pJQYFEWlwJkZH6C4AkY2HFRUgZoYIMshWJFBU0qRQZCbj3pNDGISCqgYgzli6j4qNqKIsZwcNcO/IQwAH0eMmDmuOtoAAAAASUVORK5CYII=);
                background-repeat: no-repeat;
                background-size: 14px;
                background-position-y: 4px;
                background-position-x: 4px;
                &::after {
                    text-indent: 0px;
                }
            }
            .download-excel {
                font-size: 12px;
                font-weight: 400;
                color: rgba(21, 147, 255, 1);
                margin-left: 4px;
                cursor: pointer;
            }
            .tips {
                font-size: 12px;
                font-weight: 400;
                color: #2f3c4d;
                margin-left: 10px;
                &::before {
                    content: "";
                    width: 4px;
                    height: 4px;
                    border-radius: 4px;
                    background: #9099a4;
                    display: inline-block;
                    position: relative;
                    top: -2px;
                    margin-right: 6px;
                }
            }
            .upgrade {
                font-size: 12px;
                font-weight: 400;
                color: rgba(21, 147, 255, 1);
                cursor: pointer;
                margin-left: 4px;
            }
            .table {
                display: inline-block;
                width: calc(100% - 86px);
                height: auto;
                min-height: 100%;
                position: relative;
                .hot-table {
                    height: 100%;
                    width: 100%;
                    overflow: hidden;
                }
                textarea {
                    text-align: center;
                    line-height: 36px;
                }
                .icon {
                    cursor: pointer;
                }
                .more-tools {
                    display: none;
                    width: 104px;
                    height: 131px;
                    position: absolute;
                    z-index: 103;
                    left: 0px;
                    top: 0px;
                    background-image: url("data:image/png;base64,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");
                    background-repeat: no-repeat;
                    background-size: 104px 131px;
                    padding: 20px 8px 18px 8px;
                    ul {
                        padding: 0px;
                        margin: 0px;
                        li {
                            width: 100%;
                            height: 30px;
                            line-height: 30px;
                            text-align: center;
                            font-size: 14px;
                            font-weight: 400;
                            color: rgba(37, 42, 48, 1);
                            cursor: pointer;
                            &:hover {
                                background: rgba(236, 238, 240, 1);
                            }
                        }
                    }
                }
                .dbclick-upload {
                    display: none;
                    width: 66px;
                    height: 31px;
                    position: absolute;
                    z-index: 103;
                    left: 0px;
                    top: 0px;
                    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAAA+CAYAAADqFbO0AAADgUlEQVR4Xu2dMWhTURSGz3laCZiA2EXd2lHd8hIpdShFS8FAHayCKAjWLuqqa1Zd1UUqCIpg42AhQqlS3mCpTV9GHdvNukSEPCG0miM3JtAWbI5tKO07/x2SIf+7yf//H/e9JPAuU3OICGez2bF6vX6TiE4RUbL1Gp5jmUBERJ89z3tWKpUmmFmcS3YP6XT6OBG9JKLBWFqHqXYJzBLRtXK5vMJuZfB9/wNgaJdZ7F+fDcPwHGcymVv1ev1p7O3CYNsEPM8b53Q6/YmIzrRVQ2AhgQUHRBUXkBa6VnmMHBCNq0sMJND4lgEgAML6BAAEeNiQAIAAEAACDPw7AawQoAMrBBjACgEGlAnglKEMyooMQFhpWukTQCiDsiIDEFaaVvoEEMqgrMgAhJWmlT4BhDIoKzIAYaVppU8AoQzKigxAWGla6RNAKIOyIgMQVppW+gQQyqCsyACElaaVPgGEMigrMgBhpWmlTwChDMqKDEBYaVrpE0Aog7IiAxBWmlb6BBDKoKzIAISVppU+AYQyKCsyAGGlaaVPAKEMyooMQFhpWukTQCiDsiIDEFaaVvoEEMqgrMgcEL+JyLNiGD63TKDu7mK7IiLHEBQSYOZvboV4TUSXEQcSIKJJt0KcFpEyER1CJKYTWGXmdONu+L7v3xORB6bjMG6eme+HYfiwAYQbmUzmiog8EZFu49mYss/MFWa+vbi46C4d/u6X0Rp9fX1H19bWLorISWZO7fdkROQEEeU67KPIzF87POeuTyciVWb+0tXV9XZ+fv576wNsAGLXP9UuvKHv+49E5E4n3oqZH4dheLcTc+3VOWIPRHODGLcfyNgOS5gIw3C8tRXRDufas4fHHgiXfD6f94rF4nMRub6dJpj5RS6Xu5HP5+vbOX4/HWMCCFfI6OjogaWlpVfb+M1lsre392qhUHC/6MZ+mAHCNTkwMHAwiqI3IjKiaZaZp5LJ5KUgCH5p9HHQmAKiuVIcWl5enhKR4a0KZObpnp6ekUKhsBqHorUezAHRXCkS1Wr13RY7Ec6mUqkLQRDUtEHGRWcSCFfe0NDQ4UqlMk1EZzeV+bG7u3t4ZmbmZ1xK/h8fZoFwIfX396dqtdr7dbsSLiQSifNzc3NuYzqTwzQQzdPHkSiK3M62lEwmB4Mg+GGShKZp80C4HLLZbOP/m1KpVLEMg/MOIKwTsMn/H7tu/0nHjUNQAAAAAElFTkSuQmCC");
                    background-repeat: no-repeat;
                    background-size: 66px 31px;
                    font-size: 12px;
                    font-weight: 400;
                    color: rgba(255, 255, 255, 1);
                    line-height: 24px;
                    text-align: center;
                }
            }
            .tools {
                float: right;
                width: 86px;
                height: 100px;
                padding-left: 8px;
                .tool {
                    width: 78px;
                    height: 28px;
                    background: rgba(255, 255, 255, 1);
                    border-radius: 3px;
                    border: 1px solid rgba(204, 213, 219, 1);
                    font-size: 12px;
                    font-weight: 400;
                    color: rgba(47, 60, 77, 1);
                    line-height: 27px;
                    margin-bottom: 8px;
                    text-align: center;
                    cursor: pointer;
                    .eqf-plus {
                        font-weight: bold;
                        color: #2f3c4d;
                    }
                }
                .tool-addRow {
                    width: 208px;
                    height: 132px;
                    position: absolute;
                    right: 30px;
                    top: 441px;
                    z-index: 101;
                    background: url(data:image/png;base64,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pU4IECAQSkAAhRqXYgkQIJBHQADlmaVOCBAgEEpAAIUal2IJECCQR0AA5ZmlTggQIBBKQACFGpdiCRAgkEdAAOWZpU4IECAQSkAAhRqXYgkQIJBHQADlmaVOCBAgEEpAAIUal2IJECCQR0AA5ZmlTggQIBBKQACFGpdiCRAgkEdAAOWZpU4IECAQSkAAhRqXYgkQIJBHQADlmaVOCBAgEEpAAIUal2IJECCQR0AA5ZmlTggQIBBKQACFGpdiCRAgkEdAAOWZpU4IECAQSkAAhRqXYgkQIJBHQADlmaVOCBAgEEpAAIUal2IJECCQR0AA5ZmlTggQIBBKQACFGpdiCRAgkEdAAOWZpU4IECAQSkAAhRqXYgkQIJBHQADlmaVOCBAgEEpAAIUal2IJECCQR0AA5ZmlTggQIBBKQACFGpdiCRAgkEdAAOWZpU4IECAQSkAAhRqXYgkQIJBHQADlmaVOCBAgEEpAAIUal2IJECCQR0AA5ZmlTggQIBBKQACFGpdiCRAgkEdAAOWZpU4IECAQSkAAhRqXYgkQIJBHQADlmaVOCBAgEEpAAIUal2IJECCQR0AA5ZmlTggQIBBKQACFGpdiCRAgkEdAAOWZpU4IECAQSkAAhRqXYgkQIJBHQADlmaVOCBAgEEpAAIUal2IJECCQR0AA5ZmlTggQIBBKQACFGpdiCRAgkEdAAOWZpU4IECAQSkAAhRqXYgkQIJBHQADlmaVOCBAgEEpAAIUal2IJECCQR0AA5ZmlTggQIBBKQACFGpdiCRAgkEdAAOWZpU4IECAQSkAAhRqXYgkQIJBHQADlmaVOCBAgEEpAAIUal2IJECCQR0AA5ZmlTggQIBBKQACFGpdiCRAgkEdAAOWZpU4IECAQSkAAhRqXYgkQIJBHQADlmaVOCBAgEEpAAIUal2IJECCQR0AA5ZmlTggQIBBKQACFGpdiCRAgkEdAAOWZpU4IECAQSkAAhRqXYgkQIJBHQADlmaVOCBAgEEpAAIUal2IJECCQR0AA5ZmlTggQIBBKQACFGpdiCRAgkEdAAOWZpU4IECAQSkAAhRqXYgkQIJBHQADlmaVOCBAgEEpAAIUal2IJECCQR0AA5ZmlTggQIBBKQACFGpdiCRAgkEdAAOWZpU4IECAQSkAAhRqXYgkQIJBHQADlmaVOCBAgEEpAAIUal2IJECCQR0AA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);
                    background-size: cover;
                    background-repeat: no-repeat;
                    .input-rowCount {
                        width: 100%;
                        height: 50%;
                        input {
                            width: 160px;
                            height: 30px;
                            border-radius: 3px;
                            border: 1px solid rgba(204, 213, 219, 1);
                            position: relative;
                            left: 25px;
                            top: 30px;
                            text-indent: 6px;
                            font-size: 13px;
                            color: rgba(47, 60, 77, 1);
                        }
                    }
                    .input-buttom {
                        width: 100%;
                        height: 50%;
                        .buttom {
                            display: inline-block;
                            width: 48px;
                            height: 24px;
                            border-radius: 3px;
                            line-height: 22px;
                            font-size: 12px;
                            text-align: center;
                            position: relative;
                            cursor: pointer;
                        }
                        :nth-child(1) {
                            border: 1px solid rgba(204, 213, 219, 1);
                            background: rgba(255, 255, 255, 1);
                            color: rgba(102, 102, 102, 1);
                            right: -79px;
                            top: 13px;
                        }
                        :nth-child(2) {
                            border: 1px solid rgba(21, 147, 255, 1);
                            background: rgba(21, 147, 255, 1);
                            color: rgba(255, 255, 255, 1);
                            right: -85px;
                            top: 13px;
                        }
                    }
                }
            }
        }
    }
    .batch-template-batch-create {
        position: absolute;
        left: calc((100% - 200px) / 2 + 240px);
        bottom: 16px;
        width: 200px;
        height: 36px;
        font-size: 14px;
        color: rgba(255, 255, 255, 1);
        line-height: 36px;
        text-align: center;
        z-index: 102;
    }
    .enable {
        background: rgba(21, 147, 255, 1);
        border: 1px solid rgba(21, 147, 255, 1);
        border-radius: 18px;
        cursor: pointer;
    }
    .unable {
        background: rgba(236, 238, 240, 1);
        border: 1px solid rgba(144, 153, 164, 1);
        border-radius: 18px;
        color: rgba(144, 153, 164, 1);
        cursor: pointer;
    }
    .htCore {
        th {
            background: #ffffff;
        }
    }
    .hot {
        text-align: center;
        td {
            padding: 0px;
            text-align: center;
            vertical-align: middle;
            &:hover {
                background: #f7f8f9;
            }
        }
        th {
            vertical-align: middle;
            .relative {
                vertical-align: middle;
                padding: 10px;
                line-height: 0px;
            }
        }
        input {
            opacity: 1 !important;
        }
        .ht__highlight {
            background: #ffffff;
        }
        .ht_clone_top_left_corner th {
            border: 1px solid $tableBorderColor;
        }
        /* Row headers */
        /* Bottom */
        .ht_clone_top_left_corner th {
            border-bottom: 1px solid $tableBorderColor;
        }

        /* Left and right */
        .ht_clone_left th {
            border-right: 1px solid $tableBorderColor;
            border-left: 1px solid $tableBorderColor;
            border-bottom: 1px solid $tableBorderColor;
        }

        /* Column headers */
        /* Top, bottom and right */
        .ht_clone_top th {
            border-top: 1px solid $tableBorderColor;
            border-right: 1px solid $tableBorderColor;
            border-bottom: 1px solid $tableBorderColor;
        }

        /* Left */
        .ht_clone_top_left_corner th {
            border-right: 1px solid $tableBorderColor;
        }

        /* Bottom */
        .ht_master tr > td {
            border-bottom: 1px solid $tableBorderColor;
        }

        /* Right */
        .ht_master tr > td {
            border-right: 1px solid $tableBorderColor;
        }

        .handsontable tr:first-child td,
        .handsontable tr:first-child th {
            border-top: 1px solid $tableBorderColor;
        }

        .handsontable tr th:nth-child(2),
        .handsontable tr td:nth-child(2) {
            border-left: 1px solid $tableBorderColor;
        }
        .field-name {
            padding-left: 12px;
        }
        .field-name-require {
            letter-spacing: -2px;
            color: rgba(255, 84, 72, 1);
            font-size: 18px;
            vertical-align: -webkit-baseline-middle;
            position: absolute;
            top: 12px;
            font-weight: bold;
        }
    }
}
</style>
