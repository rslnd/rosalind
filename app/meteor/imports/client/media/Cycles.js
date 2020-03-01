import React from 'react'
import { Button } from '@material-ui/core'
import { Media as MediaAPI } from '../../api/media'
import identity from 'lodash/identity'
import uniq from 'lodash/uniq'
import groupBy from 'lodash/fp/groupBy'
import map from 'lodash/map'
import { getClientKey } from '../../startup/client/native/events'
import { Clients } from '../../api'

export const patientCyclesNames = patientId => {
  const medias = MediaAPI.find({ patientId }).fetch()
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

export const Placeholder = ({ isActive, onClick }) =>
  <div
    onClick={onClick}
    style={isActive ? activePlaceholderStyle : placeholderStyle}>
  </div>

const placeholderStyle = {
  width: 60,
  height: 60,
  border: '3px dashed rgba(255,255,255,0.3)',
  borderRadius: 8
}

const activePlaceholderStyle = {
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
      : <Button onClick={handleNewCycle}>
        New Cycle ({newCycleNr})
      </Button>
    }
  </div>
}

export const Cycle = ({ cycle, currentCycle, patientId, appointmentId, children, canAppend }) =>
  <div>
    Cycle {cycle}
    {children}

    {canAppend && patientId && appointmentId && <Placeholder
      isActive={(currentCycle === cycle)}
      onClick={() => {
        setCycle({ patientId, appointmentId, cycle })
      }}
    />}
  </div>
