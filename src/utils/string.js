function getUnicodeLength(str) {
    let totalCount = 0

    if (!str) {
        return 0
    }

    for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i)
        if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f)) {
            totalCount++
        } else {
            totalCount += 2
        }
    }

    return totalCount
}

function isEmpty(input) {
    return input === null || input === ''
}
function isNotEmpty(input) {
    return !this.isEmpty(input)
}
function isBlank(input) {
    return input == null || /^\s*$/.test(input)
}
function isNotBlank(input) {
    return !this.isBlank(input)
}
function trim(input) {
    return input.replace(/^\s+|\s+$/, '')
}
function trimToEmpty(input) {
    return input == null ? '' : this.trim(input)
}
function startsWith(input, prefix) {
    return input.indexOf(prefix) === 0
}
function endsWith(input, suffix) {
    return input.lastIndexOf(suffix) === 0
}
function contains(input, searchSeq) {
    return input.indexOf(searchSeq) >= 0
}
function equals(input1, input2) {
    return input1 === input2
}
function equalsIgnoreCase(input1, input2) {
    return input1.toLocaleLowerCase() === input2.toLocaleLowerCase()
}
function containsWhitespace(input) {
    return this.contains(input, ' ')
}

export default {
    getUnicodeLength,
    isEmpty,
    isNotEmpty,
    isBlank,
    isNotBlank,
    trim,
    trimToEmpty,
    startsWith,
    endsWith,
    contains,
    equals,
    equalsIgnoreCase,
    containsWhitespace
}
