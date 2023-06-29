<template>
    <div class="eqc-nav-upload">
        <base-tab
            :class="{'active-qrcode': uploadQrcode.show}"
            :list="tabList"
            :selected-item="tabSelected"
            class="transition"
            @select="selectTab"
        />
        <base-config
            type="2"
            :state="uploadManage.show"
            @configClick="configClick"
        />
        <tag-list
            ref="tagList"
            :tags="tags"
            @refreshTag="getTags"
            @choose="chooseTag"
            @edit="editTag"
        />
        <div
            ref="wrap"
            v-scroll-bar="{onScrollMove}"
            :class="{'active-qrcode': uploadQrcode.show}"
            :style="{height: contentHeight}"
            class="content transition"
        >
            <ul
                v-show="info.list.length"
                class="list"
            >
                <image-item
                    v-for="item of info.list"
                    :key="item.id"
                    :item="item"
                    :is-upload="true"
                    :is-manage="uploadManage.show"
                    :category="category"
                    @delete="deleteImages"
                    @uploadComplete="onComplete"
                />
                <base-list-status-infinite
                    v-if="info.list.length && (info.isBusy || info.isEnd)"
                    :is-busy="info.isBusy"
                    :is-end="info.isEnd"
                    :bg-color="'rgba(255,255,255,1)'"
                />
            </ul>
            <base-list-status
                v-if="!info.list.length"
                :is-busy="info.isBusy"
                :is-empty="!info.isBusy && !info.list.length"
                msg-result="暂无图片"
            />
        </div>
        <div
            v-if="!showCondition"
            class="upload"
        >
            <div
                v-if="category !== 'tcloud'"
                class="info"
            >
                <span v-if="isMember">单张图片大小上限已升级到20M！</span>
                <span v-if="!isMember">单张图片大小须小于10M</span>
                <span
                    v-if="!isMember"
                    class="upgrade"
                    @click="bugMember"
                >升级到20M>></span>
            </div>
            <div
                v-if="category === 'tcloud'"
                v-show="showUploadTip"
                class="rules"
            >
                <div class="icon">
                    <i class="eqf-apple" />
                </div>
                <div class="text">
                    <p>仅支持PNG格式图片 </p>
                    <p> 图片小于2M</p>
                    <p>背景必须透明</p>
                </div>
            </div>
            <div
                class="btn-area"
                :style="{marginLeft:uploadManage.show?'auto':'-8px'}"
            >
                <div
                    :class="{hide: uploadManage.show}"
                    class="wrap"
                >
                    <div
                        @mouseover="showUploadTip = true"
                        @mouseleave="showUploadTip = false"
                    >
                        <upload-pc
                            v-bind="uploadOptions"
                            :css="uploadCss"
                            :hover-css="hoverCss"
                        />
                    </div>
                    <upload-mobile
                        ref="mobileUploadBtn"
                        :css="uploadCss"
                        :hover-css="hoverCss"
                        :qrcode-css="qrcodeCss"
                        :use-type="category"
                    />
                    <div
                        :class="[{'hint--top-left':category !== 'tcloud'},{'hint--rounded':category !== 'tcloud'}]"
                        class="fast-upload "
                        data-hint="可拖拽、截图上传"
                    >
                        <span>极速上传</span>
                    </div>
                </div>
                <upload-manage
                    :items="info.list"
                    :tags="tags"
                    :tag-id="tagId"
                    @delete="deleteImages"
                    @addTo="addTo"
                />
            </div>
        </div>
        <upload-condition
            v-if="showCondition"
            ref="uploadCondition"
            :option="fileOption"
            :category="category"
            @onClose="closeUploadCondition"
        />
        <foot-tips
            type="upload"
            :bottom="category === 'tcloud'?'58':'85'"
        />
    </div>
</template>

<script>
import ImageItem from './material/MaterialImageItem.vue'
import UploadPc from './upload/UploadPc.vue'
import UploadMobile from './upload/UploadMobile.vue'
import UploadManage from './upload/UploadManage.vue'
import statistic from '../../../../config/statistic'
import uploadCondition from './upload/UploadCondition.vue'
import TagList from './upload/TagList.vue'
import FootTips from './material/MaterialFootTips.vue'

export default {
    components: {
        ImageItem,
        UploadPc,
        UploadMobile,
        UploadManage,
        uploadCondition,
        TagList,
        FootTips
    },
    props: {
        category: {
            type: String,
            default: 'h2'
        }
    },
    data() {
        return {
            showUploadTip: false,
            tabList: [{
                name: '已上传',
                type: 'upload'
            }, {
                name: '回收站',
                type: 'garbage',
                icon: 'eqf-tipvip'
            }],
            tabSelected: null,
            tags: [],
            tagId: -1,
            tagIdAll: -1, // “全部”，这个不能被修改
            info: {},
            key: '', // 加载列表用的key
            isManage: false,
            fileOption: null,
            showCondition: false,
            isMember: false,
            uploadCss: {
                background: 'white',
                color: '#252B3F',
                fontSize: '13px',
                border: '1px solid transparent',
                borderRight: '1px solid #CCD5DB',
                height: '24px',
                margin: 0
            },
            hoverCss: {
                background: 'white',
                color: '#1593ff',
                fontSize: '13px',
                border: '1px solid transparent',
                borderRight: '1px solid #CCD5DB',
                height: '24px',
                margin: 0
            },
            qrcodeCss: {
                right: '-104px',
                bottom: this.category === 'tcloud' ? '41px' : '70px'
            },
            tagListHeight: 80
        }
    },
    computed: {
        uploadOptions() {
            const options = {
                onComplete: this.onComplete,
                onCheckStart: this.checkStart,
                uploadProgressEach: this.uploadProgressEach,
                tagIdAll: this.tagId
            }
            if (this.category === 'tcloud') {
                options.type = 'shape'
            }
            return options
        },
        layout() {
            return Vue.store.state.layout
        },
        uploadReload() {
            return this.layout.uploadReload
        },
        uploadQrcode() {
            return this.layout.uploadQrcode
        },
        uploadManage() {
            return this.layout.uploadManage
        },
        userInfo() {
            return Vue.store.state.user.userInfo
        },
        buyMemberAuth() {
            return !(this.userInfo.members && this.userInfo.members.some(item => [14].includes(item.memberId))) && this.user.allow('buyMember')
        },
        contentHeight() {
            const uploadHeight = this.category === 'tcloud' ? 57 : 86
            const headerHeight = 61
            const total = headerHeight + this.tagListHeight + uploadHeight
            return `calc(100% - ${total}px)`
        }
    },
    watch: {
        'uploadReload.random': {
            handler() {
                this.onComplete(this.tagIdAll)
                const $mob = this.$refs.mobileUploadBtn
                $mob.closeQrcode()
            }
        }
    },
    created() {
        this.getUploadBenefit()
        this.tabSelected = this.tabList[0]
        this.getProducts(this.tagId)
        this.getTags()
    },
    methods: {
        setTagListHeight() {
            this.tagListHeight = this.$refs.tagList.$el.offsetHeight
        },
        // 打开设置模式
        configClick() {
            const show = !Vue.store.state.layout.uploadManage.show
            Vue.store.commit('LAYOUT_NAV_UPLOAD_MANAGE', { show })
        },
        getUploadBenefit() {
            if (Vue.store.state.user.userInfo && ([7, 8, 9].includes(Vue.store.state.user.userInfo.memberType) || (Vue.store.state.user.userInfo.members && Vue.store.state.user.userInfo.members.some(item => [7, 8, 9].includes(item.memberId))))) {
                Vue.store.commit('USER_UPLOAD_LIMIT_RIGHT', 20)
                this.isMember = true
            } else {
                const benefitId = Vue.env.benefits.uploadLimit
                Vue.api.user.getUserBenefits(benefitId).then(data => {
                    if (data.data.list.length > 0) {
                        // 有这个权益
                        const val = data.data.list[0].surplusAmount
                        Vue.store.commit('USER_UPLOAD_LIMIT_RIGHT', val)
                        if (Number(val) === 20) {
                            this.isMember = true
                        }
                    } else {
                        Vue.store.commit('USER_UPLOAD_LIMIT_RIGHT', 10)
                        this.isMember = false
                    }
                })
            }
        },
        closeUploadCondition() {
            this.showCondition = false
        },
        checkStart(option) {
            this.fileOption = option
            this.showCondition = true
        },
        uploadProgressEach(percent, i, stateNum) {
            this.$refs.uploadCondition.refreshUploadState(percent, i, stateNum)
        },
        selectTab(item) {
            if (item.type === 'garbage') {
                this.notifier.info('暂未开放此功能')
            }
        },
        chooseTag(tagId) {
            if (tagId !== this.tagId) {
                // 切换选中的分组时，清除刚才选中的文件
                this.info.list.forEach(item => this.$set(item, 'isSelected', false))

                this.tagId = tagId
                this.getProducts(tagId)
            }
        },
        editTag(tag, name) {
            this.api.tag.editTag(tag.id, name)
                .then(() => { tag.name = name })
                .catch(err => err && this.logger.error(err))
        },
        getTags() {
            this.api.tag.getTags()
                .then(res => { this.tags = res.data.list })
                .then(() => this.setTagListHeight())
                .catch(err => err && this.logger.error(err))
        },
        getProducts(tagId) {
            this.key = Vue.infiniteScroll.setKey({
                tab: this.tabList[0].type,
                tagId: tagId
            })
            this.info = Vue.infiniteScroll.getInfo(this.key)
            if (!this.info.list.length) {
                this.getNextPage()
            }
            setTimeout(() => this.$refs.wrap.myScroll.scrollToTop(), 100)
        },
        onScrollMove(e, info) {
            if (info.scrollY + 100 > info.maxScrollY) {
                this.getNextPage()
            }
            // 关闭tag-list的剩余分组
            this.$refs.tagList.closeRestPop()
        },
        getNextPage() {
            Vue.infiniteScroll.getMoreItems(this.key)
                .catch(err => err && this.logger.error(err))
        },
        onComplete(tagId) {
            this.tagId = tagId
            this.infiniteScroll.clearKey({
                tab: this.tabList[0].type,
                tagId: tagId
            })
            // 其他目录上传之后 要刷新当前上传的目录和全部目录
            if (tagId !== this.tagIdAll) {
                this.infiniteScroll.clearKey({
                    tab: this.tabList[0].type,
                    tagId: this.tagIdAll
                })
                this.getProducts(this.tagIdAll)
            }
            this.getProducts(tagId)
        },
        manage(isManage) {
            this.isManage = isManage
        },
        deleteImages(fileIds) {
            // 这里先拿到值，避免ajax等待时，用户进行了别的操作，导致tagId发生变化
            const tagId = this.tagId
            if (this.tagId === this.tagIdAll) {
                this.dialog.openConfirm({ msg: '确定要删除吗？' })
                    .then(() => this.api.file.deleteFiles(fileIds))
                    .then(() => {
                        this.notifier.success('删除成功')
                        // 这里涉及到删除多个文件，以及分页的情况，采用前端删除的话处理麻烦，所以直接调接口
                        this.onComplete(this.tagIdAll)
                        // 因为不知道哪些文件在哪些分组里，所以把所有分组里的缓存都删了
                        this.tags.forEach(item => {
                            this.infiniteScroll.clearKey({
                                tab: this.tabList[0].type,
                                tagId: item.id
                            })
                        })
                    })
                    .catch(err => err && this.logger.error(err))
            } else {
                this.dialog.openConfirm({ msg: '只在该分组中删除图片，若要真正删除请切换到“全部”中' })
                    .then(() => this.api.tag.clearTag(this.tagId, fileIds))
                    .then(res => {
                        this.notifier.success('删除成功')
                        // 这里涉及到删除多个文件，以及分页的情况，采用前端删除的话处理麻烦，所以直接调接口
                        this.onComplete(tagId)
                    })
                    .catch(err => err && this.logger.error(err))
            }
        },
        addTo(tag) {
            // 这里先拿到值，避免ajax等待时，用户进行了别的操作，导致info发生变化
            const info = this.info
            const fileIds = []
            info.list.forEach(item => item.isSelected && fileIds.push(item.id))
            this.api.tag.addToTag(tag.id, fileIds)
                .then(() => {
                    this.notifier.success('添加成功')
                    info.list.forEach(item => this.$set(item, 'isSelected', false))
                    Vue.infiniteScroll.clearKey({
                        tab: this.tabList[0].type,
                        tagId: tag.id
                    })
                })
                .catch(err => err && this.logger.error(err))
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
        }
    }
}
</script>

<style lang="scss">
.eqc-nav-upload {
    position: relative;
    background-color: #ffffff;
    .active-qrcode {
        transform: translateY(-288px);
    }
    .content {
        position: relative;
        margin-top: 4px;
        padding: 0 16px;
        z-index: 3; // 需要在手机上传二维码的上面
        background: #ffffff;
        .list {
            position: relative;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            padding-bottom: 40px;
            .eqc-list-status-infinite {
                background-color: #ffffff;
            }
        }
    }
    .upload {
        padding: 16px;
        border-top: 1px solid #ccd5db;
        .info {
            font-size: 12px;
            display: flex;
            justify-content: space-between;
            margin-bottom: 17px;
            z-index: 4;
            .upgrade {
                color: #c09659;
                cursor: pointer;
            }
        }
        .rules {
            width: 100%;
            position: absolute;
            bottom: 53px;
            left: 0;
            display: flex;
            background: #ffffff;
            border-top: 1px solid #ccd5db;
            padding: 16px 0 0 16px;
            z-index: 4;
            .icon {
                width: 60px;
                height: 60px;
                line-height: 60px;
                font-size: 35px;
                text-align: center;
                margin-right: 16px;
                background: url("../../../../img/opacity.png") center;
            }
            .text {
                font-size: 13px;
                color: rgba(102, 102, 102, 1);
                line-height: 18px;
            }
        }
        .btn-area {
            display: flex;
            justify-content: space-between;
            > .wrap {
                position: absolute;
                z-index: 1; // 需要在图片管理之上
                display: flex;
                background: white;
                transition: all 0.3s;
                &.hide {
                    transform: translateX(calc(-100% - 16px));
                }
                .fast-upload {
                    background: white;
                    width: 96px;
                    height: 24px;
                    line-height: 24px;
                    text-align: center;
                    color: #252b3f;
                    &:hover {
                        color: #1593ff;
                    }
                }
            }
        }
    }
}
</style>
