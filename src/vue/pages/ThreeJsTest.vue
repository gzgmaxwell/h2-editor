<template>
    <div class="three-container">
        <!-- <label style="font-size:80px;">双击编辑文字</label> -->
        <div id="three" />
    </div>
</template>

<script>

import * as THREE from 'three'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default {
    data() {
        return {
            stats: null,
            gui: null,
            scene: null,
            camera: null,
            renderer: null,
            orbitControls: null,
            sceneWidth: 800 || this.sceneWidth,
            sceneHeight: 800 || window.innerHeight
        }
    },
    mounted() {
        // 初始化
        this.init()
        // 添加文字对象
        this.drawText()
        // 场景渲染
        this.render()
    },
    methods: {
        init() {
            this.gui = new GUI()
            this.initScene()
            this.initCamera()
            this.initRenderer()
            this.initOrbitControls()
            this.initLights()
            this.initAxesHelper()
        },
        // 初始化场景
        initScene() {
            this.scene = new THREE.Scene()
        },
        // 初始化相机
        initCamera() {
            this.camera = new THREE.PerspectiveCamera(45, this.sceneWidth / this.sceneHeight, 0.1, 10000)
            this.camera.position.set(0, 0, 1350)
        },
        // 初始化渲染器
        initRenderer() {
            // 创建渲染器
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
            // 设置渲染空间的尺寸
            this.renderer.setSize(this.sceneWidth, this.sceneHeight)
            this.renderer.setPixelRatio(window.devicePixelRatio)
            // 将3D对象添加到dom里面
            document.querySelector('#three').appendChild(this.renderer.domElement)
        },
        // 初始化轨道控制器
        initOrbitControls() {
            // 轨道控制器
            this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement)
            // 启用或禁用摄像机的缩放
            // this.orbitControls.enableZoom = false
            // 启用或禁用键盘控制
            this.orbitControls.enableKeys = false
            // 启用右键拖拽
            this.orbitControls.enablePan = false
            // // 够水平旋转的角度的上限，范围是-Math.PI到Math.PI（或Infinity无限制）， 其默认值为Infinity
            // this.orbitControls.maxPolarAngle = 2.8
            // // 能够垂直旋转的角度的下限，范围是0到Math.PI，其默认值为0。
            // this.orbitControls.minPolarAngle = 0.4
        },
        // 初始化灯光
        initLights() {
            this.scene.add(new THREE.AmbientLight('#ffffff'))
        },
        // 初始化辅助轴
        initAxesHelper() {
            // 辅助轴
            // 轴辅助 （每一个轴的长度）
            const axesHelper = new THREE.AxesHelper(300)
            this.scene.add(axesHelper)
        },
        // 场景渲染
        render() {
            // 渲染方法(循环渲染)
            const render = () => {
                requestAnimationFrame(render)
                this.orbitControls.update()
                this.renderer.render(this.scene, this.camera)
            }
            // 调用渲染方法
            render()
        },
        // 添加文字对象
        drawText() {
            const group = new THREE.Group()
            const geometry = new THREE.BufferGeometry()
            geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3))

            // create canvas and context
            var drawingCanvas = document.createElement('canvas')
            drawingCanvas.width = 64
            drawingCanvas.height = 64
            var drawingContext = drawingCanvas.getContext('2d')
            // draw background
            var linearGrad = drawingContext.createLinearGradient(0, 32, 64, 32)
            linearGrad.addColorStop(0.0, '#ff0000')
            linearGrad.addColorStop(1.0, '#0000ff')
            drawingContext.fillStyle = linearGrad
            drawingContext.fillRect(0, 0, 64, 64)
            // set canvas as material.map (this could be done to any map, bump, displacement etc.)
            var texture = new THREE.CanvasTexture(drawingCanvas)
            // texture.wrapT = THREE.RepeatWrapping
            // texture.wrapS = THREE.RepeatWrapping
            // texture.repeat.set(1 / 663.760009765625, 1 / 108.4800033569336)

            const meshMaterial = new THREE.MeshBasicMaterial({
                // color: '#00ff00',
                map: texture
            })
            // 文字材质 第二个材质则将用于其挤压出的侧面
            const meshMaterial2 = new THREE.MeshBasicMaterial({
                color: '#000000'
            })

            group.add(new THREE.Mesh(geometry, [meshMaterial, meshMaterial2]))
            this.textGeometry(group)
            // 场景添加
            this.scene.add(group)
        },
        // 文本对象
        textGeometry(mesh) {
            const data = {
                text: '双击进行编辑',
                size: 80,
                height: 50,
                curveSegments: 12,
                font: 'Microsoft YaHei',
                weight: 'Regular', // Bold
                bevelEnabled: false,
                bevelThickness: 1,
                bevelSize: 0.5,
                bevelOffset: 0.0,
                bevelSegments: 3
            }

            const generateGeometry = () => {
                // 字体加载器
                const loader = new THREE.FontLoader()
                // 加载字体
                loader.load(`http://127.0.0.1:82/json/${data.font}_${data.weight}.json`, function (font) {
                    let geometry = new THREE.TextGeometry(data.text, {
                        font: font, // THREE.Font的实例
                        size: data.size, // Float。字体大小，默认值为100
                        height: data.height, // 挤出文本的厚度。默认值为50
                        curveSegments: data.curveSegments, // （表示文本的）曲线上点的数量。默认值为12
                        bevelEnabled: data.bevelEnabled, // 是否开启斜角，默认为false
                        bevelThickness: data.bevelThickness, // 文本上斜角的深度，默认值为20
                        bevelSize: data.bevelSize, // 斜角与原始文本轮廓之间的延伸距离。默认值为8
                        bevelOffset: data.bevelOffset, // 斜角偏移量
                        bevelSegments: data.bevelSegments // 斜角的分段数。默认值为3
                    })
                    // 3D对象居中
                    geometry.center()
                    if (geometry.isGeometry) {
                        geometry = new THREE.BufferGeometry().fromGeometry(geometry)
                    }
                    mesh.children[0].geometry.dispose()
                    mesh.children[0].geometry = geometry

                    geometry.computeBoundingBox()
                    const boundingBox = geometry.boundingBox
                    mesh.children[0].material[0].map.repeat.set(1 / (boundingBox.max.x * 2), 1 / (boundingBox.max.y * 2))
                })
            }

            // const folder = this.gui.addFolder('THREE.TextGeometry')
            // folder.add(data, 'text').onChange(generateGeometry)
            // folder.add(data, 'size', 1, 30).onChange(generateGeometry)
            // folder.add(data, 'height', 1, 20).onChange(generateGeometry)
            // folder.add(data, 'curveSegments', 1, 20).step(1).onChange(generateGeometry)
            // folder.add(data, 'font', fonts).onChange(generateGeometry)
            // folder.add(data, 'weight', weights).onChange(generateGeometry)
            // folder.add(data, 'bevelEnabled').onChange(generateGeometry)
            // folder.add(data, 'bevelThickness', 0.1, 3).onChange(generateGeometry)
            // folder.add(data, 'bevelSize', 0, 3).onChange(generateGeometry)
            // folder.add(data, 'bevelOffset', -0.5, 1.5).onChange(generateGeometry)
            // folder.add(data, 'bevelSegments', 0, 8).step(1).onChange(generateGeometry)

            generateGeometry()
        }
    }
}
</script>

<style lang="scss">
.three-container {
    display: flex;
    align-items: center;
    justify-content: center;
    canvas {
        border: 1px solid red;
    }
}
</style>
