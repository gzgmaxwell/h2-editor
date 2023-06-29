import Dialog from './Dialog.vue'
import DialogPay from './DialogPay.vue'
import DialogPayBenefits from './DialogPayBenefits.vue'
import DialogLogin from './DialogLogin.vue'
import DialogConfirm from './DialogConfirm.vue'
import DialogImageCrop from './DialogImageCrop.vue'
import DialogBindPhone from './DialogBindPhone.vue'
import DialogMember from './DialogMember.vue'
import DialogOperation from './DialogOperation.vue'
import DialogGifNotice from './DialogGifNotice.vue'
import DialogSettingLabel from './DialogSettingLabel.vue'
import DialogNotice from './DialogNotice.vue'
import DialogVideoPlayer from './DialogVideoPlayer.vue'
import DialogMaterialLib from './DialogMaterialLib.vue'
import DialogCooperation from './DialogCooperation.vue'

/**
 * 删除所有的dialog，在切换路由时用到
 */
function close() {
    document.body.querySelectorAll('.eqc-dialog-base').forEach(dom => dom.remove())
}

/**
 * 通用打开窗口
 * @param {Object} options
 */
function open(options) {
    const defaultOptions = {
        component: null,
        data: null,
        params: {}
    }
    options = Object.assign(defaultOptions, options)

    return new Promise((resolve, reject) => {
        const UiDialog = Vue.extend(Dialog)
        const vm = new UiDialog({
            components: {
                cDialog: options.component
            },
            propsData: { data: options.data, params: options.params },

            destroyed() {
                this.value ? resolve(JSON.parse(JSON.stringify(this.value))) : reject()
            }
        }).$mount()
        document.body.appendChild(vm.$el)
    })
}

/**
 * 打开支付框
 * @param {Object} data
 */
function openPay(data) {
    return open({
        component: DialogPay,
        data
    })
}

/**
 * 打开权益支付框
 * @param {Object} data
 */
function openPayBenefits(data) {
    return open({
        component: DialogPayBenefits,
        data
    })
}

/**
 * 打开登录框
 * @param {Object} data
 */
function openLogin(data) {
    return open({
        component: DialogLogin,
        data
    })
}

/**
 * 打开确认框
 * @param {Object} data
 */
function openConfirm(data) {
    return open({
        component: DialogConfirm,
        data
    })
}

/**
 * 打开提示框
 * @param {Object} data
 */
function openNotice(data) {
    return open({
        component: DialogNotice,
        data
    })
}

/**
 * 打开图片裁切框
 * @param {Object} data
 */
function openImageCrop(data) {
    return open({
        component: DialogImageCrop,
        data
    })
}
/**
 * 打开绑定手机号码框
 */
function openBindPhone(data) {
    return open({
        component: DialogBindPhone,
        data
    })
}
/**
 * 打开开通会员弹窗
 */
function openMember(data) {
    return open({
        component: DialogMember,
        data
    })
}
/**
 * 打开运营位弹窗
 */
function openOperation(data) {
    return open({
        component: DialogOperation,
        data
    })
}
/**
 * 打开Gif提示弹框
 */
function openGifNotice(data) {
    return open({
        component: DialogGifNotice,
        data
    })
}
/**
 * 打开组件设置标签弹框
 */
function openSettingLabel(data) {
    return open({
        component: DialogSettingLabel,
        data
    })
}

/**
 * 打开视频播放弹框
 */
function openVideoPlayer(data) {
    return open({
        component: DialogVideoPlayer,
        data
    })
}

/**
 * 打开图片素材库弹窗
 */
function openMaterialLib(data) {
    return open({
        component: DialogMaterialLib,
        data
    })
}

/**
 * 打开互拉弹窗
 */
function openCooperation(data) {
    return open({
        component: DialogCooperation,
        data
    })
}
function install(Vue) {
    Vue.dialog = Vue.prototype.dialog = {
        close,
        open,
        openPay,
        openPayBenefits,
        openLogin,
        openConfirm,
        openImageCrop,
        openBindPhone,
        openMember,
        openOperation,
        openGifNotice,
        openSettingLabel,
        openNotice,
        openVideoPlayer,
        openMaterialLib,
        openCooperation
    }
}

Vue.use(install)

export default install
