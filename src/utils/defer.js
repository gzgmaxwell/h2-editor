window.Defer = function () {
    const deferred = {}
    deferred.promise = new Promise((resolve, reject) => {
        deferred.resolve = resolve
        deferred.reject = reject
    })
    return deferred
}

export default window.Defer
