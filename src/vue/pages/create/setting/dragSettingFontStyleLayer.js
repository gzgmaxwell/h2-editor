import util from '../../../../utils/util'

export default {
    bind($el, binding) {
        const { target, container, onMouseDown, onMouseMove, onMouseUp } = binding.value || {}
        $el.addEventListener('mousedown', e => {
            // 阻止mousemove默认会选中其它元素的情况
            e.preventDefault()

            const $target = document.querySelector(target) || $el
            const $container = document.querySelector(container)
            const initX = e.pageX
            const initY = e.pageY
            let moveX = 0
            let moveY = 0
            const left = parseInt($target.css('left')) || 0
            const top = parseInt($target.css('top')) || 0
            let targetRect = {}
            let containerRect = {}

            if ($container) {
                targetRect = $target.getBoundingClientRect()
                containerRect = $container.getBoundingClientRect()
            }

            if (util.isFunction(onMouseDown)) {
                onMouseDown($target)
            }

            const mousemove = e => {
                moveX = e.pageX - initX
                moveY = e.pageY - initY
                const css = {
                    left: left + moveX,
                    top: top + moveY
                }

                if ($container) {
                    const activeRect = {
                        left: 0,
                        top: 0,
                        right: containerRect.width - targetRect.width,
                        bottom: containerRect.height - targetRect.height
                    }
                    if (css.left < activeRect.left) {
                        css.left = activeRect.left
                    }
                    if (css.left > activeRect.right) {
                        css.left = activeRect.right
                    }
                    if (css.top < activeRect.top) {
                        css.top = activeRect.top
                    }
                    if (css.top > activeRect.bottom) {
                        css.top = activeRect.bottom
                    }
                }

                $target.css({
                    left: css.left + 'px',
                    top: css.top + 'px'
                })

                if (util.isFunction(onMouseMove)) {
                    onMouseMove($target, css.top)
                }
            }
            const mouseup = e => {
                document.removeEventListener('mousemove', mousemove)
                document.removeEventListener('mouseup', mouseup)

                if (util.isFunction(onMouseUp)) {
                    onMouseUp($target)
                }
            }

            document.addEventListener('mousemove', mousemove)
            document.addEventListener('mouseup', mouseup)
        })
    }
}
