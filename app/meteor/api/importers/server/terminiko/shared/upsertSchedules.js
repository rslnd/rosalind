import moment from 'moment'
import tz from 'moment-timezone'
import { Schedules } from 'api/schedules'
import { getResource } from './getResources'
import { parseNewlines } from './parseNewlines'

export const upsertSchedules = ({ record, resources, job, timezone = 'Europe/Vienna' }) => {
  if (!record.Datum_Beginn || !record.Datum_Ende) { return }

  const start = tz(moment(record.Datum_Beginn), timezone).toDate()
  const end = tz(moment(record.Datum_Ende), timezone).toDate()
  if (moment().range(start, end).diff('seconds') < 1) { return }

  const assignees = getResource({ key: 'D', record, resources })
  if (!assignees || !assignees.assigneeId) { return }

  const { assigneeId } = assignees

  const schedule = {
    type: 'override',
    userId: assigneeId,
    available: false,
    start,
    end,
    external: {
      terminiko: {
        id: record.Kennummer,
        note: parseNewlines(record.Info && record.Info.toString()),
        timestamps: {
          importedAt: moment().toDate(),
          importedBy: job.data.userId,
          externalUpdatedAt: record.Datum_Bearbeitung && tz(moment(record.Datum_Bearbeitung), timezone).toDate()
        }
      }
    }
  }

  Schedules.methods.upsert.call({ schedule, quiet: true })
}
