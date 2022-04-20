const chalk = require('chalk')

exports.displayBalance = (data) => {
    if(!data) {
        console.log(chalk.red(`no data to display balance`))
        return
    }

    Object.entries(data).sort().map(d=> {
        console.log(`- ${chalk.bgGray(chalk.underline(d[0]))} : ${chalk.green(d[1])}`)
    })
}

exports.debug = (message) => {
    // TBD
}

exports.info = (message) => {
    // TBD
}