
class SimpleCli {
    constructor() {
        this.program = undefined
    }

    parse = (args) => {
        if(!this.program || !this.program.parse) return
        this.program.parse(args)
    }

    setup = ({desc, name, version}, callback=null) => {
        if(!this.program || !this.program.setup) return
        this.program.setup({desc, name, version}, callback)
    }

    addCommand = ({cmd, args, opts, desc, handler}, callback=null) => {
        if(!this.program || !this.program.addCommand ) return
        this.program.addCommand({cmd, args, opts, desc, handler}, callback)
    }
}

module.exports = SimpleCli
