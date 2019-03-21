import React from 'react'
import isEqual from 'lodash/isEqual'
import { Tags } from '../../api/tags'
import { Appointments } from '../../api/appointments'
import { TagsList } from './TagsList'
import { getDefaultDuration } from '../../api/appointments/methods/getDefaultDuration'
import { applyConstraintToTags } from '../../api/constraints/methods/applyConstraintToTags'
import _moment from 'moment'
import { extendMoment } from 'moment-range'

const moment = extendMoment(_moment)

const getConstrainedTags = ({
  allowedTags,
  value,
  maxDuration,
  calendarId,
  assigneeId,
  time,
  constraint
}) => {
  const selector = allowedTags ? { _id: { $in: allowedTags } } : {}
  const tags = Tags.find(selector, { sort: { order: 1 } }).map((t) => {
    const selected = value && value.includes(t._id)
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
      tags: [...(value || []), t._id],
      date: moment(time)
    })

    if (duration > maxDuration) {
      return false
    } else {
      return true
    }
  }).filter(t => {
    if (t.maxParallel &&
      Appointments.methods.getParallelAppointments({
        start: time,
        end: moment(time).clone().add(t.duration, 'minutes').subtract(1, 'second'),
        tags: t._id
      }).length >= t.maxParallel
    ) {
      return false
    } else {
      return true
    }
  }).filter(t => {
    if ((!allowedTags || allowedTags.length === 0) && t.assigneeIds) {
      return t.assigneeIds.includes(assigneeId)
    } else {
      return true
    }
  }).filter(t => {
    if ((!allowedTags || allowedTags.length === 0) && t.blacklistAssigneeIds) {
      return !t.blacklistAssigneeIds.includes(assigneeId)
    } else {
      return true
    }
  }).filter(t => {
    if ((!allowedTags || allowedTags.length === 0) && t.calendarIds && calendarId) {
      return t.calendarIds.includes(calendarId)
    } else {
      return true
    }
  })

  const constrainedTags = constraint
    ? applyConstraintToTags({ constraint, tags })
    : tags

  return constrainedTags
}

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

  // Check if any forbidden tags were passed as value prop and dispatch update accordingly
  componentDidMount () {
    if (!this.props.autocorrectTags) { return }

    const value = this.props.input.value
    if (!value || value.length === 0) { return }

    const {
      allowedTags,
      assigneeId,
      calendarId,
      maxDuration,
      time,
      constraint
    } = this.props

    const constrainedTags = getConstrainedTags({
      allowedTags,
      value,
      assigneeId,
      calendarId,
      maxDuration,
      time,
      constraint
    })

    // BUG: Constrained tags with different durations may have same _id, this will always select the first matching tag only
    const constrainedTagIds = constrainedTags.map(t => t._id)

    const constrainedValue = value.filter(v => constrainedTagIds.includes(v))

    if (!isEqual(value, constrainedValue)) {
      console.log('[TagsField] Filtering tag selection from', value, 'to', constrainedValue)
      this.props.input.onChange(constrainedValue)
    }
  }

  render () {
    const {
      input: { value },
      meta,
      assigneeId,
      allowedTags,
      maxDuration,
      calendarId,
      showDefaultRevenue,
      time,
      constraint
    } = this.props

    const constrainedTags = getConstrainedTags({
      allowedTags,
      value,
      assigneeId,
      calendarId,
      maxDuration,
      time,
      constraint
    })

    return <div>
      <TagsList
        tags={constrainedTags}
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
