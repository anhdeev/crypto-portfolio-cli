const Repositories = require('../repositories')
const Utils = require('../utils')
const path = require('path')

class SettingAction {
    constructor() {}

    setDefaultCsvPath = async (fpath) => {
        try {
            fpath = path.resolve(__dirname, '../../', fpath)
            if (!(await Utils.file.isFileExist(fpath))) {
                throw new Error(`File not found ${fpath}`)
            }

            const existingSetting = await Repositories.Setting.findOne({where: {key: 'path'}})
            if (!existingSetting) {
                return await Repositories.Setting.create({
                    key: 'path',
                    value: fpath,
                })
            }

            return await Repositories.Setting.update({
                where: {key: 'path'},
                object: {value: fpath},
            })
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    getDefaultCsvPath = async () => {
        try {
            const existingSetting = await Repositories.Setting.findOne({where: {key: 'path'}, raw: true})
            return existingSetting ? existingSetting.value : null
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    updateCachePrice = async (pair, price) => {
        try {
            const existingSetting = await Repositories.Setting.findOne({where: {key: pair}, raw: true})
            if (!existingSetting) {
                return await Repositories.Setting.create({
                    key: pair,
                    value: price,
                })
            }

            return await Repositories.Setting.update({
                where: {key: pair},
                object: {value: price},
            })
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    getCachePrice = async (pair, ttl = 60) => {
        // 60 seconds
        try {
            const existingSetting = await Repositories.Setting.findOne({where: {key: pair}, raw: true})
            // console.log({existingSetting})
            if (!existingSetting) {
                return null
            }

            const cachedTime = (Date.now() - new Date(existingSetting.updatedAt).getTime()) / 1000
            if (cachedTime > ttl) {
                return 0
            }

            return Number(existingSetting.value)
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    getDefaultCsvPath = async () => {
        try {
            const existingSetting = await Repositories.Setting.findOne({where: {key: 'path'}, raw: true})
            return existingSetting ? existingSetting.value : null
        } catch (error) {
            console.log(error)
            throw error
        }
    }
    flushCache = async () => {
        try {
            await Repositories.CsvPortfolio.truncate()
            await Repositories.Token.truncate()
            await Repositories.Setting.truncate()
            console.log('OK')
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    enableCache = async (isEnable) => {
        try {
        } catch (error) {
            console.log(error)
            throw error
        }
    }
}

module.exports = new SettingAction()
