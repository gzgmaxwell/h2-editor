import types from '../mutationTypes'

const state = {
    instance: null,
    css: {
        topCss: {
            display: 'none',
            top: 0
        },
        centerYCss: {
            display: 'none',
            top: 0
        },
        bottomCss: {
            display: 'none',
            top: 0
        },
        leftCss: {
            display: 'none',
            left: 0
        },
        centerXCss: {
            display: 'none',
            left: 0
        },
        rightCss: {
            display: 'none',
            left: 0
        }
    },
    grid: {
        show: false,
        rowNum: 3,
        colNum: 3
    },
    ruler: {
        show: true,
        xLines: [], // 竖线
        yLines: [] // 横线
    },
    equalWidth: [], // 等宽线
    equalHeight: [], // 等高线
    spacing: [] // 间距

}

const mutations = {
    [types.GUIDE_LINE_INIT](state, { instance }) {
        state.instance = instance
    },
    [types.GUIDE_LINE_TOP](state, { css }) {
        state.css.topCss = css
    },
    [types.GUIDE_LINE_CENTERY](state, { css }) {
        state.css.centerYCss = css
    },
    [types.GUIDE_LINE_BOTTOM](state, { css }) {
        state.css.bottomCss = css
    },
    [types.GUIDE_LINE_LEFT](state, { css }) {
        state.css.leftCss = css
    },
    [types.GUIDE_LINE_CENTERX](state, { css }) {
        state.css.centerXCss = css
    },
    [types.GUIDE_LINE_RIGHT](state, { css }) {
        state.css.rightCss = css
    },
    [types.GUIDE_LINE_CLEAR](state) {
        for (const key in state.css) {
            state.css[key] = {
                display: 'none'
            }
        }
    },
    [types.GRID_SET](state, { show, rowNum, colNum }) {
        if (show !== undefined) state.grid.show = show
        if (rowNum !== undefined) state.grid.rowNum = rowNum
        if (colNum !== undefined) state.grid.colNum = colNum
    },
    [types.RULER_SHOW](state, { show }) {
        state.ruler.show = show
    },
    [types.RULER_CLEAR](state) {
        state.ruler.xLines = []
        state.ruler.yLines = []
    },
    [types.RULER_ADD](state, { show, xLines, yLines }) {
        state.ruler.show = show
        state.ruler.xLines = xLines
        state.ruler.yLines = yLines
    },
    [types.RULER_TOP_ADD](state, { xLine }) {
        state.ruler.xLines.push(xLine)
    },
    [types.RULER_LEFT_ADD](state, { yLine }) {
        state.ruler.yLines.push(yLine)
    },
    [types.RULER_TOP_DELETE](state, { id }) {
        const xLines = state.ruler.xLines
        const i = xLines.findIndex(item => item.id === id)
        xLines.splice(i, 1)
    },
    [types.RULER_LEFT_DELETE](state, { id }) {
        const yLines = state.ruler.yLines
        const i = yLines.findIndex(item => item.id === id)
        yLines.splice(i, 1)
    },
    [types.GUIDE_SPACING_ADD](state, { list }) {
        list.map((item) => {
            const i = state.spacing.findIndex(v => v.id === item.id)
            if (i === -1) {
                state.spacing.push(item)
            } else {
                state.spacing.splice(i, 1, item)
            }
        })
    },
    [types.GUIDE_SPACING_CLEAR](state) {
        state.spacing = []
    },
    [types.GUIDE_EQUAL_WIDTH](state, { list }) {
        list.map((item) => {
            const i = state.equalWidth.findIndex(v => v.id === item.id)
            if (i === -1) {
                state.equalWidth.push(item)
            } else {
                state.equalWidth.splice(i, 1, item)
            }
        })
    },
    [types.GUIDE_EQUAL_HEIGHT](state, { list }) {
        list.map((item) => {
            const i = state.equalHeight.findIndex(v => v.id === item.id)
            if (i === -1) {
                state.equalHeight.push(item)
            } else {
                state.equalHeight.splice(i, 1, item)
            }
        })
    },
    [types.GUIDE_EQUAL_WIDTH_HEIGHT_CLEAR](state) {
        state.equalHeight = []
        state.equalWidth = []
    }
}

export default {
    state,
    mutations
}
