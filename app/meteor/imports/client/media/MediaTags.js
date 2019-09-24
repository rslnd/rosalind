import React from 'react'
import { withTracker } from '../components/withTracker'
import { MediaTags as MediaTagsAPI, Media as MediaAPI } from '../../api/media'

const composer = (props) => {
  const { media } = props
  const allMediaTags = MediaTagsAPI.find({}, { sort: { order: 1 } }).fetch()

  const mediaTags = allMediaTags.map(t => ({
    isSelected: media.tagIds && media.tagIds.includes(t._id),
    ...t
  }))

  const handleToggle = t => e =>
    MediaAPI.actions.update.callPromise({
      mediaId: media._id,
      update: {
        tagIds: (media.tagIds && media.tagIds.includes(t._id))
          ? media.tagIds.filter(x => x !== t._id)
          : [...(media.tagIds || []), t._id]
      }
    })

  return {
    ...props,
    media,
    mediaTags,
    handleToggle
  }
}

export const MediaTags = withTracker(composer)(({ mediaTags, handleToggle }) => {
  return <div>
    {mediaTags.map(t =>
      <span
        key={t._id}
        style={tagStyle(t)}
        onClick={handleToggle(t)}>{t.tag}</span>
    )}
  </div>
})

const tagStyle = ({ isSelected, color }) => ({
  backgroundColor: isSelected ? color : 'rgba(128,128,128,0.5)',
  color: 'white',
  display: 'inline-block',
  padding: 5,
  paddingLeft: 8,
  paddingRight: 8,
  margin: 5,
  borderRadius: '5px'
})
