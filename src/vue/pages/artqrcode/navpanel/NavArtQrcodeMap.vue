<template>
    <div class="eqc-nav-artqrcode-map">
        <div class="header">
            <span class="title">地图</span>
            <nav-panel-tools
                :data="{type:'map'}"
                :clear="clear"
            />
        </div>
        <div class="search-box">
            <input
                v-model.trim="address"
                type="text"
                placeholder="搜索地址名"
                @keydown.enter="searchKeyword"
            >
            <i
                v-if="address"
                class="close eqf-no"
                @click="clearKeyword"
            />
            <i
                v-if="!address"
                class="close icon ok eqf-search-l"
                @click="searchKeyword"
            />
        </div>
        <div
            :style="{height:state===3?'268px':'220px'}"
            class="map-box"
        >
            <nav-panel-builder
                v-show="state === 3"
                ref="qrcodeBuilder"
                :mode="mode"
                :status-out="showBuilderQrcode() ? 201 : 100"
                :qrcode-key-out="showBuilderQrcode() ? qrcodeKeyOut : null"
                :qrcode-key-str-out="showBuilderQrcode() ? qrcodeKeyStrOut : null"
                class="builder"
            />
            <div
                v-show="state !== 3"
                id="container"
                class="content"
            />
        </div>
        <div
            v-if="state===0"
            class="desc"
        >
            <p class="info">
                1、第一步：在搜索栏输入地址搜索
            </p>
            <p class="info">
                2、第二步：选择想要的地址并生成地图二维码
            </p>
        </div>
        <div
            v-show="state === 1"
            ref="addressList"
            v-scroll-bar="{onScrollMove}"
            :style="{height:addressListHeight}"
            class="addressList"
        >
            <div
                class="list"
            >
                <div
                    v-for="(item,index) of addressList"
                    :key="index"
                    class="listItem"
                    @click="getAddressDetail(item,index)"
                >
                    <div class="left">
                        <base-checkbox :checked="index===checkIndex" />
                    </div>
                    <div class="right">
                        <div
                            :class="{active:index===checkIndex}"
                            :title="item.name"
                            class="name"
                        >
                            {{ item.name }}
                        </div>
                        <div class="address">
                            {{ item.address }}
                        </div>
                    </div>
                </div>
                <base-list-status-infinite
                    v-if="isBusy || isEnd"
                    :is-busy="!addressList.length===0 && isBusy"
                    :is-end="addressList.length===0 || isEnd"
                    :bg-color="'rgba(255,255,255,1)'"
                    :msg-result="addressList.length===0?'没有搜索到结果':'没有更多了'"
                    class="listStatus"
                />
            </div>
        </div>
        <div
            v-if="state===1"
            :class="{bottom:buttonPositionState}"
            class="btn-area"
        >
            <base-button
                :class="{disable:checkIndex === -1}"
                :style="{background:checkIndex !== -1?'#1593ff':'#CCD5DB',color:'white'}"
                class="white blue w268 h36"
                @click.native="getCode"
            >
                生成
            </base-button>
        </div>
        <div
            v-if="state === 3"
            class="footer"
        >
            <p class="title">
                当前地址
            </p>
            <p class="detail">
                {{ currentAddress }}
            </p>
            <base-button
                class="white white-blue w268 h36"
                @click.native="chengeAddress"
            >
                更换地址
            </base-button>
        </div>
    </div>
</template>

<script>
import artQrcodeMode from '../../../../config/enum.artQrcodeMode.type'
import { host } from '../../../../config/env'
import NavPanelBuilder from './panel/NavPanelBuilder.vue'
import NavPanelTools from './panel/NavPanelTools.vue'
import qrcodeType from '../../../../config/enum.qrcode.type'

export default {
    components: {
        NavPanelBuilder,
        NavPanelTools
    },
    props: {
        item: {
            type: Object,
            default: null
        },
        mode: {
            type: Number,
            default: null
        },
        close: {
            type: Function,
            default: null
        },
        qrcodeKeyOut: {
            type: String,
            default: null
        },
        qrcodeKeyStrOut: {
            type: String,
            default: null
        },
        qrcodeTextOut: {
            type: String,
            default: null
        },
        qrcodeElementOut: {
            type: Object,
            default: null
        },
        qrcodeCompleteOut: {
            type: Function,
            default: null
        }
    },
    data() {
        return {
            link: '',
            state: 0, // 地图状态 0 ：未输入 1：地址列表 2：生成中-原二维码-美化二维码  共3个状态
            artQrcodeMode,
            loading: true,
            hostFile: host.file,
            address: '',
            pageIndex: 0,
            pageCapacity: 20,
            addressList: [],
            searchService: null,
            markers: [],
            map: null,
            isSearchAddress: true,
            isBusy: false,
            isEnd: false,
            addressEvent: {},
            addressListHeight: 0,
            buttonPositionState: false, // false 跟随 true 固定底部
            currentAddress: '',
            checkIndex: -1 // 地址选中index
        }
    },
    watch: {
        address(newVal, oldVale) {
            if (newVal.length === 0) {
                this.addressList = []
                this.map.clearOverlays(this.markers)
            }
        }
    },
    created() {
        if (this.mode === this.artQrcodeMode.setting &&
            this.qrcodeElementOut.elementJson.property.qcType !== qrcodeType.map) {
            return
        }
        if (this.qrcodeTextOut !== null && this.qrcodeTextOut !== '') {
            this.link = this.qrcodeElementOut.elementJson.property.text
            this.address = this.link.split('&')[1].split('=')[1]
            this.currentAddress = this.address + '-' + this.link.split('&')[2].split('=')[1]
            this.state = 3
        }
    },
    mounted() {
        setTimeout(() => {
            this.init()
        }, 0)
    },
    methods: {
        showBuilderQrcode() {
            return this.mode === this.artQrcodeMode.setting && this.qrcodeElementOut.elementJson.property.qcType === qrcodeType.map
        },
        init() {
            this.map = new BMap.Map('container')
            this.map.centerAndZoom(new BMap.Point(116.404, 39.915), 11)
            this.map.enableScrollWheelZoom(true)
            this.map.panBy(134, 110)// 中心点偏移多少像素（width,height）为div 宽高的一半; 268 220
            this.clickMap()
            // 删除最后那个文字说明
            setTimeout(() => {
                const node = document.getElementById('container')
                node.removeChild(node.lastChild)
            }, 1000)
        },
        clickMap() {
            this.map.addEventListener('click', (event) => {
                // this.map.clearOverlays(this.markers)
                // const marker = new BMap.Marker(event.point)
                // this.map.addOverlay(marker)
                // this.isSearchAddress = false
                // this.addressEvent = event
                // this.markers.push(marker)
            })
        },
        jsonp(event) {
            return new Promise((resolve, reject) => {
                window.callback_jsonp = (res) => {
                    const data = res.result
                    this.link = `//api.map.baidu.com/marker?location=${event.point.lat},${event.point.lng}&title=${data.sematic_description}&content=${data.formatted_address}&output=html&src=qingsheji`
                    resolve(this.link)
                }
                const newScript = document.createElement('script')
                newScript.src = `//api.map.baidu.com/geocoder/v2/?callback=renderReverse&location=${event.point.lat},${event.point.lng}&output=json&ak=yynK2g097PKZCrVCy5ikit3XAz8Mf1xD&callback=callback_jsonp`
                document.body.appendChild(newScript)
            })
        },
        // 清除关键字
        clearKeyword() {
            this.address = ''
            this.isBusy = false
            this.isEnd = false
            this.state = 0
        },
        // 设置搜索的范围和关键字等属性
        searchKeyword() {
            this.addressList = []
            this.pageIndex = 0
            this.isSearchAddress = true
            this.checkIndex = -1
            this.map.clearOverlays()
            this.searchAddress()
        },
        searchAddress() {
            this.state = 1
            this.isBusy = true
            this.isEnd = false
            window.callback = (res) => {
                const poiView = []
                const pois = res.results
                if (pois.length < 10) {
                    this.isBusy = false
                    this.isEnd = true
                } else {
                    this.scrollMoveFlag = true
                }
                // this.addressList.length === 0 ? this.addressList = pois : this.addressList.push(...pois)
                for (let i = 0, l = pois.length; i < l; i++) {
                    const poi = pois[i]
                    if (poi.location) {
                        this.addressList.push(poi)
                        const point = new BMap.Point(poi.location.lng, poi.location.lat)
                        const marker = new BMap.Marker(point)
                        poiView.push(point)
                        this.map.addOverlay(marker)
                        marker.setTitle(i + 1)
                        this.markers.push(marker)
                    }
                }
                // 调整地图视野
                this.map.setViewport(poiView)
                // 计算高度
                this.initHeight()
                // 刷新滚动条
                this.refreshScroll()
            }
            var script = document.createElement('script')
            script.src = `//api.map.baidu.com/place/v2/search?query=${this.address}&page_size=${this.pageCapacity}&page_num=${this.pageIndex}&region=全国&output=json&ak=yynK2g097PKZCrVCy5ikit3XAz8Mf1xD&callback=callback`
            document.body.appendChild(script)
        },
        onScrollMove(e, info) {
            if (this.scrollMoveFlag) {
                if (info.scrollY + 50 > info.maxScrollY) {
                    this.scrollMoveFlag = false
                    this.pageIndex = this.pageIndex + 1
                    this.map.clearOverlays()
                    this.searchAddress()
                }
            }
        },
        getAddressDetail(detail, index) {
            this.checkIndex = index
            const { address, location, name } = detail
            this.map.clearOverlays(this.markers)
            const marker = new BMap.Marker(new BMap.Point(location.lng, location.lat))
            this.map.addOverlay(marker)
            this.map.centerAndZoom(new BMap.Point(location.lng, location.lat), 11)
            this.markers.push(marker)
            this.link = '//api.map.baidu.com/marker?location=' + location.lat + ',' + location.lng + '&title=' + name + '&content=' + address + '&output=html&src=qingsheji'
        },
        refreshScroll() {
            // 刚显示又隐藏this.$refs.setting会没有值
            // 300ms是指需要等动画执行完了再刷新
            setTimeout(() => this.$refs.addressList && this.$refs.addressList.myScroll.refresh(), 300)
        },
        // 根据查询出来的记录条数  初始化各种高度
        initHeight() {
            // 初始化 百度查询地址匹配数 如果数目*每个记录高度 > 展示最高高度 则‘生成按钮’置底 否则尾随其后
            // 还要计算详细地址的行数  因为行数不固定
            /**
             * 0 行 33px + 16px的间距 = 49px
             * 1 行 47px + 16px的间距 = 63px
             * 2 行 61px + 16px的间距 = 77px   以此类推
             * 49 + 14 * 行数  一行等于= 40个字符
             * */
            const screenHeight = document.body.clientHeight - 368 - 68 // 减去上面的高度和下面按钮的68
            let totalHeight = 40
            this.addressList.map(item => {
                let len = 0
                if (item.address) {
                    len = this.strlen(item.address)
                }
                const row = Math.ceil(len / 40)
                totalHeight += (49 + 14 * row)
            })
            if (screenHeight > totalHeight) {
                this.buttonPositionState = false
                this.addressListHeight = totalHeight + 'px'
            } else {
                this.buttonPositionState = true
                this.addressListHeight = screenHeight + 'px'
            }
        },
        // 生成code
        getCode() {
            if (this.checkIndex === -1) {
                this.notifier.warn('请选择一个地址')
                return
            }
            if (this.addressList[this.checkIndex].address) {
                this.currentAddress = this.addressList[this.checkIndex].name + '-' + this.addressList[this.checkIndex].address
            } else {
                this.currentAddress = this.addressList[this.checkIndex].name
            }

            this.state = 3
            // 生成二维码
            if (!this.isSearchAddress) {
                this.jsonp(this.addressEvent).then(res => {
                    this.createQrcode(null)
                })
            } else {
                this.createQrcode(null)
            }
        },
        // 计算字符串的长度 然后计算占据几行 然后计算高度
        strlen(str) {
            var len = 0
            /* eslint-disable */
            let reg = /[^\x00-\xff]/ig
            for (var i = 0; i < str.length; i++) {
                var a = str.charAt(i)
                if (a.match(reg) != null) {
                    len += 2
                } else {
                    len += 1
                }
            }
            return len
        },
         // 生成二维码
        createQrcode(pStyle) {
             if (!this.link) {
                this.notifier.warn(`请先生成普通二维码`)
                return
            }
            // 如果样式参数不为空则保存
            if (pStyle !== null) {
                this.applyStyle = pStyle
            }
            this.$refs.qrcodeBuilder.create('http:' + this.link, this.applyStyle)
        },
        chengeAddress(){
            this.state = 1
        },
        // 清除样式
        clear() {
            this.applyStyle = null
            this.link = ''
            this.clearKeyword()
            this.$refs.qrcodeBuilder.setStatus()
        }
    }
}
</script>

<style lang="scss">
.eqc-nav-artqrcode-map {
    position: relative;
    height: 100%;
    .header {
        display: flex;
        justify-content: space-between;
        line-height: 20px;
        .title {
            font-weight: 600;
            color: #111;
        }
        .info {
            font-weight: 400;
            color: #76838f;
            cursor: pointer;
        }
    }
    .desc {
        margin-top: 16px;
        .info {
            font-size: 13px;
            line-height: 18px;
            color: #666666;
        }
    }
    .search-box {
        position: relative;
        width: 268px;
        border: 1px solid #ccd5db;
        border-radius: 3px;
        height: 38px;
        margin-top: 21px;
        input {
            background: white;
            width: 228px;
            height: 36px;
            padding: 9px 12px;
            border-radius: 3px;
            font-size: 13px;
        }
        .close {
            position: absolute;
            right: 0;
            top: 0px;
            text-align: center;
            line-height: 36px;
            width: 36px;
            height: 36px;
            color: #9099a4;
            transition: all 0.3s;
            cursor: pointer;
            font-size: 16px;
            &:hover {
                color: $red-normal;
            }
        }
        .ok {
            &:hover {
                color: #1593ff;
            }
        }
    }
    .map-box {
        margin-top: 16px;
        width: 268px;
        height: 220px;
        border: 1px solid #ccd5db;
        border-radius: 3px;
        .content {
            width: 268px;
            height: 220px;
            position: relative;
            border-radius: 4px 0 0 4px;
        }
    }
    .addressList {
        position: relative;
        margin-top: 16px;
        .list {
            padding-bottom: 40px;
        }
        .listItem {
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            cursor: pointer;
            .left {
                margin-right: 11px;
            }
            .right {
                .name {
                    width: 240px;
                    height: 20px;
                    font-size: 14px;
                    line-height: 16px;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;
                    &.active {
                        color: #1593ff;
                    }
                }
                .address {
                    width: 241px;
                    font-size: 12px;
                    color: #9099a4;
                    line-height: 14px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #ccd5db;
                    box-sizing: content-box;
                }
            }
        }
        .eqc-list-status-infinite {
            background: white;
        }
    }
    .btn-area {
        position: relative;
        left: -24px;
        width: 317px;
        height: 68px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-top: 1px solid #ccd5db;
        &.bottom {
            position: absolute;
            bottom: -24px;
            left: -24px;
        }
    }
    .footer {
        margin-top: 16px;
        .title {
            font-weight: 600;
            font-size: 14px;
            line-height: 20px;
        }
        .detail {
            margin-top: 8px;
            margin-bottom: 16px;
            font-weight: 400;
            font-size: 13px;
            line-height: 18px;
        }
    }
}
</style>
