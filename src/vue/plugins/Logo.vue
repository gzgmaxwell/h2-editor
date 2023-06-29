<template>
    <div class="eqc-koutu-logo">
        <div class="content">
            <div class="header">
                <span class="title">LOGO处理</span>
                <span @click="close">
                    <i class="icon eqf-no pointer" />
                </span>
            </div>
            <div class="wrapper">
                <div class="left">
                    <div class="show-logo flex-center">
                        <img
                            v-if="imgAfterSrc"
                            :style="{width:imgObj.width+'px',height:imgObj.height+'px'}"
                            :src="afterImgSrc"
                        >
                    </div>
                    <div class="bottom flex-center">
                        <base-button
                            :class="{white:koutuBtnState, disable:!koutuBtnState}"
                            class="w96 h36"
                            @click.native="repeatClick"
                        >
                            重新抠图
                        </base-button>
                        <base-button
                            :class="{white:historyIndex>1,disable:historyIndex<=1}"
                            class="w96 h36"
                            @click.native="cancelClick"
                        >
                            <i class="icon eqf-back" />
                            撤销
                        </base-button>
                    </div>
                </div>
                <div class="right">
                    <div
                        class="upload-area flex-center"
                        @mouseover="showUploadBtn=true"
                    >
                        <div
                            v-if="imgOriginSrc"
                            :style="{background: `${getBackgroundImage(imgOriginSrc)} no-repeat center/contain`}"
                            class="show-oringin-img"
                            @mouseleave="showUploadBtn=false"
                        />
                        <div
                            v-if="showUploadBtn && uploadBtnName==='重新上传'"
                            class="layer"
                            @mouseleave="showUploadBtn=false"
                        />
                        <upload-pc
                            v-show="!imgOriginSrc || showUploadBtn"
                            v-bind="uploadOptions"
                            :css="btnCss"
                            :name="uploadBtnName"
                        />
                        <img
                            v-if="!imgOriginSrc"
                            class="tips"
                            :src="tipIcon"
                        >
                    </div>
                    <div class="bg-color in-color">
                        <span class="title">设置LOGO填充色</span>
                        <div class="list">
                            <span
                                v-for="(item,i) in inColorArr"
                                :key="i"
                                :style="{background:item}"
                                :class="{colorful:i===0}"
                                class="color-item"
                                @click="chooseInColorClick(i,item,$event)"
                            >
                                <i
                                    v-if="chooseInColorIndex === i"
                                    class="select icon eqf-yes"
                                />
                            </span>
                        </div>
                    </div>
                    <div class="bg-color">
                        <span class="title">设置背景颜色</span>
                        <div class="list">
                            <span
                                v-for="(item,i) in bgColorArr"
                                :key="i"
                                :style="{background:i===1?'':item}"
                                :class="{opacity:i===1,colorful:i===0}"
                                class="color-item"
                                @click="chooseBgColorClick(i,item,$event)"
                            >
                                <i
                                    v-if="chooseBgColorIndex === i"
                                    class="select icon eqf-yes"
                                />
                            </span>
                        </div>
                    </div>

                    <div class="footer">
                        <base-button
                            class="white w112 h36"
                            @click.native="exportToH5"
                        >
                            导出到H5素材
                        </base-button>
                        <base-button
                            class="white w96 h36"
                            @click.native="download"
                        >
                            下载到本地
                        </base-button>
                        <base-button
                            class="blue w96 h36"
                            @click.native="addToPage"
                        >
                            添加到画布
                        </base-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import uploadPc from '../pages/create/nav/upload/UploadPc.vue'
import statistic from '../../config/statistic'
import elementType from '../../config/enum.element.type'
import tipIcon from '../../img/logo-tips.png'
export default {
    components: {
        uploadPc
    },
    data() {
        return {
            tipIcon,
            imgOriginSrc: '', //  原文件
            imgAfterSrc: '', // 抠图之后的
            width: '', // 原图的宽度
            height: '', // 原图的高度
            imgHistory: [], // 存放历次改造的img
            bgColorArr: ['', 'transparent', '#ffffff', '#E8DFCE', '#FBD913', '#F7F8F9', '#FFF5C8', '#002632', '#331900', '#2E001F', '#2A0A50', '#FFF797', '#ECEEF0'],
            inColorArr: ['', '#FFFFFF', '#000000', '#F01926', '#0058A3', '#1593FF', '#FF7A19', '#06D1FF', '#FE8D00', '#FFD9F2', '#D5A2FE', '#FF5448', '#BD10E0'],
            chooseBgColorIndex: -1,
            chooseInColorIndex: -1,
            showUploadBtn: false,
            uploadBtnName: '上传LOGO',
            btnBeforeCss: {
                width: '200px', height: '48px', fontSize: '17px'
            },
            btnAfterCss: {
                width: '96px', height: '36px', fontSize: '14px'
            },
            changeObj: {
                color: ''
            },
            imgObj: {
                w: 380, // 展示框的宽度
                h: 440, // 展示框的高度
                width: 380, // 适配的宽度
                height: 440
            },
            canvasDataUrl: '',
            colorOption: {
                bgColor: 'transparent', // 背景色配置
                inColor: '', // logo填充色配置
                type: 0 // 0 代表刚点击了背景色 1 代表刚点击了log填充色
            },
            canvas: null, // 保存canvas 用于导出
            recordState: false,
            customColor: { // 色盘model
                color: ''
            },
            historyIndex: 0,
            koutuBtnState: false, // 重新抠图按钮状态
            isBgTransparent: false // logo背景是不是透明
        }
    },
    computed: {
        uploadOptions() {
            return {
                type: 'logo',
                onComplete: this.onComplete
            }
        },
        btnCss() {
            if (this.imgOriginSrc && this.showUploadBtn) {
                return this.btnAfterCss
            } else {
                return this.btnBeforeCss
            }
        },
        afterImgSrc() {
            if (this.canvasDataUrl) {
                return this.canvasDataUrl
            }
            return Vue.env.host.file + this.imgAfterSrc
        },
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        eqxPage() {
            return Vue.store.state.scene.eqxPage
        },
        sceneJson() {
            return Vue.store.state.scene.eqxScene.sceneJson
        },
        scale() {
            return this.eqxPage.scale
        }
    },
    watch: {
        colorOption: {
            handler() {
                // 更新了 颜色 自动更新
                this.imgToCanvas()
            },
            deep: true
        },
        customColor: {
            handler(newColor) {
                if (this.colorOption.type) {
                    this.colorOption.inColor = this.colorRGB2Hex(newColor.color)
                } else {
                    this.colorOption.bgColor = this.colorRGB2Hex(newColor.color)
                }
            },
            deep: true
        }
    },
    methods: {
        colorRGB2Hex(color) {
            const rgb = color.split(',')
            const r = parseInt(rgb[0].split('(')[1])
            const g = parseInt(rgb[1])
            const b = parseInt(rgb[2].split(')')[0])
            const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
            return hex
        },
        calculateSize() {
            const scale = this.width / this.height
            if (this.width > this.imgObj.w) {
                this.imgObj.width = this.imgObj.w
                this.imgObj.height = this.imgObj.width / scale
                // 380 440  避免出现 400 800
                if (this.imgObj.height > this.imgObj.h) {
                    this.imgObj.height = this.imgObj.h
                    this.imgObj.width = this.imgObj.height * scale
                }
            } else if (this.height > this.imgObj.h) {
                this.imgObj.height = this.imgObj.h
                this.imgObj.width = this.imgObj.height * scale
            } else {
                // 自适应尺寸
                this.imgObj.height = this.height
                this.imgObj.width = this.width
            }
        },
        onComplete(tagIdAll, data) {
            setTimeout(() => {
                const { key, w, h } = data
                this.imgOriginSrc = key
                this.width = w
                this.height = h
                this.checkImgHasTransparentBg().then((state) => {
                    this.koutuBtnState = true
                    if (!state) {
                        this.dealImg(key, w, h, true) // 非透明背景的才执行抠图
                    } else {
                        this.imgAfterSrc = this.imgOriginSrc
                        this.addRecord(this.imgOriginSrc)
                        this.resetCondition()
                        this.isBgTransparent = true
                        this.calculateSize()
                    }
                })
                this.showUploadBtn = false
                this.uploadBtnName = '重新上传'

                // 历史记录归0
                this.historyIndex = 0
                this.imgHistory = []
            }, 1500)
        },
        resetCondition() {
            this.chooseBgColorIndex = -1
            this.chooseInColorIndex = -1
            this.colorOption = {
                bgColor: 'transparent', // 背景色配置
                inColor: '' // logo填充色配置
            }
        },
        cancelClick() {
            // 撤销
            if (this.imgHistory.length !== 0) {
                if (this.historyIndex > 1) {
                    this.historyIndex--
                }
                const target = this.imgHistory[this.historyIndex - 1 >= 0 ? this.historyIndex - 1 : 0]
                this.recordState = false
                this.colorOption = {
                    bgColor: target.bgColor,
                    inColor: target.inColor
                }
                this.chooseBgColorIndex = target.chooseBgColorIndex
                this.chooseInColorIndex = target.chooseInColorIndex
                if (target.src) {
                    this.imgAfterSrc = target.src
                }
            }
        },
        repeatClick() {
            if (this.isBgTransparent) {
                this.dialog.openConfirm({ msg: '检测到图片为透明背景，抠图操作会让logo部分被抠除，是否执行？' })
                    .then(() => {
                        // 重新抠图
                        this.dealImg(this.imgOriginSrc, this.width, this.height)
                        this.isBgTransparent = false
                    }).catch(e => {})
            } else {
                // 重新抠图
                this.dealImg(this.imgOriginSrc, this.width, this.height)
            }
        },
        close() {
            const logo = this.$el
            document.body.removeChild(logo)
            this.$destroy()
        },
        // 上传到七牛
        uploadImg(cvs) {
            return new Promise((resolve, reject) => {
                const img = cvs.toDataURL()
                Vue.api.file.getUploadToken().then(token => {
                    Vue.api.file.uploadBase64(img.split(',')[1], token)
                        .then(res => {
                            resolve(res.data.key)
                        }).catch(err => {
                            err && Vue.logger.error(err)
                            reject(err)
                        })
                }).catch(err => {
                    err && Vue.logger.error(err)
                    reject(err)
                })
            })
        },
        exportToH5() {
            if (this.canvas) {
                if (this.userInfo.id) {
                    window._hmt.push(['_trackEvent',
                        statistic.category.F,
                        statistic.action.LG,
                        statistic.opt_label.LG.h5])

                    Vue.loading.open('导出中')
                    this.uploadImg(this.canvas).then(res => {
                        const urlArr = [{
                            extName: 'png',
                            path: res,
                            name: res,
                            tmbPath: res
                        }]
                        Vue.api.file.saveToH5(Vue.env.h5TagId, urlArr, this.sceneJson.id)
                            .then((res) => {
                                Vue.loading.close()
                                Vue.notifier.info('导出成功，刷新图片库可查看')
                            })
                            .catch(err => {
                                err && this.logger.error(err)
                                Vue.loading.close()
                                Vue.notifier.fail('服务器异常，请稍后重试')
                            })
                    }).catch(err => {
                        err && Vue.logger.error(err)
                        Vue.loading.close()
                        Vue.notifier.fail('服务器异常，请稍后重试')
                    })
                } else {
                    Vue.notifier.info('导出到H5功能需登录后才能使用')
                }
            } else {
                Vue.notifier.info('请先上传LOGO！')
            }
        },
        // 下载到本地
        download() {
            if (this.canvas) {
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.LG,
                    statistic.opt_label.LG.exp])

                Vue.loading.open('下载中，请等候')
                const url = this.canvas.toDataURL()
                const a = document.createElement('a')
                const dateStr = new Date().format('yyyyMMddhhmmss')
                a.download = `轻设计_LOGO处理_${dateStr}`
                a.href = url
                a.click()
                Vue.loading.close()
            } else {
                Vue.notifier.info('请先上传LOGO！')
            }
        },
        // 绘制图片组件到画布
        addElement(src) {
            const result = this.eqxPage.getElementPosOfCenter(this.imgObj.width, this.imgObj.height, this.scale)
            const left = result.left
            const top = result.top
            const elementJson = {
                type: elementType.image,
                property: {
                    src,
                    dropShadow: {
                        color: 'rgba(0,0,0,0)',
                        x: 0,
                        y: 0,
                        blur: 0,
                        transparency: 100
                    },
                    borderRadius: {
                        lt: true,
                        rt: true,
                        lb: true,
                        rb: true,
                        val: 0
                    }
                },
                css: {
                    left: Math.round(left) + 'px',
                    top: Math.round(top) + 'px',
                    width: Math.round(this.imgObj.width) + 'px',
                    height: Math.round(this.imgObj.height) + 'px',
                    border: '1px solid transparent'
                }
            }
            this.eqxPage.addElement(elementJson)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        // 添加到画布
        addToPage() {
            if (this.canvas) {
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.LG,
                    statistic.opt_label.LG.draw])
                Vue.loading.open('正在添加')
                this.uploadImg(this.canvas).then(res => {
                    Vue.loading.close()
                    this.addElement(res)
                    Vue.notifier.success('添加成功')
                }).catch(err => {
                    err && Vue.logger.error(err)
                    Vue.loading.close()
                    Vue.notifier.fail('服务器异常，请稍后重试')
                })
            } else {
                Vue.notifier.info('请先上传LOGO！')
            }
        },
        // 设置背景色
        chooseBgColorClick(i, color, e) {
            if (this.canvas) {
                this.chooseBgColorIndex = i
                if (i === 0) {
                    this.showColorPanel(e, i)
                }
                if (i !== 0) {
                    this.colorOption.bgColor = color
                }
                this.colorOption.type = 0
            } else {
                Vue.notifier.info('请先上传LOGO！')
            }
        },
        // 设置logo填充色
        chooseInColorClick(i, color, e) {
            if (this.canvas) {
                this.chooseInColorIndex = i
                this.colorOption.inColor = color
                if (i === 0) {
                    this.showColorPanel(e, i)
                }
                this.colorOption.type = 1
            } else {
                Vue.notifier.info('请先上传LOGO！')
            }
        },
        // 打开色盘
        showColorPanel(e, index) {
            document.addEventListener('mousedown', this.hideColorPanel)
            this.curColorSetting = index
            let top = e.pageY - 410
            const left = e.pageX
            if (top < 0) {
                top = e.pageY + 40
            }
            Vue.colorPicker.open(this.customColor, 'color', { left: left + 'px', top: top + 'px' }, false)
        },
        // 关闭色盘
        hideColorPanel() {
            if (!this.colorPicker.getState().isOpenSucker) {
                document.removeEventListener('mousedown', this.hideColorPanel)
                Vue.colorPicker.close()
            }
        },
        transferHexToRgba(color) {
            if (color === '') {
                return null
            }
            if (color === 'transparent') {
                return {
                    r: 255,
                    g: 255,
                    b: 255,
                    a: 2
                }
            }
            return {
                r: parseInt('0x' + color.slice(1, 3)),
                g: parseInt('0x' + color.slice(3, 5)),
                b: parseInt('0x' + color.slice(5, 7)),
                a: 255
            }
        },
        checkImgHasTransparentBg() {
            // 判断上传的图片 是不是有透明的背景
            return new Promise((resolve, reject) => {
                const img = new Image()
                const canvas = document.createElement('canvas')
                const ctx = this.ctx = canvas.getContext('2d')
                img.crossOrigin = 'anonymous'
                img.src = Vue.env.host.file + this.imgOriginSrc

                img.onload = () => {
                    canvas.width = img.width
                    canvas.height = img.height
                    ctx.drawImage(img, 0, 0, img.width, img.height)
                    const imageData = ctx.getImageData(0, 0, img.width, img.height)
                    const imageDataLength = imageData.data.length / 4

                    const standA = 0
                    let pass = false
                    for (var i = 0; i < imageDataLength; i++) {
                        const a = imageData.data[i * 4 + 3]
                        if (standA === a) {
                            resolve(true)
                            pass = true
                            break
                        }
                    }
                    if (!pass) {
                        resolve(false)
                    }
                }
            })
        },
        imgToCanvas() {
            const bgRgb = this.transferHexToRgba(this.colorOption.bgColor)
            const inRgb = this.transferHexToRgba(this.colorOption.inColor)
            const img = new Image()
            const canvas = document.createElement('canvas')
            const ctx = this.ctx = canvas.getContext('2d')
            img.crossOrigin = 'anonymous'
            img.src = Vue.env.host.file + this.imgAfterSrcimgAfterSrc

            img.onload = () => {
                canvas.width = img.width
                canvas.height = img.height
                ctx.drawImage(img, 0, 0, img.width, img.height)
                const imageData = ctx.getImageData(0, 0, img.width, img.height)
                const imageDataLength = imageData.data.length / 4

                if (bgRgb || inRgb) {
                    for (var i = 0; i < imageDataLength; i++) {
                        const a = imageData.data[i * 4 + 3]
                        const state = (a <= 3)
                        if (state && bgRgb) {
                        // 设置 背景色
                            imageData.data[i * 4] = bgRgb.r
                            imageData.data[i * 4 + 1] = bgRgb.g
                            imageData.data[i * 4 + 2] = bgRgb.b
                            imageData.data[i * 4 + 3] = bgRgb.a
                        } else if (inRgb) {
                        // 设置logo 填充色
                            imageData.data[i * 4] = inRgb.r
                            imageData.data[i * 4 + 1] = inRgb.g
                            imageData.data[i * 4 + 2] = inRgb.b
                        }
                    }
                }

                ctx.putImageData(imageData, 0, 0)
                this.canvasDataUrl = canvas.toDataURL('image/png')
                this.canvas = canvas
                // 记录上一步
                this.addRecord()
            }
        },
        addRecord(src) {
            // 记录每一步的操作 便于回退
            if (this.recordState) {
                const record = {
                    bgColor: this.colorOption.bgColor,
                    inColor: this.colorOption.inColor,
                    chooseBgColorIndex: this.chooseBgColorIndex,
                    chooseInColorIndex: this.chooseInColorIndex,
                    src: src
                }
                if (this.imgHistory.length > 0) {
                    const obj = this.imgHistory[this.imgHistory.length - 1]
                    // 要跟上一个不一样才放进去
                    if (!(obj.bgColor === record.bgColor && obj.inColor === record.inColor)) {
                        this.imgHistory[this.historyIndex] = record
                        this.historyIndex++
                    }
                    if (src) {
                        this.imgHistory[this.historyIndex] = record
                        this.historyIndex++
                    }
                } else {
                    this.imgHistory[this.historyIndex] = record
                    this.historyIndex++
                }
            } else {
                this.recordState = true
            }
        },
        getBackgroundImage(src) {
            // 获取背景图片
            return Vue.filter('backgroundImage')(src)
        },
        dealImg(src, width, height, flag) {
            // 抠图
            if (src && width && height) {
                this.loading.open('正在抠图，请稍等')
                Vue.api.matting.quickMatting(src, width, height)
                    .then(res => {
                        if (res.data.success) {
                            this.imgAfterSrc = res.data.obj
                            if (flag) {
                                // 历史记录归0
                                this.historyIndex = 0
                                this.imgHistory = []
                            }
                            this.calculateSize()
                            this.addRecord(res.data.obj)
                            this.resetCondition()
                        } else {
                            this.notifier.fail('上传图片失败，请稍后尝试！')
                        }
                        this.loading.close()
                    })
                    .catch(err => {
                        this.loading.close()
                        err && Vue.logger.error(err)
                    })
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-koutu-logo {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.7);
    z-index: 95; //需要比色盘层级小1
    .content {
        width: 960px;
        height: 600px;
        background: white;
        padding: 18px 28px 28px 28px;
        border-radius: 4px;
        color: #000;
        transition: all 0.3s;
        .header {
            display: flex;
            justify-content: space-between;
            .title {
                font-size: 18px;
                font-weight: bold;
                color: #111;
            }
            i {
                font-size: 24px;
            }
        }
        .wrapper {
            display: flex;
            margin-top: 17px;
            .left {
                margin-right: 28px;
                border: 1px solid #ccd5db;
                .show-logo {
                    width: 380px;
                    height: 440px;
                    background: url("../../img/opacity_40.png");
                    .show-after-img {
                        width: 380px;
                        height: 440px;
                    }
                }
                .bottom {
                    border-top: 1px solid #ccd5db;
                    height: 68px;
                    .eqc-btn {
                        margin: 4px;
                    }
                    i {
                        font-size: 16px;
                        font-weight: bold;
                        margin-right: 3px;
                    }
                }
            }
            .right {
                .upload-area {
                    width: 494px;
                    height: 228px;
                    background: #f7f8f9;
                    flex-direction: column;
                    position: relative;
                    border-radius: 3px;
                    .tips {
                        width: 462px;
                        height: 116px;
                        margin-top: 24px;
                    }
                    .layer {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 494px;
                        height: 228px;
                        background: rgba(0, 0, 0, 0.7);
                        z-index: 0; //与错误提示层级一样
                        border-radius: 3px;
                    }
                    .btn {
                        width: 200px;
                        height: 48px;
                        font-size: 17px;
                        color: #fff;
                        border-radius: 3px;
                        background: #1593ff;
                        &:hover {
                            opacity: 0.7;
                        }
                    }
                    .label {
                        font-size: 12px;
                        color: #9b9b9b;
                        margin: 9px;
                    }
                    .show-oringin-img {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 494px;
                        height: 228px;
                    }
                }
                .bg-color {
                    margin-top: 16px;
                    width: 494px;
                    height: 94px;
                    background: #f7f8f9;
                    padding: 16px;
                    border-radius: 3px;
                    .title {
                        font-size: 14px;
                        font-weight: bold;
                    }
                    .list {
                        display: flex;
                        margin-top: 14px;
                        .color-item {
                            width: 28px;
                            height: 28px;
                            box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.16);
                            margin-right: 8px;
                            i {
                                font-size: 12px;
                                background: #1593ff;
                                border-radius: 50%;
                                color: white;
                                padding: 1px;
                                position: relative;
                                left: 20px;
                                top: -6px;
                            }
                        }
                        .colorful {
                            background: url("../../img/color_bg.png") center center/cover;
                        }
                        .opacity {
                            background: url("../../img/opacity.png");
                        }
                    }
                }
                .footer {
                    margin-top: 28px;
                    float: right;
                    a {
                        margin-left: 12px;
                    }
                }
            }
        }
    }
    .pointer {
        cursor: pointer;
    }
    .flex-center {
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
