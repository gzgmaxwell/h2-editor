<template>
    <div class="eqc-qrcode">
        <the-qrcode-nav
            :mode="mode"
            :qrcode-key-out="qrcodeKeyOut"
            :qrcode-key-str-out="qrcodeBase64StrOut"
            :qrcode-text-out="qrcodeTextOut"
            :qrcode-element-out="qrcodeElementOut"
        />
        <the-qrcode-nav-panel
            :close="close"
            :qrcode-key-out="qrcodeKeyOut"
            :qrcode-key-str-out="qrcodeBase64StrOut"
            :qrcode-text-out="qrcodeTextOut"
            :qrcode-element-out="qrcodeElementOut"
            :qrcode-complete-out="qrcodeCompleteOut"
            :mode="mode"
        />
        <div class="right">
            <the-qrcode-head
                :mode="mode"
                :close="close"
                :download="download"
                :finish="finish"
            />
            <div class="content">
                <the-qrcode-template-list />
            </div>
        </div>
        <div
            class="eqc-qrcode-download"
        >
            <the-qrcode-download
                v-if="showDownLoad"
                :mode="mode"
                :back="back"
                @setDownLoadCache="setDownLoadCache"
            />
        </div>
    </div>
</template>

<script>
import TheQrcodeNav from './TheQrcodeNav.vue'
import TheQrcodeNavPanel from './TheQrcodeNavPanel.vue'
import TheQrcodeHead from './TheQrcodeHead.vue'
import TheQrcodeTemplateList from './TheQrcodeTemplateList.vue'
import artQrcodeMode from '../../../config/enum.artQrcodeMode.type'
import TheQrcodeDownload from './TheQrcodeDownload.vue'
import statistic from '../../../config/statistic'
import qrcodeType from '../../../config/enum.qrcode.type'

export default {
    components: {
        TheQrcodeNav,
        TheQrcodeNavPanel,
        TheQrcodeHead,
        TheQrcodeTemplateList,
        TheQrcodeDownload
    },
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
            mode: this.data ? this.data.mode : artQrcodeMode.independent,
            // 二维码的key
            qrcodeKeyOut: this.data ? this.data.qrcodeKey : null,
            // 二维码的base64
            qrcodeBase64StrOut: this.data ? this.data.qrcodeBase64Str : null,
            // 二维码的文本
            qrcodeTextOut: this.data ? this.data.qrcodeText : null,
            // 二维码的元素
            qrcodeElementOut: this.data ? this.data.qrcodeElement : null,
            // 点击完成事件
            qrcodeCompleteOut: this.data ? this.data.qrcodeComplete : null,
            // 是否显示下载页面
            showDownLoad: false,
            // 下载页面缓存数据
            downLoadCache: {}
        }
    },
    computed: {
        qrcode() {
            return Vue.store.state.artQrcode
        },
        qrcodeTemplateUse() {
            return this.qrcode.qrcodeTemplateUse
        },
        nav() {
            return this.qrcode.qrcodeNav
        },
        // 当前左侧选中的二维码的类型
        selectedItem() {
            return this.nav.selectedItem
        }
    },
    created() {
        if (this.mode !== artQrcodeMode.independent) {
            return
        }
        // 如果是入口1则需要添加水印权限
        if (Vue.store.state.user.userInfo.id) {
            // 处理logo的显示时间// 拿到用户分享的权益 用于判断是不是加水印
            const shareId = Vue.env.benefits.shareWithoutWM
            Vue.api.user.getUserBenefits(shareId).then(data => {
                if (data.data.list.length > 0) {
                // 有这个权益
                    Vue.store.commit('USER_WATER_RIGHT', true)
                } else {
                    Vue.store.commit('USER_WATER_RIGHT', false)
                }
            })
        } else {
            // 游客模式默认添加水印
            Vue.store.commit('USER_WATER_RIGHT', false)
        }
    },
    methods: {
        download() {
            this.showDownLoad = true
            document.querySelector('.eqc-qrcode-download').css({
                transition: 'all 0.3s',
                transform: 'translateX(100%)'
            })
        },
        back(pOption) {
            this.showDownLoad = false
            document.querySelector('.eqc-qrcode-download').css({
                transition: 'all 0.3s',
                transform: 'translateX(0)'
            })
            if (pOption === 1) {
                this.close()
            }
        },
        finish() {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.ARTQRCODE,
                statistic.opt_label.ARTQRCODE.complete])
            this.qrcodeElementOut.elementJson.property.isArt = this.qrcodeTemplateUse !== null
            this.qrcodeElementOut.elementJson.property.src = this.selectedItem.qrcodeKey
            this.qrcodeElementOut.elementJson.property.qcType = this.selectedItem.qrcodeType
            this.qrcodeElementOut.elementJson.property.text = this.selectedItem.qrcodeText
            if (this.qrcodeTemplateUse !== null) {
                this.qrcodeElementOut.elementJson.css.borderWidth = this.qrcodeTemplateUse.elementJson.css.borderWidth
                this.qrcodeElementOut.elementJson.property.art = this.qrcodeTemplateUse.elementJson.property.art
                this.qrcodeElementOut.elementJson.property.cover = this.selectedItem.qrcodeKey
            } else {
                this.qrcodeElementOut.elementJson.css.borderWidth = null
                this.qrcodeElementOut.elementJson.property.art = null
                this.qrcodeElementOut.elementJson.property.cover = null
            }
            if (this.selectedItem.qrcodeType === qrcodeType.card) {
                const content = this.selectedItem.qrcodeText
                const startIndex = content.indexOf('TEL')
                const endIndex = content.indexOf('END')
                const name = content.substr(19, startIndex - 2 - 19)
                const phone = content.substr(startIndex + 15, endIndex - startIndex - 18)
                this.qrcodeElementOut.elementJson.property.card = {
                    name: name,
                    phone: phone
                }
                delete this.qrcodeElementOut.elementJson.property.name
            } else if (this.selectedItem.qrcodeType === qrcodeType.wechat) {
                this.qrcodeElementOut.elementJson.property = Object.assign(this.qrcodeElementOut.elementJson.property, { name: this.selectedItem.qrcodeUserInput })
                delete this.qrcodeElementOut.elementJson.property.card
            } else {
                delete this.qrcodeElementOut.elementJson.property.card
                delete this.qrcodeElementOut.elementJson.property.name
            }
            this.qrcodeElementOut.updateProperty()
            this.qrcodeCompleteOut()
            this.close()
        },
        setDownLoadCache(key, value) {
            this.downLoadCache[key] = value
        }
    }
}
</script>

<style lang="scss">
$min-width: 844px;
.eqc-qrcode {
    .eqc-qrcode-download {
        position: absolute;
        z-index: 6;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: rgba($color: #000000, $alpha: 0.3);
    }
    display: flex;
    height: 100%;
    overflow: hidden;
    > .right {
        min-width: $min-width;
        flex: 1;
        background: rgba(236, 238, 240, 1);
        > .content {
            min-width: $min-width;
            display: flex;
            position: relative;
            height: calc(100% - 60px);
        }
    }
}
</style>
