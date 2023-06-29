<template>
    <div
        v-scroll-bar
        class="eqc-nav-text"
    >
        <base-search
            :model="search"
            :on-search="onSearch"
            model-key="keyWord"
            class="search-box"
        />
        <div
            v-show="search.status"
            class="search-result-head"
        >
            <div class="title">
                搜索结果（{{ info.list.length }}）
            </div>
            <div
                class="back"
                @click="searchBack"
            >
                返回<i class="icon eqf-right" />
            </div>
        </div>
        <div
            v-show="!search.status"
            class="header-area"
        >
            <div class="header-text">
                <div
                    v-for="item of list"
                    :key="item.text"
                    :style="[item.style]"
                    class="text"
                    @click="addText(item)"
                >
                    {{ item.text }}
                </div>
            </div>
            <div class="row2-text">
                <div
                    class="d3"
                    @click="addThreeDText(threeDText)"
                >
                    <div :style="threeDText.style">
                        {{ threeDText.text }}
                        <base-new
                            :css="{right: '-10px', top: '-4px'}"
                            :storage-key="storageLocalKey.new3DText"
                            storage-version="1"
                        />
                    </div>
                </div>
                <div
                    class="date"
                    @click="addDate(date)"
                >
                    <div :style="date.style">
                        {{ date.text }}
                    </div>
                </div>
            </div>
            <div>
                <ul class="category">
                    <li
                        v-for="item in categoryList"
                        :key="item.id"
                        :class="{active:chooseCategory === item.id}"
                        class="category-item"
                        @click="chooseCategoryTextClick(item.id)"
                    >
                        {{ item.name }}
                    </li>
                </ul>
            </div>
        </div>
        <div
            ref="wrap"
            v-scroll-bar="{onScrollMove}"
            :style="{height: search.status ? 'calc(100% - 116px)' : 'calc(100% - 298px)' }"
            class="nav-text-content"
        >
            <ul
                v-show="info.list.length"
                class="list"
            >
                <combine-item
                    v-for="item in info.list"
                    :key="item.id"
                    :item="item"
                />
                <base-list-status-infinite
                    v-if="info.isBusy || info.isEnd"
                    :is-busy="info.isBusy"
                    :is-end="info.isEnd"
                    :bg-color="`#fff`"
                    :style="baseListStatusInfiteStyle"
                />
            </ul>
            <base-list-status
                v-if="!info.list.length"
                :is-busy="info.isBusy"
                :is-empty="!info.isBusy && !info.list.length"
                :show-btn="true"
                :btn-name="`想要什么模版，告诉我们吧`"
                :url="'//h5.ebdan.net/ls/ehC4pE9T'"
                :btn-css="{width:'256px'}"
                msg-result="暂无模板"
            />
        </div>
        <div
            v-show="search.status && info.list.length === 0"
            ref="popularWrap"
            class="popular-content"
        >
            <p class="title">
                热门模版
            </p>
            <div class="content">
                <div
                    v-scroll-bar
                    class="list-box"
                >
                    <ul
                        class="list"
                    >
                        <combine-item
                            v-for="item in popular.list"
                            :key="item.id"
                            :item="item"
                        />
                    </ul>
                </div>
            </div>
        </div>
        <list-scroll-to-top
            :style="listScrollToTopStyle"
            :click="listScrollToTopClick"
            class="toTop"
        />
        <a
            class="feedback"
            href="//h5.ebdan.net/ls/ehC4pE9T"
            target="_blank"
        >没有想要的文字？</a>
    </div>
</template>

<script>
import elementType from '../../../../config/enum.element.type'
import textType from '../../../../config/enum.text.type'
import { host } from '../../../../config/env'
import storageLocal from '../../../../utils/storageLocal'
import CombineItem from './material/MaterialCombineItem.vue'
import ListScrollToTop from '../../../plugins/ListScrollToTop.vue'
import util from '../../../../utils/util'

export default {
    components: {
        CombineItem, ListScrollToTop
    },
    data() {
        return {
            search: {
                keyWord: '', // 搜索关键字
                status: false // 搜索状态
            },
            list: [{
                text: '标题',
                height: 60,
                property: {
                    fontstylename: '无样式',
                    type: textType.text,
                    dropShadow: {
                        color: 'rgba(0,0,0,0)',
                        x: 0,
                        y: 0,
                        blur: 0,
                        transparency: 100
                    },
                    angle: 45,
                    cube: [{ size: 0, color: '#FF2A6A' }],
                    stroke: {
                        size: 0,
                        color: '#5D61FF',
                        distance: 0
                    },
                    borderRadius: {
                        lt: true,
                        rt: true,
                        lb: true,
                        rb: true,
                        val: 0
                    }
                },
                css: {
                    fontSize: '34px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#000000'
                },
                style: {
                    fontSize: '18px',
                    color: '#000000',
                    fontWeight: 'bold'
                }
            }, {
                text: '副标题',
                height: 52,
                property: {
                    fontstylename: '无样式',
                    type: textType.text,
                    dropShadow: {
                        color: 'rgba(0,0,0,0)',
                        x: 0,
                        y: 0,
                        blur: 0,
                        transparency: 100
                    },
                    angle: 45,
                    cube: [{ size: 0, color: '#FF2A6A' }],
                    stroke: {
                        size: 0,
                        color: '#5D61FF',
                        distance: 0
                    },
                    borderRadius: {
                        lt: true,
                        rt: true,
                        lb: true,
                        rb: true,
                        val: 0
                    }
                },
                css: {
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#000000'
                },
                style: {
                    fontSize: '16px',
                    color: '#000000',
                    fontWeight: 'bold'
                }
            }, {
                text: '正文',
                height: 36,
                property: {
                    fontstylename: '无样式',
                    type: textType.text,
                    dropShadow: {
                        color: 'rgba(0,0,0,0)',
                        x: 0,
                        y: 0,
                        blur: 0,
                        transparency: 100
                    },
                    angle: 45,
                    cube: [{ size: 0, color: '#FF2A6A' }],
                    stroke: {
                        size: 0,
                        color: '#5D61FF',
                        distance: 0
                    },
                    borderRadius: {
                        lt: true,
                        rt: true,
                        lb: true,
                        rb: true,
                        val: 0
                    }
                },
                css: {
                    fontSize: '16px',
                    textAlign: 'center',
                    color: '#000000',
                    fontWeight: '400'
                },
                style: {
                    fontSize: '14px',
                    color: '#000000'
                }
            }],
            font: {
                list: []
            },
            chartletStyle: {
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                webkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
            },
            styleList: [],
            textType,
            preArt: '_pre_art',
            // 3D文字
            threeDText: {
                text: '3D立体字',
                property: {
                },
                css: {
                },
                style: {
                    fontSize: '14px',
                    textAlign: 'center',
                    color: '#000000'
                }
            },
            date: {
                text: '日期组件',
                property: {
                    fontstylename: '无样式',
                    type: textType.text,
                    dropShadow: {
                        color: 'rgba(0,0,0,0)',
                        x: 0,
                        y: 0,
                        blur: 0,
                        transparency: 100
                    },
                    angle: 45,
                    cube: [{ size: 0, color: '#FF2A6A' }],
                    stroke: {
                        size: 0,
                        color: '#5D61FF',
                        distance: 0
                    },
                    borderRadius: {
                        lt: true,
                        rt: true,
                        lb: true,
                        rb: true,
                        val: 0
                    }
                },
                css: {
                    fontSize: '18px',
                    textAlign: 'center',
                    color: '#000000'
                },
                style: {
                    fontSize: '14px',
                    textAlign: 'center',
                    color: '#000000'
                }
            },
            contentArr: [],
            isScroll: false, // 是不是滚动过
            key: '', // 加载列表用的key
            combineTextId: 893911, // 组合字二级分类id
            info: {
                list: []
            },
            popular: {
                list: []
            },
            chooseCategory: 0,
            baseListStatusInfiteStyle: {
                background: 'white',
                bottom: '20px',
                '.text': {
                    background: 'white'
                }
            }
        }
    },
    computed: {
        eqxPage() {
            return this.$store.state.scene.eqxPage
        },
        storageLocalKey() {
            return storageLocal.key
        },
        // 返回顶部样式
        listScrollToTopStyle() {
            if (this.isScroll) {
                return {
                    transform: 'translate(0,-60px)'
                }
            }
            return {}
        },
        showComponentWarning() {
            return this.user.allow('showComponentWarning')
        }
    },
    watch: {
        'info.list': {
            handler(newVal) {
                if (this.search.status && newVal.length === 0) {
                    this.chooseCategoryTextClick(this.combineTextId, true)
                }
            }
        }
    },
    created() {
        this.getProductsFont()
        this.getTextCategory() // 得到分类
    },
    methods: {
        getProductsFont() {
            this.api.product.getNewProducts({ apiCode: Vue.env.mall.apiCode[1], categoryId: Vue.env.mall.fontId, pageSize: 100, pageNo: 1 })
                .then(res => {
                    const id = 'style_font'
                    const styles = []
                    const fonts = this.font.list
                    fonts.length = 1
                    res.data.list.forEach(item => {
                        const font = {
                            name: item.name,
                            fontFamily: item.productTypeMap.font_family + '_pre',
                            fontFamilyReal: item.productTypeMap.font_family,
                            src: item.productTypeMap.woff_path
                        }
                        fonts.push(font)
                        styles.push(`@font-face{font-family: "${font.fontFamily}";src: url(${this.env.host.font}/store/fonts/${font.fontFamilyReal}.woff?text=${encodeURIComponent(font.name)}) format("woff")}\r\n`)
                    })

                    if (!document.querySelector('#' + id)) {
                        const $style = document.createElement('style')
                        $style.id = id
                        $style.innerHTML = styles.join('')
                        document.head.appendChild($style)
                    }
                })
                .catch(err => err && this.logger.error(err))
        },
        getTextCategory() {
            // 获得组合字的分类 组合字的id为893911
            const { materialId } = Vue.env.mall
            this.categoryList = []
            Vue.api.product.getCategoryListByTopId(materialId)
                .then(res => {
                    if (res && res.length > 0) {
                        res.map(categoryItem => {
                            if (categoryItem.id === this.combineTextId) {
                                this.categoryList = JSON.parse(JSON.stringify(categoryItem.list))
                                this.categoryList.unshift({
                                    id: this.combineTextId,
                                    name: '全部'
                                })
                                // 默认展示全部的内容
                                this.chooseCategoryTextClick(this.combineTextId)
                            }
                        })
                    }
                })
                .catch(err => err)
        },
        addText(item) {
            item = JSON.parse(JSON.stringify(item))
            const src = this.chooseFont(item)
            const scale = this.eqxPage.scale
            const padding = 4 / scale
            const fontSize = parseInt(item.css.fontSize || 36) / scale
            const lineHeigt = 1.2
            const width = 280 / scale
            const height = fontSize * lineHeigt
            const { left, top } = this.eqxPage.getElementPosOfCenter(width + padding * 2, height + padding * 2, scale)
            if (src) {
                item.property.src = src
            }
            if (item.property.shadow) {
                item.property.shadow.h = Math.round(item.property.shadow.h / scale)
                item.property.shadow.v = Math.round(item.property.shadow.v / scale)
                item.property.shadow.blur = Math.round(item.property.shadow.blur / scale)
            }
            if (item.property.cube) {
                item.property.cube[0].size = Math.round(item.property.cube[0].size / scale)
            }
            if (item.property.shake) {
                item.property.shake.size = Math.round(item.property.shake.size / scale)
            }
            if (item.property.stroke) {
                item.property.stroke.size = Math.round(item.property.stroke.size / scale)
            }
            if (item.property.type === textType.chartlet) { Vue.notifier.info('拖拽素材库图片到文字上替换贴图') }
            const elementJson = {
                type: elementType.text,
                property: {
                    content: '双击进行编辑'
                },
                css: {
                    left: Math.round(left) + 'px',
                    top: Math.round(top) + 'px',
                    width: Math.round(width) + 'px',
                    height: Math.round(height) + 'px',
                    padding: Math.round(padding) + 'px',
                    border: '1px solid transparent'
                }
            }
            if (item.css.fontFamily) {
                item.css.fontFamily = item.css.fontFamily.replace(this.preArt, '')
            }
            Object.assign(elementJson.css, item.css, { fontSize: Math.round(fontSize) + 'px' })
            Object.assign(elementJson.property, item.property)
            this.eqxPage.addElement(elementJson)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        chooseFont(item) {
            const fontList = this.font.list
            let src = ''
            for (let i = 0; i < fontList.length; i++) {
                if (fontList[i] && fontList[i].fontFamily === item.css.fontFamily) {
                    if (fontList[i].src && !document.querySelector('#' + fontList[i].fontFamilyReal)) {
                        src = fontList[i].src
                        const $style = document.createElement('style')
                        $style.id = fontList[i].fontFamilyReal
                        $style.innerHTML = `@font-face{font-family: "${fontList[i].fontFamilyReal}";src: url(${host.file + fontList[i].src}) format("woff")}\r\n`
                        document.head.appendChild($style)
                    }
                }
            }
            return src
        },
        // 添加3D立体字
        addThreeDText(item) {
            // 判断是否允许粘贴
            if (util.getElementCountByTypeOnPage(elementType.textThreeD) >= 5) {
                Vue.notifier.warn('最多可添加5个3D立体字', 5)
                return
            }
            item = JSON.parse(JSON.stringify(item))
            const scale = this.eqxPage.scale
            const { left, top } = this.eqxPage.getElementPosOfCenter(356, 74, scale)
            const elementJson = {
                type: elementType.textThreeD,
                property: {
                    // 文字内容
                    textContent: '双击进行编辑',
                    // 字体大小，默认值为100。
                    textFontSize: 60,
                    // 挤出文本的厚度。默认值为50。
                    textHeight: 40,
                    // （表示文本的）曲线上点的数量。默认值为12
                    textCurveSegments: 12,
                    // 字体信息
                    textFont: {
                        // 字体名称
                        name: '默认字体',
                        src: 'PangMenZhengDao_Regular.json'
                    },
                    // 1 纯色 2 渐变 3贴图
                    textStyleType: 1,
                    // 1 文字颜色
                    textColor: '#ffffff',
                    // 2 文字渐变
                    textGradient: {
                        colors: { 0: '#5D61FF', 1: '#FF15F5' }, // 颜色
                        angle: 0// 角度
                    },
                    // 3 贴图
                    textTexture: {
                        cover: '1', // 贴图的key
                        size: 50, // 尺寸
                        offsetX: 0, // 水平偏移
                        offsetY: 0, // 竖直偏移
                        angle: 0 // 角度
                    },
                    // 文字投影颜色
                    textShadowColor: '#000000',
                    // 对齐方式
                    textAlign: 'center',
                    // 字间距
                    letterSpacing: 10,
                    // 行间距
                    lineHeight: 10,
                    // 文本上斜角的深度，默认值为20。
                    bevelThickness: 8,
                    // 斜角与原始文本轮廓之间的延伸距离。默认值为8。
                    bevelSize: 0,
                    // 斜角的分段数。默认值为3。
                    bevelSegments: 8,
                    // 斜角偏移量
                    bevelOffset: 0,
                    // 相机位置
                    cameraPosition: {
                        fov: 40.96094260402277,
                        x: -360.4104544426249,
                        y: 320.48641228407917,
                        z: 574.3629199989675
                    },
                    // 画布样式
                    canvasStyle: {
                        // 宽度
                        width: 400,
                        // 高度
                        height: 400,
                        // 左边距
                        marginLeft: '0px',
                        // 上边距
                        marginTop: '0px'
                    }
                },
                css: {
                    left: `${Math.round(left)}px`,
                    top: `${Math.round(top)}px`,
                    width: `${Math.round(381)}px`,
                    height: `${Math.round(75)}px`,
                    padding: '0px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: Vue.env.debug3DText ? 'visible' : 'hidden'
                }
            }
            Object.assign(elementJson.css, item.css)
            Object.assign(elementJson.property, item.property)
            if (this.showComponentWarning) {
                Vue.notifier.warn('APP和小程序无法支持3D立体字', 8)
            }
            this.eqxPage.addElement(elementJson)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        addDate(item) {
            item = JSON.parse(JSON.stringify(item))
            const src = this.chooseFont(item)
            const scale = this.eqxPage.scale
            const padding = 4 / scale
            const fontSize = parseInt(item.css.fontSize || 36) / scale
            const lineHeigt = 1.2
            const width = 280 / scale
            const height = fontSize * lineHeigt
            const { left, top } = this.eqxPage.getElementPosOfCenter(width + padding * 2, height + padding * 2, scale)
            if (src) {
                item.property.src = src
            }
            const elementJson = {
                type: elementType.date,
                property: {
                    content: '+yyyy-+mm-+dd'
                },
                css: {
                    left: Math.round(left) + 'px',
                    top: Math.round(top) + 'px',
                    width: Math.round(width) + 'px',
                    height: Math.round(height) + 'px',
                    padding: Math.round(padding) + 'px'
                }
            }
            if (item.css.fontFamily) {
                item.css.fontFamily = item.css.fontFamily.replace(this.preArt, '')
            }
            Object.assign(elementJson.css, item.css, { fontSize: Math.round(fontSize) + 'px' })
            Object.assign(elementJson.property, item.property)
            this.eqxPage.addElement(elementJson)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        chooseCategoryTextClick(categoryId, isPopular = false) {
            // 设置下拉加载key
            const params = {
                keyWord: this.search.keyWord,
                categoryId,
                sortBy: 'sort',
                tab: 'sys',
                apiCode: Vue.env.mall.apiCode[2]
            }
            this.chooseCategory = categoryId

            if (isPopular) {
                this.key = Vue.infiniteScroll.setKey(Object.assign({}, params, { keyWord: '' }))
                this.popular = Vue.infiniteScroll.getInfo(this.key)
                if (!this.popular.list.length) {
                    this.getNextPage()
                }
            } else {
                this.key = Vue.infiniteScroll.setKey(params)
                this.info = Vue.infiniteScroll.getInfo(this.key)
                if (!this.info.list.length) {
                    this.getNextPage()
                }
            }
        },
        getBackgroundImage(src) {
            src = this.getQiniuImage(src)
            return Vue.filter('backgroundImage')(src)
        },
        getQiniuImage(src) {
            return Vue.filter('qiniuZoom')(src, this.thumbSize)
        },
        onScrollMove(e, info) {
            if (info.scrollY + 100 > info.maxScrollY) {
                this.isScroll = true
                this.getNextPage()
            }
            if (info.scrollY === 0) {
                this.isScroll = false
            }
        },
        getNextPage() {
            Vue.infiniteScroll.getMoreItems(this.key)
                .catch(err => err && this.logger.error(err))
        },
        // 返回顶部点击回调
        listScrollToTopClick() {
            this.isScroll = false
            this.$refs.wrap.myScroll.scrollToTop()
        },
        // 搜索
        onSearch() {
            if (this.search.keyWord === '') {
                this.search.status = false
            } else {
                this.search.status = true
            }
            this.chooseCategoryTextClick(this.combineTextId)
        },
        // 搜索结果返回
        searchBack() {
            this.search.keyWord = ''
            this.search.status = false
            this.chooseCategoryTextClick(this.combineTextId)
        }
    }
}
</script>

<style lang="scss">
.eqc-nav-text {
    background: white;
    .search-result-head {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: space-between;
        margin: 16px;
        .title {
            color: rgba(17, 17, 17, 1);
            font-size: 13px;
            font-weight: 400;
            line-height: 18px;
        }
        .back {
            font-size: 12px;
            font-weight: 400;
            color: rgba(118, 131, 143, 1);
            line-height: 16px;
            cursor: pointer;
        }
    }

    .header-area {
        margin: 12px 16px 0 16px;
        .header-text {
            display: flex;
            div {
                height: 36px;
                width: 80px;
                border: 1px solid rgba(204, 213, 219, 1);
                border-radius: 3px;
            }
        }
        .header-text div:not(:first-child) {
            margin-left: 8px;
        }
        .text {
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            cursor: pointer;
            &:hover {
                box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.16);
            }
        }
        .row2-text {
            display: flex;
            justify-content: space-between;
            .d3,
            .date {
                border: 1px solid rgba(204, 213, 219, 1);
                height: 36px;
                width: 124px;
                display: flex;
                flex-direction: column;
                flex-wrap: nowrap;
                justify-content: center;
                align-items: center;
                margin-top: 10px;
                transition: all 0.3s;
                border-radius: 3px;
                font-weight: 400;
                cursor: pointer;
                &:hover {
                    box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.16);
                }
                div {
                    position: relative;
                }
            }
        }
        .category {
            display: flex;
            flex-wrap: wrap;
            margin-top: 4px;
            .category-item {
                width: 64px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #000000;
                font-size: 13px;
                transition: all 0.3s;
                border-bottom: 1px solid transparent;
                cursor: pointer;
                position: relative;
                transition: 0.2s all linear;
                list-style: none;
                &:hover {
                    color: #1593ff;
                }
                &.active {
                    color: #1593ff;
                    border-bottom: 1px solid #1593ff;
                }
            }
        }
    }

    .nav-text-content {
        position: relative;
        padding: 0 16px;
        .list {
            position: relative;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            padding-bottom: 61px;
            margin-top: 16px;
        }
    }

    .popular-content {
        width: calc(100% - 32px);
        height: calc(100% - 385px);
        position: absolute;
        bottom: 0;
        left: 0;
        margin: 0 16px;

        .title {
            font-size: 13px;
            font-weight: 400;
            color: rgba(17, 17, 17, 1);
            line-height: 18px;
        }
        .content {
            margin-top: 16px;
            width: 100%;
            height: 100%;
            position: relative;
            .list-box {
                width: 100%;
                height: calc(100% - 60px);
                .list {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    align-items: center;
                }
            }
        }
    }

    .toTop {
        position: absolute;
        bottom: -44px;
        right: 8px;
        transition: transform 0.3s linear;
    }

    .category-item::before {
        content: "";
        position: absolute;
        top: 1px;
        left: 100%;
        width: 0;
        height: 100%;
        border-bottom: 1px solid #1593ff;
        transition: 0.2s all linear;
    }

    .category-item:hover::before {
        width: 100%;
        top: 1px;
        left: 0;
        transition-delay: 0.1s;
        // border-bottom-color: #1593ff;
        z-index: -1;
    }

    .category-item:hover ~ .category-item::before {
        left: 0;
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
        background: #ffffff;
        &:hover {
            color: #1593ff;
        }
    }
}
</style>
