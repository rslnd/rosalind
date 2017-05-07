import React from 'react'
import moment from 'moment'
import classnames from 'classnames'
import { Popover } from 'material-ui/Popover'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import { TAPi18n } from 'meteor/tap:i18n'
import { AddAssignee } from './AddAssignee'
import { AssigneesDetails } from './AssigneesDetails'
import style from './headerRowStyle'

export class HeaderRow extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      userDropdownOpen: false,
      userDropdownAnchor: null
    }

    this.handleRemoveUser = this.handleRemoveUser.bind(this)
    this.handleUserDropdownOpen = this.handleUserDropdownOpen.bind(this)
    this.handleUserDropdownClose = this.handleUserDropdownClose.bind(this)
    this.handleToggleOverrideModeClick = this.handleToggleOverrideModeClick.bind(this)
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
      <div>
        <div className={classes}>
          <AddAssignee onAddUser={this.props.onAddUser} />
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
        <AssigneesDetails date={this.props.date} assignees={this.props.assignees} />
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
