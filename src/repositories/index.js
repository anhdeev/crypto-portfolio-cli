
const { Sequelize } = require('sequelize');
const CsvPortfolioRepo = require('./csv-portfolio.repo')

class Repository {
    constructor() {
        this.db = new Sequelize(
            process.env.DB_NAME||'portfolio',
            process.env.DB_USER||'user',
            process.env.DB_PASSWORD||'pass',
            {
                host: "0.0.0.0",
                dialect: process.env.DB_TYPE||'sqlite',
                pool: {
                    max: 5,
                    min: 0,
                    idle: 10000
                },
                storage: process.env.DB_PATH || '/tmp/portfolio-db.sqlite',
                logging: false
            }
        );

        this.CsvPortfolio = new CsvPortfolioRepo(this.db)
    }

    connect = async() => {
        try {
            await this.db.authenticate();
            //await this.db.sync({ force: true });
            console.log('Connection has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    }
}

module.exports = new Repository()