const Models = require('./models')
const BaseRepo = require('./base.repo')

class TokenRepo extends BaseRepo {
    constructor(db) {
        super(Models.token(db))
    }
}

module.exports = TokenRepo
