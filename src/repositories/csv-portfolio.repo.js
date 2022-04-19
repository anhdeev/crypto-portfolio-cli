const Models = require('./models')
const BaseRepo = require('./base.repo')
const { Op } = require('sequelize');

class CsvPortfolioRepo extends BaseRepo {
    constructor(db) {
        super(Models.CsvPortfolioModel(db))
    }

    // Get aggreate of balance of all time until toDate 
    getBalanceOnDate = async (token, toDate) => {
        try {
            const query = {
                where: {},
                col: 'balance',
                group: 'token',
                attributes: ['token', 'balance'],
                raw : true
            }

            if(toDate) {
                query.where.date = { [Op.lte]: toDate }
            }

            if(token) {
                query.where.token = token
            }
            const data = await this.aggregate(query)
            return data
        } catch (error) {
            console.log(error.message)
            throw new Error(error)
        }
    }
}
  
module.exports = CsvPortfolioRepo;