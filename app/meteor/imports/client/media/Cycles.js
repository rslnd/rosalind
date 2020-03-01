import React, { useState } from 'react'
import { Button } from '@material-ui/core'
import { Media as MediaAPI } from '../../api/media'
import identity from 'lodash/identity'
import uniq from 'lodash/uniq'
import groupBy from 'lodash/fp/groupBy'
import map from 'lodash/map'
import { getClientKey } from '../../startup/client/native/events'
import { Clients } from '../../api'
import { Icon } from '../components/Icon'

export const patientCyclesNames = patientId => {
  const medias = MediaAPI.find({ patientId }, { sort: { createdAt: -1 } }).fetch()
  const uniqueCycles = uniq(medias.map(m => m.cycle).filter(identity))
  return uniqueCycles
}

export const setCycle = ({ patientId, appointmentId, cycle }) => {
  const clientKey = getClientKey()
  if (clientKey) {
    Clients.actions.setCurrentView.callPromise({
      clientKey,
      patientId,
      appointmentId,
      cycle
    })
  }
}

export const splitCycles = media => {
  return map(groupBy('cycle')(media), (media, cycle) => {
    return { cycle, media }
  })
}

export const Placeholder = ({ isActive, onClick }) => {
  const [hover, setHover] = useState(false)

  return <div
    onClick={onClick}
    onMouseEnter={() => setHover(true)}
    onMouseLeave={() => setHover(false)}
    style={isActive ? activePlaceholderStyle : (hover ? hoverPlaceholderStyle : placeholderStyle)}>
      {isActive && <Icon name='hand-o-left' />}
  </div>
}

const placeholderStyle = {
  width: 60,
  height: 60,
  border: '3px dashed rgba(255,255,255,0.15)',
  borderRadius: 8,
  alignSelf: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(255,255,255,0.9)',
  cursor: 'pointer'
}

const activePlaceholderStyle = {
  ...placeholderStyle,
  border: '3px dashed rgba(255,255,255,0.9)'
}

const hoverPlaceholderStyle = {
  ...placeholderStyle,
  border: '3px dashed rgba(255,255,255,0.7)'
}

export const NewCycle = ({ patientId, appointmentId, currentCycle }) => {
  const newCycleNr = String(patientCyclesNames(patientId).length + 1)
  const handleNewCycle = () =>
    setCycle({ patientId, appointmentId, cycle: newCycleNr })
  const isNewCycle = currentCycle === newCycleNr

  return <div>
    {
      isNewCycle
      ? <Cycle patientId={patientId} appointmentId={appointmentId} currentCycle={currentCycle} cycle={newCycleNr} canAppend={!!appointmentId}>
      </Cycle>
      : <Button style={newButtonStyle} onClick={handleNewCycle}>
        Neuer Zyklus ({newCycleNr})
      </Button>
    }
  </div>
}

const newButtonStyle = {
  zoom: 0.9,
  opacity: 0.8,
  margin: 7
}

export const Cycle = ({ cycle, currentCycle, patientId, appointmentId, children, canAppend }) =>
  <div style={cycleContainerStyle}>
    Zyklus {cycle}

    <div style={cycleInnerStyle}>
      {children}


      {canAppend && patientId && appointmentId && <Placeholder
        isActive={(currentCycle === cycle)}
        onClick={() => {
          setCycle({ patientId, appointmentId, cycle })
        }}
      />}
    </div>
  </div>

const cycleInnerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center'
}

const cycleContainerStyle = {
  padding: 8
}
