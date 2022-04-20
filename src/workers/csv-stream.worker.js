const {parentPort, workerData} = require('worker_threads')
const CsvStreamAction = require('../actions/csv-stream.action')

setImmediate(async () => {
    try {
        const {filePath, offset, toDate, token, latestSyncedDate, splitSz} = workerData
        // console.log({workerData})
        const csvStream = new CsvStreamAction({filePath, offset, toDate, token, latestSyncedDate, splitSz})
        await csvStream.startStream()
        const balances = await csvStream.finalize()
        //console.log({balances})
        parentPort.postMessage(balances)
    } catch (error) {
        console.error(error.message)
    }
})
