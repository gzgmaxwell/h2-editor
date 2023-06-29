<template>
    <div
        v-if="item.price !== 0 ||(item.attrMap && item.attrMap.memberFreeFlag)"
        class="eqc-material-others"
    >
        <!-- 秀点 -->
        <div
            v-if="item.price && item.price !== 0"
            class="showMoney"
        >
            {{ item.price +'秀点' }}
        </div>
        <!-- 会免 -->
        <div
            v-if="item.attrMap && item.attrMap.memberFreeFlag"
            class="member-free"
        />
    </div>
</template>
<script>
export default {
    props: {
        item: {
            type: Object,
            default: null
        }
    }
}
</script>
<style lang="scss">
.eqc-material-others {
    position: absolute;
    width: 100%;
    height: 100%;
    .member-free {
        float: right;
        width: 40px;
        height: 40px;
        background: url("../../../../../img/free.png") center center/cover;
    }
    .showMoney {
        position: absolute;
        right: 4px;
        bottom: 4px;
        background: #000;
        opacity: 0.8;
        height: 20px;
        border-radius: 10px;
        font-size: 12px;
        line-height: 20px;
        padding: 0 4px;
        color: white;
    }
}
</style>
