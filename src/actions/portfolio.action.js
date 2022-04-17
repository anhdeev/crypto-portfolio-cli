const Repositories = require('../repositories')
const moment = require('moment')
const File = require('../utils/file')
const Promise = require('bluebird')
const Utils = require('../utils')

class CsvPortfolioAction {
    constructor() {
        this.CHUNK_SIZE = 128*1024 //128kb
    }

    _getLatestSyncedDate = async() => {
        const latestRow = await Repositories.CsvPortfolio.findOne({
            order: [['id', 'ASC' ]],
            raw : true
        })

        return latestRow
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

        if (newBalances.length > 0) await Repositories.CsvPortfolio.bulkCreate(newBalances)
    }

    _processRow = (data) => async (line) => {
        if(data.firstRow) { // bypass the header row or incomplete row due to seek offset
            data.firstRow=false
            return true
        }

        const {amount, token, type, timeInSeconds} = this._parseRow(line) || {}
        if(!amount || !token || !type || !timeInSeconds) return true // by pass wrong fomat row

        const currentDate = parseInt(timeInSeconds/(86400)) /// get date in number

        if(currentDate <= data.lastSyncedDate) { // stop the stream if meet the last synced date
            console.log('Stop stream due to already calculated')
            return false 
        } else if(currentDate != data.lastDate) { // processed all transactions on a date > save the current balances to db
            await this._saveBalances(data.balances, data.lastDate, data.today)

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

    _getPortfolio = async (filePath, offset=0) => {
        try {
            const lastSynced = await this._getLatestSyncedDate()
            const data = {
                balances: {},
                lastDate: 0,
                lastSyncedDate: lastSynced ? lastSynced.date : 0,
                firstRow: true,
                today: Utils.common.convertMilisecondToDate(Date.now())
            }

            console.log({lastSynced})
            await File.processAllLines(filePath, this._processRow(data), offset)
            await this._saveBalances(data.balances, data.lastDate, data.today) // save balance for the last date

            

            return data
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    getPortfolioLatest = async(filePath) => {
        try {
            return await this._getPortfolio(filePath)
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    getPortfolioOnDate = async(filePath, date) => {
        try {
            const offset = await this._findOffsetCloseToDate(filePath, date)
            
            return await this._getPortfolio(filePath, offset)
        } catch (error) {
            console.log(error)
            throw error
        }
    }
}

module.exports = new CsvPortfolioAction()