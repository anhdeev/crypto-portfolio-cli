const {Worker} = require('worker_threads')
const path = require('path')

exports.launchWorker = async (file, workerData) => {
    const absfile = path.resolve(__dirname, '../../', file)

    return new Promise((resolve, reject) => {
        const worker = new Worker(absfile, {
            workerData,
        })
        worker.on('message', resolve)
        worker.on('error', reject)
        worker.on('exit', (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`))
        })
    })
}

exports.launchCsvStreamWorker = async (workerData) => {
    try {
        return await this.launchWorker('./src/workers/csv-stream.worker.js', workerData)
    } catch (error) {
        console.error(error.message)
    }
}
