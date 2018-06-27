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

module.exports = async (url, { concurrence, output, prerender, ...opts }) => {
  const { html: rawHtml } = await getHTML(url, { prerender })
  const html = await hyperstatic({ html: rawHtml, url, ...opts })
  const allUrls = await htmlUrls({ html, url })
  const resourceUrls = allUrls.map(item => item.normalizeUrl).filter(isFileUrl)
  const download = downloadFile(output)

  log()
  log.info(`  ${humanizeUrl(url)}`)
  await aigle.eachLimit(resourceUrls, concurrence, download)
  await outputFile(`${output}/index.html`, html)
  log()
}
