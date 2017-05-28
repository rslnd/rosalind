import React from 'react'
import { Tags } from '../../api/tags'
import { TagsList } from './TagsList'

export class TagsField extends React.Component {
  constructor (props) {
    super(props)
    this.toggle = this.toggle.bind(this)
  }

  toggle (tagId) {
    const value = this.props.input.value || []
    if (value.includes(tagId)) {
      const withoutThisTag = [
        ...value.slice(0, value.indexOf(tagId)),
        ...value.slice(value.indexOf(tagId) + 1)
      ]
      this.props.input.onChange(withoutThisTag)
    } else {
      this.props.input.onChange([ ...value, tagId ])
    }
  }

  render () {
    const selector = this.props.allowedTags ? { _id: { $in: this.props.allowedTags } } : {}
    const tags = Tags.find(selector, { sort: { order: 1 } }).map((t) => {
      const selected = this.props.input.value && this.props.input.value.includes(t._id)
      return {
        ...t,
        color: selected ? t.color : '#ccc'
      }
    })

    return <TagsList
      tags={tags}
      onClick={this.toggle}
      style={{ cursor: 'pointer' }} />
  }
}