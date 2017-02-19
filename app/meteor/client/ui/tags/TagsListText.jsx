import React from 'react'
import { Tags } from 'api/tags'

export const TagsListText = ({ tags = [] }) => (
  <span>
    {tags.map((slug) => {
      const tag = slug.tag ? slug : Tags.findOne({ _id: slug })
      return (
        <span
          key={tag._id}
          title={tag.tag}>
          {tag.description}<br />
        </span>
      )
    })}
  </span>
)
