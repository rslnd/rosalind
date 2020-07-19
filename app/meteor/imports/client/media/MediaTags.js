import React, { useState } from 'react'
import { withTracker } from '../components/withTracker'
import { MediaTags as MediaTagsAPI, Media as MediaAPI } from '../../api/media'
import { darken } from '../layout/styles'
import { Icon } from '../components/Icon'

const composer = (props) => {
  const { media } = props
  const allMediaTags = MediaTagsAPI.find({ kind: media.kind }, { sort: { order: 1 } }).fetch()

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

  // Collapse tag selection after 1 hour
  const collapsedByDefault =
    (media.tagIds && media.tagIds.length >= 1) &&
    (new Date() - media.uploadCompletedAt) > 60 * 60 * 1000

  return {
    ...props,
    media,
    mediaTags,
    handleToggle,
    collapsedByDefault
  }
}

export const MediaTags = withTracker(composer)(({ mediaTags, handleToggle, collapsedByDefault }) => {
  const [forceExpanded, setForceExpanded] = useState(!collapsedByDefault)
  const selectedMediaTags = mediaTags.filter(m => m.isSelected)
  const expanded = forceExpanded || (selectedMediaTags.length === 0)
  const shownMediaTags = expanded ? mediaTags : selectedMediaTags

  return <div style={containerStyle}>
    {shownMediaTags.map(t =>
      <span
        key={t._id}
        style={tagStyle(t)}
        onClick={handleToggle(t)}>{t.name}</span>
    )}

    {
      !expanded &&
        <span
          style={expandStyle}
          onClick={() => setForceExpanded(true)}
        >
          <Icon name='ellipsis-h' />
        </span>
    }
  </div>
})

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-evenly',
  flexWrap: 'wrap'
}

const tagStyle = ({ isSelected, color } = {}) => ({
  backgroundColor: isSelected ? color : 'rgba(128,128,128,0.5)',
  borderBottom: `3px solid ${darken(color || '#000')}`,
  color: 'white',
  display: 'inline-block',
  padding: 5,
  paddingLeft: 8,
  paddingRight: 8,
  margin: 5,
  borderRadius: '4px',
  cursor: 'pointer'
})

const expandStyle = {
  ...tagStyle(),
  borderBottom: 'none',
  opacity: 0.8
}
