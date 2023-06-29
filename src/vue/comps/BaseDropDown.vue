<template>
    <div
        ref="dropDown"
        :style="css"
        class="eqc-drop-dwon"
    >
        <div
            v-scroll-bar="scrollBarOptions"
            :style="{'maxHeight':maxItemNum * 30 + 'px'}"
            class="wrap"
        >
            <ul
                :style="contentCss"
                class="list"
            >
                <li
                    v-for="item of list"
                    :key="item[itemKey]"
                    :class="{active: item[itemKey] === selectedItem[itemKey]}"
                    :style="{fontFamily: item.fontFamily}"
                    class="item ellipsis"
                    @click="choose(item)"
                >
                    {{ item[name] }}
                    <label
                        v-if="item.showFlag"
                        class="vip"
                    />
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        maxItemNum: {
            type: Number,
            default: 10
        },
        scrollBarOptions: {
            type: Object,
            default: null
        },
        css: {
            type: Object,
            default: null
        },
        contentCss: {
            type: Object,
            default: null
        },
        list: {
            type: Array,
            default: null
        },
        itemKey: {
            type: String,
            default: 'id'
        },
        name: {
            type: String,
            default: 'name'
        },
        selectedItem: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    methods: {
        choose(item) {
            this.$emit('choose', item)
        }
    }
}
</script>

<style lang="scss">
.eqc-drop-dwon {
    position: absolute;
    .wrap {
        position: relative;
        width: 100%;
        // max-height: 30px * 10;
        box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
        .list {
            width: 100%;
            padding: 8px 1px;
            background: #fff;
            .item {
                width: 100%;
                height: 30px;
                line-height: 30px;
                padding: 0 12px;
                color: #2f3c4d;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
                &:hover,
                &.active {
                    color: #fff;
                    background: rgba(47, 60, 77, 1);
                }
                label {
                    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAgCAYAAABHA7voAAAFdElEQVRYR91Ze0yTVxT/nQKltKCWhw9ABRRQBDadTDQa60wYI+K2uExBVJZlc5C9dImLM8PoXLJptmQ66B9kEV1gYRvMbLqnjvoEAZWJE6HoQBQsCBstUiyld/k+2kbo42sNg8n37z3nnvO753ce934EF78rX+8Ud3WqVzDQagZTDDEEMyAYgK+LWzysWA8BrYzQShBdJbDv/QMiy2Jf3GVwZUMSEqo8mDm1t8+QQwzrGdgEIfnRWCeQlhEKpRLx7idfKrjjzKZDgOof3/C+3dy5AwxbASYbDcfdt0H3QPg0ZGbAh5EpB+7b07cL0By178BYovtGx0CDqEIqET9vL5o2AE/lb4w3GY3HwFjoGLj68CaJbpGIUpZvLqx9cJMhAM2Rq3rkwFkQEd2SSsQJD0bSCtCccypHtPSW+YM8PGHo/Qcmo0sFDBK/IIAI93s6wRiDxC8QpgEjDPe6rIcs8vCCWCa3HznGYNBrYTLaTS/7OkQVITMDFJactAJUKdN3g7H3HXFkzspsTIlaiqbqEjRXlQhSSeofioS1e2E09KK8IAte0olIzNiPnrvNuPDNdqu+PDQW8anvOd2vX6+Ftv06mqtLoWu/LmgbRB8osopyOEEeIE9NvaHRWbWUh8YhPnU79N0aVBZtETQSvmgtZix4Fm11ZWhQ5cPbL9ApQL22HZ1NF4fsS0QQSydBFjAD0knT+DX16YNovfKbgH26J/URz+aoygNUKdPzwFiWcy1C4oYD8Pb1x8XSHOg0jU7FF2Xs5ylZc2QXutvqBQHebbqAP3/6xOGeU6KXIXrFZrABI6qK30WfViPgLikVWUXZxE0onXfVHa408fDENMyYn4rbtb+g8cwhhwYmTovG48/thF6rQWXhYLSFIigEkNsjSvEqps1VoOHkF2i7esIpQG4YCAiMDKJTyvSnTYz9LMg5AFJ5CBLW7eMTv/xQNsBMdtUil7+M4JiVaKoqQXP1YL6OBMCpc1cgWvGK4AFbnBIRJdNJ5fpcxkzZrgDkZBas2QO/yRGoPbYXXTdrbNRI5IHFmUp4efvifOHb6NO2jxjA4NgkRC7LRMulH3Cj4itBl4lEeaRSppWBQSEobRawGNE0nMW1E7k2agFhTyD2mXfQ3XYNNUd2W9dHIoLzkrciMHwhrv2uhKb+tLDLBBWdzEurZ0CUsPSghKfED4s35oKZBnCu4DWbHhWT9BaCZi1CvSofd+rKRgSgyNMb0+evQtjCNXx6VBdvA9c6hD4CGkiVl6Zz98ozL3kLAsMTUHc8F+3qs1Y7HmIfLNmkBAP43jfQr3cZoKG3G7qOv4b4zLcJmRw+EybDw0uCgf77uPrrZ3ZTwwHYnocCyNGEo0vXzT9Qe+xj695TopdjzlOb0a4+h7rjnw+xKURRTpgNL1oMMOi70afrgFajRsulo+jXdwsFzrpORDq3Kcpp84VkUx48xTKUH8620iU+dQfkofNw+ehH+LvlslsAXWkTLiMzCw5S1M0iYzEye2kmQuKS+H7I9UWOStwgwFGt4svXuXCMOUDwRcbNNmHx2i8oAgte2AOtphGXSnMQ+lgKZi3JQEvNUdwoL7I5bCGK/icR5NqEO41+uNcL1+2DTB6CyqKtiEl6E76BYagq3oberlv/C4B8o3dnVBvu9fT5qxGRuA4d18/zrUHX0YSL39q/GYx2BK2jGue0a8O2bYqLZf5I3LAfRCJ+sfHMYdyutT/1jTZAkHnY5hxz5brkqILFrdoO/+lxfOPn5tP+Pq6t2n6jC3DYdckcRacXXndL9JjKD7/wcs4IPVmMqcPuGHf0ZGGlap9hfD46WQ5pXD8bWkCO64dfC8hx/XT/YE6P258vwwvXo/r77F97qx8O1gbsnwAAAABJRU5ErkJggg==);
                    background-repeat: no-repeat;
                    position: absolute;
                    margin-left: 6px;
                    top: 1px;
                    background-size: 28px 16px;
                    width: 28px;
                    height: 16px;
                    display: inline-block;
                }
            }
        }
    }
}
</style>
