const CONSTANTS = require('../constants')

exports.convertSecondToDate = (timeInSeconds) => {
    if(isNaN(timeInSeconds)) return 0

    timeInSeconds = Number(timeInSeconds)
    return parseInt(timeInSeconds / CONSTANTS.MathConst.TIME.SECONDS_PER_DAY)
}

exports.convertMilisecondToDate = (timeInMs) => {
    if(isNaN(timeInMs)) return 0

    timeInMs = Number(timeInMs)
    return parseInt(timeInMs / CONSTANTS.MathConst.TIME.MILISECONDS_PER_DAY)
}

exports.parseStringToDateNumber = (date) => {
    const date_regex = /^\d{4}-\d{2}-\d{2}$/;
    const ms = new Date(date).getTime()
    if(!date_regex.test(date) || isNaN(ms)) throw new Error('Date format incorrect. Must be yyyy-mm-dd')

    return this.convertMilisecondToDate(ms)
}

exports.diffArray = (a1, a2) => {
    const result = [];

    for (let i = 0; i < a1.length; i++) {
      if (a2.indexOf(a1[i]) === -1) {
        result.push(a1[i]);
      }
    }

    return result;
}

exports.split = (line, delimiter=',') => {
  const result = []
  let col = ''
  for(let i=0; i< line.length; ++i) {
    const c = line[i]
    if(c == delimiter) col+=c
    else {
      col && result.push(col)
      col=''
    }
  }
  col && result.push(col)
  return result
}