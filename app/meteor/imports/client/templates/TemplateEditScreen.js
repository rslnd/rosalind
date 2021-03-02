import moment from 'moment-timezone'
import React, { useState, useEffect } from 'react'
import Alert from 'react-s-alert'
import { withTracker } from '../components/withTracker'
import { Box } from '../components/Box'
import { __ } from '../../i18n'
import { Templates } from '../../api/templates'
import { Meteor } from 'meteor/meteor'
import { Button, TextField } from '@material-ui/core'
import { fillPlaceholders } from './fillPlaceholders'
import { useThrottle } from '../util/useThrottle'
import { PDFViewer } from './PDFViewer'

const composer = props => {
  Meteor.subscribe('templates')

  const _id = props.match.params.id

  const template = Templates.findOne({ _id })

  const action = x => x
    .then(_ => Alert.success(__('ui.saved')))
    .catch(e => { console.error(e); Alert.error(__('ui.error')) })

  const handleUpdate = (newPlaceholders) => {
    const update = {
      $set: {
        placeholders: newPlaceholders
      }
    }
    action(Templates.actions.update.callPromise({ templateId: _id, update }))
  }

  if (!template) { return { isLoading: true }}

  return {
    template,
    handleUpdate
  }
}

const isValidJSON = x => {
  try {
    JSON.parse(x)
    return true
  } catch (e) {
    return false
  }
}

const Screen = ({ template, handleUpdate }) => {
  const [ newPlaceholders, setNewPlaceholders ] = useState(JSON.stringify((template && template.placeholders) || [], null, 2))
  const [ preview, setPreview ] = useState(null)

  const refreshPreview = useThrottle(async (newPlaceholders) => {
    if (!isValidJSON(newPlaceholders)) { return }

    const newPreview = await fillPlaceholders({
      base64: template.base64,
      placeholders: JSON.parse(newPlaceholders),
      values: {
        patientFullNameWithTitle: 'Mag. Musterpatientin Muster',
        assigneeFullNameWithTitle: 'Fr. Dr. Musterärztin Mustra',
        birthday: moment('1970-01-01').format(__('time.dateFormatVeryShort')),
        currentDate: moment().format(__('time.dateFormatVeryShort')),
        patientId: 'PxEXAMPLEx8PAF2tqsn',
        assigneeId: 'UxEXAMPLEx8PAF2tqsn',
        appointmentId: 'AxEXAMPLEx8PAF2tqsn',
        templateId: 'TxEXAMPLEx8PAF2tqsn',
        consentId: 'CxEXAMPLEx8PAF2tqsn',
        clientId: 'WxEXAMPLEx8PAF2tqsn'
      }
    })

    setPreview(newPreview)
  }, 350)

  useEffect(() => {
    refreshPreview(newPlaceholders)
  }, [newPlaceholders])

  if (preview === null) {
    refreshPreview((template && template.placeholders) || [])
  }

  const handleChange = e => {
    setNewPlaceholders(e.target.value)
    // Don't refresh preview here, it'll be called by useEffect above
  }

  return <div className='content'>
    <div className='row'>
      <div className='col-md-12'>
        <Box title='Vorlage bearbeiten' icon='document'>
          <small className='enable-select'>
            Pflichtfelder: <i>x, y, page, fontSize, value </i><br />
            Verfügbare Platzhalter (value): <i>currentDate, birthday, patientFullNameWithTitle, assigneeFullNameWithTitle</i>
          </small>
          <br />

          <div style={{display: 'flex'}}>
            <div style={flexStyle}>
              <TextField
                multiline
                fullWidth
                rows={30}
                rowsMax={200}
                onChange={handleChange}
                value={newPlaceholders} />
            </div>

            <div style={flexStyle}>
              <PDFViewer pdf={preview} />
            </div>

          </div>


          <Button
            disabled={!isValidJSON(newPlaceholders)}
            onClick={() => handleUpdate(JSON.parse(newPlaceholders))}>{__('ui.save')}</Button>
        </Box>
      </div>
    </div>
  </div>
}

export const TemplateEditScreen = withTracker(composer)(Screen)

const flexStyle = {
  flex: 1
}
