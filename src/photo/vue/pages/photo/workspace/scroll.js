import utils from '../../../../../utils/util'

export default {
    bind($el, bindding) {
        $el.addEventListener('wheel', e => {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                return
            }

            const deltaH = 10
            let n = 3 // 鼠标滚轮垂直行数
            if (utils.isChrome) {
                n = e.deltaY * 3 / 100
            } else {
                n = e.deltaY
            }

            const eqxPage = Vue.store.state.photoScene.eqxPage
            if (e.ctrlKey) {
                const delta = e.deltaX + e.deltaY
                const $elWorkspace = eqxPage.$el.parentElement
                if (delta > 0) {
                    eqxPage.setScale('-', $elWorkspace.offsetWidth, $elWorkspace.offsetHeight, 0.1)
                } else {
                    eqxPage.setScale('+', $elWorkspace.offsetWidth, $elWorkspace.offsetHeight, 0.1)
                }
            } else {
                const { moveX: tranlsateX, moveY: tranlsateY, height: pageHeight } = eqxPage
                const workspaceHeight = $el.offsetHeight
                const margin = 380
                const $streachBar = $el.parentElement.querySelector('.eqc-stretch-bar')

                let moveY = tranlsateY - deltaH * n

                // 画布比较小时无法滚动
                if (pageHeight + margin * 2 < workspaceHeight) {
                    return
                }
                // 画布上方只能留一定的距离
                if (e.deltaY > 0 && Math.abs(moveY) > margin) {
                    moveY = -margin
                }
                // 画布下方只能留一定的距离
                if (e.deltaY < 0 && Math.abs(moveY) > margin) {
                    moveY = margin
                }

                eqxPage.setMove(tranlsateX, moveY)
                $streachBar && $streachBar.css({
                    transform: `translate(${tranlsateX}px, ${moveY}px)`
                })
            }
        })
    }
}
