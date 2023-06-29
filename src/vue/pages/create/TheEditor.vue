<template>
    <div class="eqc-editor" />
</template>

<script>
import storageSession from '../../../utils/storageSession'
import puzzleMode from '../../../config/enum.puzzleMode.type'
import elementType from '../../../config/enum.element.type'

export default {
    data() {
        return {
            puzzleMode
        }
    },
    computed: {
        scene() {
            return this.$store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        eqxElements() { // 页面元素
            return this.eqxPage.eqxElements
        },
        eqxBackground() { // 页面背景
            return this.eqxPage.eqxBackground
        },
        puzzle() {
            return Vue.store.state.puzzle
        },
        mode() {
            return Number(this.puzzle.mode)
        },
        scale() {
            return this.eqxPage.scale
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
        addElement(info) {
            // clear page first if alreay has puzzle element
            if (this.eqxElements.length > 0) {
                this.eqxPage.clearPage()
                Vue.store.commit('ELEMENT_SELECT', { eqxElements: [] })
            } else {
                this.eqxBackground.clearBackground()
            }

            const result = this.eqxPage.getElementPosOfCenter(800, 800, this.scale)
            const left = result.left
            const top = result.top
            const elementJson = {
                type: elementType.puzzle,
                css: {
                    left: left + 'px',
                    top: top + 'px',
                    width: '800px',
                    height: '800px'
                }
            }
            if (info) {
                elementJson.property = info
            }
            this.eqxPage.addElement(elementJson)
            this.eqxPage.eqxHistory.add(this.eqxPage)
            storageSession.removeItem(storageSession.key.puzzleInfo)
        },
        renderPuzzleElement() {
            const puzzleInfo = storageSession.getItem(storageSession.key.puzzleInfo)
            if (puzzleInfo) {
                const info = JSON.parse(puzzleInfo)
                this.addElement(info)
            }
        },
        renderPage() {
            const width = this.$parent.$el.offsetWidth
            const height = this.$parent.$el.offsetHeight
            const eqxPage = this.eqxPage

            eqxPage.mount(this.$el)
            eqxPage.initSize(width, height)
            eqxPage.setMove(0, 0)
            eqxPage.renderPage(JSON.parse(JSON.stringify(eqxPage.pageJson)))
            eqxPage.eqxHistory.setFirstAndLastPos()

            if (this.mode === this.puzzleMode.setting) {
                this.renderPuzzleElement()
            }
        }
    }
}
</script>
