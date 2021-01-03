import React from 'react'
import { Meteor } from 'meteor/meteor'
import { __ } from '../../../i18n'
import { withTracker } from '../../components/withTracker'
import Alert from 'react-s-alert'
import moment from 'moment-timezone'
import Button from '@material-ui/core/Button'
import { dayToDate } from '../../../util/time/day'
import { Table } from '../../components/InlineEditTable'
import { Icon } from '../../components/Icon'
import { Schedules } from '../../../api/schedules'
import { Holidays } from './Holidays'
import { NewHolidaysForm } from './NewHolidaysForm'
import { subscribe } from '../../../util/meteor/subscribe'

export class HolidaysContainerComponent extends React.Component {
  handleSubmit (data, dispatch) {
    return new Promise((resolve, reject) => {
      const { day, note } = data
      // day and note are arrays of days and notes because of multiline prop to DayNoteField, need to merge
      const merged = note.map((note, i) => {
        if (!day[i]) {
          const e = `Ungültiges Datum bei ${note}`
          Alert.error(e)
          throw new Error(e)
        }
        return {
          note,
          day: day[i]
        }
      })

      console.log(day, note, merged)

      return Promise.all(merged.map(({ day, note }) => {
        const date = dayToDate(day)
        const holidays = {
          start: moment(date).startOf('day').toDate(),
          end: moment(date).endOf('day').toDate(),
          day,
          note,
          available: false,
          type: 'holiday'
        }

        return Schedules.actions.insert.callPromise({ schedule: holidays })
      })).then(() => {
        Alert.success(__('ui.ok'))
        dispatch({ type: 'HOLIDAYS_INSERT_SUCCESS' })
        resolve()
      }).catch((err) => {
        Alert.error(__('ui.error'))
        reject(err)
        console.log(err)
      })
    })
  }

  handleRemove ({ _id }) {
    return () => {
      Schedules.actions.softRemove.call(({ scheduleId: _id }), err => {
        if (err) {
          Alert.error(__('ui.error'))
          console.error(err)
        } else {
          Alert.success(__('ui.deleted'))
        }
      })
    }
  }

  render () {
    const table = <Table
      structure={structure}
      rows={this.props.holidays}
      handleRemove={this.handleRemove}
      onUpdate={() => {}}
    />

    const form = <NewHolidaysForm
      onSubmit={this.handleSubmit} />

    return (<Holidays table={table} form={form} />)
  }
}

const structure = ({ handleRemove }) => [
  {
    header: 'Datum',
    render: s =>
      moment(dayToDate(s.day)).format(__('time.dateFormatWeekdayShort')),
    style: {
      width: '20%',
      minWidth: 200
    }
  },
  {
    header: 'Bezeichnung',
    render: s => s.note
  },
  {
    render: s => <Button
      style={{ minWidth: 25, opacity: 0.2 }}
      onClick={handleRemove(s)}>
      <Icon name='times' />
    </Button>,
    style: {
      width: 25
    }
  }
]

const composer = () => {
  subscribe('schedules-holidays')

  const holidays = Schedules.find({
    type: 'holiday'
  }, {
    sort: {
      start: 1
    }
  }).fetch()

  return { holidays }
}

export const HolidaysContainer = withTracker(composer)(HolidaysContainerComponent)
