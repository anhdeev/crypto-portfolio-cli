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

exports.diffArray = (a1, a2) => {
    const result = [];

    for (let i = 0; i < a1.length; i++) {
      if (a2.indexOf(a1[i]) === -1) {
        result.push(a1[i]);
      }
    }

    return result;
}