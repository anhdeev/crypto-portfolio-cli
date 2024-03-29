const Repositories = require('../repositories')
const File = require('../utils/file')
const Promise = require('bluebird')
const Utils = require('../utils')
const {launchCsvStreamWorker} = require('../workers')
const {bignumber} = require('../utils/index')

class CsvPortfolioAction {
    constructor() {
        this.CHUNK_SIZE = 128 * 1024 //128kb
    }

    _getPortfolio = async ({filePath, offset = 0, toDate = Number.MAX_SAFE_INTEGER, token = null, fileSzInBytes}) => {
        try {
            const latestSyncedDate = await Repositories.CsvPortfolio.getLatestSyncedDate()
            const syncedTokenBalances = await Repositories.CsvPortfolio.getBalanceOnDate(token)
            //console.log({latestSyncedDate, syncedTokenBalances})

            if (toDate <= latestSyncedDate) {
                // if the date already cached, return result without read csv
                const result = await Repositories.CsvPortfolio.getBalanceOnDate(token, toDate)
                return result
            }

            // WORKER THREADS
            const workerPromises = []
            const splitSz = parseInt(fileSzInBytes / process.env.WORKERS)
            const workerData = {filePath, toDate, offset, splitSz, token, latestSyncedDate}

            for (let i = 0; i < process.env.WORKERS; ++i) {
                workerPromises.push(launchCsvStreamWorker(workerData))
                workerData.offset += splitSz
            }

            const data = await Promise.all(workerPromises)
            //////////////////

            const {balances, unsavedDayBalances} = this._mergeBalances(data)
            if (unsavedDayBalances.length) {
                await Repositories.CsvPortfolio.bulkCreate(unsavedDayBalances)
            }
            // console.log({unsavedDayBalances})

            //Merge with cache balance
            Object.keys(syncedTokenBalances || {}).map((token) => {
                if (balances.hasOwnProperty(token)) {
                    syncedTokenBalances[token] = bignumber.add(syncedTokenBalances[token], balances[token])
                }
            })
            Object.assign(balances, syncedTokenBalances)

            return balances
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    _mergeBalances = (data) => {
        const result = {
            balances: {},
            unsavedDayBalances: {},
        }

        for (const d of data) {
            // merge balance
            Object.keys(d.balances).map((token) => {
                if (result.balances[token]) {
                    result.balances[token] = bignumber.add(result.balances[token], d.balances[token])
                } else {
                    result.balances[token] = d.balances[token]
                }
            })
            // merge incomplete days
            if (d.firstDay > 0 && d.firstDayBalances) {
                if (!result.unsavedDayBalances[d.firstDay]) {
                    result.unsavedDayBalances[d.firstDay] = {}
                }

                Object.keys(d.firstDayBalances).map((token) => {
                    if (result.unsavedDayBalances[d.firstDay][token]) {
                        result.unsavedDayBalances[d.firstDay][token] = bignumber.add(
                            result.unsavedDayBalances[d.firstDay][token],
                            d.firstDayBalances[token],
                        )
                    } else {
                        result.unsavedDayBalances[d.firstDay][token] = d.firstDayBalances[token]
                    }
                })
            }

            if (d.lastDay > 0 && d.lastDay !== d.firstDay && d.lastDayBalances) {
                if (!result.unsavedDayBalances[d.lastDay]) result.unsavedDayBalances[d.lastDay] = {}

                Object.keys(d.lastDayBalances).map((token) => {
                    if (result.unsavedDayBalances[d.lastDay][token]) {
                        result.unsavedDayBalances[d.lastDay][token] = bignumber.add(
                            result.unsavedDayBalances[d.lastDay][token],
                            d.lastDayBalances[token],
                        )
                    } else {
                        result.unsavedDayBalances[d.lastDay][token] = d.lastDayBalances[token]
                    }
                })
            }
        }

        result.unsavedDayBalances = Object.keys(result.unsavedDayBalances).reduce((rst, date) => {
            const balances = result.unsavedDayBalances[date]
            if (balances) {
                Object.keys(balances).map((token) => {
                    rst.push({
                        date: Number(date),
                        token,
                        balance: balances[token],
                    })
                })
            }
            return rst
        }, [])

        return result
    }

    _findOffsetCloseToDate = async (filePath, targetDate) => {
        try {
            const fileSzInBytes = await File.getFileSize(filePath)
            let start = 0
            let end = fileSzInBytes

            const _binarySearch = async () => {
                if (end - start < this.CHUNK_SIZE) {
                    // return result when it close to the target less than the chunk size
                    return {offset: start, fileSzInBytes}
                }
                const middle = Math.floor((start + end) / 2)

                const line = await File.getFirstLineOffset(filePath, middle)
                if (!line) {
                    return {offset: 0, fileSzInBytes}
                }

                const row = line.split(',')
                const currentDate = Utils.common.convertSecondToDate(row[0])

                if (currentDate == targetDate) {
                    // shift back until start offset cover the target day
                    start -= this.CHUNK_SIZE
                    end = start + this.CHUNK_SIZE - 1
                } else if (currentDate < targetDate) {
                    // keep find on the left
                    end = middle
                } else {
                    // keep find on the right
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

    getPortfolioLatest = async (filePath, token = null) => {
        try {
            const fileSzInBytes = await File.getFileSize(filePath)
            return await this._getPortfolio({filePath, token, fileSzInBytes})
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    getPortfolioOnDate = async (filePath, toDate, token = null) => {
        try {
            const {offset, fileSzInBytes} = await this._findOffsetCloseToDate(filePath, toDate)
            //console.log({offset, fileSzInBytes})
            return await this._getPortfolio({filePath, offset, toDate, token, fileSzInBytes})
        } catch (error) {
            console.log(error)
            throw error
        }
    }
}

module.exports = new CsvPortfolioAction()
