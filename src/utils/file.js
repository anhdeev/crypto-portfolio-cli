const fs = require('fs'); 
const path = require('path')
const readline = require('readline');

exports.processAllLines = async(filePath, handler, offset=0) => {
    // console.log({filePath})
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


exports.processAllPureLines = async(filePath, handler, offset, size) => {
    // console.log({filePath})
    const start = Date.now()
    const linePadding = 50 // add padding to have completed last line for a splitted part
    const fileStream = fs.createReadStream(filePath, {start: offset, end: (offset+size-1+linePadding)})

    let remainder = ''
    let byteCnt = 0
    let first = true

    for await (const buf of fileStream) {
        const lines = (remainder + buf).split(/\r?\n/g)

        remainder = lines.pop()
        let running = false

        for (const line of lines) {
            byteCnt += (line.length +1)

            if(first || !line) { // bypass header or first line of a splited part
                first=false
                continue
            }

            running = await handler(line)

            if(!running || byteCnt > size) {
                //console.log(`Break stream`)
                break
            }
        }
        
        if(!running) break
    }
    //byteCnt+=remainder.length
    //console.log(remainder)
    console.log(`Processed stream ${byteCnt} - ${size} bytes in ${(Date.now()-start)/1000} seconds`)
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

exports.isFileExist = async(filePath) => {
    return fs.promises.access(filePath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)
}

// setImmediate(async() => {
//     await repos.connect()
//     const fpath = path.resolve(__dirname, '../../../../../Downloads/transactions.csv')
//     this.processAllLines(fpath)
// })
