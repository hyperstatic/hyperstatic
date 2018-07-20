'use strict'

const output = require('neat-log/output')

const createRenderSpinner = require('./spinner')
const createRenderStats = require('./stats')
const createRenderUrl = require('./url')

const noop = () => ''

module.exports = ({ quiet, verbose }) => {
  const renderUrl = quiet ? noop : createRenderUrl({ verbose })
  const renderSpinner = quiet ? noop : createRenderSpinner({ verbose })
  const renderStats = quiet ? noop : createRenderStats({ verbose })

  return state => {
    const url = renderUrl(state)
    const spinner = renderSpinner(state)
    const stats = renderStats(state)
    return output(`${spinner}${url}${stats}`)
  }
}
