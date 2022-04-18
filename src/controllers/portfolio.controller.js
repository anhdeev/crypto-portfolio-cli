const Actions = require('../actions')
const path = require('path')

module.exports = async(symbol, options) => {
    console.log(symbol, options)

    const fpath = path.resolve(__dirname, '../../../../../Downloads/transactions.csv')
    //const data = await Actions.CsvPortfolioAction.getPortfolioOnDate(fpath, 1006)
    const data = await Actions.CsvPortfolioAction.getPortfolioLatest(fpath)

    console.log({data})
}