'use strict';
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Token = sequelize.define('Token', {
        id: {
            type: DataTypes.SMALLINT, 
            primaryKey: true,
            autoIncrement: true 
        },
        token: { 
            type: DataTypes.STRING,
            unique: true,
            allowNull: false 
        }
    }, {
        indexes: [{ unique: true, fields: ['id'] }]
    });

    return Token;
};