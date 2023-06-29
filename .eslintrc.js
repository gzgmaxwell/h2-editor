module.exports = {
    "extends": [
        "standard",
        "plugin:vue/recommended"
    ],
    "env": {
        "browser": true
    },
    "globals": {
        "Vue": true,
        "VueRouter": true,
        "Vuex": true,
        "axios": true,
        "VueColor": true,
        "Cropper": true,
        'jsPDF': true,
        "$": true,
        "Handsontable": true,
        "html2canvas": true,
        "BMap": true
    },
    "settings": {
        "html/html-extensions": [".html"],
    },
    "plugins": [
        "html",
        "vue"
    ],
    "rules": {
        "no-async-promise-executor": "off",
        "no-misleading-character-class": "off",
        "no-useless-catch": "off",
        "vue/valid-v-for": "off",
        "vue/no-v-html": "off",
        "indent": [
            "error",
            4,
            {
                "SwitchCase": 1
            }
        ],
        "space-before-function-paren": [
            "error",
            {
                "named": "never"
            }
        ],
        "prefer-promise-reject-errors": [
            "error",
            {
                "allowEmptyReject": true
            }
        ],
        "vue/html-indent": [
            "error",
            4
        ]
    }
}