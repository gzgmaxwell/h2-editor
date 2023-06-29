<template>
    <div class="eqc-dialog-tag dialog">
        <div class="head">
            <span>新建分组</span>
            <i
                class="close eqf-no"
                @click="cancel"
            />
        </div>
        <div class="content">
            <input
                v-model.trim="name"
                type="text"
                placeholder="分组名称"
                @keydown.enter="ok"
            >
            <div class="foot">
                <base-button
                    class="btn cancel white h36"
                    @click.native="cancel"
                >
                    取消
                </base-button>
                <base-button
                    class="btn ok blue h36"
                    @click.native="ok"
                >
                    确定
                </base-button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
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
    data() {
        return {
            name: ''
        }
    },
    methods: {
        cancel() {
            this.close()
        },
        ok() {
            if (!this.name) {
                this.name = '未命名'
            }
            this.close({ name: this.name })
        }
    }
}
</script>

<style lang="scss">
.eqc-dialog-tag {
    width: 360px;
    .content {
        padding: 28px;
        input {
            width: 100%;
            height: 36px;
            padding: 0 12px;
            color: #333;
            border: 1px solid #ccd5db;
            border-radius: 3px;
        }
        .foot {
            margin-top: 68px;
            display: flex;
            justify-content: flex-end;
            .btn {
                width: 96px;
            }
            .ok {
                margin-left: 16px;
            }
        }
    }
}
</style>
