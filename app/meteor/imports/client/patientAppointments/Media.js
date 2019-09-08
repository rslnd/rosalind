import React from 'react'
import { withTracker } from '../components/withTracker'
import { Media as MediaAPI } from '../../api/media'

const composer = props => {
  const media = MediaAPI.find({}).fetch()
  return { ...props, media }
}

export const Media = withTracker(composer)(({ appointment, media }) =>
  <div style={mediaBackgroundStyle}>
    {media.map(m =>
      <div key={m._id}>
        <img src={m.preview} />
      </div>
    )}
    &nbsp;
  </div>
)

const mediaBackgroundStyle = {
  height: 120,
  width: '100%',
  backgroundColor: '#7f8288',
  boxShadow: 'inset 0px 0px 5px 0px rgba(0,0,0,0.24)',
  borderRadius: `0 0 4px 4px`
}
