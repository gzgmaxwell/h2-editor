import qrcodeType from '../../../config/enum.qrcode.type'
import DialogLink from '../../../vue/pages/create/nav/qrcode/DialogLink.vue'
import DialogCard from '../../../vue/pages/create/nav/qrcode/DialogCard.vue'
import DialogText from '../../../vue/pages/create/nav/qrcode/DialogText.vue'
import DialogWork from '../../../vue/pages/create/nav/qrcode/DialogWork.vue'
import DialogMap from '../../../vue/pages/create/nav/qrcode/DialogMap.vue'
import DialogWeChat from '../../../vue/pages/create/nav/qrcode/DialogWeChat.vue'

export default function () {
    // 双击二维码进入编辑状态，出现弹窗
    this.$el.addEventListener('dblclick', () => {
        const qcType = this.elementJson.property.qcType
        const eqxElementsSelected = Vue.store.state.scene.eqxElementsSelected
        const eqxElement = eqxElementsSelected[0]
        const property = eqxElement.elementJson.property
        let Dialog = null
        let data = { text: property.text }
        switch (qcType) {
            case qrcodeType.work: Dialog = DialogWork
                break
            case qrcodeType.map: Dialog = DialogMap
                break
            case qrcodeType.card: Dialog = DialogCard
                data = property.card
                break
            case qrcodeType.text: Dialog = DialogText
                break
            case qrcodeType.wechat: {
                Dialog = DialogWeChat
                data = { text: property.name }
                break
            }
            default: Dialog = DialogLink
        }
        Vue.dialog.open({
            component: Dialog,
            data
        }).then((data) => {
            eqxElementsSelected[0].updateProperty(data)
        }).catch(() => {

        })
        if (eqxElementsSelected.length > 1) {
            return false
        }
    })
}
