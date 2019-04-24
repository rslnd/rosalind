import React from 'react'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import { TagsList } from '../tags/TagsList'
import { compose, withState, withHandlers } from 'recompose'
import { Icon } from '../components/Icon'

export const Tags = compose(
  withState('editing', 'setEditing'),
  withState('hovering', 'setHovering'),
  withHandlers({
    onMouseEnter: props => e => props.setHovering(true),
    onMouseLeave: props => e => props.setHovering(false),
    startEdit: props => e => props.setEditing(true),
    endEdit: props => e => props.setEditing(false),
    updateTags: props => e => console.log('update tags', e),
    removeTag: props => e => console.log('removing tag', e)
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
  removeTag,
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
          tiny={tiny}
          tags={tags}
          onClick={editing ? removeTag : startEdit}
        />

        {
          hovering &&
          <EditButton />
        }
      </div>

      {
        editing &&
        <div style={editingStyle}>
          rom
          </div>
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
  background: '#ccc',
  borderRadius: '4px',
  width: '100%'
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
