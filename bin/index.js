#!/usr/bin/env node
'use strict'

const cosmiconfig = require('cosmiconfig')('hyperstatic')
const downloadUrl = require('./download-url')
const { first } = require('lodash')
const path = require('path')

const pkg = require('../package.json')
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
  const url = config.url || first(cli.input)
  if (!url) cli.showHelp()
  const flags = { ...config, ...cli.flags }
  await downloadUrl(url, flags)
  log.info(`  Static bundle created at ${flags.output} 🎉`)
  process.exit(0)
})()
