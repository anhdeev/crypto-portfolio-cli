const fs = require('fs'); 
const path = require('path')
const readline = require('readline');
const repos = require('../repositories')
const Promise = require('bluebird')

exports.processAllCsvRows = (filePath, handler) => {
    const start = Date.now()
    let a =0
    const stream = fs.createReadStream(filePath)
    stream.pipe(csv())
    .on('data', function(data) {
        a+= 1
    })
    .on('end',function(){
        const stop = Date.now()
        console.log((stop-start)/1000, a)
    }); 
}


exports.processAllLines = async(filePath, handler) => {
    const start = Date.now()
    const fileStream = fs.createReadStream(filePath);

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.
    let a =0
    let c=0
    let last = 0
    let averange = {
        c:0,
        v:0
    }
    let bulkdata = []
    for await (const line of rl) {
        const row = line.split(',')
        if(!row || row.length < 4) continue
        if(row[1].startsWith('D')) a+=Number(row[3])
        else if(row[1].startsWith('W')) a-=Number(row[3])


        if(c++%2000==0 && c>0) {
            const diff = Math.abs(Number(row[0]) - last)
            if(last) {
                averange.v=(averange.v*averange.c+diff)/(++averange.c)

                bulkdata.push({
                    firstName: '88673857',
                    lastName: 'WITHDRAWAL',
                    phone: 'ETH',
                    email: '0.260329'
                })
                if(bulkdata.length>500) {
                    await repos.CsvPortfolio.bulkCreate(bulkdata)
                    bulkdata = []
                }
            }
            last=Number(row[0])
        }
    }

    console.log(averange)
    console.log((Date.now()-start)/1000, a, c)
}


exports.processAllLinesSplit = async(filePath, handler) => {
    const sz = fs.statSync(filePath).size
    const start = Date.now()
    const fileStream1 = fs.createReadStream(filePath, {start: 0, end: parseInt(sz/2)});
    const fileStream2 = fs.createReadStream(filePath, {start: parseInt(sz/2)+1});

    
    await Promise.map([fileStream2], async(stream) => {
        const rl = readline.createInterface({
          input: stream,
          crlfDelay: Infinity
        });
        // Note: we use the crlfDelay option to recognize all instances of CR LF
        // ('\r\n') in input.txt as a single line break.
        let a =0
        let c=0
        let last = 0
        let averange = {
            c:0,
            v:0
        }
        let bulkdata = []
        for await (const line of rl) {
            const row = line.split(',')
            if(!row || row.length < 4) continue
            if(row[1].startsWith('D')) a+=Number(row[3])
            else if(row[1].startsWith('W')) a-=Number(row[3])
    
    
            if(c++%2000==0 && c>0) {
                const diff = Math.abs(Number(row[0]) - last)
                if(last) {
                    averange.v=(averange.v*averange.c+diff)/(++averange.c)
    
                    // bulkdata.push({
                    //     firstName: '88673857',
                    //     lastName: 'WITHDRAWAL',
                    //     phone: 'ETH',
                    //     email: '0.260329'
                    // })b
                    // if(bulkdata.length>500) {
                    //     await repos.CsvPortfolio.bulkCreate(bulkdata)
                    //     bulkdata = []
                    // }
                }
                last=Number(row[0])
            }
        }

        console.log(averange)
    }, {concurrency:2})

    console.log((Date.now()-start)/1000)
}

exports.getFirstLine = async(filePath) => {

}

// setImmediate(async() => {
//     await repos.connect()
//     const fpath = path.resolve(__dirname, '../../../../../Downloads/transactions.csv')
//     this.processAllLines(fpath)
// })
