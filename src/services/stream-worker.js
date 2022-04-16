const {Worker, isMainThread, parentPort, workerData } = require('worker_threads');
  
if (isMainThread) {
exports.launchWorker = async (message) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
            workerData: message
        });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
            reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
};

} else {
const data = workerData;
console.log(data)
parentPort.postMessage(data+'abc');
}
