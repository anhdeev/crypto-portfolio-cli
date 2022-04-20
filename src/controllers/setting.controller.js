const Actions = require('../actions')

exports.flushCache = async () => {
    return await Actions.SettingAction.flushCache()
}

exports.setFilePath = async (path) => {
    const data = await Actions.SettingAction.setDefaultCsvPath(path)
    console.log('OK')
    return data
}
