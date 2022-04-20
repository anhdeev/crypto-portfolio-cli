const {Sequelize} = require('sequelize')
const CsvPortfolioRepo = require('./csv-portfolio.repo')
const TokenRepo = require('./token.repo')
const SettingRepo = require('./setting.repo')

class Repository {
    constructor() {
        this.db = new Sequelize(
            process.env.DB_NAME || 'portfolio',
            process.env.DB_USER || 'root',
            process.env.DB_PASSWORD || 'root',
            {
                host: '0.0.0.0',
                dialect: process.env.DB_TYPE || 'sqlite',
                storage: process.env.DB_PATH || '/tmp/portfolio-db.sqlite',
                logging: false,
                dialectOptions: {
                    decimalNumbers: true,
                },
            },
        )

        this.CsvPortfolio = new CsvPortfolioRepo(this.db)
        this.Token = new TokenRepo(this.db)
        this.Setting = new SettingRepo(this.db)
    }

    connect = async () => {
        try {
            await this.db.authenticate()
            await this.db.sync() // sync schema at startup
            //console.log('Connection has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error)
        }
    }
}

module.exports = new Repository()
