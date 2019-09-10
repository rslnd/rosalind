import React from 'react'
import { withTracker } from '../components/withTracker'
import { Media as MediaAPI } from '../../api/media'

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
  <div>
    <img src={'data:image/jpeg;base64,' + media.preview} />
  </div>

const drawerStyle = {
  minHeight: 120,
  width: '100%',
  backgroundColor: '#7f8288',
  boxShadow: 'inset 0px 0px 5px 0px rgba(0,0,0,0.24)',
  borderRadius: `0 0 4px 4px`,
  display: 'flex',
  flexWrap: 'wrap'
}
