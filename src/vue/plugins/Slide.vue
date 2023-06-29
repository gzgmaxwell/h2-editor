<template>
    <div
        :style="getBaseStyle"
        class="eqc-slide-base"
    >
        <component
            :is="dialog"
            :data="data"
            :hide="hide"
            :close="close"
            class="slide"
        />
    </div>
</template>

<script>
// data和close将会传给子组件，或者子组件通过$parent访问
export default {
    props: {
        // 用于传数据到子组件
        data: {
            type: Object,
            default: undefined // 不能用null，否则子组件的默认值会失效
        },
        // 用于通用框的一些设置
        params: {
            type: Object,
            default: undefined // 不能用null，否则子组件的默认值会失效
        }
    },
    data() {
        return {
            dialog: 'cDialog', // 用于接收组件
            value: null // 用于将数据传到调用方
        }
    },
    computed: {
        getBaseStyle() {
            const style = {}
            if (this.data && this.data.zIndex) {
                style.zIndex = this.data.zIndex
            }
            return style
        }
    },
    methods: {
        close(value) {
            const self = this
            let $create = null
            // 遍历并验证得到正确的dom节点
            for (let i = 0; i < document.body.children.length; i++) {
                const item = document.body.children[i]
                if (item.nodeName && item.className && item.nodeName === 'DIV' && item.className === 'eqc-app') {
                    $create = item
                    break
                }
            }
            $create.addEventListener('transitionend', transitionend)
            $create.css({ transform: '' })

            if (value) {
                this.value = value
            }

            function transitionend() {
                self.$destroy()
                $create.removeEventListener('transitionend', transitionend)
                self.$el.remove()
                $create.css({ transition: '' })
            }
        },
        hide() {
            const $create = document.body.children[0]
            $create.css({ transform: '' })
        }
    }
}
</script>

<style lang="scss">
.eqc-slide-base {
    position: absolute;
    top: -100%;
    left: 0;
    width: 100%;
    height: 100%;
    .slide {
        width: 100%;
        height: 100%;
    }
}
</style>
