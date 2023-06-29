<template>
    <div class="eqc-dialog-operation dialog">
        <div
            ref="content"
            class="content"
            @click="open"
        />
        <i
            class="close eqf-no-l"
            @click="cancel"
        />
    </div>
</template>

<script>
import statistic from '../../config/statistic'
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
    mounted() {
        this.$refs.content.innerHTML = this.data.htmlStr
    },
    methods: {
        cancel() {
            this.close({})
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.OPD,
                statistic.opt_label.OPD.close])
        },
        open() {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.OPD,
                statistic.opt_label.OPD.open])
        }
    }
}
</script>

<style lang="scss">
.eqc-dialog-operation {
    width: 320px;
    height: 440px;
    overflow: hidden;
    background: transparent !important;
    box-shadow: none !important;
    .content {
        width: 100%;
        height: 100%;
        position: relative;
        a {
            width: 100%;
            height: 100%;
        }
        img {
            width: 100%;
            height: 100%;
        }
    }
    .close {
        font-size: 26px;
        position: absolute;
        top: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.2);
        color: #fff;
        border-radius: 30px;
        cursor: pointer;
    }
}
</style>
