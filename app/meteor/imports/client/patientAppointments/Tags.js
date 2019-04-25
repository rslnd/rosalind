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

const updateTags = ({ _id }, tags) =>
  Appointments.actions.update.callPromise({
    appointmentId: _id,
    update: {
      tags
    }
  }).then(() => {
    Alert.success(__('ui.saved'))
  })

export const Tags = compose(
  withProps(props => {
    const { calendarId, assigneeId, start } = props
    if (!calendarId) { return }

    const maxDuration = Appointments.methods.getMaxDuration({ time: start, assigneeId, calendarId })

    const availability = Availabilities.findOne({
      assigneeId,
      calendarId,
      from: { $lte: start },
      to: { $gte: start }
    })
    const tags = TagsApi.find({}).fetch()
    const constraints = Constraints.find({ assigneeId, calendarId }).fetch()

    if (!availability) {
      return { possibleTags: [], maxDuration }
    } else {
      const possibleTags = getPossibleTags({ availability, tags, constraints }).map(t => {
        return {
          ...t,
          selectable: true,
          selected: props.tags.find(at => at === t._id)
        }
      })
      return { possibleTags, maxDuration }
    }
  }),
  withState('editing', 'setEditing'),
  withState('hovering', 'setHovering'),
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
  tiny,
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
          tiny={tiny || editing}
          tags={tags}
          onClick={editing ? (possibleTags.length >= 1 ? toggleTag : endEdit) : startEdit}
        />

        {
          hovering && (possibleTags.length !== 0) &&
          <EditButton />
        }
      </div>

      {
        editing &&
        <Paper style={editingStyle} elevation={3}>
          <Close onClick={endEdit} />
          {
            possibleTags.length === 0
              ? __('appointments.cannotEditTags')
              : <TagsList
                tags={possibleTags}
                onClick={toggleTag}
              />
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
  background: '#efefef',
  position: 'relative',
  padding: 10,
  marginTop: 4,
  marginLeft: 10,
  marginRight: 10,
  borderRadius: '4px',
  maxWidth: '100%'
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
