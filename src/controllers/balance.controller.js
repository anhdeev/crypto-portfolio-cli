module.exports = (symbol, options) => {
    const data = {
        symbol,
        balance: 0
    }
    if (options.pretty) {
        return console.log(data);
    }
    console.log(JSON.stringify(data))
}