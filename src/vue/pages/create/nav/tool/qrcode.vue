<template>
    <div class="eqc-tool-qrcode">
        <ul
            v-if="isReady"
            class="eqc-qrcode-list"
        >
            <li
                v-for="item of qrcodeList"
                :key="item.type"
            >
                <div
                    v-qrcode="{logo: true,imgSrc:item.imgSrc}"
                    class="item"
                    @click="addQrcode(1,item.qcType)"
                />
                <p>{{ item.name }}</p>
            </li>
        </ul>
    </div>
</template>

<script>
import elementType from '../../../../../config/enum.element.type'
import qrcodeType from '../../../../../config/enum.qrcode.type'
import qrcodeList from '../qrcode/qrcodeList'
import delayLoad from '../../../../../utils/delayLoad'
import loader from '../../../../../utils/loader'
import DialogLink from '../qrcode/DialogLink.vue'
import DialogText from '../qrcode/DialogText.vue'
import DialogCard from '../qrcode/DialogCard.vue'
import DialogWork from '../qrcode/DialogWork.vue'
import DialogMap from '../qrcode/DialogMap.vue'
import DialogWeChat from '../qrcode/DialogWeChat.vue'
import statistic from '../../../../../config/statistic'

export default {
    directives: {
        qrcode: {
            bind($el, binding) {
                const value = binding.value || {}
                const options = {
                    render: 'canvas',
                    ecLevel: 'H',
                    typeNumber: -1,
                    text: 'http://www.eqxiu.com',
                    size: 300
                }
                let promise = Promise.resolve()
                if (value.logo) {
                    promise = loader.image(value.imgSrc)
                        .then(image => {
                            Object.assign(options, {
                                mode: 4,
                                mSize: 30 * 0.01,
                                mPosX: 50 * 0.01,
                                mPosY: 50 * 0.01,
                                image
                            })
                        })
                }
                promise
                    .then(() => {
                        const $image = window.$('<div>').qrcode(options).children().get(0)
                        $el.appendChild($image)
                    })
                    .catch(err => err && Vue.logger.error(err))
            }
        }
    },
    data() {
        return {
            isReady: false,
            qrcodeList
        }
    },
    computed: {
        nav() {
            return this.$store.state.layout.nav
        },
        eqxPage() {
            return this.$store.state.scene.eqxPage
        },
        scale() {
            return this.eqxPage.scale
        },
        userInfo() {
            return this.$store.state.user.userInfo
        },
        showComponentWarning() {
            return this.user.allow('showComponentWarning')
        }
    },
    created() {
        delayLoad.delayLoadJS(this.env.plugin.jquery)
            .then(() => delayLoad.delayLoadJS(this.env.plugin.qrcode))
            .then(() => {
                this.isReady = true
            })
            .catch(err => err && this.logger.error(err))
    },
    methods: {
        addQrcode(type, qcType) {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.QR,
                qcType])

            if (!this.userInfo.id && qcType === qrcodeType.work) {
                this.notifier.info('我的作品需登录后才能使用')
                return
            }
            const scale = this.scale
            const displaySize = 180 / scale
            const { left, top } = this.eqxPage.getElementPosOfCenter(displaySize, displaySize, scale)
            const elementJson = {
                type: elementType.qrcode,
                property: {
                    type,
                    qcType,
                    foregroundColor: '#000000',
                    backgroundColor: '#ffffff'
                },
                css: {
                    left: Math.round(left) + 'px',
                    top: Math.round(top) + 'px',
                    width: Math.round(displaySize) + 'px',
                    height: Math.round(displaySize) + 'px',
                    borderWidth: Math.round(6 / scale) + 'px'
                }
            }
            if (qcType === qrcodeType.card) {
                elementJson.property.card = {
                    name: '',
                    phone: ''
                }
            }
            let Dialog = null
            let data = {}
            switch (qcType) {
                case qrcodeType.work:Dialog = DialogWork
                    break
                case qrcodeType.link:Dialog = DialogLink
                    break
                case qrcodeType.map:Dialog = DialogMap
                    break
                case qrcodeType.card:Dialog = DialogCard
                    data = {
                        name: '',
                        phone: ''
                    }
                    break
                case qrcodeType.text:Dialog = DialogText
                    break
                case qrcodeType.wechat:Dialog = DialogWeChat
                    break
            }
            if (this.showComponentWarning) {
                Vue.notifier.warn('小程序无法支持二维码组件', 8)
            }
            Vue.dialog.open({
                component: Dialog,
                data
            }).then((data) => {
                elementJson.property = Object.assign(elementJson.property, data)
                this.eqxPage.addElement(elementJson)
                this.eqxPage.eqxHistory.add(this.eqxPage)
                // 公众号二维码来自微信不需要设置logo
                if (qcType !== qrcodeType.wechat) {
                    this.notifier.info('从左侧上传或素材中拖拽图片到二维码上可设置logo')
                }
            }).catch(() => {})
            if (type) {
                this.$store.commit('LAYOUT_NAV_PANEL', { show: true })
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-tool-qrcode {
    position: relative;
    .eqc-qrcode-list {
        padding: 12px 16px 16px 16px;
        li {
            float: left;
            margin-bottom: 8px;

            p {
                width: 124px;
                height: 40px;
                line-height: 40px;
                text-align: center;
                color: #2f3c4d;
            }
        }
        :last-child {
            margin-bottom: 0;
        }
        li:nth-child(odd) {
            margin-right: 8px;
        }
        .item {
            width: 124px;
            height: 124px;
            padding: 12px;
            cursor: pointer;
            border-radius: 3px;
            &:hover {
                box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
            }
            canvas {
                width: 100%;
                height: 100%;
            }
        }
    }
}
</style>
