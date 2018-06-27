#!/usr/bin/env node
'use strict'

const cosmiconfig = require('cosmiconfig')('hyperstatic')
const path = require('path')

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
  log()
  await download(urls, flags)
  // TODO: print stats
  log.info(`  Static bundle created at ${flags.output} 🎉`)
  process.exit(0)
})()
