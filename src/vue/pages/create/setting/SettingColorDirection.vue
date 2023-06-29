<template>
    <div
        class="eqc-setting-color-direction"
        @mouseover="showDirectionPanel"
        @mouseleave="hideDirectionPanel"
    >
        <div class="current">
            <span>{{ direction.selectedItem.name }}</span>
            <i class="icon eqf-menu-down" />
        </div>
        <!--层级需要比“基础”展开时高-->
        <base-drop-down
            v-if="showList"
            :list="direction.list"
            :selected-item="direction.selectedItem"
            :css="{left:0, bottom:'30px', width: '152px', paddingBottom: '2px', fontSize: '14px', zIndex: 1}"
            item-key="name"
            @choose="chooseDirection"
        />
    </div>
</template>

<script>
export default {
    props: {
        model: {
            type: Object,
            default: null
        },
        modelKey: {
            type: String,
            default: null
        },
        modelKeyType: {
            type: String,
            default: null
        },
        property: {
            type: Object,
            default: null
        },
        propertyKey: {
            type: String,
            default: null
        },
        eqxElement: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            direction: {
                list: [{
                    name: '从左到右',
                    property: {
                        angle: 90
                    }
                }, {
                    name: '从右到左',
                    property: {
                        angle: 270
                    }
                }, {
                    name: '从上到下',
                    property: {
                        angle: 180
                    }
                }, {
                    name: '从下到上',
                    property: {
                        angle: 0
                    }
                }],
                selectedItem: null
            },
            showList: false
        }
    },
    computed: {
        scene() {
            return this.$store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        showName() {
            return this.direction.selectedItem.name
        },
        gradient() {
            return this.property.gradient
        }
    },
    watch: {
        gradient: {
            handler() {
                this.setSelectedDirection()
            },
            // 避免两个组件切换选中时，组件设置面板未消失，字体不更新的问题
            immediate: true
        }

    },
    created() {
        this.setSelectedDirection()
    },
    methods: {
        setSelectedDirection() {
            this.direction.selectedItem = this.direction.list.find(item => item.property.angle === this.model[this.modelKey].angle) || {}
        },
        showDirectionPanel() {
            this.showList = true
        },
        hideDirectionPanel() {
            this.showList = false
        },
        chooseDirection(item) {
            this.direction.selectedItem = item
            this.eqxElement.updateProperty({ gradient: { enabled: true, angle: this.direction.selectedItem.property.angle, colors: this.model[this.modelKey].colors } })
            this.eqxPage.eqxHistory.add(this.eqxPage)
            setTimeout(() => this.hideDirectionPanel())
        }
    }
}
</script>

<style lang="scss">
.eqc-setting-color-direction {
    font-size: 12px;
    color: #2f3c4d;
    cursor: pointer;
    .current {
        position: relative;
        width: 100%;
        height: 30px;
        line-height: 28px;
        padding: 0 28px 0 12px;
        background: #fff;
        border: 1px solid #ccd5db;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        .icon {
            position: absolute;
            right: 0;
            top: 0;
            width: 28px;
            height: 28px;
            font-size: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotateZ(180deg);
        }
    }
}
</style>
