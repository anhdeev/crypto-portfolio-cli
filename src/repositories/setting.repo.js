const Models = require('./models')
const BaseRepo = require('./base.repo')

class SettingRepo extends BaseRepo {
    constructor(db) {
        super(Models.Setting(db))
    }
}
  
module.exports = SettingRepo;