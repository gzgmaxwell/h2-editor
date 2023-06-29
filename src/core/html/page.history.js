import PageHistoryType from '../../config/enum.pageHistory.type'

export default class History {
    constructor(eqxPage) {
        this.eqxPage = eqxPage
        this.records = [eqxPage.transformJson(eqxPage.pageJson)]
        this.recordsTag = [{ type: PageHistoryType.initPage }]
        this.currentPos = 0
        this.isFirstPos = true
        this.isLastPos = true
    }

    add(page, operateTag = { type: PageHistoryType.default }) {
        const newRecord = this.eqxPage.transformJson(this.eqxPage.pageJson)
        const lastRecord = this.records[this.currentPos]

        // 只添加不一样的记录
        if (newRecord !== lastRecord) {
            // 如果在记录中间有操作，则覆盖之后的记录
            if (this.currentPos < this.records.length) {
                this.records.length = this.currentPos + 1
            }
            this.records.push(newRecord)
            this.currentPos++
            this.setFirstAndLastPos()

            this.recordsTag.push(operateTag)
        }
    }

    back() {
        // 如果是最前一条记录，则不能后退了
        if (this.currentPos > 0) {
            this.currentPos--
        }
        this.setFirstAndLastPos()
        const { elements, background } = JSON.parse(this.records[this.currentPos])
        return { elements, properties: { background } }
    }

    forward() {
        // 如果是最后一条记录，则不能前进了
        if (this.currentPos < this.records.length - 1) {
            this.currentPos++
        }
        this.setFirstAndLastPos()
        const { elements, background } = JSON.parse(this.records[this.currentPos])
        return { elements, properties: { background } }
    }

    /**
     * 设置前进、后退的状态
     */
    setFirstAndLastPos() {
        this.isFirstPos = this.currentPos === 0
        this.isLastPos = this.currentPos === this.records.length - 1
        Vue.store.commit('HISTORY_SET', { disableBack: this.isFirstPos, disableForward: this.isLastPos })
    }

    /**
     * 获取历史记录操作类型
     * @param {偏移量} pOffset
     */
    getHistory(pOffset = 0) {
        let pos = this.currentPos - pOffset
        pos = pos < 0 ? 0 : pos
        return this.recordsTag[pos]
    }
}
