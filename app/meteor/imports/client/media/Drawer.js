import React, { useState } from 'react'
import { withTracker } from '../components/withTracker'
import { Media as MediaAPI, MediaTags } from '../../api/media'
import { Icon } from '../components/Icon'
import { withHandlers } from 'recompose'
import { NewCycle, splitCycles, Cycle } from './Cycles'
import { identity } from 'lodash'
import moment from 'moment'

const composer = props => {
  const { appointmentId } = props

  const media = props.media || MediaAPI.find({
    appointmentId,
    kind: 'photo'
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
    </div>
)

export const Preview = ({ media, handleMediaClick, borderStyle, style = {} }) => {
  // const [hover, setHover] = useState(false) // buggy?
  const hover = false
  const setHover = identity

  const baseStyle = hover ? imageBorderHoverStyle : imageBorderStyle
  const outerStyle = borderStyle ? ({ ...baseStyle, ...borderStyle }) : baseStyle

  const uploadPending = !media.uploadCompletedAt
  const uploadFailed = uploadPending
    && (media.createdAt < moment().subtract(1, 'minute').toDate())

  const imagePendingStyle = { ...style, filter: 'grayscale(1)', opacity: 0.1 }
  const imageStyle = uploadPending ? {...style, ...imagePendingStyle} : style

  const tag = (media.tagIds && media.tagIds.length >= 1) && MediaTags.findOne({ _id: media.tagIds[0] })


  return <div
    title={tag ? tag.name : null}
    style={outerStyle}
    onMouseEnter={() => setHover(true)}
    onMouseLeave={() => setHover(false)}
    onClick={() => handleMediaClick(media._id)}
  >
    {!media.uploadCompletedAt && 
      <Icon
        style={uploadingIconStyle}
        spin={uploadPending && !uploadFailed}
        name={uploadFailed ? 'warning' : 'refresh'}
      />
    }
    {tag && <Tag {...tag} />}
    <img
      // dangerous possibility of data loss when media server is not available
      // avoid making it look like the image has been uploaded
      // better show nothing instead of preview
      src={media.preview} // needed for dimensions, but hide in style
      style={imageStyle}
    />
  </div>
}

const Tag = ({ color }) =>
  <div style={tagStyle(color)}></div>

const tagStyle = color => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: 15,
  height: 15,
  opacity: 0.8,
  backgroundColor: color,
  clipPath: 'polygon(0 0, 0% 100%, 100% 100%)'
})

const imageBorderStyle = {
  position: 'relative',
  border: '2px solid rgba(255,255,255,0.7)',
  margin: 5
}

const imageBorderHoverStyle = {
  ...imageBorderStyle,
  border: '2px solid rgba(255,255,255,0.9)',
}

const uploadingIconStyle = {
  position: 'absolute',
  bottom: 10,
  right: 13,
  fontSize: '1.4em',
  opacity: 0.8,
  color: 'white',
  textShadow: '0px 0px 3px rgba(0,0,0,0.6)'
}

const drawerStyle = {
  width: '100%',
  backgroundColor: '#7f8288',
  boxShadow: 'inset 0px 0px 5px 0px rgba(0,0,0,0.24)',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center'
}
