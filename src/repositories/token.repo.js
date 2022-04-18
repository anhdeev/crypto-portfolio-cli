const Models = require('./models')
const BaseRepo = require('./base.repo')

class TokenRepo extends BaseRepo {
    constructor(db) {
        super(Models.Token(db))
    }
}
  
module.exports = TokenRepo;