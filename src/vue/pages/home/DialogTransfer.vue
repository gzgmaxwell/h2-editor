<template>
    <div class="eqc-dialog-transfer dialog">
        <div class="head">
            <span>转赠作品</span>
            <i
                class="icon close eqf-no"
                @click="cancel"
            />
        </div>
        <div class="content">
            <div class="form">
                <span>用户名：</span>
                <div
                    class="text"
                    data-name="* 转赠后不再拥有此作品"
                >
                    <input
                        v-model.trim="username"
                        type="text"
                        placeholder="请输入要转赠的用户名"
                    >
                </div>
            </div>
            <div class="foot">
                <base-button
                    class="btn cancel white h36"
                    @click.native="cancel"
                >
                    取消
                </base-button>
                <base-button
                    class="btn ok blue h36"
                    @click.native="ok"
                >
                    确定
                </base-button>
            </div>
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
            username: ''
        }
    },
    computed: {
        userInfo() {
            // dialog中不能使用this.$store，没有值
            return Vue.store.state.user.userInfo
        }
    },
    methods: {
        cancel() {
            this.close()
        },
        ok() {
            if (!this.username.length) {
                this.notifier.warn('用户名不能为空')
            } else if (this.username === this.userInfo.loginName) {
                this.notifier.warn('不能转赠给当前用户')
            } else {
                this.api.scene.transferScene(this.data.id, this.username)
                    .then(res => this.close({}))
                    .catch(err => err && this.logger.error(err))
            }
        }
    }

}
</script>

<style lang="scss">
.eqc-dialog-transfer {
    width: 600px;
    .content {
        padding: 28px;
        .form {
            display: flex;
            justify-content: center;
            align-items: center;
            .text {
                position: relative;
                input {
                    width: 260px;
                    height: 36px;
                    padding: 0 12px;
                    color: #333;
                    border: 1px solid #ccd5db;
                    border-radius: 3px;
                }
                &::after {
                    content: attr(data-name);
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 100%;
                    left: 0;
                    display: flex;
                    align-items: center;
                    font-size: 12px;
                }
            }
        }
        .foot {
            margin-top: 68px;
            display: flex;
            justify-content: flex-end;
            .btn {
                width: 96px;
            }
            .ok {
                margin-left: 16px;
            }
        }
    }
}
</style>
