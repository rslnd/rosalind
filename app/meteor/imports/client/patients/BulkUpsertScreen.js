import React from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from '../components/Icon'
import { Box } from '../components/Box'
import { PatientPickerUpsert } from './PatientPickerUpsert'

export const BulkUpsertScreen = ({ submitting, handleSubmit, onSubmit, patientId, change }) => (
  <div className='content'>
    <Box title='Stammdaten vervollständigen'>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
        <PatientPickerUpsert
          autoFocus
          patientId={patientId}
          extended
          change={change} />

        <div className='row' style={{ marginTop: 10 }}>
          <div className='col-md-12'>
            <RaisedButton type='submit'
              onClick={handleSubmit(onSubmit)}
              fullWidth
              primary
              disabled={!patientId}
              label={submitting
                ? <Icon name='refresh' spin />
                : TAPi18n.__('patients.thisSave')} />
          </div>
        </div>
      </form>
    </Box>
  </div>
)
