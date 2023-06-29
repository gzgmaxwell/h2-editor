<template>
    <div class="eqc-home-h2">
        <div
            v-if="hasScenes"
            class="wrap"
        >
            <div
                class="h2-banner"
                @click="h2BannerClick"
            >
                <span class="slogan1" />
                <span class="slogan2" />
                <span class="slogan3" />
                <span class="slogan4" />
            </div>
            <div
                v-if="totalCount"
                class="head"
            >
                <span>全部作品({{ totalCount }})</span>
                <div class="search">
                    <input
                        v-model="keyWords"
                        :style="{width: keyWords ? '180px' : ''}"
                        type="text"
                        placeholder="请输入搜索关键字"
                        @keydown.enter="search"
                    >
                    <i
                        class="icon eqf-search-l"
                        @click="search"
                    />
                </div>
            </div>
            <ul
                v-if="scenes.length"
                class="scene"
            >
                <li class="eqc-scene-item create">
                    <div
                        class="template block"
                        @click="createByTemplate"
                    >
                        <span>模板创建</span>
                        <span>海量精美模板，快速创建</span>
                    </div>
                    <div
                        class="batch block"
                        @click="createByBatch"
                    >
                        <span>批量创建</span>
                        <span>邀请函、名片、工作牌...</span>
                        <label>new</label>
                    </div>
                    <div
                        class="blank block"
                        @click="createByBlank"
                    >
                        <span>空白创建</span>
                    </div>
                </li><scene-item
                    v-for="(item, index) of scenes"
                    :key="item.id"
                    :style="{animationDelay: index * 50 + 'ms'}"
                    :item="item"
                    class="animation-fade-scale"
                    @transferScene="toPagePre"
                    @copyScene="toPage"
                    @deleteScene="toPagePre"
                />
            </ul>
            <base-pagination
                v-if="scenes.length && totalCount > pageSize"
                :page-no="pageNo"
                :page-size="pageSize"
                :total-count="totalCount"
                :on-to-page="toPage"
            />
            <div
                v-if="!scenes.length"
                class="empty"
            >
                <base-list-status
                    :is-busy="isBusy"
                    :is-empty="!isBusy && !scenes.length"
                    msg-result="暂无作品"
                />
                <div
                    v-if="!isBusy"
                    class="result-btn"
                >
                    <base-button
                        v-if="keyWords === ''"
                        class="blue h36"
                        @click.native="createByTemplate"
                    >
                        模板创建
                    </base-button>
                    <base-button
                        v-if="keyWords === ''"
                        class="blank blue h36"
                        @click.native="createByBlank"
                    >
                        空白创建
                    </base-button>
                    <base-button
                        v-if="keyWords !== ''"
                        class="blue h36"
                        @click.native="searchAll"
                    >
                        显示全部
                    </base-button>
                </div>
            </div>
        </div>
        <div
            v-if="!hasScenes"
            class="banner"
        >
            <a
                :href="banner.url"
                :style="{backgroundImage: banner.imageSrc ? `url(${banner.imageSrc})` : ''}"
                target="_blank"
                class="bg"
            />
        </div>
    </div>
</template>

<script>
import SceneItem from '../home/TheSceneItem.vue'
import DialogBatchCreate from './DialogBatchCreate.vue'
import DialogEmptyCreate from './DialogEmptyCreate.vue'
import statistic from '../../../config/statistic'

export default {
    components: {
        SceneItem
    },
    data() {
        return {
            isBusy: true,
            scenes: [],
            pageNo: 1,
            pageSize: 23,
            totalCount: 0,
            keyWords: '',
            hasScenes: true,
            banner: {
                imageSrc: '',
                url: ''
            }
        }
    },
    created() {
        const typePromise = this.api.scene.getDictionaryCategory()
        const scenesPromise = this.api.scene.getScenes(1, this.pageSize, this.keyWords)

        Promise.all([typePromise, scenesPromise])
            .then(([res1, res2]) => {
                const sceneType = {}
                res1.data.list.forEach(item => {
                    sceneType[item.value] = item.name
                    sceneType[item.name] = item.value
                })
                this.$store.commit('PRODUCT_TYPE', sceneType)

                const { pageNo, count } = res2.data.map
                this.isBusy = false
                res2.data.list.forEach((item, i) => {
                    if (!this.findSameItem(this.scenes, item, i)) {
                        this.scenes.push(item)
                    }
                })
                this.pageNo = pageNo
                this.totalCount = count

                this.showBanner()
            })
            .catch(err => {
                this.isBusy = false
                err && this.logger.error(err)
            })
    },
    mounted() {
        setTimeout(() => this.$parent.sidebarNav.setActiveTab('我的作品'))
    },
    methods: {
        h2BannerClick() {
            window.open('../qrcode', '_blank')
        },
        search() {
            this.toPage()
        },
        searchAll() {
            this.keyWords = ''
            this.toPage()
        },
        createByTemplate() {
            window.open(this.env.host.mall + '/h2/', '_blank')
        },
        createByBlank() {
            const options = {
                component: DialogEmptyCreate
            }
            this.dialog.open(options)
                .then(() => {
                })
                .catch(err => err && this.logger.error(err))
        },
        // 批量创建
        createByBatch() {
            const options = {
                component: DialogBatchCreate
            }
            this.dialog.open(options)
                .then(() => {
                })
                .catch(err => err && this.logger.error(err))

            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.BATCH,
                statistic.opt_label.BATCH.open])
        },
        toPage(pageNo = 1) {
            this.isBusy = true
            this.scenes = []
            this.api.scene.getScenes(pageNo, this.pageSize, this.keyWords)
                .then(res => {
                    const { pageNo, count } = res.data.map
                    this.isBusy = false
                    res.data.list.forEach((item, i) => {
                        if (!this.findSameItem(this.scenes, item, i)) {
                            this.scenes.push(item)
                        }
                    })
                    this.pageNo = pageNo
                    this.totalCount = count

                    this.showBanner()
                })
                .catch(err => err && this.logger.error(err))
        },
        toPagePre() {
            // 如果在最后一页，且只有一个作品时
            if (this.pageNo > 1 && this.scenes.length === 1) {
                this.toPage(this.pageNo - 1)
            } else {
                this.toPage(this.pageNo)
            }
        },
        showBanner() {
            if (!this.scenes.length && this.keyWords === '') {
                this.hasScenes = false
                this.api.banner.getBanners(6)
                    .then(res => {
                        const item = res.data.list[0].list[0] || {}
                        this.banner.imageSrc = this.env.host.file + item.cover
                        this.banner.url = item.url
                    })
            }
        },
        findSameItem(list, item, index) {
            for (let i = 0; i < list.length; i++) {
                if (list[i].id === item.id) {
                    Vue.logger.warn(`重复数据，id:${item.id}，sourceIndex:${i}，targetIndex:${index}`)
                    return true
                }
            }
            return false
        }
    }
}
</script>

<style lang="scss">
.eqc-home-h2 {
    height: calc(100% - 60px);
    overflow-y: auto;
    .wrap {
        min-width: 720px;
        max-width: calc(100% - 40px * 2);
        margin: 0 auto 80px;
        .h2-banner {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 16px;
            height: 60px;
            background: rgba(21, 147, 255, 1);
            cursor: pointer;
            background-image: url("../../../img/h2_banner_bg.png");
            background-repeat: no-repeat;
            background-position: center;
            background-size: cover;
            min-width: 1000px;
            overflow: hidden;
            .slogan1 {
                width: 72px;
                height: 60px;
                background-image: url("../../../img/qr_2.gif");
                background-repeat: no-repeat;
                background-position: center;
                background-size: 100% 100%;
                cursor: pointer;
            }
            .slogan2 {
                width: 748px;
                height: 48px;
                background-image: url("../../../img/qr_4.png");
                background-repeat: no-repeat;
                background-position: 2px -6px;
                background-size: 100% 100%;
                cursor: pointer;
                margin-right: 16px;
                margin-top: -10px;
            }
            .slogan3 {
                width: 100px;
                height: 52px;
                background-image: url("../../../img/qr_3.gif");
                background-repeat: no-repeat;
                background-position: center;
                background-size: 100% 100%;
                cursor: pointer;
            }
            .slogan4 {
                width: 67px;
                height: 60px;
                background-image: url("../../../img/qr_1.gif");
                background-repeat: no-repeat;
                background-position: center;
                background-size: 100% 100%;
                cursor: pointer;
            }
        }
        .head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 68px;
            padding: 16px 0;
            .search {
                display: flex;
                &:hover {
                    input {
                        width: 180px;
                    }
                    .icon {
                        color: #1593ff;
                    }
                }
                input {
                    width: 0;
                    background: transparent;
                    border-bottom: 1px solid #1593ff;
                    transition: all 0.3s;
                }
                .icon {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 36px;
                    height: 36px;
                    font-size: 18px;
                    cursor: pointer;
                }
            }
        }
        .scene {
            margin-bottom: 36px;
            .create {
                display: inline-flex;
                flex-direction: column;
                padding: 16px;
                background: #fff;
                &:hover {
                    transform: translateY(0);
                }
                .block {
                    width: 100%;
                    background: rgba(247, 248, 249, 1);
                    border: 1px solid rgba(247, 248, 249, 1);
                    border-radius: 3px;
                    color: #000000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    margin-bottom: 16px;
                    cursor: pointer;
                    transition: all 0.3s;
                    &:hover {
                        border: 1px solid #1593ff;
                    }
                }
                .template {
                    height: 96px;
                    span {
                        width: 100%;
                        text-align: center;
                    }
                    :nth-child(1) {
                        font-size: 14px;
                        font-weight: bold;
                        color: rgba(17, 17, 17, 1);
                        padding-bottom: 6px;
                        padding-top: 3px;
                        background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAYAAAAehFoBAAACyUlEQVRYR9WZPWhTURSAv/My6KAFkaQlk3RwcBasoOKgIIgdFIuIm6iYNv4MdXLTyQ7+JK1YcFORig4VQVBQjGAFZ0GH4hTTBBFaBx3yjtyXJuQ/7yXvFe7bknvPuR/3nb93jjDAo6oycp89rstRgVGFJJAUSCoo8BPIC+QVlh2HV4WLfBYRs9bXI/1IJeb0EC4ngXFVRoLoEKEALOLwrJiSt0Fkzd5AwMNzOuaWuQXsD3pQh/05J8a1lZQs+dXnCzgxp6OUmVE47ldxkH0CL4gxXUzJci+5nsDm9avLAsq2XsoGWhd+i8NELzPpChzPaBrhNkpsIBi/wkIZ5WopLZlOIh2B47N6B5fLfs8KdZ/D3dKkXGmnsy2wd7NwL1SI4MoutbvpFuB1m329YWbQ+d2XxeFIs003AJtooC5fIncwv7ddccTd9dGjETijz6MKXX4Zm/eZkFdMy4nq/zXg9aTwqV/FUco5MfZWk0sNOJHVnCr7ojy4X90ifCxOiZddPWDP0cq86VfhRshJjMPGASvAGZ1XOBfWwTuGKpp+rIalEUSYL07JBTEl4vAs+aBVVzeUpTOV1bFHoQIXViZJShTO9vVsBXTXw/CAjSbjfBLP6g2U62GqjgoY4aYksvpYldM2AIvwxNzwO5SDNgAjvDfA31B2WgL83ZjEmipbggKb0PV0HIY2tUpu31z579ff1rXVf3Bqsb+QJ8Ifc8OrKFttAEZYs88krHM6G8OaXYnDutRsXfHjlZdZfaDK+aChrdP+SMtLD9i2At5AxzP6IcQmX1gvq6onV0rLAfPD3o9QzzRs+sxft2W7Gik1B3Sxo1VVtXCrmoE1aJvarQ03bUtDuwpt1cigDtqeoUx9yjKVnbrMhNU0NE0+cZgOfezVnGe9wWKZCYRjQVtc3mBReUmMhV4To3b5vefYq1tR0G10a+QU8mGPbv8DLx1t+JPzVroAAAAASUVORK5CYII=);
                        background-repeat: no-repeat;
                        background-size: 24px;
                        background-position-x: 55px;
                        line-height: 20px;
                        text-indent: 33px;
                    }
                    :nth-child(2) {
                        font-size: 12px;
                        color: rgba(153, 153, 153, 1);
                        padding-top: 6px;
                    }
                }
                .batch {
                    height: 96px;
                    position: relative;
                    span {
                        width: 100%;
                        text-align: center;
                    }
                    :nth-child(1) {
                        font-size: 14px;
                        font-weight: bold;
                        color: rgba(17, 17, 17, 1);
                        padding-bottom: 6px;
                        padding-top: 3px;
                        background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAkCAYAAADy19hsAAACC0lEQVRYR+2YQUgUYRzF31tdZFcPnjoIEaIeungQ0kugUmAibnYxNjxJYHbzUIdAEAIPdehmBdFJWLzIokQJCht4KcFDhxIUqotnD+tui+u+2J0KcW2Gb2dmZXDmOt97/988/vPn+z7C4cmnOhcETEpqclrr5j3JAoG3seTeQzsf2r3MpTouA/gOoABRboActRQlxCOMtseSOz/+t94WWBKRGWziYOaXY0EPFmi5+xKKxRzHv2aNgaW5CN4vtnjAYW4xPJEl50pnCasSLoPmlxafQZiSdC7AJLMgXsfuTjw+DV4FfJjqegCVXprH4oOCkenm5O6rk85VwLlUZ1rSbR/KG1sSTMfv7d1xAO56DpWiIg+MK3gooNQKRo7iyd1HtsAe1vTF6l9LaGWoBzyeh9QHoNWXauamByA/QQ1PmFjbLssrwFod6oWKmwCi5p51URyBjdc5uvb5D/DNDKT+upSutQj5kaPrAxbwyo0cgFitXnXS5ZnYiP8F9nef4NEXMbHBELgS5rWnVqZbsx5la9n4l/CttFXhw1gI7E8PhwlfyB5ubAbaBoCGM86mV+9bkXx7U/3THReA/QxQPDT+Id1NiSsjQPeMcdGK4MsL4Oc7Y6074MAlbJdPOCUu5JQIW8J5aLibEnb+gdutOYdV0wr/Eq4Jx1l0EjhgZ7rVoJ2ag3YvUe6eoNz8/Aba+gc0RvRjmQAAAABJRU5ErkJggg==);
                        background-repeat: no-repeat;
                        background-size: 24px;
                        background-position-x: 55px;
                        line-height: 20px;
                        text-indent: 33px;
                    }
                    :nth-child(2) {
                        font-size: 12px;
                        color: rgba(153, 153, 153, 1);
                        padding-top: 6px;
                    }
                    label {
                        font-size: 12px;
                        font-weight: 400;
                        color: rgba(255, 41, 106, 1);
                        position: absolute;
                        right: 23px;
                        top: 23px;
                        cursor: pointer;
                    }
                }
                .blank {
                    height: 68px;
                    margin-bottom: 0px;
                    span {
                        width: 100%;
                        text-align: center;
                    }
                    :nth-child(1) {
                        font-size: 14px;
                        font-weight: bold;
                        color: rgba(17, 17, 17, 1);
                        padding-bottom: 6px;
                        padding-top: 3px;
                        background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAqCAYAAADbCvnoAAACJklEQVRYR+2YTWsTURSGnzMzNUgRihsJLlxJaYQiSNGuRlcuFNy5duEqEVR059qdKDSpIIj4E1zkB3Qh+LUQoiRqtRLU2oAoLqSkqTllmonWdj7y0ckMMrNI4N5z3/vMe+69M3ME99KpwiEMzqJMo2S67ZH+C02ECm3KUpuvO3OJ86O5/AWQEqrjkQL4iYv8Ar0k1bsPRY9cnqHdegKYscD8nfQ3xtis6FS+DJyJGcadXsqiucIKqgcSASTScBzSRMB0PUqBQtLxn6Zs5nDnvl8sDr0cd8ehhZvgbI1TNxIC9OxWB+T49RTI24HUobCVEYtDs5Nw+yLsHduJt8dtW2vt7Guuw7UH8Lgadlub/b1v+xOTcGcAoNUWXL0PT9/uMlCQXCwpS4F6yrBPUJqyMPcS93BN3OtHmIN99Pd+MPYhOkxoChTmXuQO1X9+C2PAECE7PoFlmn08XENlvQMWv68EjjRFOLhvPxmr88YQuUNBQNthYgXygkGoxeKQJwzyDlF75EDezsh7MmLLy9LySIF80rSEZdpSKX4e6RrycaaOYnfri12gZSA74K4OHebsMh9nPmEZtlRKH7eKOBW0R6ieC1UeMGDpR+Ofc8aV+YJp2vK6+GG7rGgufxR4juLxfTMgxZZhzfXWn0PPbf4Kli21Oc9SiVsWLpwH7qE6MTxCgIJIA1NOyqvSG7+oTSDn0mNXsqyunUaNaWhHUzgXc16qxcAvxg2ev/caeUSiPwAAAABJRU5ErkJggg==);
                        background-repeat: no-repeat;
                        background-size: 24px;
                        background-position-x: 55px;
                        text-indent: 33px;
                    }
                }
            }
        }
        .empty {
            padding-top: 100px;
            .result-btn {
                display: flex;
                justify-content: center;
                padding: 60px 0;
                .blank {
                    margin-left: 16px;
                }
                .eqc-btn {
                    padding: 0 12px;
                }
            }
        }
    }
    .banner {
        min-width: 720px;
        max-width: calc(100% - 40px * 2);
        margin: 40px auto 80px;
        overflow: hidden;
        .bg {
            display: block;
            height: 480px;
            background: center / cover;
        }
    }
    .eqc-scene-item {
        &:not(:nth-child(-n + 5)) {
            margin-top: 0;
        }
        &:not(:nth-child(5n + 1)) {
            margin-left: 0;
        }
    }
    @media screen and (max-width: 1279px) {
        .eqc-scene-item {
            &:not(:nth-child(-n + 3)) {
                margin-top: 20px;
            }
            &:not(:nth-child(3n + 1)) {
                margin-left: calc((100% - 224px * 3) / 2);
            }
        }
    }
    @media screen and (min-width: 1280px) and (max-width: 1499px) {
        .eqc-scene-item {
            &:not(:nth-child(-n + 4)) {
                margin-top: 20px;
            }
            &:not(:nth-child(4n + 1)) {
                margin-left: calc((100% - 224px * 4) / 3);
            }
        }
    }
    @media screen and (min-width: 1500px) and (max-width: 1699px) {
        .eqc-scene-item {
            &:not(:nth-child(-n + 5)) {
                margin-top: 20px;
            }
            &:not(:nth-child(5n + 1)) {
                margin-left: calc((100% - 224px * 5) / 4);
            }
        }
    }
    @media screen and (min-width: 1700px) {
        .eqc-scene-item {
            &:not(:nth-child(-n + 6)) {
                margin-top: 20px;
            }
            &:not(:nth-child(6n + 1)) {
                margin-left: calc((100% - 224px * 6) / 5);
            }
        }
    }
}
</style>
