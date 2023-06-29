/**
 * 配置水印权限
 * 会员定义：
 *   创意云会员：14
 *   营销云会员：7、8、9、202、203、204
 *
 * 判断逻辑： 优先判断 7 8 9 如果有789 则不判断权益  没有则判断权益
*/
// 返回 true 就是没水印  false 有水印
function checkWaterAuthor() {
    if (Vue.store.state.user.userInfo && ([7, 8, 9].includes(Vue.store.state.user.userInfo.memberType) || (Vue.store.state.user.userInfo.members && Vue.store.state.user.userInfo.members.some(item => [7, 8, 9].includes(item.memberId))))) {
        return true
    } else {
        // true 代表有权益 则无水印  false 无权益 有水印
        const waterRight = Vue.store.state.user.userInfo.rights ? Vue.store.state.user.userInfo.rights.shareWithoutWatermark : false
        return !!waterRight
        // return false
    }
}

export default {
    checkWaterAuthor
}
