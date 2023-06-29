<template>
    <div class="eqc-image-upload-manage">
        <div class="wrap">
            <div
                :class="{disable: !items.length}"
                class="opt all"
                @click="selectAll"
            >
                <base-checkbox
                    id="checkbox_upload_all"
                    v-model="isSelectedAll"
                />
                <label>全选</label>
            </div>
            <span
                :class="{disable: !isSelectedAny}"
                class="opt del"
                @click="deleteImages"
            >删除</span>
            <div
                :class="{disable: !isSelectedAny || !otherTags.length}"
                class="opt add-to"
                @mouseover="isShowDropDown = true"
                @mouseleave="isShowDropDown = false"
            >
                <span>添加到</span>
                <i class="icon eqf-right" />
                <base-drop-down
                    v-if="isShowDropDown && isSelectedAny && otherTags.length"
                    :list="otherTags"
                    :css="{left: '0px', bottom: '20px', paddingBottom: '10px', width: '144px', zIndex: 3}"
                    item-key="name"
                    @choose="chooseTag"
                />
            </div>
        </div>
        <span
            class="manage"
            @click="manage"
        >
            {{ uploadManage.show ? '关闭' : '管理' }}
        </span>
    </div>
</template>

<script>
export default {
    props: {
        items: {
            type: Array,
            default: null
        },
        tags: {
            type: Array,
            default: null
        },
        tagId: {
            type: Number,
            default: -1
        }
    },
    data() {
        return {
            isSelectedAny: false, // 是否有选中的
            isSelectedAll: false, // 是否全部选中
            isShowDropDown: false
        }
    },
    computed: {
        uploadManage() {
            return Vue.store.state.layout.uploadManage
        },
        otherTags() {
            return this.tags.filter(item => item.id !== this.tagId)
        }
    },
    watch: {
        items: {
            handler(newVal) {
                this.isSelectedAny = false
                this.isSelectedAll = false
                if (newVal && newVal.length) {
                    this.isSelectedAll = true
                }
                newVal.forEach(item => {
                    if (item.isSelected) {
                        this.isSelectedAny = true
                    } else {
                        this.isSelectedAll = false
                    }
                })
            },
            deep: true
        }
    },
    destroyed() {
        Vue.store.commit('LAYOUT_NAV_UPLOAD_MANAGE', { show: false })
    },
    methods: {
        manage() {
            Vue.store.commit('LAYOUT_NAV_UPLOAD_MANAGE', { show: !this.uploadManage.show })
            this.setItemsSelected(false)
        },
        setItemsSelected(isSelected) {
            this.items.forEach(item => this.$set(item, 'isSelected', isSelected))
        },
        selectAll() {
            this.setItemsSelected(!this.isSelectedAll)
        },
        deleteImages() {
            if (this.isSelectedAny) {
                const fileIds = []
                this.items.forEach(item => item.isSelected && fileIds.push(item.id))
                this.$emit('delete', fileIds)
            }
        },
        chooseTag(tag) {
            this.isShowDropDown = false
            this.$emit('addTo', tag)
        }
    }
}
</script>

<style lang="scss">
.eqc-image-upload-manage {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    > .wrap {
        display: inline-flex;
        align-items: center;
        .opt {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
            &:hover {
                color: $blue-normal;
            }
            &.all {
                justify-content: flex-start;
                width: 64px;
                label {
                    padding-left: 6px;
                    cursor: pointer;
                }
                &.disable {
                    pointer-events: none;
                    color: #999;
                }
            }
            &.del {
                width: 56px;
                height: 24px;
                border-left: 1px solid #ccd5db;
                border-right: 1px solid #ccd5db;
                cursor: pointer;
                &.disable {
                    pointer-events: none;
                    color: #999;
                }
                &:hover {
                    color: $red-normal;
                }
            }
            &.add-to {
                position: relative;
                width: 80px;
                cursor: pointer;
                &.disable {
                    pointer-events: none;
                    color: #999;
                }
                &:hover {
                    color: $blue-normal;
                    .icon {
                        transform: rotate(-90deg);
                    }
                }
                .icon {
                    position: relative;
                    top: -1px;
                    margin-left: 2px;
                    font-size: 20px;
                    transition: all 0.3s;
                }
            }
        }
    }
    .btn {
        width: 48px;
        font-size: 12px;
    }
    .manage {
        cursor: pointer;
        border-left: 1px solid #ccd5db;
        width: 96px;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        height: 24px;
        margin-right: -16px;
        &:hover {
            color: #ff296a;
        }
    }
}
</style>
