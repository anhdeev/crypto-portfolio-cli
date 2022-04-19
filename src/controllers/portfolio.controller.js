const Actions = require('../actions')
const path = require('path')
const Utils = require('../utils/index')

exports.getPortfolio = async(args, {file, token, date}) => {
    try {
        token = token && token.toUpperCase()
        const fpath = file || path.resolve(__dirname, '../../../../../Downloads/transactions.csv')
        if(!(await Utils.file.isFileExist(fpath))) throw new Error(`File not found`)

        let data = null
        
        if(date) {
            date = Utils.common.parseStringToDateNumber(date)
            data = await Actions.CsvPortfolioAction.getPortfolioOnDate(fpath, date, token)
        } else {
            data = await Actions.CsvPortfolioAction.getPortfolioLatest(fpath, token)
        }
    
        console.log(data)
    } catch (error) {
        console.log(error.message)
    }
}