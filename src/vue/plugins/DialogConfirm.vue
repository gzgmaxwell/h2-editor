<template>
    <div class="eqc-dialog-confirm dialog">
        <div
            class="content"
            v-html="data.msg"
        />
        <div class="foot">
            <base-button
                :style="data.width?('width:'+data.width):''"
                class="btn blue h36 ok"
                @click.native="ok"
            >
                {{ data.confirmName || '确定' }}
            </base-button>
            <base-button
                class="btn white h36 cancel"
                @click.native="cancel"
            >
                {{ data.cancelName || '取消' }}
            </base-button>
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
    methods: {
        ok() {
            this.close({})
        },
        cancel() {
            this.close()
        }
    }
}
</script>

<style lang="scss">
.eqc-dialog-confirm {
    width: 460px;
    text-align: center;
    .content {
        font-size: 14px;
        color: #76838f;
        margin: 40px 0 50px;
        line-height: 24px;
    }
    .foot {
        margin: 20px 0;
        .btn {
            width: 90px;
        }
        .cancel {
            margin-left: 7px;
            vertical-align: top;
        }
    }
}
</style>
