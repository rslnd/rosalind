import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
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
    const { input, meta, allowedTags } = this.props

    const selector = allowedTags ? { _id: { $in: allowedTags } } : {}
    const tags = Tags.find(selector, { sort: { order: 1 } }).map((t) => {
      const selected = input.value && input.value.includes(t._id)
      return {
        ...t,
        color: selected ? t.color : '#ccc'
      }
    })

    return <div>
      <TagsList
        tags={tags}
        onClick={this.toggle}
        style={tagsListStyle}
      />
      {
        meta && meta.error &&
          <span className='text-muted'>
            <br />
            {TAPi18n.__(meta.error)}
          </span>
      }
    </div>
  }
}

const tagsListStyle = {
  cursor: 'pointer'
}
