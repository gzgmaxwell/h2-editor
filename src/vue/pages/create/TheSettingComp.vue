<template>
    <div
        ref="setting"
        v-scroll-bar
        class="eqc-setting"
    >
        <div>
            <!-- table -->
            <div
                :style="{height: tableHeight + 'px'}"
                class="category align"
            >
                <setting-table
                    v-if="tableHeight>0"
                    :eqx-element="eqxElement"
                    @heightChange="tableHeightChange"
                />
            </div>
            <!--组合、对齐-->
            <div
                :style="{height: combineHeight + 'px'}"
                class="category align"
            >
                <div
                    class="buttonArea"
                >
                    <base-button
                        class="combine-btn white w152 h36"
                        @click.native="combineClick"
                    >
                        {{ isCombine?'取消组合':'创建组合' }}
                    </base-button>
                </div>
                <setting-combine-text
                    v-if="eqxElement.elementJson.type === this.enum.elementType.combine"
                    :eqx-element="eqxElement"
                    @changeHeight="changeHeight"
                />
                <div
                    v-show="!isCombine"
                    class="title"
                >
                    <span>对齐</span>
                </div>
                <div
                    v-show="!isCombine"
                    class="detail"
                    style="padding: 16px"
                >
                    <setting-align />
                </div>
            </div>
            <!--文字-->
            <div
                :style="{height: textHeight + 'px'}"
                class="category text"
            >
                <div
                    class="title"
                    @click="openText"
                >
                    <span>文字</span>
                    <i
                        :class="{'eqf-down':textHeight !== heightClose,'eqf-right':textHeight === heightClose}"
                        class="arrow"
                    />
                </div>
                <div
                    class="detail"
                    @click="$refs.textRadiusPanel && $refs.textRadiusPanel.hideSelectPanel()"
                >
                    <div class="name">
                        样式
                    </div>
                    <div
                        class="font-style-btn font-style-box"
                        @click="fontStyleSelect()"
                    >
                        <div
                            :style="{backgroundImage: getBackgroundImage(eqxElement.elementJson.property.fontStyleImgPath)}"
                            class="style-box"
                        />
                        <i
                            class="icon eqf-menu-right"
                        />
                    </div>
                    <div class="name">
                        字体
                    </div>
                    <div
                        class="font-style-btn"
                        @click="fontTextSelect()"
                    >
                        <span>{{ eqxElement.elementJson.property.fontFamilyName?eqxElement.elementJson.property.fontFamilyName:'默认字体' }}</span>
                        <i
                            class="icon eqf-menu-right"
                        />
                    </div>
                    <div
                        v-if="textTypeSelected !== textType.gradient"
                        class="name"
                    >
                        文字颜色字号
                    </div>
                    <div
                        v-if="textTypeSelected !== textType.gradient"
                        class="content"
                    >
                        <div class="left">
                            <setting-color
                                :model="css"
                                model-key="color"
                            />
                        </div>
                        <div
                            class="right"
                        >
                            <base-input
                                :model="css"
                                :min="0"
                                model-key="fontSize"
                            />
                        </div>
                    </div>
                    <div
                        v-if="[textType.text,textType.shadow,textType.cube,textType.stroke].includes(textTypeSelected)"
                        class="name"
                    >
                        背景颜色
                    </div>
                    <setting-color
                        v-if="[textType.text,textType.shadow,textType.cube,textType.stroke].includes(textTypeSelected)"
                        :model="css"
                        model-key="backgroundColor"
                    />
                    <div
                        v-if="property && property.borderRadius && [textType.text,textType.shadow,textType.cube,textType.stroke].includes(textTypeSelected)"
                        class="name"
                    >
                        背景圆角
                    </div>
                    <setting-border-radius
                        v-if="property && property.borderRadius && [textType.text,textType.shadow,textType.cube,textType.stroke].includes(textTypeSelected)"
                        ref="textRadiusPanel"
                        :model="property.borderRadius"
                        model-key="val"
                    />
                    <base-input
                        v-if="textTypeSelected === textType.gradient"
                        :model="css"
                        :min="0"
                        style="marginTop:12px"
                        model-key="fontSize"
                    />
                    <div
                        v-if="textTypeSelected === textType.gradient"
                        class="name"
                    >
                        文字颜色
                    </div>
                    <setting-gradient-color
                        v-if="textTypeSelected === textType.gradient"
                        :model="property"
                        :eqx-element="eqxElement"
                        model-key="gradient"
                    />
                    <div
                        v-if="textTypeSelected === textType.shake"
                        class="name"
                    >
                        颤抖颜色
                    </div>
                    <div
                        v-if="textTypeSelected === textType.shake"
                        class="content"
                    >
                        <div class="left">
                            <setting-color
                                :model="property"
                                model-key="shake"
                                model-key-type="0"
                            />
                        </div>
                        <div class="right">
                            <setting-color
                                :model="property"
                                model-key="shake"
                                model-key-type="1"
                            />
                        </div>
                    </div>
                    <div
                        v-if="textTypeSelected === textType.shake"
                        class="name"
                    >
                        颜色角度
                    </div>
                    <base-input
                        v-if="textTypeSelected === textType.shake"
                        :model="property"
                        :min="0"
                        :max="359"
                        model-key="angle"
                        unit=""
                        unit-view="°"
                    />
                    <div
                        v-if="textTypeSelected === textType.shake"
                        class="name"
                    >
                        颜色尺寸
                    </div>
                    <base-input
                        v-if="textTypeSelected === textType.shake"
                        :model="property"
                        :min="0"
                        model-key="shake"
                        model-key-type="size"
                        unit=""
                        unit-view=""
                    />
                    <div class="name">
                        内边距
                    </div>
                    <base-input
                        :model="css"
                        :min="0"
                        model-key="padding"
                    />
                    <div class="content">
                        <div class="name left">
                            行间距
                        </div>
                        <div class="name right">
                            字间距
                        </div>
                    </div>
                    <div
                        class="content"
                    >
                        <div class="left">
                            <div class="iconbox">
                                <i
                                    class="icon eqf-linehigh"
                                />
                            </div>
                            <div class="input">
                                <base-input
                                    :model="css"
                                    :min="100"
                                    :max="200"
                                    model-key="lineHeight"
                                    unit=""
                                    unit-view="%"
                                />
                            </div>
                        </div>
                        <div class="right">
                            <div class="iconbox">
                                <i
                                    class="icon eqf-lineshort"
                                />
                            </div>

                            <div class="input">
                                <base-input
                                    :model="css"
                                    :min="0"
                                    model-key="letterSpacing"
                                />
                            </div>
                        </div>
                    </div>

                    <setting-text-align
                        :model="css"
                        model-key="textAlign"
                    />
                    <setting-text-style
                        :model="css"
                        :text-type="property.type"
                    />
                </div>
            </div>
            <!--二维码-->
            <div
                :style="{height: qrcodeHeight + 'px'}"
                class="category qrcode"
            >
                <div
                    class="title"
                    @click="openQrcode"
                >
                    <span>二维码</span>
                    <i
                        :class="{'eqf-down':qrcodeHeight !== heightClose,'eqf-right':qrcodeHeight === heightClose}"
                        class="arrow"
                    />
                </div>
                <div class="detail">
                    <setting-art-qrcode
                        v-if="eqxElement.elementJson.type === this.enum.elementType.qrcode"
                        :element="eqxElement"
                    />
                </div>
            </div>
            <!--图片-->
            <div
                :style="{height: imageHeight + 'px'}"
                class="category image"
            >
                <setting-image-base-tool />
                <div
                    class="title"
                    @click="openImage"
                >
                    <span>图片</span>
                    <i
                        :class="{'eqf-down':imageHeight !== heightImageClose,'eqf-right':imageHeight === heightImageClose}"
                        class="arrow"
                    />
                </div>
                <div
                    class="detail"
                    @click="$refs.imgRadiusPanel && $refs.imgRadiusPanel.hideSelectPanel()"
                >
                    <div
                        v-if="property && property.borderRadius"
                        class="name"
                    >
                        圆角
                    </div>
                    <setting-border-radius
                        v-if="property && property.borderRadius"
                        ref="imgRadiusPanel"
                        :model="property.borderRadius"
                        model-key="val"
                    />
                    <div class="name">
                        透明度
                    </div>
                    <base-input
                        :model="css"
                        :min="0"
                        :max="100"
                        :reverse="true"
                        model-key="opacity"
                        unit=""
                        unit-view="%"
                    />
                    <div class="name">
                        翻转
                    </div>
                    <ul class="rotate">
                        <li
                            class="item"
                            @click="rotateComp('rotateY')"
                        >
                            <i
                                class="eqf-flipshuiping"
                            />
                            <span class="tip">水平</span>
                        </li>
                        <li
                            class="item"
                            @click="rotateComp('rotateX')"
                        >
                            <i
                                class="eqf-flipchuizhi"
                            />
                            <span class="tip">垂直</span>
                        </li>
                    </ul>
                </div>
            </div>
            <!--gif-->
            <div
                :style="{height: gifHeight + 'px'}"
                class="category gif"
            >
                <div
                    class="title"
                    @click="openGifImage"
                >
                    <span>Gif</span>
                    <i
                        :class="{'eqf-down':gifHeight !== heightClose,'eqf-right':gifHeight === heightClose}"
                        class="arrow"
                    />
                </div>
                <div class="detail">
                    <div class="name">
                        透明度
                    </div>
                    <base-input
                        :model="css"
                        :min="0"
                        :max="100"
                        :reverse="true"
                        model-key="opacity"
                        unit=""
                        unit-view="%"
                    />
                </div>
            </div>
            <!--形状-->
            <div
                :style="{height: shapeHeight + 'px'}"
                class="category"
            >
                <div class="shape-replace">
                    <div
                        class="shape-replace-btn"
                        @click="replace('shape')"
                    >
                        替换
                    </div>
                </div>
                <div
                    class="title"
                    @click="openShape"
                >
                    <span>形状</span>
                    <i
                        :class="{'eqf-down':shapeHeight !== heightShapeClose,'eqf-right':shapeHeight === heightShapeClose}"
                        class="arrow"
                    />
                </div>
                <div
                    class="detail"
                    @click="$refs.shapeRadiusPanel && $refs.shapeRadiusPanel.hideSelectPanel()"
                >
                    <div
                        v-if="property && property.borderRadius"
                        class="name"
                    >
                        圆角
                    </div>
                    <setting-border-radius
                        v-if="property && property.borderRadius"
                        ref="shapeRadiusPanel"
                        :model="property.borderRadius"
                        model-key="val"
                    />
                    <div
                        v-if="shapeItems && shapeItems.length > 0"
                        class="color-btns"
                    >
                        <div
                            :class="{'actived':isPrueColorShow}"
                            @click="isPrueColorShow = true"
                        >
                            纯色
                        </div>
                        <div
                            v-if="shapeItems && shapeItems.length === 1"
                            :class="{'actived':!isPrueColorShow}"
                            @click="isPrueColorShow = false"
                        >
                            渐变色
                        </div>
                    </div>
                    <div v-show="isPrueColorShow">
                        <div
                            v-for="(item, index) of shapeItems"
                            :key="index"
                        >
                            <div class="name">
                                颜色{{ index + 1 }}
                            </div>
                            <setting-color
                                :model="item"
                                model-key="fill"
                                @click="shapeColorClick(index)"
                            />
                        </div>
                    </div>
                    <div v-show="!isPrueColorShow">
                        <setting-gradient-color
                            v-if="shapeItems && shapeItems.length === 1"
                            :model="property"
                            :eqx-element="eqxElement"
                            model-key="gradient"
                        />
                    </div>
                    <div class="name">
                        翻转
                    </div>
                    <ul class="rotate">
                        <li
                            class="item"
                            @click="rotateComp('rotateY')"
                        >
                            <i
                                class="eqf-flipshuiping"
                            />
                            <span class="tip">水平</span>
                        </li>
                        <li
                            class="item"
                            @click="rotateComp('rotateX')"
                        >
                            <i
                                class="eqf-flipchuizhi"
                            />
                            <span class="tip">垂直</span>
                        </li>
                    </ul>
                </div>
            </div>
            <!--嵌入框-->
            <div
                :style="{height: frameHeight + 'px'}"
                class="category"
            >
                <div
                    class="title"
                    @click="openFrame"
                >
                    <span>图片容器</span>
                    <i
                        :class="{'eqf-down':frameHeight !== heightClose,'eqf-right':frameHeight === heightClose}"
                        class="arrow"
                    />
                </div>
                <div
                    class="detail"
                    @click="$refs.frameRadiusPanel && $refs.frameRadiusPanel.hideSelectPanel()"
                >
                    <div
                        class="btn replace"
                        @click="replace('frame')"
                    >
                        替换
                    </div>
                    <div
                        v-if="property && property.borderRadius"
                        class="name"
                    >
                        圆角
                    </div>
                    <setting-border-radius
                        v-if="property && property.borderRadius"
                        ref="frameRadiusPanel"
                        :model="property.borderRadius"
                        model-key="val"
                    />
                    <div class="name">
                        透明度
                    </div>
                    <base-input
                        :model="css"
                        :min="0"
                        :max="100"
                        :reverse="true"
                        model-key="opacity"
                        unit=""
                        unit-view="%"
                    />
                    <div class="name">
                        翻转
                    </div>
                    <ul class="rotate">
                        <li
                            class="item"
                            @click="rotateComp('rotateY')"
                        >
                            <i
                                class="eqf-flipshuiping"
                            />
                            <span class="tip">水平</span>
                        </li>
                        <li
                            class="item"
                            @click="rotateComp('rotateX')"
                        >
                            <i
                                class="eqf-flipchuizhi"
                            />
                            <span class="tip">垂直</span>
                        </li>
                    </ul>
                </div>
            </div>
            <!--拼图-->
            <div
                :style="{height: puzzleHeight + 'px'}"
                class="category"
            >
                <div
                    class="title"
                    @click="openPuzzle"
                >
                    <span>拼图</span>
                    <i
                        :class="{'eqf-down':puzzleHeight !== heightClose,'eqf-right':puzzleHeight === heightClose}"
                        class="arrow"
                    />
                </div>
                <div
                    class="detail"
                >
                    <div
                        class="btn replace"
                        @click="replace('puzzle')"
                    >
                        更换拼图
                    </div>
                </div>
            </div>
            <!--日期-->
            <div
                :style="{height: dateHeight + 'px'}"
                class="category date"
            >
                <div
                    class="title"
                    @click="openDate"
                >
                    <span>日期</span>
                    <i
                        :class="{'eqf-down':dateHeight !== heightClose,'eqf-right':dateHeight === heightClose}"
                        class="arrow"
                    />
                </div>
                <div
                    class="detail"
                    @click="$refs.dateRadiusPanel && $refs.dateRadiusPanel.hideSelectPanel()"
                >
                    <div class="name">
                        样式
                    </div>
                    <div
                        class="font-style-btn font-style-box"
                        @click="fontStyleSelect()"
                    >
                        <div
                            :style="{backgroundImage: getBackgroundImage(eqxElement.elementJson.property.fontStyleImgPath)}"
                            class="style-box"
                        />
                        <i
                            class="icon eqf-menu-right"
                        />
                    </div>
                    <setting-date
                        v-if="dateHeight > 0"
                        :model="property"
                        model-key="content"
                        @changeList="dateListChange"
                    />

                    <div class="name">
                        字体
                    </div>
                    <div
                        class="font-style-btn"
                        @click="fontTextSelect()"
                    >
                        <span>{{ eqxElement.elementJson.property.fontFamilyName?eqxElement.elementJson.property.fontFamilyName:'默认字体' }}</span>
                        <i
                            class="icon eqf-menu-right"
                        />
                    </div>
                    <div
                        v-if="textTypeSelected !== textType.gradient"
                        class="name"
                    >
                        文字颜色字号
                    </div>
                    <div
                        v-if="textTypeSelected !== textType.gradient"
                        class="content"
                    >
                        <div class="left">
                            <setting-color
                                :model="css"
                                model-key="color"
                            />
                        </div>
                        <div
                            data-hint="左右拖动改变大小"
                            class="right hint--top hint--rounded"
                        >
                            <base-input
                                :model="css"
                                :min="0"
                                model-key="fontSize"
                            />
                        </div>
                    </div>
                    <div
                        v-if="[textType.text,textType.shadow,textType.cube,textType.stroke].includes(textTypeSelected)"
                        class="name"
                    >
                        背景颜色
                    </div>
                    <setting-color
                        v-if="[textType.text,textType.shadow,textType.cube,textType.stroke].includes(textTypeSelected)"
                        :model="css"
                        model-key="backgroundColor"
                    />
                    <div
                        v-if="property && property.borderRadius && [textType.text,textType.shadow,textType.cube,textType.stroke].includes(textTypeSelected)"
                        class="name"
                    >
                        背景圆角
                    </div>
                    <setting-border-radius
                        v-if="property && property.borderRadius && [textType.text,textType.shadow,textType.cube,textType.stroke].includes(textTypeSelected)"
                        ref="dateRadiusPanel"
                        :model="property.borderRadius"
                        model-key="val"
                    />

                    <base-input
                        v-if="textTypeSelected === textType.gradient"
                        :model="css"
                        :min="0"
                        style="marginTop:12px"
                        model-key="fontSize"
                    />

                    <div
                        v-if="textTypeSelected === textType.gradient"
                        class="name"
                    >
                        文字颜色
                    </div>
                    <setting-gradient-color
                        v-if="textTypeSelected === textType.gradient"
                        :model="property"
                        :eqx-element="eqxElement"
                        model-key="gradient"
                    />
                    <div
                        v-if="textTypeSelected === textType.shake"
                        class="name"
                    >
                        颤抖颜色
                    </div>
                    <div
                        v-if="textTypeSelected === textType.shake"
                        class="content"
                    >
                        <div class="left">
                            <setting-color
                                :model="property"
                                model-key="shake"
                                model-key-type="0"
                            />
                        </div>
                        <div class="right">
                            <setting-color
                                :model="property"
                                model-key="shake"
                                model-key-type="1"
                            />
                        </div>
                    </div>
                    <div
                        v-if="textTypeSelected === textType.shake"
                        class="name"
                    >
                        颜色角度
                    </div>
                    <base-input
                        v-if="textTypeSelected === textType.shake"
                        :model="property"
                        :min="0"
                        :max="359"
                        model-key="angle"
                        unit=""
                        unit-view="°"
                    />
                    <div
                        v-if="textTypeSelected === textType.shake"
                        class="name"
                    >
                        颜色尺寸
                    </div>
                    <base-input
                        v-if="textTypeSelected === textType.shake"
                        :model="property"
                        :min="0"
                        model-key="shake"
                        model-key-type="size"
                        unit=""
                        unit-view=""
                    />
                    <div class="name">
                        内边距
                    </div>
                    <base-input
                        :model="css"
                        :min="0"
                        model-key="padding"
                    />
                    <div class="content">
                        <div class="name left">
                            行间距
                        </div>
                        <div class="name right">
                            字间距
                        </div>
                    </div>
                    <div
                        class="content"
                    >
                        <div class="left">
                            <div class="iconbox">
                                <i
                                    class="icon eqf-linehigh"
                                />
                            </div>

                            <div class="input">
                                <base-input
                                    :model="css"
                                    :min="100"
                                    :max="200"
                                    model-key="lineHeight"
                                    unit=""
                                    unit-view="%"
                                />
                            </div>
                        </div>

                        <div class="right">
                            <div class="iconbox">
                                <i
                                    class="icon eqf-lineshort"
                                />
                            </div>

                            <div class="input">
                                <base-input
                                    :model="css"
                                    :min="0"
                                    model-key="letterSpacing"
                                />
                            </div>
                        </div>
                    </div>
                    <setting-text-align
                        :model="css"
                        model-key="textAlign"
                    />
                    <setting-text-style
                        :model="css"
                        :text-type="property.type"
                    />
                </div>
            </div>
            <!--3D文字-->
            <div
                :style="{height: textThreeDHeight + 'px'}"
                class="category text-threed"
            >
                <div
                    class="title"
                    @click="openTextThreeD"
                >
                    <span>3D立体字</span>
                    <i
                        :class="{'eqf-down':textThreeDHeight !== heightClose,'eqf-right':textThreeDHeight === heightClose}"
                        class="arrow"
                    />
                </div>
                <div class="detail">
                    <setting-text-three-d
                        v-if="eqxElement.elementJson.type === this.enum.elementType.textThreeD"
                        :property="property"
                        :element="eqxElement"
                    />
                </div>
            </div>
            <!--描边&投影&立体-->
            <div
                v-if="eqxElement.elementJson.type !== this.enum.elementType.textThreeD"
                :style="{height: shadowHeight + 'px'}"
                class="category shadow"
            >
                <div
                    class="title"
                    @click="openShadow"
                >
                    <span>{{ nameOfShadowShow }}</span>
                    <i
                        :class="{'eqf-down':shadowHeight !== heightClose,'eqf-right':shadowHeight === heightClose}"
                        class="arrow"
                    />
                </div>
                <div class="detail">
                    <div>
                        <!--描边-->
                        <div
                            v-if="eqxElement.elementJson.type === this.enum.elementType.text ||
                                eqxElement.elementJson.type === this.enum.elementType.date"
                        >
                            <div
                                class="name"
                            >
                                描边颜色
                            </div>
                            <setting-color
                                :model="property"
                                model-key="stroke"
                                model-key-type="color"
                            />

                            <div class="name">
                                <p>描边尺寸</p>
                                <p
                                    v-if="textTypeSelected !== textType.gradient&&
                                        textTypeSelected !== textType.chartlet &&
                                        textTypeSelected !== textType.shake"
                                >
                                    描边距离
                                </p>
                            </div>
                            <div
                                class="content"
                            >
                                <div class="left">
                                    <base-input
                                        :model="property"
                                        :min="0"
                                        :max="10"
                                        model-key="stroke"
                                        model-key-type="size"
                                    />
                                </div>
                                <div
                                    v-if="textTypeSelected !== textType.gradient&&
                                        textTypeSelected !== textType.chartlet &&
                                        textTypeSelected !== textType.shake"
                                    class="right"
                                >
                                    <base-input
                                        :model="property"
                                        :min="0"
                                        :max="10"
                                        model-key="stroke"
                                        model-key-type="distance"
                                    />
                                </div>
                            </div>
                            <div
                                v-if="textTypeSelected !== textType.gradient&&
                                    textTypeSelected !== textType.chartlet"
                                class="split-line"
                            />
                        </div>
                        <!--投影-->
                        <div
                            v-if="textTypeSelected !== textType.gradient&&
                                textTypeSelected !== textType.chartlet"
                        >
                            <div class="name">
                                投影颜色
                            </div>
                            <setting-color
                                :model="property"
                                model-key="dropShadow"
                                model-key-type="color"
                            />
                            <div class="name">
                                <p>横向距离</p>
                                <p>纵向距离</p>
                            </div>
                            <div
                                class="content"
                            >
                                <div class="left">
                                    <base-input
                                        :model="property"
                                        model-key="dropShadow"
                                        model-key-type="x"
                                        unit-view=""
                                    />
                                </div>
                                <div class="right">
                                    <base-input
                                        :model="property"
                                        model-key="dropShadow"
                                        model-key-type="y"
                                        unit-view=""
                                    />
                                </div>
                            </div>
                            <div class="name">
                                模糊
                            </div>
                            <base-input
                                :model="property"
                                :min="0"
                                model-key="dropShadow"
                                model-key-type="blur"
                                unit-view=""
                            />
                            <div class="name">
                                透明度
                            </div>
                            <base-input
                                :model="property"
                                :min="0"
                                :max="100"
                                model-key="dropShadow"
                                model-key-type="transparency"
                                unit=""
                                unit-view="%"
                            />
                        </div>
                        <!--立体-->
                        <div
                            v-if="(eqxElement.elementJson.type === this.enum.elementType.text ||
                                eqxElement.elementJson.type === this.enum.elementType.date)&&
                                textTypeSelected !== textType.gradient&&
                                textTypeSelected !== textType.chartlet &&
                                textTypeSelected !== textType.shake"
                        >
                            <div
                                class="split-line"
                            />
                            <div class="name">
                                立体颜色
                            </div>
                            <setting-color
                                :model="property"
                                model-key="cube"
                                model-key-type="color"
                            />

                            <div class="name">
                                <p>尺寸</p>
                                <p>角度</p>
                            </div>
                            <div
                                class="content"
                            >
                                <div class="left">
                                    <base-input
                                        :model="property"
                                        :min="0"
                                        :max="50"
                                        model-key="cube"
                                        model-key-type="size"
                                    />
                                </div>
                                <div class="right">
                                    <base-input
                                        :model="property"
                                        :min="0"
                                        :max="359"
                                        model-key="angle"
                                        unit=""
                                        unit-view="°"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!--边框-->
            <div
                v-show="showBorder"
                :style="{height: borderHeight + 'px'}"
                class="category border"
            >
                <div
                    class="title"
                    @click="openBorder"
                >
                    <span>边框</span>
                    <i
                        :class="{'eqf-down':borderHeight !== heightClose,'eqf-right':borderHeight === heightClose}"
                        class="arrow"
                    />
                </div>
                <div class="detail">
                    <div class="name">
                        大小
                    </div>
                    <base-input
                        :model="css"
                        :min="0"
                        model-key="borderWidth"
                    />
                    <div class="name">
                        颜色
                    </div>
                    <setting-color
                        :model="css"
                        model-key="borderColor"
                    />
                </div>
            </div>
            <!--位置-->
            <div
                v-show="positionAllow"
                :style="{height: positionHeight + 'px'}"
                class="category position"
            >
                <div
                    class="title"
                    @click="openPosition"
                >
                    <span>位置</span>
                    <i
                        :class="{'eqf-down':positionHeight !== heightClose,'eqf-right':positionHeight === heightClose}"
                        class="arrow"
                    />
                </div>
                <div class="detail">
                    <div class="name">
                        旋转角度
                    </div>
                    <base-input
                        :model="css"
                        :min="0"
                        :max="359"
                        model-key="transform"
                        unit=""
                        unit-view="°"
                    />
                    <div class="name">
                        左边距
                    </div>
                    <base-input
                        :model="css"
                        model-key="left"
                    />
                    <div class="name">
                        上边距
                    </div>
                    <base-input
                        :model="css"
                        model-key="top"
                    />
                    <div
                        v-show="eqxElement.elementJson.type !== this.enum.elementType.textThreeD"
                        class="name"
                    >
                        宽度
                    </div>
                    <base-input
                        v-show="eqxElement.elementJson.type !== this.enum.elementType.textThreeD"
                        :model="css"
                        :min="0"
                        model-key="width"
                    />
                    <div
                        v-show="eqxElement.elementJson.type !== this.enum.elementType.text &&
                            eqxElement.elementJson.type !== this.enum.elementType.date &&
                            eqxElement.elementJson.type !== this.enum.elementType.textThreeD"
                        class="name"
                    >
                        高度
                    </div>
                    <base-input
                        v-show="eqxElement.elementJson.type !== this.enum.elementType.text &&
                            eqxElement.elementJson.type !== this.enum.elementType.date &&
                            eqxElement.elementJson.type !== this.enum.elementType.textThreeD"
                        :model="css"
                        :min="0"
                        model-key="height"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import SettingColor from './setting/SettingColor.vue'
import SettingAlign from './setting/SettingAlign.vue'
import SettingTextAlign from './setting/SettingTextAlign.vue'
import SettingTextStyle from './setting/SettingTextStyle.vue'
import SettingDate from './setting/SettingDate.vue'
import SettingBorderRadius from './setting/SettingBorderRadius.vue'
import SettingGradientColor from './setting/SettingGradientColor.vue'
import textType from '../../../config/enum.text.type'
import qrcodeType from '../../../config/enum.qrcode.type'
import storageLocal from '../../../utils/storageLocal'
import combineInitor from './workspace/combine.box.js'
import settingCombineText from './setting/settingCombineText.vue'
import expressType from '../../../config/enum.express.type'
import SettingArtQrcode from './setting/SettingArtQrcode.vue'
import SettingImageBaseTool from './setting/SettingImageBaseTool.vue'
import SettingTable from './setting/SettingTable.vue'
import SettingTextThreeD from './setting/SettingTextThreeD.vue'
import textThreeDTextStyle from '../../../config/enum.textThreeDText.style'
import SidePuzzle from '../../pages/puzzle/SidePuzzle.vue'
import puzzleMode from '../../../config/enum.puzzleMode.type'
import uploadDrag from '../../pages/create/index/uploadDrag'
import websocket from '../../pages/create/index/websocket'
import storageSession from '../../../utils/storageSession'
import statistic from '../../../config/statistic'

export default {
    components: {
        SettingColor,
        SettingAlign,
        SettingTextAlign,
        SettingTextStyle,
        SettingDate,
        settingCombineText,
        SettingBorderRadius,
        SettingGradientColor,
        SettingArtQrcode,
        SettingImageBaseTool,
        SettingTable,
        SettingTextThreeD
    },
    data() {
        return {
            textType,
            qrcodeType,
            textHeight: 0,
            dateHeight: 0,
            imageHeight: 0,
            gifHeight: 0,
            shapeHeight: 0,
            frameHeight: 0,
            qrcodeHeight: 0,
            positionHeight: 0,
            borderHeight: 0,
            shadowHeight: 0,
            combineHeight: 0,
            tableHeight: 0,
            puzzleHeight: 0,
            alignHeight: 147,
            combineTextHeight: 513 + 66,
            backgroundPositionActive: 4,
            positionAllow: true, // 允许变动位置 旋转等参数 编组之后的元素不允许变动
            isCombine: false,
            dateListCount: 0, // 日期组件编辑项数
            expressType,
            shapeIndex: 0,
            textThreeDHeight: 0,
            isPrueColorShow: true // 默认显示纯色（形状组件）
        }
    },
    computed: {
        fontStyleLayer() {
            return this.$store.state.fontStyle.layer
        },
        fontTextLayer() {
            return this.$store.state.fontStyle.text
        },
        nav() {
            return this.$store.state.layout.nav
        },
        scence() {
            return this.$store.state.scene.eqxScene
        },
        expressMode() {
            return this.$store.state.scene.expressMode
        },
        eqxPage() {
            return this.$store.state.scene.eqxPage
        },
        eqxElementsSelected() {
            return this.$store.state.scene.eqxElementsSelected
        },
        fontStyle() {
            return this.$store.state.fontStyle
        },
        fontStyleSelected() {
            return this.fontStyle.selectedItem || {}
        },
        textTypeSelected() {
            return this.eqxElement.elementJson.property.type
        },
        qcTypeSelected() {
            return this.eqxElement.elementJson.property.qcType
        },
        eqxElement() {
            return this.eqxElementsSelected[0]
        },
        css() {
            return this.eqxElement.elementJson.css
        },
        property() {
            return this.eqxElement.elementJson.property
        },
        gradient() {
            return this.eqxElement.elementJson.property.gradient
        },
        shapeItems() {
            return this.eqxElement.elementJson.property.items
        },
        shapeGradientEnabled() {
            return this.eqxElement.elementJson.property.gradient.enabled
        },
        // 3D文字样式类型
        textThreeDTextStyleType() {
            return this.eqxElement.elementJson.property.textStyleType
        },
        heightHide() {
            return 0
        },
        heightClose() {
            return 40
        },
        heightTextOpen() {
            let height = 341
            const textTypes = this.eqxElement.elementJson.property.type
            switch (textTypes) {
                case textType.text: height = 473 + 66 + 24 + 18; break // 加24 是因为加了一个行间距和字间距的标题占用的
                case textType.shadow: height = 407 + 66 + 24 + 66 + 18; break
                case textType.gradient : height = 588 + 24 + 18; break
                case textType.cube:height = 407 + 66 + 66 + 24 + 18; break // 背景颜色对立体字型放开了 俩个66：一个圆角 一个背景颜色
                case textType.stroke:height = 407 + 66 + 24 + 66 + 18; break
                case textType.shake:height = 605 + 24 + 18; break
                case textType.chartlet:height = 407 + 24 + 18; break
            }
            this.refreshScroll()
            return this.heightClose + height
        },
        showArtQrcode() {
            return this.user.allow('showArtQrcode')
        },
        heightQrcodeOpen() {
            let height = 0
            const qcType = this.property.qcType
            const isArt = this.property.isArt
            switch (qcType) {
                case qrcodeType.work:
                case qrcodeType.map :
                case qrcodeType.wechat:
                    height = this.expressMode ? 67 : 67 + 108
                    break
                case qrcodeType.text:
                case qrcodeType.link:
                    height = this.expressMode ? 83 : 83 + 108
                    break
                case qrcodeType.card:
                    height = this.expressMode ? 149 : 149 + 108
                    break
            }
            if (!this.expressMode) {
                if (isArt) {
                    height += 40
                } else {
                    height += 96
                }
                if (this.showArtQrcode && isArt) {
                    height += 1351
                }
            }

            this.refreshScroll()
            return this.heightClose + height
        },
        heightImageOpen() {
            const height = [expressType.image, expressType.product].includes(this.expressMode) ? 215 + 63 : 215 + 105
            return this.heightClose + height
        },
        heightImageClose() {
            const height = [expressType.image, expressType.product].includes(this.expressMode) ? 63 : 105
            return this.heightClose + height
        },
        heightFrameOpen() {
            return this.heightClose + 257
        },
        heightPuzzleOpen() {
            return this.heightClose + 62
        },
        heightGifOpen() {
            return 123
        },
        heightShapeOpen() {
            const replaceHeight = 52
            const otherHeight = this.shapeItems.length > 0 ? 199 : 149
            const pureColorHeight = this.shapeItems.length * 66
            const gradientColorHeight = 169
            return replaceHeight + this.heightClose + otherHeight + (this.isPrueColorShow ? pureColorHeight : gradientColorHeight)
        },
        heightShapeClose() {
            const height = 52
            return this.heightClose + height
        },
        heightDateOpen() {
            let height = 407
            const dateType = this.eqxElement.elementJson.property.type
            switch (dateType) {
                case textType.text: height = 473 + 66 + 24 + 18; break // 加了18 是因为样式UI做了调整
                case textType.shadow: height = 407 + 66 + 24 + 66 + 18; break
                case textType.gradient : height = 588 + 24 + 18; break
                case textType.cube:height = 407 + 66 + 66 + 24 + 18; break
                case textType.stroke:height = 407 + 66 + 24 + 66 + 18; break
                case textType.shake:height = 605 + 24 + 18; break
                case textType.chartlet:height = 407 + 24 + 18; break
            }
            this.refreshScroll()
            return this.heightClose + height + this.dateListCount * 66
        },
        heightPositionOpen() {
            return this.heightClose + 347
        },
        heightShadowOpen() {
            if ((this.eqxElement.elementJson.type !== this.enum.elementType.text) && (this.eqxElement.elementJson.type !== this.enum.elementType.date)) {
                return this.heightClose + 281
            } else if (this.textTypeSelected === textType.gradient || this.textTypeSelected === textType.chartlet) {
                return this.heightClose + 149
            } else if (this.textTypeSelected === textType.shake) {
                return this.heightClose + 424
            } else {
                return this.heightClose + 567
            }
        },
        heightBorderOpen() {
            return this.heightClose + 149
        },
        heightAlignOpen() {
            return this.heightClose + 147
        },
        heightCombineOpen() {
            return this.alignHeight + this.combineTextHeight + 40 + 67 + 100 // 最后留空100 避免滚动不下来
        },
        heightTableOpen() {
            return 40 + 40 + 222 + 298
        },
        heightCombineClose() {
            return 67
        },
        // 返回3D文字属性栏展开高度
        heightTextThreeDOpen() {
            let height = 0
            if (this.textThreeDTextStyleType === textThreeDTextStyle.color) {
                height = 597
            } else if (this.textThreeDTextStyleType === textThreeDTextStyle.gradient) {
                height = 736
            } else if (this.textThreeDTextStyleType === textThreeDTextStyle.texture) {
                height = 687
            }
            return height
        },
        storageLocalKey() {
            return storageLocal.key
        },
        nameOfShadowShow() {
            if ((this.eqxElement.elementJson.type !== this.enum.elementType.text) && (this.eqxElement.elementJson.type !== this.enum.elementType.date)) {
                return '投影'
            } else if (this.textTypeSelected === textType.gradient || this.textTypeSelected === textType.chartlet) {
                return '描边'
            } else if (this.textTypeSelected === textType.shake) {
                return '描边&投影'
            } else {
                return '描边&投影&立体'
            }
        },
        styleList() {
            return this.$store.state.fontStyle.list
        },
        // 判断是不是展示变量属性
        showBorder() {
            if (this.eqxElement.elementJson.type === this.enum.elementType.qrcode) {
                // 文本 连接  和艺术二维码不设置边框
                return this.positionAllow && ![this.qrcodeType.link, this.qrcodeType.text].includes(this.qcTypeSelected) && !this.eqxElement.elementJson.property.isArt
            } else {
                return this.positionAllow
            }
        }
    },
    watch: {
        heightCombineOpen(newVal) {
            this.combineHeight = newVal
        },
        eqxElementsSelected(newVal) {
            this.setInitOpen(this.eqxElementsSelected)
        },
        css: {
            handler(newVal) {
                this.eqxElement.updateCss(newVal)
                if (this.eqxElement.elementJson.type === this.enum.elementType.text && this.eqxElement.combineBox) {
                    if (this.eqxElement.elementJson.origin && (this.eqxElement.elementJson.origin.height !== this.eqxElement.elementJson.css.height ||
                        this.eqxElement.elementJson.origin.width !== this.eqxElement.elementJson.css.width ||
                        this.eqxElement.elementJson.origin.padding !== this.eqxElement.elementJson.css.padding)) {
                        setTimeout(() => {
                            combineInitor.reCalculateCombineBox(this.eqxElement.combineBox)
                        }, 40)
                    }
                }
            },
            deep: true
        },
        property: {
            handler(newVal) {
                // 多个组件时，会按添加顺序取第1个组件的属性，有则会显示，所以限制只有单选时才处理
                if (this.eqxElementsSelected.length === 1 && this.eqxElement.elementJson.type === this.enum.elementType.qrcode) {
                    if (this.property.text && this.property.text.length > 300) {
                        this.property.text = this.property.text.substr(0, 300)
                    }
                    if (this.property.card) {
                        this.changeCardValue('name')
                        this.changeCardValue('phone')
                    }
                    // 公众号和艺术二维码不需要更新
                    if (!this.eqxElement.elementJson.property.isArt) {
                        this.eqxElement.updateProperty(newVal)
                    }

                    this.qrcodeHeight = this.heightQrcodeOpen
                }

                if (this.eqxElement.elementJson.type === this.enum.elementType.text) {
                    this.eqxElement.updateProperty(newVal)
                }

                if (this.eqxElement.elementJson.type === this.enum.elementType.image) {
                    this.eqxElement.updateProperty(newVal)
                }

                if (this.eqxElement.elementJson.type === this.enum.elementType.shape) {
                    this.eqxElement.updateProperty(newVal)
                }

                if (this.eqxElement.elementJson.type === this.enum.elementType.date) {
                    this.eqxElement.updateProperty(newVal)
                }

                if (this.eqxElement.elementJson.type === this.enum.elementType.frame) {
                    this.eqxElement.updateProperty(newVal)
                }

                if (this.eqxElement.elementJson.type === this.enum.elementType.textThreeD) {
                    if (newVal.textTexture.changeTexture === true) {
                        this.eqxElement.updateTexture(newVal)
                        newVal.textTexture.changeTexture = false
                    }
                    if (newVal.change === true) {
                        this.eqxElement.updateGeometry(newVal)
                        newVal.change = false
                    }
                    if (newVal.textGradient.change === true) {
                        this.eqxElement.updateGradient(newVal)
                        delete newVal.textGradient.change
                    }
                }

                this.backgroundPositionActive = this.property.backgroundPositionActive === undefined ? 4 : this.property.backgroundPositionActive
            },
            deep: true
        },
        shapeItems: {
            handler(newVal) {
                // 多个组件时，会按添加顺序取第1个组件的属性，有则会显示，所以限制只有单选时才处理
                if (this.eqxElementsSelected.length === 1 && this.eqxElement.elementJson.type === this.enum.elementType.shape) {
                    this.shapeHeight = this.heightShapeOpen
                    this.refreshScroll()
                }
            },
            deep: true,
            immediate: true
        },
        // 3D文字样式类型监听
        textThreeDTextStyleType: {
            handler(newVal) {
                // 多个组件时，会按添加顺序取第1个组件的属性，有则会显示，所以限制只有单选时才处理
                if (this.eqxElementsSelected.length === 1 && this.eqxElement.elementJson.type === this.enum.elementType.textThreeD) {
                    this.textThreeDHeight = this.heightTextThreeDOpen
                    this.refreshScroll()
                }
            },
            deep: true,
            immediate: true
        },
        fontStyleSelected() {
            const type = this.eqxElement.elementJson.type
            if (type === this.enum.elementType.text) {
                this.textHeight = this.heightTextOpen
                this.refreshScroll()
            } else if (type === this.enum.elementType.date) {
                this.dateHeight = this.heightDateOpen
                this.refreshScroll()
            }
        },
        isPrueColorShow: {
            handler() {
                this.shapeHeight = this.heightShapeOpen
                this.refreshScroll()
            }
        }
    },
    mounted() {
        this.setInitOpen(this.eqxElementsSelected)
    },
    methods: {
        initStyleFontImg() {
            // 初始化加载 字体图片
            const fontstylename = this.eqxElement.elementJson.property.fontstylename
            const matchStyleItem = this.styleList.find(item => item.name === fontstylename)
            if (matchStyleItem) {
                this.eqxElement.elementJson.property.fontStyleImgPath = matchStyleItem.cover
            }
        },
        getFontNameByFontFamily() {
            this.api.product.getNewProducts({ apiCode: Vue.env.mall.apiCode[1], categoryId: Vue.env.mall.fontId, pageSize: 100, pageNo: 1 })
                .then(res => {
                    res.data.list.forEach(item => {
                        if (this.eqxElement && this.eqxElement.elementJson) {
                            const matchFamily = this.eqxElement.elementJson.css.fontFamily
                            if (matchFamily === item.productTypeMap.font_family + '_pre' || matchFamily === item.productTypeMap.font_family) {
                                this.eqxElement.elementJson.property.fontFamilyName = item.name
                            }
                        }
                    })
                })
                .catch(err => err && this.logger.error(err))
        },
        changeCardValue(item) {
            if (this.property.card[item].length > 20) {
                this.property.card[item] = this.property.card[item].substr(0, 20)
            }
        },
        setInitOpen(eqxElementsSelected) {
            this.textHeight = // 文本
            this.imageHeight = // 图片
            this.gifHeight = // gif
            this.shapeHeight = // 形状
            this.qrcodeHeight = // 二维码
            this.dateHeight = // 日期
            this.frameHeight = // 嵌入框
            this.textThreeDHeight = // 3D字
            this.tableHeight = // 表格
            this.puzzleHeight = this.heightHide // 拼图

            this.combineHeight = this.heightHide // 多选组合

            this.positionHeight = this.heightHide // 位置
            this.borderHeight = this.heightHide // 边框
            this.shadowHeight = this.heightHide // 描边&投影&立体

            this.$store.commit('FONT_STYLE_LAYER', { show: false })
            this.$store.commit('FONT_TEXT_LAYER', { show: false })
            this.$store.commit('TEXT_THREED_STYLE_LAYER', { show: false })
            this.$store.commit('TEXT_THREED_TEXTURE_LAYER', { show: false })

            const { text, image, shape, qrcode, frame, combine, date, gif, table, textThreeD, puzzle } = this.enum.elementType

            if (eqxElementsSelected.length > 1) {
                // 多选组件
                this.combineHeight = this.heightCombineOpen

                // 判断多选是不是包含combine组件  ctrl+a 全选的时候 会出现这种场景
                eqxElementsSelected.map(item => {
                    if (item.elementJson.type === combine) {
                        this.positionAllow = true
                        this.isCombine = item.isCombine
                    } else {
                        if (item.combineBox) {
                            this.isCombine = item.combineBox.isCombine
                        } else {
                            this.isCombine = false
                        }
                    }
                })
            } else {
                // 单选组件
                const type = eqxElementsSelected[0].elementJson.type
                this.positionAllow = true

                if (type === text) {
                    this.textHeight = this.heightTextOpen
                    this.positionHeight = this.heightClose // 位置
                    this.borderHeight = this.heightClose // 边框
                    this.shadowHeight = this.heightClose // 描边&投影&立体

                    this.helpnotifier.open('text', '点击文字样式可以设置艺术字特效', {
                        top: '100px',
                        right: '185px'
                    })
                    // 保存 组合框中text元素初始的宽高 便于组合框大小重新绘制
                    if (this.eqxElement.combineBox) {
                        this.eqxElement.elementJson.origin = {
                            width: this.eqxElement.elementJson.css.width,
                            height: this.eqxElement.elementJson.css.height,
                            padding: this.eqxElement.elementJson.css.padding
                        }
                    }
                    this.getFontNameByFontFamily()
                    this.initStyleFontImg()
                }

                if (type === shape) {
                    this.isPrueColorShow = this.shapeGradientEnabled === false
                    this.shapeHeight = this.heightShapeOpen
                    this.positionHeight = this.heightClose // 位置
                    this.shadowHeight = this.heightClose // 描边&投影&立体
                }

                if (type === image) {
                    this.imageHeight = this.heightImageOpen
                    this.positionHeight = this.heightClose // 位置
                    this.borderHeight = this.heightClose // 边框
                    this.shadowHeight = this.heightClose // 描边&投影&立体
                }

                if (type === gif) {
                    this.gifHeight = this.heightGifOpen
                }

                if (type === qrcode) {
                    this.qrcodeHeight = this.heightQrcodeOpen
                    this.positionHeight = this.heightClose // 位置
                }

                if (type === frame) {
                    this.frameHeight = this.heightFrameOpen
                    this.positionHeight = this.heightClose // 位置
                    this.shadowHeight = this.heightClose // 描边&投影&立体
                }

                if (type === date) {
                    this.dateHeight = this.heightDateOpen
                    this.positionHeight = this.heightClose // 位置
                    this.borderHeight = this.heightClose // 边框
                    this.shadowHeight = this.heightClose // 描边&投影&立体

                    this.refreshScroll()
                    this.getFontNameByFontFamily()
                    this.initStyleFontImg()
                }

                if (type === combine) {
                    this.positionAllow = true
                    this.isCombine = this.eqxElement.isCombine
                    this.combineHeight = this.heightCombineOpen

                    this.refreshScroll()
                }

                if (type === textThreeD) {
                    this.textThreeDHeight = this.heightTextThreeDOpen
                    this.positionHeight = this.heightClose // 位置
                }

                if (type === table) {
                    this.tableHeight = this.heightTableOpen
                    this.positionHeight = this.heightPositionOpen

                    this.refreshScroll()
                }

                if (type === puzzle) {
                    this.puzzleHeight = this.heightPuzzleOpen
                    this.positionHeight = this.heightClose // 位置
                }

                if (eqxElementsSelected[0].combineBox && type !== combine) {
                    this.positionAllow = true
                    this.isCombine = eqxElementsSelected[0].combineBox.isCombine
                }
                if (this.eqxElement.combineBox) {
                    this.positionAllow = false
                    const parent = this.eqxElement.combineBox.combineBox ? this.eqxElement.combineBox.combineBox : this.eqxElement.combineBox
                    this.combineHeight = parent.isCombine ? this.heightCombineClose : this.heightCombineOpen
                }
            }
        },

        openText() {
            this.textHeight = this.textHeight === this.heightClose ? this.heightTextOpen : this.heightClose
            this.refreshScroll()
        },
        openImage() {
            const sHeight = [expressType.image, expressType.product].includes(this.expressMode) ? 63 : 105
            this.imageHeight = this.imageHeight === this.heightClose + sHeight ? this.heightImageOpen : this.heightClose + sHeight
            this.refreshScroll()
        },
        openGifImage() {
            this.gifHeight = this.gifHeight === this.heightClose ? this.heightGifOpen : this.heightClose
            this.refreshScroll()
        },
        openShape() {
            const sHeight = 52
            this.shapeHeight = this.shapeHeight === this.heightClose + sHeight ? this.heightShapeOpen : this.heightClose + sHeight
            this.refreshScroll()
        },
        openFrame() {
            this.frameHeight = this.frameHeight === this.heightClose ? this.heightFrameOpen : this.heightClose
            this.refreshScroll()
        },
        openPuzzle() {
            this.puzzleHeight = this.puzzleHeight === this.heightClose ? this.heightPuzzleOpen : this.heightClose
            this.refreshScroll()
        },
        openQrcode() {
            this.qrcodeHeight = this.qrcodeHeight === this.heightClose ? this.heightQrcodeOpen : this.heightClose
            this.refreshScroll()
        },
        openDate() {
            this.dateHeight = this.dateHeight === this.heightClose ? this.heightDateOpen : this.heightClose
            this.refreshScroll()
        },
        openPosition() {
            this.positionHeight = this.positionHeight === this.heightClose ? this.heightPositionOpen : this.heightClose
            this.refreshScroll()
        },
        openShadow() {
            this.shadowHeight = this.shadowHeight === this.heightClose ? this.heightShadowOpen : this.heightClose
            this.refreshScroll()
        },
        openBorder() {
            this.borderHeight = this.borderHeight === this.heightClose ? this.heightBorderOpen : this.heightClose
            this.refreshScroll()
        },
        openTextThreeD() {
            this.textThreeDHeight = this.textThreeDHeight === this.heightClose ? this.heightTextThreeDOpen : this.heightClose
            this.refreshScroll()
        },
        refreshScroll() {
            // 刚显示又隐藏this.$refs.setting会没有值
            // 300ms是指需要等动画执行完了再刷新
            setTimeout(() => this.$refs.setting && this.$refs.setting.myScroll.refresh(), 300)
        },
        qrcodeBlur() {
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        showQrcodeLogo(type) {
            this.eqxElement.elementJson.property.type = type
            this.eqxPage.eqxHistory.add(this.eqxPage)
            if (type) {
                this.$store.commit('LAYOUT_NAV_PANEL', { show: true })
                this.notifier.info('从左侧上传或素材中拖拽图片到二维码上可设置logo')
            }
        },
        rotateComp(type) {
            let property = this.eqxElement.elementJson.property
            if (this.eqxElement.elementJson.type === this.enum.elementType.image) {
                // 图片的旋转要用数字记录
                const newProperty = {
                    rotateX: property.rotateX || 0,
                    rotateY: property.rotateY || 0
                }
                if (type === 'rotateX') {
                    if (newProperty.rotateX === 0) {
                        newProperty.rotateX = 180
                    } else if (newProperty.rotateX === 180) {
                        newProperty.rotateX = 0
                    } else {
                        newProperty.rotateX += 180
                    }
                    newProperty.rotateX = newProperty.rotateX % 360
                }
                if (type === 'rotateY') {
                    if (newProperty.rotateY === 0) {
                        newProperty.rotateY = 180
                    } else if (newProperty.rotateY === 180) {
                        newProperty.rotateY = 0
                    } else {
                        newProperty.rotateY += 180
                    }
                    newProperty.rotateY = newProperty.rotateY % 360
                }
                property = Object.assign(property, newProperty)
            } else {
                property = Object.assign(property, {
                    rotateX: type === 'rotateX' ? !property.rotateX : property.rotateX,
                    rotateY: type === 'rotateY' ? !property.rotateY : property.rotateY
                })
            }
            this.eqxElement.updateProperty(property)
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },

        dateListChange(msg) {
            this.dateListCount = msg.count
            this.dateHeight = this.heightDateOpen
        },
        combineClick() {
            this.isCombine = !this.isCombine
            // 兼容 图层优化
            if (this.eqxElement.elementJson.type !== this.enum.elementType.combine) {
                combineInitor.initCombine(this.eqxElementsSelected, this.eqxPage)
            }
            const combineElement = this.eqxElement
            if (combineElement.combineBox) {
                combineElement.combineBox.isCombine = this.isCombine
                combineElement.combineBox.elementBox.isCombine = this.isCombine // 改变选中框的样式
                this.isCombine && combineElement.combineBox.flatCombine(combineElement.combineBox, this.eqxPage) // 组合不允许嵌套
            } else {
                combineElement.isCombine = this.isCombine
                combineElement.elementBox.isCombine = this.isCombine // 改变选中框的样式
                this.isCombine && combineElement.flatCombine(combineElement, this.eqxPage) // 组合不允许嵌套
            }

            this.refreshScroll()
            this.eqxPage.eqxHistory.add(this.eqxPage)
        },
        fontStyleSelect() {
            this.$store.commit('FONT_STYLE_LAYER', { show: !this.fontStyleLayer.show })
        },
        fontTextSelect() {
            this.$store.commit('FONT_TEXT_LAYER', { show: !this.fontTextLayer.show })
        },
        changeHeight(combineTextHeight) {
            this.combineTextHeight = combineTextHeight
            this.refreshScroll()
        },
        replace(type) {
            let navType = ''
            if (type === 'frame') {
                this.notifier.info('从左侧素材或上传中拖拽图片进行替换')
                navType = 'upload'
                const navs = this.nav.list.filter((v, i) => v.type === navType)
                const item = navs[0]
                this.$store.commit('LAYOUT_NAV', { item })
                this.$store.commit('LAYOUT_NAV_PANEL', { show: true })
            } else if (type === 'shape') {
                this.dialog.openMaterialLib({ type: 'shape' })
                    .then(res => {
                        if (res && res.success) {
                            this.eqxElement.$el.innerHTML = ''
                            this.eqxElement.setSvg(res.path)
                                .then(() => {
                                    const items = this.getShapeItems(this.eqxElement.$paths)
                                    const property = {
                                        items: items,
                                        url: res.path
                                    }
                                    this.eqxElement.updateProperty(property)
                                    this.eqxPage.eqxHistory.add(this.eqxPage)
                                })
                        }
                    })
                    .catch(err => {
                        err && this.logger.error(err)
                    })
            } else if (type === 'puzzle') {
                this.openSidePuzzle()
            }
        },
        setMainEditorView(show) {
            websocket.unbind()
            uploadDrag.unbind()
            Vue.store.commit('MAIN_EDITOR_VIEW', { show })
        },
        openSidePuzzle() {
            this.setMainEditorView(false)
            const property = this.eqxElement.elementJson.property
            const info = {
                name: property.name,
                src: property.src,
                frames: property.frames
            }

            storageSession.setItem(storageSession.key.puzzleInfo, JSON.stringify(info))
            const options = {
                component: SidePuzzle,
                data: {
                    mode: puzzleMode.setting
                }
            }
            this.slide.open(options)
                .then((res) => {
                    this.setMainEditorView(true)
                    if (res && res.type === 'finish') {
                        const { property: frameInfo } = res.data
                        property.name = frameInfo.name
                        property.frames = frameInfo.frames
                        property.src = frameInfo.src
                        this.eqxElement.updateSvg(property)
                        this.eqxPage.eqxHistory.add(this.eqxPage)
                    }
                })
                .catch((err) => {
                    err && this.logger.error(err)
                    this.setMainEditorView(true)
                })
            window._hmt.push(['_trackEvent',
                statistic.category.F,
                statistic.action.PUZZLE,
                statistic.opt_label.PUZZLE.clickSetting])
        },
        getShapeItems($paths) {
            const items = []

            // 形状颜色是否可设置的限制条件
            if ($paths.length < 6) {
                $paths.forEach($path => {
                    const styleFill = $path.css('fill')
                    const attrFill = $path.attr('fill')
                    const fill = styleFill || attrFill || 'rgba(0,0,0,0)'
                    items.push({ fill })
                })
            }
            return items
        },
        shapeColorClick(index) {
            this.shapeIndex = index
        },
        getBackgroundImage(src) {
            src = Vue.filter('qiniuZoom')(src, 124)
            if (this.eqxElement.elementJson.property.fontstylename === '无样式' || this.eqxElement.elementJson.property.fontstylename === '') {
                return Vue.filter('backgroundImage')(null, src)
            } else {
                return Vue.filter('backgroundImage')(src)
            }
        },
        tableHeightChange(val) {
            this.tableHeight = val
            this.refreshScroll()
        }
    }

}
</script>

<style lang="scss">
.eqc-setting {
    position: absolute;
    right: 0;
    top: 0;
    width: 184px;
    height: 100%;
    background: #fff;
    .category {
        overflow: hidden;
        transition: all 0.3s;
        &.active {
            .title {
                .box::after {
                    opacity: 1;
                }
            }
        }
        .buttonArea {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 15px 0;
            background: #eceef0;
            border-bottom: 1px solid #ccd5db;
            .combine-btn {
                color: #252b3f;
                font-size: 12px;
            }
        }
        .title {
            position: relative;
            width: 100%;
            height: 40px;
            line-height: 38px;
            padding-left: 16px;
            color: #4f5d69;
            border-bottom: 1px solid #ccd5db;
            font-size: 12px;
            transition: all 0.3s;
            background: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            &:hover {
                background: #f7f8f9;
            }
            .arrow {
                font-size: 16px;
                margin-right: 16px;
            }
        }
        .shape-replace {
            width: 100%;
            height: 52px;
            border-bottom: 1px solid #ccd5db;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #eceef0;
            .shape-replace-btn {
                width: 152px;
                height: 30px;
                background: rgba(255, 255, 255, 1);
                border: 1px solid rgba(204, 213, 219, 1);
                font-size: 12px;
                font-weight: 400;
                color: rgba(37, 43, 63, 1);
                text-align: center;
                line-height: 30px;
            }
        }
        .color-btns {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            font-size: 12px;
            margin: 12px 0;
            > div {
                margin-right: 12px;
                padding: 6px 8px;
                background: #ffffff;
                border: 1px solid #ccd5db;
                border-radius: 2px;
                color: #252b3f;
                cursor: pointer;
                &:hover {
                    background-color: #1593ff;
                    color: #ffffff;
                    border: 1px solid #1593ff;
                }
            }
            .actived {
                background-color: #1593ff;
                color: #ffffff;
                border: 1px solid #1593ff;
            }
        }
        .detail {
            padding: 0 16px 16px;
            background: #eceef0;
            transition: all 0.3s;
            border-bottom: 1px solid #ccd5db;
            .btn {
                width: 150px;
                height: 30px;
                font-size: 12px;
                display: inline-block;
                text-align: center;
                line-height: 30px;
                color: #2f3c4d;
                background: #ffffff;
                border: 1px solid #ccd5db;
                cursor: pointer;
                position: relative;
                &:hover {
                    color: $blue-normal;
                    background: #fff;
                }
            }
            .replace {
                margin-top: 12px;
            }
            .crop {
                margin-top: 12px;
            }
            .font-style-box {
                height: 48px !important;
                line-height: 48px !important;
                padding: 8px 8px 8px 12px !important;
                .style-box {
                    width: 71px;
                    height: 32px;
                    background-size: cover;
                }
                .icon {
                    top: 8px !important;
                }
            }
            .font-style-btn {
                position: relative;
                width: 100%;
                height: 30px;
                line-height: 28px;
                padding: 0 28px 0 12px;
                background: #fff;
                border: 1px solid #ccd5db;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                font-size: 12px;
                cursor: pointer;
                .icon {
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: 28px;
                    height: 28px;
                    font-size: 22px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }
            .name {
                height: 36px;
                line-height: 36px;
                font-size: 12px;
                color: #4f5d69;
                display: flex;
                > p {
                    flex: 1;
                }
            }
            .content {
                display: flex;
                justify-content: space-between;
                > div {
                    flex: 3;
                }

                .left,
                .right {
                    margin-right: 4px;
                    display: flex;
                    .iconbox {
                        flex: 1;
                        border: 1px solid #ccd5db;
                        border-right: none;
                        background: #f7f8f9;
                        color: #76838f;
                    }
                    .input {
                        flex: 2;
                    }
                }
                p {
                    flex: 2;
                    margin: 0 4px;
                    border: 1px solid #ccd5db;
                }
                .right {
                    margin-left: 4px;
                    margin-right: 0;
                }
                .icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    font-size: 18px;
                }
            }
            .text {
                width: 100%;
                height: 30px;
                padding: 0 12px;
                border: 1px solid #ccd5db;
                font-size: 12px;
            }
            .logo {
                display: flex;
                margin-top: 16px;
                border: 1px solid #ccd5db;
                background: #f7f8f9;
                .item {
                    flex: 1;
                    height: 28px;
                    line-height: 28px;
                    text-align: center;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.3s;
                    &.active,
                    &:hover {
                        color: $blue-normal;
                        background: #fff;
                    }
                    &:not(:last-child) {
                        border-right: 1px solid #ccd5db;
                    }
                }
            }
            .rotate {
                display: flex;
                justify-content: space-around;
                .item {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 72px;
                    height: 30px;
                    border: 1px solid #ccd5db;
                    background: #fff;
                    transition: all 0.3s;
                    cursor: pointer;
                    .tip {
                        margin-left: 6px;
                        font-size: 12px;
                    }
                    &:hover {
                        color: $blue-normal;
                    }
                }
            }
            .empty {
                text-align: center;
                color: #ffffff;
                font-size: 12px;
                line-height: 16px;
            }
            .split-line {
                width: 100%;
                height: 1px;
                border-top: 1px dashed #ccd5db;
                margin-top: 10px;
            }
        }
    }
}
</style>
