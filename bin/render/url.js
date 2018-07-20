'use strict'

const { isEmpty, last } = require('lodash')
const cliTruncate = require('cli-truncate')
const prettyMs = require('pretty-ms')
const chalk = require('chalk')

const render = {
  normal: ({ total, end, urls, time, debug, timestamp }) => {
    if (end) return ''
    const filename = isEmpty(urls) ? '' : last(urls).filename
    const prettyTime = total ? chalk.gray(prettyMs(time())) : ''
    return `${prettyTime} ${cliTruncate(filename, 60)}`
  },

  verbose: ({ end, urls, total }) => {
    if (end) return ''
    const str = urls.map(({ url, filename, time, timestamp }) => {
      const prettyTime = chalk.gray(prettyMs(time))
      const prettyTimeStamp = chalk.gray(timestamp)
      return `  ${prettyTimeStamp} ${filename} ${prettyTime}`
    })

    return str.join('\n')
  }
}

module.exports = ({ verbose }) => render[verbose ? 'verbose' : 'normal']
