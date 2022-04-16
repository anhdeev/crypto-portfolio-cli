const Models = require('./models')
const BaseRepo = require('./base.repo')

class CsvPortfolioRepo extends BaseRepo {
    constructor(db) {
        super(Models.CsvPortfolioModel(db))
    }
}
  
module.exports = CsvPortfolioRepo;