import React from 'react'
import { Tags } from 'api/tags'
import style from './style'

export const TagsList = ({ tags = [] }) => (
  <span>
    {tags.map((slug) => {
      const tag = Tags.findOne({ tag: slug })
      return (
        <span
          key={tag._id}
          style={{backgroundColor: tag.color || '#ccc'}}
          className={style.tag}>{tag.tag}
        </span>
      )
    })}
  </span>
)
