const axios = require('axios').default;
const Promise = require('bluebird')
const Actions = require('../actions')

const client = axios.create({
    baseURL: `${process.env.GET_PRICE_DOMAIN || 'https://min-api.cryptocompare.com'}`,
    withCredentials: true,
    headers: {
      'api_key': `${process.env.GET_PRICE_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
  });

exports.getPrice = async(token,bases=['USD']) => {
    try {
        const path = `/data/price`
        const query = `fsym=${token}&tsyms=${bases.toString()}`

        // Check cached value
        const cachedPrices = {}
        let isCached = true
        for(const base of bases) {
            const cachedPrice = await Actions.SettingAction.getCachePrice(`${token}/${base}`, 
                                            Number(process.env.PRICE_CACHE_TTL||60))
            if(cachedPrice) {
                cachedPrices[base] = cachedPrice
            } else {
                isCached = false
            }
        }

        if(isCached) {
            //console.log(`Gott cached price`)
            return cachedPrices
        }

        const result = await client.get(`${path}?${query}`);
        if(!result || !result.data) 
            throw new Error('Cannot get price', result)

        await Promise.map(Object.keys(result.data), async(base) => {
            await Actions.SettingAction.updateCachePrice(`${token}/${base}`, result.data[base])
        }, {concurrency:3})

        return result.data
      } catch (error) {
        console.log(error.message);
        return 0
      }
}