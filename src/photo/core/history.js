import historyType from '../../config/enum.photoHistory.type'
/**
 * 照片编辑器历史记录类
 */
export default class photoHistory {
    constructor() {
        this.records = []
        this.currentPos = -1
        this.isFirstPos = true
        this.isLastPos = true
    }

    /**
     * 清除历史记录
     * @param {是否全部清除} all
     */
    clear(all) {
        if (all) {
            this.records = []
            this.currentPos = -1
        } else {
            const firstRecord = this.records[0]
            this.records = [firstRecord]
            this.currentPos = 0
        }
        this.isFirstPos = true
        this.isLastPos = true
    }

    /**
     * 插入历史记录
     * @param {操作参数} actionParams
     * @param {操作对象} actionObject
     * @param {操作类型} actionType
     * @param {操作是否为组间操作} actionInner
     */
    insert(actionParams, actionObject, actionType, actionInner) {
        // 当前左侧选中的菜单类型
        const menuType = Vue.store.state.photoLayout.nav.selectedItem.type
        // 新历史记录对象 一半
        const newHalfRocordObj = { actionParams, actionObject, actionType, actionInner }
        // 当前最后一个历史记录对象
        const lastFullRecordObj = this.records.length > 0 ? JSON.parse(this.records[this.currentPos]) : null
        // 新历史记录对象抛开选中菜单属性的字符串
        const newHalfRocordObjStr = JSON.stringify({
            actionParams: newHalfRocordObj.actionParams,
            actionObject: newHalfRocordObj.actionObject,
            actionType: newHalfRocordObj.actionType,
            actionInner: newHalfRocordObj.actionInner
        })
        // 当前最后一个历史记录对象抛开选中菜单属性的字符串
        let lastHalfRecordObjStr = null
        // 比对相应部分的历史记录
        if (actionType === historyType.default) {
            lastHalfRecordObjStr = null
        } else if (actionType === historyType.text || actionType === historyType.paster) {
            // 文字、贴纸
            if (lastFullRecordObj !== null) {
                lastHalfRecordObjStr = JSON.stringify({
                    actionParams: lastFullRecordObj.historyElement.actionParams,
                    actionObject: lastFullRecordObj.historyElement.actionObject,
                    actionType: lastFullRecordObj.historyElement.actionType,
                    actionInner: lastFullRecordObj.historyElement.actionInner
                })
            }
        } else {
            // 基础、裁切、旋转、滤镜
            if (lastFullRecordObj !== null) {
                lastHalfRecordObjStr = JSON.stringify({
                    actionParams: lastFullRecordObj.historyImage.actionParams,
                    actionObject: lastFullRecordObj.historyImage.actionObject,
                    actionType: lastFullRecordObj.historyImage.actionType,
                    actionInner: lastFullRecordObj.historyImage.actionInner
                })
            }
        }
        // 操作相同不添加历史记录
        if (newHalfRocordObjStr === lastHalfRecordObjStr) {
            return
        }
        const newFullRocordObj = {}
        if (actionType === historyType.defaultImage) {
            newFullRocordObj.historyImage = newHalfRocordObj
            newFullRocordObj.historyElement = { actionParams: [], actionObject: null, actionType: historyType.defaultElement, actionInner: false }
        } else if (actionType === historyType.text || actionType === historyType.paster) {
            // 文字、贴纸
            newFullRocordObj.historyElement = newHalfRocordObj
            newFullRocordObj.historyImage = lastFullRecordObj !== null ? lastFullRecordObj.historyImage : ''
        } else {
            // 基础、裁切、旋转、滤镜
            newFullRocordObj.historyImage = newHalfRocordObj
            newFullRocordObj.historyElement = lastFullRecordObj !== null ? lastFullRecordObj.historyElement : { actionParams: [], actionObject: null, actionType: historyType.defaultElement, actionInner: false }
        }
        // 为当前历史记录添加左侧选中菜单类型属性
        newFullRocordObj.menuType = menuType
        // 如果在记录中间有操作，则覆盖之后的记录
        if (this.currentPos < this.records.length) {
            this.records.length = this.currentPos + 1
        }
        // 添加历史记录到数组
        this.records.push(JSON.stringify(newFullRocordObj))
        // 当前位置+1
        this.currentPos++
        // 设置前进后退按钮状态
        this.setFirstAndLastPos()
    }

    /**
     * 获取上一条历史记录
     */
    back() {
        // 如果是最前一条记录，则不能后退了
        if (this.currentPos > 0) {
            this.currentPos--
        }
        this.setFirstAndLastPos()
        return this.records[this.currentPos]
    }

    /**
     * 获取前一条历史记录
     */
    forward() {
        // 如果是最后一条记录，则不能前进了
        if (this.currentPos < this.records.length - 1) {
            this.currentPos++
        }
        this.setFirstAndLastPos()
        return this.records[this.currentPos]
    }

    /**
     * 设置前进、后退的状态
     */
    setFirstAndLastPos() {
        this.isFirstPos = this.currentPos === 0
        this.isLastPos = this.records.length > 0 ? (this.currentPos === this.records.length - 1) : false
        Vue.store.commit('PHOTO_HISTORY_SET', { disableBack: this.isFirstPos, disableForward: this.isLastPos })
    }
}
