<template>
    <div
        :style="css"
        :class="{locked:showLock}"
        class="eqc-comp-box"
    >
        <div
            v-show="showResizeSkew && !showLock"
            ref="barNW"
            :class="[bar,barNw,isCombine?'combine bar-radius':'']"
        >
            <svg
                v-show="!isCombine"
                xmlns="http://www.w3.org/2000/svg"
                class="svgRadius topLeft"
                viewBox="0 0 13 13"
            >
                <path
                    fill="#FFF"
                    fill-rule="evenodd"
                    stroke="#1593FF"
                    d="M832.5,215.5 C835.813708,215.5 838.5,212.813708 838.5,209.5 C838.5,206.186292 835.813708,203.5 832.5,203.5 C829.186292,203.5 826.5,206.186292 826.5,209.5 L832.5,209.5 L832.5,215.5 Z"
                    transform="translate(-826 -203)"
                />
            </svg>
        </div>
        <div
            v-show="showResizeHeight && !showLock && !isTableReSize"
            ref="barN"
            class="bar bar-ns bar-n"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="7"
                height="13"
                class="svgHalfRadius centerUp"
                viewBox="0 0 7 13"
            >
                <path
                    fill="#FFF"
                    fill-rule="evenodd"
                    stroke="#1593FF"
                    d="M832.5,232.5 C835.813708,232.5 838.5,229.813708 838.5,226.5 C838.5,223.186292 835.813708,220.5 832.5,220.5 L832.5,232.5 Z"
                    transform="translate(-832 -220)"
                />
            </svg>
        </div>
        <div
            v-show="showResizeSkew && !showLock"
            ref="barNE"
            :class="[bar,barNe,isCombine?'combine bar-radius':'']"
        >
            <svg
                v-show="!isCombine"
                xmlns="http://www.w3.org/2000/svg"
                class="svgRadius topRight"
                viewBox="0 0 13 13"
            >
                <path
                    fill="#FFF"
                    fill-rule="evenodd"
                    stroke="#1593FF"
                    d="M832.5,215.5 C835.813708,215.5 838.5,212.813708 838.5,209.5 C838.5,206.186292 835.813708,203.5 832.5,203.5 C829.186292,203.5 826.5,206.186292 826.5,209.5 L832.5,209.5 L832.5,215.5 Z"
                    transform="translate(-826 -203)"
                />
            </svg>
        </div>
        <div
            v-show="showResizeWidth && !showLock"
            ref="barE"
            class="bar bar-ew bar-e"
        >
            <svg
                v-if="!isTableReSize"
                xmlns="http://www.w3.org/2000/svg"
                width="7"
                height="13"
                class="svgHalfRadius centerRight"
                viewBox="0 0 7 13"
            >
                <path
                    fill="#FFF"
                    fill-rule="evenodd"
                    stroke="#1593FF"
                    d="M832.5,232.5 C835.813708,232.5 838.5,229.813708 838.5,226.5 C838.5,223.186292 835.813708,220.5 832.5,220.5 L832.5,232.5 Z"
                    transform="translate(-832 -220)"
                />
            </svg>
        </div>
        <div
            v-show="showResizeSkew && !showLock"
            ref="barSE"
            :class="[bar,barSe,isCombine?'combine bar-radius':'']"
        >
            <svg
                v-show="!isCombine"
                xmlns="http://www.w3.org/2000/svg"
                class="svgRadius bottomRight"
                viewBox="0 0 13 13"
            >
                <path
                    fill="#FFF"
                    fill-rule="evenodd"
                    stroke="#1593FF"
                    d="M832.5,215.5 C835.813708,215.5 838.5,212.813708 838.5,209.5 C838.5,206.186292 835.813708,203.5 832.5,203.5 C829.186292,203.5 826.5,206.186292 826.5,209.5 L832.5,209.5 L832.5,215.5 Z"
                    transform="translate(-826 -203)"
                />
            </svg>
        </div>
        <div
            v-show="showResizeHeight && !showLock"
            ref="barS"
            class="bar bar-ns bar-s"
        >
            <svg
                v-if="!isTableReSize"
                xmlns="http://www.w3.org/2000/svg"
                width="7"
                height="13"
                class="svgHalfRadius centerBottom"
                viewBox="0 0 7 13"
            >
                <path
                    fill="#FFF"
                    fill-rule="evenodd"
                    stroke="#1593FF"
                    d="M832.5,232.5 C835.813708,232.5 838.5,229.813708 838.5,226.5 C838.5,223.186292 835.813708,220.5 832.5,220.5 L832.5,232.5 Z"
                    transform="translate(-832 -220)"
                />
            </svg>
        </div>
        <div
            v-show="showResizeSkew && !showLock"
            ref="barSW"
            :class="[bar,barSw,isCombine?'combine bar-radius':'']"
        >
            <svg
                v-show="!isCombine"
                xmlns="http://www.w3.org/2000/svg"
                class="svgRadius bottomLeft"
                viewBox="0 0 13 13"
            >
                <path
                    fill="#FFF"
                    fill-rule="evenodd"
                    stroke="#1593FF"
                    d="M832.5,215.5 C835.813708,215.5 838.5,212.813708 838.5,209.5 C838.5,206.186292 835.813708,203.5 832.5,203.5 C829.186292,203.5 826.5,206.186292 826.5,209.5 L832.5,209.5 L832.5,215.5 Z"
                    transform="translate(-826 -203)"
                />
            </svg>
        </div>
        <div
            v-show="showResizeWidth && !showLock && !isTableReSize"
            ref="barW"
            class="bar bar-ew bar-w"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="7"
                height="13"
                class="svgHalfRadius centerLeft"
                viewBox="0 0 7 13"
            >
                <path
                    fill="#FFF"
                    fill-rule="evenodd"
                    stroke="#1593FF"
                    d="M832.5,232.5 C835.813708,232.5 838.5,229.813708 838.5,226.5 C838.5,223.186292 835.813708,220.5 832.5,220.5 L832.5,232.5 Z"
                    transform="translate(-832 -220)"
                />
            </svg>
        </div>
        <div
            v-show="showRotate && !showLock"
            ref="rotateLine"
            class="bar bar-line"
        />
        <div
            ref="lineMiddle"
            class="bar bar-m-line"
        />
        <div
            v-show="showRotate && !showLock"
            ref="rotate"
            :style="{top:showResizeHeight?'-32px':'-28px'}"
            :class="[bar,barRotate, barRadius]"
        >
            <i class="icon eqf-flip" />
        </div>
        <div
            v-show="showLock"
            ref="lockLine"
            class="middle-line"
        />
        <i
            v-show="showLock"
            ref="lock"
            class="lock eqf-lock-l"
        />
        <div
            v-show="elementType===elementTypes.textThreeD&&!eqxElementsSelectedIsLock && isImageAndThreeExist"
            ref="threeD"
            class="three-control three-d"
        />
        <div
            v-show="elementType===elementTypes.image&&!eqxElementsSelectedIsLock && isImageAndThreeExist"
            ref="elementThreed"
            data-hint="双击可以复原哦"
            class="three-control element-threed hint--bottom hint--rounded"
        />
    </div>
</template>

<script>

import elementTypes from '../../../../config/enum.element.type'

export default {
    props: {
        css: {
            type: Object,
            default: null
        },
        value: {
            type: Number, // 1 可调角度 2 可调宽度 4 可调高度 8 可调四个角  16 是table的特殊配置 可调宽高 但是不要半圈的小图标
            default: 1 + 2 + 4 + 8
        },
        id: { // 组件id
            type: Number,
            default: 0
        },
        elementType: {
            type: Number,
            default: null
        }
    },
    data() {
        return {
            showLock: false,
            isCombine: false,
            bar: 'bar',
            barRotate: 'bar-rotate',
            barRadius: 'bar-radius',
            barSw: 'bar-sw',
            barSe: 'bar-se',
            barNw: 'bar-nw',
            barNe: 'bar-ne',
            elementTypes
        }
    },
    computed: {
        showRotate() {
            return (this.value | 1) === this.value
        },
        showResizeWidth() {
            return (this.value | 2) === this.value
        },
        showResizeHeight() {
            return (this.value | 4) === this.value
        },
        showResizeSkew() {
            return (this.value | 8) === this.value
        },
        isTableReSize() {
            return (this.value | 16) === this.value
        },
        scene() {
            return Vue.store.state.scene
        },
        eqxPage() {
            return this.scene.eqxPage
        },
        eqxElements() {
            return this.eqxPage.eqxElements
        },
        eqxElementsSelected() {
            return this.scene.eqxElementsSelected
        },
        eqxElementsSelectedIsLock() {
            if (this.eqxElementsSelected.length > 0) {
                const filterElement = this.eqxElementsSelected.filter(item => { return item.elementJson.id === this.id })
                if (filterElement && filterElement.length === 1) {
                    const element = filterElement[0]
                    if (element && Object.prototype.hasOwnProperty.call(element.elementJson.property, 'lock') &&
                   element.elementJson.property.lock) {
                        return true
                    }
                }
            }
            return false
        },
        // 判断图片和3d元素是不是存在
        isImageAndThreeExist() {
            const filterElement = this.eqxElementsSelected.filter(item => { return item.elementJson.id === this.id })
            if (filterElement.length === 0) {
                return false
            } else {
                return true
            }
        },
        barRadiusStyle() {
            return {
                bar: true,
                'bar-rotate': true,
                'bar-radius': true,
                combine: this.isCombine
            }
        }
    }
}
</script>

<style lang="scss">
.locked {
    border: 1px solid #ff5448 !important;
}
.combine {
    border-radius: 5% !important;
}
.combine::before {
    content: "";
    width: 5px;
    height: 5px;
    background: #1593ff;
    position: absolute;
    top: 2px;
    left: 2px;
}
.eqc-comp-box {
    $thickness: 5px;
    $thickness-center: -3px;
    $width: 11px;
    $distance: -6px;
    display: none;
    position: absolute;
    border: 1px solid #1593ff;
    pointer-events: none;
    .bar {
        position: absolute;
        pointer-events: auto;
    }
    .bar-ns {
        width: 100%;
        height: $thickness;
        cursor: ns-resize;
        .centerBottom {
            position: absolute;
            z-index: 1;
            left: 50%;
            transform: translateX(-50%) translateY(-1px) rotate(90deg);
        }
        .centerUp {
            position: absolute;
            z-index: 1;
            left: 50%;
            transform: translateX(-50%) translateY(-7px) rotate(-90deg);
        }
    }
    .bar-n {
        top: $thickness-center;

        .bar-radius {
            z-index: 1;
            top: $thickness-center;
        }
    }
    .bar-s {
        bottom: $thickness-center;
        .bar-radius {
            z-index: 1;
            bottom: $thickness-center;
        }
    }
    .bar-ew {
        width: $thickness;
        height: 100%;
        top: 0;
        cursor: ew-resize;
        .centerLeft {
            position: absolute;
            z-index: 1;
            top: 50%;
            transform: translateX(-4px) translateY(-50%) rotate(180deg);
        }
        .centerRight {
            position: absolute;
            z-index: 1;
            top: 50%;
            transform: translateX(2px) translateY(-50%);
        }
    }
    .bar-e {
        right: $thickness-center;
        .bar-radius {
            z-index: 1;
            right: $thickness-center;
        }
    }
    .bar-w {
        left: $thickness-center;
        .bar-radius {
            z-index: 1;
            left: $thickness-center;
        }
    }
    .bar-ne {
        top: $distance;
        right: $distance;
        cursor: nesw-resize;
    }
    .bar-nw {
        top: $distance;
        left: $distance;
        cursor: nwse-resize;
    }
    .bar-se {
        bottom: $distance;
        right: $distance;
        cursor: nwse-resize;
    }
    .bar-sw {
        bottom: $distance;
        left: $distance;
        cursor: nesw-resize;
    }
    .bar-radius {
        z-index: 1;
        position: absolute;
        width: $width;
        height: $width;
        background: white;
        border: 1px solid #1593ff;
        border-radius: 50%;
        transition: all 0.3s;
    }
    .bar-rotate {
        top: -28px;
        left: 50%;
        transform: translateX(-50%);
        // background: #1593ff;
        cursor: url("../../../../img/mouserotate.png") 10 10, default;
        width: 19px;
        height: 19px;
        display: flex;
        align-items: center;
        justify-content: center;
        i {
            font-size: 13px;
            color: #1593ff;
        }
    }
    .bar-line {
        width: 1px;
        height: 18px;
        top: -18px;
        left: 50%;
        transform: translateX(-50%);
        background: #1593ff;
    }
    .bar-m-line {
        height: 300%;
        border-left: 1px solid #ff296a;
        top: -100%;
        left: 50%;
        display: none;
        pointer-events: none;
    }

    .middle-line {
        width: 1px;
        height: 20px;
        background: #ff5448;
        position: absolute;
        bottom: -20px;
        left: 50%;
    }
    .lock {
        color: #ff5448;
        font-size: 20px;
        border: 1px solid;
        padding: 5px;
        border-radius: 20px;
        position: absolute;
        bottom: -51px;
        left: calc(50% - 15px);
        pointer-events: auto;
        cursor: pointer;
    }

    .three-control {
        color: #ff5448;
        position: absolute;
        pointer-events: auto;
        cursor: pointer;
        width: 24px;
        height: 24px;
        background-image: url("../../../../img/threed-control.png");
        background-size: 24px 24px;
        &:hover {
            background-image: url("../../../../img/threed-control-hover.png");
        }
    }

    .three-d {
        bottom: -13px;
        left: calc(50% - 11px);
    }

    .element-threed {
        bottom: -38px;
        left: calc(50% - 12px);
    }

    .svgRadius {
        width: 11px;
        height: 11px;
    }
    .svgHalfRadius {
        width: 7px;
        height: 13px;
    }
    .topLeft {
        transform: translateY(-2px) rotate(-90deg);
    }
    .topRight {
        transform: translateY(-2px);
    }
    .bottomLeft {
        transform: translateY(3px) rotate(180deg);
    }
    .bottomRight {
        transform: translateY(3px) rotate(90deg);
    }
}
</style>
