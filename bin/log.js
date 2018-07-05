'use strict'

const timestamp = require('time-stamp')
const chalk = require('chalk')
const { EOL } = require('os')

const time = () => chalk.gray(`[${timestamp('HH:mm:ss')}]`)

const log = str => console.log(`  ${time()} ${str || ''}`)

const strip = str => str.toString().split(EOL)

const print = color => str =>
  strip(str).forEach(str => console.log(`  ${time()} ${chalk[color](str)}`))

log.info = print('white')
log.debug = print('gray')
log.error = print('red')

module.exports = log
