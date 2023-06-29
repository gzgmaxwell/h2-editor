<template>
    <div class="eqc-dialog-map dialog">
        <i
            class="close eqf-no"
            @click="close(false)"
        />
        <div
            id="container"
            class="content"
        />
        <div class="search">
            <div class="tit">
                搜索地址
            </div>
            <div class="searchBox">
                <input
                    v-model.trim="address"
                    type="text"
                    placeholder="请输入地址名称"
                    @keydown.enter="searchKeyword"
                >
                <i
                    v-if="address && addressList.length>0"
                    class="close eqf-no"
                    @click="clearKeyword"
                />
                <i
                    v-if="!address || addressList.length===0"
                    class="close icon ok eqf-search-l"
                    @click="searchKeyword"
                />
            </div>

            <div
                ref="wrap"
                v-scroll-bar="{onScrollMove}"
                class="addressList"
            >
                <div
                    class="list"
                >
                    <div
                        v-for="(item,index) of addressList"
                        :key="index"
                        class="listItem"
                        @click="getAddressDetail(item)"
                    >
                        <span>{{ index+1 }}</span>
                        <div class="right">
                            <div class="name">
                                {{ item.name }}
                            </div>
                            <p class="address">
                                {{ item.address }}
                            </p>
                        </div>
                    </div>
                    <base-list-status-infinite
                        v-if="isBusy || isEnd"
                        :is-busy="!addressList.length===0 && isBusy"
                        :is-end="addressList.length===0 || isEnd"
                        :bg-color="'rgba(29,32,36,1)'"
                        :msg-result="addressList.length===0?'没有搜索到结果':'没有更多了'"
                        class="listStatus"
                    />
                </div>
            </div>
            <a
                class="help"
                href="//qingsheji.help.eqxiu.com/qrc.html"
                target="_blank"
            >
                <i class="why eqf-why-l" />
                <p>怎么运用地图二维码</p>
            </a>
            <div class="foot button">
                <base-button
                    class="cancle w96"
                    @click.native="cancle()"
                >
                    取消
                </base-button>
                <base-button
                    :class="{disable: markers.length === 0}"
                    class="blue h36 w96"
                    @click.native="confirm()"
                >
                    确定
                </base-button>
            </div>
        </div>
    </div>
</template>

<script>
import { host } from '../../../../../config/env'

export default {
    props: {
        data: {
            type: Object,
            default: null
        },
        close: {
            type: Function,
            default: null
        }
    },
    data() {
        return {
            loading: true,
            hostFile: host.file,
            address: '',
            pageIndex: 0,
            pageCapacity: 10,
            addressList: [],
            searchService: null,
            markers: [],
            map: null,
            isSearchAddress: true,
            isBusy: false,
            isEnd: false,
            addressEvent: {}
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
        this.$nextTick(() => {
            this.init()
        })
    },
    methods: {
        init() {
            let latLng = []
            const link = this.data.text
            const reg = new RegExp('(^|&)location=([^&]*)(&|$)')
            if (link) {
                latLng = link.indexOf('location=') > -1 ? link.split('?')[1].match(reg)[2].split(',') : link.split('&')[1].split(';')[0].split(':')[1].split(',')
            }
            this.map = new BMap.Map('container')
            this.map.centerAndZoom(new BMap.Point(116.404, 39.915), 11)
            this.map.enableScrollWheelZoom(true)
            link && this.latLngToMarker(latLng)
            this.clickMap()
        },
        confirm() {
            if (!this.isSearchAddress) {
                this.jsonp(this.addressEvent).then(res => {
                    this.close({ text: this.link })
                })
            } else {
                this.close({ text: this.link })
            }
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
        cancle() {
            this.link = ''
            this.close()
        },
        getAddressDetail(detail) {
            const { address, location, name } = detail
            this.map.clearOverlays(this.markers)
            const marker = new BMap.Marker(new BMap.Point(location.lng, location.lat))
            this.map.addOverlay(marker)
            this.map.centerAndZoom(new BMap.Point(location.lng, location.lat), 11)
            this.markers.push(marker)
            this.link = '//api.map.baidu.com/marker?location=' + location.lat + ',' + location.lng + '&title=' + name + '&content=' + address + '&output=html&src=qingsheji'
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
        latLngToMarker(latLng) {
            const marker = new BMap.Marker(new BMap.Point(latLng[1], latLng[0]))
            this.map.addOverlay(marker)
            this.markers.push(marker)
        },
        clickMap() {
            this.map.addEventListener('click', (event) => {
                this.map.clearOverlays(this.markers)
                const marker = new BMap.Marker(event.point)
                this.map.addOverlay(marker)
                this.isSearchAddress = false
                this.addressEvent = event
                this.markers.push(marker)
            })
        },
        // 设置搜索的范围和关键字等属性
        searchKeyword() {
            this.addressList = []
            this.pageIndex = 0
            this.isSearchAddress = true
            this.map.clearOverlays()
            this.searchAddress()
        },
        clearKeyword() {
            this.address = ''
            this.isBusy = false
            this.isEnd = false
        },
        searchAddress() {
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
            }
            var script = document.createElement('script')
            script.src = `//api.map.baidu.com/place/v2/search?query=${this.address}&page_size=${this.pageCapacity}&page_num=${this.pageIndex}&region=全国&output=json&ak=yynK2g097PKZCrVCy5ikit3XAz8Mf1xD&callback=callback`
            document.body.appendChild(script)
        }
    }
}
</script>

<style lang="scss">
.eqc-dialog-map {
    width: 960px;
    height: 600px;
    position: relative;

    display: flex;
    .search {
        border-radius: 0 4px 4px 0;
        width: 264px;
        height: 100%;
        background: #1d2024;
        color: #ffffff;
        padding-left: 28px;
        position: relative;
        .tit {
            margin-top: 60px;
            font-size: 14px;
            color: #999999;
        }
        .searchBox {
            position: relative;
            width: 208px;
            input {
                background: #2e333a;
                width: 208px;
                height: 36px;
                padding-left: 12px;
                margin-top: 8px;
            }
            span {
                position: absolute;
                right: 10px;
                top: 8px;
                display: inline-block;
                width: 30px;
                height: 36px;
                line-height: 36px;
                cursor: pointer;
                font-size: 14px;
                color: #9099a4;
                transition: all 0.3s;
                &:hover {
                    color: #ffffff;
                }
            }
            .close {
                position: absolute;
                right: 0;
                top: 8px;
                text-align: center;
                line-height: 36px;
                width: 36px;
                height: 36px;
                color: #9099a4;
                transition: all 0.3s;
                cursor: pointer;
                font-size: 20px;
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

        .addressList {
            width: 228px;
            height: 360px;
            padding-right: 20px;
            margin-top: 15px;
            padding-bottom: 100px;
            position: relative;
            .list {
                padding-bottom: 50px;
            }
            .listItem {
                widows: 100px;
                height: 72px;
                padding-left: 28px;
                margin-top: 16px;
                position: relative;
                cursor: pointer;
                transition: all 0.3s;
                &:hover .address {
                    color: #ffffff;
                }
                span {
                    position: absolute;
                    background: #2e333a;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    left: 0;
                    top: 0;
                    text-align: center;
                    line-height: 16px;
                    font-size: 12px;
                }
                .right {
                    width: 180px;
                    height: 100%;
                    border-bottom: 1px solid #2e333a;
                }
                .name {
                    font-size: 14px;
                    width: 180px;
                    height: 20px;
                    line-height: 20px;
                    overflow: hidden; //超出的文本隐藏
                    text-overflow: ellipsis; //溢出用省略号显示
                    white-space: nowrap; //溢出不换行
                }
                .address {
                    font-size: 12px;
                    color: #9099a4;
                    width: 180px;
                    height: 34px;
                    line-height: 17px;
                    margin-top: 5px;
                    display: -webkit-box;
                    /* autoprefixer: ignore next */
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 2;
                    overflow: hidden;
                }
            }
        }
        .help {
            position: absolute;
            bottom: 78px;
            left: 0;
            width: 100%;
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: center;
            align-items: flex-start;
            color: rgba(144, 153, 164, 1);
            .why {
                margin-right: 2px;
                font-size: 16px;
            }
            p {
                font-size: 13px;
                line-height: 15px;
            }
        }
        .button {
            width: 208px;
            height: 36px;
            display: flex;
            justify-content: space-between;
            position: absolute;
            left: 28px;
            bottom: 28px;
            .cancle {
                background: #2e333a;
                color: #9099a4;
                transition: all 0.3s;
                &:hover {
                    color: #ffffff;
                    background: darken(#2e333a, 2%);
                }
            }
            &.disable {
                pointer-events: none;
                color: #999;
                background: #f7f8f9;
            }
        }
        .listStatus {
            background: #1d2024;
            color: #ffffff;
            .text {
                background: #1d2024;
                color: #ffffff;
                height: 14px;
            }
        }
    }
    .close {
        position: absolute;
        right: 33px;
        top: 23px;
        color: #9099a4;
        z-index: 1;
        transition: all 0.3s;
        cursor: pointer;
        font-size: 20px;
        &:hover {
            color: $red-normal;
        }
    }
    .content {
        width: 696px;
        position: relative;
        border-radius: 4px 0 0 4px;
    }
}
</style>
