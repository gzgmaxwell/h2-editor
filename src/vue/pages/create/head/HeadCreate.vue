<template>
    <div class="eqc-head-create">
        <div
            v-show="editQrcode"
            ref="qrcodeDialog"
            class="qrcode-dialog"
        >
            <input
                v-model="qrcodeText"
                placeholder="填写地址"
                class="create-input w200 m0"
            >
            <div class="qrcode-btns">
                <base-button
                    class="white h36 w96"
                    @click.native="editToAll"
                >
                    应用到此列
                </base-button>
                <base-button
                    class="blue h36 w96"
                    @click.native="qrcodeEditConfirm"
                >
                    确定
                </base-button>
            </div>
            <div
                v-if="arrowDownOrLeft"
                ref="arrowDown"
                class="qrcode-arrow-down"
            />
            <div
                v-if="!arrowDownOrLeft"
                ref="arrowLeft"
                class="qrcode-arrow-left"
            />
        </div>
        <div class="content">
            <div class="table-content">
                <div
                    v-if="showHotTable"
                    ref="hotT"
                    class="hot-table"
                />
            </div>
            <div class="bottom">
                <div class="create-options">
                    <div
                        class="select-all-btn"
                        @click="selectAll"
                    >
                        <base-checkbox
                            id="select-all-opt"
                            v-model="selAll"
                            :class="['opt', {'active': selAll}]"
                        />
                        <span>全选</span>
                    </div>
                    <base-button
                        :class="{'disable': checkArr.length === 0}"
                        class="delete red w52"
                        @click.native="eleDelete"
                    >
                        删除
                    </base-button>
                    <div class="create-add">
                        <base-button
                            class="white white-blue h36 w72"
                            @click.native="eleAdd"
                        >
                            <i
                                class="icon eqf-plus"
                            />
                            添加
                        </base-button>
                        <div
                            v-show="addDialogShow"
                            class="create-add-dialog"
                        >
                            <input
                                v-model.number="addCount"
                                type="number"
                                placeholder="填写添加个数"
                                class="create-input w160 m0"
                            >
                            <div class="dialog-btns">
                                <base-button
                                    class="white h36 w72"
                                    @click.native="addDialogShow = false"
                                >
                                    取消
                                </base-button>
                                <base-button
                                    class="blue h36 w72"
                                    @click.native="addConfirm"
                                >
                                    确定
                                </base-button>
                            </div>
                            <div
                                class="arrow-down"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="bar">
            <div class="create-top">
                <div class="rb-top">
                    <span
                        class="title"
                    >批量生成</span>
                    <i
                        class="close eqf-no"
                        @click="exit"
                    />
                </div>
                <div class="create-content">
                    <p class="title">
                        要批量修改哪些组件
                    </p>
                    <div class="content-box">
                        <div
                            class="component-type"
                            @mouseover="selectComponent = true"
                            @mouseleave="selectComponent = false"
                        >
                            <span>{{ componentType }}</span>
                            <div
                                :class="{roate: selectComponent}"
                                class="triangle"
                            >
                                <i
                                    class="icon eqf-menu-down"
                                />
                            </div>
                            <base-drop-down
                                v-if="selectComponent"
                                :list="typeTags"
                                :css="{left: '0px', top: '35px', paddingBottom: '10px', width: '100%', zIndex: 3}"
                                item-key="type"
                                @choose="chooseType"
                            />
                        </div>
                        <ul class="component-list">
                            <li
                                v-for="(item, index) in defaultObjKeysFilter"
                                :key="index"
                                class="component-li"
                                @click="componentBeChecked(item, index)"
                            >
                                <base-checkbox
                                    v-model="item.check"
                                    :class="['opt', {'active': item.check}]"
                                />
                                <span
                                    v-if="item.type.indexOf('text') !== -1"
                                    class="component-value"
                                >
                                    {{ item.value }}
                                </span>
                                <div
                                    v-if="item.type.indexOf('img') !== -1"
                                    :style="{background: getbackgroundImage(item.value) + 'no-repeat center/contain'}"
                                    class="component-img"
                                />
                                <div
                                    v-if="item.type.indexOf('qrcode') !== -1"
                                    style="width: 35px;height: 35px;"
                                    class="qrcode-div"
                                />
                                <div
                                    v-if="item.type.indexOf('frame') !== -1"
                                    :id="'frame_'+item.type"
                                    class="component-frame"
                                >
                                    {{ getFramePreviewHtml(item) }}
                                </div>
                            </li>
                        </ul>
                    </div>
                    <p class="title">
                        生成设置
                    </p>
                    <div class="content-box">
                        <div
                            :class="{roate: isNewPage,'disabled':!pageOrPro}"
                            class="add-pages"
                            @mouseover="isNewPage = true"
                            @mouseleave="isNewPage = false"
                        >
                            <span
                                style="font-size:13px;overflow: hidden;
                                    text-overflow: ellipsis;
                                    white-space: nowrap;"
                            >
                                {{ newTitle }}
                            </span>
                            <div
                                :class="{roate: isNewPage}"
                                class="triangle"
                            >
                                <i
                                    class="icon eqf-menu-down"
                                />
                            </div>
                            <base-drop-down
                                v-if="isNewPage"
                                :list="titleTags"
                                :css="{left: '0px', bottom: '30px', paddingBottom: '10px', width: '100%', zIndex: 3}"
                                item-key="tagId"
                                @choose="chooseTitleTag"
                            />
                        </div>
                        <div class="line" />
                        <div class="radio-box">
                            <base-radio
                                id="create_page"
                                v-model="radioValue"
                                value="newPage"
                                name="pageOrPro"
                                @change="chooseTag"
                            />
                            <label for="create_page">生成新页面</label>
                            <base-radio
                                id="create_product"
                                v-model="radioValue"
                                value="newPro"
                                name="pageOrPro"
                                @change="chooseTag"
                            />
                            <label for="create_product">生成新作品</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="create-bottom">
                <base-button
                    :class="{'disable': creating || checkArr.length === 0}"
                    class="create-btn blue"
                    @click.native="create"
                >
                    {{ creating ? '生成中...' : '生成' }}
                </base-button>
                <a
                    class="help-btn"
                    target="blank"
                    href="//qingsheji.help.eqxiu.com/more.html"
                >
                    <i
                        :class="[{'eqf-why-l':!isHelpHover},{'eqf-why-f':isHelpHover}]"
                        @mouseover="isHelpHover = true"
                        @mouseleave="isHelpHover = false"
                    />
                </a>
            </div>
        </div>
    </div>
</template>

<script>
import { uploadQiniu } from '../../../../utils/qiniuUpload'
import delayLoad from '../../../../utils/delayLoad'
import EqxPage from '../../../../core/html/page'
import elementType from '../../../../config/enum.element.type'
import statistic from '../../../../config/statistic'
import loader from '../../../../utils/loader'
import imgToBase64 from '../../../../utils/imgToBase64'
import { host } from '../../../../config/env'

export default {
    props: {
        close: {
            type: Function,
            default: null
        },
        data: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            isHelpHover: false,
            maxRowNumber: 20, // 批量生成最大行数
            pictureArr: [],
            showHotTable: true,
            // handsontable 实例
            hot: null,
            arrowDownOrLeft: true,
            // 编辑二维码
            editQrcode: false,
            qrcodeText: '',
            checkArr: [],
            setAll: false,
            // 当前行
            currentRow: 0,
            currentCol: 0,
            currentKey: '',
            // 全选
            selAll: false,
            // 选择类型
            componentType: '所有组件',
            type: 0,
            selectComponent: false,
            typeTags: [{
                type: 0,
                name: '所有组件'
            }, {
                type: 1,
                name: '文字组件'
            }, {
                type: 2,
                name: '图片组件'
            }, {
                type: 3,
                name: '二维码'
            }, {
                type: 4,
                name: '图片容器'
            }],
            // 原始数据备份
            originalData: null,
            defaultData: null,
            defaultObjKeys: [],
            // 新作品标题下拉选择数据
            titleTags: [],
            qrcodeName: '',
            otherTags: [{
                id: 1,
                name: '生成新作品'
            }, {
                id: 2,
                name: '生成新页面'
            }],
            // 新作品：true 新页面：false
            pageOrPro: true,
            // 新作品：newPro 新页面：newPage
            radioValue: 'newPro',
            // 新作品标题
            newTitle: '选择一列为新作品标题',
            // 被删除的数据
            deleArr: [],
            titleKey: '',
            // 生成新页面
            isNewPage: false,
            // 添加数量
            addCount: null,
            // dialog
            addDialogShow: false,
            // 是否在生成中
            creating: false,
            // 存放元素的数组
            eleArr: [],
            // 图片上传
            isUploading: false,
            // 是否全选
            isSelectAll: false,
            // 上传配置
            uploadOptions: {
                files: [],
                onFilesAdded: this.onFilesAdded,
                onError: this.onError,
                onFileUploaded: this.onFileUploaded
            },
            // handsontable主要配置
            settings: {
                // 数据
                data: [],
                // 行头
                rowHeaders: true,
                // 列头
                colHeaders: (index) => {
                    if (this.settings.columns[index]) {
                        const col = this.settings.columns[index]
                        if (col.data.indexOf('img') !== -1) {
                            return `<div style="width: 32px;height: 32px;background: ${this.getbackgroundImage(this.originalData[0][col.data])} no-repeat center/contain;"></div>`
                        } else if (col.data.indexOf('qrcode') !== -1) {
                            return '<div style="width: 32px;height: 32px;" class="qrcode-div"></div>'
                        } else if (col.data.indexOf('text') !== -1) {
                            return this.originalData[0][col.data].replace(/\r?\n/g, '<br>').replace(/\s/g, '&nbsp;')
                        } else if (col.data.indexOf('frame') !== -1) {
                            return '<div>图片<br/>容器</div>'
                        } else {
                            return '<input type="checkBox" id="seleAll"/>'
                        }
                    }
                },
                // 默认行高
                rowHeights: '48px',
                // 左右滑动表时固定第1列
                fixedColumnsLeft: 1,
                // 表头信息生成后回调函数
                afterGetColHeader: (col, th) => {
                    if (col === 0) {
                        this.$refs.inp = th.querySelector('#seleAll')
                        if (this.$refs.inp) {
                            this.$refs.inp.addEventListener('change', this.selectAll)
                            this.$refs.inp.checked = !!this.selAll
                        }
                    }
                },
                // 根据表头宽度来自动计算每一列的宽度
                autoColumnSize: { useHeaders: true },
                autoRowSize: true,
                // 为某些列定义单元格属性和数据绑定
                columns: [
                    // 定义第一列的属性是checkbox
                    {
                        data: 'checkRow',
                        type: 'checkbox'
                    }
                ],
                // 单元格被修改之后的回调函数
                afterChange: (changes, source) => {
                    if (changes || source === 'edit') {
                        if (changes[0][1] === 'checkRow' && !changes[0][2] && changes[0][3]) {
                            this.checkArr.push('check')
                        } else if (changes[0][1] === 'checkRow' && changes[0][2] && !changes[0][3]) {
                            this.checkArr.splice(0, 1)
                            this.selAll = false
                            this.$refs.inp.checked = false
                        }
                        if (this.checkArr.length === this.settings.data.length) {
                            this.selAll = true
                            this.$refs.inp.checked = true
                        }
                    }
                },
                // 不允许以拖动方式添加行
                fillHandle: false,
                className: 'hot'
            },
            defaultSvgBgImgBase64Str: 'data:image/png;base64,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'
        }
    },
    computed: {
        eqxScene() {
            return Vue.store.state.scene.eqxScene
        },
        sceneJson() {
            return this.eqxScene.sceneJson
        },
        eqxPages() {
            return this.eqxScene.eqxPages
        },
        pageId() {
            return EqxPage.newPageId(this.eqxScene.sceneJson.pages)
        },
        pageSort() {
            return EqxPage.newPageSort(this.eqxScene.sceneJson.pages)
        },
        defaultObjKeysFilter() {
            return this.defaultObjKeys.filter(item => this.type === item.typeNumber || (this.type === 0 && item.typeNumber !== 5)) || []
        }
    },
    mounted() {
        this.$el.addEventListener('click', (event) => {
            if (!(['qrcode-div', 'create-input w200 m0', 'qrcode-dialog'].includes(event.target.className))) {
                this.editQrcode = false
            }
        })
        this.loadCss()
    },
    methods: {
        exit() {
            this.close()
        },
        loadCss() {
            const loadCss = delayLoad.delayLoadCSS(Vue.env.plugin.handsontablecss)
            const loadJs = delayLoad.delayLoadJS(Vue.env.plugin.handsontablejs)
            Promise.all([loadCss, loadJs]).then(() => {
                this.initData()
            })
        },
        setSettingsData(number, ele, i, j) {
            if (ele.type === elementType.text) {
                const obj = {
                    eleId: ele.id,
                    data: `${number}text`
                }
                this.settings.data[i][`${number}text`] = ele.property.content.replace(/&nbsp;/g, ' ').replace(/<br>/g, '\n')
                this.settings.columns.splice(j + 1, 1, obj)
            } else if (ele.type === elementType.frame) {
                const obj = {
                    eleId: ele.id,
                    data: `${number}frame`,
                    editor: false,
                    readOnly: true,
                    renderer: (hotInstance, TD, row, col, prop, value, cellProperties) => {
                        if (prop.indexOf('frame') > -1) {
                            const srcArr = value.split('|')
                            const svgSrc = host.file + srcArr[0]
                            const size = 32
                            let imageSrc = ''
                            if (srcArr.length > 1) {
                                imageSrc = Vue.filter('qiniuZoom')(host.file + srcArr[1], size)
                            }
                            Promise.all([loader.svg(svgSrc), (imageSrc === '' ? Promise.resolve('') : imgToBase64(imageSrc))]).then(([$svgTemp, url]) => {
                                url = url === '' ? this.defaultSvgBgImgBase64Str : url
                                const width = parseFloat($svgTemp.attr('width'))
                                const height = parseFloat($svgTemp.attr('height'))
                                let image = `<image width='${width}'  xlink:href='${url}'/>`
                                if (width < height) {
                                    image = `<image height='${height}'  xlink:href='${url}'/>`
                                }
                                const d = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
                                d.css({
                                    left: '', // 清除多余的样式
                                    top: '',
                                    transform: '',
                                    zIndex: '',
                                    verticalAlign: 'top',
                                    boxSizing: 'content-box',
                                    height: `${size}px`,
                                    width: `${size}px`
                                }).attr({
                                    height: `${height}px`,
                                    width: `${height}px`,
                                    viewBox: `0 0 ${width} ${height}`,
                                    preserveAspectRatio: 'none'
                                })
                                    .innerHTML = `<g>
                                                      <defs>
                                                          <clipPath  id="${svgSrc}">
                                                            ${$svgTemp.innerHTML}
                                                          </clipPath>
                                                      </defs>
                                                      <g  style="clip-path:url(#${svgSrc})">
                                                          ${image}
                                                      </g>
                                                  </g>`
                                if (j === 0) {
                                    TD.css({
                                        borderLeft: 'none',
                                        textAlign: 'center'
                                    })
                                }
                                Handsontable.dom.addEvent(d, 'dblclick', (event) => {
                                    this.currentRow = row
                                    this.currentCol = col
                                    this.currentKey = prop
                                    event.preventDefault()
                                    this.createInput().click()
                                })
                                Handsontable.dom.empty(TD)
                                TD.appendChild(d)
                            })
                        }
                    }
                }
                let imageSrc = ''
                if (ele.property.frames && Object.keys(ele.property.frames).length > 0) {
                    const imgItem = ele.property.frames[0]
                    imageSrc = '|'
                    imageSrc += imgItem.src + `?imageMogr2/auto-orient/crop/!${imgItem.crop.width}x${imgItem.crop.height}a${imgItem.crop.left}a${imgItem.crop.top}`
                }
                this.settings.data[i][`${number}frame`] = ele.property.src + imageSrc
                this.settings.columns.splice(j + 1, 1, obj)
            } else if (ele.type === elementType.image) {
                const obj = {
                    eleId: ele.id,
                    data: `${number}img`,
                    editor: false,
                    readOnly: true,
                    renderer: (hotInstance, TD, row, col, prop, value, cellProperties) => {
                        if (prop.indexOf('img') > -1) {
                            const d = document.createElement('div')
                            d.css({
                                height: '32px',
                                width: '32px',
                                background: `${this.getbackgroundImage(value)} no-repeat center/contain`
                            })
                            if (j === 0) {
                                TD.css({
                                    borderLeft: 'none',
                                    textAlign: 'center'
                                })
                            }
                            Handsontable.dom.addEvent(d, 'dblclick', (event) => {
                                this.currentRow = row
                                this.currentCol = col
                                this.currentKey = prop
                                event.preventDefault()
                                this.createInput().click()
                            })
                            Handsontable.dom.empty(TD)
                            TD.appendChild(d)
                        }
                    }
                }
                this.settings.data[i][`${number}img`] = ele.property.src
                this.settings.columns.splice(j + 1, 1, obj)
            } else if (ele.type === elementType.qrcode) {
                const obj = {
                    eleId: ele.id,
                    data: `${number}qrcode`,
                    editor: false,
                    readOnly: true,
                    renderer: (hotInstance, TD, row, col, prop, value, cellProperties) => {
                        TD.style.padding = '5px'
                        const d = document.createElement('div')
                        d.css({
                            height: '32px',
                            width: '32px',
                            marginLeft: '4px'
                        })
                        d.className = 'qrcode-div'
                        Handsontable.dom.addEvent(d, 'dblclick', (event) => {
                            this.qrcodeName = prop
                            this.currentRow = row
                            this.currentCol = col
                            this.editQrcode = true
                            this.qrcodeText = value
                            this.$refs.qrcodeDialog.css({
                                left: `${event.clientX - 125}px`,
                                top: `${event.clientY - 155}px`
                            })
                            if (parseFloat(this.$refs.qrcodeDialog.style.top) <= 0) {
                                this.$refs.qrcodeDialog.css({
                                    left: `${event.clientX + 35}px`,
                                    top: `${event.clientY - 60}px`
                                })
                                this.arrowDownOrLeft = false
                            } else {
                                this.arrowDownOrLeft = true
                            }
                        })
                        Handsontable.dom.empty(TD)
                        TD.appendChild(d)
                    }
                }
                this.settings.data[i][`${number}qrcode`] = ele.property.text
                this.settings.columns.splice(j + 1, 1, obj)
            }
        },
        initPerRowData(elePerRow, i) {
            let number = 0
            for (let j = 0; j < elePerRow.length; j++) {
                const ele = elePerRow[j]
                const that = this
                // eslint-disable-next-line no-unused-vars
                const b = (function (j) {
                    ++number
                    that.setSettingsData(number, ele, i, j)
                })(j)
            }
        },
        initData() {
            for (let i = 0; i < this.data.value; i++) {
                this.eleArr.push(JSON.parse(JSON.stringify(this.data.eleArr)))
                const elePerRow = this.eleArr[i]

                this.settings.data[i] = { checkRow: false }
                const that = this
                // eslint-disable-next-line no-unused-vars
                const a = (function (i) {
                    that.initPerRowData(elePerRow, i)
                })(i)
            }
            this.originalData = JSON.parse(JSON.stringify(this.settings.data))
            this.settings.columns.forEach((ele, i) => {
                this.deleArr.push({
                    pre: '',
                    isAdded: false,
                    element: ele
                })
            })
            this.deleArr.forEach((ele, i) => {
                if (i === 0) {
                    ele.pre = ''
                } else {
                    ele.pre = this.deleArr[i - 1].element.data
                }
            })

            this.defaultData = JSON.parse(JSON.stringify(this.settings))
            this.getTitles()
            this.defaultObjKeys = []
            for (const key in this.defaultData.data[0]) {
                this.defaultObjKeys.push({
                    type: key,
                    value: this.defaultData.data[0][key],
                    check: false,
                    typeNumber: 0
                })
            }
            this.defaultObjKeys.forEach((item, index) => {
                if (item.type.indexOf('text') !== -1) {
                    this.deleArr[index].isAdded = true
                    item.check = true
                    item.typeNumber = 1
                } else if (item.type.indexOf('img') !== -1) {
                    item.typeNumber = 2
                    this.deleArr[index].isAdded = false
                } else if (item.type.indexOf('qrcode') !== -1) {
                    item.typeNumber = 3
                    this.deleArr[index].isAdded = false
                } else if (item.type.indexOf('frame') !== -1) {
                    item.typeNumber = 4
                    this.deleArr[index].isAdded = false
                } else {
                    item.typeNumber = 5
                    item.check = true
                    this.deleArr[index].isAdded = true
                }
                if (!item.check) {
                    this.settings.data.forEach((obj, i) => {
                        delete obj[item.type]
                    })

                    const col = this.settings.columns
                    for (let i = col.length - 1; i >= 0; i--) {
                        if (col[i].data === item.type) {
                            col.splice(i, 1)
                        }
                    }
                }
            })

            this.hot = new Handsontable(this.$refs.hotT, this.settings)
        },
        getFramePreviewHtml(pItem) {
            const srcArr = pItem.value.split('|')
            const svgSrc = host.file + srcArr[0]
            const size = 32
            let imageSrc = ''
            if (srcArr.length > 1) {
                imageSrc = Vue.filter('qiniuZoom')(host.file + srcArr[1], size)
            }
            Promise.all([loader.svg(svgSrc), (imageSrc === '' ? Promise.resolve('') : imgToBase64(imageSrc))]).then(([$svgTemp, url]) => {
                url = url === '' ? this.defaultSvgBgImgBase64Str : url
                const width = parseFloat($svgTemp.attr('width'))
                const height = parseFloat($svgTemp.attr('height'))
                let image = `<image width='${width}'  xlink:href='${url}'/>`
                if (width < height) {
                    image = `<image height='${height}'  xlink:href='${url}'/>`
                }
                const d = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
                d.css({
                    left: '', // 清除多余的样式
                    top: '',
                    transform: '',
                    zIndex: '',
                    verticalAlign: 'top',
                    boxSizing: 'content-box',
                    height: `${size}px`,
                    width: `${size}px`
                }).attr({
                    height: `${height}px`,
                    width: `${height}px`,
                    viewBox: `0 0 ${width} ${height}`,
                    preserveAspectRatio: 'none'
                })
                    .innerHTML = `<g>
                                      <defs>
                                          <clipPath  id="${svgSrc}">
                                            ${$svgTemp.innerHTML}
                                          </clipPath>
                                      </defs>
                                      <g  style="clip-path:url(#${svgSrc})">
                                          ${image}
                                      </g>
                                  </g>`
                const $fr = document.querySelector('#frame_' + pItem.type)
                if ($fr) {
                    $fr.innerHTML = ''
                    $fr.append(d)
                }
            })
        },
        // 选择组件
        componentBeChecked(item, index) {
            item.check = !item.check
            if (!item.check) {
                this.settings.data.forEach((obj, i) => {
                    delete obj[item.type]
                })
                const col = this.settings.columns
                for (let i = col.length - 1; i >= 0; i--) {
                    if (col[i].data === item.type) {
                        this.deleArr[i].isAdded = false
                        col.splice(i, 1)
                    }
                }
            } else {
                this.settings.data.forEach((obj, i) => {
                    obj[item.type] = item.value
                })
                const col = this.deleArr
                col.forEach((ele, index) => {
                    if (ele.element.data === item.type) {
                        this.deleArr.forEach((elem, inde) => {
                            if (elem.element.data === ele.pre) {
                                ele.isAdded = true
                                let a = 0
                                for (let i = 0; i <= inde; i++) {
                                    if (!this.deleArr[i].isAdded) {
                                        a++
                                    }
                                }
                                this.settings.columns.splice(inde - a + 1, 0, ele.element)
                            }
                        })
                    }
                })
            }
            this.hot.updateSettings(this.settings)
        },
        createInput() {
            const $input = document.createElement('input')
            $input.addEventListener('change', () => {
                this.uploadOptions.files = Array.from($input.files)
                const fLen = this.uploadOptions.files.length
                if (fLen > this.maxRowNumber) {
                    this.notifier.fail('一次上传不能超过20张')
                } else {
                    this.uploadFile(this.uploadOptions)
                }
            })
            $input.attr({
                type: 'file',
                accept: 'image/png, image/jpeg',
                multiple: ''
            })
            return $input
        },
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
        getbackgroundImage(src) {
            src = Vue.filter('qiniuZoom')(src, 35)
            const res = Vue.filter('backgroundImage')(src)
            return res
        },
        // 批量生成
        create() {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.BC,
                statistic.opt_label.BC.gen])

            this.creating = true
            this.loading.open('生成中，请稍等')
            this.checkArr = []
            let dataArr = []
            const data = JSON.parse(JSON.stringify(this.settings.data))
            let cols = JSON.parse(JSON.stringify(this.settings.columns))
            const colsObj = {}
            cols.filter((v, i) => {
                if (v.data && v.eleId) {
                    colsObj[v.data] = v.eleId
                }
            })
            cols = null
            const submitData = []
            const copyData = data.map((item, index) => {
                let arr = []
                for (const key in item) {
                    arr.push({
                        name: key,
                        value: item[key]
                    })
                }
                arr.splice(0, 1)
                arr = arr.sort((a, b) => {
                    return parseFloat(a.name) - parseFloat(b.name)
                })
                return arr
            })
            copyData.forEach((item, index) => {
                const obj = {}
                item.forEach(ele => {
                    obj[ele.name] = ele.value
                })
                obj.checkRow = this.settings.data[index].checkRow
                dataArr.push(obj)
            })
            dataArr = dataArr.map((item, index) => {
                const o = this.defaultData.data[index]
                let copyO = {}
                if (o) {
                    copyO = JSON.parse(JSON.stringify(o))
                }
                const obj = Object.assign(copyO, item)
                return obj
            })

            // 格式化数据
            dataArr.forEach((item, index) => {
                if (item.checkRow) {
                    const subPageJson = JSON.parse(JSON.stringify(this.data.pageJson))
                    if (this.newTitle !== '' && this.pageOrPro) {
                        subPageJson.title = this.settings.data[index][this.titleKey]
                    }
                    subPageJson.elements = subPageJson.elements.map((ele, i) => {
                        const obj = JSON.parse(JSON.stringify(ele))

                        if (ele.type === elementType.text) {
                            for (const key in item) {
                                if (key.indexOf('text') !== -1 && ele.id === colsObj[key]) {
                                    obj.property.content = item[key].replace(/\r?\n/g, '<br>').replace(/\s/g, '&nbsp;')
                                    delete item[key]
                                    break
                                }
                            }
                        } else if (ele.type === elementType.image) {
                            for (const key in item) {
                                if (key.indexOf('img') !== -1 && ele.id === colsObj[key]) {
                                    obj.property.src = item[key]
                                    delete item[key]
                                    break
                                }
                            }
                        } else if (ele.type === elementType.qrcode) {
                            for (const key in item) {
                                if (key.indexOf('qrcode') !== -1 && ele.id === colsObj[key]) {
                                    obj.property.text = item[key]
                                    delete item[key]
                                    break
                                }
                            }
                        } else if (ele.type === elementType.frame) {
                            for (const key in item) {
                                if (key.indexOf('frame') !== -1 && ele.id === colsObj[key]) {
                                    const str = item[key]
                                    // 获取名称
                                    const name = (/[|]\w*[?]/.exec(str) + '').replace('|', '').replace('?', '')
                                    if (name !== 'null') {
                                        if (!obj.property.frames) {
                                            obj.property.frames = {
                                                0: {
                                                    src: '',
                                                    crop: {}
                                                }
                                            }
                                        }
                                        obj.property.frames['0'].src = name
                                        // 获取宽高左右信息
                                        let whltStr = /!\d{0,4}x\d{0,4}a\d{0,4}a\d{0,4}$/.exec(str)
                                        whltStr += ''
                                        whltStr = whltStr.replace('!', '')
                                        whltStr = whltStr.replace('x', '|')
                                        whltStr = whltStr.replace(/a/g, '|')
                                        const whltArr = whltStr.split('|')
                                        if (whltArr && Number(whltArr[0]) && Number(whltArr[1]) && Number(whltArr[2]) && Number(whltArr[3])) {
                                            obj.property.frames['0'].crop = {
                                                width: parseInt(whltArr[0]),
                                                height: parseInt(whltArr[1]),
                                                left: parseInt(whltArr[2]),
                                                top: parseInt(whltArr[3])
                                            }
                                        }
                                    }
                                    delete item[key]
                                    break
                                }
                            }
                        }
                        return obj
                    })
                    submitData.push(subPageJson)
                }
            })
            // 生成新作品
            if (this.pageOrPro) {
                const items = []
                const promise = new Promise((resolve, reject) => {
                    submitData.forEach((item, index) => {
                        item.id = 1
                        item.sort = 1
                        const eqxPage = new EqxPage(item, this.eqxScene)
                        const p1 = eqxPage.page2Canvas()
                        const p2 = this.api.file.getUploadToken()
                        Promise.all([p1, p2])
                            .then(([canvas, token]) => this.api.file.uploadBase64(canvas.toDataURL().split(',')[1], token))
                            .then(res => {
                                item.cover = res.data.key
                                items.push(item)
                                if (items.length === submitData.length) {
                                    resolve(items)
                                }
                            })
                            .catch(err => reject(err))
                    })
                })
                promise
                    .then(items => {
                        items.map((v, i) => {
                            v.centerId = Vue.store.state.product.centerId
                        })
                        this.api.scene.massProduction(items)
                    })
                    .then(() => {
                        this.loading.close()
                        this.close({ go: true })
                        this.creating = false
                    })
                    .catch(err => {
                        this.loading.close()
                        this.creating = false
                        err && this.logger.error(err)
                    })
            } else {
                // 生成新页面
                const items = []
                const promise = new Promise((resolve, reject) => {
                    submitData.forEach((item, index) => {
                        item.id = this.pageId
                        item.sort = this.pageSort
                        const eqxPage = new EqxPage(item, this.eqxScene)
                        this.eqxScene.addPage(eqxPage, true)
                        const p1 = eqxPage.page2Canvas()
                        const p2 = this.api.file.getUploadToken()
                        Promise.all([p1, p2])
                            .then(([canvas, token]) => this.api.file.uploadBase64(canvas.toDataURL().split(',')[1], token))
                            .then(res => {
                                item.cover = res.data.key
                                items.push(item)
                                if (items.length === submitData.length) {
                                    resolve(items)
                                }
                            })
                            .catch(err => reject(err))
                    })
                })
                promise
                    .then(items => this.api.page.batchSave(items))
                    .then(() => {
                        this.loading.close()
                        this.close()
                        this.creating = false
                    })
                    .catch(err => {
                        this.loading.close()
                        this.creating = false
                        err && this.logger.error(err)
                    })
            }
        },
        // 删除
        eleDelete() {
            const data = this.settings.data
            for (let i = data.length - 1; i >= 0; i--) {
                if (data[i].checkRow) {
                    this.hot.alter('remove_row', i)
                    if (this.settings.data.length === 0) {
                        this.selAll = false
                        this.$refs.inp.checked = false
                    }
                }
            }
            this.checkArr = []
        },
        // 添加
        eleAdd() {
            this.addDialogShow = true
            this.addCount = null
        },
        // 确认添加
        addConfirm() {
            this.addDialogShow = false
            this.selAll = false
            const totalCount = this.addCount + this.settings.data.length
            if (totalCount > this.maxRowNumber) {
                this.notifier.info('单次最多生成20个')
            } else {
                for (let i = 0; i < this.addCount; i++) {
                    this.settings.data.push(JSON.parse(JSON.stringify(this.defaultData.data[0])))
                }
                this.hot.updateSettings({
                    data: this.settings.data
                })
            }
        },
        // 选择标题
        chooseTitleTag(i) {
            this.newTitle = i.name
            this.isNewPage = false
            this.titleKey = i.tagId
        },
        // 生成标题或者页面
        chooseTag(v) {
            this.pageOrPro = v === 'newPro'
            this.newTitle = (this.pageOrPro ? this.newTitle : '选择一列为新作品标题')
        },
        // 选择组件类型
        chooseType(e) {
            this.componentType = e.name
            this.selectComponent = false
            this.type = e.type
        },
        // 获取titletags
        getTitles() {
            const obj = this.settings.data[0]
            for (const key in obj) {
                if (key.indexOf('text') !== -1) {
                    this.titleTags.push({
                        tagId: key,
                        name: obj[key].replace(/&nbsp;/g, ' ').replace(/<br>/g, '\n')
                    })
                }
            }
        },
        // 全选
        selectAll() {
            this.selAll = !this.selAll
            if (!this.selAll) {
                this.checkArr = []
                this.settings.data.forEach(item => {
                    item.checkRow = false
                })
            } else {
                this.checkArr = []
                this.settings.data.forEach(item => {
                    this.checkArr.push('check')
                    item.checkRow = true
                })
            }
            this.hot.loadData(this.settings.data)
        },
        onFilesAdded() {
            this.loading.open('替换中，请稍等')
        },
        onError() {
            this.loading.close()
        },
        onFileUploaded(res, isEnd) {
            this.pictureArr.push(res)
            if (isEnd) {
                this.loading.close()
                let pLen = this.pictureArr.length
                const sLen = this.settings.data.length
                if ((this.currentRow + pLen) > this.maxRowNumber) {
                    const maxCanAddRow = this.maxRowNumber - this.currentRow
                    this.pictureArr = this.pictureArr.splice(0, maxCanAddRow)
                    pLen = maxCanAddRow
                }
                const data = JSON.parse(JSON.stringify(this.settings.data))
                if ((this.currentRow + pLen) > sLen) {
                    const beAddedCount = this.currentRow + pLen - sLen
                    for (let i = 0; i < beAddedCount; i++) {
                        const arrElement = JSON.parse(JSON.stringify(this.defaultData.data[0]))
                        data.push(arrElement)
                    }
                    // 如果有新增行设置全选按钮为不选中
                    this.selAll = false
                    this.$refs.inp.checked = false
                }
                for (let i = this.currentRow, j = 0; i < data.length && j < this.pictureArr.length; i++, j++) {
                    if (this.currentKey.indexOf('frame') >= 0) {
                        let str = data[i][this.currentKey]
                        const pattern1 = /[|]+(\w*[/])*\w*[.]?[\w]{3,4}[?]/
                        const pattern2 = /(\w*[/])*\w*[.]?[\w]{3,4}/
                        const pattern3 = /!\d{0,4}x\d{0,4}a\d{0,4}a\d{0,4}$/
                        let nameStr = pattern1.exec(str)[0]
                        const size = this.pictureArr[j].w < this.pictureArr[j].h ? this.pictureArr[j].w : this.pictureArr[j].h
                        const left = this.pictureArr[j].w < this.pictureArr[j].h ? 0 : (this.pictureArr[j].w - this.pictureArr[j].h) / 2
                        const top = this.pictureArr[j].w < this.pictureArr[j].h ? (this.pictureArr[j].h - this.pictureArr[j].w) / 2 : 0
                        nameStr = nameStr.replace(pattern2, this.pictureArr[j].key)
                        str = str.replace(pattern1, nameStr)
                        str = str.replace(pattern3, `!${size}x${size}a${left}a${top}`)
                        data[i][this.currentKey] = str
                    } else {
                        data[i][this.currentKey] = this.pictureArr[j].key
                    }
                }
                this.settings.data = data
                this.hot.updateSettings(this.settings)
                // 重置状态
                this.pictureArr = []
                this.defaultData = JSON.parse(JSON.stringify(this.settings))
            }
        },
        qrcodeEditConfirm() {
            this.hot.setDataAtCell(this.currentRow, this.currentCol, this.qrcodeText)
        },
        editToAll() {
            this.setAll = true
            this.settings.data.forEach(item => {
                item[this.qrcodeName] = this.qrcodeText
            })
            this.hot.updateSettings({
                data: this.settings.data
            })
        }
    }
}
</script>
<style lang='scss'>
$width: calc(100% - 256px);
$height: calc(100% - 84px);
.eqc-base-checkbox {
    background: white;
}
.eqc-head-create {
    background: #ccd5db;
    .qrcode-dialog {
        padding: 14px 0;
        display: flex;
        position: absolute;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        left: 0px;
        top: 0px;
        width: 256px;
        height: 132px;
        background: #fff;
        box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
        border-radius: 4px;
        transition: all 0.5s;
        z-index: 110; // 为了盖住hadnsontable的纵向表头
        .qrcode-arrow-down,
        .qrcode-arrow-left {
            width: 5px;
            height: 5px;
            position: absolute;
        }
        .qrcode-arrow-down {
            bottom: -8px;
            left: 120px;
            border-width: 8px 8px 0px 8px;
            border-style: solid;
            border-color: white transparent transparent transparent;
        }
        .qrcode-arrow-left {
            border-width: 8px 8px 8px 0px;
            border-style: solid;
            border-color: transparent white transparent transparent;
            bottom: 60px;
            left: -8px;
        }
        .qrcode-btns {
            width: 200px;
            height: 36px;
            display: flex;
            justify-content: space-between;
        }
    }
    .qrcode-div {
        background: url("../../../../img/qrcode_fake.png") no-repeat center/contain;
    }
    .create-input {
        margin-left: 24px;
        border: 1px solid #ccd5db;
        border-radius: 3px;
        height: 36px;
        padding: 8px 20px 8px 12px;
        resize: none;
        overflow-x: hidden;
        &.w160 {
            width: 160px;
        }
        &.w200 {
            width: 200px;
        }
        &.m0 {
            margin: 0;
        }
        &.textareaFocus {
            border: 1px solid $blue-normal;
        }
    }
    .hot {
        text-align: center;
        td {
            padding: 0 10px;
            text-align: center;
            vertical-align: middle;
        }
        th {
            vertical-align: middle;
            .relative {
                vertical-align: middle;
                padding: 10px;
                line-height: 0px;
            }
        }
    }
    position: relative;
    .content {
        width: $width;
        height: $height;
        float: left;
        padding: 24px 24px 24px 24px;
        .table-content {
            width: 100%;
            height: 100%;
            position: relative;
            #hot-display-license-info {
                display: none;
            }
            .htCheckboxRendererInput {
                margin: 0;
            }
            .hot-table {
                height: 100%;
                width: 100%;
                overflow: hidden;
            }
        }
        .bottom {
            width: $width;
            height: 60px;
            position: absolute;
            bottom: 0;
            left: 0px;
            padding: 12px 24px;
            display: flex;
            justify-content: flex-start;
            background: white;
            border-top: 1px solid #ccd5db;
            .create-options {
                display: flex;
                justify-content: flex-start;
                .select-all-btn {
                    width: 76px;
                    height: 36px;
                    color: #666;
                    background: #fff;
                    border: 1px solid #ccd5db;
                    display: inline-flex;
                    align-items: center;
                    justify-content: space-around;
                    font-size: 14px;
                    border-radius: 3px;
                    cursor: pointer;
                    margin-right: 20px;
                }
                .delete {
                    height: 36px;
                }
                .exp {
                    display: flex;
                    margin-top: 5px;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    font-size: 17px;
                    color: #76838f;
                    transition: all 0.3s;
                    &:hover {
                        color: $blue-normal;
                    }
                }
                .create-add {
                    position: relative;
                    margin-left: 16px;
                    transition: all 0.9s;
                    .create-add-dialog {
                        padding: 14px 0;
                        display: flex;
                        position: absolute;
                        flex-direction: column;
                        align-items: center;
                        justify-content: space-around;
                        left: -72px;
                        top: -168px;
                        width: 216px;
                        height: 152px;
                        background: #fff;
                        box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
                        border-radius: 4px;
                        z-index: 110; // 为了盖住hadnsontable的纵向表头
                        .arrow-down {
                            width: 5px;
                            height: 5px;
                            border-left: 8px solid transparent;
                            border-right: 8px solid transparent;
                            border-top: 8px solid #fff;
                            position: absolute;
                            bottom: -8px;
                            left: 100px;
                        }
                        .dialog-btns {
                            width: 160px;
                            height: 36px;
                            display: flex;
                            justify-content: space-between;
                        }
                    }
                }
            }
        }
    }
    .bar {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        height: 100%;
        width: 256px;
        float: right;
        background: #eceef0;
        padding: 24px 24px 24px;
        position: relative;
        .create-top {
            width: 208px;
        }
        .rb-top {
            height: 36px;
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }
        .create-content {
            width: 100%;
            position: relative;
            .title {
                margin-top: 12px;
                margin-bottom: 8px;
                width: 100%;
                height: 20px;
                font-size: 14px;
                color: rgba(17, 17, 17, 1);
                line-height: 20px;
            }
            .content-box {
                background: #ffffff;
                padding: 12px 0 2px 0;
                border-radius: 3px;
                .component-type {
                    position: relative;
                    cursor: pointer;
                    background: white;
                    border-radius: 3px;
                    width: auto;
                    margin: 0 12px;
                    display: flex;
                    padding-left: 12px;
                    justify-content: space-between;
                    align-items: center;
                    height: 36px;
                    border: 1px solid #ccd5db;
                    .triangle {
                        display: block;
                        width: 36px;
                        height: 36px;
                        font-size: 20px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        transition: all 0.3s;
                    }
                }
                .component-list {
                    width: auto;
                    margin: 8px 4px 8px 12px;
                    height: 240px;
                    overflow-y: scroll;
                    font-size: 13px;
                    .component-li {
                        width: 100%;
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                        color: #2f3c4d;
                        height: 48px;
                        border-bottom: 1px solid #ccd5db;
                        cursor: pointer;
                        .component-value {
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                        .opt {
                            margin-right: 8px;
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;
                            transition: all 0.3s;
                            border: 1px solid #ccd5db;
                            &:hover {
                                color: $blue-normal;
                                border: 1px solid $blue-normal;
                            }
                            &.active {
                                border: 1px solid #1593ff;
                                background: #1593ff;
                                .icon {
                                    opacity: 1;
                                }
                            }
                        }
                        .component-img {
                            height: 36px;
                            width: 36px;
                        }
                        .component-frame {
                            height: 36px;
                            width: 36px;
                        }
                    }
                    .component-li:last-child {
                        border: none;
                    }
                    &::-webkit-scrollbar {
                        width: 8px;
                    }
                    &::-webkit-scrollbar-track {
                        background-color: #fff;
                    }
                    &::-webkit-scrollbar-thumb {
                        background-color: rgba(0, 0, 0, 0.2);
                        height: 80px;
                        border-radius: 4px;
                    }
                }
                .add-pages {
                    position: relative;
                    cursor: pointer;
                    background: white;
                    border-radius: 3px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    height: 47px;
                    padding-left: 12px;
                    width: auto;
                    // margin: -12px 12px 0 12px;
                    margin-top: -12px;
                    .triangle {
                        display: block;
                        width: 36px;
                        height: 36px;
                        font-size: 20px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        transition: all 0.3s;
                        &.roate {
                            transform: rotateZ(180deg);
                        }
                    }
                }
                .disabled {
                    color: #999;
                    background: #fff;
                    pointer-events: none;
                }
                .line {
                    width: 100%;
                    height: 1px;
                    background: #ccd5db;
                }
                .radio-box {
                    height: 47px;
                    display: flex;
                    flex-direction: row;
                    flex-wrap: nowrap;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 13px;
                    margin: 0 12px;
                }
            }
        }
        .create-bottom {
            width: 256px;
            height: 60px;
            position: absolute;
            bottom: 0;
            left: 0;
            .create-btn {
                width: 100%;
                height: 100%;
                border-radius: 0px;
                font-size: 13px;
            }
            .help-btn {
                position: absolute;
                top: calc(50% - 7px);
                left: calc(50% - 7px + 26px);
                color: #ffffff;
            }
        }
        .title {
            font-size: 18px;
            color: #111;
            font-weight: bold;
        }
        .close {
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
            &:hover {
                background: #ff2a6a;
            }
        }
    }
}
</style>
