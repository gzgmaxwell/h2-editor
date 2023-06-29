import util from './util'
import logger from './logger'

function css(option, value) {
    if (util.isString(option)) {
        if (value == null) {
            return this.style[option]
        } else {
            this.style[option] = value
        }
    } else if (util.isObject(option)) {
        Object.assign(this.style, option)
    } else {
        logger.error('css方法的参数不符合要求')
    }
    return this
}

function attr(option, value) {
    if (util.isString(option)) {
        if (value == null) {
            return this.getAttribute(option)
        } else {
            this.setAttribute(option, value)
        }
    } else if (util.isObject(option)) {
        for (const key in option) {
            this.setAttribute(key, option[key])
        }
    } else {
        logger.error('attr方法的参数不符合要求')
    }
    return this
}

function removeAttr(option) {
    if (util.isString(option)) {
        this.removeAttribute(option)
    } else if (util.isArray(option)) {
        for (const item of option) {
            this.removeAttribute(item)
        }
    } else {
        logger.error('removeAttr方法的参数不符合要求')
    }
    return this
}

function trigger(eventType) {
    const e = document.createEvent('MouseEvents')
    e.initMouseEvent(eventType, false, true)
    this.dispatchEvent(e)
    return this
}

function clone() {
    const $div = document.createElement('div')
    $div.innerHTML = this.outerHTML
    return $div.children[0]
}

function remove() {
    if (this.parentElement) {
        this.parentElement.removeChild(this)
    }
}

const proto = {
    css,
    attr,
    removeAttr,
    trigger,
    clone,
    remove
}

Object.assign(HTMLElement.prototype, proto)
Object.assign(SVGElement.prototype, proto)
Object.assign(HTMLDocument.prototype, proto)
