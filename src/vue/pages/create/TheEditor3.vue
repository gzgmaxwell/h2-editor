<template>
    <div class="eqc-editor-container">
        <div class="eqc-editor-item eqc-editor-item-top">
            <div class="eqc-editor" />
        </div>
        <div class="eqc-editor-item eqc-editor-item-bottom">
            <div class="eqc-editor" />
        </div>
    </div>
</template>

<script>
import EqxScene from '../../../core/scene'
import EqxPage from '../../../core/html/page'
import elementType from '../../../config/enum.element.type'
export default {
    data() {
        return {
            singlefieldarray: null,
            multifieldarray: null,
            exportDataArr: null
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
        pageJson() {
            return this.eqxPage.pageJson
        },
        eqxScene2() {
            return this.scene.eqxScene2
        },
        eqxPage2() {
            return this.scene.eqxPage2
        },
        pageJson2() {
            return this.eqxPage2.pageJson
        },
        eqxScene3() {
            return this.scene.eqxScene3
        },
        eqxPage3() {
            return this.scene.eqxPage3
        },
        pageJson3() {
            return this.eqxPage3.pageJson
        }
    },
    watch: {
        eqxPage: {
            handler() {
                this.$nextTick(() => this.renderPage())
            },
            // 避免首次eqxPage改变时，watch还未执行的问题
            immediate: true
        }
    },
    methods: {
        setFieldArray(pSinglefieldarray, pMultifieldarray, pExportDataArr) {
            this.singlefieldarray = pSinglefieldarray
            this.multifieldarray = pMultifieldarray
            this.exportDataArr = pExportDataArr
        },
        // 获取单字段的值
        getSingleFieldValue(pMarkLabelVal) {
            let result = null
            let find = false
            if (this.singlefieldarray !== null) {
                this.singlefieldarray.forEach(item => {
                    if (item.name === pMarkLabelVal) {
                        result = item
                        find = true
                    }
                })
            }
            if (!find && this.multifieldarray !== null) {
                this.multifieldarray.forEach(item => {
                    if (item.name === pMarkLabelVal) {
                        this.exportDataArr.forEach(item2 => {
                            const value = item2[item.name]
                            if (value && value !== null && value !== '' && !find) {
                                result = item2
                                find = true
                            }
                        })
                    }
                })
            }
            return result
        },
        renderPage() {
            this.initEditor(0)
            this.initEditor(1)
        },
        initEditor(pIndex) {
            if (this.eqxScene.eqxPages.length <= pIndex) {
                return
            }
            const editor1ElParent = this.$el.children[pIndex]
            let width = editor1ElParent.offsetWidth + 98
            width = width > 522 ? 522 : width
            const height = editor1ElParent.offsetHeight + 98
            const pageJsonMerge = JSON.parse(JSON.stringify(this.eqxScene.eqxPages[pIndex].pageJson))
            // 将批量创建场景中文本和图片的内容保留下来
            const curEqxPage = pIndex === 0 ? this.eqxPage2 : this.eqxPage3
            let curPageJson = null
            if (curEqxPage !== null) {
                curPageJson = pIndex === 0 ? this.pageJson2 : this.pageJson3
            }
            if (curEqxPage && curPageJson) {
                pageJsonMerge.elements.forEach(item => {
                    if (item.type === elementType.text || item.type === elementType.image) {
                        const findElement = curPageJson.elements.filter(item2 => {
                            return item.id === item2.id
                        })
                        if (findElement && findElement.length > 0) {
                            const markLabel = findElement[0].property.markLabel
                            // 根据markLabel获取用户填写的值  如果用户没有填写就用新模板的值，如果用填写了就用用户的值
                            if (markLabel && markLabel !== null && markLabel !== '') {
                                const singleField = this.getSingleFieldValue(markLabel)
                                if (singleField !== null) {
                                    // 如果不是默认值则修改控件的值
                                    if (item.type === elementType.text &&
                                        item.property.content !== singleField.defaultValue &&
                                        item.property.content !== singleField.value) {
                                        singleField.value = item.property.content
                                    } else if (item.type === elementType.image &&
                                        item.property.src !== singleField.defaultValue &&
                                        item.property.src !== singleField.value) {
                                        singleField.value = item.property.src
                                    }
                                }
                            }
                        }
                    }
                })
            }

            const newEqxScene = new EqxScene(JSON.parse(JSON.stringify(this.eqxScene.sceneJson)))
            const newEqxPage = new EqxPage(pageJsonMerge, newEqxScene)

            newEqxPage.mount(this.$el.children[pIndex].children[0])
            newEqxPage.initSize(width, height)
            newEqxPage.setMove(0, 0)
            newEqxPage.renderPage(JSON.parse(JSON.stringify(newEqxPage.pageJson)))
            newEqxPage.eqxHistory.setFirstAndLastPos()

            newEqxScene.addPage(newEqxPage)
            if (pIndex === 0) {
                Vue.store.commit('SCENE2_INIT', { eqxScene2: newEqxScene, eqxPage2: newEqxPage })
            } else if (pIndex === 1) {
                Vue.store.commit('SCENE3_INIT', { eqxScene3: newEqxScene, eqxPage3: newEqxPage })
            }
        }
    }
}
</script>
<style lang='scss'>
.eqc-editor-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    align-content: center;
    justify-content: center;
    .eqc-editor-item {
        flex: 1;
        width: 100%;
        display: flex;
        justify-content: center;
    }
    .eqc-editor-item-top {
        align-items: flex-end;
        padding-bottom: 4px;
    }
    .eqc-editor-item-bottom {
        align-items: flex-start;
        padding-top: 4px;
    }
}
</style>
