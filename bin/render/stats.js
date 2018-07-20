'use strict'

const prettyMs = require('pretty-ms')
const { size } = require('lodash')
const chalk = require('chalk')
const prettyBytes = require('pretty-bytes')

const stats = ({ end, endTime, urls, files, bytes }) => {
  if (!end) return ''

  const _urls = `${size(urls)} urls`
  const _files = `${files} files`
  const _time = chalk.gray(`(${prettyMs(endTime)})`)
  const _bytes = prettyBytes(bytes)
  return `  ${_urls}, ${_files}, ${_bytes} ${_time}`
}

module.exports = ({ verbose }) => stats
