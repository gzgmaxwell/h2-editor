<template>
    <div
        v-if="showProcess"
        class="process-gif-bar"
    >
        <div class="container">
            <span class="title">{{ text }}</span>
            <div class="processBar">
                <div class="line gray-line" />
                <div
                    :style="{width:steps+'%'}"
                    class="line blue-line"
                />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        start: {
            type: Boolean,
            default: false
        },
        text: {
            type: String,
            default: '正在导出GIF图...'
        }
    },
    data() {
        return {
            showProcess: false,
            steps: 1
        }
    },
    watch: {
        start(newState) {
            newState ? this.running() : this.close()
        }
    },
    methods: {
        running() {
            this.showProcess = true
            const timer = setInterval(() => {
                this.steps++
                if (this.steps === 98) {
                    clearInterval(timer)
                }
            }, 500)
        },
        close() {
            this.steps = 100
            // 动画完毕之后关闭
            setTimeout(() => {
                this.showProcess = false
            }, 500)
        }
    }
}
</script>

<style lang="scss">
.process-gif-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.7);
    z-index: 100; //与错误提示层级一样
    .container {
        width: 408px;
        height: 96px;
        padding: 16px 24px;
        background: #fff;
        border-radius: 3px;
        .title {
            font-size: 13px;
            color: #2f3c4d;
            line-height: 20px;
        }
        .processBar {
            position: relative;
            margin-top: 16px;
            .line {
                position: absolute;
                top: 0;
                left: 0;
                height: 2px;
            }
            .gray-line {
                background: rgba(204, 213, 219, 1);
                width: 100%;
            }
            .blue-line {
                background: rgba(21, 147, 255, 1);
                width: 1%;
                transition: all 0.5s;
            }
        }
    }
}
</style>
