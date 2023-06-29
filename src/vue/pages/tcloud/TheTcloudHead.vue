<template>
    <div class="eqc-tcloud-head">
        <ul
            :style="{'right':mode === tcloudMode.independent ? '72px' : '56px'}"
            class="list"
        >
            <li
                v-show="mode === tcloudMode.tool"
                :class="[isRendered ? 'btn' : 'btn-disable']"
                class="li-btn"
                @click="insert()"
            >
                插入画布
                <span
                    v-if="limitedTimeFree"
                    class="limited-time-free"
                >限免</span>
            </li>
            <li
                v-show="mode === tcloudMode.tool"
                class="line"
            />
            <li
                :class="[isRendered ? 'btn' : 'btn-disable']"
                class="li-btn"
                @click="exportImageLibrary"
            >
                存入图片库
                <span
                    v-if="limitedTimeFree"
                    class="limited-time-free"
                >限免</span>
            </li>
            <li class="line" />
            <li
                :class="[{'download-disable':!isRendered},{'download':isRendered}]"
                @click="downloadPc"
            >
                下载到电脑
                <span
                    v-if="limitedTimeFree"
                    class="limited-time-free"
                >限免</span>
            </li>
        </ul>
        <div
            v-if="mode === tcloudMode.independent"
            class="exit hint--bottom-left hint--rounded"
            data-hint="回到我的作品"
            @click="closeClick"
        >
            退出
        </div>
        <i
            v-if="mode !== tcloudMode.independent"
            class="close eqf-no"
            @click="closeClick"
        />
    </div>
</template>

<script>
import TcloudMode from '../../../config/enum.tcloudMode.type'
import statistic from '../../../config/statistic'
import elementType from '../../../config/enum.element.type'

export default {
    props: {
        mode: {
            type: Number,
            default: 1
        },
        close: {
            type: Function,
            default: null
        }
    },
    data() {
        return {
            tcloudMode: TcloudMode,
            limitedTimeFree: true // 是否限时免费
        }
    },
    computed: {
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        scene() {
            return Vue.store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        wordCloud() {
            return Vue.store.state.tcloud.instance
        },
        isRendered() {
            return this.wordCloud && this.wordCloud.rendered
        }
    },
    methods: {
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
        // 下载到本地
        downloadPc() {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.WC,
                statistic.opt_label.WC.exp])

            Vue.loading.open('下载中，请等候')
            const url = this.wordCloud.$canvas.toDataURL()
            const a = document.createElement('a')
            const dateStr = new Date().format('yyyyMMddhhmmss')
            a.download = `轻设计_文字云_${dateStr}`
            a.href = url
            a.click()
            Vue.loading.close()
        },
        // 导出到图片库
        exportImageLibrary() {
            if (this.userInfo.id) {
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.WC,
                    statistic.opt_label.WC.h5])

                Vue.loading.open('导出中')

                this.uploadImg(this.wordCloud.$canvas).then(res => {
                    const urlArr = [{
                        extName: 'png',
                        path: res,
                        name: res,
                        tmbPath: res
                    }]
                    const sid = this.scene.eqxScene && this.scene.eqxScene.sceneJson ? this.scene.eqxScene.sceneJson.id : 0
                    Vue.api.file.saveToH5(Vue.env.h5TagId, urlArr, sid)
                        .then((res) => {
                            Vue.loading.close()
                            Vue.notifier.info('导出成功，刷新H5素材库可查看')
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
        },
        // 关闭
        closeClick() {
            if (this.mode === this.tcloudMode.independent) {
                if (this.userInfo.id) {
                    window.location.href = `${Vue.env.host.auth}/eip/scene?type=h2`
                } else {
                    this.$router.push({ path: '/visit' })
                }
            } if ([this.tcloudMode.tool].includes(this.mode)) {
                this.close()
            }
        },
        // 插入画布
        insert() {
            this.addToPage()
        },
        // 绘制图片组件到画布
        addElement(src) {
            const result = this.eqxPage.getElementPosOfCenter(400, 400, this.eqxPage.scale)
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
                    },
                    wordcloud: true // 字云生成的图片带有此标识符，Max审核时需要
                },
                css: {
                    left: Math.round(left) + 'px',
                    top: Math.round(top) + 'px',
                    width: 400 + 'px',
                    height: 400 + 'px',
                    border: '1px solid transparent'
                }
            }

            this.eqxPage.addElement(elementJson)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        // 添加到画布
        addToPage() {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.WC,
                statistic.opt_label.WC.draw])

            Vue.loading.open('正在添加')

            this.uploadImg(this.wordCloud.$canvas).then(res => {
                Vue.loading.close()
                this.addElement(res)
                Vue.notifier.success('添加成功')
                this.close()
            }).catch(err => {
                err && Vue.logger.error(err)
                Vue.loading.close()
                Vue.notifier.fail('服务器异常，请稍后重试')
            })
        }
    }
}
</script>

<style lang="scss">
$nav-blue: rgba(21, 147, 255, 1);
.eqc-tcloud-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    height: 60px;
    font-size: 13px;
    color: #4f5d69;
    background: #fff;
    box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.16);
    z-index: 2;
    cursor: default;
    .eqf-eqxiulogo {
        color: $nav-blue;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 60px;
        font-size: 43px;
        margin-left: 13px;
    }
    ul {
        position: absolute;
        right: 12px;
        list-style: none;
        li {
            position: relative;
            float: left;
        }
        .li-btn {
            background: rgba(255, 255, 255, 1);
            border-radius: 3px;
            padding: 11px 20px;
            font-size: 13px;
            font-weight: 400;
            color: #252b3f;
            text-align: center;
            cursor: pointer;
        }
        li.line {
            width: 1px;
            height: 20px;
            background: rgba(230, 235, 237, 1);
            margin-top: 8px;
        }

        // 正常状态
        li.btn {
            color: #252b3f;
            cursor: pointer;
            &:hover {
                color: #1593ff;
            }
        }
        // 禁用状态
        li.btn-disable {
            color: #ccd5db;
            cursor: not-allowed;
            &:hover {
                // background: #ccd5db;
                color: #ccd5db;
            }
        }
        li.btn-complete {
            // 完成
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
        // 限免
        .limited-time-free {
            top: -2px;
            right: -10px;
            position: absolute;
            z-index: 1;
            width: 32px;
            height: 16px;
            line-height: 16px;
            background: rgba(255, 41, 106, 1);
            border-radius: 8px;
            text-align: center;
            font-size: 12px;
            font-weight: 400;
            color: rgba(255, 255, 255, 1);
        }
    }
    // 关闭
    .close {
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
        position: absolute;
        right: 16px;
        &:hover {
            background: #ff2a6a;
        }
    }
    // 退出
    .exit {
        right: 24px;
        width: 36px;
        height: 36px;
        line-height: 36px;
        color: #252b3f;
        border-radius: 3px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        &:hover {
            color: #ff2a6a;
        }
    }
    .download {
        width: 106px;
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
    .download-disable {
        width: 106px;
        height: 40px;
        padding: 0;
        background: #ccd5db;
        color: #ffffff;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
        cursor: not-allowed;
        &:hover {
            background: #ccd5db;
            color: #ffffff;
        }
    }
}
</style>
