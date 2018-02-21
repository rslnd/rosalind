import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import { Manager, Target, Popper } from 'react-popper'
import Menu, { MenuItem } from 'material-ui/Menu'
import Paper from 'material-ui/Paper'
import { TAPi18n } from 'meteor/tap:i18n'
import { AddAssignee } from './AddAssignee'
import { AssigneesDetails } from './AssigneesDetails'
import { background, grayDisabled, gray } from '../../../css/global'
import ClickAwayListener from 'material-ui/utils/ClickAwayListener';

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

const topPaddingStyle = {
  height: 30
}

export class HeaderRow extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      userDropdownOpen: false,
      userDropdownAnchor: null,
      hovering: false
    }

    this.handleRemoveUser = this.handleRemoveUser.bind(this)
    this.handleUserDropdownOpen = this.handleUserDropdownOpen.bind(this)
    this.handleUserDropdownClose = this.handleUserDropdownClose.bind(this)
    this.handleToggleOverrideModeClick = this.handleToggleOverrideModeClick.bind(this)
    this.handleMouseEnter = this.handleMouseEnter.bind(this)
    this.handleMouseLeave = this.handleMouseLeave.bind(this)
  }

  handleUserDropdownOpen ({ event, assigneeId, canRemoveUser }) {
    if (this.props.canEditSchedules) {
      this.setState({
        ...this.state,
        userDropdownOpen: true,
        userDropdownAnchor: event.currentTarget,
        userDropdownAssigneeId: assigneeId,
        canRemoveUser
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

  handleMouseEnter () {
    this.setState({
      hovering: true
    })
  }

  handleMouseLeave () {
    this.setState({
      hovering: false
    })
  }

  render () {
    return (
      <div
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}>
        <div style={headerRowStyle}>
          <div className='hide-print' style={addAssigneeStyle}>
            {
              this.props.canEditSchedules &&
                <AddAssignee onAddUser={this.props.onAddUser} />
            }
          </div>
          {/* Scheduled assignees */}
          {this.props.assignees.map((assignee) => (
            <div
              key={assignee.assigneeId}
              style={headerCellStyle}
              onClick={(event) => this.handleUserDropdownOpen({ event, assigneeId: assignee.assigneeId, canRemoveUser: !assignee.hasAppointments })}>

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
        </div>

        <Menu
          id='assignee-dropdown'
          open={this.state.userDropdownOpen}
          onClose={this.handleUserDropdownClose}
          anchorEl={this.state.userDropdownAnchor}
          getContentAnchorEl={null}
          anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'center', vertical: 'top' }}>
          <MenuItem onClick={this.handleToggleOverrideModeClick}>
            Zeitraum blockieren
          </MenuItem>
          <MenuItem
            disabled={!this.state.canRemoveUser}
            onClick={this.handleRemoveUser}>
            Löschen
          </MenuItem>}
        </Menu>

        <AssigneesDetails
          date={this.props.date}
          assignees={this.props.assignees}
          expanded={this.state.hovering} />
        <div style={topPaddingStyle} />
      </div>
    )
  }
}

HeaderRow.propTypes = {
  date: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.instanceOf(moment)
  ]).isRequired,
  assignees: PropTypes.array,
  overrideMode: PropTypes.bool,
  onToggleOverrideMode: PropTypes.func.isRequired,
  onAddUser: PropTypes.func.isRequired,
  onRemoveUser: PropTypes.func.isRequired
}
