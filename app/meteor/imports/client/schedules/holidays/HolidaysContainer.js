import React from 'react'
import { Meteor } from 'meteor/meteor'
import { TAPi18n } from 'meteor/tap:i18n'
import { withTracker } from 'meteor/react-meteor-data'
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
      console.log(day, note)
      const date = dayToDate(day)
      const holidays = {
        start: moment(date).startOf('day').toDate(),
        end: moment(date).endOf('day').toDate(),
        day,
        note,
        available: false,
        type: 'holiday',
        createdAt: new Date(),
        createdBy: Meteor.userId()
      }

      Schedules.insert(holidays, (err) => {
        if (err) {
          Alert.error(TAPi18n.__('ui.error'))
          reject(err)
          console.log(err)
        } else {
          Alert.success(TAPi18n.__('ui.ok'))
          dispatch({ type: 'HOLIDAYS_INSERT_SUCCESS' })
          resolve()
        }
      })
    })
  }

  handleRemove ({ _id }) {
    return () => {
      Schedules.softRemove(({ _id }), err => {
        if (err) {
          Alert.error(TAPi18n.__('ui.error'))
          console.error(err)
        } else {
          Alert.success(TAPi18n.__('ui.deleted'))
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
      moment(dayToDate(s.day)).format(TAPi18n.__('time.dateFormatWeekdayShort')),
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
