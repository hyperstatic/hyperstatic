'use strict'

const chalk = require('chalk')

const log = console.log

log.info = str => console.log(chalk.white(str))
log.debug = str => console.log(chalk.gray(str))
log.error = str => console.log(chalk.red(str))
log.throw = err => {
  console.log(chalk.red(err.message || err))
  process.exit(1)
}

module.exports = log
