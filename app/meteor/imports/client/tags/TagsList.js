import React from 'react'
import groupBy from 'lodash/fp/groupBy'
import sortBy from 'lodash/fp/sortBy'
import identity from 'lodash/identity'
import { withHandlers } from 'recompose'
import { darken, lighten } from '../layout/styles'
import { Tags } from '../../api/tags'
import { Icon } from '../components/Icon'

export const tagBackgroundColor = '#e5e5e5'

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

const paddings = {
  paddingTop: 4,
  paddingLeft: 5,
  paddingRight: 5,
  paddingBottom: 3
}

const getInnerTagStyle = ({ tag }) => ({
  display: 'inline-block',
  backgroundColor: (tag.color || tagBackgroundColor),
  borderTopColor: (tag.color || tagBackgroundColor),
  textDecoration: tag.removed ? 'line-through' : 'none',
  color: '#fff',
  ...paddings
})

const getOuterTagStyle = ({ tag, style }) => ({
  display: 'inline-block',
  userSelect: 'none',
  ...style
})

const getCheckboxStyle = ({ tag }) => ({
  display: 'inline-block',
  color: '#fff',
  backgroundColor: tag.selected ? darken(tag.color || tagBackgroundColor, -15) : '#eee',
  textAlign: 'center',
  ...paddings
})


const iconStyle = {
  color: '#fff',
  width: 24,
  paddingRight: 6,
  paddingLeft: 4
}

const Check = ({ tag }) =>
  <span style={getCheckboxStyle({ tag })}>
    {
      tag.selected
        ? <Icon name='check' style={selectedIconStyle} />
        : <Icon name='circle-o' style={unselectedIconStyle} />
    }
  </span>

const unselectedIconStyle = {
  ...iconStyle,
  opacity: 0.6
}

const selectedIconStyle = {
  ...iconStyle,
  opacity: 1
}

const borderStyle = {
  display: 'inline-block',
  borderRadius: 4,
  overflow: 'hidden',
  marginLeft: 3,
  marginRight: 3
}

// used in: drawer; pause button; tags screen
export const tagStyle = {
  ...paddings,
  ...borderStyle,
  userSelect: 'none',
  backgroundColor: tagBackgroundColor,
  color: '#fff',
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
  showDefaultRevenue,
  showDuration
}) =>
  <span
    style={borderStyle}
    title={tag.description}
    onClick={handleClick}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
  >
    <span
      style={getOuterTagStyle({ tag, style })}
    >

      {
        tag.selectable &&
          <Check tag={tag} />
      }

      <span
        style={getInnerTagStyle({ tag })}
      >
        {tag.tag}
        {
          showDuration && tag.duration &&
            <span style={durationStyle} title={`Dauer: ${tag.duration} Minuten`}>
              {tag.duration}'
            </span>
        }
      </span>
    </span>
  </span>)

export const TagsList = ({
  tags = [],
  onClick,
  style = {},
  tiny,
  showDefaultRevenue,
  showDuration = true,
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
              showDuration={showDuration}
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
