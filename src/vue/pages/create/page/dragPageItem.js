import util from '../../../../utils/util'

export default {
    bind($el, binding) {
        if (util.getIsBatchCreate()) {
            return
        }
        const { target, container, eqxPage, eqxPages, onMouseUp, code } = binding.value || {}
        $el.addEventListener('mousedown', e => {
            // 阻止mousemove默认会选中其它元素的情况
            e.preventDefault()

            const $target = document.querySelector(target) || $el
            // 没传target 就取li本身
            const $container = document.querySelector(container)
            // page_content 包围 ul的 div
            const $ul = $target.parentElement
            // ul
            const targetRect = $target.getBoundingClientRect()
            const containerRect = $container.getBoundingClientRect()
            const ulRect = $ul.getBoundingClientRect()
            const top = parseInt($target.css('top')) || (targetRect.top - ulRect.top)
            const scrollHeight = containerRect.top - ulRect.top
            const initY = e.pageY
            let moveY = 0 // 移动距离
            const threshold = 2 // 最小移动阈值
            const liHeight = 184
            let targetIndex = 0 // 移动到哪个li
            let isMoved = false
            let lastTargetIndex = -1 // 最近一次的目标li

            const $lis = Array.from($ul.children)
            const selectIndex = $lis.indexOf($target)

            const mousemove = e => {
                moveY = e.pageY - initY

                if (Math.abs(moveY) <= threshold) {
                    return
                }

                isMoved = true

                const css = {
                    top: top + moveY
                }

                if ($container) {
                    const activeRect = {
                        top: scrollHeight,
                        bottom: containerRect.height - targetRect.height + scrollHeight
                    }

                    if (css.top < activeRect.top) {
                        css.top = activeRect.top
                    }
                    if (css.top > activeRect.bottom) {
                        css.top = activeRect.bottom
                    }
                }

                $target.css({
                    transform: `translateY(${moveY}px)`,
                    boxShadow: '0 0 8px 0 rgba(0, 0, 0, 0.16)',
                    cursor: 'move',
                    zIndex: 1000
                })
                // 移动时候隐藏复制删除菜单
                for (const $li of $lis) {
                    $li.querySelector('.menu').css({
                        display: 'none'
                    })
                }
                // 屏蔽header上的hover响应
                const $header = document.querySelector('.eqc-header')
                $header.css({
                    pointerEvents: 'none'
                })

                if (!$lis.length) {
                    return
                }

                // 计算当前移动到哪个li上面，移动超过liHeight/2距离才算有效
                targetIndex = Math.min(Math.round((css.top) / liHeight), $lis.length - 1)
                // 在同一个li上move未超过有效距离不做处理
                if (lastTargetIndex === targetIndex) {
                    return
                }
                const transition = 'transform 0.3s'
                // 鼠标停止后，先还原除target的li位置，再计算需要上移或下移的li进行移动
                for (const $el of $lis) {
                    if ($el !== $target) {
                        $el.css({
                            transform: '',
                            transition
                        })
                    }
                }
                // 最终鼠标停留在的li的index大于当前拖拽的这个li的index，
                // 则把它们之间的li统一向上移动，注意动画顺序，从小到大
                if (targetIndex > selectIndex) {
                    for (let i = selectIndex; i <= targetIndex; i++) {
                        const $tli = $lis[i]
                        if ($tli !== $target) {
                            if ($tli.style.transform === '') {
                                $tli.css({
                                    transform: `translateY(-${liHeight}px)`,
                                    transition
                                })
                            }
                        }
                    }
                } else if (targetIndex < selectIndex) {
                    // 最终鼠标停留在的li的index小于当前拖拽的这个li的index，
                    // 则把它们之间的li统一向下移动，注意动画顺序，从大到小
                    for (let i = selectIndex; i >= targetIndex; i--) {
                        const $tli = $lis[i]
                        if ($tli !== $target) {
                            if ($tli.style.transform === '') {
                                $tli.css({
                                    transform: `translateY(${liHeight}px)`,
                                    transition
                                })
                            }
                        }
                    }
                }
                lastTargetIndex = targetIndex
            }

            const mouseup = () => {
                document.removeEventListener('mousemove', mousemove)
                document.removeEventListener('mouseup', mouseup)

                if (util.isFunction(onMouseUp)) {
                    onMouseUp(isMoved)
                }

                if (!isMoved) {
                    return
                }
                isMoved = false

                // targetPos 与原位置一致时，API会报数据不合法，故不向服务器发送顺序更新
                const oldIndex = eqxPages.indexOf(eqxPage)
                if (oldIndex !== targetIndex) {
                    const targetPage = eqxPages[targetIndex]
                    const targetPageSort = targetPage.pageJson.sort

                    // 因为网络交互始终会有点点延迟，视觉上
                    // 会闪一下，故先换本地顺序，若服务器错误再还原
                    Vue.store.commit('PAGE_ORDER_CHANGED', { oldIndex, newIndex: targetIndex })

                    const { printId, id } = eqxPage.pageJson
                    const idcode = `${printId}_${code}`
                    Vue.api.page.updatePageSort(idcode, id, targetPageSort)
                        .catch(err => {
                            // 服务器报错，还原本地顺序
                            Vue.store.commit('PAGE_ORDER_CHANGED', { oldIndex: targetIndex, newIndex: oldIndex })
                            err && Vue.logger.error(err)
                        })
                }

                for (const $li of $lis) {
                    $li.removeAttribute('style')// 还原所有li的style
                    $li.querySelector('.menu').removeAttribute('style')// 还原所有menu的style
                }
                // 还原header上的hover响应
                const $header = document.querySelector('.eqc-header')
                $header.css({
                    pointerEvents: ''
                })
            }

            document.addEventListener('mousemove', mousemove)
            document.addEventListener('mouseup', mouseup)
        })
    }
}
