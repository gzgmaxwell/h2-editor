<template>
    <div class="eqc-guide">
        <div
            :style="topCss"
            class="line h"
        />
        <div
            :style="centerYCss"
            class="line h"
        />
        <div
            :style="bottomCss"
            class="line h"
        />
        <div
            :style="leftCss"
            class="line v"
        />
        <div
            :style="centerXCss"
            class="line v"
        />
        <div
            :style="rightCss"
            class="line v"
        />
        <div
            v-for="item in equalWidth"
            :key="item.id"
            :style="[{top: item.top},{left: item.left}]"
            class="equal-width"
        >
            <div class="bundle" />
            <div
                :style="{width: item.width}"
                class="equal-line"
            >
                <div class="e-l" />
                <p class="e-n">
                    {{ item.num }}
                </p>
            </div>
            <div class="bundle" />
        </div>
        <div
            v-for="item in equalHeight"
            :key="item.id"
            :style="[{top: item.top},{left: item.left}]"
            class="equal-height"
        >
            <div class="bundle" />
            <div
                :style="{height: item.height}"
                class="equal-line"
            >
                <div class="e-l" />
                <p class="e-n">
                    {{ item.num }}
                </p>
            </div>
            <div class="bundle" />
        </div>
        <div
            v-for="item in spacing"
            :key="item.id"
            :style="[{top: item.top},{left: item.left},{width: item.width},{height: item.height}]"
            class="equal-space"
        >
            <p
                :style="item.numCss"
                class="num"
            >
                {{ item.num }}
            </p>
        </div>
    </div>
</template>

<script>
import GuideLine from './GuideLine'

export default {
    computed: {
        guideLine() {
            return this.$store.state.guideLine
        },
        css() {
            return this.guideLine.css
        },
        topCss() {
            return this.css.topCss
        },
        centerXCss() {
            return this.css.centerXCss
        },
        bottomCss() {
            return this.css.bottomCss
        },
        leftCss() {
            return this.css.leftCss
        },
        centerYCss() {
            return this.css.centerYCss
        },
        rightCss() {
            return this.css.rightCss
        },
        spacing() {
            return this.guideLine.spacing
        },
        equalWidth() {
            return this.guideLine.equalWidth
        },
        equalHeight() {
            return this.guideLine.equalHeight
        }
    },
    created() {
        this.$store.commit('GUIDE_LINE_INIT', { instance: new GuideLine() })
    }
}
</script>

<style lang="scss">
.eqc-guide {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    .line {
        position: absolute;
        background: red;
        &.h {
            left: 0;
            width: 100%;
            height: 1px;
        }
        &.v {
            top: 0;
            width: 1px;
            height: 100%;
        }
    }
    .equal-width {
        position: absolute;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        .bundle {
            width: 1px;
            height: 9px;
            background: #ff2a6a;
        }
        .equal-line {
            .e-l {
                width: 100%;
                height: 1px;
                background: #ff2a6a;
                margin-top: 4px;
            }
            .e-n {
                font-size: 12px;
                color: #ff2a6a;
                text-align: center;
                width: 100%;
                line-height: 14px;
            }
        }
    }
    .equal-height {
        position: absolute;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-end;
        .bundle {
            width: 9px;
            height: 1px;
            background: #ff2a6a;
        }
        .equal-line {
            position: relative;
            .e-l {
                height: 100%;
                width: 1px;
                background: #ff2a6a;
                margin-right: 4px;
            }
            .e-n {
                font-size: 12px;
                color: #ff2a6a;
                text-align: center;
                position: absolute;
                top: calc(50% - 6px);
                right: 8px;
            }
        }
    }
    .equal-space {
        position: absolute;
        background: rgba(255, 42, 106, 0.15);
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        .num {
            font-size: 12px;
            color: #ff2a6a;
            text-align: center;
        }
    }
}
</style>
