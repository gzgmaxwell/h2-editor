<template>
    <li class="eqc-scene-item">
        <div class="cover">
            <div
                :style="{backgroundImage: getBackgroundImage(item.cover)}"
                class="cover-blur"
            />
            <img
                :src="item.cover ? env.host.file + getQiniuZoomImage(item.cover) : cover"
                class="cover-real"
                @load="loadImage"
            >
            <div class="mask">
                <base-button
                    class="edit opacity opacity-blue h36"
                    @click.native="editScene(item)"
                >
                    编辑
                </base-button>
                <base-button
                    v-if="allowApplyTpl && [-1, 0].includes(item.isTpl)"
                    class="apply opacity opacity-blue h36"
                    @click.native="applyScene(item)"
                >
                    申请模板
                </base-button>
            </div>
            <span
                v-if="item.isTpl"
                :style="{background: applyStatus[item.isTpl].color}"
                class="status"
            >{{ applyStatus[item.isTpl].name }}</span>
            <span
                v-if="[3, 4].includes(item.isShare)"
                :style="{background: auditStatus[item.isShare].color}"
                class="audit-status"
            >{{ auditStatus[item.isShare].name }}</span>
        </div>
        <div class="detail">
            <div
                class="name ellipsis"
            >
                {{ item.title || '易企秀轻设计制作' }}
            </div>
            <div class="size">
                {{ productType[item.type] }}（{{ item.width | px2mm(item.unit) }}*{{ item.height | px2mm(item.unit) }} {{ item.unit === 'mm' ? '毫米' : '像素' }}）
            </div>
            <div class="more">
                <base-button
                    class="item opacity opacity-blue h36"
                    @click.native="transferScene(item)"
                >
                    <i class="icon eqf-gift-l" />
                    <span class="text">转赠</span>
                </base-button>
                <base-button
                    class="item opacity opacity-blue h36"
                    @click.native="copyScene(item)"
                >
                    <i class="icon eqf-copy-l" />
                    <span class="text">复制</span>
                </base-button>
                <base-button
                    class="item opacity opacity-red h36"
                    @click.native="deleteScene(item)"
                >
                    <i class="icon eqf-delete-l" />
                    <span class="text">删除</span>
                </base-button>
            </div>
        </div>
    </li>
</template>

<script>
import cover from '../../../img/cover.png'
import DialogApply from './DialogApply.vue'
import DialogTransfer from './DialogTransfer.vue'

export default {
    props: {
        item: {
            type: Object,
            default: null
        }
    },
    computed: {
        productType() {
            return this.$store.state.product.productType
        },
        applyStatus() {
            return {
                '-1': { name: '未通过', color: '#FF2A6A' },
                0: { name: '未申请', color: '' },
                1: { name: '已通过', color: '#1BC7B1' },
                2: { name: '审核中', color: '#1593FF' },
                3: { name: '审核中', color: '#1593FF' }
            }
        },
        auditStatus() {
            return {
                3: { name: '已发布', color: '#1593FF' },
                4: { name: '审核关闭', color: '#ff2a6a' }
            }
        },
        allowApplyTpl() {
            return this.user.allow('applyTpl') && this.item.type !== 0
        },
        cover() {
            return cover
        },
        size() {
            return 224
        }
    },
    methods: {
        getQiniuZoomImage(src) {
            return Vue.filter('qiniuZoom')(src, this.size)
        },
        getBackgroundImage(src) {
            src = this.getQiniuZoomImage(src)
            return Vue.filter('backgroundImage')(src)
        },
        loadImage(e) {
            // firefox下target有值，没有path；chrome下path有值，target为null
            const img = e.target || e.path[0]
            const { width, height } = img
            const size = this.size
            const setMarginLeft = () => {
                img.css({ marginLeft: (size - width) / 2 + 'px' })
            }
            const setMarginTop = () => {
                img.css({ marginTop: (size - height) / 2 + 'px' })
            }
            if (width > height) {
                setMarginTop()
                if (width < size) {
                    setMarginLeft()
                }
            } else {
                setMarginLeft()
                if (height < size) {
                    setMarginTop()
                }
            }
        },
        editScene(item) {
            const routeData = this.$router.resolve({ path: `/create/${item.id}_${item.code}` })
            window.open(routeData.href, '_blank')
        },
        applyScene(item) {
            const options = {
                component: DialogApply,
                data: {
                    id: item.id,
                    title: item.title,
                    type: item.type
                }
            }
            this.dialog.open(options)
                .then(data => this.api.scene.applyTpl(data))
                .then(() => {
                    item.isTpl = 2 // 设置状态为审核中
                    this.notifier.success('已提交申请')
                })
                .catch(err => err && this.logger.error(err))
        },
        transferScene(item) {
            // todo 转赠和删除需要判断是最后一个且不是第一个的情况
            const options = {
                component: DialogTransfer,
                data: {
                    id: item.id
                }
            }
            this.dialog.open(options)
                .then(() => {
                    this.$emit('transferScene')
                    this.notifier.success('转赠成功')
                })
                .catch(err => err && this.logger.error(err))
        },
        copyScene(item) {
            const idcode = `${item.id}_${item.code}`
            this.api.scene.copyScene(idcode)
                .then(() => {
                    this.$emit('copyScene')
                    this.notifier.success('复制成功')
                })
                .catch(err => err && this.logger.error(err))
        },
        deleteScene(item) {
            const idcode = `${item.id}_${item.code}`
            this.dialog.openConfirm({ msg: '确定要删除吗？' })
                .then(() => this.api.scene.deleteScene(idcode))
                .then(() => {
                    this.$emit('deleteScene')
                    this.notifier.success('删除成功')
                })
                .catch(err => err && this.logger.error(err))
        }
    }
}
</script>

<style lang="scss">
.eqc-scene-item {
    width: 224px;
    height: 324px;
    display: inline-block;
    vertical-align: top;
    border-radius: 4px;
    overflow: hidden;
    transition: all 0.3s;
    &:not(:nth-child(-n + 5)) {
        margin-top: 20px;
    }
    &:not(:nth-child(5n + 1)) {
        margin-left: 20px;
    }
    &:hover {
        box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
        transform: translateY(-12px);
        .cover {
            .mask {
                opacity: 1;
                .edit,
                .apply {
                    transform: translateY(28px);
                }
            }
        }
        .detail {
            transform: translateY(-60px);
        }
    }
    .cover {
        position: relative;
        height: 224px;
        overflow: hidden;
        .cover-blur {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: center/cover;
            filter: blur(10px);
        }
        .cover-real {
            position: absolute;
            left: 0;
            top: 0;
            background: white;
            max-width: 224px;
            max-height: 224px;
            box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
        }
        .mask {
            position: relative;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            background: rgba(0, 0, 0, 0.8);
            opacity: 0;
            transition: all 0.3s;
            .edit {
                width: 82px;
                margin-top: 36px;
                color: #fff;
            }
            .apply {
                width: 82px;
                margin: 36px 0 0 16px;
                color: #fff;
            }
        }
        .status {
            position: absolute;
            left: 0;
            top: 0;
            width: 56px;
            height: 24px;
            line-height: 24px;
            font-size: 12px;
            text-align: center;
            border-bottom-right-radius: 4px;
            color: #fff;
            background: #1bc7b1;
        }
        .audit-status {
            position: absolute;
            right: 0;
            top: 0;
            width: 56px;
            height: 24px;
            line-height: 24px;
            font-size: 12px;
            text-align: center;
            border-bottom-left-radius: 4px;
            color: #fff;
            background: #1bc7b1;
        }
    }
    .detail {
        background: #fff;
        transition: all 0.3s;
        .name {
            height: 64px;
            padding: 0 12px;
            line-height: 64px;
            border-bottom: 1px solid #e6ebed;
            color: #111;
        }
        .size {
            height: 36px;
            padding: 0 12px;
            line-height: 36px;
            font-size: 12px;
            color: #666;
        }
        .more {
            height: 60px;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 12px;
            .item {
                width: 36px;
                padding: 0 12px;
                display: flex;
                justify-content: flex-start;
                font-size: 14px;
                overflow: hidden;
                transition: all 0.3s;
                &:not(:first-child) {
                    margin-left: 6px;
                }
                &:hover {
                    width: 80px;
                }
                .icon {
                    margin-left: -2px;
                }
                .text {
                    margin-left: 12px;
                    white-space: nowrap;
                }
            }
        }
    }
}
</style>
