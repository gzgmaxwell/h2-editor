<template>
    <div class="eqc-nav-artqrcode-help">
        <div
            class="helper-content"
        >
            <i
                class="helper-close eqf-no-f"
                @click="closeHelper()"
            />
            <div class="head">
                <p class="title">
                    {{ helper.title }}
                </p>
                <p class="sub">
                    {{ helper.subTitle }}
                </p>
            </div>
            <img
                :src="helper.content"
                class="content"
            >
            <div
                class="sure"
                @click="noNotice"
            >
                <base-checkbox
                    v-model="noNoticeSelected"
                />
                <label>已知晓，不再提示！</label>
            </div>
        </div>
    </div>
</template>

<script>
import artQrcodeHelperData from './navPanelHelperData.js'
import storageLocal from '../../../../../utils/storageLocal'

export default {
    components: {

    },
    props: {
        data: {
            type: Object,
            default: null
        },
        close: {
            type: Function,
            default: null
        }
    },
    data() {
        return {
            artQrcodeHelperData,
            helper: null,
            noNoticeSelected: false
        }
    },
    computed: {

    },
    watch: {

    },
    created() {
        this.helper = this.artQrcodeHelperData.filter(v => v.type === this.data.type)[0]
        const noAutoShow = storageLocal.getItem(storageLocal.key.qrcodeHelperShow)
        if (noAutoShow) {
            this.noNoticeSelected = true
        }
    },
    methods: {
        closeHelper() {
            this.close({ text: '' })
        },
        noNotice() {
            this.noNoticeSelected = !this.noNoticeSelected
            storageLocal.setItem(storageLocal.key.qrcodeHelperShow, this.noNoticeSelected)
        }
    }
}
</script>

<style lang="scss">
.eqc-nav-artqrcode-help {
    .helper-content {
        position: relative;
        width: 342px;
        height: auto;
        background: #fff;
        color: rgba(17, 17, 17, 1);
        border-radius: 3px;
        .helper-close {
            color: rgba(17, 17, 17, 1);
            position: absolute;
            right: 16px;
            top: 16px;
            font-size: 24px;
        }
        .head {
            .title {
                font-size: 20px;
                font-weight: 600;
                color: rgba(17, 17, 17, 1);
                line-height: 28px;
                padding: 16px 24px 0 24px;
            }
            .sub {
                font-size: 14px;
                font-weight: 400;
                color: rgba(17, 17, 17, 1);
                line-height: 20px;
                padding: 1px 24px 0 24px;
            }
        }
        .content {
            width: 294px;
            margin: 19px 24px 21px;
        }
        .sure {
            font-size: 13px;
            font-weight: 400;
            color: #222222;
            line-height: 18px;
            text-align: right;
            padding-bottom: 24px;
            margin: 0 15px 0 0;
            label {
                margin-left: 4px;
            }
        }
    }
}
</style>
