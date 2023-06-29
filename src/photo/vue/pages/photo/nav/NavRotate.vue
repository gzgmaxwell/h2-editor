<template>
    <div class="eqc-photo-rotate">
        <div class="title">
            <span>旋转与翻转</span>
        </div>
        <div class="item-content">
            <span
                v-for="(item,index) in effectArr"
                :key="index"
                :class="{active:config.currentRotateType===index+1}"
                class="item flex-center"
                @click="rotateClick(item.code)"
            >
                <i :class="item.icon" />
            </span>
        </div>
        <normal-drag-line
            v-for="(option,i) in rotateOptions"
            :key="i"
            :option="option"
        />
    </div>
</template>

<script>
import NormalDragLine from '../../../comps/NormalDragLine.vue'
import dom2canvas from '../../../../../utils/dom2canvas'
import historyType from '../../../../../config/enum.photoHistory.type'
export default {
    components: {
        NormalDragLine
    },
    data() {
        return {
            historyType,
            $canvas: null, // 该canvas的
            $canvasWrapper: null, //
            config: {
                width: 0, // 保存第一次进入图的宽高
                height: 0,
                currentRotateType: -1, // 记录当前旋转的type 便于高亮显示UI
                rotateAngle: 0, // 左翻 右翻
                rotateXAngle: 0, // 上下翻
                rotateYAngle: 0, // 左右翻
                dragAngle: 0, // 拖拽的旋转角度
                scaleSize: 1 // 放大比例
            },

            isDrag: false, // 记录上次操作是不是拖拽
            $layer: null, // 校准线的节点
            rotateOptions: [{
                type: 4, // type 4 的节点都是rotate的
                name: '校正',
                key: 'revise',
                maxNum: 45, // 最大能到90度
                isSingle: false // 单向还是双向 比如：false 就是 -90 - 90  true 就是 0 - 90
            }],
            effectArr: [
                { code: 1, icon: 'eqf-rotate-cw' },
                { code: 2, icon: 'eqf-rotate-ccw' },
                { code: 3, icon: 'eqf-flipshuiping' },
                { code: 4, icon: 'eqf-flipchuizhi' }
            ]
        }
    },
    computed: {
        selectType() {
            return Vue.store.state.photoLayout.nav.selectedItem.type
        },
        photoScene() {
            return Vue.store.state.photoScene
        },
        photoRotate() {
            return Vue.store.state.photoRotate
        },
        eqxPage() {
            return this.photoScene.eqxPage
        },
        reviseNum() {
            return this.photoRotate.revise.val
        },
        dragState() {
            return Vue.store.state.photoBase.dragState
        },
        scale() {
            return this.photoScene.eqxPage.scale
        },
        originImageShot() {
            return this.photoScene.originImageShot
        },
        executeGenerateImg() {
            return this.photoRotate.executeGenerateImg
        },
        photoHistory() { // 历史记录
            return Vue.store.state.photoHistory
        },
        rotateConfig() {
            // 根据历史记录来执行回退
            return this.photoRotate.rotateConfig
        },
        isBackToOriginState() {
            return this.photoRotate.isBackToOriginState
        },
        isHistoryChangeNav() {
            return this.photoScene.isHistoryChangeNav
        },
        firstShot() {
            return this.photoRotate.firstShot
        },
        allEqxElements() {
            return this.photoScene.eqxScene.eqxPages[0].eqxElements
        }
    },
    watch: {
        // 监听旋转配置 回退时更改配置 触发旋转
        rotateConfig(newConfig) {
            // 当历史记录触发回调时，重新render
            if (newConfig && this.selectType === 'rotate') {
                this.getNewCanvasByBase64(newConfig.width, newConfig.height).then(() => {
                    this.config = newConfig
                    this.$canvasWrapper.style.transform = `rotate(${this.config.rotateAngle}deg) rotateX(${this.config.rotateXAngle}deg) rotateY(${this.config.rotateYAngle}deg)`
                    //  更新scene 来适配旋转之后canvas
                    if ([1, 2].includes(this.config.currentRotateType)) {
                        const $elWorkspace = this.eqxPage.$el.parentElement
                        if ([-270, -90, 90, 270].includes(this.config.rotateAngle)) {
                            this.eqxPage.setScale('fit', $elWorkspace.offsetHeight, $elWorkspace.offsetWidth)
                        } else {
                            this.eqxPage.setScale('fit', $elWorkspace.offsetWidth, $elWorkspace.offsetHeight)
                        }
                    }
                    this.rotateByDragAngle(newConfig.dragAngle)
                    Vue.store.commit('PHOTO_ROTATE_REVISE_CHANGE', { val: newConfig.dragAngle })
                })
            }
        },
        // 监听触发事件 生成正图 在旋转离开之前触发
        executeGenerateImg() {
            // 离开旋转时，生成真正的img 铺在canvas上,原先的css 旋转属性 都得去掉  这一步必须在切换之前操作 不然切换过去裁切和基础都拿不到
            Vue.loading.open('加载中')
            const that = this
            const width = this.$canvas.width
            const height = this.$canvas.height
            this.generateRealImg().then(canvas => {
                if ([-270, -90, 90, 270].includes(that.config.rotateAngle)) {
                    // 交换宽高
                    that.$canvas.width = height
                    that.$canvas.height = width
                    Vue.store.commit('PHOTO_SCENE_SIZE_CHANGE', { width: height, height: width })
                    const $elWorkspace = that.eqxPage.$el.parentElement
                    that.eqxPage.setScale('fit', $elWorkspace.offsetWidth, $elWorkspace.offsetHeight)
                }
                this.$canvas.style.transform = ''
                this.$canvasWrapper.style.transform = ''
                const ctx = that.$canvas.getContext('2d')
                ctx.drawImage(canvas, 0, 0)
                this.dealTextAndPaster()
                that.setBackground(canvas)
                setTimeout(() => {
                    Vue.loading.close()
                    // 通知菜单去切换
                    Vue.store.commit('PHOT_NAV_CAN_CHANGE')
                }, 0)
            })
        },
        // 监听selecttype 做一些环境初始化的活
        selectType(newVal, oldVal) {
            if (newVal === 'rotate') {
                Vue.store.commit('PHOTO_SIDE_BAR', { show: true }) // 确保sidebar一直打开
                this.initRotate() // 进入rotate 初始化
            }
            if (oldVal === 'rotate') {
                // 离开rotate 用户自己切走的executeGenerateImg这个方法已经处理
                // 历史回退的 需要手动清除css 旋转配置
                this.$canvas.style.transform = ''
                this.$canvasWrapper.style.transform = ''
            }
        },
        // 监听 旋转拖拽值
        reviseNum(newVal, oldVal) {
            // 根据拖拽的角度 执行旋转
            this.rotateByDragAngle(newVal)
        },
        // 监听 拖拽状态 是否拖拽完毕
        dragState(newVal) {
            if (this.selectType === 'rotate') {
                this.initLayer(newVal)
                if (!newVal) {
                    this.setHistoryInGroup() // 拖拽完毕之后 添加历史记录
                }
            }
        },
        // 监听 是否触发回到原图
        isBackToOriginState() {
            this.clearAllConfig()
        },
        // 监听 原图是否改变
        originImageShot() {
            // 原图改变之后历史清空  参数清空
            this.clearAllConfig()
        }
    },
    mounted() {
        this.$canvas = document.getElementsByClassName('eqc-photo-background-image')[0]
        this.$canvasWrapper = this.$canvas.parentElement
        this.initRotate()
    },
    methods: {
        // 处理文字和贴纸 因为旋转会引起文字和贴纸的想对位置变化
        dealTextAndPaster() {
            if ([-270, -90, 90, 270].includes(this.config.rotateAngle)) {
                this.allEqxElements.map(element => {
                    let { left, top } = element.elementJson.css
                    left = parseFloat(left)
                    top = parseFloat(top)
                    element.updateCss({
                        left: left - (this.config.width - this.config.height) / 2 + 'px',
                        top: top + (this.config.width - this.config.height) / 2 + 'px'
                    })
                })
            }
        },
        // 把当前的旋转的配置保存到store 便于下载的时候使用
        saveConfigToStore() {
            Vue.store.commit('PHOTO_ROTATE_KEEP_CONFIG', this.config)
        },
        // 历史回退时重新渲染
        getNewCanvasByBase64(width, height) {
            return new Promise((resolve, reject) => {
                if (this.$canvas.toDataURL() !== this.firstShot) {
                    // 回退的时候 用初次进入的图来重新绘制
                    const ctx = this.$canvas.getContext('2d')
                    const img = new Image()
                    img.src = this.firstShot
                    const that = this
                    img.onload = function () {
                        if (width && height) {
                            that.$canvas.width = width
                            that.$canvas.height = height
                        }
                        ctx.drawImage(img, 0, 0)
                        Vue.store.commit('PHOTO_SCENE_SIZE_CHANGE', { width: width, height: height })
                        const $elWorkspace = that.eqxPage.$el.parentElement
                        that.eqxPage.setScale('fit', $elWorkspace.offsetWidth, $elWorkspace.offsetHeight)
                        resolve()
                    }
                } else {
                    resolve()
                }
            })
        },
        // 清楚所有配置
        clearAllConfig() {
            this.$canvas.style.transform = ''
            this.$canvasWrapper.style.transform = ''
            if (this.selectType === 'rotate') {
                this.config = {
                    currentRotateType: -1,
                    rotateAngle: 0,
                    rotateXAngle: 0,
                    rotateYAngle: 0,
                    dragAngle: 0,
                    scaleSize: 1,
                    width: this.$canvas.width,
                    height: this.$canvas.height
                }
                Vue.store.commit('PHOTO_ROTATE_REVISE_CHANGE', { val: 0 })
            }
        },
        // 初始化旋转环境
        initRotate() {
            // 确保打开rendering 2d的canvas 关闭webgl的canvas
            const webglCanvas = document.getElementsByClassName('eqc-photo-background-image-webgl')[0]
            webglCanvas.style.display = 'none'
            this.$canvas.style.display = 'block'
            // 切换菜单的时候 所有配置都清空
            this.clearAllConfig()
            this.config.width = this.$canvas.width
            this.config.height = this.$canvas.height
            if (!this.isHistoryChangeNav) {
                Vue.store.commit('PHOTO_ROTATE_KEEP_CONFIG', this.config)
            }
        },
        // 切走的时候 根据配置参数 生成真正的img 铺在canvas上
        generateRealImg() {
            const width = [-270, -90, 90, 270].includes(this.config.rotateAngle) ? this.$canvas.height : this.$canvas.width
            const height = [-270, -90, 90, 270].includes(this.config.rotateAngle) ? this.$canvas.width : this.$canvas.height
            const $tempDiv = document.createElement('div')
            document.body.appendChild($tempDiv)
            $tempDiv.attr({ id: 'h2-photo-tmp-div-img' })
            $tempDiv.css({
                position: 'fixed',
                top: 0,
                left: 0,
                width: width + 'px',
                height: height + 'px',
                overflow: 'hidden',
                zIndex: -1 // 避免盖在当前页面上
            })
            const img = new Image()
            img.style.width = this.$canvas.width + 'px'
            img.style.height = this.$canvas.height + 'px'
            img.style.position = 'relative'
            if ([-270, -90, 90, 270].includes(this.config.rotateAngle)) {
                img.style.top = (this.$canvas.width - this.$canvas.height) / 2 + 'px'
                img.style.left = (this.$canvas.height - this.$canvas.width) / 2 + 'px'
            } else {
                img.style.top = '0'
                img.style.left = '0'
            }
            img.src = this.$canvas.toDataURL()
            let angle = this.config.rotateAngle + this.config.dragAngle
            if (this.config.rotateYAngle === 180 && this.config.rotateXAngle === 180) {
                // 如果俩个都有 则相互抵消
            } else if (this.config.rotateYAngle === 180) {
                angle = this.config.rotateAngle - this.config.dragAngle
            } else if (this.config.rotateXAngle === 180) {
                angle = this.config.rotateAngle - this.config.dragAngle
            }
            img.style.transform = `rotate(${angle}deg) rotateX(${this.config.rotateXAngle}deg) rotateY(${this.config.rotateYAngle}deg) scale(${this.config.scaleSize})`
            $tempDiv.append(img)
            // setTimeout(() => {
            //     $tempDiv.remove()
            // }, 2000)
            return new Promise((resolve, reject) => {
                dom2canvas($tempDiv)
                    .then(canvas => {
                        $tempDiv.remove()
                        resolve(canvas)
                    })
                    .catch(err => reject(err))
            })
        },
        // 计算放大的size 确保不留白
        calculateScale(angle) {
            // 计算放大比例  根据角度来放大
            // radius 取短的那条边 变化就是从短的变成长的
            angle = Math.abs(angle)
            const radius = this.$canvas.width > this.$canvas.height ? this.$canvas.height : this.$canvas.width
            const unit = Math.abs(this.$canvas.width - this.$canvas.height) / 90
            const scaleSize = (unit * angle + radius / 2) / (radius / 2)
            return scaleSize * (1 + Math.sin(angle * Math.PI / 90) / 2)
        },
        // 根据拖拽旋转
        rotateByDragAngle(angle) {
            this.config.dragAngle = angle
            this.config.scaleSize = this.calculateScale(this.config.dragAngle)
            this.$canvas.style.transform = `rotate(${this.config.dragAngle}deg) scale(${this.config.scaleSize})`
        },
        // 1 右翻90度 2 左翻90 3 左右对翻 4 上下对翻
        // 有个细节： 如果已经右翻一次，辣么这次左右对翻其实是上下对翻
        rotateClick(type) {
            this.rotateCanvas(type)
            this.setHistoryInGroup()
        },
        // 旋转
        rotateCanvas(type) {
            this.config.currentRotateType = type
            if ([-270, -90, 90, 270].includes(this.config.rotateAngle)) {
                // 已经是竖直状态 原先的左右和上下对翻 就相反了
                if (type === 3) {
                    type = 4
                } else if (type === 4) {
                    type = 3
                }
            }
            switch (type) {
                case 1:
                    this.config.rotateAngle = (this.config.rotateAngle + 90) % 360
                    break
                case 2:
                    this.config.rotateAngle = (this.config.rotateAngle - 90) % 360
                    break
                case 3:
                    this.config.rotateYAngle = (this.config.rotateYAngle + 180) % 360
                    break
                case 4:
                    this.config.rotateXAngle = (this.config.rotateXAngle + 180) % 360
                    break
            }
            this.$canvasWrapper.style.transform = `rotate(${this.config.rotateAngle}deg) rotateX(${this.config.rotateXAngle}deg) rotateY(${this.config.rotateYAngle}deg)`
            //  更新scene 来适配旋转之后canvas
            if ([1, 2].includes(this.config.currentRotateType)) {
                const $elWorkspace = this.eqxPage.$el.parentElement
                if ([-270, -90, 90, 270].includes(this.config.rotateAngle)) {
                    this.eqxPage.setScale('fit', $elWorkspace.offsetHeight, $elWorkspace.offsetWidth)
                } else {
                    this.eqxPage.setScale('fit', $elWorkspace.offsetWidth, $elWorkspace.offsetHeight)
                }
            }
        },
        // 初始化校准线
        initLayer(state) {
            if (this.selectType === 'rotate') {
                if (state) {
                    const $layer = this.$layer = document.createElement('div')
                    $layer.style.position = 'absolute'
                    $layer.classList.add('eqc-photo-background-image-layer')
                    $layer.style.width = (this.$canvas.width + 400) + 'px' // 多加400的冗余
                    $layer.style.height = (this.$canvas.height + 400) + 'px'
                    $layer.style.backgroundImage = `linear-gradient(rgba(255,255,255,.3) 1px, transparent 0),
                        linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 0),
                        linear-gradient(white 2px, transparent 0),
                        linear-gradient(90deg, white 2px, transparent 0)`
                    // 计算中心点是不是刚好处于整 50  如果不是取相邻近视值  调整 top left 使其置为中心点
                    let centerWidth = this.$canvas.width / 2 * this.scale
                    let centerHeight = this.$canvas.height / 2 * this.scale
                    if (centerWidth % 50 !== 0) {
                        $layer.style.left = -(50 - centerWidth % 50) + 'px'
                        centerWidth += (50 - centerWidth % 50)
                    }
                    if (centerHeight % 50 !== 0) {
                        $layer.style.top = -(50 - centerHeight % 50) + 'px'
                        centerHeight += (50 - centerHeight % 50)
                    }
                    $layer.style.backgroundSize = `50px 50px,50px 50px,${centerWidth}px ${centerHeight}px,${centerWidth}px ${centerHeight}px`
                    this.$canvas.parentElement.appendChild($layer)
                } else {
                    this.$canvas.parentElement.removeChild(this.$layer)
                    this.$layer = null
                }
            }
        },
        // 设置background
        setBackground(newCanvas) {
            const background = {
                src: newCanvas.toDataURL(),
                width: newCanvas.width,
                height: newCanvas.height
            }
            this.eqxPage.eqxBackground.setBackground(background)
        },
        // 组内历史 不要快照 只要配置参数
        setHistoryInGroup() {
            this.photoHistory.history.insert(JSON.parse(JSON.stringify(this.config)), this.$canvas.toDataURL(), this.historyType.rotate, true)
            this.saveConfigToStore()
        }
    }
}
</script>
<style lang="scss">
.eqc-photo-rotate {
    padding: 20px 24px;
    font-size: 12px;
    color: #222;
    .title {
        font-weight: bold;
    }
    .flex-center {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .item-content {
        margin: 8px 0 30px 0;
        display: flex;
        justify-content: space-between;
        .item {
            width: 54px;
            height: 54px;
            border-radius: 50%;
            border: 1px solid #ccd5db;
            font-size: 20px;
            &:hover {
                border: 1px solid #1593ff;
                color: #1593ff;
            }
        }
        .active {
            border: 1px solid #1593ff;
            color: #1593ff;
        }
    }
}
</style>
