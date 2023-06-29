const env = require('env')
const { host, plugin, mall } = env

for (const h in host) {
    host[h] = location.protocol + host[h]
}

// 如果是本地开发，使用未压缩的插件
if (process.env.NODE_ENV === 'development') {
    for (const key in plugin) {
        if (key !== 'xlsx') {
            plugin[key] = plugin[key].replace('.min', '')
        }
    }
}

export {
    host,
    plugin,
    mall
}

export default env
