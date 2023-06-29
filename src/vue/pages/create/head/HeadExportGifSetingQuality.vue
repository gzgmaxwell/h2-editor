<template>
    <div
        class="eqc-setting-quality"
        @mouseover="showFontPanel"
        @mouseleave="hideFontPanel"
    >
        <div class="current">
            <span>{{ quality.selectedItem.name }}</span>
            <i class="icon eqf-menu-down" />
        </div>
        <!--层级需要比“基础”展开时高-->
        <base-drop-down
            v-if="showList"
            :list="quality.list"
            :selected-item="quality.selectedItem"
            :css="{width: '180px', paddingBottom: '8px', fontSize: '14px', zIndex: 1,marginTop:'-150px'}"
            item-key="name"
            @choose="chooseQuality"
        />
    </div>
</template>

<script>
export default {
    data() {
        return {
            quality: {
                list: [{
                    name: '原尺寸',
                    quality: 10
                }, {
                    name: '用于微信公众号(<2M)',
                    quality: 40
                }, {
                    name: '用于聊天群(<1M)',
                    quality: 80
                }],
                selectedItem: null
            },
            showList: false
        }
    },
    created() {
        this.setSelectedQuality()
    },
    methods: {
        setSelectedQuality() {
            this.quality.selectedItem = this.quality.list[0]
            this.chooseQuality(this.quality.selectedItem)
        },
        showFontPanel() {
            this.showList = true
        },
        hideFontPanel() {
            this.showList = false
        },
        chooseQuality(item) {
            this.quality.selectedItem = item
            this.showList = false
            Vue.store.commit('GIG_QUALITY_CHOOSE', item.quality)
        }
    }
}
</script>

<style lang="scss">
.eqc-setting-quality {
    display: inline-block;
    width: 180px;
    height: 36px;
    font-size: 12px;
    color: #2f3c4d;
    cursor: pointer;
    .current {
        position: relative;
        width: 100%;
        height: 36px;
        line-height: 34px;
        padding: 0 28px 0 12px;
        background: #fff;
        border: 1px solid #ccd5db;
        border-radius: 3px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        font-size: 13px;
        .icon {
            position: absolute;
            right: 0;
            top: 0;
            width: 28px;
            height: 36px;
            font-size: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
}
</style>
