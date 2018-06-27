#!/usr/bin/env node
'use strict'

const cosmiconfig = require('cosmiconfig')('hyperstatic')
const prettyBytes = require('pretty-bytes')
const prettyMs = require('pretty-ms')
const timeSpan = require('time-span')
const { promisify } = require('util')
const chalk = require('chalk')
const path = require('path')

const countFiles = promisify(require('count-files'))

const pkg = require('../package.json')
const download = require('./download')
const log = require('./log')

require('update-notifier')({ pkg }).notify()

const cli = require('meow')({
  pkg,
  help: require('./help'),
  flags: {
    output: {
      alias: 'o',
      type: 'string',
      default: path.join(process.cwd(), 'out')
    },
    concurrence: {
      alias: 'c',
      type: 'number',
      default: 5
    }
  }
})
;(async () => {
  const { config = {} } = (await cosmiconfig.search()) || {}
  const urls = config.url || config.urls || cli.input
  if (!urls) cli.showHelp()
  const flags = { ...config, ...cli.flags }
  console.log()
  let time = timeSpan()
  await download(urls, flags)
  time = time()
  const { files, bytes } = await countFiles(flags.output)
  log.info(
    `${urls.length} urls, ${files} files, ${prettyBytes(bytes)} ${chalk.gray(
      `(${prettyMs(time)})`
    )}`
  )
  process.exit(0)
})()
