/**
 * 日期组件设置选项
 */
const dateJson = {
    '+dd': {
        format: [
            { name: '数字', value: '+dd' },
            { name: '汉字', value: '+zd' }
        ],
        separator: {}
    },
    '+mm': {
        format: [
            { name: '数字', value: '+mm' },
            { name: '汉字', value: '+zm' },
            { name: '英文小写', value: '+mmmm' },
            { name: '英文大写', value: '+MMMM' },
            { name: '首字母大写', value: '+Mmmm' },
            { name: '英文小写简称', value: '+mmm' },
            { name: '英文大写简称', value: '+MMM' },
            { name: '首字母大写简称', value: '+Mmm' }
        ],
        separator: {}
    },
    '+yyyy': {
        format: [
            { name: '数字', value: '+yyyy' },
            { name: '汉字', value: '+zyyy' },
            { name: '数字后两位', value: '+yy' }
        ],
        separator: {}
    },
    '+zddd': {
        format: [
            { name: '汉字', value: '+zddd' },
            { name: '英文大写', value: '+DDDD' },
            { name: '英文小写', value: '+dddd' },
            { name: '首字母大写全称', value: '+Dddd' }
        ],
        separator: {}
    },
    '+mm-+dd': {
        format: [
            { name: '数字', value: '+mm-+dd' },
            { name: '汉字', value: '+zm-+zd' }
        ],
        separator: {
            '+mm-+dd': [
                { name: '\'-\'分割', value: '+mm-+dd' },
                { name: '\'/\'分割', value: '+mm/+dd' },
                { name: '\'.\'分割', value: '+mm.+dd' },
                { name: '\'年\'、\'月\'、\'日\'分割', value: '+mm月+dd日' }
            ],
            '+zm-+zd': [
                { name: '\'-\'分割', value: '+zm-+zd' },
                { name: '\'/\'分割', value: '+zm/+zd' },
                { name: '\'.\'分割', value: '+zm.+zd' },
                { name: '\'年\'、\'月\'、\'日\'分割', value: '+zm月+zd日' }
            ]
        }
    },
    '+yyyy-+mm': {
        format: [
            { name: '数字', value: '+yyyy-+mm' },
            { name: '汉字', value: '+zyyy-+zm' }
        ],
        separator: {
            '+yyyy-+mm': [
                { name: '\'-\'分割', value: '+yyyy-+mm' },
                { name: '\'/\'分割', value: '+yyyy/+mm' },
                { name: '\'.\'分割', value: '+yyyy.+mm' },
                { name: '\'年\'、\'月\'、\'日\'分割', value: '+yyyy年+mm月' }
            ],
            '+zyyy-+zm': [
                { name: '\'-\'分割', value: '+zyyy-+zm' },
                { name: '\'/\'分割', value: '+zyyy/+zm' },
                { name: '\'.\'分割', value: '+zyyy.+zm' },
                { name: '\'年\'、\'月\'、\'日\'分割', value: '+zyyy年+zm月' }
            ]
        }
    },
    '+yyyy-+mm-+dd': {
        format: [
            { name: '数字', value: '+yyyy-+mm-+dd' },
            { name: '汉字', value: '+zyyy-+zm-+zd' }
        ],
        separator: {
            '+yyyy-+mm-+dd': [
                { name: '\'-\'分割', value: '+yyyy-+mm-+dd' },
                { name: '\'/\'分割', value: '+yyyy/+mm/+dd' },
                { name: '\'.\'分割', value: '+yyyy.+mm.+dd' },
                { name: '\'年\'、\'月\'、\'日\'分割', value: '+yyyy年+mm月+dd日' }
            ],
            '+zyyy-+zm-+zd': [
                { name: '\'-\'分割', value: '+zyyy-+zm-+zd' },
                { name: '\'/\'分割', value: '+zyyy/+zm/+zd' },
                { name: '\'.\'分割', value: '+zyyy.+zm.+zd' },
                { name: '\'年\'、\'月\'、\'日\'分割', value: '+zyyy年+zm月+zd日' }
            ]
        }
    },
    '+cy': {
        format: [],
        separator: {}
    },
    '+cm': {
        format: [],
        separator: {}
    },
    '+cd': {
        format: [],
        separator: {}
    }
}

export default dateJson
