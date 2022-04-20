const Controllers = require("./controllers")
const CliService = require("./services/cli")
const Repository = require("./repositories")

setTimeout(async() => {
    await Repository.connect()

    CliService.setup({
        desc: 'Crypto portfolio management',
        name: 'cryptop',
        version: '1.0'
    })

    // Sub command
    CliService.addCommand({
        cmd: 'flush',
        desc: 'Flush the cache',
        handler: Controllers.settingControllers.flushCache
    })
    
    CliService.addCommand({
        cmd: 'path',
        args: [{
            name: 'file-path', 
            desc:'relative path to the csv file'
        }],
        desc: 'Set the default csv path',
        handler: Controllers.settingControllers.setFilePath
    })

    // Main
    CliService.addOption({
        short: 'f',
        long: 'file',
        desc: 'Specify csv file path'
    })

    CliService.addOption({
        short: 't',
        long: 'token',
        desc: 'Symbol name of a token'
    })

    CliService.addOption({
        short: 'd',
        long: 'date',
        desc: 'specify a date to get balance'
    })

    CliService.addAction(Controllers.portfolioControllers.getPortfolio)

    CliService.parse(process.argv)
})