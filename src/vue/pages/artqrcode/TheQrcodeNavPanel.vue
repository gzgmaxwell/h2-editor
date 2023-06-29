<template>
    <div class="eqc-qrcode-nav-panel">
        <div class="panel">
            <nav-art-qrcode-upload
                v-show="nav.selectedItem.type === 'upload'"
                :ref="nav.list[0].type"
                :item="nav.list[0]"
                :mode="mode"
                :close="close"
                :qrcode-key-out="qrcodeKeyOut"
                :qrcode-key-str-out="qrcodeKeyStrOut"
                :qrcode-text-out="qrcodeTextOut"
                :qrcode-element-out="qrcodeElementOut"
                :qrcode-complete-out="qrcodeCompleteOut"
                class="content"
            />
            <nav-art-qrcode-link
                v-show="nav.selectedItem.type === 'link'"
                :ref="nav.list[1].type"
                :item="nav.list[1]"
                :mode="mode"
                :close="close"
                :qrcode-key-out="qrcodeKeyOut"
                :qrcode-key-str-out="qrcodeKeyStrOut"
                :qrcode-text-out="qrcodeTextOut"
                :qrcode-element-out="qrcodeElementOut"
                :qrcode-complete-out="qrcodeCompleteOut"
                class="content"
            />
            <nav-art-qrcode-text
                v-show="nav.selectedItem.type === 'text'"
                :ref="nav.list[2].type"
                :item="nav.list[2]"
                :mode="mode"
                :close="close"
                :qrcode-key-out="qrcodeKeyOut"
                :qrcode-key-str-out="qrcodeKeyStrOut"
                :qrcode-text-out="qrcodeTextOut"
                :qrcode-element-out="qrcodeElementOut"
                :qrcode-complete-out="qrcodeCompleteOut"
                class="content"
            />
            <nav-art-qrcode-wechat
                v-show="nav.selectedItem.type === 'wechat'"
                :ref="nav.list[3].type"
                :item="nav.list[3]"
                :mode="mode"
                :close="close"
                :qrcode-key-out="qrcodeKeyOut"
                :qrcode-key-str-out="qrcodeKeyStrOut"
                :qrcode-text-out="qrcodeTextOut"
                :qrcode-element-out="qrcodeElementOut"
                :qrcode-complete-out="qrcodeCompleteOut"
                class="content"
            />
            <nav-art-qrcode-card
                v-show="nav.selectedItem.type === 'card'"
                :ref="nav.list[4].type"
                :item="nav.list[4]"
                :mode="mode"
                :close="close"
                :qrcode-key-out="qrcodeKeyOut"
                :qrcode-key-str-out="qrcodeKeyStrOut"
                :qrcode-text-out="qrcodeTextOut"
                :qrcode-element-out="qrcodeElementOut"
                :qrcode-complete-out="qrcodeCompleteOut"
                class="content"
            />
            <nav-art-qrcode-work
                v-show="nav.selectedItem.type === 'work'"
                :ref="nav.list[5].type"
                :item="nav.list[5]"
                :mode="mode"
                :close="close"
                :qrcode-key-out="qrcodeKeyOut"
                :qrcode-key-str-out="qrcodeKeyStrOut"
                :qrcode-text-out="qrcodeTextOut"
                :qrcode-element-out="qrcodeElementOut"
                :qrcode-complete-out="qrcodeCompleteOut"
                class="content"
            />
            <nav-art-qrcode-map
                v-show="nav.selectedItem.type === 'map'"
                :ref="nav.list[6].type"
                :item="nav.list[6]"
                :mode="mode"
                :close="close"
                :qrcode-key-out="qrcodeKeyOut"
                :qrcode-key-str-out="qrcodeKeyStrOut"
                :qrcode-text-out="qrcodeTextOut"
                :qrcode-element-out="qrcodeElementOut"
                :qrcode-complete-out="qrcodeCompleteOut"
                class="content"
            />
        </div>
    </div>
</template>

<script>
import NavArtQrcodeUpload from './navpanel/NavArtQrcodeUpload.vue'
import NavArtQrcodeText from './navpanel/NavArtQrcodeText.vue'
import NavArtQrcodeLink from './navpanel/NavArtQrcodeLink.vue'
import NavArtQrcodeWechat from './navpanel/NavArtQrcodeWechat.vue'
import NavArtQrcodeWork from './navpanel/NavArtQrcodeWork.vue'
import NavArtQrcodeCard from './navpanel/NavArtQrcodeCard.vue'
import NavArtQrcodeMap from './navpanel/NavArtQrcodeMap.vue'
import artQrcodeMode from '../../../config/enum.artQrcodeMode.type'

export default {
    components: {
        NavArtQrcodeUpload,
        NavArtQrcodeText,
        NavArtQrcodeLink,
        NavArtQrcodeWechat,
        NavArtQrcodeWork,
        NavArtQrcodeCard,
        NavArtQrcodeMap
    },
    props: {
        mode: {
            type: Number,
            default: null
        },
        close: {
            type: Function,
            default: null
        },
        // 传入的二维码图片url
        qrcodeKeyOut: {
            type: String,
            default: null
        },
        // 传入的base64二维码图片
        qrcodeKeyStrOut: {
            type: String,
            default: null
        },
        // 传入的二维码内容
        qrcodeTextOut: {
            type: String,
            default: null
        },
        // 传入的二维码组件元素
        qrcodeElementOut: {
            type: Object,
            default: null
        },
        qrcodeCompleteOut: {
            type: Function,
            default: null
        }
    },
    data() {
        return {
            artQrcodeMode: artQrcodeMode
        }
    },
    computed: {
        qrcode() {
            return Vue.store.state.artQrcode
        },
        nav() {
            return this.qrcode.qrcodeNav
        },
        qrcodeTemplateUse() {
            return this.qrcode.qrcodeTemplateUse
        }
    },
    watch: {
        qrcodeTemplateUse(newValue, oldValue) {
            this.$refs[this.nav.selectedItem.type].createQrcode(newValue)
        }
    },
    methods: {
    }
}
</script>

<style lang="scss">
.eqc-qrcode-nav-panel {
    position: relative;
    flex: none;
    width: 0;
    height: 100%;
    background: #fff;
    opacity: 0;
    transition: all 0.3s;
    z-index: 4; // 需要在header之上才有阴影
    width: 317px;
    opacity: 1;
    padding: 19px 24px;
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
    .panel {
        height: 100%;
        // overflow: hidden;
        > .content {
            height: 100%;
            width: 100%;
        }
    }
}
</style>
