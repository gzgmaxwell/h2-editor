<template>
    <div class="eqc-dialog-apply dialog">
        <!-- 头部 -->
        <div class="head">
            <span class="title">申请模板</span>
            <i
                class="close eqf-no"
                @click="cancel"
            />
        </div>
        <!-- 设置标题场景 -->
        <div class="nameArea format">
            <input
                v-model.trim="submitData.title"
                class="text name strong pointer"
                type="text"
                placeholder="场景标题只能输入14个字"
                maxlength="14"
            >
            <!-- 设置模板售价 -->
            <div class="price">
                <span class="strong">设置模板售价：</span>
                <div
                    class="line2"
                    @mouseover="showPriceList = true"
                    @mouseleave="showPriceList = false"
                >
                    <input
                        v-model="price.selectedItem.name"
                        class="text"
                        type="text"
                        disabled
                    >
                    <i
                        :class="{active: showPriceList}"
                        class="icon eqf-menu-down"
                    />
                    <base-drop-down
                        v-if="showPriceList"
                        :list="price.list"
                        :selected-item="price.selectedItem"
                        :css="{width: '120px', paddingTop: '8px',zIndex:20}"
                        item-key="name"
                        @choose="choosePrice"
                    />
                </div>
                <!-- 设置会员免费 -->
                <div
                    :class="{disableColor:price.selectedItem.name==='免费'}"
                    class="member pointer"
                    @click="memberClick"
                >
                    <base-checkbox v-model="submitData.memberFree" />
                    <span class="label">设为会员免费</span>
                </div>
            </div>
        </div>
        <!-- 已选分类 -->
        <div class="category border">
            <span class="label titleFontColor">已选分类：</span>
            <div class="showArea">
                <div
                    v-for="(item,i) in submitData.categoryArr"
                    :key="i"
                    class="item pointer flex-center"
                    @mouseover="mouseOverAction(item,0)"
                    @mouseleave="chooseCategoryItem = null"
                >
                    <span class="label">{{ item.name }}</span>
                    <div
                        v-show="chooseCategoryItem === item.id"
                        class="error"
                        @click="cancelCategoryById(item)"
                    >
                        <i class="eqf-no-f" />
                    </div>
                </div>
            </div>
        </div>
        <!-- 已选属性 -->
        <div class="category attribute">
            <span class="label titleFontColor">已选属性：</span>
            <div class="showArea h58">
                <div
                    v-for="(item,i) in submitData.attributeArr"
                    :key="i"
                    class="item pointer flex-center"
                    @mouseover="mouseOverAction(item,1)"
                    @mouseleave="chooseAttributeItem = null"
                >
                    <span class="label">{{ item.name }}</span>
                    <div
                        v-show="chooseAttributeItem === item.id"
                        class="error"
                        @click="cancelAttributeById(item)"
                    >
                        <i class="eqf-no-f" />
                    </div>
                </div>
            </div>
        </div>
        <!-- category和attribute选择区域 -->
        <div class="chooseArea">
            <div class="splitArea pointer">
                <div
                    :class="{active:splitFlag==0}"
                    class="flex-center"
                    @click="swichClick(0)"
                >
                    选择分类
                </div>
                <div
                    :class="{active:splitFlag==1}"
                    class="flex-center"
                    @click="swichClick(1)"
                >
                    选择属性
                </div>
            </div>
            <div class="titleWrapper">
                <div class="titleArea">
                    <div
                        v-for="(titleItem,i) in titleList"
                        :key="i"
                        :class="{active:splitFlag+titleItem.id === chooseTitleFlag}"
                        class="titleItem pointer"
                        @click="selectTitleClick(titleItem)"
                    >
                        {{ titleItem.name }}
                    </div>
                </div>
            </div>
            <div class="contentArea">
                <div class="wrapper">
                    <div
                        v-for="(conItem,i) in contentArr"
                        :key="i"
                        class="conItem pointer flex-center"
                        @click="itemSelect(conItem)"
                    >
                        {{ conItem.name }}
                    </div>
                </div>
            </div>
        </div>
        <div class="foot">
            <a
                class="rule"
                href="http://showker.eqxiuzhan.com/qsj.html"
                target="_blank"
            >审核规则</a>
            <div>
                <base-button
                    class="btn white h36"
                    @click.native="cancel"
                >
                    取消
                </base-button>
                <base-button
                    class="btn blue h36"
                    @click.native="ok"
                >
                    提交审核
                </base-button>
            </div>
        </div>
    </div>
</template>

<script>
import sceneTypeObj from '../../../config/enum.scene.type'
import utils from '../../../utils/util'
export default {
    props: {
        data: {
            type: Object,
            default: null
        },
        close: {
            type: Function,
            default: null
        }
    },
    data() {
        return {
            submitData: {
                title: '', // 模板name
                price: 0, // 模板售价
                memberFree: false, // 会员免费
                categoryArr: [], // 模板分类
                attributeArr: [] // 模板属性
            },
            showPriceList: false,
            price: {
                list: [
                    { name: '免费', value: 0 }
                ],
                selectedItem: {
                    name: '免费'
                }
            },
            categoryTitleArr: [], // 所有的二级分类列表 点击选择三级分类
            attributeTitleArr: [], // 所有的属性列表
            titleList: [], // 在二级分类和属性列表之前切换显示的列表
            contentArr: [], // 显示三级分类和属性的列表
            chooseCategoryItem: 0,
            chooseAttributeItem: 0,
            chooseTitleFlag: '',
            splitFlag: 0, // 0 代表选中‘选择分类’区域 1 代表选中‘选择属性’区域
            params: null // url参数
        }
    },
    created() {
        this.params = utils.getUrlParams()
        this.initDate()
    },
    methods: {
        initDate() {
            this.getPriceList()
            this.getCategoryInfo()
        },
        mouseOverAction(item, type) {
            if (!item.isDefault) {
                // 默认的不能删除
                if (type) {
                    this.chooseAttributeItem = item.id
                } else {
                    this.chooseCategoryItem = item.id
                }
            }
        },
        checkBeforeSubmit() {
            // 校验三级分类总数 3 <= N <= 5
            let pass = true
            if (this.submitData.title === '') {
                pass = false
                Vue.notifier.fail('场景标题不能为空!')
            } else if (this.submitData.categoryArr.length > 5) {
                pass = false
                Vue.notifier.fail('最多选中5个分类!')
            } else if (this.submitData.categoryArr.length < 3) {
                pass = false
                Vue.notifier.fail('至少选择3个分类!')
            } else if (this.submitData.attributeArr.length > 10) {
                pass = false
                Vue.notifier.fail('最多选择10个属性!')
            } else if (this.submitData.attributeArr.length < 3) {
                pass = false
                Vue.notifier.fail('至少选择3个属性!')
            } else if (!this.submitData.categoryArr.some(item => item.isStyle)) {
                pass = false
                let styleCategory = null
                this.categoryTitleArr.map(item => {
                    if (item.isStyle) {
                        styleCategory = item
                    }
                })
                if (!styleCategory) {
                    Vue.notifier.fail('必须选择一个风格的分类！')
                } else {
                    this.splitFlag = 0
                    this.swichClick(0) // 切换到 ‘选择分类’
                    this.chooseTitleFlag = '0' + styleCategory.id
                    this.selectTitleClick(styleCategory) // 切换到 '风格'
                    Vue.notifier.fail('必须选择一个风格的分类！')
                }
            }
            return pass
        },
        checkBeforeAddCategory(addItem) {
            // 同一个二级分类下的三级分类只能选择一个
            let index = -1
            const state = this.submitData.categoryArr.some((item, i) => {
                index = i
                return addItem.parentId === item.parentId
            })
            if (state) {
                // 相同的就替换
                this.submitData.categoryArr.splice(index, 1, addItem)
                return false // 存在相同的  校验不合格
            }
            if (this.submitData.categoryArr.length >= 5) {
                Vue.notifier.info('最多选中5个分类!')
                return false
            }
            return true
        },
        checkBeforeAddAttribute(addItem) {
            // 同一个属性 最多只能添加三个属性值
            let count = 0
            let state = false
            this.submitData.attributeArr.map(item => {
                if (addItem.parentId === item.parentId) {
                    count++
                }
                if (item.id === addItem.id) {
                    state = true
                }
            })
            if (state) {
                return false
            }
            if (count >= 3) {
                Vue.notifier.info('每个属性最多选中三个属性值！')
                return false
            }
            if (this.submitData.attributeArr.length >= 10) {
                Vue.notifier.info('最多选中10个属性!')
                return false
            }
            return true
        },
        getPriceList() {
            const type = this.data ? this.data.type : this.params.type
            if (type) {
                Vue.api.scene.getPriceByBannerId(type).then(data => {
                    if (data.data.obj) {
                        const priceArr = data.data.obj.prices
                        priceArr && priceArr.map(item => {
                            this.price.list.push({
                                name: item + ' 秀点',
                                value: item
                            })
                        })
                    }
                }).catch(err => {
                    err && Vue.logger.error(err)
                })
            }
        },
        getCategoryInfo() {
            const type = this.data ? this.data.type : this.params.type
            if (type) {
                Vue.api.scene.getCategoryForTpl(type).then(data => {
                // 添加默认三级分类
                    const defaultCategory = data.data.map.defaultCategory
                    defaultCategory.map(item => {
                        this.submitData.categoryArr.push({
                            id: item.id,
                            type: 0, // 0 代表是三级分类 1代表属性
                            name: item.name,
                            parentId: item.parentId, // 上级分类id 或者上级属性id
                            isDefault: 1, // 0 不是默认 1 是
                            isStyle: sceneTypeObj.isSceneStyle(item.id)
                        })
                    })

                    // 添加默认属性
                    const defaultAttributeList = data.data.map.defaultAttribute
                    defaultAttributeList.map(item => {
                        this.submitData.attributeArr.push({
                            id: item.id,
                            type: 1, // 0 代表是三级分类 1代表属性
                            name: item.name,
                            parentId: item.pid, // 上级分类id 或者上级属性id
                            isDefault: 1 // 0 不是默认 1 是
                        })
                    })
                    // 添加属性列表
                    const attributeList = data.data.map.attributeList
                    attributeList.map(item => {
                        this.attributeTitleArr.push({
                            id: item.id,
                            type: 1, // 0 代表是三级分类 1代表属性
                            name: item.name,
                            parentId: item.pid, // 上级分类id 或者上级属性id
                            isDefault: 1, // 0 不是默认 1 是
                            childList: item.valueList
                        })
                    })
                    // 添加三级分类列表
                    const categoryList = data.data.map.categoryList
                    categoryList.map(item => {
                        this.categoryTitleArr.push({
                            id: item.id,
                            type: 0, // 0 代表是三级分类 1代表属性
                            name: item.name,
                            parentId: item.parentId, // 上级分类id 或者上级属性id
                            isDefault: 1, // 0 不是默认 1 是
                            childList: item.children,
                            isStyle: sceneTypeObj.isSceneStyle(item.id)
                        })
                    })
                    // 默认展示 分类的
                    this.titleList = this.categoryTitleArr
                    // 分类默认选中第一个
                    this.selectTitleClick(this.titleList[0])
                }).catch(err => {
                    err && Vue.logger.error(err)
                })
            }
        },
        swichClick(num) {
            this.splitFlag = num
            if (num) {
                this.titleList = this.attributeTitleArr
            } else {
                this.titleList = this.categoryTitleArr
            }
        },
        memberClick() {
            if (this.price.selectedItem.name !== '免费') {
                this.submitData.memberFree = !this.submitData.memberFree
            }
        },
        itemSelect(item) {
            if (item.type) {
                if (this.checkBeforeAddAttribute(item)) {
                    this.submitData.attributeArr.push(item)
                }
            } else {
                if (this.checkBeforeAddCategory(item)) {
                    this.submitData.categoryArr.push(item)
                }
            }
        },
        selectTitleClick(item) {
            this.chooseTitleFlag = this.splitFlag + item.id
            const list = item.childList
            this.contentArr = []
            list.map(listItem => {
                this.contentArr.push({
                    id: listItem.id,
                    type: item.type, // 0 代表是三级分类 1代表属性
                    name: listItem.name,
                    parentId: listItem.parentId ? listItem.parentId : listItem.pid, // 上级分类id 或者上级属性id
                    isStyle: item.isStyle,
                    isDefault: 0 // 0 不是默认 1 是
                })
            })
        },
        cancelCategoryById(item) {
            const index = this.submitData.categoryArr.indexOf(item)
            this.submitData.categoryArr.splice(index, 1)
        },
        cancelAttributeById(item) {
            const index = this.submitData.attributeArr.indexOf(item)
            this.submitData.attributeArr.splice(index, 1)
        },
        choosePrice(item) {
            this.price.selectedItem = item
            this.submitData.price = item.value
            this.showPriceList = false
            // 选中免费 不能勾选会员免费 如果勾选了要去掉
            this.submitData.memberFree = false
        },
        // 点击申请按钮
        ok() {
            if (this.checkBeforeSubmit()) {
                const data = {
                    id: this.data ? this.data.id : this.params.id,
                    title: this.submitData.title,
                    price: this.submitData.price,
                    memberFree: this.submitData.memberFree ? 1 : 0,
                    categoryList: this.submitData.categoryArr.map(item => item.id).join(','),
                    attributeList: this.submitData.attributeArr.map(item => item.id).join(',')
                }
                if (this.data) {
                    // 模块弹窗点击申请按钮
                    this.close(data)
                } else {
                    // 独立链接弹窗点击申请按钮
                    this.api.scene.applyTpl(data).then(res => {
                        this.notifier.success('已提交申请')
                        this.close({ apply: true })
                    })
                }
            }
        },
        cancel() {
            this.close()
        }
    }
}
</script>

<style lang="scss">
.eqc-dialog-apply {
    width: 800px;
    color: #000;
    transition: all 0.3s;
    .head {
        padding: 0 20px !important;
        border-bottom: 1px solid #e6ebed;
    }
    .format {
        padding: 0 20px;
    }
    .titleFontColor {
        color: #333;
        margin-top: 2px;
        width: 70px;
        flex-shrink: 0;
    }
    .nameArea {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 60px;
        border-bottom: 1px solid #e6ebed;
        .name {
            padding: 0 !important;
        }
        input {
            width: 250px;
            border: 1px solid #ffffff;
            &:focus {
                cursor: auto;
            }
            &::-webkit-input-placeholder {
                color: #000;
            }
        }
        .price {
            display: flex;
            align-items: center;
            .text {
                width: 120px;
                border: 1px solid rgba(204, 213, 219, 1);
                background-color: white;
            }
            .member {
                margin-left: 20px;
                display: flex;
                align-items: center;
                .label {
                    margin-left: 7px;
                }
            }
            .disableColor {
                color: #ebebe4;
            }
        }
    }
    .border {
        border-bottom: 1px solid #e6ebed;
    }
    .attribute {
        padding: 20px 0 16px 0 !important;
    }
    .category {
        margin-left: 20px;
        display: flex;
        align-items: flex-start;
        padding: 16px 0 20px 0;
        .label {
            padding: 2px 0;
        }
        .h58 {
            height: 58px;
            align-content: space-between;
        }
        .showArea {
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
            transition: all 0.3s;
            flex-wrap: wrap;
            width: 680px;
            .item {
                position: relative;
                padding: 2px 12px;
                background: #f0f3f4;
                border-radius: 3px;
                margin-right: 10px;
                min-width: 80px;
                // margin-bottom: 10px;
                .error {
                    position: absolute;
                    top: -7px;
                    left: 94%;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    color: rgba(255, 41, 106, 1);
                }
                &:hover {
                    background: #0091ff;
                    color: white;
                }
            }
        }
    }
    .chooseArea {
        margin: 0 20px;
        display: flex;
        width: 760px;
        height: 210px;
        border: 1px solid rgba(204, 213, 219, 1);
        .splitArea {
            width: 40px;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            div {
                height: 105px;
                writing-mode: vertical-lr;
                letter-spacing: 3px;
            }
            .active {
                background: #1593ff;
                color: white;
            }
        }
        .titleWrapper {
            width: 165px;
            background: rgba(240, 243, 244, 1);
            flex-shrink: 0;
            .titleArea {
                width: 160px;
                height: 208px;
                background: rgba(240, 243, 244, 1);
                display: flex;
                flex-direction: column;
                overflow-y: auto;
                .active {
                    background: #fff;
                    color: #0091ff;
                    border-left: 2px solid #0091ff !important;
                }
                .titleItem {
                    height: 30px;
                    // width: 163px;
                    line-height: 30px;
                    border-left: 2px solid transparent;
                    padding-left: 12px;
                    &:hover {
                        background: #fff;
                        color: #0091ff;
                        border-left: 2px solid #0091ff;
                    }
                }
                /*滚动条样式*/
                &::-webkit-scrollbar {
                    /*滚动条整体样式*/
                    width: 6px; /*高宽分别对应横竖滚动条的尺寸*/
                    // height: 40px;
                }
                &::-webkit-scrollbar-thumb {
                    /*滚动条里面小方块*/
                    position: relative;
                    right: -5px;
                    width: 6px;
                    height: 80px;
                    border-radius: 3px;
                    box-shadow: inset 0 0 5px rgba(218, 182, 182, 0.3);
                    background: rgba(0, 0, 0, 0.3);
                }
            }
        }
        .contentArea {
            display: flex;
            width: 553px;
            padding: 3px;
            .wrapper {
                width: 547px;
                padding: 8px 16px 24px 16px;
                display: flex;
                flex-wrap: wrap;
                align-items: flex-start;
                align-content: flex-start; // 控制换行间距
                overflow-y: scroll;
                overflow-x: hidden;
                /*滚动条样式*/
                &::-webkit-scrollbar {
                    width: 6px;
                }
                &::-webkit-scrollbar-track {
                    background-color: white;
                }
                &::-webkit-scrollbar-thumb {
                    background-color: rgba(0, 0, 0, 0.2);
                    height: 80px;
                    border-radius: 4px;
                }
            }
            .conItem {
                padding: 4px 12px;
                min-width: 80px;
                background: #f0f3f4;
                border-radius: 3px;
                margin-right: 10px;
                margin-top: 14px;
                height: 24px;
                &:hover {
                    background: #0091ff;
                    color: white;
                }
            }
        }
    }
    .pointer {
        cursor: pointer;
    }
    .flex-center {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .line2 {
        position: relative;
        .icon {
            position: absolute;
            right: 0;
            top: 0;
            width: 36px;
            height: 36px;
            font-size: 24px;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: all 0.3s;
            &.active {
                transform: rotate(180deg);
            }
        }
    }
    .strong {
        font-weight: bold;
        color: #111;
    }
    .text {
        height: 36px;
        padding: 0 12px;
        color: #2f3c4d;
    }
    .foot {
        padding: 20px;
        display: flex;
        justify-content: space-between;
        .rule {
            display: flex;
            align-items: center;
            color: #1593ff;
        }
        .btn {
            width: 96px;
            &.blue {
                margin-left: 16px;
            }
        }
    }
}
</style>
