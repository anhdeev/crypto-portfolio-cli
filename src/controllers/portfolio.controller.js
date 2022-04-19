const Actions = require('../actions')
const path = require('path')
const Utils = require('../utils/index')

const _validateArguments = async({file, token, date}) => {
    const fpath = file || path.resolve(__dirname, '../../../../../Downloads/transactions.csv')
    if(!(await Utils.file.isFileExist(fpath))) throw new Error(`File not found`)

    if(date) date = Utils.common.parseStringToDateNumber(date)
    if(token) token = token.toUpperCase()

    return {vfile: fpath, vtoken: token, vdate: date}
}

exports.getPortfolio = async(args, {file, token, date}) => {
    try {
        let data = null
        const {vfile, vtoken, vdate} = await _validateArguments({file, token, date})

        if(date) {
            data = await Actions.CsvPortfolioAction.getPortfolioOnDate(vfile, vdate, vtoken)
        } else {
            data = await Actions.CsvPortfolioAction.getPortfolioLatest(vfile, vtoken)
        }
    
        console.log(data)
    } catch (error) {
        console.log(error.message)
    }
}