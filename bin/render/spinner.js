'use strict'

const spinner = require('ora')({ text: '', color: 'gray' })
const calcPercent = require('calc-percent')

const render = {
  normal: ({ end, count, total }) => {
    if (end) return ''
    const content = total
      ? calcPercent(count, total, { suffix: '%' })
      : 'Determinating URLs to bundle...'
    const spinnerFrame = total ? spinner.frame() : ''
    return `  ${content} ${spinnerFrame}`
  },

  verbose: ({ urls }) => ''
}

module.exports = ({ verbose }) => render[verbose ? 'verbose' : 'normal']
