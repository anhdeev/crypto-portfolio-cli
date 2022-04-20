const Actions = require('../actions')
const path = require('path')
const Utils = require('../utils/index')
const Promise = require('bluebird')
const {getPrice} = require('../services/get-price')
const HRNumbers = require('human-readable-numbers');

const _validateArguments = async({file, token, date}) => {
    const fpath = file || await Actions.SettingAction.getDefaultCsvPath()
    if(!(await Utils.file.isFileExist(fpath))) throw new Error(`File not found`)

    if(date) date = Utils.common.parseStringToDateNumber(date)
    if(token) token = token.toUpperCase()

    return {vfile: fpath, vtoken: token, vdate: date}
}

exports.getPortfolio = async(args, {file, token, date, readable}) => {
    try {
        let start = Date.now()
        let data = null
        const {vfile, vtoken, vdate} = await _validateArguments({file, token, date})
        console.log(`Target file: ${vfile}`)
        if(date) {
            data = await Actions.CsvPortfolioAction.getPortfolioOnDate(vfile, vdate, vtoken)
        } else {
            data = await Actions.CsvPortfolioAction.getPortfolioLatest(vfile, vtoken)
        }
        console.log(`Processed in ${(Date.now()-start)/1000} seconds`)

        // Convert to USD price 
        await Promise.map(Object.keys(data), async(token) => {
            const price = await getPrice(token)
            if(!price || !price['USD']) {
                console.error('Can not get price in USD')
                console.error(price)
            }

            data[token] = Utils.bignumber.multiply(data[token], Number(price['USD'])) 
            if(readable) data[token] = HRNumbers.toHumanString(data[token])
        }, {concurrency: 3})

        console.log('')
        console.log(data)
    } catch (error) {
        console.log(error.message)
    }
}