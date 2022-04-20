const SimpleCli = require('./simple.cli')
const {Command} = require('commander')
const Utils = require('../../utils')

class ComanderCli extends SimpleCli {
    constructor() {
        super()
        this.program = new Command()
    }

    parse = (args) => {
        try {
            this.program.parse(args)
        } catch (error) {
            console.log(error.message)
            throw error
        }
    }

    setup = ({desc, name, version}, callback = null) => {
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
        if (!cmd || !args || !Array.isArray(args)) return

        for (const arg of args) {
            //console.log(`Add arg`, arg)
            const {name, desc} = Object.assign({name: '', desc: ''}, arg)
            cmd.argument(`[${name}]`, desc)
        }
    }

    _addOptions = (cmd, opts) => {
        if (!cmd || !opts || !Array.isArray(opts)) return

        for (const opt of opts) {
            //console.log(`Add option`, opt)
            const {short, long, desc} = Object.assign({short: '', long: '', desc: ''}, opt)
            let option = ''

            if (short) option += `-${short}`
            if (long) option ? (option += `, --${long}`) : (option = `--${long}`)
            option && cmd.option(option, desc)
        }
    }

    addCommand = ({cmd, args, opts, desc, handler}, callback = null) => {
        try {
            if (!cmd) throw new Error('COMMAND_CANNOT_NULL')

            const newCmd = this.program.command(cmd)
            if (!newCmd) throw new Error('COMMAND_ADD_FAIL')

            this._addArguments(newCmd, args)
            this._addOptions(newCmd, opts)

            newCmd.description(desc)
            newCmd.action(handler)

            if (callback) callback(this.program)
        } catch (error) {
            console.log(error.message)
            throw error
        }
    }

    addOption = ({short, long, type, desc, def}) => {
        const args = []
        let option = ''

        if (short) option += `-${short}`
        if (long) option ? (option += `,--${long}`) : (option += `,--${long}`)
        if (type) option += ` <${type}>`

        args.push(option)
        desc && args.push(desc)
        def && args.push(def)
        //console.log(args)
        this.program.option(...args)
    }

    addArgument = ({name, desc}) => {
        this.program.argument(name, desc)
    }

    addAction = (cb) => {
        const _wrapper = (...args) => {
            if (args.length < 2) return

            const options = args[args.length - 2]
            const argValues = args[args.length - 1].processedArgs
            const values = args[args.length - 1].args
            const optValues = Utils.common.diffArray(values, argValues)

            Object.keys(options).map((key, index) => {
                options[key] = optValues[index]
            })

            cb(argValues, options)
        }

        this.program.action(_wrapper)
    }
}

module.exports = ComanderCli
