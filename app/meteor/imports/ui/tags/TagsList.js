import React from 'react'
import { Tags } from '../../api/tags'

const tagStyle = {
  borderRadius: 4,
  color: '#fff',
  display: 'inline-block',
  padding: 4,
  margin: 2,
  userSelect: 'none'
}

export const TagsList = ({ tags = [], onClick, style = {} }) => (
  <span>
    {tags.map((slug) => {
      const tag = slug.tag ? slug : Tags.findOne({ _id: slug })
      return (
        <span
          key={tag._id}
          title={tag.description}
          onClick={() => onClick && onClick(tag._id)}
          style={{ ...tagStyle, ...style, backgroundColor: tag.color || '#ccc' }}
        >
          {tag.tag}
        </span>
      )
    })}
  </span>
)
