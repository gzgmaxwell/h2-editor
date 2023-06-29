<template>
    <div class="eqc-tag">
        <!-- tag-list -->
        <ul class="tag-list">
            <!-- 添加分组 -->
            <li
                class="eqc-tag-item"
                :class="{disable:uploadManage.show}"
                @click="openAddPop"
            >
                <span class="name"><i class="eqf-plus" /></span>
            </li>
            <!-- 全部分组 -->
            <li
                class="eqc-tag-item"
                @click="getAllTags"
            >
                <span
                    class="name"
                    :class="{active:chooseTagId === -1}"
                >我的全部分组</span>
            </li>
            <!-- 分组list -->
            <tag-item
                v-for="item in tagList"
                :key="item.id"
                :item="item"
                @chooseItem="chooseItem"
                @refreshTag="refreshTag"
            />
            <!-- 更多分组 -->
            <li
                v-if="tagListRest.length"
                class="eqc-tag-item"
                @mousemove="showRestTag"
            >
                <span class="name"><i class="eqf-menu-p" /></span>
            </li>
        </ul>
        <!-- rest-tag -->
        <div
            :style="{height:restHeight}"
            class="rest-tag pop-window"
            @mouseleave="closeRestPop"
        >
            <div class="title">
                <span>剩余分组</span>
            </div>
            <div>
                <ul class="tag-content">
                    <tag-item
                        v-for="item in tagListRest"
                        :key="item.id"
                        :item="item"
                        @chooseItem="chooseItem"
                        @refreshTag="refreshTag"
                    />
                </ul>
            </div>
        </div>
        <!-- rest-tag的copy 便于计算实际高度 -->
        <div
            ref="restTagCopy"
            class="rest-tag pop-window copy"
            @mouseleave="closeRestPop"
        >
            <div class="title">
                <span>剩余分组</span>
            </div>
            <div>
                <ul class="tag-content">
                    <tag-item
                        v-for="item in tagListRest"
                        :key="item.id"
                        :item="item"
                    />
                </ul>
            </div>
        </div>
        <!-- add-tag -->
        <div
            class="add-tag pop-window"
            :style="{height:addHeight+'px'}"
        >
            <div class="title">
                <span>新建分组</span>
                <span
                    class="close"
                    @click="closeAddPop"
                ><i class="eqf-no" /></span>
            </div>
            <div class="content-input">
                <input
                    v-model.trim="newTagName"
                    type="text"
                    class="new-name"
                >
                <span
                    class="confirm"
                    @click="confirmAddNewTag"
                >确认</span>
            </div>
        </div>
    </div>
</template>

<script>
import tagItem from './TagItem.vue'
export default {
    components: {
        tagItem
    },
    props: {
        tags: {
            type: Array,
            default: null
        },
        showDelete: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            tagList: [],
            tagListRest: [],
            newTagName: '',
            addHeight: 0, // 新建分组的高度
            restHeight: 0 // 剩余分组的高度
        }
    },
    computed: {
        layout() {
            return Vue.store.state.layout
        },
        uploadManage() {
            return this.layout.uploadManage
        },
        chooseTagId() {
            return Vue.store.state.scene.chooseUploadTagId
        }
    },
    watch: {
        tags(newTags) {
            if (newTags.length > 4) {
                this.tagList = newTags.slice(0, 4)
                this.tagListRest = newTags.slice(4)
            } else {
                this.tagList = newTags
                this.tagListRest = []
            }
        }
    },
    methods: {
        // 关掉新建分组的弹窗
        closeAddPop() {
            this.addHeight = 0
        },
        // 打开新建分组的弹窗
        openAddPop() {
            // 设置模式下 不允许添加
            if (!this.uploadManage.show) {
                this.addHeight = 94
            }
        },
        // 确定新增分组
        confirmAddNewTag() {
            this.api.tag.addTag(this.newTagName).then(() => {
                // 新建成功
                this.$emit('refreshTag')
                this.newTagName = ''
                this.closeAddPop()
            })
        },
        // 节点删除之后 节点
        refreshTag() {
            this.$emit('refreshTag')
        },
        // 选中分组
        chooseItem(id) {
            this.$emit('choose', id)
            Vue.store.commit('CHANGE_UPLOAD_TAG', id)
        },
        // 打开剩余分组
        showRestTag() {
            this.restHeight = this.$refs.restTagCopy.offsetHeight + 'px'
        },
        //  关闭剩余分组
        closeRestPop() {
            this.restHeight = 0
        },
        // 我的全部分组
        getAllTags() {
            Vue.store.commit('CHANGE_UPLOAD_TAG', -1)
            this.$emit('choose', -1)
        }
    }
}
</script>

<style lang="scss">
.eqc-tag {
    .tag-list {
        display: flex;
        flex-wrap: wrap;
        padding: 0 16px;
        .disable {
            cursor: not-allowed;
        }
    }
    .copy {
        z-index: -1 !important;
    }
    .add-tag {
        top: 100px !important;
    }
    .pop-window {
        position: absolute;
        top: 142px;
        left: 0;
        width: 288px;
        box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
        border-radius: 2px;
        background: white;
        z-index: 4;
        overflow: hidden;
        transition: all 0.3s;
        .title {
            font-size: 13px;
            font-weight: 600;
            color: #111;
            line-height: 18px;
            display: flex;
            justify-content: space-between;
            padding: 16px 16px 12px 16px;
            .close {
                font-size: 15px;
                cursor: pointer;
            }
        }
        .content-input {
            display: flex;
            justify-content: space-between;
            padding: 0 16px;
            input {
                border: 1px solid #ccd5db;
                border-radius: 2px;
                width: 194px;
                height: 32px;
                padding: 2px;
            }
            .confirm {
                width: 50px;
                height: 32px;
                background: #1593ff;
                border-radius: 2px;
                color: white;
                text-align: center;
                line-height: 32px;
                cursor: pointer;
            }
        }
        .tag-content {
            display: flex;
            flex-wrap: wrap;
            margin-top: 0;
            padding: 0 16px;
        }
    }
}
</style>
