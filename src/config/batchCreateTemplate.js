const templateCategoryArray = [
    {
        id: 'yqh',
        // 编辑器个数
        editorCount: 1,
        // 尺寸类别
        sizeType: [15, 15],
        // 模板分类id 数组第一个为测试id 第二个为预发布id
        categoryId: [893950, 895454],
        // 模板名称
        categoryName: '会议邀请函',
        // 标题
        title: '批量制作活动/会议邀请函',
        // 第一步文本
        stepOneText: '第一步：选择模板',
        // 第二步文本
        stepTwoText: '第二步：填写活动/会议基本信息',
        // 第三步文本
        stepThirdText: '第三步：填写被邀请人信息',
        // 继续添加按钮的文案
        continueAddText: '继续添加被邀请人信息',
        // 模板标签
        tags: [
            {
                id: 1,
                name: '会议名称', // 标签名称
                txt: '活动/会议名称', // 标签显示名称
                maxLength: 30, // 最大长度 or 最大尺寸
                type: 'text', // 类型(text,image)
                fillType: 'single', // 填充类型 单个(single)还是多个(multi)
                require: true, // 是否必填
                value: null, // 用户填写的值
                defaultValue: null, // 用于默认显示
                enable: true, // 是否启用
                asFileName: false // 作为作品和文件名称
            },
            {
                id: 2,
                name: '会议主题',
                txt: '活动/会议主题',
                maxLength: 15,
                type: 'text',
                fillType: 'single',
                require: false,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 3,
                name: '举办时间',
                txt: '举办时间',
                maxLength: 20,
                type: 'text',
                fillType: 'single',
                require: true,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 4,
                name: '地址',
                txt: '地址',
                maxLength: 25,
                type: 'text',
                fillType: 'single',
                require: true,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 5,
                name: '二维码引导语',
                txt: '二维码引导语',
                maxLength: 15,
                type: 'text',
                fillType: 'single',
                require: false,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 6,
                name: 'LOGO',
                txt: 'LOGO',
                maxSize: 5120,
                type: 'image',
                fillType: 'single',
                require: false,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 7,
                name: '二维码',
                txt: '二维码',
                maxSize: 5120,
                type: 'image',
                fillType: 'single',
                require: false,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 8,
                name: '被邀请人姓名',
                txt: '被邀请人姓名(如张三、张三先生等)',
                maxLength: 20,
                type: 'text',
                fillType: 'multi',
                require: true,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: true
            }
        ]
    },
    {
        id: 'mp',
        // 编辑器个数
        editorCount: 2,
        // 尺寸类别
        sizeType: [1, 26],
        // 模板分类id 数组第一个为测试id 第二个为预发布id
        categoryId: [894014, 896260],
        // 模板名称
        categoryName: '名片',
        // 标题
        title: '批量制作名片 (横版)',
        // 第一步文本
        stepOneText: '第一步：选择模板',
        // 第二步文本
        stepTwoText: '第二步：填写企业基本信息',
        // 第三步文本
        stepThirdText: '第三步：填写个人信息',
        // 继续添加按钮的文案
        continueAddText: '继续添加个人信息',
        // 模板标签
        tags: [
            {
                id: 1,
                name: '企业名称', // 标签名称
                txt: '企业名称', // 标签显示名称
                maxLength: 20, // 最大长度 or 最大尺寸
                type: 'text', // 类型(text,image)
                fillType: 'single', // 填充类型 单个(single)还是多个(multi)
                require: true, // 是否必填
                value: null, // 用户填写的值
                defaultValue: null, // 用于默认显示
                enable: true, // 是否启用
                asFileName: false // 作为作品和文件名称
            },
            {
                id: 2,
                name: '企业地址',
                txt: '企业地址',
                maxLength: 25,
                type: 'text',
                fillType: 'single',
                require: true,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 3,
                name: '网址',
                txt: '网址',
                maxLength: 30,
                type: 'text',
                fillType: 'single',
                require: false,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 4,
                name: '企业文化主题词',
                txt: '企业文化主题词',
                maxLength: 25,
                type: 'text',
                fillType: 'single',
                require: false,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 5,
                name: 'LOGO',
                txt: 'LOGO',
                maxSize: 5120,
                type: 'image',
                fillType: 'single',
                require: false,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 6,
                name: '姓名',
                txt: '<label class="field-name-require">*</label><label class="field-name">姓名</label>',
                maxLength: 20,
                type: 'text',
                fillType: 'multi',
                require: true,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: true
            },
            {
                id: 7,
                name: '英文名',
                txt: '英文名',
                maxLength: 20,
                type: 'text',
                fillType: 'multi',
                require: false,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 8,
                name: '职位',
                txt: '职位',
                maxLength: 10,
                type: 'text',
                fillType: 'multi',
                require: false,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 9,
                name: '电话',
                txt: '电话',
                maxLength: 15,
                type: 'text',
                fillType: 'multi',
                require: false,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 10,
                name: '邮箱',
                txt: '邮箱',
                maxLength: 30,
                type: 'text',
                fillType: 'multi',
                require: false,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 11,
                name: '二维码',
                txt: '二维码',
                maxSize: 5120,
                type: 'image',
                fillType: 'multi',
                require: false,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            }
        ]
    },
    {
        id: 'zs',
        // 编辑器个数
        editorCount: 1,
        // 尺寸类别
        sizeType: [58, 32],
        // 模板分类id 数组第一个为测试id 第二个为预发布id
        categoryId: [894015, 896278],
        // 模板名称
        categoryName: '证书 (竖版)',
        // 标题
        title: '批量制作证书 (竖版)',
        // 第一步文本
        stepOneText: '第一步：选择模板',
        // 第二步文本
        stepTwoText: '第二步：填写企业基本信息',
        // 第三步文本
        stepThirdText: '第三步：填写获奖信息',
        // 继续添加按钮的文案
        continueAddText: '继续添加获奖人信息',
        // 模板标签
        tags: [
            {
                id: 1,
                name: '企业名称', // 标签名称
                txt: '企业名称', // 标签显示名称
                maxLength: 20, // 最大长度 or 最大尺寸
                type: 'text', // 类型(text,image)
                fillType: 'single', // 填充类型 单个(single)还是多个(multi)
                require: true, // 是否必填
                value: null, // 用户填写的值
                defaultValue: null, // 用于默认显示
                enable: true, // 是否启用
                asFileName: false // 作为作品和文件名称
            },
            {
                id: 2,
                name: '颁证日期',
                txt: '颁证日期',
                maxLength: 20,
                type: 'text',
                fillType: 'single',
                require: true,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 3,
                name: '正文',
                txt: '正文',
                maxLength: 100,
                type: 'text',
                fillType: 'single',
                require: false,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 4,
                name: 'LOGO',
                txt: 'LOGO',
                maxSize: 5120,
                type: 'image',
                fillType: 'single',
                require: false,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 5,
                name: '奖项',
                txt: '奖项',
                maxLength: 20,
                type: 'text',
                fillType: 'multi',
                require: true,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 6,
                name: '获奖人姓名',
                txt: '获奖人姓名(如张三先生)',
                maxLength: 20,
                type: 'text',
                fillType: 'multi',
                require: true,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: true
            }
        ]
    },
    {
        id: 'chz',
        // 编辑器个数
        editorCount: 1,
        // 尺寸类别
        sizeType: [60, 46],
        // 模板分类id 数组第一个为测试id 第二个为预发布id
        categoryId: [894862, 896333],
        // 模板名称
        categoryName: '参会证',
        // 标题
        title: '批量制作参会证',
        // 第一步文本
        stepOneText: '第一步：选择模板',
        // 第二步文本
        stepTwoText: '第二步：填写会议基本信息',
        // 第三步文本
        stepThirdText: '第三步：填写参会人员信息',
        // 继续添加按钮的文案
        continueAddText: '继续添加参会人员信息',
        // 模板标签
        tags: [
            {
                id: 1,
                name: '会议名称', // 标签名称
                txt: '会议名称', // 标签显示名称
                maxLength: 30, // 最大长度 or 最大尺寸
                type: 'text', // 类型(text,image)
                fillType: 'single', // 填充类型 单个(single)还是多个(multi)
                require: true, // 是否必填
                value: null, // 用户填写的值
                defaultValue: null, // 用于默认显示
                enable: true, // 是否启用
                asFileName: false // 作为作品和文件名称
            },
            {
                id: 2,
                name: '会议主题',
                txt: '会议主题',
                maxLength: 15,
                type: 'text',
                fillType: 'single',
                require: true,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 3,
                name: '主办单位',
                txt: '主办单位',
                maxLength: 20,
                type: 'text',
                fillType: 'single',
                require: false,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 4,
                name: 'logo',
                txt: 'LOGO',
                maxSize: 5120,
                type: 'image',
                fillType: 'single',
                require: false,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 5,
                name: '证件类型',
                txt: '证件类型',
                maxLength: 10,
                type: 'text',
                fillType: 'multi',
                require: true,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 6,
                name: '姓名',
                txt: '姓名(如张三先生)',
                maxLength: 20,
                type: 'text',
                fillType: 'multi',
                require: true,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: true
            },
            {
                id: 7,
                name: '二维码',
                txt: '二维码',
                maxSize: 5120,
                type: 'image',
                fillType: 'multi',
                require: false,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            }
        ]
    },
    {
        id: 'hlyqh',
        // 编辑器个数
        editorCount: 1,
        // 尺寸类别
        sizeType: [15, 15],
        // 模板分类id 数组第一个为测试id 第二个为预发布id
        categoryId: [894877, 896392],
        // 模板名称
        categoryName: '婚礼邀请函',
        // 标题
        title: '婚礼邀请函',
        // 第一步文本
        stepOneText: '第一步：选择模板',
        // 第二步文本
        stepTwoText: '第二步：填写婚礼基本信息',
        // 第三步文本
        stepThirdText: '第三步：填写被邀请人信息',
        // 继续添加按钮的文案
        continueAddText: '继续添加邀请人信息',
        // 模板标签
        tags: [
            {
                id: 1,
                name: '新郎', // 标签名称
                txt: '新郎', // 标签显示名称
                maxLength: 20, // 最大长度 or 最大尺寸
                type: 'text', // 类型(text,image)
                fillType: 'single', // 填充类型 单个(single)还是多个(multi)
                require: true, // 是否必填
                value: null, // 用户填写的值
                defaultValue: null, // 用于默认显示
                enable: true, // 是否启用
                asFileName: false // 作为作品和文件名称
            },
            {
                id: 2,
                name: '新娘',
                txt: '新娘',
                maxLength: 20,
                type: 'text',
                fillType: 'single',
                require: true,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 3,
                name: '举办时间',
                txt: '婚礼时间',
                maxLength: 20,
                type: 'text',
                fillType: 'single',
                require: true,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 4,
                name: '地址',
                txt: '地址',
                maxLength: 30,
                type: 'text',
                fillType: 'single',
                require: true,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 5,
                name: '联系电话',
                txt: '联系电话',
                maxLength: 20,
                type: 'text',
                fillType: 'single',
                require: false,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 6,
                name: '二维码引导语',
                txt: '二维码引导语',
                maxLength: 15,
                type: 'text',
                fillType: 'single',
                require: false,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 7,
                name: '二维码',
                txt: '二维码',
                maxSize: 5120,
                type: 'image',
                fillType: 'single',
                require: false,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: false
            },
            {
                id: 8,
                name: '被邀请人姓名',
                txt: '被邀请人姓名(如张三、张三先生等)',
                maxLength: 20,
                type: 'text',
                fillType: 'multi',
                require: true,
                value: null,
                defaultValue: null,
                enable: true,
                asFileName: true
            }
        ]
    }
]

export default { templateCategoryArray }
