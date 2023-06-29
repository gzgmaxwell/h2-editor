export default function () {
    // 双击提示
    this.$el.addEventListener('dblclick', () => {
        Vue.dialog.openNotice({ msg: '日期组件会自动更新日期到当前时间，无法自主修改，<br>若需要自主修改，请在左侧添加文本框。', btnName: '我知道了' })
            .then((res) => { })
            .catch(err => {
                console.log(err)
            })
    })
}
