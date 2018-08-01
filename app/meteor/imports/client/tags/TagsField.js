import React from 'react'
import { Tags } from '../../api/tags'
import { TagsList } from './TagsList'
import { getDefaultDuration } from '../../api/appointments/methods/getDefaultDuration'

export class TagsField extends React.Component {
  constructor (props) {
    super(props)
    this.toggle = this.toggle.bind(this)
  }

  toggle (tagId) {
    this.props.input.onBlur()

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
    const { input, meta, assigneeId, allowedTags, maxDuration, calendarId, showDefaultRevenue, time } = this.props

    const selector = allowedTags ? { _id: { $in: allowedTags } } : {}
    const tags = Tags.find(selector, { sort: { order: 1 } }).map((t) => {
      const selected = input.value && input.value.includes(t._id)
      return {
        ...t,
        selectable: true,
        selected
      }
    }).filter(t => {
      if (maxDuration === null) {
        return true
      }

      const duration = getDefaultDuration({
        calendarId,
        assigneeId,
        tags: [...(input.value || []), t._id],
        date: time
      })

      if (duration > maxDuration) {
        return false
      } else {
        return true
      }
    }).filter(t => {
      if (t.assigneeIds) {
        return t.assigneeIds.includes(assigneeId)
      } else {
        return true
      }
    }).filter(t => {
      if (t.blacklistAssigneeIds) {
        return !t.blacklistAssigneeIds.includes(assigneeId)
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
        showDefaultRevenue={showDefaultRevenue}
      />
      {
        meta && meta.touched && (meta.error || meta.warning) &&
          <span style={errorStyle}>
            <br />
            {meta.error}
          </span>
      }
    </div>
  }
}

const tagsListStyle = {
  cursor: 'pointer'
}

const errorStyle = {
  color: '#f44336',
  fontSize: '11px',
  display: 'inline-block',
  marginTop: -8
}
