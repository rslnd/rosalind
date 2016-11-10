import React from 'react'
import moment from 'moment'
import classnames from 'classnames'
import { Popover } from 'material-ui/Popover'
import FlatButton from 'material-ui/FlatButton'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from 'client/ui/components/Icon'
import { UserPickerContainer } from 'client/ui/users/UserPickerContainer'
import style from './headerRowStyle'

export class HeaderRow extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      addUserPopoverOpen: false,
      addUserPopoverAnchor: null,
      userDropdownOpen: false,
      userDropdownAnchor: null
    }

    this.handleAddUserPopoverOpen = this.handleAddUserPopoverOpen.bind(this)
    this.handleAddUserPopoverClose = this.handleAddUserPopoverClose.bind(this)
    this.handleAddUser = this.handleAddUser.bind(this)
    this.handleRemoveUser = this.handleRemoveUser.bind(this)
    this.handleUserDropdownOpen = this.handleUserDropdownOpen.bind(this)
    this.handleUserDropdownClose = this.handleUserDropdownClose.bind(this)
    this.handleToggleOverrideModeClick = this.handleToggleOverrideModeClick.bind(this)
  }

  handleAddUserPopoverOpen (event) {
    this.setState({
      ...this.state,
      addUserPopoverOpen: true,
      addUserPopoverAnchor: event.currentTarget
    })
  }

  handleAddUserPopoverClose () {
    this.setState({
      ...this.state,
      addUserPopoverOpen: false
    })
  }

  handleUserDropdownOpen ({ event, assigneeId }) {
    this.setState({
      ...this.state,
      userDropdownOpen: true,
      userDropdownAnchor: event.currentTarget,
      userDropdownAssigneeId: assigneeId
    })
  }

  handleUserDropdownClose () {
    this.setState({
      ...this.state,
      userDropdownOpen: false
    })
  }

  handleAddUser (userId) {
    if (userId) {
      this.props.onAddUser(userId)
        .then(this.handleAddUserPopoverClose)
    }
  }

  handleRemoveUser () {
    if (this.state.userDropdownAssigneeId) {
      this.props.onRemoveUser(this.state.userDropdownAssigneeId)
        .then(this.handleUserDropdownClose)
    }
  }

  handleToggleOverrideModeClick () {
    const assigneeId = this.state.userDropdownAssigneeId
    if (assigneeId && this.props.onToggleOverrideMode) {
      this.props.onToggleOverrideMode({ assigneeId })
    }
    this.handleUserDropdownClose()
  }

  render () {
    const classes = classnames({
      [ style.headerRowSidebarClosed ]: true,
      [ style.headerRow ]: true
    })

    return (
      <div className={classes}>

        {/* Top-left cell for adding assignees */}
        <div style={{ width: '60px' }}>
          <FlatButton
            style={{ minWidth: 30, height: 28, lineHeight: '28px' }}
            onClick={this.handleAddUserPopoverOpen}
            label={<span
              className="text-muted"
              style={{
                display: 'inline-block',
                paddingLeft: 6,
                paddingRight: 6
              }}>
              <Icon name="plus" />
            </span>} />

          {/* Popover to add users to day's schedule */}
          <Popover
            open={this.state.addUserPopoverOpen}
            anchorEl={this.state.addUserPopoverAnchor}
            onRequestClose={this.handleAddUserPopoverClose}
            style={{ overflowY: 'visible' }}>
            <div className={style.modal}>
              <UserPickerContainer
                autofocus
                onChange={this.handleAddUser} />
            </div>

          </Popover>

        </div>

        {/* Scheduled assignees */}
        {this.props.assignees.map((assignee) => (
          <div
            key={`assignee-${assignee.assigneeId}`}
            className={style.headerCell}
            onClick={(event) => this.handleUserDropdownOpen({ event, assigneeId: assignee.assigneeId })}>

            {
              assignee.fullNameWithTitle
              ? (
                assignee.employee
                ? assignee.fullNameWithTitle
                : <span className="text-muted">{assignee.fullNameWithTitle}</span>
              )
              : TAPi18n.__('appointments.unassigned')
            }
          </div>
        ))}

        {/* Drop down menu for each user */}
        <Popover
          open={this.state.userDropdownOpen}
          anchorEl={this.state.userDropdownAnchor}
          onRequestClose={this.handleUserDropdownClose}
          anchorOrigin={{ horizontal: 'middle', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'middle', vertical: 'top' }}>
          <Menu>
            <MenuItem primaryText="Zeitraum blockieren" onClick={this.handleToggleOverrideModeClick} />
            <MenuItem primaryText="Löschen" onClick={this.handleRemoveUser} />
          </Menu>
        </Popover>
      </div>
    )
  }
}

HeaderRow.propTypes = {
  date: React.PropTypes.oneOfType([
    React.PropTypes.instanceOf(Date),
    React.PropTypes.instanceOf(moment)
  ]).isRequired,
  assignees: React.PropTypes.array,
  overrideMode: React.PropTypes.bool,
  onToggleOverrideMode: React.PropTypes.func.isRequired,
  onAddUser: React.PropTypes.func.isRequired,
  onRemoveUser: React.PropTypes.func.isRequired
}
