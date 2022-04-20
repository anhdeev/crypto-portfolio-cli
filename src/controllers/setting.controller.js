const Actions = require('../actions')
const path = require('path')

exports.flushCache = async() => {
    return await Actions.SettingAction.flushCache()
}

exports.setFilePath = async(path, options) => {
    const data = await Actions.SettingAction.setDefaultCsvPath(path)
    console.log('OK')
    return data
}