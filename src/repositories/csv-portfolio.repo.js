const Models = require('./models')
const BaseRepo = require('./base.repo')
const {Op} = require('sequelize')
const Utils = require('../utils')
class CsvPortfolioRepo extends BaseRepo {
    constructor(db) {
        super(Models.csvPortfolioModel(db))
    }

    // Get aggreate of balance of all time until toDate
    getBalanceOnDate = async (token, toDate) => {
        try {
            const query = {
                where: {},
                col: 'balance',
                group: 'token',
                attributes: ['token', 'balance'],
                raw: true,
            }

            if (toDate) {
                query.where.date = {[Op.lte]: toDate}
            }

            if (token) {
                query.where.token = token
            }
            let data = await this.aggregate(query)

            data =
                data &&
                data.reduce((rst, cur) => {
                    rst[cur.token] = Utils.bignumber.round(cur.balance)
                    return rst
                }, {})

            return data
        } catch (error) {
            console.log(error.message)
            throw new Error(error)
        }
    }

    getLatestSyncedDate = async () => {
        const latestBalance = await this.findOne({
            order: [['date', 'DESC']],
            attributes: ['date'],
            raw: true,
        })

        return latestBalance ? latestBalance.date : 0
    }
}

module.exports = CsvPortfolioRepo
