'use strict'
const {DataTypes} = require('sequelize')

module.exports = (sequelize) => {
    const Setting = sequelize.define(
        'Setting',
        {
            id: {
                type: DataTypes.SMALLINT,
                primaryKey: true,
                autoIncrement: true,
            },
            key: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
            },
            value: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            indexes: [{unique: true, fields: ['id', 'key']}],
        },
    )

    return Setting
}
