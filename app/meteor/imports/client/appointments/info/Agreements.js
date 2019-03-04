import React from 'react'
import { Field, FormSection } from 'redux-form'
import moment from 'moment-timezone'
import { __ } from '../../../i18n'
import { ListItem } from './ListItem'
import { Switch } from 'redux-form-material-ui'

export const Agreements = ({ patient, calendar, showOnly = 'pending' }) => (
  <FormSection name='agreements'>
    {
      (calendar.requiredAgreements &&
      calendar.requiredAgreements.length >= 1 &&
      calendar.requiredAgreements.map(label => {
        const agreement = patient.agreements && patient.agreements.find(a => a.to === label)
        const agreedAt = agreement && agreement.agreedAt

        if ((showOnly === 'pending' && agreedAt) ||
          (showOnly === 'agreed' && !agreedAt)) {
          return null
        }

        return <ListItem
          key={label}
          icon='file-text-o'
          highlight={!agreedAt}
          style={{ marginTop: 10, paddingTop: 15 }}>
          {
            agreedAt
              ? __(`patients.agreements.${label}.yes`, {
                date: moment(patient.agreedAt).format(__('time.dateFormatShort'))
              }) : __(`patients.agreements.${label}.no`)
          }

          <div className='pull-right' style={{
            position: 'relative',
            right: 5,
            top: -15
          }}>
            <Field
              name={label}
              color='primary'
              component={Switch}
            />
          </div>
          <br /><br />
        </ListItem>
      })) || null
    }
  </FormSection>
)
