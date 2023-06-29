<template>
    <div class="eqc-visit-head">
        <div class="wrap">
            <i class="logo eqf-eqxiulogoorgin" />
            <div class="right">
                <ul class="menu">
                    <li class="item">
                        <a class="active">分类创建</a>
                    </li>
                    <li class="item">
                        <a
                            :href="env.host.mall + '/h2/'"
                            target="_blank"
                        >模板商城</a>
                    </li>
                    <li class="item">
                        <a
                            href="http://qingsheji.site.eqxiu.com"
                            target="_blank"
                        >新手教程</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.eqc-visit-head {
    position: relative;
    height: 60px;
    width: 100%;
    left: 0;
    top: 0;
    z-index: 1; // 需要固定在最上面且不被下面的内容遮挡
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
    background: #fff;
    .wrap {
        height: 60px;
        margin: auto;
        padding: 0 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .logo {
            font-size: 36px;
            color: #1593ff;
        }
        .right {
            display: flex;
            > .menu {
                display: flex;
                height: 60px;
                background: #fff;
                > .item {
                    margin: 0 16px;
                    a {
                        position: relative;
                        width: 60px;
                        display: block;
                        height: 100%;
                        line-height: 60px;
                        text-align: center;
                        transition: all 0.16s;
                        &::after {
                            content: "";
                            position: absolute;
                            width: 100%;
                            height: 2px;
                            bottom: 0;
                            left: 0;
                            background: $blue-normal;
                            transform: scaleX(0);
                            transition: transform 0.16s ease;
                        }
                        &:hover,
                        &.active {
                            color: $blue-normal;
                            &::after {
                                transform: scaleX(1);
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
