const Actions = require('../actions')
const Utils = require('../utils/index')
const Promise = require('bluebird')
const {getPrice} = require('../services/get-price')
const currencyFormatter = require('currency-formatter')
const CONSTANTS = require('../constants')
const {logger} = require('../utils')
const {BigNumber} = require('bignumber.js')

const _validateArguments = async ({file, token, date}) => {
    const fpath = file || (await Actions.SettingAction.getDefaultCsvPath())
    if (!(await Utils.file.isFileExist(fpath))) throw new Error(`File not found`)

    if (date) date = Utils.common.parseStringToDateNumber(date)
    if (token) token = token.toUpperCase()

    return {vfile: fpath, vtoken: token, vdate: date}
}

exports.listToken = async() => {
    try {
        const tokens = await Actions.TokenAction.listToken()
        console.log(tokens)
    } catch (error) {
        console.log(error)
        throw error
    }
}

exports.getPortfolio = async (args, {file, token, date, readable}) => {
    try {
        const start = Date.now()
        let data = null
        const {vfile, vtoken, vdate} = await _validateArguments({file, token, date})
        console.log(`Target file: ${vfile}`)
        if (date) {
            data = await Actions.CsvPortfolioAction.getPortfolioOnDate(vfile, vdate, vtoken)
        } else {
            data = await Actions.CsvPortfolioAction.getPortfolioLatest(vfile, vtoken)
        }
        console.log(`Processed in ${(Date.now() - start) / 1000} seconds`)

        // Convert to USD price
        await Promise.map(
            Object.keys(data),
            async (token) => {
                const price = await getPrice(token)
                if (!price || !price['USD']) {
                    console.error('Can not get price in USD')
                    console.error(price)
                }

                data[token] = new BigNumber(data[token]).multipliedBy(Number(price[CONSTANTS.EnvConst.CURRENCY.USD])).toFixed(6)
                if (readable === 'true') {
                    data[token] = currencyFormatter.format(data[token], {code: CONSTANTS.EnvConst.CURRENCY.USD})
                }
            },
            {concurrency: 3},
        )

        logger.displayBalance(data)
    } catch (error) {
        console.log(error.message)
    }
}
