<template>
    <div class="eqc-qrcode-header">
        <ul
            class="list"
        >
            <li
                v-for="(item,i) of list"
                v-show="item.visible"
                :key="i"
                :class="{selected: mode === artQrcodeMode.independent && selectedTemplateType === item.name}"
                @click="listItemClick(item)"
            >
                <img
                    v-if="i === 2"
                    :src="(mode === artQrcodeMode.independent && selectedTemplateType === item.name) ? qrcodeIconFoucs : item.icon"
                    class="icon"
                >
                <i
                    v-else
                    :class="item.icon"
                    class="icon"
                />
                <span>{{ item.name }}</span>
            </li>
        </ul>
        <ul class="operation">
            <li
                v-if="mode === artQrcodeMode.independent && buyMemberAuth"
                class="btn members"
                @click="toMembers"
            >
                <i class="eqf-vipdiamond-f" />&nbsp;升级去水印
            </li>
            <li
                v-if="mode === artQrcodeMode.independent && buyMemberAuth"
                class="line"
            />
            <li
                class="btn qrcodelib"
                @click="toQrcodeLib"
            >
                存入二维码库
            </li>
            <li
                v-if="mode !== artQrcodeMode.setting"
                class="line"
            />
            <li
                v-if="mode === artQrcodeMode.tool"
                :style="{'padding-right':'35px'}"
                class="btn insert"
                @click="insert"
            >
                <div>插入画布</div>
                <div
                    class="insert-why hint--bottom hint--rounded"
                    data-hint="插入画布不显示水印"
                >
                    <i class="eqf-why-l" />
                </div>
            </li>
            <li
                v-if="mode !== artQrcodeMode.setting"
                class="line"
            />
            <li
                v-if="mode !== artQrcodeMode.setting"
                class="btn download"
                @click="downloadClick"
            >
                下载
            </li>
            <li
                v-if="mode === artQrcodeMode.independent"
                class="exit hint--bottom-left hint--rounded"
                data-hint="回到我的作品"
                @click="exit"
            >
                退出
            </li>
            <li
                v-if="mode === artQrcodeMode.setting"
                class="line"
            />
            <li
                v-if="mode === artQrcodeMode.setting"
                class="btn finish"
                @click="finish"
            >
                完成
            </li>
            <li
                v-if="mode !== artQrcodeMode.independent"
                class="close"
                @click="closeQrcode()"
            >
                <i class="eqf-no" />
            </li>
        </ul>
    </div>
</template>

<script>
import artQrcodeMode from '../../../config/enum.artQrcodeMode.type'
import statistic from '../../../config/statistic'
import imgToBase64 from '../../../utils/imgToBase64'
import { dataURL2Blob } from '../../../utils/blob'
import util from '../../../utils/util'
import elementType from '../../../config/enum.element.type'
import qrcodeType from '../../../config/enum.qrcode.type'
import qrcodeIconFoucs from '../../../img/qrcodeicon_f.gif'
import qrcodeIconNomal from '../../../img/qrcodeicon_n.gif'

export default {
    props: {
        mode: {
            type: Number,
            default: null
        },
        close: {
            type: Function,
            default: null
        },
        download: {
            type: Function,
            default: () => {}
        },
        finish: {
            type: Function,
            default: () => {}
        }
    },
    data() {
        return {
            artQrcodeMode,
            qrcodeIconFoucs,
            qrcodeIconNomal,
            list: [{ name: '基础', icon: 'eqf-template-l', visible: true }, { name: '立体', icon: 'eqf-box-l', visible: false }, { name: '动态', icon: qrcodeIconNomal, visible: false }]
        }
    },
    computed: {
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        buyMemberAuth() {
            return !(this.userInfo.members && this.userInfo.members.some(item => [14].includes(item.memberId))) && this.user.allow('buyMember')
        },
        scene() {
            return Vue.store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        scale() {
            return this.eqxPage.scale
        },
        qrcode() {
            return Vue.store.state.artQrcode
        },
        selectedTemplateType() {
            return this.qrcode.selectedTemplateType
        },
        // 当前导航栏
        nav() {
            return this.qrcode.qrcodeNav
        },
        // 当前左侧选中的二维码的类型
        selectedItem() {
            return this.nav.selectedItem
        }
    },
    created() {
        if (this.mode === this.artQrcodeMode.independent) {
            this.list[0].visible = true
            this.list[1].visible = true
            this.list[2].visible = true
        }
        if (this.selectedTemplateType === '') {
            Vue.store.commit('QRCODE_SELECTED_TEMPLATE_TYPE', this.list[0].name)
        }
    },
    methods: {
        listItemClick(item) {
            Vue.store.commit('QRCODE_SELECTED_TEMPLATE_TYPE', item.name)
        },
        closeQrcode() {
            this.close()
        },
        exit() {
            if (this.userInfo.id) {
                window.location.href = `${Vue.env.host.auth}/eip/scene?type=h2`
            } else {
                this.$router.push({ path: '/visit' })
            }
        },
        toMembers() {
            if (this.buyMemberAuth) {
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.MBTN])

                const options = {}
                this.dialog.openMember(options).then(res => {
                    if (res.success) {
                        this.notifier.success('支付成功')
                    } else {
                        this.notifier.fail('支付失败')
                    }
                }).catch(err => {
                    err && this.logger.error(err)
                })
            } else {
                this.notifier.info('该功能为创意云会员和营销云会员专属权益')
            }
        },
        // 下载点击
        downloadClick() {
            if (!util.login()) {
                return
            }
            if (this.selectedItem.qrcodeTemplate !== null) {
                this.download()
            } else {
                this.downNormalQrcode()
            }
        },
        // 下载普通二维码
        downNormalQrcode() {
            const key = this.selectedItem.qrcodeKey
            if (key === null || key === '') {
                this.notifier.warn('请先生成二维码')
                return
            }
            imgToBase64(Vue.env.host.file + key).then(base64Str => {
                const fileName = '轻设计_二维码.png'
                const url = URL.createObjectURL(dataURL2Blob(base64Str))
                util.downloadFile(fileName, url)
            })
        },
        insert() {
            const key = this.selectedItem.qrcodeKey
            if (key === null || key === '') {
                this.notifier.warn('请先生成二维码')
                return
            }
            this.insertCanvas()
        },
        insertCanvas() {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.ARTQRCODE,
                statistic.opt_label.ARTQRCODE.addToCanvas])
            const qrcodeStyle = this.selectedItem.qrcodeTemplate
            const scale = this.scale
            const displaySize = 180 / scale
            const { left, top } = this.eqxPage.getElementPosOfCenter(displaySize, displaySize, scale)
            const cover = qrcodeStyle !== null ? qrcodeStyle.template.productTypeMap.cover : null
            const elementJson = {
                type: elementType.qrcode,
                property: {
                    art: qrcodeStyle !== null ? qrcodeStyle.elementJson.property.art : null,
                    src: this.selectedItem.qrcodeKey,
                    type: 0, // type: 0 无图片, 1 有图片
                    qcType: this.selectedItem.qrcodeType,
                    foregroundColor: '#000000',
                    backgroundColor: '#ffffff',
                    isArt: qrcodeStyle !== null,
                    cover: qrcodeStyle !== null ? JSON.parse(cover)[0][Object.keys(JSON.parse(cover)[0])[0]] : null
                },
                css: {
                    left: Math.round(left) + 'px',
                    top: Math.round(top) + 'px',
                    width: Math.round(displaySize) + 'px',
                    height: Math.round(displaySize) + 'px',
                    borderWidth: '0px'
                }
            }
            if (this.selectedItem.qrcodeType === qrcodeType.card) {
                const content = this.selectedItem.qrcodeText
                const startIndex = content.indexOf('TEL')
                const endIndex = content.indexOf('END')
                const name = content.substr(19, startIndex - 2 - 19)
                const phone = content.substr(startIndex + 15, endIndex - startIndex - 18)

                elementJson.property.card = {
                    name: name,
                    phone: phone
                }
            }
            if (this.selectedItem.qrcodeType === qrcodeType.wechat) {
                elementJson.property = Object.assign(elementJson.property, { name: this.selectedItem.qrcodeUserInput })
            }
            elementJson.property = Object.assign(elementJson.property, { text: this.selectedItem.qrcodeText })
            this.eqxPage.addElement(elementJson)
            this.eqxPage.eqxHistory.add(this.eqxPage)
            this.close()
        },
        // 导出到二维码库
        toQrcodeLib() {
            const key = this.selectedItem.qrcodeKey
            if (key === null || key === '') {
                this.notifier.warn('请先生成二维码')
                return
            }
            Vue.api.tag.getTags()
                .then(res => {
                    const tags = res.data.list.filter(v => v.name === '二维码')
                    if (tags && tags.length > 0) {
                        return tags[0].id
                    } else {
                        return -1
                    }
                })
                .then((tagId) => {
                    const urlArr = [{
                        extName: 'png',
                        path: key.split('?')[0],
                        name: key.split('?')[0],
                        tmbPath: key.split('?')[0]
                    }]
                    Vue.api.file.saveToH5(tagId, urlArr, 0)
                        .then((res) => {
                            Vue.notifier.info('导出成功，在长页二维码库可查看')
                        })
                        .catch(err => {
                            err && Vue.logger.error(err)
                            Vue.notifier.info('导出失败，请稍后重试')
                        })
                })
                .catch(err => err && Vue.logger.error(err))
        }
    }
}
</script>

<style lang="scss">
.eqc-qrcode-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    height: 60px;
    font-size: 13px;
    color: #4f5d69;
    background: #ffffff;
    z-index: 2; // 需要在标尺之上才有阴影
    cursor: default;
    padding-left: 36px;
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
    .list {
        list-style: none;
        line-height: 60px;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: center;
        > li {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            width: 54px;
            height: 59px;
            text-align: center;
            font-size: 14px;
            color: rgba(47, 60, 77, 1);
            margin-right: 24px;
            border-bottom: 2px solid #fff;
            .icon {
                font-size: 20px;
                width: 20px;
            }
        }
        .selected {
            color: rgba(21, 147, 255, 1);
            border-bottom: 2px solid rgba(21, 147, 255, 1);
        }
    }
    .operation {
        height: 60px;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: center;
        > li.btn {
            padding: 11px 20px;
            position: relative;
        }
        .line {
            width: 1px;
            height: 20px;
            background: rgba(230, 235, 237, 1);
        }
        .members {
            color: #c09659;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            cursor: pointer;
            &:hover {
                color: #3f362f;
            }
        }
        .download,
        .finish {
            width: 92px;
            height: 40px;
            padding: 0;
            background: #1593ff;
            color: #ffffff;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            cursor: pointer;
            &:hover {
                background: #1593ff;
                color: #ffffff;
            }
        }
        .qrcodelib,
        .insert {
            color: rgba(47, 60, 77, 1);
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            cursor: pointer;
            &:hover {
                color: #1593ff;
            }
        }
        .insert-why {
            margin-top: 2px;
        }
        .exit {
            margin: 0 24px 0 12px;
            width: 36px;
            height: 36px;
            color: #252b3f;
            border-radius: 3px;
            display: flex;
            justify-content: center;
            align-items: center;
            &:hover {
                color: #ff2a6a;
            }
        }
        .close {
            margin: 0 24px 0 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 28px;
            height: 28px;
            font-size: 22px;
            color: #fff;
            background: #252b3f;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s;
            &:hover {
                background: #ff2a6a;
            }
        }
    }
}
</style>
