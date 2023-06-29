<template>
    <div class="eqc-nav-artqrcode-help-btn">
        <div
            :class="['clear', clearActive?'active':'']"
            title="清空后可重新生成黑白二维码"
            @click="clearQrcode"
        >
            清空
        </div>
        <div
            class="helper"
            @click="showHelper"
        >
            帮助
        </div>
    </div>
</template>

<script>
import NavPanelHelper from './NavPanelHelper.vue'
import storageLocal from '../../../../../utils/storageLocal'
export default {
    components: {

    },
    props: {
        data: {
            type: Object,
            default: null
        },
        clear: {
            type: Function,
            default: () => {}
        }
    },
    data() {
        return {
            clearActive: null
        }
    },
    computed: {
        qrcode() {
            return Vue.store.state.artQrcode
        },
        qrcodeNav() {
            return this.qrcode.qrcodeNav
        },
        selectedItem() {
            return this.qrcodeNav.selectedItem
        }
    },
    watch: {
        'qrcodeNav.selectedItem.type': {
            handler(newVal) {
                const noAutoShow = storageLocal.getItem(storageLocal.key.qrcodeHelperShow)
                if (!noAutoShow && newVal === this.data.type) {
                    this.showHelper()
                }
            }
        },
        'qrcodeNav.selectedItem': {
            handler(newVal) {
                if (newVal.type === this.data.type) {
                    if (newVal.qrcodeKey && newVal.qrcodeKey !== null && newVal.qrcodeKey !== '') {
                        this.clearActive = true
                    } else {
                        this.clearActive = false
                    }
                }
            },
            deep: true
        }
    },
    created() {
        const noAutoShow = storageLocal.getItem(storageLocal.key.qrcodeHelperShow)
        if (!noAutoShow && this.selectedItem.type === this.data.type) {
            this.showHelper()
        }
        if (this.selectedItem.type === this.data.type) {
            if (this.selectedItem.qrcodeKey && this.selectedItem.qrcodeKey !== null && this.selectedItem.qrcodeKey !== '') {
                this.clearActive = true
            } else {
                this.clearActive = false
            }
        }
    },
    methods: {
        // 点击清空
        clearQrcode() {
            Vue.store.commit('QRCODE_KEY_CLEAR')
            this.clear()
        },
        showHelper() {
            Vue.dialog.open({
                component: NavPanelHelper,
                data: { type: this.data.type }
            }).then((data) => {}).catch(() => {})
        }
    }
}
</script>

<style lang="scss">
.eqc-nav-artqrcode-help-btn {
    display: flex;
    .clear {
        margin-right: 16px;
        font-size: 14px;
        font-weight: 400;
        color: #cccccc;
        cursor: default;
        &.active {
            color: rgba(118, 131, 143, 1);
            cursor: pointer;
            &:hover {
                color: #1593ff;
            }
        }
    }
    .helper {
        font-size: 14px;
        font-weight: 400;
        color: rgba(118, 131, 143, 1);
        cursor: pointer;
        &:hover {
            color: #1593ff;
        }
    }
}
</style>
