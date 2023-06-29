<template>
    <div
        v-show="showFlag"
        class="eqx-head-export-phone"
    >
        <div class="header">
            <h1>下载到手机</h1>
        </div>
        <div class="content">
            <div
                ref="qrcode"
                class="qrcode"
            />
            <div class="desc flexCenter m83">
                微信扫码二维码下载到手机
            </div>
            <div
                v-if="!isMember && !waterMark && !puzzleMode"
                class="desc flexCenter"
            >
                （二维码有效期<span class="red">4小时</span>)
            </div>
        </div>
        <div class="footer flexCenter">
            <div
                v-if="!isMember && !waterMark && !puzzleMode"
                class="desc red"
            >
                本次手机下载已计入下载张数，关闭 后，重新打开需重新计算下载张数
            </div>
            <div class="btn flexCenter">
                <span
                    :style="{width:(isMember || waterMark || puzzleMode)?'112px':'70px'}"
                    class="flexCenter"
                    @click="close"
                >关闭</span>
            </div>
        </div>
    </div>
</template>
<script>
import delayLoad from '../../../../utils/delayLoad'
import waterAuthor from '../../../../config/watermarkAuthor.js'
// import qiniuWatermark from '../../../../utils/qiniuWatermark'
export default {
    props: {
        urlArr: {
            type: Array,
            default: () => {
                return []
            }
        },
        // 传入进来的sceneJson,暂时用于艺术二维码导出
        sceneJsonOut: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            showFlag: false,
            waterMark: false,
            isGifMode: false,
            outUrlArr: null// 外部传入的数组,如果初始化的数组为空，则用它
        }
    },
    computed: {
        // 获取当前场景的sceneJson.id
        sceneJsonId() {
            if (Vue.store.state.scene && Vue.store.state.scene.eqxScene && Vue.store.state.scene.eqxScene !== null) {
                return Vue.store.state.scene.eqxScene.sceneJson.id
            } else {
                return this.sceneJsonOut.id
            }
        },
        isMember() {
            // true 就是会员  false就是非会员
            return waterAuthor.checkWaterAuthor()
        },
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        puzzleMode() {
            return Vue.store.state.scene.puzzleMode
        }
    },
    created() {

    },
    methods: {
        open(wm, isGif) {
            this.waterMark = wm
            this.isGifMode = isGif
            this.showFlag = true
            this.catchOrRefresh()
        },
        close() {
            if (this.isMember || this.waterMark) {
                this.showFlag = false
                this.$emit('onClose')
            } else {
                this.dialog.openConfirm({ msg: '本次手机下载已计入下载次数，关闭后，</br> 重新打开需重新计算下载次数。</br>是否确认关闭？' })
                    .then(() => {
                        this.showFlag = false
                        this.$emit('onClose')
                    }).catch(e => {})
            }
        },
        // 生成二维码
        initQrcode(qrcodeKey) {
            delayLoad.delayLoadJS(this.env.plugin.jquery).then(() => {
                delayLoad.delayLoadJS(this.env.plugin.qrcode).then(() => {
                    this.api.page.getServerTimestamp().then(res => {
                        // 如果延迟加载慢，窗口就被关闭了，则会报错，所以先判断一下
                        if (!this.$refs.qrcode) {
                            return
                        }
                        this.$refs.qrcode.innerHTML = ''
                        const $image = window.$('<div>').qrcode({
                            render: 'canvas',
                            ecLevel: 'H',
                            text: (Vue.env.host.wxMiniProShareUrl + '/view/photo?id=' + this.sceneJsonId + '&code=' + qrcodeKey + '&type=download&appletCode=poster&startTime=' + res.data.obj).replace('http://', 'https://'),
                            size: 186,
                            fill: '#000',
                            background: '#fff'
                        }).children().get(0)
                        this.$refs.qrcode.appendChild($image)
                    })
                })
            }).catch(err => err && this.logger.error(err))
        },
        // 获取 或者刷新二维码
        catchOrRefresh() {
            let useUrlArr = []
            if (this.urlArr && this.urlArr.length !== 0) {
                useUrlArr = this.urlArr
            } else if (this.outUrlArr && this.outUrlArr.length !== 0) {
                useUrlArr = this.outUrlArr
            }
            if (useUrlArr.length === 0) {
                return
            }
            const newArr = []
            useUrlArr.forEach(item => {
                if (this.waterMark) { // 需要带水印
                    if (this.userInfo && this.userInfo.type === 4) {
                        newArr.push(item.noWaterPath ? item.noWaterPath : item.path)
                    } else {
                        newArr.push(item.path)
                    }
                } else {
                    newArr.push(item.noWaterPath ? item.noWaterPath : item.path)
                }
            })
            const qrcodeData = this.api.page.catchQrCode(`${newArr.join(',')}`)
            qrcodeData.then(res => {
                this.initQrcode(res.data.obj.code)
            })
        },
        setUrlArr(pUrlArr) {
            this.outUrlArr = pUrlArr
        }
    }
}
</script>
<style lang="scss" scoped>
.eqx-head-export-phone {
    position: absolute;
    right: 256px;
    bottom: 21px;
    width: 300px;
    height: 366px;
    background: white;
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
    border-radius: 3px;
    .header {
        margin: 0 12px;
        height: 40px;
        border-bottom: 1px solid #d8d8d8;
        h1 {
            font-size: 14px;
            font-weight: bold;
            margin-left: 3px;
            line-height: 40px;
        }
    }
    .red {
        color: #ff5448;
    }
    .m83 {
        margin-bottom: 3px;
    }
    .content {
        width: 100%;
        height: 260px;
        display: flex;
        flex-direction: column;
        align-items: center;
        .qrcode {
            width: 186px;
            height: 186px;
            margin: 20px 0 8px 0;
        }
        .desc {
            font-size: 13px;
            color: #666666;
        }
    }
    .flexCenter {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .footer {
        height: 64px;
        background: #f7f8f9;
        padding: 0 12px;
        .desc {
            font-size: 12px;
            line-height: 16px;
            width: 192px;
        }
        span {
            letter-spacing: 2px;
            width: 70px;
            height: 30px;
            margin-left: 14px;
            background: rgba(144, 153, 164, 1);
            border-radius: 15px;
            font-size: 13px;
            color: white;
            line-height: 30px;
            cursor: pointer;
        }
    }
}
</style>
