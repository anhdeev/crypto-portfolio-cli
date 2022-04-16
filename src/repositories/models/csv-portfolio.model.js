'use strict';
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const CsvPortfolio = sequelize.define('CsvPortfolio', {
        firstName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        phone: DataTypes.STRING,
        email: DataTypes.STRING
    }, {
        indexes: [{ unique: true, fields: ['id'] }]
    });

    return CsvPortfolio;
};