<template>
    <div class="eqc-head-setting">
        <div class="head">
            <span class="title">作品设置</span>
            <i
                class="close eqf-no"
                @click="close"
            />
        </div>
        <div class="content">
            <div class="info">
                <div
                    :style="{backgroundImage: getBackgroundImage(info.cover)}"
                    class="cover"
                    @click="changeCover"
                />
                <div class="form">
                    <div class="title">
                        <span class="name">作品标题</span>
                        <span class="length">{{ info.title.length }}/16</span>
                    </div>
                    <input
                        v-model="info.title"
                        type="text"
                        placeholder="请输入作品标题"
                        maxlength="16"
                    >
                    <div class="title">
                        <span class="name">作品描述</span>
                        <span class="length">{{ info.description.length }}/32</span>
                    </div>
                    <input
                        v-model="info.description"
                        type="text"
                        placeholder="请输入作品描述"
                        maxlength="32"
                    >
                </div>
            </div>
        </div>
        <div class="foot">
            <base-button
                class="blue h36"
                @click.native="save"
            >
                保存设置
            </base-button>
        </div>
    </div>
</template>

<script>
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
            scene: null,
            eqxScene: null,
            eqxPage: null,
            info: {
                title: '',
                description: '',
                cover: ''
            },
            submitInfo: {}
        }
    },
    mounted() {
        this.scene = Vue.store.state.scene
        this.eqxScene = this.scene.eqxScene
        this.eqxPage = this.scene.eqxPage

        const { title, description, cover } = this.eqxScene.sceneJson
        this.info.title = title || ''
        this.info.description = description || ''
        this.info.cover = cover || ''
    },
    methods: {
        getBackgroundImage(src) {
            src = Vue.filter('qiniuZoom')(src, 160)
            return Vue.filter('backgroundImage')(src)
        },
        changeCover() {
            this.info.cover = this.eqxPage.pageJson.cover
        },
        save() {
            if (this.isChanged()) {
                const sceneJson = this.eqxScene.sceneJson
                this.submitInfo.id = sceneJson.id
                this.api.scene.updateScene(this.submitInfo)
                    .then(res => {
                        Object.assign(sceneJson, this.submitInfo)
                        this.close()
                    })
                    .catch(err => err && this.logger.error(err))
            } else {
                this.close()
            }
        },
        isChanged() {
            const sceneJson = this.eqxScene.sceneJson
            const info = this.info
            const submitInfo = {}
            if (info.title !== sceneJson.title) {
                submitInfo.title = info.title
            }
            if (info.description !== sceneJson.description) {
                submitInfo.description = info.description
            }
            if (info.cover !== sceneJson.cover) {
                submitInfo.cover = info.cover
            }
            this.submitInfo = submitInfo
            return !!Object.keys(submitInfo).length
        }
    }
}
</script>

<style lang="scss">
.eqc-head-setting {
    position: relative;
    padding: 24px 24px 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: #eceef0;
    .head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 36px;
        .title {
            font-size: 18px;
            color: #111;
            font-weight: bold;
        }
        .close {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 28px;
            height: 28px;
            font-size: 22px;
            color: #fff;
            background: #2f3c4d;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s;
            &:hover {
                background: #ff2a6a;
            }
        }
    }
    .content {
        flex: 1;
        .info {
            margin-top: 16px;
            display: flex;
            justify-content: center;
            .cover {
                position: relative;
                width: 160px;
                height: 160px;
                margin-right: 24px;
                border: 1px solid #ccd5db;
                border-radius: 4px;
                background: url("../../../../img/cover.png") center/contain no-repeat;
                cursor: pointer;
                &::after {
                    content: "更新";
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: absolute;
                    right: 0;
                    bottom: 0;
                    width: 48px;
                    height: 24px;
                    font-size: 12px;
                    border-radius: 12px 0 4px 0;
                    color: #fff;
                    background: #2f3c4d;
                    transition: all 0.3s;
                }
                &:hover {
                    &::after {
                        background: #1593ff;
                    }
                }
            }
            .form {
                width: 508px;
                .title {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 36px;
                    .name {
                        font-weight: bold;
                        color: #111;
                    }
                    .length {
                        font-size: 12px;
                        color: #999;
                    }
                }
                input {
                    width: 100%;
                    height: 36px;
                    padding: 0 12px;
                    border: 1px solid #ccd5db;
                    border-radius: 3px;
                    color: #2f3c4d;
                    &:not(:last-child) {
                        margin-bottom: 16px;
                    }
                    &::-webkit-input-placeholder {
                        color: #4f5d69;
                    }
                }
            }
        }
    }
    .foot {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 84px;
        border-top: 1px solid #ccd5db;
        .blue {
            width: 160px;
        }
    }
}
</style>
