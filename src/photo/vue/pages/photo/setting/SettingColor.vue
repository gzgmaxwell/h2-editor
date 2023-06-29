<template>
    <div
        class="eqc-photo-setting-color"
        @mousedown.stop
        @click="showColorPanel"
    >
        <div
            :style="{backgroundColor: backgroundColor}"
            class="color"
        />
    </div>
</template>

<script>

import historyType from '../../../../../config/enum.photoHistory.type'

export default {
    props: {
        model: {
            type: Object,
            default: null
        },
        modelKey: {
            type: String,
            default: ''
        },
        modelKeyType: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            historyType,
            clientHeight: document.documentElement.clientHeight || document.body.clientHeight
        }
    },

    computed: {
        scene() {
            return Vue.store.state.photoScene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        photoHistory() {
            return Vue.store.state.photoHistory
        },
        selectType() {
            return Vue.store.state.photoLayout.nav.selectedItem.type
        },
        backgroundColor() {
            let val = ''
            switch (this.modelKey) {
                default : val = this.model[this.modelKey]
            }

            return val
        }
    },
    methods: {
        showColorPanel(e) {
            document.addEventListener('mousedown', this.hideColorPanel)
            let model = ''
            let modelKey = ''
            switch (this.modelKey) {
                default :
                    model = this.model
                    modelKey = this.modelKey
            }
            const position = document.querySelector('.font-color').getBoundingClientRect()
            this.colorPicker.open(model, modelKey, { left: (position.x + 48) + 'px', top: (position.y - 12) + 'px' }, false)
        },
        hideColorPanel() {
            if (!this.colorPicker.getState().isOpenSucker) {
                this.colorPicker.close()
                document.removeEventListener('mousedown', this.hideColorPanel)
                this.photoHistory.history.insert(JSON.parse(JSON.stringify(this.eqxPage.pageJson.elements)), null, this.historyType.text, false)
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-photo-setting-color {
    position: relative;
    width: 32px;
    height: 32px;
    border-radius: 3px;
    background: url("../../../../../img/opacity.png") center;
    border-radius: 3px;
    border: 1px solid rgba(204, 213, 219, 1);
    cursor: pointer;
    .color {
        width: 100%;
        height: 100%;
    }
}
</style>
