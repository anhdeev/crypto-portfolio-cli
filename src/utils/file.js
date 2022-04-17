const fs = require('fs'); 
const path = require('path')
const readline = require('readline');
const repos = require('../repositories')
const Promise = require('bluebird')
const moment = require('moment')

// exports.processAllCsvRows = (filePath, handler) => {
//     const start = Date.now()
//     let a =0
//     const stream = fs.createReadStream(filePath)
//     stream.pipe(csv())
//     .on('data', function(data) {
//         a+= 1
//     })
//     .on('end',function(){
//         const stop = Date.now()
//         console.log((stop-start)/1000, a)
//     }); 
// }


exports.processAllLines = async(filePath, handler, offset=0) => {
    console.log({filePath})
    const start = Date.now()
    const fileStream = fs.createReadStream(filePath, {start: offset});

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    for await (const line of rl) {
        const nextline = await handler(line)
        if(!nextline) break
    }

    console.log(`Processed stream in ${(Date.now()-start)/1000} seconds`)
}

exports.getFirstLineOffset = async(filePath, offset=0) => {
    const fileStream = fs.createReadStream(filePath, {start:offset});

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let cnt =0
    let line = null
    for await (const l of rl) {
        line = l
        if(++cnt>1) break // ignore the first incompleted line
    }
    fileStream.close()
    return line
}

exports.getFileSize = async(filePath) => {
    const stat = await fs.promises.stat(filePath)
    return stat.size
}

// setImmediate(async() => {
//     await repos.connect()
//     const fpath = path.resolve(__dirname, '../../../../../Downloads/transactions.csv')
//     this.processAllLines(fpath)
// })
