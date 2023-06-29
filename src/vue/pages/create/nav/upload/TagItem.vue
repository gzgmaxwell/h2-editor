<template>
    <li
        ref="tagItem"
        class="eqc-tag-item"
        @click="chooseItem"
        @dblclick="editItem"
    >
        <span
            v-if="!showInput"
            ref="name"
            :class="{active:chooseTagId===item.id,'hint--top':!uploadManage.show,'hint--rounded':!uploadManage.show}"
            class="name"
            data-hint="双击修改组名"
        >{{ item.name | ellipsis }}</span>
        <input
            v-if="showInput"
            ref="enter"
            v-model="tagName"
            type="text"
            class="enter"
            @blur="blur"
            @keyup.enter="enter"
        >

        <span
            v-if="uploadManage.show"
            class="delete hint--top hint--rounded"
            data-hint="解散分组"
            @click="deleteTag"
        ><i class="eqf-minus-f" /></span>
    </li>
</template>
<script>
export default {
    filters: {
        ellipsis(value) {
            if (value.length > 4) {
                return value.substr(0, 4) + '...'
            } else {
                return value
            }
        }
    },
    props: {
        item: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            showInput: false,
            tagName: ''
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
    methods: {
        // 选中分组
        chooseItem() {
            this.$emit('chooseItem', this.item.id)
        },
        // 编辑分组名儿
        editItem() {
            // 设置模式下不能更改
            if (!this.uploadManage.show) {
                this.showInput = true
                this.tagName = this.item.name
                setTimeout(() => {
                    this.$refs.enter.focus()
                })
            }
        },
        // 删除节点
        deleteTag() {
            this.dialog.openConfirm({ msg: '确定要解散吗？' })
                .then(() => this.api.tag.deleteTag(this.item.id))
                .then(() => {
                    // 刷新节点信息 达到删除的目的
                    this.$emit('refreshTag')
                    this.notifier.success('解散成功')
                    // 如果删除的是当前选中的分组，则让期选中全部
                    if (this.chooseTagId === this.item.id) {
                        this.$emit('chooseItem', -1)
                    }
                })
                .catch(err => err && this.logger.error(err))
        },
        blur() {
            this.showInput = false
            if (this.tagName === '') {
                this.tagName = '未命名'
            }
            if (this.item.name !== this.tagName) {
                this.editTag(this.tagName)
            }
            this.showInput = false
        },
        enter(tag) {
            this.showInput = false
        },
        editTag(name) {
            this.api.tag.editTag(this.item.id, name)
                .then(() => { this.item.name = name })
                .then(() => { this.notifier.success('修改成功') })
                .catch(err => err && this.logger.error(err))
        }
    }
}
</script>
<style lang="scss">
.eqc-tag-item {
    position: relative;
    height: 28px;
    font-size: 12px;
    color: #252b3f;
    text-align: center;
    cursor: pointer;
    z-index: 1;
    background: #f0f3f4;

    transition: all 0.3s;
    // padding: 6px 8px;
    margin-right: 12px;
    margin-bottom: 12px;

    .name {
        display: inline-block;
        height: 28px;
        padding: 6px 8px;
        border-radius: 2px;
        display: flex;
        justify-content: center;
        align-items: center;
        &:hover,
        &.active {
            background: rgba(21, 147, 255, 1);
            color: white;
        }
    }
    .enter {
        height: 28px;
        padding: 6px 8px;
        border: 1px solid #f0f3f4;
        border-radius: 2px;
        width: 64px;
    }
    .delete {
        position: absolute;
        top: -6px;
        right: -4px;
        font-size: 13px;
        color: #252b3f !important;
        &:hover {
            color: #ff4b4b !important;
        }
    }
}
</style>
