<template>
    <div class="eqc-tag">
        <ul class="tab">
            <li
                :class="{active: tagId === tagIdAll}"
                class="item"
                @click="chooseTag(tagIdAll)"
            >
                全部
            </li>
            <li
                :class="{active: isShowDetail, disable: !tags.length}"
                class="item more ellipsis"
                @mouseover="showDetail"
                @mouseleave="hideDetail"
            >
                <span class="ellipsis">{{ showTagName }}</span>
                <i
                    :style="{transform: isShowDetail ? 'rotate(180deg)' : ''}"
                    class="icon eqf-down"
                />
            </li>
            <li
                class="item add"
                @click="addTag"
            >
                <i class="icon eqf-plus" />
                <span>分组</span>
            </li>
        </ul>
        <ul
            :style="{height: isShowDetail ? height : 0}"
            class="detail"
            @mouseover="showDetail"
            @mouseleave="hideDetail"
        >
            <li
                v-for="(item, index) of tags"
                :key="item.id"
                :class="{active: tagId === item.id}"
                class="item hint--top hint--rounded"
                data-hint="双击修改组名"
                @click="chooseTag(item.id,item.name)"
            >
                <input
                    v-show="item.isEditing"
                    v-model.trim="text"
                    class="name"
                    type="text"
                    @blur="blur(item)"
                    @keyup.enter="enter(item)"
                >
                <span
                    v-show="!item.isEditing"
                    class="name ellipsis"
                    @dblclick="editTag(item, $event)"
                >{{ item.name }}</span>
                <i
                    class="icon eqf-no"
                    @click.stop="deleteTag(item, index)"
                />
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    props: {
        tags: {
            type: Array,
            default: null
        },
        tagId: {
            type: Number,
            default: -1
        },
        tagIdAll: {
            type: Number,
            default: -1
        }
    },
    data() {
        return {
            isShowDetail: false,
            text: '',
            showChooseTagName: '更多'
        }
    },
    computed: {
        height() {
            return Math.ceil(this.tags.length / 2) * 40 + 'px'
        },
        showTagName() {
            return this.showChooseTagName.length > 4 ? this.showChooseTagName.substr(0, 3) + '...' : this.showChooseTagName
        }
    },
    watch: {
        text(newVal, oldVal) {
            if (newVal !== '') {
                this.showChooseTagName = newVal
            } else {
                this.showChooseTagName = oldVal
            }
        }
    },
    methods: {
        showDetail() {
            this.isShowDetail = true
        },
        hideDetail() {
            this.isShowDetail = false
        },
        chooseTag(id, name) {
            if (name === '' || name === undefined) {
                this.showChooseTagName = '更多'
            } else {
                this.showChooseTagName = name
            }
            Vue.store.commit('CHANGE_UPLOAD_TAG', id)
            this.$emit('choose', id)
        },
        addTag() {
            if (this.tags.length >= 20) {
                this.notifier.info('分组数量最多为20个')
                return
            }
            this.$emit('add')
        },
        editTag(tag, e) {
            this.text = tag.name
            this.$set(tag, 'isEditing', true)

            // dom更新后使input获得焦点
            this.$nextTick(() => e.target.previousElementSibling.focus())
        },
        deleteTag(tag, index) {
            this.$emit('delete', tag, index)
        },
        changeTitle() {
            this.showChooseTagName = '更多'
        },
        blur(tag) {
            if (this.text === '') {
                this.text = '未命名'
            }
            if (tag.name !== this.text) {
                this.$emit('edit', tag, this.text)
            }
            this.$set(tag, 'isEditing', false)
            this.text = ''
        },
        enter(tag) {
            this.$set(tag, 'isEditing', false)
        }
    }
}
</script>

<style lang="scss">
.eqc-tag {
    .tab {
        display: flex;
        .item {
            flex: 1;
            position: relative;
            height: 40px;
            line-height: 40px;
            font-size: 12px;
            border-bottom: 1px solid #ccd5db;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
            &:hover,
            &.active {
                color: #1593ff;
                border-bottom: 1px solid #1593ff;
                &::after {
                    opacity: 1;
                }
            }
            &::after {
                content: "";
                position: absolute;
                left: 0;
                bottom: 0;
                width: 100%;
                height: 1px;
                background: #1593ff;
                opacity: 0;
                transition: all 0.3s;
            }
            &.add {
                .icon {
                    position: relative;
                    top: 2px;
                    font-size: 16px;
                }
            }
            .icon {
                position: relative;
                top: 1px;
                font-size: 16px;
            }
            &.more {
                white-space: nowrap;
                overflow-y: hidden;
                .icon {
                    display: inline-block;
                    position: relative;
                    top: 4px;
                    font-size: 20px;
                    transition: all 0.3s;
                }
                &.disable {
                    flex: 0;
                }
                &:hover {
                    .icon {
                        transform: rotate(180deg);
                    }
                }
            }
        }
    }
    .detail {
        display: flex;
        flex-wrap: wrap;
        position: relative;
        background: #fff;
        // overflow: hidden;
        transition: all 0.3s;
        &::after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 1px;
            background: #eceef0;
        }
        .item {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 144px;
            height: 40px;
            font-size: 12px;
            border-bottom: 1px solid #eceef0;
            cursor: pointer;
            z-index: 1; // 层级需要在最底下那根线的上面
            transition: all 0.3s;
            &:hover,
            &.active {
                span {
                    color: #1593ff;
                }
                .icon {
                    display: block;
                }
                border-bottom: 1px solid #1593ff;
            }
            .name {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                padding: 0 30px 0 16px;
                line-height: 40px;
            }
            .icon {
                position: absolute;
                right: 0;
                margin-right: 12px;
                display: none;
                font-size: 18px;
                transition: all 0.3s;
                &:hover {
                    color: $red-normal;
                }
            }
        }
    }
}
</style>
