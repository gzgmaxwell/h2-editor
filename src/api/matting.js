import { host } from '../config/env'

export default {
    quickMatting
}

/**
 * 获取极速抠图返回结果
 * @param src
 */
function quickMatting(src, width, height) {
    const info = `?imageView2/2/w/${width}/h/${height}`
    const url = `${host.p1}/print/matting/simpleMatting`
    const filePath = `${Vue.env.host.file}${src}${info}`
    return axios.get(url, {
        params: {
            filePath
        }
    })
}
