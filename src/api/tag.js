import axios from 'axios'
import { host } from '../config/env'
import qs from 'qs'

export default {
    getTags,
    addTag,
    addToTag,
    editTag,
    deleteTag,
    clearTag
}

/**
 * 获取上传图片时创建的标签
 */
function getTags() {
    return axios.get(`${host.p1}/m/base/file/tag/my`)
}

/**
 * 添加标签
 * @param {*} tagName
 */
function addTag(tagName) {
    return axios.post(`${host.p1}/m/base/file/tag/create`, { tagName })
}

/**
 * 将文件添加到别的标签下
 * @param {*} tagId
 * @param {*} fileIds
 */
function addToTag(tagId, fileIds) {
    return axios.post(`${host.p1}/m/base/file/tag/set`, qs.stringify({ tagId, fileIds }, { arrayFormat: 'repeat' }))
}

/**
 * 修改标签
 * @param {*} tagId
 * @param {*} tagName
 */
function editTag(tagId, tagName) {
    return axios.post(`${host.p1}/m/base/file/tag/modify`, { tagId, tagName })
}

/**
 * 删除标签
 * @param {*} id
 */
function deleteTag(id) {
    return axios.post(`${host.p1}/m/base/file/tag/delete`, { id })
}

/**
 * 清除标签
 * @param {*} tagId
 * @param {*} fileIds
 */
function clearTag(tagId, fileIds) {
    return axios.post(`${host.p1}/m/base/file/tag/unset`, qs.stringify({ tagId, fileIds }, { arrayFormat: 'repeat' }))
}
