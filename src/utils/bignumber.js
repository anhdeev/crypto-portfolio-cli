//const {BigNumber} = require('bignumber.js');
const {MathConst} = require('../constants')

exports.add = (num1, num2, precision=6) => {
    return Math.round(num1 * MathConst.PRECISION_6 + num2 * MathConst.PRECISION_6)/ MathConst.PRECISION_6;
}

exports.minus = (num1, num2, precision=6) => {
    return Math.round(num1 * MathConst.PRECISION_6 - num2 * MathConst.PRECISION_6)/ MathConst.PRECISION_6;
}

exports.round = (num) => Math.round(num * MathConst.PRECISION_6)/ MathConst.PRECISION_6