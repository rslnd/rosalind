import React, { useState } from 'react'
import { withTracker } from '../components/withTracker'
import { MediaTags as MediaTagsAPI, Media as MediaAPI } from '../../api/media'
import { darken } from '../layout/styles'
import { Icon } from '../components/Icon'
import { compose, withState } from 'recompose'
import { __ } from '../../i18n'

const composer = (props) => {
  const { media, singleTag, setForceExpanded } = props
  const allMediaTags = MediaTagsAPI.find({ kind: media.kind }, { sort: { order: 1 } }).fetch()

  const mediaTags = allMediaTags.map(t => ({
    isSelected: media.tagIds && media.tagIds.includes(t._id),
    ...t
  }))

  const handleToggle = t => e => {
    const tagIds = singleTag
      ? [t._id]
      : ((media.tagIds && media.tagIds.includes(t._id))
        ? media.tagIds.filter(x => x !== t._id)
        : [...(media.tagIds || []), t._id])

    MediaAPI.actions.update.callPromise({
      mediaId: media._id,
      update: {
        tagIds
      }
    })

    if (singleTag) {
      setForceExpanded(false)
    }
  }

  // Collapse tag selection after 2 mins
  const collapsedByDefault =
    (new Date() - media.uploadCompletedAt) > 2 * 1000

  return {
    ...props,
    media,
    mediaTags,
    handleToggle,
    collapsedByDefault
  }
}

export const MediaTags = compose(
  withState('forceExpanded', 'setForceExpanded'),
  withTracker(composer)
)(({ mediaTags, handleToggle, forceExpanded, setForceExpanded }) => {
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

    <span
      style={expandStyle}
      onClick={() => setForceExpanded(true)}
      title={__('ui.edit')}
    >
      <Icon name='ellipsis-h' />
    </span>
  </div>
})

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  zoom: 0.8
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
