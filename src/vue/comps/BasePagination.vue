<template>
    <div class="eqc-pagination">
        <ul class="list">
            <li
                :class="{disable: pageNo === 1}"
                class="item big"
                @click="toPage(pageNo - 1)"
            >
                上一页
            </li>
            <li
                :class="{disable: pageNo === 1}"
                class="item middle"
                @click="toPage(1)"
            >
                首页
            </li>
            <li
                v-for="item in showPages"
                :key="item"
                :class="{active: item === pageNo}"
                class="item"
                @click="toPage(item)"
            >
                {{ item }}
            </li>
            <li
                :class="{disable: pageNo === pageCount}"
                class="item middle"
                @click="toPage(pageCount)"
            >
                尾页
            </li>
            <li
                :class="{disable: pageNo === pageCount}"
                class="item big"
                @click="toPage(pageNo + 1)"
            >
                下一页
            </li>
        </ul>
        <ul
            v-if="showGoto"
            class="list"
        >
            <li class="item input">
                <input
                    v-model.number.trim="toPageNo"
                    type="text"
                    @keydown.enter="go(toPageNo)"
                >
            </li>
            <li
                class="item middle"
                @click="go(toPageNo)"
            >
                跳转
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    props: {
        pageNo: {
            type: Number,
            default: 1
        },
        pageSize: {
            type: Number,
            default: 10
        },
        totalCount: {
            type: Number,
            default: 0
        },
        onToPage: {
            type: Function,
            default: null
        },
        maxShowItem: {
            type: Number,
            default: 10
        },
        showGoto: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            // maxShowItem: 10,
            currentPage: 1,
            toPageNo: 1
        }
    },
    computed: {
        pageCount() {
            return Math.ceil(this.totalCount / this.pageSize)
        },
        showPages() {
            const pages = []
            // 如果当前的激活的项小于要显示的页数
            if (this.pageNo < this.maxShowItem) {
                // 总页数和要显示的页数哪个小就显示哪个
                let i = Math.min(this.pageCount, this.maxShowItem)
                while (i) {
                    pages.unshift(i--)
                }
            } else {
                let middle = this.pageNo - Math.floor(this.maxShowItem / 2)
                let i = this.maxShowItem
                if (middle > (this.pageCount - this.maxShowItem)) {
                    middle = (this.pageCount - this.maxShowItem) + 1
                }
                while (i--) {
                    pages.push(middle++)
                }
            }
            return pages
        }
    },
    watch: {
        pageNo(newVal) {
            this.toPageNo = newVal
        }
    },
    methods: {
        toPage(pageNo) {
            if (pageNo === this.pageNo ||
                pageNo < 1 ||
                pageNo > this.pageCount) {
                return
            }
            this.onToPage(pageNo)
        },
        go(pageNo) {
            if (!(this.toPageNo >= 1 && this.toPageNo <= this.pageCount)) {
                this.notifier.warn('请输入合理的页数')
            } else {
                this.toPage(pageNo)
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-pagination {
    .list {
        display: inline-flex;
        &:not(:first-child) {
            margin-left: 16px;
        }
        .item {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 36px;
            height: 36px;
            border: 1px solid #ccd5db;
            background: #fff;
            cursor: pointer;
            transition: all 0.3s;
            &:not(:first-child) {
                margin-left: -1px;
            }
            &:first-child {
                border-radius: 3px 0 0 3px;
            }
            &:last-child {
                border-radius: 0 3px 3px 0;
            }
            &.disable {
                color: #ccc;
                pointer-events: none;
            }
            &:hover,
            &.active {
                color: #fff;
                background: #1593ff;
            }
            &.big {
                width: 60px;
            }
            &.middle {
                width: 48px;
            }
            &.input {
                &:hover {
                    color: inherit;
                    background: inherit;
                }
            }
            input {
                width: 100%;
                height: 100%;
                padding: 0 6px;
                border-radius: 3px 0 0 3px;
                text-align: center;
                background: #fafafa;
            }
        }
    }
}
</style>
