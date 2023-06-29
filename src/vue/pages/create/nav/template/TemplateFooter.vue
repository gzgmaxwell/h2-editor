<template>
    <div class="eqc-nav-template-footer">
        <div v-if="mode===2">
            <span
                class="all-row"
                @click="wantMore"
            >没有想要的模板？</span>
        </div>
        <div v-if="mode===1">
            <span
                class="item"
                @click="wantMore"
            >没有想要的模板？</span>
            <span class="line" />
            <span
                v-show="!templateCateogry.show"
                class="item open"
                @click="allTemplate"
            >全部分类 <i class="icon eqf-right" /> </span>
            <span
                v-show="templateCateogry.show"
                class="item close"
                @click="allTemplate"
            >收起分类 <i class="icon eqf-left" /> </span>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            mode: 1
        }
    },
    computed: {
        templateCateogry() {
            return Vue.store.state.layout.templateCateogry
        }
    },
    methods: {
        wantMore() {
            window.open('//h5.ebdan.net/ls/nWbNGs3A')
        },
        allTemplate() {
            Vue.store.commit('TEMPLATE_CATEGORY', { show: !this.templateCateogry.show })
        },
        setMode(pMode) {
            this.mode = pMode
        }
    }
}
</script>
<style lang="scss">
.eqc-nav-template-footer {
    position: absolute;
    left: 0;
    bottom: 0;
    background: #fff;
    height: 48px;
    border-top: 1px solid #ccd5db;
    width: 100%;
    div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        height: 100%;
        .all-row {
            width: 100%;
            height: 100%;
            text-align: center;
            line-height: 47px;
            &:hover {
                color: rgba(21, 147, 255, 1);
            }
        }
        .line {
            width: 1px;
            height: 24px;
            background: #ccd5db;
        }
        .item {
            width: 49%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            color: #252b3f;
            cursor: pointer;
            i.eqf-right {
                margin-left: 3px;
                font-size: 16px;
            }
            i.eqf-left {
                color: rgba(21, 147, 255, 1);
                margin-left: 3px;
                font-size: 16px;
            }
            &.close {
                color: rgba(21, 147, 255, 1);
            }
            &:hover {
                color: rgba(21, 147, 255, 1);
            }
        }
    }
}
</style>
