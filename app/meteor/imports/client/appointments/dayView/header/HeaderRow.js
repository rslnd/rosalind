import React from 'react'
import moment from 'moment-timezone'
import { Popover } from 'material-ui/Popover'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import { TAPi18n } from 'meteor/tap:i18n'
import { AddAssignee } from './AddAssignee'
import { AssigneesDetails } from './AssigneesDetails'
import { background, grayDisabled, gray } from '../../../css/global'

const headerRowStyle = {
  backgroundColor: background,
  borderBottom: `1px solid ${grayDisabled}`,
  display: 'flex',
  paddingBottom: 6,
  paddingTop: 10,
  position: 'fixed',
  left: 60,
  right: 15,
  top: 50,
  zIndex: 40
}

const addAssigneeStyle = {
  width: 60
}

const headerCellStyle = {
  flex: 1,
  fontWeight: 'bold',
  paddingTop: 4,
  borderLeft: `1px solid ${gray}`,
  textAlign: 'center'
}


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
    if (this.props.canEditSchedules) {
      this.setState({
        ...this.state,
        userDropdownOpen: true,
        userDropdownAnchor: event.currentTarget,
        userDropdownAssigneeId: assigneeId
      })
    }
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
    return (
      <div>
        <div style={headerRowStyle}>
          <div style={addAssigneeStyle}>
            {this.props.canEditSchedules && <AddAssignee onAddUser={this.props.onAddUser} />}
          </div>
          {/* Scheduled assignees */}
          {this.props.assignees.map((assignee) => (
            <div
              key={`assignee-${assignee.assigneeId}`}
              style={headerCellStyle}
              onClick={(event) => this.handleUserDropdownOpen({ event, assigneeId: assignee.assigneeId })}>

              {
                assignee.fullNameWithTitle
                ? (
                  assignee.employee
                  ? assignee.fullNameWithTitle
                  : <span className='text-muted'>{assignee.fullNameWithTitle}</span>
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
              <MenuItem primaryText='Zeitraum blockieren' onClick={this.handleToggleOverrideModeClick} />
              <MenuItem primaryText='Löschen' onClick={this.handleRemoveUser} />
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
