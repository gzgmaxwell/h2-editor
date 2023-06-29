<template>
    <div
        class="eqc-setting-label-dialog dialog"
    >
        <div class="container">
            <span class="title">设置组件标签</span>
            <div
                class="box"
                @click="openSelectPanel"
            >
                <span>{{ chooseLabel }}</span>
                <i class="icon eqf-menu-down" />
                <div
                    :style="{height:showPanel?'112px':0}"
                    class="menu-down"
                >
                    <div class="wrapper">
                        <span
                            v-for="(item,i) in list"
                            :key="i"
                            @click="selectLabel(item)"
                        >{{ item | textFilter }}</span>
                    </div>
                </div>
            </div>
            <div class="buttonArea">
                <base-button
                    class="btn ok white h36 w96"
                    @click.native="cancel"
                >
                    取消
                </base-button>
                <base-button
                    class="btn ok blue h36 w96"
                    style="margin-left:16px"
                    @click.native="confirm"
                >
                    确定
                </base-button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    filters: {
        textFilter(val) {
            if (val.length > 6) {
                return val.substr(0, 5) + '...'
            } else {
                return val
            }
        }
    },
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
    data: function () {
        return {
            chooseLabel: '请选择标签',
            showPanel: false,
            list: []
        }
    },
    computed: {
        element() {
            return Vue.store.state.scene.eqxElementsSelected[0]
        },
        sceneJson() {
            return Vue.store.state.scene.eqxScene.sceneJson
        },
        type() {
            return this.sceneJson.type
        }
    },
    watch: {
        type(newValue) {
            this.getLabelListByBannerId()
        }
    },
    mounted() {
        this.getLabelListByBannerId()
        if (this.data.elementJson.property.markLabel && this.data.elementJson.property.markLabel !== '') {
            this.chooseLabel = this.data.elementJson.property.markLabel
        } else {
            this.chooseLabel = '请选择标签'
        }
    },
    created() {
        window.addEventListener('message', this.onMessage)
    },
    destroyed() {
        window.removeEventListener('message', this.onMessage)
    },
    methods: {
        getLabelListByBannerId() {
            const type = this.sceneJson.type
            this.api.banner.getSceneBanners()
                .then(res => {
                // 将所有的分类取出来
                    const list = [].concat(...res.data.list.slice(1).map(item => item.list))
                    list.forEach(item => {
                        if (type === item.type) {
                            Vue.api.scene.getLabelListByBannerId(type).then(data => {
                                this.list = data.data.list
                                this.list.unshift('无') // 增加默认选空的设置
                                let hasFlag = false
                                this.list.forEach(item => {
                                    if (item === this.data.elementJson.property.markLabel) {
                                        hasFlag = true
                                    }
                                })
                                if (!hasFlag) {
                                    this.chooseLabel = '请选择标签'
                                }
                            })
                        }
                    })
                })
                .catch(err => err && this.logger.error(err))
        },
        openSelectPanel() {
            this.showPanel = !this.showPanel
        },
        cancel() {
            this.close({})
        },
        confirm() {
            this.element.elementJson.property.markLabel = this.chooseLabel
            this.close({})
            if (this.chooseLabel !== '无') {
                this.element.elementJson.property.markLabel = this.chooseLabel
            } else {
                delete this.element.elementJson.property.markLabel
            }
            this.element.isSelected = false
            Vue.store.commit('ELEMENT_SELECT', { eqxElements: [] })
        },
        selectLabel(item) {
            this.chooseLabel = item
            this.showPanel = false
            window.event.stopPropagation()
        }
    }
}
</script>

<style lang="scss">
.eqc-setting-label-dialog {
    width: 368px;
    height: 200px;
    .container {
        width: 368px;
        height: 200px;
        padding: 28px 48px;
        display: flex;
        flex-direction: column;
        background-color: white;
        border-radius: 3px;
        .title {
            font-size: 18px;
            font-weight: bold;
            line-height: 30px;
        }
        .box {
            position: relative;
            padding: 0 12px;
            width: 272px;
            height: 36px;
            border: 1px solid #ccd5db;
            margin-top: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 14px;
            color: #2f3c4d;
            i {
                color: #76838f;
                font-size: 20px;
            }
            .menu-down {
                position: absolute;
                left: -1px;
                top: 35px;
                width: 272px;
                background: rgba(255, 255, 255, 1);
                box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.16);
                border-radius: 3px;
                transition: all 0.3s;
                overflow: hidden;
                .wrapper {
                    margin: 8px;
                    width: 249px;
                    height: 96px;
                    display: flex;
                    flex-wrap: wrap;
                    overflow-y: scroll;
                    span {
                        width: 80px;
                        height: 32px;
                        font-size: 13px;
                        color: #000;
                        border-bottom: 1px solid transparent;
                        text-align: center;
                        line-height: 32px;
                        transition: all 0.3s;
                        &:hover {
                            color: #1593ff;
                            border-bottom: 1px solid #1593ff;
                            cursor: pointer;
                        }
                    }
                    /*滚动条样式*/
                    &::-webkit-scrollbar {
                        /*滚动条整体样式*/
                        width: 8px; /*高宽分别对应横竖滚动条的尺寸*/
                        height: 80px;
                    }
                    &::-webkit-scrollbar-thumb {
                        /*滚动条里面小方块*/
                        position: relative;
                        right: -5px;
                        width: 8px;
                        height: 80px;
                        border-radius: 4px;
                        box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
                        background: rgba(0, 0, 0, 0.2);
                    }
                    &::-webkit-scrollbar-track {
                        /*滚动条里面轨道*/
                        // -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
                        // border-radius: 0;
                        background: white;
                    }
                }
            }
        }
        .buttonArea {
            display: flex;
            justify-content: center;
            margin-top: 26px;
        }
    }
}
</style>
