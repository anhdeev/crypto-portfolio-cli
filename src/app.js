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
    
    CliService.addCommand({
        cmd: 'balance',
        args: [{
            name: 'symbol',
            desc: 'Symbol name of a token'
        }],
        opts: [{
            short: 'p',
            long: 'pretty',
            desc: 'Pretty print json output'
        }],
        desc: 'Get the balance for a specified token',
        handler: Controllers.balanceControllers
    })
    
    CliService.parse(process.argv)
})