const balance = require("./actions/commands/balance.js")
const CliService = require("./services/cli")

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
    handler: balance
})

CliService.parse(process.argv)