const Repositories = require('../repositories')
const File = require('../utils/file')
const Utils = require('../utils')
const TokenAction = require('./token.action')
const {bignumber} = Utils

class CsvStreamAction {
    static CHUNK_SIZE = 128 * 1024 //128kb
    static DB_BULK_LIMIT = 300

    constructor({latestSyncedDate, filePath, offset, splitSz, toDate, token}) {
        this.bulkBalances = []
        this.balances = {}
        this.firstDay = 0
        this.firstDayBalances = null
        this.lastDay = 0
        this.lastDayBalances = {}

        this.currentDate = 0
        this.toDate = toDate
        this.onlyToken = token
        this.latestSyncedDate = latestSyncedDate
        this.today = Utils.common.convertMilisecondToDate(Date.now())
        this.filePath = filePath
        this.offset = offset
        this.splitSz = splitSz
    }

    finalize = async () => {
        await this._saveBalances(true)

        return {
            balances: this.balances,
            firstDayBalances: this.firstDayBalances,
            lastDayBalances: this.lastDayBalances,
            firstDay: this.firstDay,
            lastDay: this.currentDate,
        }
    }

    _parseRow = (line) => {
        const row = line && line.split(',')
        if (!row || row.length < 4) return null

        const amount = Number(row[3])
        const token = row[2]
        const type = row[1]
        const timeInSeconds = Number(row[0])

        return {amount, token, type, timeInSeconds}
    }

    _saveBalances = async (last = false) => {
        if (!this.lastDay || this.lastDay == this.today) return

        if (!this.firstDayBalances) {
            // first day might be incompleted due to split, dont save now
            this.firstDayBalances = this.lastDayBalances
            this.firstDay = this.lastDay
            this.lastDayBalances = {}
            return
        }

        if (!last) {
            // last day might be incompleted due to split, dont save now
            const newBalances = Object.keys(this.balances).map((tokenName) => ({
                date: this.lastDay,
                token: tokenName,
                balance: this.lastDayBalances[tokenName],
            }))

            if (newBalances.length > 0) {
                this.bulkBalances = [...this.bulkBalances, ...newBalances]
            }
            this.lastDayBalances = {} // clear balance each day
        }

        if ((last && this.bulkBalances.length > 0) || this.bulkBalances.length >= this.DB_BULK_LIMIT) {
            // update token list
            const tokenSet = new Set()
            this.bulkBalances.map((b) => tokenSet.add(b.token))
            await TokenAction.updateTokenList([...tokenSet])

            //console.log({newBalances})
            // create new balance by date
            await Repositories.CsvPortfolio.bulkCreate(this.bulkBalances)
            this.bulkBalances = []
        }
    }

    _processRow = async (line) => {
        const {amount, token, type, timeInSeconds} = this._parseRow(line) || {}
        if (!amount || !token || !type || !timeInSeconds) return true // by pass wrong fomat row

        this.currentDate = Utils.common.convertSecondToDate(timeInSeconds) /// get date in number
        //console.log({currentDate: this.currentDate, todate:this.toDate})
        if (this.currentDate > this.toDate) {
            // skip calculate for this row due to the target date not reached
            return true
        } else if (this.currentDate <= this.latestSyncedDate) {
            // stop the stream if meet the last synced date
            //console.log('Stop the stream due to the remaining dates already cached')
            return false
        } else if (this.currentDate != this.lastDay) {
            // finished processing all transactions on a date > save the current date's porfolio to db
            await this._saveBalances()
            this.lastDay = this.currentDate
        }

        // Update balance for each token
        let updateAmount = 0

        if (type.startsWith('W')) updateAmount = -amount
        else if (type.startsWith('D')) updateAmount = amount

        if (this.lastDayBalances.hasOwnProperty(token)) {
            this.lastDayBalances[token] = bignumber.add(this.lastDayBalances[token], updateAmount)
        } else {
            this.lastDayBalances[token] = updateAmount
        }

        if (!this.onlyToken || this.onlyToken === token) {
            if (this.balances.hasOwnProperty(token)) {
                this.balances[token] = bignumber.add(this.balances[token], updateAmount)
            } else {
                this.balances[token] = updateAmount
            }
        }

        return true
    }

    startStream = async () => {
        // Process all unsynced rows if any
        await File.processAllPureLines(this.filePath, this._processRow, this.offset, this.splitSz)
    }
}

module.exports = CsvStreamAction
