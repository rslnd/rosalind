import React from 'react'
import groupBy from 'lodash/fp/groupBy'
import sortBy from 'lodash/fp/sortBy'
import identity from 'lodash/identity'
import { withHandlers } from 'recompose'
import { darken } from '../layout/styles'
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
  margin: 2,
  userSelect: 'none'
}

const tagGroupTitleStyle = {
  display: 'block',
  fontSize: 12
}

const durationStyle = {
  fontSize: '87%',
  opacity: 0.7,
  verticalAlign: 'top',
  display: 'inline-block',
  marginTop: '0.08em',
  marginLeft: '0.7em'
}

const Tag = withHandlers({
  // TODO: Refactor to return full tag objects on click also
  handleClick: props => e => {
    if (props.onClick) {
      e.stopPropagation()
      props.onClick(props.tag._id)
    }
  },
  // HACK: We return the full tag object on hover, because its fields may have been modified by constraints
  handleMouseEnter: props => e => props.onMouseEnter && props.onMouseEnter(props.tag),
  handleMouseLeave: props => e => props.onMouseLeave && props.onMouseLeave(props.tag)
})(({
  tag,
  handleClick,
  handleMouseEnter,
  handleMouseLeave,
  style,
  showDefaultRevenue
}) => <span
  title={tag.description}
  onClick={handleClick}
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
  style={{
    ...tagStyle,
    ...style,
    color: (tag.selectable && (tag.selected ? '#fff' : tagTextColor)) || '#fff',
    backgroundColor: tag.selectable
      ? (tag.selected ? tag.color : tagBackgroundColor)
      : tag.color,
    borderColor: darken(tag.color || tagBackgroundColor),
    textDecoration: tag.removed ? 'line-through' : 'none'
  }}>
    {tag.tag}
    {tag.duration && <span style={durationStyle} title={`Dauer: ${tag.duration} Minuten`}>
      {tag.duration}'
  </span>}
  </span>)

export const TagsList = ({
  tags = [],
  onClick = () => { },
  style = {},
  tiny,
  showDefaultRevenue,
  groupTags = true,
  onMouseEnter,
  onMouseLeave
}) => {
  const expandedTags = tags.map(idOrTag =>
    typeof idOrTag === 'string'
      ? Tags.findOne({ _id: idOrTag }, { removed: true })
      : idOrTag
  ).filter(identity)

  // group by private, sort within groups
  const groupedTags = groupBy(t => (t.privateAppointment || false))(expandedTags)
  const orderedTagGroups = groupTags
    ? [
      {
        title: 'Kasse',
        tags: groupedTags.false
      }, {
        title: 'Privat',
        tags: groupedTags.true,
        style: { paddingTop: 6 }
      }
    ].filter(t => t.tags && t.tags.length > 0)
      .map(t => ({ ...t, tags: sortBy('order')(t.tags) }))
    : [{
      tags: expandedTags
    }]

  const tinyStyle = tiny ? { zoom: 0.8 } : {}
  const tinyTagGroupTitleStyle = tiny ? { zoom: 1 / 0.8 } : {}

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
          tagGroup.tags.map(tag =>
            <Tag
              key={tag._id}
              tag={tag}
              onClick={onClick}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              style={style}
              showDefaultRevenue={showDefaultRevenue}
            />
          )
        }
        {
          orderedTagGroups.length > 1 && <br />
        }
      </span>
    )}
  </span>
}
