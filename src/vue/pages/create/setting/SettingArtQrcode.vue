<template>
    <div class="eqc-setting-art-qrcode">
        <!--文本、链接-->
        <div
            v-if="[qrcodeType.link, qrcodeType.text].includes(qcTypeSelected)"
            class="name"
        >
            {{ qcTypeSelected === qrcodeType.text?'文本':'链接地址' }}
        </div>
        <input
            v-if="[qrcodeType.link, qrcodeType.text].includes(qcTypeSelected)"
            v-model="property.text"
            :placeholder="qcTypeSelected === qrcodeType.text?'请输入文本':'请输入链接地址'"
            :style="{border: property.text&&property.text.length === 0 ? '1px solid #ff296a': '1px solid rgb(204, 213, 219)'}"
            type="text"
            class="text"
        >
        <!--名片-->
        <div
            v-if="qcTypeSelected === qrcodeType.card"
            class="name"
        >
            姓名
        </div>
        <input
            v-if="qcTypeSelected === qrcodeType.card"
            v-model="property.card.name"
            :style="{border: property.card.name.length === 0 ? '1px solid #ff296a': '1px solid rgb(204, 213, 219)'}"
            placeholder="请输入姓名"
            class="text"
            type="text"
        >
        <div
            v-if="qcTypeSelected === qrcodeType.card"
            class="name"
        >
            手机号
        </div>
        <input
            v-if="qcTypeSelected === qrcodeType.card"
            v-model="property.card.phone"
            :style="{border: property.card.phone.length === 0 ? '1px solid #ff296a': '1px solid rgb(204, 213, 219)'}"
            placeholder="请输入手机号"
            class="text"
            type="text"
        >
        <!--作品-->
        <div
            v-if="qcTypeSelected === qrcodeType.work"
            class="btn qr-btn"
            @click="showDialog(DialogWork)"
        >
            选择作品
        </div>
        <!--地图-->
        <div
            v-if="qcTypeSelected === qrcodeType.map"
            class="btn qr-btn"
            @click="showDialog(DialogMap)"
        >
            选择地址
        </div>
        <!--公众号-->
        <div
            v-if="qcTypeSelected === qrcodeType.wechat"
            class="btn qr-btn"
            @click="showDialog(DialogWeChat)"
        >
            更改公众号
        </div>
        <!--弹窗编辑器不开放下列设置-->
        <div v-if="!expressMode">
            <!-- 艺术二维码 -->
            <div class="name">
                艺术二维码
            </div>
            <div
                class="artPanel"
            >
                <div
                    v-if="!cover"
                    class="img nostyle"
                    @click="openArtPanel"
                />
                <div
                    v-if="cover"
                    :style="{background:`${getBackgroundImage(cover)} no-repeat center/contain`}"
                    class="img"
                    @click="openArtPanel"
                />
                <div class="btns">
                    <div
                        class="change-style"
                        @click="openArtPanel"
                    >
                        更换模板
                    </div>
                    <div
                        class="change-style"
                        @click="toNormalQrcode"
                    >
                        普通二维码
                    </div>
                </div>
            </div>
            <div
                v-show="property.isArt"
                class="show-mode"
            >
                <span
                    :class="[`${!isThreeD?'active':'dis-active'}`]"
                    @click="threeD(2)"
                >平铺显示</span>
                <span
                    :class="[`${isThreeD?'active':'dis-active'}`]"
                    @click="threeD(3)"
                >立体显示</span>
            </div>
            <div
                v-if="!property.isArt"
                class="qr-logo"
            >
                <div class="name">
                    中央图标
                </div>
                <div class="wrapper">
                    <div
                        :style="{background: showCenterIcon ? `${getBackgroundImage(property.centerIcon)} no-repeat center/contain`:'white'}"
                        class="left"
                        @click="replaceIcon"
                    >
                        <i

                            class="icon eqf-plus"
                        />
                    </div>
                    <div class="right">
                        <div
                            class="btn-area"
                        >
                            <base-button
                                class="white h30 w72"
                                @click.native="cancelLogo"
                            >
                                取消
                            </base-button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 以下要秀客和超级管理员才能看,且为艺术二维码-->
            <div v-if="showArtQrcode && property.isArt">
                <div class="line" />
                <div class="desc">
                    <span>替换以下元素，可自定义艺术 二维码样式</span>
                    <span @click="gotoTeach">教程 >></span>
                </div>
                <!-- 批量上传 -->
                <div
                    v-upload="batchUploadOptions"
                    class="batch"
                    @click="batchClick"
                >
                    <div
                        ref="batch"
                        class="progress"
                    />
                    <span>批量上传</span>
                </div>
                <!-- 配置艺术二维码 -->
                <div
                    v-for="(item,i) in artConfig"
                    :key="i"
                >
                    <div class="name">
                        {{ item.label }}
                    </div>
                    <div class="wrapper">
                        <div
                            v-upload="item.name === 'border'?borderUploadOptions:uploadOptions"
                            :style="{background:materials[item.name]?`${getBackgroundImage(materials[item.name])} no-repeat center/contain`:'white'}"
                            class="left"
                            @click="addOrReplace(item)"
                        >
                            <i
                                v-if="!materials[item.name]"
                                class="icon eqf-plus"
                            />
                        </div>
                        <i
                            v-if="materials[item.name]"
                            class="eqf-no-f cancel"
                            @click="cancelClick(item)"
                        />
                        <div class="right">
                            <div class="descpx">
                                {{ item.desc }}
                            </div>
                            <div
                                v-upload="uploadOptions"
                                class="btn-area"
                            >
                                <div
                                    :ref="item.name"
                                    class="progress"
                                />
                                <base-button
                                    class="white h30 w72"
                                    @click.native="addOrReplace(item)"
                                >
                                    {{ materials[item.name] ? '替换' : '添加' }}
                                </base-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import qrcodeType from '../../../../config/enum.qrcode.type'
import artCodeInit from '../../../../utils/initArtQrcode'
import DialogWork from '../nav/qrcode/DialogWork.vue'
import IndexQrcode from '../../../pages/artqrcode/IndexQrcode.vue'
import artQrcodeMode from '../../../../config/enum.artQrcodeMode.type'
import DialogMap from '../nav/qrcode/DialogMap.vue'
import DialogWeChat from '../nav/qrcode/DialogWeChat.vue'
export default {
    props: {
        element: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            isThreeD: null, // 是否是立体
            DialogMap,
            DialogWork,
            DialogWeChat,
            qrcodeType,
            chooseItem: {
                name: '',
                active: false
            },
            canAllowRePaint: true,
            artConfig: [
                {
                    label: '边框',
                    name: 'border',
                    desc: '500px * 500px'
                },
                {
                    label: '码眼',
                    name: 'eye',
                    desc: '350px * 350px'
                },
                {
                    label: '转角',
                    name: 'corner',
                    desc: '100px * 100px'
                },
                {
                    label: '单个',
                    name: 'single',
                    desc: '50px * 50px'
                },
                {
                    label: '横2',
                    name: 'row2',
                    desc: '50px * 100px'
                },
                {
                    label: '横3',
                    name: 'row3',
                    desc: '50px * 150px'
                },
                {
                    label: '横4',
                    name: 'row4',
                    desc: '50px * 200px'
                },
                {
                    label: '竖2',
                    name: 'col2',
                    desc: '100px * 50px'
                },
                {
                    label: '竖3',
                    name: 'col3',
                    desc: '150px * 50px'
                },
                {
                    label: '竖4',
                    name: 'col4',
                    desc: '200px * 50px'
                },
                {
                    label: '横2竖2',
                    name: 'row2col2',
                    desc: '100px * 100px'
                },
                {
                    label: '横2竖3',
                    name: 'row2col3',
                    desc: '150px * 100px'
                },
                {
                    label: '横3竖2',
                    name: 'row3col2',
                    desc: '100px * 150px'
                }
            ],
            showCenterIcon: false
        }
    },
    computed: {
        property() {
            return this.element.elementJson.property
        },
        art() {
            return this.property.art
        },
        materials() {
            return this.art ? this.art.materials : null
        },
        qcTypeSelected() {
            return this.property.qcType
        },
        showArtQrcode() {
            return this.user.allow('showArtQrcode')
        },
        eqxPage() {
            return this.$store.state.scene.eqxPage
        },
        cover() {
            return this.element.elementJson.property.cover
        },
        card() {
            return this.element.elementJson.property.card
        },
        uploadOptions() { // 除开border 其余元素上传配置
            return {
                onUploadProgress: this.onUploadProgress,
                onUploadComplete: this.onUploadComplete,
                type: 'artqrcode',
                subType: 'normal'
            }
        },
        borderUploadOptions() { // border 上传配置
            return {
                onUploadProgress: this.onUploadProgress,
                onUploadComplete: this.onUploadComplete,
                type: 'artqrcode',
                subType: 'border'
            }
        },
        batchUploadOptions() { // 批量上传配置
            return {
                onUploadProgress: this.onUploadProgress,
                onUploadComplete: this.onUploadComplete,
                type: 'artqrcode',
                subType: 'batch'
            }
        },
        expressMode() {
            return this.$store.state.scene.expressMode
        }
    },
    watch: {
        'element.elementJson.property.text'(newVal) {
            if (newVal.length === 0 || !this.property.isArt) {
                return
            }
            if (this.canAllowRePaint) {
                this.canAllowRePaint = false
                setTimeout(() => {
                    artCodeInit.getArtQrcode(this.element).then(() => {
                        this.eqxPage.eqxHistory.add(this.eqxPage)
                        this.canAllowRePaint = true
                    })
                }, 400)
            }
        },
        card: {
            handler(newVal) {
                if (newVal) {
                    if (newVal.name.length === 0 || newVal.phone.length === 0 || !this.property.isArt) {
                        return
                    }
                    if (this.canAllowRePaint) {
                        this.canAllowRePaint = false
                        setTimeout(() => {
                            artCodeInit.getArtQrcode(this.element).then(() => {
                                this.eqxPage.eqxHistory.add(this.eqxPage)
                                this.canAllowRePaint = true
                            })
                        }, 400)
                    }
                }
            },
            deep: true
        }
    },
    created() {
        this.isThreeD = this.property.isThreeD
        this.showCenterIcon = !this.property.isArt && this.property.centerIcon && this.property.type === 1
    },
    methods: {
        cancelLogo() {
            this.property.type = 0 // type: 0 无图片, 1 有图片
            this.property.centerIcon = null
            this.showCenterIcon = false
        },
        toNormalQrcode() {
            if (this.checkText() === false) {
                return Vue.notifier.warn('内容不能为空')
            }
            if (this.property.isArt) {
                this.property.isThreeD = false // 立体还原
                this.property.isArt = false // 艺术二维码标识还原
                this.property.cover = null // 所选艺术二维码模板封面还原
                this.property.src = null // 生成的艺术二维码图片url还原
                this.showCenterIcon = this.property.centerIcon && this.property.type === 1 // 黑白二维码中心icon
                Vue.store.commit('QRCODE_TEMPLATE_USE_CLEAR')
                if (this.qcTypeSelected === qrcodeType.wechat) {
                    this.element.updateProperty(this.property)
                }
            }
        },
        getBackgroundImage(src) {
            if (src) {
                return Vue.filter('backgroundImage')(src)
            } else {
                return ''
            }
        },
        cancelClick(item) {
            this.materials[item.name] = ''
            artCodeInit.getArtQrcode(this.element).then(() => {
                this.eqxPage.eqxHistory.add(this.eqxPage)
            })
        },
        checkText() {
            let checkRes = true
            if (this.qcTypeSelected === qrcodeType.card) {
                const card = this.property.card
                if (card.name.length === 0 || card.phone.length === 0) {
                    checkRes = false
                }
            } else {
                if (this.property.text.length === 0) {
                    checkRes = false
                }
            }
            return checkRes
        },
        openArtPanel() {
            if (this.checkText() === false) {
                return Vue.notifier.warn('内容不能为空')
            }
            this.element.isSelected = false
            Vue.store.commit('ELEMENT_SELECT', { eqxElements: [] })
            const key = this.property.isArt ? this.element.elementJson.property.src : null
            let text = ''
            if (this.qcTypeSelected === qrcodeType.card) {
                const card = this.element.elementJson.property.card
                text = 'BEGIN:VCARD   \r\nFN:' + card.name + ' \r\nTEL;CELL;VOICE:' + card.phone + ' \r\nEND:VCARD'
            } else {
                text = this.element.elementJson.property.text
            }

            const options = {
                component: IndexQrcode,
                data: {
                    mode: artQrcodeMode.setting,
                    zIndex: 104,
                    qrcodeKey: key || null,
                    qrcodeBase64Str: this.getCanvasBase64(),
                    qrcodeText: text,
                    qrcodeElement: this.element,
                    qrcodeComplete: this.onComplete
                }
            }
            this.slide.open(options)
                .then((res) => {
                })
                .catch((err) => {
                    err && this.logger.error(err)
                })
        },
        onComplete() {
            // 完成之后 更新property
            Vue.store.commit('ELEMENT_SELECT', { eqxElements: [this.element] })
        },
        getCanvasBase64() {
            const tagName = this.element.$image.tagName
            if (tagName === 'CANVAS') {
                return this.element.$image.toDataURL('image/png', 1)
            } else {
                return ''
            }
        },
        gotoTeach() {
            window.open('http://yqxiuairdesign.eqxiuzhan.com/yishuerweima')
        },
        addOrReplace(item) {
            this.chooseItem.name = item.name
        },
        onUploadProgress(percent) {
            let style = null
            if (this.chooseItem.name === 'batch') {
                style = this.$refs[this.chooseItem.name].style
            } else {
                style = this.$refs[this.chooseItem.name][0].style
            }

            style.opacity = 1
            style.width = percent + '%'
            if (percent === 100) {
                // 还原
                style.width = 0
            }
        },
        onUploadComplete(res) {
            this.loading.open('生成中，请稍等...')
            if (this.chooseItem.name === 'batch') {
                // 批量上传把之前的全部清空
                this.artConfig.map(item => {
                    this.materials[item.name] = ''
                })
                // 批量上传  根据文件名 一一匹配
                const allData = res.allData
                const checkLegalAttr = this.artConfig.map(item => item.name)
                allData.map(item => {
                    const name = item.name
                    const pointIndex = name.lastIndexOf('.')
                    if (pointIndex !== -1) {
                        const key = name.substr(0, pointIndex)
                        // 校验key是不是合法
                        if (checkLegalAttr.includes(key)) {
                            this.materials[key] = item.key
                        }
                    }
                })
            } else {
                this.materials[this.chooseItem.name] = res.key
            }
            artCodeInit.getArtQrcode(this.element).then((key) => {
                this.eqxPage.eqxHistory.add(this.eqxPage)
                this.loading.close()
            }).catch((e) => {
                this.loading.close()
            })
        },
        replaceIcon() {
            Vue.dialog.openMaterialLib()
                .then(res => {
                    if (res && res.success) {
                        this.cropImage(res.path)
                    }
                })
                .catch(err => {
                    err && this.logger.error(err)
                })
        },
        cropImage(path) {
            const options = {
                ratio: 1,
                src: path,
                hideOptions: true
            }
            this.dialog.openImageCrop(options)
                .then(data => {
                    const { left, top, width, height } = data.crop
                    const src = path + `?imageMogr2/auto-orient/crop/!${width}x${height}a${left}a${top}`
                    this.property.type = 1 // type: 0 无图片, 1 有图片
                    this.property.centerIcon = src
                    this.showCenterIcon = true
                })
                .catch(err => err && this.logger.error(err))
        },
        batchClick() {
            this.chooseItem.name = 'batch'
        },
        showDialog(Dialog) {
            const options = {
                component: Dialog,
                data: {
                    text: this.qcTypeSelected === qrcodeType.wechat ? this.property.name : this.property.text
                }
            }
            this.dialog.open(options).then((data) => {
                if (data.text.length > 0) {
                    this.element.updateProperty(data)
                    if (this.property.isArt) {
                        artCodeInit.getArtQrcode(this.element).then((key) => {
                            this.eqxPage.eqxHistory.add(this.eqxPage)
                        }).catch((err) => {
                            err && this.logger.error(err)
                        })
                    }
                }
            }).catch(() => {

            })
        },
        threeD(pMode) {
            if ((!this.element.elementJson.property.isThreeD && pMode === 2) || (this.element.elementJson.property.isThreeD && pMode === 3)) {
                return
            }
            this.element.updateProperty({
                isThreeD: !this.element.elementJson.property.isThreeD
            })
            this.isThreeD = this.element.elementJson.property.isThreeD
        }
    }
}
</script>
<style lang="scss">
.eqc-setting-art-qrcode {
    .qr-btn {
        margin-top: 20px;
    }
    .artPanel {
        width: 152px;
        height: 72px;
        border: 1px solid #ccd5db;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: white;
        cursor: pointer;
        .img {
            width: 64px;
            height: 64px;
            background: gray;
            margin: 4px;
        }
        .btns {
            width: 80px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            border-left: 1px solid #ccd5db;
        }
        .change-style {
            color: rgba(79, 93, 105, 1);
            font-size: 13px;
            text-align: center;
            width: 100%;
            height: 36px;
            line-height: 36px;
            border-bottom: 1px solid #ccd5db;
        }
        .nostyle {
            background: url("../../../../img/qrcode_no_style.png") no-repeat center center/contain;
        }
        i {
            font-size: 22px;
        }
    }
    .line {
        margin-top: 16px;
        height: 1px;
        border-top: 1px solid #ccd5db;
        position: relative;
        left: -30%;
        width: 200%;
    }
    .batch {
        width: 152px;
        height: 30px;
        border: 1px solid #1593ff;
        color: #ffffff;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background: #1593ff;
        position: relative;
        span {
            z-index: 3;
        }
        .progress {
            position: absolute;
            left: 0;
            bottom: 0;
            width: 0;
            height: 100%;
            background: #eceef0;
            transition: all 0.3s;
            z-index: 2;
        }
    }
    .desc {
        height: 62px;
        font-size: 12px;
        padding: 14px 0;
        line-height: 17px;
        span:last-child {
            margin-left: 18px;
            color: #1593ff;
            cursor: pointer;
        }
    }
    .wrapper {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        position: relative;
        align-items: flex-end;
        .left {
            width: 60px;
            height: 60px;
            text-align: center;
            line-height: 60px;
            border: 1px solid #ccd5db;
            background: white;
            cursor: pointer;
            .eqf-plus {
                font-size: 14px;
            }
        }
        .cancel {
            position: absolute;
            left: 52px;
            top: -5px;
            cursor: pointer;
        }
        .right {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: center;
            width: 84px;
            .descpx {
                margin-bottom: 8px;
                text-align: right;
            }
            .btn-area {
                position: relative;
                .eqc-btn {
                    z-index: 3;
                }
                .progress {
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    width: 0;
                    height: 100%;
                    background: #eceef0;
                    transition: all 0.3s;
                    z-index: 2;
                }
            }
        }
    }
    .show-mode {
        width: 152px;
        height: 30px;
        background: rgba(255, 255, 255, 1);
        line-height: 30px;
        margin-top: 10px;
        span {
            display: inline-block;
            width: 76px;
            height: 30px;
            font-size: 12px;
            font-weight: 400;
            color: rgba(47, 60, 77, 1);
            text-align: center;
            cursor: pointer;
            &.active {
                background: rgba(21, 147, 255, 1);
                color: #ffffff;
                border: none;
                cursor: default;
            }
            &.dis-active {
                border: 1px solid rgba(204, 213, 219, 1);
            }
        }
        :nth-child(1) {
            float: left;
            border-right: none !important;
        }
        :nth-child(2) {
            border-left: none !important;
        }
    }
}
</style>
