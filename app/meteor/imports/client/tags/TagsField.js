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
    const { input, meta, assigneeId, allowedTags, calendarId } = this.props

    const selector = allowedTags ? { _id: { $in: allowedTags } } : {}
    const tags = Tags.find(selector, { sort: { order: 1 } }).map((t) => {
      const selected = input.value && input.value.includes(t._id)
      return {
        ...t,
        selectable: true,
        selected
      }
    }).filter(t => {
      if (t.assigneeIds) {
        return t.assigneeIds.includes(assigneeId)
      } else {
        return true
      }
    }).filter(t => {
      if (t.calendarIds && calendarId) {
        return t.calendarIds.includes(calendarId)
      } else {
        return true
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
