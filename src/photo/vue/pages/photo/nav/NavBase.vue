<template>
    <div class="eqc-photo-nav-base">
        <ul class="module">
            <li>
                <div
                    ref="title"
                    class="title"
                    @click="titleClick"
                >
                    基础调整
                    <i class="eqf-down arrow" />
                </div>
                <div
                    data-height="494"
                    class="content"
                >
                    <div class="setting">
                        <normal-drag-line
                            v-for="(option,i) in baseOptions"
                            :key="i"
                            :option="option"
                        />
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import NormalDragLine from '../../../comps/NormalDragLine.vue'
import '../../../../../utils/glfx'
import baseConfig from '../../../config/baseConfig'
import historyType from '../../../../../config/enum.photoHistory.type'

export default {
    components: {
        NormalDragLine
    },
    data() {
        return {
            historyType,
            baseConfig,
            glCanvas: null,
            texture: null, // 当前执行的材质
            firstAddHistory: true, // 是不是第一次添加历史
            currentImgData: null,
            baseOptions: [
                {
                    type: 1,
                    name: '亮度',
                    key: 'brightness'
                },
                {
                    type: 1,
                    name: '对比度',
                    key: 'contrast'
                },
                {
                    type: 1,
                    name: '饱和度',
                    key: 'saturation'
                },
                {
                    type: 1,
                    name: '锐度/清晰度',
                    key: 'unsharpMask'
                },
                {
                    type: 1,
                    name: '亮丽度',
                    key: 'vibrance'
                },
                {
                    type: 1,
                    name: '褐色',
                    key: 'sepia'
                },
                {
                    type: 1,
                    name: '色调',
                    key: 'hue'
                },
                {
                    type: 1,
                    name: '模糊',
                    key: 'triangleBlur'
                },
                {
                    type: 1,
                    name: '噪音',
                    key: 'noise'
                },
                {
                    type: 1,
                    name: '降噪',
                    key: 'denoise'
                }
            ],
            colorOptions: [
                {
                    type: 2,
                    name: '色相',
                    key: 'colorChange',
                    valKey: 'parameter',
                    css: {
                        background: 'linear-gradient(90deg,rgba(255,0,0,1) 0%,rgba(255,229,0,1) 14%,rgba(45,246,41,1) 27%,rgba(93,220,236,1) 40%,rgba(0,99,255,1) 53%,rgba(51,3,255,1) 66%,rgba(172,0,255,1) 77%,rgba(255,34,218,1) 89%,rgba(255,0,0,1) 100%)'
                    },
                    colorConfig: [
                        { r: 255, g: 0, b: 0, percent: 0 },
                        { r: 255, g: 229, b: 0, percent: 14 },
                        { r: 45, g: 246, b: 41, percent: 27 },
                        { r: 93, g: 220, b: 236, percent: 40 },
                        { r: 0, g: 99, b: 255, percent: 53 },
                        { r: 51, g: 3, b: 255, percent: 66 },
                        { r: 172, g: 0, b: 255, percent: 77 },
                        { r: 255, g: 34, b: 218, percent: 89 },
                        { r: 255, g: 0, b: 0, percent: 100 }
                    ]
                },
                {
                    type: 1,
                    name: '红色1',
                    key: 'red1'
                },
                {
                    type: 1,
                    name: '红色2',
                    key: 'red2'
                },
                {
                    type: 1,
                    name: '红色3',
                    key: 'red3'
                },
                {
                    type: 1,
                    name: '红色4',
                    key: 'red4'
                },
                {
                    type: 1,
                    name: '绿色1',
                    key: 'green1'
                },
                {
                    type: 1,
                    name: '绿色2',
                    key: 'green2'
                },
                {
                    type: 1,
                    name: '绿色3',
                    key: 'green3'
                },
                {
                    type: 1,
                    name: '绿色4',
                    key: 'green4'
                }
            ],
            effectOptions: [
                {
                    type: 1,
                    name: '梦幻醉',
                    key: 'lensBlur'
                },
                {
                    type: 1,
                    name: '山水画',
                    key: 'ink'
                }
            ]
        }
    },
    computed: {
        photoBase() {
            return Vue.store.state.photoBase.base
        },
        isHistory() {
            return Vue.store.state.photoBase.isHistory
        },
        parameter() {
            return Vue.store.state.photoBase.parameter
        },
        currentChangeStyle() {
            return Vue.store.state.photoBase.currentChangeStyle
        },
        singleStyleChangeCount() {
            return Vue.store.state.photoBase.singleStyleChangeCount
        },
        dragState() {
            return Vue.store.state.photoBase.dragState
        },
        selectType() {
            return Vue.store.state.photoLayout.nav.selectedItem.type
        },
        photoScene() {
            return Vue.store.state.photoScene
        },
        eqxPage() {
            return this.photoScene.eqxPage
        },
        originImage() {
            return this.photoScene.originImage
        },
        originImageShot() {
            return this.photoScene.originImageShot
        },
        isBackToOriginState() {
            return Vue.store.state.photoBase.isBackToOriginState
        },
        currentImgObjStore() {
            return Vue.store.state.photoBase.currentImgObj
        },
        originImageShotSize() {
            return Vue.store.state.photoScene.originImageShotSize
        },
        isSuper() {
            // 判断是不是超级权限
            return Vue.user.allow('fullImageBaseRights')
        },
        photoHistory() { // 历史记录
            return Vue.store.state.photoHistory
        },
        isHistoryChangeNav() {
            return this.photoScene.isHistoryChangeNav
        },
        currentImgSize() {
            return Vue.store.state.photoBase.currentImgSize
        }
    },
    watch: {
        // 监听selecttype 做一些初始化的活
        selectType(newVal, oldVal) {
            // 只要tab把webglcanvas的内容绘制到rendering2d的canvas上 然后隐藏webglcanvas
            const rendering2dCanvas = document.getElementsByClassName('eqc-photo-background-image')[0]
            // 从base 切走的时候，要把当前的效果绘制到rendering2dCanvas上
            if (oldVal === 'base') {
                const ctx = rendering2dCanvas.getContext('2d')
                ctx.drawImage(this.glCanvas, 0, 0)
            }
            if (newVal === 'base') {
                // 再次进入 更新是不是第一次添加历史
                this.firstAddHistory = true
                if (this.glCanvas) {
                    // 打开webglcanvas 关闭rendering2d的canvas
                    if (this.isHistoryChangeNav) {
                        // 历史回退
                        rendering2dCanvas.style.display = 'none'
                        this.glCanvas.style.display = 'block'
                    } else {
                        // 用户手动切换
                        this.updateMainCanvasAndTexture(rendering2dCanvas.toDataURL(), rendering2dCanvas.width, rendering2dCanvas.height).then(() => {
                            rendering2dCanvas.style.display = 'none'
                            this.glCanvas.style.display = 'block'
                        })
                        Vue.store.commit('PHOTO_BASE_CLEAR_ALL_CONFIG')
                    }
                } else {
                    this.initCanvas()
                }
            }
            // 当切到旋转和裁切时 打开rendering2d的canvas 关闭wengl的canvas
            if (newVal === 'crop' || newVal === 'rotate') {
                this.glCanvas.style.display = 'none'
                rendering2dCanvas.style.display = 'block'
            }
        },
        // 监听源图改变
        originImageShot(newVal, oldVal) {
            // 第一次进来不用复位  只有重新上传才会
            this.firstAddHistory = true
            // 原图改变 改变webgl的canvas
            if (this.glCanvas) {
                Vue.store.commit('PHOTO_BASE_BACK_TO_ORIGIN')
            } else {
                this.initCanvas()
            }
            // 原图改变  改变rendering2d的canvas
            const img = new Image()
            img.src = newVal
            const rendering2dCanvas = document.getElementsByClassName('eqc-photo-background-image')[0]
            const ctx = rendering2dCanvas.getContext('2d')
            img.onload = function () {
                ctx.drawImage(img, 0, 0)
            }
            this.$refs.title.click()
        },
        // 监听图片参数的变化
        singleStyleChangeCount() {
            this.setHistoryAcrossGroup() // 添加组间历史
            this.renderCanvasBySingleStyle()
            if (!this.dragState) {
                this.setHistoryInGroup() // 添加组内历史 这个添加历史是给点击和双击复位添加历史记录的
            }
        },
        // 监听拖拽状态
        dragState(newVal) {
            // 拖动完毕之后 加history
            if (!newVal && this.selectType === 'base') {
                // 更改背景 和历史记录
                this.setHistoryInGroup() // 给拖拽添加历史记录
            }
        },
        // 监听是否回到原图
        isBackToOriginState(newVal) {
            this.firstAddHistory = true
            this.updateMainCanvasAndTexture(this.originImageShot)
        },
        // 监听底图是否改变  便于回退
        currentImgObjStore: {
            handler(newVal, oldVal) {
                const width = newVal.size.width
                const height = newVal.size.height
                this.updateMainCanvasAndTexture(newVal.src, width, height).then(() => {
                    Vue.store.commit('PHOTO_SCENE_SIZE_CHANGE', { width, height })
                    const $elWorkspace = this.eqxPage.$el.parentElement
                    this.eqxPage.setScale('fit', $elWorkspace.offsetWidth, $elWorkspace.offsetHeight)
                    this.setBackground()
                })
            },
            deep: true
        }
    },
    mounted() {
        this.$refs.title.click()
    },
    methods: {
        // 设置背景
        setBackground() {
            const background = {
                src: this.glCanvas.toDataURL(),
                width: this.glCanvas.width,
                height: this.glCanvas.height
            }
            this.eqxPage.eqxBackground.setBackground(background)
        },
        // 组内历史 不要快照 只要配置参数  如果是回退的则不添加历史
        setHistoryInGroup() {
            // 添加到background 不添加下载的时候不生效
            if (!this.isHistory && !this.isHistoryChangeNav) {
                const operating = JSON.parse(JSON.stringify(this.photoBase))
                const config = {
                    operating,
                    width: this.glCanvas.width,
                    height: this.glCanvas.height
                }
                this.photoHistory.history.insert(config, this.currentImgData, this.historyType.base, true)
            }
        },
        // 组间历史 需要快照 对于旋转而言不要参数
        setHistoryAcrossGroup() {
            if (this.firstAddHistory && !this.isHistoryChangeNav) {
                this.firstAddHistory = false
                this.currentImgData = this.glCanvas.toDataURL()
            }
        },
        // 更新主画布和纹理
        updateMainCanvasAndTexture(base64Data, width, height) {
            return new Promise((resolve, reject) => {
                const imgNode = new Image()
                imgNode.src = base64Data
                const that = this
                imgNode.onload = function () {
                    // 有则更新 无则新建
                    if (that.texture) {
                        that.texture.loadContentsOf(imgNode)
                    } else {
                        that.texture = that.glCanvas.texture(imgNode)
                    }
                    that.glCanvas.draw(that.texture).update()
                    resolve()
                }
            })
        },
        // 检测参数是不是都为0  也就是是否还原
        checkIsBackToOrigin() {
            let pass = true
            for (const key in this.photoBase) {
                const val = this.photoBase[key].val
                if (val !== 0) {
                    pass = false
                }
            }
            // true 就是全部都还原了  false 没有
            return pass
        },
        // 初始化canvas
        initCanvas() {
            Vue.loading.open('图片加载中')
            setTimeout(() => {
                // 确保初始化成功
                this.glCanvas = window.fx.canvas()
                const parentNode = document.getElementsByClassName('eqc-photo-background')[0]
                const canvasNode = document.getElementsByClassName('eqc-photo-background-image')[0]
                const img = new Image()
                img.crossOrigin = 'anonymous'
                img.src = canvasNode.toDataURL()
                img.onload = () => {
                    this.texture = this.glCanvas.texture(img)
                    this.glCanvas.draw(this.texture).update()
                    // 新增webgl canvas 隐藏之前的rendering2d的canvas
                    this.glCanvas.classList.add('eqc-photo-background-image-webgl')
                    this.glCanvas.style.cssText = canvasNode.style.cssText
                    parentNode.appendChild(this.glCanvas)
                    canvasNode.style.display = 'none'
                    Vue.loading.close()
                }
            }, 40)
        },
        // 获取key的百分比
        getVal(key) {
            let range = 1
            if (!this.isSuper && this.baseConfig[key]) {
                range = this.baseConfig[key][1] / 100
            }
            return this.photoBase[key].val / 100 * range
        },
        // 测试选中的imgNode 对不对
        testImgNode(imgNode) {
            const $tempDiv2 = document.createElement('div')
            document.body.appendChild($tempDiv2)
            $tempDiv2.css({
                position: 'fixed',
                top: 0,
                left: 500,
                width: this.glCanvas.width + 'px',
                height: this.glCanvas.height + 'px',
                zIndex: 1000 // 避免盖在当前页面上
            })
            $tempDiv2.append(imgNode)
        },
        // 生成渲染代码
        generateCode() {
            const excute = this.glCanvas.draw(this.texture)
            const get = this.getVal

            // 判断 亮度和 对比度 范围：-1 - 1
            if (get('contrast') !== 0 || get('brightness') !== 0) {
                excute.brightnessContrast(get('brightness'), get('contrast'))
            }
            // 判断 色调和饱和度 范围：-1 - 1
            if (get('hue') !== 0 || get('saturation') !== 0) {
                excute.hueSaturation(get('hue'), get('saturation'))
            }
            // 判断噪音 范围： 0 - 1
            if (get('noise') !== 0) {
                excute.noise(get('noise'))
            }
            // 判断褐色 范围：0 - 1
            if (get('sepia') !== 0) {
                excute.sepia(get('sepia'))
            }
            // 判断亮丽度 范围： -1 - 1
            if (get('vibrance') !== 0) {
                excute.vibrance(get('vibrance'))
            }
            // 判断暗角 范围： 0 - 1  size amount
            if (get('vignette') !== 0) {
                excute.vignette(0.35, get('vignette'))
            }
            // 判断降噪 范围： 0 - 50  size amount
            if (get('denoise') !== 0) {
                excute.denoise(get('denoise') * 50)
            }
            // 判断锐利 范围： 半径0 - 200  强度 0 - 5
            if (get('unsharpMask') !== 0) {
                excute.unsharpMask(30, get('unsharpMask') * 5)
            }
            // 判断模糊 范围： 0 - 30
            if (get('triangleBlur') !== 0) {
                excute.triangleBlur(get('triangleBlur') * 30)
            }
            // 判断梦幻醉 范围 0 - 50 三个参数：radius brightness angle
            if (get('lensBlur') !== 0) {
                excute.lensBlur(get('lensBlur') * 50, 1, 0.5)
            }
            // 判断梦幻醉 范围 0 - 1
            if (get('ink') !== 0) {
                excute.ink(get('ink'))
            }

            excute.update()
            this.setBackground()
        },
        // 渲染canvas
        renderCanvasBySingleStyle() {
            setTimeout(() => {
                if (this.checkIsBackToOrigin()) {
                    // 恢复到原图
                    this.glCanvas.draw(this.texture).update()
                } else {
                    this.generateCode()
                }
            })
        },
        // 点击标题
        titleClick() {
            // 右侧箭头
            const arrowDom = event.currentTarget.querySelector('i.arrow')
            // 更换右侧箭头样式
            const arrowClassName = arrowDom.className
            const contentDom = event.currentTarget.nextElementSibling
            if (arrowClassName.indexOf('eqf-down') >= 0) {
                arrowDom.className = 'eqf-right arrow'
                contentDom.style.height = parseInt(contentDom.attr('data-height')) + 'px'
            } else {
                arrowDom.className = 'eqf-down arrow'
                contentDom.style.height = '0px'
            }
        }
    }
}
</script>

<style lang="scss">
.eqc-photo-nav-base {
    ul {
        list-style: none;
        font-size: 14px;
        font-weight: 500;
        color: rgba(29, 32, 37, 1);
        line-height: 60px;
        overflow: auto;
        li {
            height: auto;
            border-bottom: 1px solid rgba(230, 233, 236, 1);
            .title {
                height: 60px;
                padding-left: 24px;
                font-weight: bold;
                cursor: pointer;
                i.arrow {
                    font-size: 20px;
                    color: #4f5d69;
                    position: relative;
                    float: right;
                    right: 20px;
                    top: 20px;
                }
                &:hover {
                    background: #f7f8f9;
                }
            }
            .content {
                height: 0px;
                transition: all 0.3s;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                .setting {
                    flex: 1;
                    padding: 0 24px;
                }
            }
        }
    }
}
</style>
