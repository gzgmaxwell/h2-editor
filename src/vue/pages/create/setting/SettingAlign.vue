<template>
    <div class="eqc-setting-align">
        <ul class="align">
            <li
                class="item hint--top hint--rounded"
                data-hint="左对齐"
                @click="setAlign('left', 'left')"
            >
                <i class="icon eqf-putleft" />
            </li>
            <li
                class="item hint--top hint--rounded"
                data-hint="水平居中对齐"
                @click="setAlign('centerX', 'left')"
            >
                <i class="icon eqf-putmiddle" />
            </li>
            <li
                class="item hint--top hint--rounded"
                data-hint="右对齐"
                @click="setAlign('right', 'left')"
            >
                <i class="icon eqf-putright" />
            </li>
        </ul>
        <ul class="align">
            <li
                class="item hint--top hint--rounded"
                data-hint="上对齐"
                @click="setAlign('top', 'top')"
            >
                <i class="icon eqf-puttop" />
            </li>
            <li
                class="item hint--top hint--rounded"
                data-hint="垂直居中对齐"
                @click="setAlign('centerY', 'top')"
            >
                <i class="icon eqf-putcenter" />
            </li>
            <li
                class="item hint--top hint--rounded"
                data-hint="下对齐"
                @click="setAlign('bottom', 'top')"
            >
                <i class="icon eqf-putunder" />
            </li>
        </ul>
        <ul
            class="align"
            style="width: 67%"
        >
            <li
                class="item hint--top hint--rounded"
                data-hint="垂直均分"
                @click="setAlignAverage('centerY', 'top')"
            >
                <i class="icon eqf-chuizhijunfen" />
            </li>
            <li
                class="item hint--top hint--rounded"
                data-hint="水平均分"
                @click="setAlignAverage('centerX', 'left')"
            >
                <i class="icon eqf-shuipingjunfen" />
            </li>
        </ul>
    </div>
</template>

<script>
import elementType from '../../../../config/enum.element.type'
import combineInitor from '../workspace/combine.box.js'
export default {
    computed: {
        scene() {
            return this.$store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        eqxElementsSelected() {
            return this.scene.eqxElementsSelected
        }
    },
    methods: {
        setAlign(direction, cssKey) {
            const boxs = []
            let toValue = initToValue(direction) // 对齐到的位置，水平、垂直的6种对齐使用
            const { selectedArr, hasCombineElement } = this.getSelectedCombineElement()
            selectedArr.forEach(eqxElement => {
                const box = eqxElement.$el.getBoundingClientRect()
                box.centerX = box.left + box.width / 2
                box.centerY = box.top + box.height / 2
                boxs.push(box)
                toValue = getToValue(direction, box, toValue)
            })

            let centerArr = []
            if (direction === 'centerX' || direction === 'centerY') {
                centerArr = boxs.map(item => item[direction])
                toValue = (Math.min(...centerArr) + Math.max(...centerArr)) / 2
            }

            selectedArr.forEach((eqxElement, i) => {
                const distanceView = boxs[i][direction] - toValue

                // 如果移动距离为0，则不需要执行
                if (distanceView === 0) {
                    return
                }
                const distanceReal = parseInt(eqxElement.elementJson.css[cssKey]) - Math.round(distanceView / this.eqxPage.scale)
                let changeCss = null
                if (cssKey === 'top') {
                    changeCss = {
                        [cssKey]: distanceReal + 'px',
                        left: eqxElement.elementJson.css.left
                    }
                } else if (cssKey === 'left') {
                    changeCss = {
                        [cssKey]: distanceReal + 'px',
                        top: eqxElement.elementJson.css.top
                    }
                }
                eqxElement.updateCss(changeCss)
            })
            this.eqxPage.eqxHistory.add(this.eqxPage)
            if (hasCombineElement) {
                // 重新生成combineBox
                combineInitor.reCalculateCombineBox(selectedArr[0].combineBox)
            }

            function initToValue(direction) {
                switch (direction) {
                    case 'left':
                    case 'top':
                    case 'centerX':
                    case 'centerY':
                        return Number.MAX_SAFE_INTEGER
                    case 'right':
                    case 'bottom':
                        return Number.MIN_SAFE_INTEGER
                }
            }

            function getToValue(direction, box, toValue) {
                switch (direction) {
                    case 'left':
                    case 'top':
                    case 'centerX':
                    case 'centerY':
                        return Math.min(toValue, box[direction])
                    case 'right':
                    case 'bottom':
                        return Math.max(toValue, box[direction])
                }
            }
        },

        getSelectedCombineElement() {
            const selectedArr = []
            let hasCombineElement = false
            function getAllElement(arr) {
                arr.map(element => {
                    if (element.elementJson.type === elementType.combine && !element.isCombine) {
                        const tmp = element.childElements
                        if (tmp && tmp.length > 0) {
                            getAllElement(tmp)
                        }
                        hasCombineElement = true
                    } else {
                        selectedArr.push(element)
                    }
                })
            }
            getAllElement(this.eqxElementsSelected)

            return {
                selectedArr: selectedArr,
                hasCombineElement: hasCombineElement
            }
        },
        setAlignAverage(direction, cssKey) {
            const isX = direction === 'centerX'
            const boxs = []
            const { selectedArr, hasCombineElement } = this.getSelectedCombineElement()
            selectedArr.forEach(eqxElement => {
                const box = eqxElement.$el.getBoundingClientRect()
                box.centerX = box.left + box.width / 2
                box.centerY = box.top + box.height / 2
                box.eqxElement = eqxElement
                boxs.push(box)
            })
            const boxsSort = boxs.sort((a, b) => a[direction] - b[direction]) // 升序
            const averageDistance = getAverageDistance(boxsSort, direction)

            boxsSort.forEach((box, i) => {
                // 头尾两个不动
                if (i === 0 || i === boxs.length - 1) {
                    return
                }
                const box0Css = boxsSort[0].eqxElement.elementJson.css // 取最小的值作为参考坐标
                const boxCss = box.eqxElement.elementJson.css
                const box0Half = (isX ? parseInt(box0Css.width) : parseInt(box0Css.height)) / 2
                const boxHalf = (isX ? parseInt(boxCss.width) : parseInt(boxCss.height)) / 2
                const distanceReal = parseInt(box0Css[cssKey]) + box0Half + averageDistance * i / this.eqxPage.scale - boxHalf
                box.eqxElement.updateCss({ [cssKey]: distanceReal + 'px' })
            })
            this.eqxPage.eqxHistory.add(this.eqxPage)
            if (hasCombineElement) {
                // 重新生成combineBox
                combineInitor.initCombine(selectedArr, this.eqxPage)
            }

            function getAverageDistance(boxsSort, direction) {
                const minVal = boxsSort[0][direction]
                const maxVal = boxsSort[boxsSort.length - 1][direction]
                return (maxVal - minVal) / (boxsSort.length - 1)
            }
        }

    }
}
</script>

<style lang="scss">
.eqc-setting-align {
    .align {
        display: flex;
        position: relative;
        width: 100%;
        height: 30px;
        border: 1px solid #ccd5db;
        background: #f7f8f9;
        cursor: pointer;
        &:not(:first-child) {
            margin-top: 12px;
        }
        .item {
            flex-grow: 1;
            font-size: 18px;
            color: #76838f;
            transition: all 0.3s;
            &:not(:last-child) {
                border-right: 1px solid #ccd5db;
            }
            &:hover {
                color: #1593ff;
                background: #fff;
            }
            .icon {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
            }
        }
    }
}
</style>
