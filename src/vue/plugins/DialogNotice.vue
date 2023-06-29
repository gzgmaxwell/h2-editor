<template>
    <div class="eqc-dialog-notice dialog">
        <div
            class="content"
            v-html="data.msg"
        />
        <div class="foot">
            <base-button
                class="btn blue h36 ok"
                @click.native="ok"
            >
                {{ data.btnName || '确定' }}
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
        }
    }
}
</script>

<style lang="scss">
.eqc-dialog-notice {
    width: 460px;
    text-align: center;
    .content {
        font-size: 14px;
        color: #76838f;
        margin: 40px 0 40px;
        padding: 0 40px;
        line-height: 20px;
    }
    .foot {
        margin: 20px 0;
        .btn {
            width: 179px;
        }
    }
}
</style>
