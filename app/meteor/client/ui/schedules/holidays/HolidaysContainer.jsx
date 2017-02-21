import React from 'react'
import Blaze from 'meteor/gadicc:blaze-react-component'
import Alert from 'react-s-alert'
import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { TAPi18n } from 'meteor/tap:i18n'
import { Schedules } from 'api/schedules'
import { holidays as holidaysTable } from 'api/schedules/tables'
import { Holidays } from './Holidays'
import { NewHolidaysForm } from './NewHolidaysForm'

export class HolidaysContainer extends React.Component {
  handleSubmit (data, dispatch) {
    return new Promise((resolve, reject) => {
      const { start, end, note } = data
      const holidays = {
        start: moment(start).startOf('day').toDate(),
        end: moment(end).endOf('day').toDate(),
        note,
        type: 'holidays',
        createdAt: new Date(),
        createdBy: Meteor.userId()
      }

      Schedules.insert(holidays, (err) => {
        if (err) {
          Alert.error(TAPi18n.__('schedules.postRequestError'))
          reject(err)
          console.log(err)
        } else {
          Alert.success(TAPi18n.__('schedules.postRequestSuccess'))
          dispatch({ type: 'HOLIDAYS_INSERT_SUCCESS' })
          resolve()
        }
      })
    })
  }

  render () {
    const table = <Blaze
      template="dataTable"
      title="schedules.holidays"
      table={holidaysTable}
      id="holidaysTable"
      noNew />

    const form = <NewHolidaysForm
      onSubmit={this.handleSubmit} />

    return (<Holidays table={table} form={form} />)
  }
}
