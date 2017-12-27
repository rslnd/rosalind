import React from 'react'
import groupBy from 'lodash/fp/groupBy'
import sortBy from 'lodash/fp/sortBy'
import { Icon } from '../components/Icon'
import { Tags } from '../../api/tags'

export const tagStyle = {
  borderRadius: 4,
  color: '#fff',
  display: 'inline-block',
  padding: 4,
  margin: 2,
  userSelect: 'none'
}

const overlay = {
  opacity: 0.6
}

export const TagsList = ({ tags = [], onClick, style = {} }) => {
  const expandedTags = tags.map(slug =>
    slug.tag ? slug : Tags.findOne({ _id: slug })
  )

  // group by private, sort within groups
  const groupedTags = groupBy(t => (t.privateAppointment || false))(expandedTags)
  const orderedTagGroups = [groupedTags.false, groupedTags.true].map(t => sortBy('order')(t))

  return <span>
    {orderedTagGroups.map((tagGroup, i) =>
      <span key={i}>{
        tagGroup.map(tag => {
          return (
            <span
              key={tag._id}
              title={tag.description}
              onClick={() => onClick && onClick(tag._id)}
              style={{ ...tagStyle, ...style, backgroundColor: tag.color || '#ccc' }}
            >
              {tag.tag}
              {tag.privateAppointment && <span>&ensp;<Icon name='eur' style={overlay} /></span>}
            </span>
          )
        })
      }<br /></span>
    )}
  </span>
}
