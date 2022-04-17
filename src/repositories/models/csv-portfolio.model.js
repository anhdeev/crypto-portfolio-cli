'use strict';
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const CsvPortfolio = sequelize.define('CsvPortfolio', {
        id: {
            type: DataTypes.BIGINT, 
            primaryKey: true,
            autoIncrement: true 
        },
        date: { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        },
        token: { 
            type: DataTypes.STRING, 
            allowNull: false 
        },
        balance: { 
            type: DataTypes.FLOAT, 
            allowNull: false 
        }
    }, {
        indexes: [{ unique: true, fields: ['id'] }]
    });

    return CsvPortfolio;
};