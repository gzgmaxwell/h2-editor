<template>
    <div class="eqc-search">
        <div class="wrap">
            <input
                v-model="model[modelKey]"
                :placeholder="model.placeholder?model.placeholder:'请输入关键字'"
                maxlength="20"
                class="text"
                type="text"
                @mousedown="mousedown"
                @keydown.enter="search"
            >
            <i
                v-show="showIconOk"
                class="icon ok eqf-search-l"
                @click="search"
            />
            <i
                v-show="showIconCancel"
                class="icon cancel eqf-no"
                @click="cancel"
            />
        </div>
    </div>
</template>

<script>
export default {
    props: {
        onSearch: {
            type: Function,
            default: null
        },
        omMousedown: {
            type: Function,
            default: () => {}
        },
        model: {
            type: Object,
            default: null
        },
        modelKey: {
            type: String,
            default: 'keyWords'
        }
    },
    data() {
        return {
            showIconOk: true,
            showIconCancel: false
        }
    },
    methods: {
        search() {
            this.onSearch()
            if (this.model[this.modelKey].length) {
                this.showIconOk = false
                this.showIconCancel = true
            } else {
                this.showIconOk = true
                this.showIconCancel = false
            }
        },
        mousedown() {
            this.omMousedown()
        },
        cancel() {
            this.model[this.modelKey] = ''
            this.search()
        }
    }
}
</script>

<style lang="scss">
.eqc-search {
    padding: 16px 16px 0 16px;
    .wrap {
        position: relative;
        .text {
            width: 100%;
            height: 36px;
            line-height: 36px;
            padding: 0 35px 0 12px;
            border-radius: 3px;
            border: 1px solid #ccd5db;
            color: #2f3c4d;
            &::-webkit-input-placeholder {
                color: #4f5d69;
            }
        }
        .icon {
            position: absolute;
            right: 0;
            top: 0;
            width: 36px;
            height: 36px;
            font-size: 18px;
            color: #a3afb7;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
            &:hover {
                &.ok {
                    color: #1593ff;
                }
                &.cancel {
                    color: #ff2a6a;
                }
            }
        }
    }
}
</style>
