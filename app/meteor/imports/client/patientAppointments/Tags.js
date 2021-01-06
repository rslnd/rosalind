import React from 'react'
import Alert from 'react-s-alert'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import { TagsList } from '../tags/TagsList'
import { compose, withState, withHandlers, withProps } from 'recompose'
import { Icon } from '../components/Icon'
import { getPossibleTags } from '../../api/availabilities/methods/getPossibleTags'
import { Appointments } from '../../api/appointments'
import { Availabilities } from '../../api/availabilities'
import { Constraints } from '../../api/constraints'
import { Tags as TagsApi } from '../../api/tags'
import { __ } from '../../i18n'
import { Paper } from '@material-ui/core'
import { Close } from './Close'
import { getConstrainedTags } from '../tags/TagsField'

const updateTags = ({ _id }, tags, revenue) =>
  Appointments.actions.update.callPromise({
    appointmentId: _id,
    update: {
      tags
    }
  }).then(() => {
    Alert.success(__('ui.saved'))
  })

export const Tags = compose(
  withState('editing', 'setEditing'),
  withProps(props => {
    const { calendarId, calendar, assigneeId, start, editing } = props
    const tags = props.tags || []
    if (!editing || !calendarId) { return { tags } }

    const availability = Availabilities.findOne({
      assigneeId,
      calendarId,
      from: { $lte: start },
      to: { $gte: start }
    })

    const maxDuration = Appointments.methods.getMaxDuration({ time: start, assigneeId, calendarId })

    if (!availability && !calendar.allowEditTagsWhenUnavailable) {
      return { possibleTags: [], maxDuration, tags }
    }

    const constraints = Constraints.find({ assigneeId, calendarId }).fetch()

    const allowedTags = Appointments.methods.getAllowedTags({ time: start, assigneeId, calendarId })

    return {
      possibleTags: getConstrainedTags({
        assigneeId,
        allowedTags,
        maxDuration,
        calendarId,
        assigneeId,
        time: start,
        constraint: constraints[0] // BUG: Allow multiple constraints
      }) || [],
      tags,
      maxDuration
    }
  }),
  withState('hovering', 'setHovering'),
  withProps(props => ({ hovering: props.hovering || props.isCurrent })),
  withHandlers({
    onMouseEnter: props => e => props.setHovering(true),
    onMouseLeave: props => e => props.setHovering(false),
    startEdit: props => e => props.setEditing(true),
    endEdit: props => e => props.setEditing(false),
    toggleTag: props => tagId => {
      if (props.possibleTags.length !== 0) {
        if (props.tags.find(t => t === tagId)) {
          if (props.tags.length >= 2) {
            return updateTags(props, props.tags.filter(t => t !== tagId))
          }
        } else {
          return updateTags(props, [...props.tags, tagId])
        }
      }
    }
  })
)(({
  tags,
  isCurrent,
  editing,
  startEdit,
  endEdit,
  hovering,
  onMouseEnter,
  onMouseLeave,
  toggleTag,
  possibleTags
}) =>
  <ClickAwayListener onClickAway={endEdit}>
    <div>
      <div
        style={tagsStyle}
        onClick={editing ? endEdit : startEdit}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <TagsList
          tiny={!isCurrent || editing}
          tags={tags}
          showDuration={false}
          onClick={editing ? (possibleTags.length >= 1 ? toggleTag : endEdit) : startEdit}
        />

        {
          hovering && <EditButton />
        }
      </div>

      {
        editing &&
        <Paper style={editingStyle} elevation={3}>
          <Close onClick={endEdit} />
          {
            possibleTags.length === 0
              ? __('appointments.cannotEditTags')
              : <div style={tagsListStyle}>
                <TagsList
                  showDuration={false}
                  tags={possibleTags.map(p => ({
                    ...p,
                    selected: ((tags || []).indexOf(p._id) !== -1)
                  }))}
                  onClick={toggleTag}
                />
              </div>
          }
        </Paper>
      }
    </div>
  </ClickAwayListener>
)

const tagsStyle = {
  paddingLeft: 10,
  paddingRight: 10
}

const editingStyle = {
  ...tagsStyle,
  background: '#fff',
  position: 'relative',
  padding: 10,
  marginTop: 4,
  marginLeft: 10,
  marginRight: 10,
  borderRadius: '4px',
  maxWidth: '100%'
}

const tagsListStyle = {
  width: 'calc(100% - 45px)'
}

const EditButton = () =>
  <span style={editButton}>
    <Icon name='ellipsis-h' />
  </span>

const editButton = {
  display: 'inline-block',
  marginLeft: 6,
  textAlign: 'center',
  width: 30,
  height: 15,
  opacity: 0.2
}
