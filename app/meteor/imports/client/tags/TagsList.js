import React from 'react'
import groupBy from 'lodash/fp/groupBy'
import sortBy from 'lodash/fp/sortBy'
import { color, lightness } from 'kewler'
import { Icon } from '../components/Icon'
import { Tags } from '../../api/tags'
import { Currency } from '../components/Currency';

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
  margin: 2,
  userSelect: 'none'
}

const tagGroupTitleStyle = {
  display: 'block',
  fontSize: 12
}

const overlay = {
  opacity: 0.6
}

export const darken = c => color(c)(lightness(-10))()

export const TagsList = ({ tags = [], onClick, style = {}, tiny, showDefaultRevenue }) => {
  const expandedTags = tags.map(slug =>
    slug.tag ? slug : Tags.findOne({ _id: slug })
  )

  // group by private, sort within groups
  const groupedTags = groupBy(t => (t.privateAppointment || false))(expandedTags)
  const orderedTagGroups = [
    {
      title: 'Kasse',
      tags: groupedTags.false
    }, {
      title: 'Privat',
      tags: groupedTags.true,
      style: { paddingTop: 6 }
    }]
    .filter(t => t.tags && t.tags.length > 0)
    .map(t => ({ ...t, tags: sortBy('order')(t.tags) }))

  const tinyStyle = tiny ? { zoom: 0.6 } : {}
  const tinyTagGroupTitleStyle = tiny ? { zoom: 1.66 } : {}

  return <span style={tinyStyle}>
    {orderedTagGroups.map((tagGroup, i) =>
      <span key={i}>
        {
        orderedTagGroups.length > 1 &&
          <span className='text-muted' style={{
            ...tagGroup.style,
            ...tagGroupTitleStyle,
            ...tinyTagGroupTitleStyle
          }}>
            {tagGroup.title}
          </span>
        }
        {
          tagGroup.tags.map(tag => {
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
                <PrivateIndicator tag={tag} showDefaultRevenue={showDefaultRevenue} />
              </span>
            )
          })
        }
        {
          orderedTagGroups.length > 1 && <br />
        }
      </span>
    )}
  </span>
}

const PrivateIndicator = ({ tag, showDefaultRevenue }) => {
  let render = null
  if (showDefaultRevenue && tag.defaultRevenue > 0) {
    render = <Currency value={tag.defaultRevenue} />
  } else if (tag.privateAppointment) {
    render = <Icon name='eur' style={overlay} />
  }

  return render &&
    <span>
      &ensp;
      {render}
    </span>
}
