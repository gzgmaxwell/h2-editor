<template>
    <div
        class="eqc-photo-tool-bar"
        @mousedown.stop
    >
        <div class="scale">
            <span
                data-hint="真实尺寸"
                class="hint--top hint--rounded"
            >
                <span
                    class="icon real border"
                    @click="setScale('1')"
                >1:1 </span>
            </span>
            <span
                data-hint="适合画布"
                class="hint--top hint--rounded"
            >
                <span
                    class="icon eqf-bigger fit"
                    @click="setScale('fit')"
                />

            </span>
            <span
                :data-hint="isMac ? '缩小' : '缩小'"
                class="hint--top hint--rounded"
            >
                <span
                    class="icon eqf-zoom-in plus"
                    @click="setScale('-')"
                />

            </span>
            <span
                class="icon num"
                @click="setScale('1')"
            >{{ scale }}</span>
            <span
                :data-hint="isMac ? '放大' : '放大'"
                class="hint--top hint--rounded"
            >
                <span
                    class="icon eqf-zoom-out plus"
                    @click="setScale('+')"
                />
            </span>
            <span class="line" />
            <span
                data-hint="长按对比"
                class="hint--top hint--rounded"
            >
                <span
                    ref="original"
                    class="icon original border"
                >对比</span>
            </span>
        </div>
    </div>
</template>

<script>
import util from '../../../../utils/util'

export default {
    components: {

    },
    data() {
        return {
            scale: '',
            count: 0,
            timer: null
        }
    },
    computed: {
        photoScene() {
            return Vue.store.state.photoScene
        },
        eqxScene() {
            return this.photoScene.eqxScene
        },
        eqxPage() {
            return this.photoScene.eqxPage
        },
        isMac() {
            return util.isMac
        },
        sceneJson() {
            return this.eqxScene.sceneJson
        },
        pageJson() {
            return this.eqxPage.pageJson
        }
    },
    watch: {
        'eqxPage.scale': {
            handler() {
                this.scale = parseInt(this.eqxPage.scale * 100) + '%'
            },
            // 避免首次eqxPage改变时，watch还未执行的问题
            immediate: true
        }
    },
    created() {
    },
    mounted() {
        const $original = this.$refs.original
        $original.addEventListener('mousedown', e => {
            this.timer = setInterval(() => {
                this.count++
                if (this.count > 2) {
                    this.showOriginal(true)
                }
            }, 100)

            const mouseup = () => {
                clearInterval(this.timer)
                this.count = 0
                this.showOriginal(false)
                document.removeEventListener('mouseup', mouseup)
            }

            document.addEventListener('mouseup', mouseup)
        })
    },
    methods: {
        setScale(type) {
            const $elWorkspace = this.$parent.$el
            const workspaceWidth = $elWorkspace.offsetWidth
            const workspaceHeight = $elWorkspace.offsetHeight
            this.eqxPage.setScale(type, workspaceWidth, workspaceHeight)
        },
        showOriginal(show) {
            Vue.store.commit('PHOTO_TOOBAR_ORIGINAL', { show })
        }
    }

}
</script>

<style lang="scss">
.eqc-photo-tool-bar {
    user-select: none;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    left: calc(50% - 153px);
    height: 36px;
    bottom: 8px;
    width: 306px;
    font-size: 12px;
    color: #fff;
    background: #fff;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.16);
    border-radius: 20px;
    z-index: 4;
    .line {
        width: 1px;
        height: 20px;
        background: #ccd5db;
        margin-right: 16px;
    }
    .icon {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        width: 28px;
        height: 28px;
        font-size: 16px;
        transition: all 0.3s;
        background: #fff;
        color: #76838f;
        cursor: pointer;

        &.real {
            width: 28px;
            height: 20px;
            justify-content: center;
            font-size: 12px;
            border-radius: 10px;
            background: #76838f;
            color: #fff;
            margin: 0 6px;
            &:hover {
                background: #1593ff;
                color: #fff;
            }
        }
        &.fit {
            width: 28px;
            margin: 0 1px;
            background: #fff;
            color: #76838f;
        }
        &.num {
            width: 40px;
            font-size: 14px;
            cursor: default;
            width: 40px;
            height: 20px;
            color: #76838f;
            &:hover {
                color: #76838f;
            }
        }
        &.back {
            background: #fff;
        }
        &.plus {
            width: 18px;
            margin: 0 10px;
            justify-content: flex-start;
        }
        &.border {
            &::after {
                position: absolute;
                right: -1px;
                top: 0;
                width: 1px;
                height: 100%;
                background: rgba(255, 255, 255, 0.3);
                content: "";
            }
        }
        &:hover {
            color: #1593ff;
        }

        &.original {
            width: 44px;
            height: 20px;
            justify-content: center;
            font-size: 12px;
            border-radius: 10px;
            background: #76838f;
            color: #fff;
            // margin: 0 8px;
            &:hover {
                background: #1593ff;
                color: #fff;
            }
        }
    }
    .scale {
        display: flex;
        align-items: center;
    }
}
</style>
