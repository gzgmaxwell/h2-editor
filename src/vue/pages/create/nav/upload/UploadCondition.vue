<template>
    <transition name="moveup">
        <div
            :style="{height: conditionHeight + 'px', bottom,}"
            class="nav-upload-condition"
        >
            <div class="header">
                <span>{{ uploadProcessing?'正在上传':'上传结束' }}（<span :style="{color:uploadIndex===totalFile?'#1593FF':'#FF2A6A'}">{{ uploadIndex + '/' + totalFile }}</span>）</span>
                <span @click="toggleClick">
                    <i
                        :class="{'eqf-down':showContent,'eqf-up':!showContent}"
                        class="icon"
                    />
                </span>
            </div>
            <div
                v-show="showContent"
                v-scroll-bar
                :style="{height:contentHeight+'px'}"
                class="content-list"
            >
                <ul class="list">
                    <li
                        v-for="(item,i) in uploadData"
                        :key="i"
                    >
                        <span
                            :ref="`process${i}`"
                            class="process"
                        />
                        <span class="index">{{ i+1 }}</span>
                        <span class="name">{{ item.name }}</span>
                        <span>{{ item.size }}</span>
                        <span
                            :style="{color:item.state === 0?'#3C4055':item.state===1?'#1593FF':'#FF2A6A'}"
                            class="state"
                        >{{ item.state === 0?'等待上传':item.state===1?'上传成功':item.info }}</span>
                    </li>
                </ul>
            </div>
            <div
                v-if="!(uploadProcessing && isMember)"
                class="footer flexCenter"
            >
                <span
                    v-if="!isMember && category !== 'tcloud'"
                    :style="{width:uploadProcessing?'256px':'120px'}"
                    @click="bugMember"
                >升级到20M/张</span>
                <base-button
                    v-if="!uploadProcessing && !isMember && category !== 'tcloud'"
                    class="white w120 h36"
                    @click.native="close"
                >
                    返回继续上传
                </base-button>
                <base-button
                    v-if="!uploadProcessing && (isMember || category === 'tcloud')"
                    class="white w256 h36"
                    @click.native="close"
                >
                    返回继续上传
                </base-button>
            </div>
        </div>
    </transition>
</template>
<script>
import waterAuthor from '../../../../../config/watermarkAuthor'
import statistic from '../../../../../config/statistic'
export default {
    props: {
        option: {
            type: Object,
            default: null
        },
        category: {
            type: String,
            default: 'h2'
        }
    },
    data() {
        return {
            uploadIndex: 0,
            uploadProcessing: true,
            showContent: true,
            conditionHeight: 0 // 整体高度
        }
    },
    computed: {
        bottom() {
            return this.conditionHeight - 83 + (this.category === 'tcloud' ? 30 : 0) + 'px'
        },
        isMember() {
            return waterAuthor.checkWaterAuthor()
        },
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        buyMemberAuth() {
            return !(this.userInfo.members && this.userInfo.members.some(item => [14].includes(item.memberId))) && this.user.allow('buyMember')
        },
        uploadData() {
            const arr = []
            let fileErrorCount = 0
            if (this.option && this.option.allFiles) {
                this.option.allFiles.forEach(file => {
                    arr.push({
                        name: file.name,
                        size: Number(file.size / 1024 / 1024).toFixed(3) + 'M',
                        state: file.state, // state 0 等待上传 1 上传成功 2上传失败 info表示失败原因
                        info: file.info
                    })
                    if (file.state === 2) {
                        fileErrorCount++
                    }
                })
                if (this.showContent && this.uploadProcessing) {
                    if (fileErrorCount === this.option.allFiles.length) {
                        this.initData(1)
                    } else {
                        this.initData()
                    }
                }
            }
            return arr
        },
        totalFile() {
            return this.option.allFiles.length
        },
        contentHeight() {
            const limit = this.isMember && this.uploadProcessing ? 248 : 184
            if (this.totalFile * 32 > limit) {
                return limit
            } else {
                return this.totalFile * 32
            }
        }
    },
    methods: {
        initData(num) {
            if (num === 1) {
                this.uploadProcessing = false
            }
            this.uploadRatio = '0/' + this.totalFile
            const memberHeight = this.isMember && this.uploadProcessing ? 0 : 68
            this.conditionHeight = 38 + memberHeight + this.totalFile * 32
            if (this.conditionHeight > 286) {
                this.conditionHeight = 286
            }

            this.checkUploadState()
        },
        checkUploadState() {
            if (this.option.files.length === 0) {
                this.uploadProcessing = false
            }
        },
        toggleClick() {
            this.showContent = !this.showContent
            if (this.showContent) {
                this.initData()
            } else {
                const memberHeight = this.isMember && this.uploadProcessing ? 0 : 68
                this.conditionHeight = 38 + memberHeight + 2
            }
        },
        refreshUploadState(percent, index, stateNum) {
            const style = this.$refs['process' + index][0].style
            style.width = percent + '%'
            if (stateNum === -1) {
                // 上传失败
                this.option.allFiles.filter(file => file.state !== 2)[index].state = 2
                this.option.allFiles.filter(file => file.state !== 2)[index].info = '上传失败'
                this.uploadData[index].state = 2
                this.uploadData[index].info = '上传失败'
                this.uploadIndex++
            }
            if (percent === 100) {
                style.width = '105%' // 拉长一点
                this.uploadIndex++
                this.option.allFiles.filter(file => file.state !== 2)[index].state = 1
                this.uploadData[index].state = 1
                if (this.uploadIndex === this.option.files.length) {
                    this.uploadProcessing = false
                    // 上传结束之后 会员模式下 高度要调整
                    if (this.isMember) {
                        this.initData()
                    }
                }
            }
        },
        bugMember() {
            if (this.buyMemberAuth) {
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.MBTN])
                const options = {
                    benefitId: Vue.env.benefits.uploadLimit
                }
                this.dialog.openMember(options).then(res => {
                    if (res.success) {
                        this.notifier.success('支付成功，请刷新页面')
                    } else {
                        this.notifier.fail('支付失败，请稍后重试')
                    }
                }).catch(err => {
                    err && this.logger.error(err)
                })
            } else {
                this.notifier.info('该功能为创意云会员和营销云会员专属权益')
            }
        },
        close() {
            this.$emit('onClose')
        }
    }
}
</script>
<style lang="scss">
.nav-upload-condition {
    position: absolute;
    bottom: 286px;
    left: 0;
    height: 286px;
    width: 288px;
    font-size: 12px;
    position: relative;
    background: white;
    z-index: 9;
    transition: all 0.3s;
    border-top: 1px solid #ccd5db;
    .flexCenter {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .header {
        font-size: 13px;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        line-height: 18px;
        padding: 16px 16px 4px 16px;
        .num {
            color: #ff2a6a;
        }
        i {
            font-size: 18px;
            cursor: pointer;
        }
    }
    .content-list {
        height: 184px;
        padding: 0 0 0 16px;
        color: #3c4055;

        .list {
            li {
                width: 256px;
                height: 32px;
                line-height: 32px;
                display: flex;
                justify-content: space-between;
                position: relative;
                span {
                    overflow: hidden; //溢出内容隐藏
                    white-space: nowrap; //强制文本在一行内显示
                    text-overflow: ellipsis; //当对象内文本溢出时显示省略标记
                }
                .index {
                    width: 16px;
                }
                .name {
                    width: 110px;
                }
                .state {
                    width: 60px;
                    text-align: right;
                }
                .process {
                    position: absolute;
                    left: -8px;
                    bottom: 0;
                    width: 0;
                    height: 31px;
                    border-radius: 3px;
                    background: rgb(234, 238, 240);
                    z-index: -1;
                    transition: all 0.3s;
                }
            }
        }
    }
    .footer {
        position: absolute;
        bottom: 0;
        height: 68px;
        background: white;
        width: 100%;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        .eqc-btn {
            font-size: 12px;
        }
        span {
            height: 36px;
            width: 256px;
            background: #c09659;
            border-radius: 3px;
            text-align: center;
            line-height: 36px;
            color: white;
            cursor: pointer;
        }
    }
}
</style>
