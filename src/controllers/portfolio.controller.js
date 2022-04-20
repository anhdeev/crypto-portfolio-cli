const Actions = require('../actions')
const path = require('path')
const Utils = require('../utils/index')

const _validateArguments = async({file, token, date}) => {
    const fpath = file || await Actions.SettingAction.getDefaultCsvPath()
    if(!(await Utils.file.isFileExist(fpath))) throw new Error(`File not found`)

    if(date) date = Utils.common.parseStringToDateNumber(date)
    if(token) token = token.toUpperCase()

    return {vfile: fpath, vtoken: token, vdate: date}
}

exports.getPortfolio = async(args, {file, token, date}) => {
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
        console.log('')
        console.log(data)
    } catch (error) {
        console.log(error.message)
    }
}