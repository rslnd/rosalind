import Alert from 'react-s-alert'
import React from 'react'
import moment from 'moment-timezone'
import { __ } from '../../i18n'
import Switch from '@material-ui/core/Switch'
import { withTracker } from '../components/withTracker'
import { Calendars } from '../../api/calendars'
import { Patients } from '../../api/patients'
import { compose, withHandlers } from 'recompose'

const composer = props => {
  return {
    ...props,
    calendar: Calendars.findOne({ _id: props.calendarId })
  }
}

export const Agreements = compose(
  withTracker(composer),
  withHandlers({
    updateAgreements: props => (agreement, agreed) => e =>
      Patients.actions.setAgreement.callPromise({
        agreement,
        agreed,
        patientId: props.patient._id
      }).then(() => {
        Alert.success(__('ui.saved'))
      })
  })
)(({ patient, updateAgreements, calendar, showOnly = 'pending' }) =>
  <div>
    {
      (calendar &&
        calendar.requiredAgreements &&
        calendar.requiredAgreements.length >= 1 &&
        calendar.requiredAgreements.map(label => {
          const agreement = patient.agreements && patient.agreements.find(a => a.to === label)
          const agreedAt = agreement && agreement.agreedAt

          if ((showOnly === 'pending' && agreedAt) ||
            (showOnly === 'agreed' && !agreedAt)) {
            return null
          }

          return <div key={label}>
            {
              agreedAt
                ? __(`patients.agreements.${label}.yes`, {
                  date: moment(agreedAt).format(__('time.dateFormatShort'))
                }) : __(`patients.agreements.${label}.no`)
            }

            <div className='pull-right' style={{
              position: 'relative',
              right: 5,
              top: -15
            }}>
              <Switch
                name={label}
                checked={!!agreedAt}
                color='primary'
                onChange={updateAgreements(label, !agreedAt)}
              />
            </div>
            <br /><br />
          </div>
        })) || null
    }
  </div>
)
