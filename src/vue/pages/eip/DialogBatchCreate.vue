<template>
    <div class="eqc-dialog-scene dialog">
        <div class="head">
            <span>选择场景</span>
            <i class="sub-icon icon eqf-why-l" />
            <label
                class="sub-title"
                @click="howToUse"
            >查看使用攻略</label>
            <i
                class="icon close eqf-no"
                @click="cancel"
            />
        </div>
        <div class="content row1">
            <span class="scene">
                <img
                    class="template-img"
                    :src="scenceIcon5"
                    @click="linkToBatchCreate('hlyqh')"
                >
                <label>婚礼邀请函</label>
                <label class="new">new</label>
            </span>
            <span class="scene">
                <img
                    class="template-img"
                    :src="scenceIcon4"
                    @click="linkToBatchCreate('chz')"
                >
                <label>参会证</label>
            </span>
            <span class="scene">
                <img
                    class="template-img"
                    :src="scenceIcon3"
                    style="width:111px"
                    @click="linkToBatchCreate('zs')"
                >
                <label>荣誉证书（竖版）</label>
            </span>
            <span class="scene">
                <img
                    class="template-img"
                    :src="scenceIcon2"
                    @click="linkToBatchCreate('mp')"
                >
                <label>名片 (横版)</label>
            </span>
        </div>
        <div class="content row2">
            <span class="scene">
                <img
                    class="template-img"
                    :src="scenceIcon1"
                    @click="linkToBatchCreate('yqh')"
                >
                <label>会议/活动邀请函</label>
            </span>
            <span class="scene">
                <img
                    :src="scenceIcon0"
                >
                <label>更多场景，即将上线</label>
            </span>
            <span
                class="scene"
                style="visibility:hidden;"
            >
                <img
                    class="template-img"
                    :src="scenceIcon0"
                    style="width:111px"
                    @click="linkToBatchCreate('zs')"
                >
                <label>荣誉证书（竖版）</label>
                <label class="new">new</label>
            </span>
            <span
                class="scene"
                style="visibility:hidden;"
            >
                <img
                    class="template-img"
                    :src="scenceIcon3"
                    @click="linkToBatchCreate('mp')"
                >
                <label>名片 (横版)</label>
            </span>
        </div>
    </div>
</template>

<script>
import batchCreateTemplate from '../../../config/batchCreateTemplate.js'
import util from '../../../utils/util'
import statistic from '../../../config/statistic'
import scenceIcon0 from '../../../img/eqx_scene_0.png'
import scenceIcon1 from '../../../img/eqx_scene_1.png'
import scenceIcon2 from '../../../img/eqx_scene_2.png'
import scenceIcon3 from '../../../img/eqx_scene_3.png'
import scenceIcon4 from '../../../img/eqx_scene_4.png'
import scenceIcon5 from '../../../img/eqx_scene_5.png'

export default {
    props: {
        close: {
            type: Function,
            default: null
        }
    },
    data() {
        return {
            scenceIcon0,
            scenceIcon1,
            scenceIcon2,
            scenceIcon3,
            scenceIcon4,
            scenceIcon5
        }
    },
    methods: {
        cancel() {
            this.close()
        },
        linkToBatchCreate(pType) {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.BATCH,
                statistic.opt_label.BATCH.selectScene])

            const result = batchCreateTemplate.templateCategoryArray.filter(item => {
                return item.id === pType
            })[0]
            const arrIndex = util.isTestEnvironment() ? 0 : 1
            const type = result.sizeType[arrIndex]
            const templateId = result.categoryId[arrIndex]
            const editorCount = result.editorCount
            if (type === 0) {
                return
            }
            this.cancel()
            window.open(`../create?type=${type}&templateId=${templateId}&editorCount=${editorCount}&batch=true`, '_blank')
        },
        howToUse() {
            window.open('http://yqxiuairdesign.eqxiuzhan.com/', '_blank')
        }
    }

}
</script>

<style lang="scss">
.eqc-dialog-scene {
    width: 824px;
    height: 536px;
    .head {
        .sub-icon {
            position: absolute;
            left: 116px;
            color: rgba(79, 93, 105, 1);
            font-size: 14px;
        }
        .sub-title {
            position: absolute;
            left: 133px;
            font-size: 12px;
            font-weight: 400;
            color: rgba(79, 93, 105, 1);
            line-height: 1px;
            cursor: pointer;
        }
    }
    .content {
        padding: 28px;
        font-size: 0px;
        display: flex;
        justify-content: center;
        span {
            flex: 1;
            width: 144px;
            height: 196px;
            font-size: 0px;
            position: relative;
            margin: 0px 32px 0px 32px;
            text-align: center;
            img {
                height: 156px;
                display: inline-block;
                margin: 0px auto;
                margin-bottom: 10px;
                transition: all 0.3s;
            }
            img.template-img {
                cursor: pointer;
                &:hover {
                    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.26);
                    transform: translateY(-4px);
                }
            }
            label {
                font-size: 14px;
                font-weight: 400;
                color: rgba(17, 17, 17, 1);
                display: block;
                text-align: center;
            }
            label.new {
                position: absolute;
                left: 110px;
                top: 155px;
                font-size: 12px;
                font-weight: 400;
                color: rgba(255, 41, 106, 1);
            }
        }
        :nth-child(1) {
            margin-left: 0px;
        }
        :nth-child(4) {
            margin-right: 0px;
        }
        :nth-child(4) {
            img {
                width: 128px;
                height: 78px;
                position: relative;
                top: 40px;
            }
            label {
                position: relative;
                top: 77px;
            }
        }
        &.row2 {
            padding-top: 0px;
        }
    }
}
</style>
