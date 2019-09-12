import React from 'react'
import { withTracker } from '../components/withTracker'
import { Media as MediaAPI } from '../../api/media'
import { Icon } from '../components/Icon'

const composer = props => {
  const media = MediaAPI.find({}, { sort: {
    createdAt: 1
  } }).fetch()
  return { ...props, media }
}

export const Media = withTracker(composer)(({ appointment, media }) =>
  <div style={drawerStyle}>
    {media.map(m =>
      <Preview key={m._id} media={m} />
    )}
    &nbsp;
  </div>
)

const Preview = ({ media }) =>
  <div style={imageContainerStyle}>
    {!media.uploadCompletedAt && <Icon style={uploadingIconStyle} name='clock-o' />}
    <img src={'data:image/jpeg;base64,' + media.preview} />
  </div>

const imageContainerStyle = {
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
  minHeight: 120,
  width: '100%',
  backgroundColor: '#7f8288',
  boxShadow: 'inset 0px 0px 5px 0px rgba(0,0,0,0.24)',
  borderRadius: `0 0 4px 4px`,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center'
}
