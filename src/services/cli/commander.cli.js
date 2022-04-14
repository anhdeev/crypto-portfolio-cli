const SimpleCli = require('./simple.cli')
const { Command } = require('commander');

class ComanderCli extends SimpleCli {
    constructor() {
        super()
        this.program = new Command();
    }

    parse = (args) => {
        try {
            this.program.parse(args)
        } catch (error) {
            console.log(error.message)
            throw error
        }
    }

    setup = ({desc, name, version}, callback=null) => {
        try {
            desc && this.program.description(desc)
            name && this.program.name(name)
            version && this.program.name(version)
            callback && callback(this.program)
        } catch (error) {
            console.log(error.message)
            throw error
        }
    }

    _addArguments = (cmd, args) => {
        if(!cmd || !args || !Array.isArray(args)) return

        for(const arg of args) {
            //console.log(`Add arg`, arg)
            const {name, desc} = Object.assign({name:'', desc: ''}, arg)
            cmd.argument(`[${name}]`, desc)
        }
    }

    _addOptions = (cmd, opts) => {
        if(!cmd || !opts || !Array.isArray(opts)) return

        for(const opt of opts) {
            //console.log(`Add option`, opt)
            const {short, long, desc} = Object.assign({short:'', long:'', desc: ''}, opt)
            let option ='' 
            
            if(short) option+=`-${short}`
            if(long) option? (option+=`, --${long}`): (option=`--${long}`)
            option && cmd.option(option, desc)
        }
    }
    
    addCommand = ({cmd, args, opts, desc, handler}, callback=null) => {
        try {
            if(!cmd) throw new Error('COMMAND_CANNOT_NULL')

            const newCmd = this.program.command(cmd)
            if(!newCmd) throw new Error('COMMAND_ADD_FAIL')

            this._addArguments(newCmd, args)
            this._addOptions(newCmd, opts)

            newCmd.description(desc)
            newCmd.action(handler);

            if(callback) callback(this.program)
        } catch (error) {
            console.log(error.message)
            throw error
        }
    }
}

module.exports = ComanderCli
