import React from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Dialog from '@material-ui/core/Dialog'
import { Button } from '@material-ui/core'
import { DocumentPicker } from '../components/DocumentPicker'
import { Icon } from '../components/Icon'
import { TagsList } from '../tags/TagsList'
import { getClientKey } from '../../startup/client/native/events'
import { Clients } from '../../api'

export const setNextMedia = ({ patientId, appointmentId, cycle, tagIds = [] }) => {
  const clientKey = getClientKey()
  if (clientKey) {
    Clients.actions.setNextMedia.callPromise({
      clientKey,
      patientId,
      appointmentId,
      cycle,
      tagIds
    })
  }
}


const reverse = [
  'Peelings',
  'Blutplasma',
  'Botox',
  'Erbium Yag-Lager',
  'Fadenlifting',
  'Fett-Weg-Spritze',
  'Gefäßlaser',
  'Haarentfernung',
  'Hyaluronsäure',
  'IPL',
  'Kryochirurgie',
  'Microneedling',
  'OP',
  'Peelings',
  'Permanent Make-up',
  'ResurFX',
  'Schaumsklerosierung',
  'Schaumverödung',
  'Tageslicht-PDT',
  'Tattooentfernung',
  'Vitalfeldmessung',
  'kosmetisch störende Hautveränderungen',
  'Abholung Vertretung',
  'DSGVO',
  'TCE'
]

export const Popover = ({ open, onClose }) =>
  <Dialog transitionDuration={0} onClose={onClose} open={open} PaperProps={paperProps}>
    <p style={headingStyle}>Revers</p>
    <div style={newConsentStyle}>
      <div style={pickerStyle}>
        <DocumentPicker
          toLabel={a => a}
          toDocument={a => a}
          toKey={a => a}
          options={() => reverse} />
      </div>
      <Button style={printButtonStyle} variant='outlined' color='primary'>Drucken</Button>
      <Button style={printButtonStyle} variant='outlined' color='primary'>Scannen</Button>
    </div>

    <small style={separatorStyle}><span style={separatorInnerStyle}>oder bestehenden Revers wählen</span></small>

    <List>
      <ListItem button style={previousConsentStyle}>
        <span>Do., 26. September 2019</span>
        <TagsList tiny tags={['HKtpQEatMSWzDryDp']} />
        <div>Doc</div>
      </ListItem>
    </List>
  </Dialog>

const paperProps = {
  style: {
    minWidth: 600,
    minHeight: 550
  }
}

const headingStyle = {
  fontSize: '110%',
  width: '100%',
  padding: '20px 20px 0 20px',
  textAlign: 'center'
}

const newConsentStyle = {
  width: '100%',
  display: 'flex',
  padding: 20
}

const pickerStyle = {
  width: '100%'
}

const printButtonStyle = {
  marginLeft: 20,
  width: 100,
  zoom: 0.9
}

const separatorStyle = {
  display: 'block',
  textAlign: 'center',
  opacity: 0.8,
  margin: 15,
  background: 'linear-gradient(#ffffff 0%, #ffffff 49%, #777 50%, #777 51%, #ffffff 52%, #ffffff 100%)'
}

const separatorInnerStyle = {
  background: 'white',
  padding: '0 20px',
  position: 'relative'
}

const previousConsentStyle = {
  display: 'flex',
  justifyContent: 'space-between'
}
