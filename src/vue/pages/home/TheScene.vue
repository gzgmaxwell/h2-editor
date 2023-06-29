<template>
    <div class="eqc-home-scene">
        <div class="wrap">
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
                <scene-item
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
                        v-if="keyWords !== ''"
                        class="blue h36"
                        @click.native="searchAll"
                    >
                        显示全部
                    </base-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import SceneItem from './TheSceneItem.vue'

export default {
    components: {
        SceneItem
    },
    data() {
        return {
            isBusy: true,
            scenes: [],
            pageNo: 1,
            pageSize: 15,
            totalCount: 0,
            keyWords: ''
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
                this.scenes = res2.data.list
                this.pageNo = pageNo
                this.totalCount = count
            })
            .catch(err => {
                this.isBusy = false
                err && this.logger.error(err)
            })
    },
    methods: {
        search() {
            this.toPage()
        },
        searchAll() {
            this.keyWords = ''
            this.toPage()
        },
        toPage(pageNo = 1) {
            this.isBusy = true
            this.scenes = []
            this.api.scene.getScenes(pageNo, this.pageSize, this.keyWords)
                .then(res => {
                    const { pageNo, count } = res.data.map
                    this.isBusy = false
                    this.scenes = res.data.list
                    this.pageNo = pageNo
                    this.totalCount = count
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
        }
    }
}
</script>

<style lang="scss">
.eqc-home-scene {
    .wrap {
        max-width: 1200px;
        margin: 0 auto 80px;
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
        }
        .empty {
            padding-top: 100px;
            .result-btn {
                display: flex;
                justify-content: center;
                padding: 60px 0;
                .eqc-btn {
                    padding: 0 12px;
                }
            }
        }
    }
}
</style>
