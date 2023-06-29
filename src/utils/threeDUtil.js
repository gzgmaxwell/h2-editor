import * as THREE from 'three'

const getBoxInfo = (textThreeDElement, renderSize) => {
    const boundingBoxMax = { x: 0, y: 0, z: 0 }
    const boundingBoxMin = { x: 0, y: 0, z: 0 }
    textThreeDElement.$groups.forEach(groupItem => {
        // 通过Box3计算每一行的边界
        const box = new THREE.Box3()
        box.expandByObject(groupItem.group)
        // 取出最大最小的两个坐标
        boundingBoxMax.x = (boundingBoxMax.x < box.max.x) ? box.max.x : boundingBoxMax.x
        boundingBoxMax.y = (boundingBoxMax.y < box.max.y) ? box.max.y : boundingBoxMax.y
        boundingBoxMax.z = (boundingBoxMax.z < box.max.z) ? box.max.z : boundingBoxMax.z
        boundingBoxMin.x = (boundingBoxMin.x > box.min.x) ? box.min.x : boundingBoxMin.x
        boundingBoxMin.y = (boundingBoxMin.y > box.min.y) ? box.min.y : boundingBoxMin.y
        boundingBoxMin.z = (boundingBoxMin.z > box.min.z) ? box.min.z : boundingBoxMin.z
    })
    return getBoxInfo2(boundingBoxMax, boundingBoxMin, textThreeDElement.$camera, renderSize)
}

const getBoxInfo2 = (boundingBoxMax, boundingBoxMin, camera, renderSize) => {
    // 计算elementBox大小及位置
    // -------正面
    // 近 上 右
    const nearTopRight = getVectorByVector3(
        camera,
        boundingBoxMax.x, boundingBoxMax.y, boundingBoxMax.z,
        renderSize.x, renderSize.y
    )
    // 近 下 右
    const nearBottomRight = getVectorByVector3(
        camera,
        boundingBoxMax.x, boundingBoxMin.y, boundingBoxMax.z,
        renderSize.x, renderSize.y
    )
    // 近 下 左
    const nearBottomLeft = getVectorByVector3(
        camera,
        boundingBoxMin.x, boundingBoxMin.y, boundingBoxMax.z,
        renderSize.x, renderSize.y
    )
    // 近 上 左
    const nearTopLeft = getVectorByVector3(
        camera,
        boundingBoxMin.x, boundingBoxMax.y, boundingBoxMax.z,
        renderSize.x, renderSize.y
    )
    // -------背面
    // 远 上 右
    const farTopRight = getVectorByVector3(
        camera,
        boundingBoxMax.x, boundingBoxMax.y, boundingBoxMin.z,
        renderSize.x, renderSize.y
    )
    // 远 下 右
    const farBottomRight = getVectorByVector3(
        camera,
        boundingBoxMax.x, boundingBoxMin.y, boundingBoxMin.z,
        renderSize.x, renderSize.y
    )
    // 远 下 左
    const farBottomLeft = getVectorByVector3(
        camera,
        boundingBoxMin.x, boundingBoxMin.y, boundingBoxMin.z,
        renderSize.x, renderSize.y
    )
    // 远 上 左
    const farTopLeft = getVectorByVector3(
        camera,
        boundingBoxMin.x, boundingBoxMax.y, boundingBoxMin.z,
        renderSize.x, renderSize.y
    )
    const center = getVectorByVector3(
        camera,
        0, 0, 0,
        renderSize.x, renderSize.y
    )
    const vectorArray = []
    vectorArray.push(nearTopRight)
    vectorArray.push(nearBottomRight)
    vectorArray.push(nearBottomLeft)
    vectorArray.push(nearTopLeft)
    vectorArray.push(farTopRight)
    vectorArray.push(farBottomRight)
    vectorArray.push(farBottomLeft)
    vectorArray.push(farTopLeft)
    const xArr = []
    vectorArray.map(itme => {
        xArr.push(itme.x)
    })
    const yArr = []
    vectorArray.filter(itme => {
        yArr.push(itme.y)
    })
    const minX = Math.min(...xArr)
    const minY = Math.min(...yArr)
    const maxX = Math.max(...xArr)
    const maxY = Math.max(...yArr)
    return {
        minX,
        minY,
        maxX,
        maxY,
        centerX: center.x,
        centerY: center.y,
        width: maxX - minX,
        height: maxY - minY
    }
}

const getVectorByVector3 = (camera, x, y, z, width, height) => {
    var p = new THREE.Vector3(x, y, z)
    var vector = p.project(camera)
    // vector.x = (vector.x + 1) / 2 * 600
    // vector.y = -(vector.y - 1) / 2 * 600
    vector.x = Math.round((0.5 + vector.x / 2) * width)
    vector.y = Math.round((0.5 - vector.y / 2) * height)
    return vector
}

/**
* 获取纹理贴图cover
*/
const getTextureCover = (pCover, pIsBg = true) => {
    const result = Vue.store.state.fontStyle.textThreeDTextTexture.styleList.filter(item => {
        return item.name === pCover
    })
    if (pIsBg) {
        return `url(${result[0].cover})`
    }
    return result[0].cover
}

export default {
    getBoxInfo,
    getBoxInfo2,
    getVectorByVector3,
    getTextureCover
}
