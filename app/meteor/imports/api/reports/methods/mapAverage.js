import map from 'lodash/map'
import sum from 'lodash/sum'
import identity from 'lodash/identity'
import flatten from 'lodash/flatten'
import mapValues from 'lodash/fp/mapValues'
import groupBy from 'lodash/fp/groupBy'
import { dot as flattenObject, object as expandObject } from 'dot-object'

export const mapAverage = ({ report }) => {
  const patients = averageSubfields(report.assignees.map(a => a.patients))
  const revenue = averageSubfields(report.assignees.map(a => a.revenue))

  return {
    patients,
    revenue
  }
}

const averageSubfields = (fragments = []) => {
  const flattened = flatten(fragments
    .filter(identity)
    .map(a =>
      wrap(flattenObject(a))))
  const grouped = groupBy('key')(flattened)
  const averaged = mapValues(g => average(map(g.filter(isAverageable), 'value')))(grouped)
  return expandObject(averaged)
}

const isAverageable = ({ value, key }) => {
  if (key.includes('PerHour') && (!value || value === 0)) {
    return false
  } else {
    return true
  }
}

const wrap = a => map(a, (value, key) => ({ value, key }))
const average = values => sum(values) / values.length
