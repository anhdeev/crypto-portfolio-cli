const Repositories = require('../repositories')
const moment = require('moment')
const File = require('../utils/file')
const Promise = require('bluebird')
const Utils = require('../utils')

class SettingAction {
    constructor() {
    }

    setDefaultCsvPath = async(path) => {
        try {

        } catch (error) {
            console.log(error)
            throw error
        }
    }

    flushCache = async() => {
        try {
            await Repositories.CsvPortfolio.truncate()
            await Repositories.Token.truncate()
            console.log('OK')
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    enableCache = async(isEnable) => {
        try {

        } catch (error) {
            console.log(error)
            throw error
        }
    }
}

module.exports = new SettingAction()