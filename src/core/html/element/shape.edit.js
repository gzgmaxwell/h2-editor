export default function () {
    // 双击提示
    this.$el.addEventListener('dblclick', () => {
        Vue.dialog.openMaterialLib({ type: 'shape' })
            .then(res => {
                if (res && res.success) {
                    const eqxPage = Vue.store.state.scene.eqxPage
                    const eqxElementsSelected = Vue.store.state.scene.eqxElementsSelected
                    const eqxElement = eqxElementsSelected[0]
                    const getShapeItems = ($paths) => {
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
                    }
                    eqxElement.$el.innerHTML = ''
                    eqxElement.setSvg(res.path)
                        .then(() => {
                            const items = getShapeItems(eqxElement.$paths)
                            const property = {
                                items: items,
                                url: res.path
                            }
                            eqxElement.updateProperty(property)
                            eqxPage.eqxHistory.add(eqxPage)
                        })
                }
            })
            .catch(err => {
                err && this.logger.error(err)
            })
    })
}
