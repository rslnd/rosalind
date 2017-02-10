import moment from 'moment-timezone'
import { Schedules } from 'api/schedules'
import { getResource } from './getResources'
import { parseNewlines } from './parseNewlines'

export const upsertSchedules = ({ record, resources, job, timezone = 'Europe/Vienna' }) => {
  if (!record.Datum_Beginn || !record.Datum_Ende) { return }

  const start = moment.tz(record.Datum_Beginn, timezone).toDate()
  const end = moment.tz(record.Datum_Ende, timezone).toDate()
  const duration = moment().range(start, end)
  if (duration.diff('seconds') < 1) { return }

  if (duration.diff('hours') > 12) { return }

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
          externalUpdatedAt: record.Datum_Bearbeitung && moment.tz(record.Datum_Bearbeitung, timezone).toDate()
        }
      }
    }
  }

  Schedules.actions.upsert.call({ schedule, quiet: true })
}
