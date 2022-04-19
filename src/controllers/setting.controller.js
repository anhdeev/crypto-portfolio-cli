const Actions = require('../actions')
const path = require('path')

exports.flushCache = async() => {
    return await Actions.SettingAction.flushCache()
}

exports.setFilePath = async(path, options) => {
    return await Actions.SettingAction.setDefaultCsvPath(path)
}