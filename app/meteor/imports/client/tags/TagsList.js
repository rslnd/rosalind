import React from 'react'
import groupBy from 'lodash/fp/groupBy'
import sortBy from 'lodash/fp/sortBy'
import { color, lightness } from 'kewler'
import { Icon } from '../components/Icon'
import { Tags } from '../../api/tags'

export const tagBackgroundColor = '#e5e5e5'
export const tagTextColor = '#a0a0a0'

export const tagStyle = {
  borderRadius: 4,
  color: tagTextColor,
  borderBottom: `3px solid ${tagBackgroundColor}`,
  display: 'inline-block',
  paddingTop: 4,
  paddingLeft: 5,
  paddingRight: 5,
  paddingBottom: 3,
  lineHeight: 1.3,
  margin: 2,
  userSelect: 'none'
}

const tagRowStyle = {
  display: 'inline-block',
  marginTop: -15
}

const overlay = {
  opacity: 0.6
}

export const darken = c => color(c)(lightness(-10))()

export const TagsList = ({ tags = [], onClick, style = {}, tiny }) => {
  const expandedTags = tags.map(slug =>
    slug.tag ? slug : Tags.findOne({ _id: slug })
  )

  // group by private, sort within groups
  const groupedTags = groupBy(t => (t.privateAppointment || false))(expandedTags)
  const orderedTagGroups = [groupedTags.false, groupedTags.true]
    .filter(t => t && t.length > 0)
    .map(t => sortBy('order')(t))

  const tinyStyle = tiny ? { zoom: 0.6 } : {}

  return <span style={tinyStyle}>
    {orderedTagGroups.map((tagGroup, i) =>
      <span key={i} style={tagRowStyle}>
        {
          tagGroup.map(tag => {
            return (
              <span
                key={tag._id}
                title={tag.description}
                onClick={() => onClick && onClick(tag._id)}
                style={{
                  ...tagStyle,
                  ...style,
                  color: tag.selectable && (tag.selected ? '#fff' : tagTextColor) || '#fff',
                  backgroundColor: tag.selectable
                    ? (tag.selected ? tag.color : tagBackgroundColor)
                    : tag.color,
                  borderColor: darken(tag.color || tagBackgroundColor)
                }}>
                {tag.tag}
                {tag.privateAppointment && <span>&ensp;<Icon name='eur' style={overlay} /></span>}
              </span>
            )
          })
        }
        {/* Fix a weird issue where the full height of tags is not clickable */}
        <span style={{lineHeight: '60px'}} />
        {
          orderedTagGroups.length > 1 && <br />
        }
      </span>
    )}
  </span>
}
