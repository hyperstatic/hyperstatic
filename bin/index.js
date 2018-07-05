#!/usr/bin/env node
'use strict'

const cosmiconfig = require('cosmiconfig')('hyperstatic')
const hyperstatic = require('@hyperstatic/core')
const prettyBytes = require('pretty-bytes')
const humanizeUrl = require('humanize-url')
const cleanStack = require('clean-stack')
const prettyMs = require('pretty-ms')

const chalk = require('chalk')
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
  try {
    const { config = {} } = (await cosmiconfig.search()) || {}
    const urls = config.url || config.urls || cli.input
    if (!urls) cli.showHelp()
    const flags = { ...config, ...cli.flags }
    const bundle = hyperstatic(urls, flags)

    console.log()

    bundle.on('url', ({ url, filename }) => {
      log.info(`${humanizeUrl(url)} → ${filename}`)
    })

    bundle.on('file:created', ({ pathname }) => {
      log.debug(`${pathname}`)
    })

    bundle.on('file:skipped', ({ pathname }) => {
      log.debug(`${pathname} ${chalk.white('[skipped]')}`)
    })

    bundle.on('file:error', ({ pathname }) => {
      log.debug(`${pathname} ${chalk.white('[empty]')}`)
    })

    bundle.on('end', ({ files, bytes, time }) => {
      const _urls = `${urls.length} urls`
      const _files = `${files} files`
      const _time = chalk.gray(`(${prettyMs(time)})`)
      const _bytes = prettyBytes(bytes)
      log.info(`${_urls}, ${_files}, ${_bytes} ${_time}`)
      process.exit(0)
    })
  } catch (err) {
    if (err.stack) log.error(cleanStack(err.stack))
    else log.error(err.message || err)
    process.exit(1)
  }
})()
