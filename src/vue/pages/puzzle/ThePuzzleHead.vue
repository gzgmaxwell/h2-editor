<template>
    <div class="eqc-puzzle-head">
        <ul
            :style="{'right':mode === puzzleMode.independent ? '72px' : '56px'}"
            class="list"
        >
            <li
                v-if="mode === puzzleMode.tool"
                :class="['insert',isRendered ? 'btn' : 'btn-disable']"
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
                v-if="mode === puzzleMode.tool"
                class="line"
            />
            <li
                v-if="mode !== puzzleMode.setting"
                :class="[isRendered ? 'btn' : 'btn-disable']"
                class="li-btn"
                @click="toH5"
            >
                存入图片库
                <span
                    v-if="limitedTimeFree"
                    class="limited-time-free"
                >限免</span>
            </li>
            <li
                v-if="mode !== puzzleMode.setting"
                class="line"
            />
            <li
                v-if="mode !== puzzleMode.setting"
                :class="[{'download-disable':!isRendered},{'download':isRendered}]"
                @click="openExport"
            >
                下载到电脑
                <span
                    v-if="limitedTimeFree"
                    class="limited-time-free"
                >限免</span>
            </li>
            <li
                v-if="mode === puzzleMode.setting"
                :class="[{'finish-disable':!isRendered},{'finish':isRendered}]"
                @click="finish"
            >
                完成
            </li>
        </ul>
        <div
            v-if="mode === puzzleMode.independent"
            class="exit hint--bottom-left hint--rounded"
            data-hint="回到我的作品"
            @click="exit"
        >
            退出
        </div>
        <i
            v-if="mode !== puzzleMode.independent"
            class="close eqf-no"
            @click="close"
        />
    </div>
</template>

<script>
import puzzleMode from '../../../config/enum.puzzleMode.type'
import statistic from '../../../config/statistic'
import testSvg from '../../../img/puzzle/puzzle_11.svg'
import HeadExport from '../create/head/HeadExport.vue'
import message from '../../../utils/message'

export default {
    props: {
    },
    data() {
        return {
            puzzleMode,
            limitedTimeFree: true, // 是否限时免费
            isRendered: true,
            src: testSvg
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
        pageJson() {
            return this.eqxPage.pageJson
        },
        sceneJson() {
            return this.eqxPage.eqxScene.sceneJson
        },
        scale() {
            return this.eqxPage.scale
        },
        isSaving() {
            return this.scene.isSaving
        },
        puzzle() {
            return Vue.store.state.puzzle
        },
        mode() {
            return Number(this.puzzle.mode)
        }
    },
    methods: {
        getElement() {
            return (this.pageJson.elements && this.pageJson.elements.length > 0) ? this.pageJson.elements[0] : null
        },
        savePage() {
            Vue.arrowNotifier.close() // 清除提示框
            if (this.eqxPage.isModified) {
                return this.$store.dispatch('PAGE_SAVE', { eqxPage: this.eqxPage, needCover: true })
                    .catch(() => {
                        return Promise.reject()
                    })
            }
            return Promise.resolve()
        },
        clearWorkspace() {
            return new Promise((resolve, reject) => {
                this.eqxPage.$el.parentElement.trigger('mousedown')
                document.trigger('mouseup')
                // 骚操作1：等待mousedown异步执行完毕 才去执行保存操作
                setTimeout(() => {
                    resolve()
                }, 100)
            })
        },
        openExport(event, expressEdition = false, type) {
            if (this.isSaving) {
                return
            }
            if (!this.getElement()) {
                Vue.notifier.warn('请先添加拼图到画布')
                return
            }
            this.clearWorkspace().then(() => {
                if (this.userInfo.id) {
                    let promise = Promise.resolve()
                    const options = {
                        component: HeadExport,
                        data: {
                            userId: this.userInfo.id,
                            type: type
                        }
                    }
                    // 用户需要绑定手机（type=21,22 不检测）
                    if (!([21, 22].includes(this.userInfo.type)) && !this.userInfo.phone) {
                        promise = this.dialog.openBindPhone()
                    }
                    promise
                        .then(() => {
                            Vue.loading.open('正在保存')
                            this.savePage().then(res => {
                                Vue.loading.close()
                                this.slide.open(options)
                                    .catch(err => err && this.logger.error(err))
                            }).catch(err => {
                                Vue.loading.close()
                                err && Vue.logger.error(err)
                            })
                        })
                        .catch(err => err && this.logger.error(err))
                } else {
                    Vue.notifier.info('导出功能需登录后才能使用')
                }
            })
        },
        // 删除作品
        delete() {
            const idcode = `${this.sceneJson.id}_${this.sceneJson.code}`
            return new Promise((resolve, reject) => {
                this.api.scene.deleteScene(idcode)
                    .then(() => {
                        resolve()
                    })
                    .catch(err => err && reject(err))
            })
        },
        // 返回我的作品 入口1
        exit() {
            // 先删除作品
            this.delete().then(() => {
                this.exitGo()
            }).catch(err => err && this.exitGo())
        },
        exitGo() {
            if (this.userInfo.id) {
                // 工作台
                const path = `${Vue.env.host.auth}/eip/scene?type=h2`
                window.location.href = path
            } else {
                this.$router.push({ path: '/visit' })
            }
        },
        toH5() {
            if (!this.getElement()) {
                Vue.notifier.warn('请先添加拼图到画布')
                return
            }
            if (this.userInfo.id) {
                this.loading.open('生成中')
                // 导出到图片库，默认去除水印
                Vue.store.dispatch('GET_NO_WATERMARK_COVER', { eqxPage: this.eqxPage }).then(data => {
                    this.loading.close()
                    const key = data.data.key
                    const url = [{
                        path: key,
                        name: key,
                        tmbPath: key
                    }]
                    this.exportToH5(url)
                })
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.PUZZLE,
                    statistic.opt_label.PUZZLE.expH5])
            } else {
                this.notifier.info('导出到H5功能需登录后才能使用')
            }
        },
        exportToH5(urlArr) {
            this.api.file.saveToH5(Vue.env.h5TagId, urlArr, this.sceneJson.id)
                .then((res) => {
                    this.notifier.info('导出成功，刷新图片库可查看')
                })
                .catch(err => err && this.logger.error(err))
        },
        // 完成 入口3
        finish() {
            const ele = this.getElement()
            if (!ele) {
                Vue.notifier.warn('请先添加拼图到画布')
                return
            }
            const copyCss = JSON.parse(JSON.stringify(ele.css))
            const copyProperty = JSON.parse(JSON.stringify(ele.property))
            // 先删除作品
            this.delete().then(() => {
                message.success({
                    svg: {
                        css: copyCss,
                        property: copyProperty
                    },
                    msg: 'finish'
                })
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.PUZZLE,
                    statistic.opt_label.PUZZLE.finish])
            }).catch(err => err && this.logger.error(err))
        },
        // 关闭 入口2、3
        close() {
            // 先删除作品
            this.delete().then(() => {
                message.success({
                    msg: 'close'
                })
            }).catch(err => err && this.logger.error(err))
        },
        // 插入画布 入口2
        insert() {
            const ele = this.getElement()
            if (!ele) {
                Vue.notifier.warn('请先添加拼图到画布')
                return
            }
            const copyCss = JSON.parse(JSON.stringify(ele.css))
            const copyProperty = JSON.parse(JSON.stringify(ele.property))
            // 先删除作品
            this.delete().then(() => {
                message.success({
                    svg: {
                        css: copyCss,
                        property: copyProperty
                    },
                    msg: 'insert'
                })
                window._hmt.push(['_trackEvent',
                    statistic.category.F,
                    statistic.action.PUZZLE,
                    statistic.opt_label.PUZZLE.insert])
            }).catch(err => err && this.logger.error(err))
        }
    }
}
</script>

<style lang="scss">
$nav-blue: rgba(21, 147, 255, 1);
.eqc-puzzle-head {
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
    .download,
    .finish {
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
    .download-disable,
    .finish-disable {
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
}
</style>
