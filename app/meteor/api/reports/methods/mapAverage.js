import mapValues from 'lodash/mapValues'

const mapPatients = ({ report }) => (
  mapValues(report.total.patients, ({ planned }) => {
    return { plannedPerHour: planned / report.total.hours.planned }
  })
)

export const mapAverage = ({ report }) => {
  const patients = mapPatients({ report })

  return {
    patients
  }
}
