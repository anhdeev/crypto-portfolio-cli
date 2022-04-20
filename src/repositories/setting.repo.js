const Models = require('./models')
const BaseRepo = require('./base.repo')

class SettingRepo extends BaseRepo {
    constructor(db) {
        super(Models.setting(db))
    }
}

module.exports = SettingRepo
