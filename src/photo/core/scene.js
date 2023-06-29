export default class eqxScene {
    constructor(sceneJson) {
        this.sceneJson = sceneJson
        this.eqxPages = []
    }

    addPage(eqxPage, isNew) {
        this.eqxPages.push(eqxPage)
        if (isNew) {
            this.sceneJson.pages.push(eqxPage.pageJson)
        }
    }

    deletePage(eqxPage) {
        const index = this.eqxPages.indexOf(eqxPage)
        if (index >= 0) {
            this.eqxPages.splice(index, 1)
            this.sceneJson.pages.splice(index, 1)
        }
    }

    replacePage(newEqxPage, oldEqxPage) {
        const index = this.eqxPages.indexOf(oldEqxPage)
        this.eqxPages.splice(index, 1, newEqxPage)
        this.sceneJson.pages.splice(index, 1, newEqxPage.pageJson)
    }
}
