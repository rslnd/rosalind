import identity from 'lodash/fp/identity'
import { parse as csvToJson } from 'papaparse'
import { isAny } from '../insuranceCodes'

export const preprocessRevenue = (csv) => {
  const rows = csvToJson(csv, { header: true }).data
  const mapped = rows.map(mapRow).filter(identity)
  const grouped = mapped.reduce(groupRows, { result: [], assignee: null }).result
  const filtered = grouped.filter(isReimbursable)
  const summed = filtered.reduce(sumRows, {})

  return summed
}

const mapRow = (row) => {
  if (row.KZ.match(/^A\d+$/)) return mapAssigneeId(row)
  if (row.KZ === 'L') return mapInsuranceReimbursement(row)
  if (row.KZ === 'K') return mapInsuranceCertificate(row)
}

const mapAssigneeId = (row) => {
  return { assignee: row.KZ }
}

const mapInsuranceReimbursement = (row) => {
  return {
    type: 'reimbursement',
    code: row.LST,
    count: parseInt(row.ANZ),
    revenue: parseFloat(row.WERT)
  }
}

const mapInsuranceCertificate = (row) => {
  return {
    type: 'certificate',
    insurance: row.BEZ.substr(0, row.BEZ.indexOf(':')),
    count: parseInt(0, row.BEZ.substr(row.BEZ.indexOf('*'))),
    revenue: parseFloat(row.WERT)
  }
}

const groupRows = (acc, row) => {
  const assignee = row.assignee || acc.assignee

  if (row.assignee) {
    return {
      result: acc.result,
      assignee
    }
  } else {
    return {
      result: [...acc.result, { ...row, assignee }],
      assignee
    }
  }
}

const sumRows = (acc, row) => {
  return {
    ...acc,
    [ row.assignee ]: (acc[row.assignee] || 0.0) + row.revenue
  }
}

const isReimbursable = (row) => {
  switch (row.type) {
    case 'reimbursement': return isAny([ row.code ])
    case 'certificate': return true
    default: return false
  }
}
