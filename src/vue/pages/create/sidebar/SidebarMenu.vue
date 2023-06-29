<template>
    <div
        v-show="show"
        class="eqc-layer-menu"
        :style="{left: left - 2 + 'px',top: top - 2 + 'px'}"
        @mouseleave="mouseleave"
    >
        <ul>
            <li
                v-for="(item,i) in menuList"
                :key="i"
                class="item"
                @click="menuClick(item)"
            >
                <span class="name">{{ item.name }}</span>
                <span
                    v-if="item.code === 'lock' || item.code === 'unlock'"
                    class="key"
                >⌘L</span>
                <span
                    v-if="item.code === 'copy'"
                    class="key"
                >⌘C</span>
                <span
                    v-if="item.code === 'delete'"
                    class="key"
                >Delete</span>
            </li>
        </ul>
    </div>
</template>
<script>
import elementType from '../../../../config/enum.element.type'
export default {
    data() {
        return {
            type: 1,
            config: {
                paste: false,
                lock: false,
                hide: false
            },
            menuList: [], // 右键展示的配置
            allList: [// 全部的配置
                {
                    name: '解散',
                    code: 'dismiss'
                }, {
                    name: '编组',
                    code: 'combine'
                }, {
                    name: '显示',
                    code: 'unhide'
                }, {
                    name: '粘贴',
                    code: 'paste'
                }, {
                    name: '复制',
                    code: 'copy'
                }, {
                    name: '锁定',
                    code: 'lock'
                }, {
                    name: '解锁',
                    code: 'unlock'
                }, {
                    name: '隐藏',
                    code: 'hide'
                }, {
                    name: '删除',
                    code: 'delete'
                }

            ]
        }
    },
    computed: {
        show() {
            return Vue.store.state.scene.sidebarMenuOption.show
        },
        left() {
            return Vue.store.state.scene.sidebarMenuOption.left
        },
        top() {
            return Vue.store.state.scene.sidebarMenuOption.top
        },
        eqxElements() {
            // 过滤掉选中的临时组合
            return Vue.store.state.scene.sidebarMenuOption.eqxElements.filter(item => {
                if (item.elementJson.type === elementType.combine && !item.isCombine) {
                    return false
                } else {
                    return true
                }
            })
        },
        scene() {
            return this.$store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        elementsCopied() {
            return this.scene.elementsCopied
        }
    },
    watch: {
        show() {
            const eqxElements = this.eqxElements
            // 校验是单个还是批量
            if (eqxElements.length === 1) {
                // 单个
                const eqxElement = eqxElements[0]
                // 判断类型
                if (eqxElement.combineBox && eqxElement.combineBox.isCombine) {
                    this.type = 3
                } else if (eqxElement.elementJson.type === elementType.combine) {
                    this.type = 2
                } else {
                    this.type = 1
                }
                // 锁定
                if (eqxElement.combineBox) {
                    this.config.lock = !eqxElement.combineBox.elementJson.property.lock
                } else {
                    this.config.lock = !eqxElement.elementJson.property.lock
                }

                // 显示
                this.config.hide = eqxElement.elementJson.css.display !== 'none'
            } else if (eqxElements.length > 1) {
                this.type = this.checkEqxElements(eqxElements)
                // 锁定
                if (eqxElements[0].combineBox) {
                    this.config.lock = !eqxElements[0].combineBox.elementJson.property.lock
                } else {
                    this.config.lock = !eqxElements.every(item => item.elementJson.property.lock)
                }
                // 显示
                this.config.hide = eqxElements.every(item => item.elementJson.css.display !== 'none')
            }

            if (this.type === 0) {
                Vue.notifier.fail('批量选择只能是非编组或者是同一个编组的')
                this.$store.commit('SCENE_SIDERBAR_MENU_OPTION_SHOW', false)
            } else {
                this.initDataByConfig()
            }
        },
        menuConfig: {
            handler: function () {

            },
            deep: true
        }
    },
    methods: {
        // 检查多选的组件是不是都是非组内组件或者都是组内组件
        checkEqxElements(eqxElements) {
            let total = 0
            eqxElements.map(item => {
                let index = 1
                if (item.combineBox && item.combineBox.isCombine) {
                    index = 2
                }
                total += index
            })
            if (total === eqxElements.length) {
                return 4 // 1 全都是非编组 2 全都是组内
            } else if (total === eqxElements.length * 2) {
                return 5
            } else {
                return 0
            }
        },
        initDataByConfig() {
            this.menuList = []
            let menuList = []
            const basicMenu = ['copy', 'delete']
            // 1 单个组件 2 单个组合组件 3 单个组合内的组件 4 批量非编组组件 5 批量编组组件
            if (this.type === 1 || this.type === 3 || this.type === 5) {
                //  单个组件 复制 锁定 隐藏 删除
                menuList = basicMenu
            } else if (this.type === 2) {
                // 单个组合组件 解散 复制 锁定 隐藏 删除
                menuList = ['dismiss', ...basicMenu]
            } else if (this.type === 4) {
                // 批量非编组组件 编组 复制 锁定 隐藏  删除（如果有组合打散组合，重新编组）
                menuList = ['combine', ...basicMenu]
            }
            for (const key in this.config) {
                if (this.config[key]) {
                    menuList.push(key)
                } else {
                    menuList.push('un' + key)
                }
            }
            // 判断粘贴是否存在
            if (this.elementsCopied.length > 0) {
                menuList.push('paste')
            }
            // 特殊处理： 锁定状态 只显示解锁和删除
            if (menuList.includes('unlock')) {
                menuList = ['unlock', 'delete']
            }
            // 特殊处理： 隐藏状态  只有显示和删除
            if (menuList.includes('unhide')) {
                menuList = ['unhide', 'delete']
            }
            this.allList.map(item => {
                if (menuList.indexOf(item.code) !== -1) {
                    this.menuList.push(item)
                }
            })
        },
        menuClick(item) {
            if (['hide', 'unhide', 'lock', 'unlock', 'delete'].includes(item.code)) {
                // 这几个相似度太高  归并处理
                this.exeActionByCode(item.code)
            } else {
                this[item.code]()
            }

            this.eqxPage.eqxHistory.add(this.eqxPage)
            this.close()
        },
        exeActionByCode(code) {
            // 锁定逻辑： 普通的直接锁定 组合元素也直接锁定（锁定之后就把临时组合变为组合） 组合内的元素要把整个组合都锁定
            // 操作之后 自动选中 便于在画布上直接看到效果
            const eqxElements = this.eqxElements
            eqxElements.map(item => {
                item.isSelected = true
                let exeItem = item
                if (item.combineBox) {
                    exeItem = item.combineBox
                }
                if (code === 'lock') {
                    if (exeItem.elementJson.type === elementType.combine) {
                        exeItem.isCombine = true
                    }
                    exeItem.elementJson.property.lock = true
                } else if (code === 'unlock') {
                    exeItem.elementJson.property.lock = false
                } else if (code === 'hide') {
                    this.showElementOrNot(exeItem, false)
                } else if (code === 'unhide') {
                    this.showElementOrNot(exeItem, true)
                } else if (code === 'delete') {
                    if (exeItem.combineBox) {
                        exeItem.combineBox.deleteCombineElement(exeItem.combineBox)
                    } else {
                        if (exeItem.elementJson.type === elementType.combine) {
                            exeItem.deleteCombineElement(exeItem)
                        }
                    }
                }
            })
            if (code === 'delete') {
                this.eqxPage.deleteElements(eqxElements)
                Vue.store.commit('ELEMENT_SELECT', { eqxElements: [] })
            } else if (code === 'hide') {
                // 隐藏就要取消选中
                Vue.store.commit('ELEMENT_SELECT', { eqxElements: [] })
            } else {
                Vue.store.commit('ELEMENT_SELECT', { eqxElements })
            }
        },
        showElementOrNot(element, state) {
            const display = state ? 'block' : 'none'
            if (element.elementJson.type === elementType.combine) {
                element.childElements.map(item => {
                    item.updateCss({ display })
                    !state && item.elementBox.$el.css({ display: 'none' })
                })
            }
            element.updateCss({ display })
            !state && element.elementBox.$el.css({ display: 'none' })
        },
        dismiss() {
            // 只对conbine 或者 批量编组元素生效
            const eqxElements = this.eqxElements
            const executedCombineArr = []
            eqxElements.map(item => {
                let combineItem = item
                if (item.combineBox) {
                    combineItem = item.combineBox
                }
                if (!executedCombineArr.includes(combineItem)) {
                    executedCombineArr.push(combineItem)
                }
            })
            //  全部解绑
            executedCombineArr.map(combineItem => {
                combineItem.isCombine = false
                combineItem.deleteCombineRefernce(combineItem, this.eqxPage)
            })
            setTimeout(() => {
                Vue.store.commit('ELEMENT_SELECT', { eqxElements: [] })
            })
        },
        combine() {
            const eqxElements = this.eqxElements
            Vue.store.commit('ELEMENT_SELECT', { eqxElements })
            setTimeout(() => {
                let combineBoxElement = eqxElements[0].combineBox
                if (combineBoxElement) {
                    if (combineBoxElement.combineBox) {
                        combineBoxElement = eqxElements[0].combineBox
                    }
                }
                combineBoxElement.isCombine = true
                combineBoxElement.flatCombine(combineBoxElement, this.eqxPage) // 组合不允许嵌套
                eqxElements.map(item => {
                    item.elementJson.combineBoxId = combineBoxElement.elementJson.id
                })
                // 组合了之后 自动选中组合元素
                Vue.store.commit('ELEMENT_SELECT', { eqxElements: [combineBoxElement] })
            })
        },
        paste() {
            this.$store.commit('ELEMENT_PASTE')
            // 复制了之后要对图层重新排序
            this.eqxPage.sortCombineElement()
        },
        copy() {
            // 先选中页面显示效果 然后copy
            const eqxElements = this.eqxElements
            eqxElements.map(item => {
                item.isSelected = true
            })
            Vue.store.commit('ELEMENT_SELECT', { eqxElements })

            this.$store.commit('ELEMENT_COPY')
            // 通过复制别的内容来清空剪切板
            const $input = document.querySelector('#input_copy')
            $input.select()
            document.execCommand('copy')
            $input.blur()
        },
        mouseleave() {
            this.close()
        },
        close() {
            this.$store.commit('SCENE_SIDERBAR_MENU_OPTION_SHOW', false)
        }
    }
}
</script>
<style lang="scss">
.eqc-layer-menu {
    width: 128px;
    padding: 8px 0;
    position: absolute;
    top: 300px;
    left: 500px;
    background: white;
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
    border-radius: 4px;
    z-index: 94; // 确保比图层层级大
    .item {
        display: flex;
        justify-content: space-between;
        height: 36px;
        line-height: 36px;
        font-weight: 400;
        padding: 0 12px;
        color: #2f3c4d;
        cursor: pointer;
        .key {
            color: #9099a4;
        }
        &:hover {
            color: white;
            background: #2f3c4d;
        }
    }
}
</style>
