'use strict'

const { outputFile } = require('fs-extra')
const download = require('download')
const { URL } = require('url')
const path = require('path')

const log = require('./log')

const cache = new Set()

module.exports = output => async url => {
  const { pathname } = new URL(url)

  if (cache.has(url)) {
    log.debug(`   → ${pathname} [skipped]`)
    return
  }

  const filepath = path.join(output, pathname)
  let data = ''

  try {
    data = await download(url)
    await outputFile(filepath, data)
    log.debug(`   → ${pathname}`)
  } catch (err) {
    await outputFile(filepath, data)
    log.debug(`   → ${pathname} [empty]`)
  }

  cache.add(url)
}
