const Repositories = require('../repositories')
const moment = require('moment')
const File = require('../utils/file')
const Promise = require('bluebird')
const Utils = require('../utils')
const TokenAction = require('./token.action')
const SettingAction = require('./setting.action')

class CsvPortfolioAction {
    constructor() {
        this.CHUNK_SIZE = 128*1024 //128kb
    }

    _getSyncedBalances = async(token=null, toDate=null) => {
        const latestBalance = await Repositories.CsvPortfolio.findOne({
            order: [['id', 'ASC' ]],
            attributes: ['date'],
            raw : true
        })

        if(!latestBalance) return null

        const tokens = !token ? (await TokenAction.listToken() || []) : [token]
        
        let tokenBalances = await Promise.map(tokens, async(token) => {
            const where = {token}
            if(toDate) where.date = toDate

            const tokenBalance = await Repositories.CsvPortfolio.findOne({
                where,
                attributes: ['token', 'balance'],
                order: [['id', 'ASC' ]],
                raw : true
            })

            return tokenBalance
        }, {concurrency: 5})

        if(!tokenBalances || tokenBalances.length == 0 || tokenBalances.length != tokens.length) {
            console.log(`Clear cache due to mismatch`)
            await SettingAction.flushCache()
            return null
        }

        tokenBalances = tokenBalances.reduce((rst, cur) => {
            rst[cur.token] = cur.balance
            return rst
        }, {})
        
        return {syncedDate: latestBalance.date, tokenBalances}
    }

    _parseRow = (line) => {
        const row = line && line.split(',')
        if(!row || row.length < 4) return null

        const amount = Number(row[3])
        const token = row[2]
        const type = row[1]
        const timeInSeconds = Number(row[0])

        return { amount, token, type, timeInSeconds }
    }

    _saveBalances = async (balances, lastDate, today) => {
        if(!lastDate || lastDate == today) return

        const newBalances = Object.keys(balances).map(tokenName => ({
                date: lastDate,
                token: tokenName,
                balance: balances[tokenName]
            })
        )

        // update token list
        await TokenAction.updateTokenList(Object.keys(balances))
        
        console.log({newBalances})
        // create new balance by date
        if (newBalances.length > 0) await Repositories.CsvPortfolio.bulkCreate(newBalances)
    }

    _processRow = (data) => async (line) => {
        if(data.firstRow) { // bypass the header row or incomplete row due to seek offset
            data.firstRow=false
            return true
        }

        const {amount, token, type, timeInSeconds} = this._parseRow(line) || {}
        if(!amount || !token || !type || !timeInSeconds) return true // by pass wrong fomat row

        const currentDate = Utils.common.convertSecondToDate(timeInSeconds) /// get date in number
        // console.log({currentDate, todate:data.toDate})
        if(currentDate > data.toDate) { // skip calculate for this row due to the target date not reached
            return true
        } else if(currentDate <= data.latestSyncedDate) { // stop the stream if meet the last synced date
            console.log('Stop the stream due to the remaining dates already cached')
            return false 
        } else if(currentDate != data.lastDate) { // finished processing all transactions on a date > save the current date's porfolio to db
            await this._saveBalances(data.balances, data.lastDate, data.today)
            data.balances = {} // clear balance each day
            data.lastDate = currentDate
        }

        // Update balance for each token
        if(type.startsWith('D')) {
            if(data.balances.hasOwnProperty(token)) data.balances[token] +=amount
            else data.balances[token] = amount
        } else if(type.startsWith('W')) {
            if(data.balances.hasOwnProperty(token)) data.balances[token] -=amount
            else data.balances[token] = -amount
        }

        return true
    }

    _findOffsetCloseToDate = async(filePath, targetDate) => {
        try {
            const fileSzInBytes = await File.getFileSize(filePath)
            let start = 0
            let end = fileSzInBytes
            let date = 0
    
            const _binarySearch = async() => {
                if(end-start < this.CHUNK_SIZE) { // return result when it close to the target less than the chunk size 
                    return start
                }
                const middle = Math.floor((start+end) / 2)
    
                const line = await File.getFirstLineOffset(filePath, middle)
                if(!line) return 0
    
                const row = line.split(',')
                const currentDate = Utils.common.convertSecondToDate(row[0])
                date = currentDate
                if(currentDate == targetDate) { // shift back until start offset cover the target day
                    start -= this.CHUNK_SIZE
                    end = (start + this.CHUNK_SIZE - 1)
                } else if(currentDate < targetDate) { // keep find on the left
                    end = middle
                } else { // keep find on the right
                    start = middle
                }
    
                return await _binarySearch()
            }

            return _binarySearch()
        } catch (error) {
            console.error(error.message)
            return 0
        }
    }

    _getPortfolio = async ({filePath, offset=0, toDate=Number.MAX_SAFE_INTEGER, token=null}) => {
        try {
            const defaultSyncedBalance = {syncedDate: 0, tokenBalances: {}}
            const {syncedDate, tokenBalances: syncedTokenBalances} = Object.assign(defaultSyncedBalance, await this._getSyncedBalances(token))
            const data = {
                balances: {},
                lastDate: 0,
                toDate,
                latestSyncedDate: syncedDate ? syncedDate : 0,
                firstRow: true,
                today: Utils.common.convertMilisecondToDate(Date.now())
            }

            if(toDate <= data.latestSyncedDate) { // if the date already cached, return result without read csv
                const result = await this._getSyncedBalances(token, toDate)
                if(result) return result
                else { /* TODO: flush cache */}
            }

            console.log({syncedDate, syncedTokenBalances, offset})
            // Process all unsynced rows if any
            await File.processAllLines(filePath, this._processRow(data), offset)
            // sync porfolio for the last date
            await this._saveBalances(data.balances, data.lastDate, data.today) 

            // Merge unsynced balance with synced balance
            Object.keys(syncedTokenBalances).map(token => {
                if(data.balances.hasOwnProperty(token)) {
                    syncedTokenBalances[token] += data.balances[token]
                }
            })
            if(token) data.balances = syncedTokenBalances
            else Object.assign(data.balances, syncedTokenBalances)

            return data
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    getPortfolioLatest = async(filePath, token=null) => {
        try {
            return await this._getPortfolio({filePath, token})
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    getPortfolioOnDate = async(filePath, toDate, token=null) => {
        try {
            const offset = await this._findOffsetCloseToDate(filePath, toDate)
            
            return await this._getPortfolio({filePath, offset, toDate, token})
        } catch (error) {
            console.log(error)
            throw error
        }
    }
}

module.exports = new CsvPortfolioAction()