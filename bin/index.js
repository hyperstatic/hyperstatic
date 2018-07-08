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
const os = require('os')

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
      default: os.cpus().length
    },
    debug: {
      alias: 'd',
      type: 'boolean',
      default: false
    }
  }
})

const throwError = err => {
  if (err.stack) log.error(cleanStack(err.stack))
  else log.error(err.message || err)
  process.exit(1)
}
;(async () => {
  try {
    const { config = {} } = (await cosmiconfig.search()) || {}
    const urls = config.url || config.urls || cli.input
    if (!urls) cli.showHelp()
    const flags = { ...config, ...cli.flags }
    const bundle = hyperstatic(urls, flags)

    console.log()

    bundle.on('url', ({ url, filename, time }) => {
      const prettyTime = chalk.gray(prettyMs(time))
      if (flags.debug) { log.info(`${humanizeUrl(url)} → ${filename} ${prettyTime}`) } else log.info(`${filename} ${prettyTime}`)
    })

    bundle.on('file:created', ({ pathname }) => {
      if (flags.debug) log.debug(`${pathname}`)
    })

    bundle.on('file:skipped', ({ pathname }) => {
      if (flags.debug) log.debug(`${pathname} ${chalk.white('[skipped]')}`)
    })

    bundle.on('file:error', ({ pathname }) => {
      if (flags.debug) log.debug(`${pathname} ${chalk.white('[empty]')}`)
    })

    bundle.on('end', ({ urls, files, bytes, time }) => {
      const _urls = `${urls.length} urls`
      const _files = `${files} files`
      const _time = chalk.gray(`(${prettyMs(time)})`)
      const _bytes = prettyBytes(bytes)
      console.log()
      log.info(`${_urls}, ${_files}, ${_bytes} ${_time}`)
      process.exit(0)
    })

    bundle.on('error', throwError)
  } catch (err) {
    throwError(err)
  }
})()
