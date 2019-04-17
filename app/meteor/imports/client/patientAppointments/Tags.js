import React from 'react'
import { TagsList } from '../tags/TagsList'

export const Tags = ({ tags, tiny }) =>
  <div style={tagsStyle}>
    <TagsList
      tiny={tiny}
      tags={tags}
    />
  </div>

const tagsStyle = {
  paddingLeft: 10
}
