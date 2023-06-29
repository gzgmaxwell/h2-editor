<template>
    <div class="eqc-aimatting-head">
        <ul
            :class="[{'btn-disabled':!isReady}]"
            class="list"
        >
            <li class="logo">
                <img
                    :src="mattingLogo"
                >
            </li>
            <li
                class="back hint--bottom hint--rounded"
                data-hint="撤销"
                @click="undo()"
            >
                <i class="eqf-back" />
            </li>
            <li
                class="rework hint--bottom hint--rounded"
                data-hint="恢复"
                @click="redo()"
            >
                <i class="eqf-rework" />
            </li>
            <li
                :class="[{'btn-disabled':scale <= 0.1}, {'btn-normal': isReady && scale > 0.1}]"
                class="zoom-in"
                @click="scaleCanvas('-')"
            >
                <i class="eqf-zoom-in" />
            </li>
            <li
                class="scale-num"
                @click="scaleCanvas('1')"
            >
                {{ (parseFloat(scale)*100).toFixed(0) +'%' }}
            </li>
            <li
                :class="[{'btn-disabled':scale >= 2}, {'btn-normal': isReady && scale < 2}]"
                class="zoom-out"
                @click="scaleCanvas('+')"
            >
                <i class=" eqf-zoom-out" />
            </li>
            <li
                :class="[{'btn-normal': isReady},{'drag-selected': isOpenDrag}]"
                class="drag"
                @click="dragCanvas()"
            >
                <i class="eqf-touch-f" />
            </li>
        </ul>
        <div
            class="operation"
        >
            <div
                v-if="mode !== aiMattingMode.setting && mattingInfo.src !== ''"
                class="li-btn btn"
                @click="upload()"
            >
                更换图片
            </div>
            <div
                v-show="mode !== aiMattingMode.setting && mattingInfo.src !== ''"
                class="line"
            />
            <div
                v-if="mode === aiMattingMode.tool"
                :class="[{'btn-disable':!isReady},{'btn':isReady}]"
                class="li-btn"
                @click="insert()"
            >
                插入画布
                <span
                    class="limited-time-free"
                >限免</span>
            </div>
            <div
                v-show="mode === aiMattingMode.tool"
                class="line"
            />
            <div
                v-if="mode !== aiMattingMode.setting"
                :class="[{'btn-disable':!isReady},{'btn':isReady}]"
                class="li-btn"
                @click="exportToLib()"
            >
                存入图片库
                <span
                    class="limited-time-free"
                >限免</span>
            </div>
            <div class="line" />
            <div
                v-if="mode !== aiMattingMode.setting"
                :class="[{'download-disable':!isReady},{'download':isReady}]"
                class="li-btn"
                @click="downloadToPc()"
            >
                下载到电脑
                <span
                    class="limited-time-free"
                >限免</span>
            </div>
            <div
                v-if="mode === aiMattingMode.independent"
                class="exit hint--bottom-left hint--rounded"
                data-hint="回到我的作品"
                @click="exit()"
            >
                退出
            </div>
            <div
                v-if="mode === aiMattingMode.setting"
                class="li-btn btn-complete"
                @click="down()"
            >
                完成
            </div>
            <div
                v-if="mode !== aiMattingMode.independent"
                class="close"
                @click="closeMatting()"
            >
                <i class="eqf-no" />
            </div>
        </div>
    </div>
</template>

<script>
import aiMattingMode from '../../../config/enum.aiMattingMode.type'
import mattingLogo from '../../../img/matting_logo.png'

export default {
    props: {
        mode: {
            type: Number,
            default: null
        },
        data: {
            type: Object,
            default: null
        },
        close: {
            type: Function,
            default: null
        },
        download: {
            type: Function,
            default: null
        },
        exportToH5: {
            type: Function,
            default: null
        },
        finish: {
            type: Function,
            default: null
        },
        changeImage: {
            type: Function,
            default: null
        },
        insertToPage: {
            type: Function,
            default: null
        }
    },
    data() {
        return {
            mattingLogo,
            aiMattingMode,
            scale: 1,
            isOpenDrag: false,
            isReady: false // 可操作状态
        }
    },
    computed: {
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        mattingInfo() {
            return Vue.store.state.aiMatting
        },
        mattingSrc() {
            return this.mattingInfo.src
        }
    },
    watch: {
        mattingSrc: {
            handler(newVal) {
                if (newVal !== '') {
                    this.isReady = true
                }
            }
        }
    },
    created() {
        this.isReady = this.mattingSrc !== ''
    },
    methods: {
        undo() {
            if (!this.isReady) {
                return
            }
            Vue.store.commit('AIMATTING_MATTING_UNDO')
        },
        redo() {
            if (!this.isReady) {
                return
            }
            Vue.store.commit('AIMATTING_MATTING_REDO')
        },
        scaleCanvas(type, step = 0.1) {
            if (!this.isReady) {
                return
            }
            // 判断是放大还是缩小
            if (type === '+') {
                this.scale += step
            } else if (type === '-') {
                this.scale -= step
            } else if (type === '1') {
                this.scale = 1
            }

            // 限制放大缩小的边界值
            if (this.scale > 2) {
                this.scale = 2
            } else if (this.scale < 0.1) {
                this.scale = 0.1
            }
            Vue.store.commit('AIMATTING_MATTING_SCALE', this.scale)
        },
        dragCanvas() {
            if (!this.isReady) {
                return
            }
            this.isOpenDrag = !this.isOpenDrag
            Vue.store.commit('AIMATTING_MATTING_OPEN_DRAG', this.isOpenDrag)
        },
        upload() {
            this.changeImage()
        },
        exit() {
            if (this.userInfo.id) {
                window.location.href = `${Vue.env.host.auth}/eip/scene?type=h2`
            } else {
                this.$router.push({ path: '/visit' })
            }
        },
        closeMatting() {
            this.close()
        },
        down() {
            this.finish()
        },
        insert() {
            if (!this.isReady) {
                return
            }
            this.insertToPage()
        },
        exportToLib() {
            if (!this.isReady) {
                return
            }
            this.exportToH5()
        },
        downloadToPc() {
            if (!this.isReady) {
                return
            }
            this.download()
        }

    }
}
</script>

<style lang="scss">
.eqc-aimatting-head {
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
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.16);
    .btn-disabled {
        color: #ccd5db;
        cursor: not-allowed;
        &:hover {
            color: #ccd5db;
            background: #ffffff;
        }
    }
    .btn-normal {
        &:hover {
            color: #1593ff;
        }
    }
    .list {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: center;
        .logo {
            width: 129px;
            height: 60px;
            img {
                width: 103px;
                margin: 19.5px 13px;
            }
        }
        .back,
        .rework {
            width: 36px;
            height: 36px;
            font-size: 20px;
            // background: #ff0;
            text-align: center;
            line-height: 36px;
            color: #ccd5db;
            cursor: auto;
            pointer-events: none;
        }
        .back {
            margin-left: 16px;
        }
        .rework {
            margin-right: 16px;
        }
        .zoom-in,
        .zoom-out {
            font-size: 20px;
        }
        .zoom-in {
            padding-left: 19px;
            margin-right: 10px;
            border-left: 1px solid #ccd5db;
        }
        .zoom-out {
            padding-right: 19px;
            margin-left: 10px;
            border-right: 1px solid #ccd5db;
        }
        .drag {
            font-size: 20px;
            margin-left: 20px;
        }
        .drag-selected {
            color: #1593ff;
        }
    }
    .operation {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: center;
        .li-btn {
            background: rgba(255, 255, 255, 1);
            border-radius: 3px;
            padding: 11px 20px;
            font-size: 13px;
            font-weight: 400;
            color: #252b3f;
            text-align: center;
            cursor: pointer;
            position: relative;
        }
        .line {
            width: 1px;
            height: 20px;
            background: rgba(230, 235, 237, 1);
        }

        // 正常状态
        .btn {
            color: #252b3f;
            cursor: pointer;
            &:hover {
                color: #1593ff;
            }
        }
        // 禁用状态
        .btn-disable {
            color: #ccd5db;
            cursor: not-allowed;
            user-select: none;
            &:hover {
                color: #ccd5db;
            }
        }
        // 完成
        .btn-complete {
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
            user-select: none;
            &:hover {
                background: #ccd5db;
                color: #ffffff;
            }
        }
    }
}
</style>
