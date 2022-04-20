const CommanderCli = require('./commander.cli')
const SimpleCli = require('./simple.cli')
const {EnvConst} = require('../../constants')

class CliService extends SimpleCli {
    constructor() {
        super()
        if (process.env.CLI_FRAMEWORK === EnvConst.FRAME_WORK.COMMANDER) {
            this.program = new CommanderCli()
        } else {
            this.program = new SimpleCli()
        }
    }
}

module.exports = new CliService()
