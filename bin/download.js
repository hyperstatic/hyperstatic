'use strict'

const hyperstatic = require('@hyperstatic/core')
const humanizeUrl = require('humanize-url')
const { outputFile } = require('fs-extra')
const isFileUrl = require('check-file')
const htmlUrls = require('html-urls')
const getHTML = require('html-get')
const aigle = require('aigle')

const downloadFile = require('./download-file')
const log = require('./log')

const getFileName = url =>
  url.pathname === '/' ? 'index.html' : `${url.pathname.replace('/', '')}.html`

const downloadUrl = ({
  concurrence,
  output,
  prerender,
  ...opts
}) => async url => {
  const { html: rawHtml } = await getHTML(url, { prerender })
  const html = await hyperstatic({ html: rawHtml, url, ...opts })
  const allUrls = await htmlUrls({ html, url })
  const resourceUrls = allUrls.map(item => item.normalizeUrl).filter(isFileUrl)
  const download = downloadFile(output)
  const filename = getFileName(new URL(url))

  log.info(`  ${humanizeUrl(url)} → ${filename}`)
  await aigle.eachLimit(resourceUrls, concurrence, download)
  await outputFile(`${output}/${filename}`, html)
  log()
}

module.exports = async (urls, opts) => aigle.eachSeries(urls, downloadUrl(opts))
