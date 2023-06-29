import EqxElement from '../element'
import elementType from '../../../config/enum.element.type'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'
import STATS from 'three/examples/jsm/libs/stats.module'
import threeDUtil from '../../../utils/threeDUtil'
import textThreeDTextStyle from '../../../config/enum.textThreeDText.style'
import combineInitor from '../../../vue/pages/create/workspace/combine.box.js'

export default class EqxTextThreeD extends EqxElement {
    constructor(elementJson, eqxPage) {
        super(eqxPage)
        // 如果有值则是已有组件，否则是新组件
        if (!elementJson.id) {
            const css = EqxElement.defaultCss
            const elements = eqxPage.pageJson.elements
            elementJson.id = EqxElement.newId(elements)
            elementJson.type = elementType.textThreeD
            elementJson.css = Object.assign({
                left: css.left,
                top: css.top,
                width: css.width,
                height: css.height,
                opacity: css.opacity,
                transform: css.transform,
                display: css.display,
                fontFamily: css.fontFamily,
                fontSize: css.fontSize,
                borderWidth: css.borderWidth
            }, elementJson.css, { zIndex: EqxElement.newZIndex(elements) })
            elementJson.property = elementJson.property || {}
        }
        this.elementJson = elementJson
        this.isEditing = false // 是否在编辑中
        this.$text = null // 组件里的文本dom
        this.$gui = null
        this.$stats = null
        this.$statsDom = null
        this.$scene = null
        this.$camera = null
        this.$renderer = null
        this.$orbitControls = null
        this.$axesHelper = null
        this.$textData = null
        this.$generateGeometryFun = null
        this.$groups = null
        this.$requestId = null
    }

    /**
     * 渲染
     */
    render() {
        super.render()
        const $text = this.$text = document.createElement('div')
        const uselessCss = {
            left: '',
            top: '',
            transform: '',
            zIndex: ''
        }
        $text.css(this.elementJson.css).css(uselessCss)
        // 添加loading...
        this.renderLoading()
        this.$el.appendChild($text)
        // 初始化3D场景
        this.initThreeD()
        // 添加文字对象
        this.drawText()
    }

    renderLoading(pLoadingText = '加载中...') {
        const loadingText = document.createElement('label')
        loadingText.innerText = pLoadingText
        loadingText.className = 'loading'
        loadingText.css({
            position: 'absolute',
            fontSize: '22px',
            color: '#1593ff'
        })
        this.$text.append(loadingText)
    }

    removeLoading() {
        const loadingArr = this.$text.querySelectorAll('.loading')
        if (loadingArr && loadingArr.length > 0) {
            loadingArr.forEach(item => {
                item.remove()
            })
        }
    }

    /**
     * 更新样式
     */
    updateCss(css) {
        const uselessCss = {
            // 清除不需要的属性
            left: '',
            top: '',
            zIndex: '',
            transform: ''
        }
        super.updateCss(css)
        super.setScale()
        this.$text.css(css).css(uselessCss)
    }

    /**
     * 更新属性
     */
    updateProperty(newProperty) {
        if (JSON.stringify(this.elementJson.property) === JSON.stringify(newProperty)) {
            // 所有属性相同就不直接返回
            return
        }
        super.updateProperty(newProperty)
    }

    /**
     * 更新改变尺寸时的大小
     * @param {缩放比例} pScale
     */
    updateReSize(pScale) {
        const canvas = this.$el.querySelector('canvas')
        // 这里用css的比例去改变大小提高效率
        canvas.css({
            transform: `scale(${pScale})`
        })
        // 计算3D像素大小
        const boxInfo = threeDUtil.getBoxInfo(this, {
            x: canvas.getBoundingClientRect().width / this.eqxPage.scale,
            y: canvas.getBoundingClientRect().height / this.eqxPage.scale
        })
        // 调整canvas的位置
        const maxX2centerX = boxInfo.maxX - boxInfo.centerX
        const minX2centerX = boxInfo.centerX - boxInfo.minX
        const maxY2centerY = boxInfo.maxY - boxInfo.centerY
        const minY2centerY = boxInfo.centerY - boxInfo.minY
        const marginleft = minX2centerX - maxX2centerX
        const marginTop = minY2centerY - maxY2centerY
        // 更新canvas的位置，保证文字不漏到elementBox外面去
        canvas.css({
            marginLeft: marginleft + 'px',
            marginTop: marginTop + 'px'
        })
    }

    /**
     * 更新字体
     */
    updateFont(newProperty) {
        super.updateProperty(newProperty)
        this.$textData.font = newProperty.textFont.src
        this.renderLoading('字体加载中...')
        this.$generateGeometryFun()
    }

    /**
     * 更新3D文字内容
     */
    updateGeometry(newProperty) {
        if (newProperty.textContent.length > Vue.env.threeDTextMaxLength) {
            return
        }
        super.updateProperty(newProperty)
        this.$textData.text = newProperty.textContent
        this.$textData.size = newProperty.textFontSize
        this.$textData.height = newProperty.textHeight
        this.$textData.textColor = newProperty.textColor
        this.$textData.textShadowColor = newProperty.textShadowColor
        this.$textData.bevelThickness = newProperty.bevelThickness
        this.$textData.bevelSize = newProperty.bevelSize
        this.$textData.bevelSegments = newProperty.bevelSegments
        this.$textData.bevelOffset = newProperty.bevelOffset
        this.$textData.letterSpacing = newProperty.letterSpacing
        this.$textData.lineHeight = newProperty.lineHeight
        this.$textData.textAlign = newProperty.textAlign
        this.$generateGeometryFun()
    }

    /**
     * 更新颜色 投影颜色、文本颜色
     */
    updateColor(newProperty) {
        super.updateProperty(newProperty)
        this.$groups.forEach(groupItem => {
            groupItem.group.children.forEach(meshItem => {
                if (meshItem.material[0].map !== null && this.elementJson.property.textStyleType === textThreeDTextStyle.color) {
                    meshItem.material[0].map.dispose()
                    meshItem.material[0].map = null
                    meshItem.material[0] = new THREE.MeshBasicMaterial()
                }
                if (this.elementJson.property.textStyleType === textThreeDTextStyle.color) {
                    meshItem.material[0].color = new THREE.Color(this.elementJson.property.textColor)
                }
                meshItem.material[1].color = new THREE.Color(this.elementJson.property.textShadowColor)
            })
        })
    }

    /**
     * 更新渐变
     */
    updateGradient(newProperty) {
        super.updateProperty(newProperty)
        const textGradient = this.elementJson.property.textGradient
        let boxWidth = 0
        let boxHeight = 0
        // 将每行都组合起来成为一个大的对象
        const group = new THREE.Group()
        this.$groups.forEach(groupItem => {
            group.add(groupItem.group.clone())
            boxWidth = boxWidth < groupItem.maxGroupWidth ? groupItem.maxGroupWidth : boxWidth
            boxHeight += groupItem.maxGroupHeight + groupItem.maxGroupHeightOffset
        })
        // create canvas
        var drawingCanvas = this.getGradientCanvas(Math.ceil(boxWidth), Math.ceil(boxHeight), textGradient.colors, textGradient.angle)
        // 更新每个字的贴图
        this.$groups.forEach((groupItem, index) => {
            // 当前行
            const group = groupItem.group
            const groupCharSizeArr = groupItem.groupCharSizeArr
            const x1 = 0
            const x2 = boxWidth
            let y1 = 0
            let y2 = 0
            if (index === 0) {
                // 第一行
                y1 = 0
                y2 = groupItem.maxGroupHeight
            } else if (index === this.$groups.length - 1) {
                // 最后一行
                y1 = boxHeight - groupItem.maxGroupHeight
                y2 = boxHeight
            } else {
                // 中间行
                this.$groups.forEach((groupItem, index2) => {
                    if (index2 < index) {
                        y1 += groupItem.maxGroupHeight
                        y2 += groupItem.maxGroupHeight
                    }
                    if (index2 === index) {
                        y2 += groupItem.maxGroupHeight
                    }
                })
            }
            // 获取当前行需要的canvas
            const groupCanvas = this.cutCanvas(drawingCanvas, x1, y1, x2, y2)
            group.children.forEach((meshItem, i) => {
                let x1 = meshItem.position.x + boxWidth / 2
                x1 = x1 < 0 ? 0 : x1
                const y1 = 0
                const x2 = x1 + groupCharSizeArr[i].width
                const y2 = groupCanvas.height
                // 获取单字canvas
                const textureCanvas = this.cutCanvas(groupCanvas, x1, y1, x2, y2)
                const textureCanvasOriginWidth = textureCanvas.width
                const textureCanvasOriginHeight = textureCanvas.height
                const textureCanvasCtx = textureCanvas.getContext('2d')
                const textureCanvasImg = textureCanvasCtx.getImageData(0, 0, textureCanvas.width, textureCanvas.height)
                if (textureCanvasOriginWidth !== textureCanvasOriginHeight) {
                    textureCanvas.width = textureCanvasOriginWidth > textureCanvasOriginHeight ? 64 : 32
                    textureCanvas.height = textureCanvasOriginWidth > textureCanvasOriginHeight ? 32 : 64
                } else {
                    textureCanvas.width = 64
                    textureCanvas.height = 64
                }
                textureCanvasCtx.putImageData(textureCanvasImg, 0, 0)
                // 获取单字大小
                meshItem.geometry.computeBoundingBox()
                const boundingBox = meshItem.geometry.boundingBox
                // 获取单字的贴图
                const texture = new THREE.CanvasTexture(textureCanvas)
                texture.repeat.set(
                    1 / Math.ceil(Math.abs(boundingBox.min.x) + Math.abs(boundingBox.max.x)),
                    1 / Math.ceil(Math.abs(boundingBox.min.y) + Math.abs(boundingBox.max.y))
                )
                // 设置单字的贴图
                meshItem.material[0] = new THREE.MeshBasicMaterial()
                meshItem.material[0].map = texture
            })
        })
    }

    /**
     * 获取渐变色需要的canvas
     */
    getGradientCanvas(pWidth, pHeight, pColorArr, pAngle) {
        // create canvas
        const drawingCanvas = document.createElement('canvas')
        drawingCanvas.width = pWidth
        drawingCanvas.height = pHeight
        const drawingContext = drawingCanvas.getContext('2d')
        // draw background
        let x1, y1, x2, y2
        if (pAngle === 0) {
            x1 = 0
            y1 = 0
            x2 = pWidth
            y2 = 0
        } else if (pAngle === 90) {
            x1 = 0
            y1 = 0
            x2 = 0
            y2 = pHeight
        } else if (pAngle === 180) {
            x1 = pWidth
            y1 = 0
            x2 = 0
            y2 = 0
        } else if (pAngle === 270) {
            x1 = 0
            y1 = pHeight
            x2 = 0
            y2 = 0
        }
        const linearGrad = drawingContext.createLinearGradient(x1, y1, x2, y2)
        linearGrad.addColorStop(0.0, pColorArr[0])
        linearGrad.addColorStop(1.0, pColorArr[1])
        drawingContext.fillStyle = linearGrad
        drawingContext.fillRect(0, 0, pWidth, pHeight)
        return drawingCanvas
    }

    /**
     * 获取canvas指定位置
     */
    cutCanvas(pCanvas, x1, y1, x2, y2) {
        const width = x2 - x1
        const height = y2 - y1
        var canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        var ctx = canvas.getContext('2d')
        ctx.drawImage(pCanvas, x1, y1, width, height, 0, 0, width, height)
        return canvas
    }

    /**
     * 更新贴图
     */
    updateTexture(newProperty) {
        super.updateProperty(newProperty)
        this.$groups.forEach(groupItem => {
            groupItem.group.children.forEach(meshItem => {
                meshItem.material[0] = new THREE.MeshBasicMaterial()
                const cover = threeDUtil.getTextureCover(this.elementJson.property.textTexture.cover, false)
                const loader = new THREE.TextureLoader()
                const texture = loader.load(cover)
                texture.wrapT = THREE.RepeatWrapping
                texture.wrapS = THREE.RepeatWrapping
                texture.center.set(0.5, 0.5)
                meshItem.material[0].map = texture

                const size = (100 - this.elementJson.property.textTexture.size) / 1000
                meshItem.material[0].map.repeat.set(size, size)
                meshItem.material[0].map.offset.set(-this.elementJson.property.textTexture.offsetX / 100, -this.elementJson.property.textTexture.offsetY / 100)
                meshItem.material[1].color = new THREE.Color(this.elementJson.property.textShadowColor)
            })
        })
    }

    /**
     * 更新位置 对齐方式、字间距、行间距
     */
    updatePosition(newProperty) {
        super.updateProperty(newProperty)
        // ---------行高计算---------
        // 中间行的下标索引
        const centerGroupIndex = parseInt(this.$groups.length / 2)
        // 中间行
        const centerGroup = this.$groups[centerGroupIndex]
        if (this.$groups.length % 2 > 0) {
            // 奇数行
            // 更新中间行以上的Y轴坐标
            for (let k = 0; k < centerGroupIndex; k++) {
                const group = this.$groups[k].group
                // 计算间隔高度
                let y = 0
                // 1计算所有间隔行的高度
                for (let o = k + 1; o < centerGroupIndex; o++) {
                    y = y + this.$groups[0].maxGroupHeight
                }
                // 2计算lineHeight的高度
                y = y + (centerGroupIndex - k) * this.elementJson.property.lineHeight
                // 3计算中间行的高度
                y = y + centerGroup.maxGroupHeight / 2
                group.position.setY(y + centerGroup.maxGroupHeightOffset)
            }
            // 更新中间行的Y轴坐标
            centerGroup.group.position.setY(-(centerGroup.maxGroupHeight / 2) + centerGroup.maxGroupHeightOffset)
            // 更新中间行以下的Y轴坐标
            for (let m = this.$groups.length - 1; m > centerGroupIndex; m--) {
                const group = this.$groups[m].group
                // 计算间隔高度
                let y = 0
                // 1计算所有间隔行的高度
                for (let h = m; h > centerGroupIndex; h--) {
                    y = y + this.$groups[h].maxGroupHeight
                }
                // 2计算lineHeight的高度
                y = y + (m - centerGroupIndex) * this.elementJson.property.lineHeight
                // 3计算中间行的高度
                y = y + centerGroup.maxGroupHeight / 2
                // 4计算自己行的高度
                // y = y + this.$groups[this.$groups.length - 1].maxGroupHeight
                group.position.setY(-y + centerGroup.maxGroupHeightOffset)
            }
        } else {
            // 偶数行
            // 更新Y>0部分的Y轴坐标
            for (let k = 0; k < centerGroupIndex; k++) {
                const group = this.$groups[k].group
                // 计算间隔高度
                let y = 0
                // 1计算所有间隔行的高度
                for (let o = k + 1; o < centerGroupIndex; o++) {
                    y = y + this.$groups[o].maxGroupHeight
                }
                // 2计算lineHeight的高度
                y = y + (centerGroupIndex - k) * this.elementJson.property.lineHeight - (this.elementJson.property.lineHeight / 2)
                group.position.setY(y + centerGroup.maxGroupHeightOffset)
            }
            // 更新Y<0部分的Y轴坐标
            for (let m = this.$groups.length - 1; m >= centerGroupIndex; m--) {
                const group = this.$groups[m].group
                // 计算间隔高度
                let y = 0
                // 1计算所有间隔行的高度
                for (let h = m; h >= centerGroupIndex; h--) {
                    y = y + this.$groups[h].maxGroupHeight
                }
                // 2计算lineHeight的高度
                y = y + (m + 1 - centerGroupIndex) * this.elementJson.property.lineHeight - (this.elementJson.property.lineHeight / 2)
                group.position.setY(-y + centerGroup.maxGroupHeightOffset)
            }
        }
        // ---------字间距、对齐方式计算---------
        // 最大的组宽度
        let maxGroupWidth = 0
        this.$groups.forEach(item => {
            maxGroupWidth = maxGroupWidth > item.maxGroupWidth ? maxGroupWidth : item.maxGroupWidth
        })
        if (this.elementJson.property.textAlign === 'left') {
            // 左对齐
            this.$groups.forEach(group => {
                // 遍历每一行
                group.group.children.forEach((mesh, meshIndex) => {
                    // 遍历每一个字符
                    // 初始坐标最左侧
                    let x = -(maxGroupWidth / 2)
                    // 获取该字符的X坐标
                    for (let j = 0; j < meshIndex; j++) {
                        x += group.groupCharSizeArr[j].width
                    }
                    x += meshIndex * this.elementJson.property.letterSpacing
                    mesh.position.setX(x)
                })
            })
        } else if (this.elementJson.property.textAlign === 'center') {
            // 居中对齐
            this.$groups.forEach(group => {
                // 遍历每一行
                group.group.children.forEach((mesh, meshIndex) => {
                    // 遍历每一个字符
                    // 初始坐标最左侧
                    let x = -(group.maxGroupWidth / 2)
                    // 获取该字符的X坐标
                    for (let j = 0; j < meshIndex; j++) {
                        x += group.groupCharSizeArr[j].width
                    }
                    x += meshIndex * this.elementJson.property.letterSpacing
                    mesh.position.setX(x)
                })
            })
        } else if (this.elementJson.property.textAlign === 'right') {
            // 右对齐
            this.$groups.forEach(group => {
                // 遍历每一行
                group.group.children.forEach((mesh, meshIndex) => {
                    // 遍历每一个字符
                    // 初始坐标最左侧
                    let x = maxGroupWidth / 2
                    // 获取该字符的X坐标
                    for (let j = meshIndex; j <= group.group.children.length - 1; j++) {
                        x -= group.groupCharSizeArr[j].width
                    }
                    x -= (group.group.children.length - 1 - meshIndex) * this.elementJson.property.letterSpacing
                    mesh.position.setX(x)
                })
            })
        }
        // ---------Z轴计算---------
        for (let i = 0; i < this.$groups.length; i++) {
            this.$groups[i].group.position.setZ(-this.elementJson.property.textHeight / 2)
        }
    }

    /**
     * 更新尺寸信息
     */
    updateSize() {
        const group = new THREE.Group()
        this.$groups.forEach(groupItem => {
            group.add(groupItem.group.clone())
        })
        // 文字所在立方体
        const box = new THREE.Box3()
        box.expandByObject(group)
        // 文字所在球体
        const sphere = new THREE.Sphere()
        box.getBoundingSphere(sphere)
        // ****************** 这里代码不要删除，调试会用到 ******************
        // 绘制球体
        // const geometrySphere = new THREE.SphereGeometry(sphere.radius, 32, 32)
        // const materialSphere = new THREE.MeshBasicMaterial({ color: 'gray', wireframe: true })
        // const meshSphere = new THREE.Mesh(geometrySphere, materialSphere)
        // geometrySphere.center()
        // this.$scene.add(meshSphere)
        // 绘制矩形
        // const geometryboxWidth = Math.abs(box.min.x) + Math.abs(box.max.x)
        // const geometryboxHeight = Math.abs(box.min.y) + Math.abs(box.max.y)
        // const geometryBox = new THREE.BoxGeometry(geometryboxWidth, geometryboxHeight, this.$textData.height / 2 * 2)
        // const materialBox = new THREE.MeshBasicMaterial({ color: 'red', wireframe: true })
        // const meshBox = new THREE.Mesh(geometryBox, materialBox)
        // geometryBox.center()
        // this.$scene.add(meshBox)
        // ****************** 这里代码不要删除，调试会用到 ******************
        // 计算照相机半角
        const banJiao = Math.asin(sphere.radius / 750) / (Math.PI / 180)
        // 计算圆球的需要显示完全的半径
        const banJin2 = sphere.radius / Math.cos(banJiao * Math.PI / 180)
        // 矩形最大最小点
        const pointMax = JSON.parse(JSON.stringify(box.max))
        const pointMin = JSON.parse(JSON.stringify(box.min))
        pointMax.x = banJin2
        pointMax.y = banJin2
        pointMin.x = -banJin2
        pointMin.y = -banJin2
        // 新建一个照相机计算新文本的大小
        let camera = new THREE.PerspectiveCamera(this.$camera.fov, 1, 0.1, 10000)
        camera.position.set(0, 0, 750)
        this.$renderer.render(this.$scene, camera)
        const rendererSize = this.$renderer.getSize(new THREE.Vector2())
        // 获取球体平面大小
        const boxSizeInfo = threeDUtil.getBoxInfo2(pointMax, pointMin, camera, rendererSize)
        // 宽高里面取最大的值
        const maxSize = Math.max(boxSizeInfo.width, boxSizeInfo.height)
        // 设置renderer的大小
        this.$renderer.setSize(maxSize, maxSize)
        // 设置叫相机的角度
        const fov = banJiao * 2
        this.$camera.fov = fov
        this.$camera.updateProjectionMatrix()
        // 销毁对象
        camera = null
        // 一定要先render 不然后面计算出来的就是错位的
        this.renderThreeD()
        // 更新框的大小
        // 计算3D像素大小
        const boxInfo = threeDUtil.getBoxInfo(this, this.$renderer.getSize(new THREE.Vector2()))
        // 调整canvas的位置
        const maxX2centerX = boxInfo.maxX - boxInfo.centerX
        const minX2centerX = boxInfo.centerX - boxInfo.minX
        const maxY2centerY = boxInfo.maxY - boxInfo.centerY
        const minY2centerY = boxInfo.centerY - boxInfo.minY
        const marginleft = minX2centerX - maxX2centerX
        const marginTop = minY2centerY - maxY2centerY
        // 更新canvas的位置，保证文字不漏到elementBox外面去
        this.$el.querySelector('canvas').css({
            marginLeft: marginleft + 'px',
            marginTop: marginTop + 'px'
        })
        // 更新元素大小
        const css = this.elementJson.css
        const centerPoint = {
            x: parseFloat(css.left) + parseFloat(css.width) / 2,
            y: parseFloat(css.top) + parseFloat(css.height) / 2
        }
        const padding = 10
        this.updateCss({
            left: (centerPoint.x - (boxInfo.width + padding * 2) / 2) + 'px',
            top: (centerPoint.y - (boxInfo.height + padding * 2) / 2) + 'px',
            width: boxInfo.width + padding * 2 + 'px',
            height: boxInfo.height + padding * 2 + 'px',
            overflow: Vue.env.debug3DText ? 'visible' : 'hidden'
        })
        this.updateProperty({
            // 相机位置
            cameraPosition: {
                fov: this.$camera.fov,
                x: this.$camera.position.x,
                y: this.$camera.position.y,
                z: this.$camera.position.z
            },
            // 画布样式
            canvasStyle: {
                // 宽度
                width: this.$renderer.getSize(new THREE.Vector2()).x,
                // 高度
                height: this.$renderer.getSize(new THREE.Vector2()).y,
                // 左边距
                marginLeft: marginleft + 'px',
                // 上边距
                marginTop: marginTop + 'px'
            }
        })
    }

    /**
     * 初始化3D文字
     */
    initThreeD() {
        this.initScene()
        this.initCamera()
        this.initRenderer()
        this.initOrbitControls()
        this.initLights()
        this.initAxesHelper()
    }

    /**
     * 初始化场景
     */
    initScene() {
        if (Vue.env.debug3DText) {
            this.$gui = new GUI()
            this.$stats = new STATS()
            this.$statsDom = this.$stats.domElement
            document.body.appendChild(this.$statsDom)
        }
        this.$scene = new THREE.Scene()
    }

    /**
     * 初始化相机
     */
    initCamera() {
        this.$camera = new THREE.PerspectiveCamera(this.elementJson.property.cameraPosition.fov, 1, 0.1, 10000)
        this.$camera.position.set(
            this.elementJson.property.cameraPosition.x,
            this.elementJson.property.cameraPosition.y,
            this.elementJson.property.cameraPosition.z
        )
    }

    /**
     * 初始化渲染器
     */
    initRenderer() {
        // 创建渲染器
        this.$renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
        // 设置渲染空间的尺寸
        this.$renderer.setSize(this.elementJson.property.canvasStyle.width, this.elementJson.property.canvasStyle.height, false)
        this.$renderer.setPixelRatio(window.devicePixelRatio)
        // 将3D对象添加到dom里面
        this.$text.appendChild(this.$renderer.domElement)
        this.$renderer.domElement.css({
            marginLeft: this.elementJson.property.canvasStyle.marginLeft,
            marginTop: this.elementJson.property.canvasStyle.marginTop
        })
        this.$renderer.domElement.classList.add('text-threed')
        if (Vue.env.debug3DText) {
            this.$renderer.domElement.css({
                border: '1px solid red'
            })
        }
    }

    /**
     * 初始化轨道控制器
     */
    initOrbitControls() {
        // 轨道控制器
        this.$orbitControls = new OrbitControls(this.$camera, this.$renderer.domElement)
        // 启用或禁用摄像机的缩放
        this.$orbitControls.enableZoom = false
        // 启用或禁用键盘控制
        this.$orbitControls.enableKeys = false
        // 启用右键拖拽
        this.$orbitControls.enablePan = false
        // 默认不启用
        this.$orbitControls.enabled = false
    }

    /**
     * 初始化灯光
     */
    initLights() {
        // 顶部灯光
        const topLight = new THREE.DirectionalLight('#ffffff')
        topLight.position.set(0, 500, 0)
        topLight.intensity = 1
        this.$scene.add(topLight)
        // 右侧灯光
        const rightLight = new THREE.DirectionalLight('#ffffff')
        rightLight.position.set(500, 0, 0)
        rightLight.intensity = 0.8
        this.$scene.add(rightLight)
        // 底部灯光
        const bottomLight = new THREE.DirectionalLight('#ffffff')
        bottomLight.position.set(0, -500, 0)
        bottomLight.intensity = 1
        this.$scene.add(bottomLight)
        // 左侧灯光
        const leftLight = new THREE.DirectionalLight('#ffffff')
        leftLight.position.set(-500, 0, 0)
        leftLight.intensity = 0.8
        this.$scene.add(leftLight)
    }

    /**
     * 初始化辅助轴
     */
    initAxesHelper() {
        // 辅助轴
        this.$axesHelper = new THREE.AxesHelper(300)
        this.$axesHelper.visible = false
        this.$scene.add(this.$axesHelper)
    }

    /**
     * 场景渲染
     */
    renderThreeD() {
        // 渲染方法(循环渲染)
        const renderCycle = () => {
            this.$requestId = requestAnimationFrame(renderCycle)
            if (this.$scene !== null) {
                if (Vue.env.debug3DText) {
                    this.$stats.update()
                }
                this.$orbitControls.update()
                this.$renderer.render(this.$scene, this.$camera)
            } else {
                cancelAnimationFrame(this.$requestId)
            }
        }
        // 调用渲染方法
        renderCycle()
    }

    /**
     * 清除所有对象
     */
    clearText() {
        if (this.$groups && this.$groups.length > 0) {
            this.$groups.forEach(groupItem => {
                groupItem.group.children.forEach(meshItem => {
                    meshItem.geometry.dispose()
                    meshItem.geometry = null
                    meshItem.material[0].dispose()
                    meshItem.material[0] = null
                    meshItem.material[1].dispose()
                    meshItem.material[1] = null
                })
                this.$scene.remove(groupItem.group)
                groupItem.group = null
            })
        }
        this.$groups = []

        let meshArr = []
        this.$scene.children.forEach(item => {
            if (item.type === 'Mesh') {
                item.geometry.dispose()
                item.geometry = null
                item.material.dispose()
                item.material = null
                meshArr.push(item)
            }
        })
        meshArr.forEach(item => {
            this.$scene.remove(item)
            item = null
        })
        meshArr = null

        this.renderThreeD()
    }

    /**
     * dispose
     */
    dispose() {
        this.clearText()
        this.$renderer.dispose()
        this.$renderer = null
        this.$scene.dispose()
        this.$scene = null
        this.$orbitControls.dispose()
        this.$orbitControls = null
        this.$axesHelper = null
        this.$camera = null
        this.$textData = null
        this.$generateGeometryFun = null
        this.$groups = null
        if (Vue.env.debug3DText) {
            this.$gui = null
            this.$stats = null
            this.$statsDom.remove()
            this.$statsDom = null
        }
        cancelAnimationFrame(this.$requestId)
    }

    /**
     * 获取文本组合对象
     */
    getTextGroups(data, font) {
        return new Promise((resolve, reject) => {
            const property = this.elementJson.property
            const loadTexturePromise = new Promise((resolve, reject) => {
                if (property.textStyleType === textThreeDTextStyle.texture) {
                    const cover = threeDUtil.getTextureCover(property.textTexture.cover, false)
                    const loader = new THREE.TextureLoader()
                    loader.load(cover, (texture) => {
                        texture.wrapT = THREE.RepeatWrapping
                        texture.wrapS = THREE.RepeatWrapping
                        texture.center.set(0.5, 0.5)
                        const size = (100 - property.textTexture.size) / 1000
                        texture.repeat.set(size, size)
                        resolve(texture)
                    })
                } else {
                    resolve(null)
                }
            })
            loadTexturePromise.then((texture) => {
                const groups = []
                // 获取一共有多少行
                const rows = data.text.split('\n')
                for (let i = 0; i < rows.length; i++) {
                    const rowStr = rows[i].trim()
                    const group = new THREE.Group()
                    let maxGroupHeight = 0
                    let maxGroupHeightOffset = 0
                    const groupCharSizeArr = []
                    for (let j = 0; j < rowStr.length; j++) {
                        const char = rowStr[j]
                        // 文字对象
                        const geometry = new THREE.TextGeometry(char, {
                            font: font, // THREE.Font的实例
                            size: data.size, // Float。字体大小，默认值为100
                            height: data.height, // 挤出文本的厚度。默认值为50
                            curveSegments: data.curveSegments, // （表示文本的）曲线上点的数量。默认值为12
                            bevelEnabled: (data.bevelSize === 0 && data.bevelOffset === 0) ? false : data.bevelEnabled, // 是否开启斜角，默认为false
                            bevelThickness: data.bevelThickness, // 文本上斜角的深度，默认值为20
                            bevelSize: data.bevelSize, // 斜角与原始文本轮廓之间的延伸距离。默认值为8
                            bevelOffset: data.bevelOffset, // 斜角偏移量
                            bevelSegments: data.bevelSegments // 斜角的分段数。默认值为3
                        })
                        // 文字材质
                        let meshMaterial = null
                        if (property.textStyleType === textThreeDTextStyle.color) {
                            // 纯色
                            meshMaterial = new THREE.MeshBasicMaterial({
                                color: property.textColor
                            })
                        } else if (property.textStyleType === textThreeDTextStyle.gradient) {
                            // 渐变整体更新
                        } else if (property.textStyleType === textThreeDTextStyle.texture) {
                            // 贴图
                            meshMaterial = new THREE.MeshBasicMaterial({
                                map: texture
                            })
                        }
                        // 其挤压出的侧面材质
                        const meshMaterial2 = new THREE.MeshPhongMaterial({
                            color: property.textShadowColor
                        })
                        geometry.computeBoundingBox()
                        const boundingBox = geometry.boundingBox

                        // 单个字符的宽高
                        const charSize = {
                            width: Math.abs(boundingBox.min.x) + Math.abs(boundingBox.max.x),
                            height: Math.abs(boundingBox.min.y) + Math.abs(boundingBox.max.y)
                        }
                        // 将单个字符的宽高信息添加到该行的数组里面
                        groupCharSizeArr.push(charSize)

                        const height = Math.abs(boundingBox.min.y) + Math.abs(boundingBox.max.y)
                        maxGroupHeight = maxGroupHeight > height ? maxGroupHeight : height
                        maxGroupHeightOffset = maxGroupHeightOffset > Math.abs(boundingBox.min.y) ? maxGroupHeightOffset : Math.abs(boundingBox.min.y)
                        const mesh = new THREE.Mesh(geometry, [meshMaterial, meshMaterial2])
                        mesh.castShadow = true // 对象是否被渲染到阴影贴图中。默认值为false。
                        mesh.receiveShadow = true // 材质是否接收阴影。默认值为false。
                        group.add(mesh)
                    }
                    // 计算该行总宽度
                    let maxGroupWidth = 0
                    groupCharSizeArr.forEach(item => {
                        maxGroupWidth += item.width
                    })
                    maxGroupWidth += (groupCharSizeArr.length - 1) * data.letterSpacing
                    groups.push({
                        group, // 当前行
                        groupCharSizeArr, // 该行每个字符的宽高信息
                        maxGroupWidth, // 该行最大宽度
                        maxGroupHeight, // 该行最大的高度
                        maxGroupHeightOffset // 该行向下的默认偏移量Y轴，不知道为什么中文会向下偏移，计算位置的是时候加回去
                    })
                }
                resolve(groups)
            })
        })
    }

    /**
     * 绘制文字
     */
    drawText() {
        const _self = this
        const data = this.$textData = {
            text: this.elementJson.property.textContent,
            size: this.elementJson.property.textFontSize,
            height: this.elementJson.property.textHeight,
            curveSegments: this.elementJson.property.textCurveSegments,
            font: this.elementJson.property.textFont.src,
            bevelEnabled: true,
            bevelThickness: this.elementJson.property.bevelThickness,
            bevelSize: this.elementJson.property.bevelSize,
            bevelSegments: this.elementJson.property.bevelSegments,
            bevelOffset: this.elementJson.property.bevelOffset,
            letterSpacing: this.elementJson.property.letterSpacing, // 字间距
            lineHeight: this.elementJson.property.lineHeight, // 行间距
            textAlign: this.elementJson.property.textAlign // 对齐方式
        }
        const generateGeometry = this.$generateGeometryFun = () => {
            const fontUrl = `${Vue.env.host.file}${this.$textData.font}`
            this.getFont(fontUrl).then(font => {
                if (_self.$groups !== null) {
                    // 销毁老的文本对象
                    _self.clearText()
                }
                _self.getTextGroups(data, font).then((res) => {
                    const groups = this.$groups = res
                    // 更新位置信息
                    _self.updatePosition(_self.elementJson.property)
                    if (_self.elementJson.property.textStyleType === textThreeDTextStyle.gradient) {
                        // 渐变
                        _self.updateGradient()
                    }
                    // 将所有组全部添加到场景中
                    groups.forEach(groupItem => {
                        // 添加到场景
                        _self.$scene.add(groupItem.group)
                    })
                    // 更新尺寸信息
                    _self.updateSize()
                    // 场景渲染
                    _self.renderThreeD()
                    // 移除loading...
                    _self.removeLoading()
                    // 渲染完成添加class
                    _self.$el.classList.add('h2-core-check-ele')
                    // 更新组合框大小
                    _self.combineBox && combineInitor.reCalculateCombineBox(_self.combineBox)
                })
            })
        }
        generateGeometry()
    }

    /**
     * 获取字体文件
     * @param {字体URL}} fontUrl
     */
    getFont(fontUrl) {
        return new Promise((resolve, reject) => {
            // TODO 这里需要缓存字体
            // 字体加载器
            const loader = new THREE.FontLoader()
            // 加载字体
            loader.load(fontUrl, function (font) {
                resolve(font)
            })
        })
    }
}
