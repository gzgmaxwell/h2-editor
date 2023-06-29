
export default function () {
    // 双击提示
    this.$el.addEventListener('dblclick', () => {
        Vue.dialog.openMaterialLib()
            .then(res => {
                if (res && res.success) {
                    Vue.api.file.getImageInfo(res.path).then(data => {
                        if (data.data.format === 'gif') {
                            Vue.notifier.fail('gif文件不能被替换')
                        } else {
                            const property = this.elementJson.property
                            const eqxElementsSelected = Vue.store.state.scene.eqxElementsSelected
                            const eqxElement = eqxElementsSelected[0]
                            property.src = res.path
                            if (property.crop) {
                                delete property.crop
                            }
                            eqxElement.updateProperty(property)
                        }
                    })
                }
            })
            .catch(err => {
                err && this.logger.error(err)
            })
    })
}
