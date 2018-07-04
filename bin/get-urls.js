'use strict'

const aigle = require('aigle')
const fromXML = require('xml-urls')

const { isXmlUrl } = fromXML

const resolveUrl = async url => (!isXmlUrl(url) ? [url] : fromXML(url))

module.exports = async urls => {
  const set = await aigle.reduce(
    urls,
    async (set, url) => {
      return new Set([...set, ...(await resolveUrl(url))])
    },
    new Set()
  )

  return Array.from(set)
}
