import React from 'react'
import { Popover } from 'material-ui/Popover'
import FlatButton from 'material-ui/FlatButton'
import { Icon } from '../../../components/Icon'
import { UserPickerContainer } from '../../../users/UserPickerContainer'
import style from './headerRowStyle'

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
        .then(this.handleAddUserPopoverClose)
    }
  }

  render () {
    return (
      <div>
        <FlatButton
          style={{ minWidth: 30, height: 28, lineHeight: '28px' }}
          onClick={this.handleAddUserPopoverOpen}
          label={<span
            className='text-muted'
            style={{
              display: 'inline-block',
              paddingLeft: 6,
              paddingRight: 6
            }}>
            <Icon name='plus' />
          </span>}
        />

        <Popover
          open={this.state.isPopoverOpen}
          anchorEl={this.state.popoverAnchor}
          onRequestClose={this.handleAddUserPopoverClose}
          style={{ overflowY: 'visible' }}>
          <div className={style.modal}>
            <UserPickerContainer
              autofocus
              onChange={this.handleAddUser} />
          </div>
        </Popover>
      </div>
    )
  }
}
