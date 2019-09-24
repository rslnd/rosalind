import React from 'react'
import { withTracker } from '../components/withTracker'
import { Media, MediaTags } from '../../api'
import { Drawer } from './Drawer'

const composer = props => {
  const { patientId } = props

  const pinnedTagIds = MediaTags.find({ pinned: true }).fetch().map(m => m._id)

  if (pinnedTagIds.length === 0) { return props }

  const pinnedMedia = Media.find({
    patientId,
    tagIds: {
      $in: pinnedTagIds
    }
  }).fetch()

  return {
    ...props,
    pinnedMedia
  }
}

export const Pinned = withTracker(composer)(({ pinnedMedia, ...props }) =>
  <Drawer media={pinnedMedia} {...props} />
)
