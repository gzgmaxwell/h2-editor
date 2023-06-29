import statistic from '../../config/statistic'

export default function () {
    const $el = this.$el

    $el.addEventListener('mousedown', e => {
        e.stopPropagation()
        toMembers()

        const mouseup = () => {
            document.removeEventListener('mouseup', mouseup)
        }
        document.addEventListener('mouseup', mouseup)
    })

    function toMembers() {
        const userInfo = Vue.store.state.user.userInfo
        const buyMemberAuth = !(userInfo.members && userInfo.members.some(item => [14].includes(item.memberId))) && [1, 2, 99].includes(userInfo.type)
        if (buyMemberAuth) {
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.MBTN])

            const options = {}
            Vue.dialog.openMember(options).then(res => {
                if (res.success) {
                    Vue.notifier.success('支付成功，请刷新页面')
                } else {
                    Vue.notifier.fail('支付失败，请稍后重试')
                }
            }).catch(err => {
                err && Vue.logger.error(err)
            })
        } else {
            Vue.notifier.info('该功能为创意云会员和营销云会员专属权益')
        }
    }
}
