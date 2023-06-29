<template>
    <div class="eqc-editor" />
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
            const width = this.$el.parentElement.offsetWidth + 64
            const height = this.$el.parentElement.offsetHeight

            const pageJsonMerge = JSON.parse(JSON.stringify(this.pageJson))
            // 将批量创建场景中文本和图片的内容保留下来
            if (this.eqxPage2 && this.pageJson2) {
                pageJsonMerge.elements.forEach(item => {
                    if (item.type === elementType.text || item.type === elementType.image) {
                        const findElement = this.pageJson2.elements.filter(item2 => {
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

            const eqxScene2 = new EqxScene(JSON.parse(JSON.stringify(this.eqxScene.sceneJson)))
            const eqxPage2 = new EqxPage(pageJsonMerge, eqxScene2)

            eqxPage2.mount(this.$el)
            eqxPage2.initSize(width, height)
            eqxPage2.setMove(0, 0)
            eqxPage2.renderPage(JSON.parse(JSON.stringify(eqxPage2.pageJson)))
            eqxPage2.eqxHistory.setFirstAndLastPos()

            eqxScene2.addPage(eqxPage2)
            Vue.store.commit('SCENE2_INIT', { eqxScene2, eqxPage2 })
        }
    }
}
</script>
<style lang='scss'>
</style>
