import React from 'react'
import { withTracker } from '../components/withTracker'
import { Media as MediaAPI } from '../../api/media'
import { Icon } from '../components/Icon'
import { withHandlers } from 'recompose'
import { NewCycle, splitCycles, Cycle } from './Cycles'

const composer = props => {
  const { appointmentId } = props

  const media = props.media || MediaAPI.find({
    appointmentId
  }, { sort: {
    createdAt: 1
  } }).fetch()

  return { ...props, media }
}

export const Drawer = withTracker(composer)(({ media, patientId, appointmentId, handleMediaClick, style, currentAppointment, isCurrentAppointment, currentCycle }) =>
  (!isCurrentAppointment && media.length === 0)
    ? null
    : <div style={style ? { ...drawerStyle, ...style } : drawerStyle}>

      {splitCycles(media).map(c =>
        <Cycle key={c.cycle} cycle={c.cycle} patientId={patientId} appointmentId={currentAppointment && currentAppointment._id} currentCycle={currentCycle} canAppend={!!currentAppointment}>
          {c.media.map(m =>
             <Preview key={m._id} media={m} handleMediaClick={handleMediaClick} />
          )}
        </Cycle>
      )}

      {isCurrentAppointment &&
        <NewCycle
          patientId={patientId}
          appointmentId={appointmentId}
          currentCycle={currentCycle}
        />
      }

      &nbsp;
    </div>
)

export const Preview = withHandlers({
  handleClick: props => e => props.handleMediaClick(props.media._id)
})(({ media, handleClick, borderStyle, style }) =>
  <div style={borderStyle ? { ...imageBorderStyle, ...borderStyle } : imageBorderStyle} onClick={handleClick}>
    {!media.uploadCompletedAt && <Icon style={uploadingIconStyle} name='clock-o' />}
    <img
      src={media.preview}
      style={style}
    />
  </div>
)

const imageBorderStyle = {
  position: 'relative',
  border: '4px solid #fff',
  margin: 5
}

const uploadingIconStyle = {
  position: 'absolute',
  bottom: 5,
  right: 5,
  opacity: 0.3,
  color: 'white',
  textShadow: '1px 1px 2px rgba(0,0,0,0.6)'
}

const drawerStyle = {
  width: '100%',
  backgroundColor: '#7f8288',
  boxShadow: 'inset 0px 0px 5px 0px rgba(0,0,0,0.24)',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center'
}
