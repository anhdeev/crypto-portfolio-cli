const Repositories = require('../repositories')
const moment = require('moment')
const File = require('../utils/file')
const Promise = require('bluebird')
const Utils = require('../utils')

class TokenAction {
    constructor() {
    }

    updateTokenList = async(tokens) => {
        try {
            if(!tokens || !Array.isArray(tokens) || tokens.length == 0) return

            const existingTokens = await this.listToken() || []
            const newTokens = Utils.common.diffArray(tokens, existingTokens)
            if(newTokens.length == 0) return null
            console.log(existingTokens, newTokens.map(token => ({token})))
            return await Repositories.Token.bulkCreate(newTokens.map(token => ({token})))
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    listToken = async() => {
        try {
            const rst = await Repositories.Token.find({
                raw:true, 
                attributes: ['token']
            })

            return rst.map(r => r.token)
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    getToken = async(name) => {
        try {

        } catch (error) {
            console.log(error)
            throw error
        }
    }

    countTokens = async() => {
        try {
            const total = await Repositories.Token.count()
            console.log({total})
            return total
        } catch (error) {
            console.log(error)
            throw error
        }
    }
}

module.exports = new TokenAction()