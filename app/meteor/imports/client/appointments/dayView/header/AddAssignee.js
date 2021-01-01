import React, { useState } from 'react'
import { usePopper } from 'react-popper'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import { Icon } from '../../../components/Icon'
import { UserPicker } from '../../../users/UserPicker'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'

const buttonStyle = {
  minWidth: 30,
  minHeight: 28,
  height: 28
}

const labelStyle = {
  display: 'inline-block',
  paddingLeft: 6,
  paddingRight: 6
}

const popoverStyle = {
  height: 400,
  zIndex: 50,
  overflowY: 'visible',
  padding: 10,
  width: 350,
  marginLeft: 86
}

export const AddAssignee = (props) => {
  const [isOpen, setOpen] = useState(false)
  const [referenceElement, setReferenceElement] = useState(null)
  const [popperElement, setPopperElement] = useState(null)
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
   modifiers: [{ options: { placement: 'bottom-start' } }]
  })

  const handleAddUserPopoverOpen = (e) => {
    // setReferenceElement(e.currentTarget)
    setOpen(true)
  }

  const handleAddUserPopoverClose = (e) => {
    setOpen(false)
    // setReferenceElement(null)
  }

  const handleAddUser = (userId) => {
    if (userId) {
      props.onAddUser(userId)
    }
  }

  return (
    <>
      <Button
        ref={setReferenceElement}
        style={buttonStyle}
        className='hide-print'
        onClick={handleAddUserPopoverOpen}>
        <span
          className='text-muted'
          style={labelStyle}>
          <Icon name='plus' />
        </span>
      </Button>

      {
        isOpen &&
          <div
            ref={setPopperElement}
            style={styles.popper}
            {...attributes.popper}
          >
            <ClickAwayListener onClickAway={handleAddUserPopoverClose}>
              <Paper style={popoverStyle}>
                <UserPicker
                  autoFocus
                  onChange={handleAddUser} />
              </Paper>
            </ClickAwayListener>
          </div>
      }
    </>
  )
}
