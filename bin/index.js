#!/usr/bin/env node
'use strict'

process.setMaxListeners(Infinity)

const cosmiconfig = require('cosmiconfig')('hyperstatic')
const hyperstatic = require('@hyperstatic/core')
const cleanStack = require('clean-stack')
const timestamp = require('time-stamp')
const timeSpan = require('time-span')
const createDebug = require('debug')
const neatLog = require('neat-log')
const path = require('path')

const fileCreated = createDebug('hyperstatic:file:created')
const fileSkipped = createDebug('hyperstatic:file:skipped')
const fileError = createDebug('hyperstatic:file:error')
const fileUrl = createDebug('hyperstatic:file:url')

const pkg = require('../package.json')
const createRender = require('./render')

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
      type: 'number'
    },
    logspeed: {
      type: 'number',
      default: 100
    },
    verbose: {
      alias: 'v',
      type: 'boolean',
      default: false
    },
    whitelist: {
      alias: 'w',
      type: 'array'
    },
    quiet: {
      alias: 'q',
      type: 'boolean',
      default: false
    }
  }
})

const throwError = err => {
  if (err.stack) console.error(cleanStack(err.stack))
  else console.error(err.message || err)
  process.exit(1)
}

const main = async () => {
  const { config = {} } = (await cosmiconfig.search()) || {}
  const urls = config.url || config.urls || cli.input
  if (!urls) cli.showHelp()

  const { logspeed, ...flags } = cli.flags
  const opts = { ...config, ...flags }
  const bundle = hyperstatic(urls, opts)
  const state = { urls: [], count: 0, time: timeSpan() }
  const neat = neatLog(createRender(opts), { state, logspeed })
  console.log()

  neat.use((state, bus) => {
    bus.emit('render')

    bundle.on('url', ({ url, filename, time, total }) => {
      fileUrl(`${url} → ${filename}`)
      state.total = total
      ++state.count
      state.urls.push({
        total,
        url,
        filename,
        time,
        timestamp: timestamp('HH:mm:ss')
      })
      bus.emit('render')
    })

    setInterval(async () => {
      bus.emit('render')
      if (state.end || state.exitCode) process.exit(state.exitCode || 0)
    }, logspeed)

    bundle.on('file:created', ({ url, pathname }) =>
      fileCreated(`${url} → ${pathname}`)
    )

    bundle.on('file:skipped', ({ pathname }) => fileSkipped(pathname))

    bundle.on('file:error', ({ url, pathname, err }) =>
      fileError(`${url} → ${pathname}`, err.message || err)
    )

    bundle.on('end', ({ urls, files, bytes, time }) => {
      state.end = true
      state.endTime = state.time()
      state.files = files
      state.bytes = bytes
      state.end = true
      state.stats = { files, bytes, time }
      bus.emit('render')
    })

    bundle.on('error', throwError)
  })
}

main().catch(throwError)
