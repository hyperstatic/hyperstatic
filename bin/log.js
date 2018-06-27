'use strict'

const timestamp = require('time-stamp')
const chalk = require('chalk')

const time = () => chalk.gray(`[${timestamp('HH:mm:ss')}]`)

const log = str => console.log(`  ${time()} ${str || ''}`)

log.info = str => console.log(`  ${time()} ${chalk.white(str)}`)
log.debug = str => console.log(`  ${time()} ${chalk.gray(str)}`)
log.error = str => console.log(` ${time()} ${chalk.red(str)}`)
log.throw = err => {
  log.error(err.message || err)
  process.exit(1)
}

module.exports = log
