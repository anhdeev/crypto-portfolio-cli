#!/usr/bin/env node
const path = require('path')
const NODE_ENV = process.env.NODE_ENV || ''

const envFile = `${NODE_ENV}.env`
const envPath = path.resolve(__dirname, envFile)
require('dotenv').config({path: envPath})

module.exports = require('./src/app.js');
