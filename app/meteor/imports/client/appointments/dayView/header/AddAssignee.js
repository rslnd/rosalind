import React from 'react'
import { Manager, Target, Popper } from 'react-popper'
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
  width: 350
}

export class AddAssignee extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isPopoverOpen: false,
      popoverAnchor: null
    }

    this.handleAddUserPopoverOpen = this.handleAddUserPopoverOpen.bind(this)
    this.handleAddUserPopoverClose = this.handleAddUserPopoverClose.bind(this)
    this.handleAddUser = this.handleAddUser.bind(this)
  }
  handleAddUserPopoverOpen (event) {
    this.setState({
      ...this.state,
      isPopoverOpen: true,
      popoverAnchor: event.currentTarget
    })
  }

  handleAddUserPopoverClose () {
    this.setState({
      ...this.state,
      isPopoverOpen: false
    })
  }

  handleAddUser (userId) {
    if (userId) {
      this.props.onAddUser(userId)
    }
  }

  render () {
    return (
      <Manager>
        <Target>
          <Button
            style={buttonStyle}
            className='hide-print'
            onClick={this.handleAddUserPopoverOpen}>
            <span
              className='text-muted'
              style={labelStyle}>
              <Icon name='plus' />
            </span>
          </Button>
        </Target>

        {
          this.state.isPopoverOpen &&
            <Popper placement='bottom-start' eventsEnabled>
              <ClickAwayListener onClickAway={this.handleAddUserPopoverClose}>
                <Paper style={popoverStyle}>
                  <UserPicker
                    autoFocus
                    onChange={this.handleAddUser} />
                </Paper>
              </ClickAwayListener>
            </Popper>
        }
      </Manager>
    )
  }
}
