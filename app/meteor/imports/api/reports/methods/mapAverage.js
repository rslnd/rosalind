import mapValues from 'lodash/mapValues'

const mapPatients = ({ report }) => (
  mapValues(report.total.patients, ({ planned, actual }) => {
    let patientsAverage = {
      plannedPerHour: planned / report.total.hours.planned
    }

    if (actual) {
      const h = report.total.hours.actual || report.total.hours.planned
      patientsAverage = {
        ...patientsAverage,
        actualPerHour: actual / h
      }
    }

    return patientsAverage
  })
)

const mapRevenue = ({ report }) => {
  const h = report.total.hours.actual || report.total.hours.planned
  const actualPerHour = report.total.revenue.actual / h

  if (actualPerHour) {
    return {
      actualPerHour
    }
  } else {
    return {}
  }
}

export const mapAverage = ({ report }) => {
  const patients = mapPatients({ report })
  const revenue = mapRevenue({ report })

  return {
    patients,
    revenue
  }
}
