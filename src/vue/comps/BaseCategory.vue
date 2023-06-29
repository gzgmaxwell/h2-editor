<template>
    <div class="eqc-category">
        <ul class="tab">
            <li
                :class="{active: selectedCategoryId === category.id}"
                class="item"
                @click="chooseCategory(category.id)"
            >
                全部
            </li>
            <li
                :class="{active: selectedCategoryId === categoryFirst.id}"
                class="item"
                @click="chooseCategory(categoryFirst.id)"
            >
                {{ categoryFirst.name }}
            </li>
            <li
                :class="{active: isShowDetail}"
                class="item more"
                @mouseover="showDetail"
                @mouseleave="hideDetail"
            >
                <span>更多</span>
                <i
                    :style="{transform: isShowDetail ? 'rotate(180deg)' : ''}"
                    class="icon eqf-down"
                />
            </li>
        </ul>
        <div
            :style="{height: isShowDetail ? subMenuHeight : 0}"
            class="sub-menu"
        >
            <ul
                :style="{height: isShowDetail ? height : 0,top:top+'px'}"
                class="detail"
                @mouseover="showDetail"
                @mousewheel="mousewheel"
                @mouseleave="hideDetail"
            >
                <li
                    v-for="item of categoryMore"
                    :key="item.id"
                    :class="{active: selectedCategoryId === item.id}"
                    class="item"
                    @click="chooseCategory(item.id)"
                >
                    {{ item.name }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        category: {
            type: Object,
            default: null
        },
        selectedCategoryId: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            isShowDetail: false,
            top: 0
        }
    },
    computed: {
        categoryFirst() {
            return this.category.list[0]
        },
        categoryMore() {
            return this.category.list.slice(1)
        },
        height() {
            return Math.ceil(this.categoryMore.length / 3) * 40 + 'px'
        },
        subMenuHeight() {
            const expectHeight = Math.ceil(this.categoryMore.length / 3) * 40
            const realHeight = expectHeight > document.body.clientHeight - 170 ? document.body.clientHeight - 170 : expectHeight
            return realHeight + 'px'
        }
    },
    methods: {
        showDetail() {
            this.isShowDetail = true
        },
        hideDetail() {
            this.isShowDetail = false
        },
        chooseCategory(id) {
            this.$emit('onChoose', id)
        },
        mousewheel(e) {
            if (this.height > this.subMenuHeight) {
                const step = e.deltaY
                this.top -= step
                if (this.top > 0) {
                    this.top = 0
                } else if (Math.abs(this.top) > (parseInt(this.height) - parseInt(this.subMenuHeight))) {
                    this.top = parseInt(this.subMenuHeight) - parseInt(this.height)
                }
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-category {
    .tab {
        display: flex;
        .item {
            position: relative;
            width: 96px;
            height: 40px;
            line-height: 40px;
            font-size: 12px;
            border-bottom: 1px solid #ccd5db;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
            &:hover,
            &.active {
                color: #1593ff;
                &::after {
                    opacity: 1;
                }
            }
            &::after {
                content: "";
                position: absolute;
                left: 0;
                bottom: -1px;
                width: 100%;
                height: 2px;
                background: #1593ff;
                opacity: 0;
                transition: all 0.3s;
            }
            &.more {
                .icon {
                    display: inline-block;
                    position: relative;
                    top: 4px;
                    font-size: 20px;
                    transition: all 0.3s;
                }
                &:hover {
                    .icon {
                        transform: rotate(180deg);
                    }
                }
            }
        }
    }
    .sub-menu {
        overflow-y: scroll;
        width: 120%;
        .detail {
            display: flex;
            flex-wrap: wrap;
            position: relative;
            background: #fff;
            overflow: hidden;
            // overflow-y: scroll;
            transition: all 0.3s;
            &::after {
                content: "";
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 1px;
                background: #eceef0;
            }
            .item {
                width: 96px;
                height: 40px;
                line-height: 40px;
                font-size: 12px;
                border-bottom: 1px solid #eceef0;
                text-align: center;
                cursor: pointer;
                z-index: 1; // 层级需要在最底下那根线的上面
                transition: all 0.3s;
                &:hover,
                &.active {
                    color: #1593ff;
                    border-bottom: 1px solid #1593ff;
                }
            }
        }
    }
}
</style>
