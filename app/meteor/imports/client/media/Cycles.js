import React, { useState } from 'react'
import { Button } from '@material-ui/core'
import { Media as MediaAPI } from '../../api/media'
import identity from 'lodash/identity'
import uniq from 'lodash/uniq'
import groupBy from 'lodash/fp/groupBy'
import map from 'lodash/map'
import sortBy from 'lodash/sortBy'
import reverse from 'lodash/reverse'
import { getClientKey } from '../../startup/client/native/events'
import { Clients } from '../../api'
import { Icon } from '../components/Icon'

export const patientCyclesNames = patientId => {
  const medias = MediaAPI.find({ patientId }, { sort: { createdAt: -1 } }).fetch()
  const uniqueCycles = uniq(medias.map(m => m.cycle).filter(identity))
  return reverse(sortBy(uniqueCycles)) // newest firt, for sidebar filter
}

const nextCycleNumber = patientId => {
  const names = patientCyclesNames(patientId)
  if (names.length === 0) { return '1' }

  const highestNumber = Math.max(...names.map(n => parseInt(n)))

  // BUG
  if (!highestNumber || isNaN(highestNumber)) {
    console.warn(`[Media] nextCycleNumber: Fallback to buggy legacy behavior, where deleting an old cycle causes the next cycle to be equal to the last cycle: ${patientId} ${names.join(',')}`)
    return String(names.length + 1)
  } else {
    return String(highestNumber + 1)
  }
}

export const setNextMedia = ({ patientId, appointmentId, cycle }) => {
  const clientKey = getClientKey()
  if (clientKey) {
    Clients.actions.setNextMedia.callPromise({
      clientKey,
      patientId,
      appointmentId,
      cycle,
      tagIds: []
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
    title={isActive ? 'Neue Fotos werden hier eingefügt' : 'Neue Fotos hier einfügen'}
    style={isActive ? activePlaceholderStyle : (hover ? hoverPlaceholderStyle : placeholderStyle)}>
      {isActive && <Icon name='hand-o-left' />}
  </div>
}

const placeholderStyle = {
  width: 40,
  height: 40,
  border: '2px dashed rgba(255,255,255,0.15)',
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
  border: '2px dashed rgba(255,255,255,0.9)'
}

const hoverPlaceholderStyle = {
  ...placeholderStyle,
  border: '2px dashed rgba(255,255,255,0.7)'
}

export const NewCycle = ({ patientId, appointmentId, currentCycle }) => {
  const newCycleNr = nextCycleNumber(patientId)
  const handleNewCycle = () =>
    setNextMedia({ patientId, appointmentId, cycle: newCycleNr })
  const isNewCycle = currentCycle === newCycleNr

  return <div style={newContainerStyle}>
    {
      isNewCycle
      ? <Cycle patientId={patientId} appointmentId={appointmentId} currentCycle={currentCycle} cycle={newCycleNr} canAppend={!!appointmentId}>
      </Cycle>
      : <Button style={newButtonStyle} onClick={handleNewCycle}>
        <Icon name='plus' />
        &nbsp;
        Neue Sitzung ({newCycleNr})
      </Button>
    }
  </div>
}

const newContainerStyle = {
  flex: 'none',
  width: '100%'
}

const newButtonStyle = {
  // zoom: 0.8,
  color: 'white',
  opacity: 0.9,
  margin: 7
}

export const Cycle = ({ cycle, currentCycle, patientId, appointmentId, children, canAppend }) =>
  <div style={cycleContainerStyle}>
    {cycle && cycle !== "null" && <span style={cycleTitleStyle}>Sitzung {cycle}</span>}
    {/* UGH... */}

    <div style={cycleInnerStyle}>
      {children}


      {canAppend && patientId && appointmentId && <Placeholder
        isActive={(currentCycle === cycle)}
        onClick={() => {
          setNextMedia({ patientId, appointmentId, cycle })
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
  padding: 8,
  color: 'rgba(255,255,255,0.9)',
  lineHeight: 1.6
}

const cycleTitleStyle = {
  display: 'inline-block',
  paddingLeft: 4,
  fontSize: '90%'
}
