import identity from 'lodash/identity'
import React from 'react'
import Alert from 'react-s-alert'
import MenuItem from '@material-ui/core/MenuItem'
import Grow from '@material-ui/core/Grow'
import Paper from '@material-ui/core/Paper'
import Popper from '@material-ui/core/Popper'
import MenuList from '@material-ui/core/MenuList'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import { TAPi18n } from 'meteor/tap:i18n'
import { AddAssignee } from './AddAssignee'
import { AssigneesDetails } from './AssigneesDetails'
import { background, grayDisabled, gray } from '../../../css/global'
import { Modal } from 'react-bootstrap'
import Button from '@material-ui/core/Button'
import { UserPickerContainer } from '../../../users/UserPickerContainer'

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
      hovering: false,
      changingAssignee: false
    }

    this.handleRemoveUser = this.handleRemoveUser.bind(this)
    this.handleUserDropdownOpen = this.handleUserDropdownOpen.bind(this)
    this.handleUserDropdownClose = this.handleUserDropdownClose.bind(this)
    this.handleToggleOverrideModeClick = this.handleToggleOverrideModeClick.bind(this)
    this.handleMouseEnter = this.handleMouseEnter.bind(this)
    this.handleMouseLeave = this.handleMouseLeave.bind(this)
    this.handleChangeAssigneeClick = this.handleChangeAssigneeClick.bind(this)
    this.handleChangeAssigneeFinishClick = this.handleChangeAssigneeFinishClick.bind(this)
  }

  handleUserDropdownOpen ({ event, assigneeId, canRemoveUser }) {
    if (this.props.canEditSchedules) {
      this.setState({
        userDropdownOpen: true,
        userDropdownAnchor: event.currentTarget,
        userDropdownAssigneeId: assigneeId,
        canRemoveUser
      })
    }
  }

  handleUserDropdownClose () {
    this.setState({
      userDropdownOpen: false,
      userDropdownAnchor: null,
      userDropdownAssigneeId: null
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

  handleChangeAssigneeClick () {
    const currentAssigneeId = this.state.userDropdownAssigneeId
    if (currentAssigneeId) {
      this.handleUserDropdownClose()
      setTimeout(() => {
        this.setState({
          changingAssignee: {
            oldAssigneeId: currentAssigneeId,
            newAssigneeId: currentAssigneeId
          }
        })
      }, 600) // BUG Weird interaction with mui menu sets overflow: hidden on body
    }
  }

  handleChangeAssigneeFinishClick () {
    const { oldAssigneeId, newAssigneeId } = this.state.changingAssignee
    if (oldAssigneeId === newAssigneeId) { return }

    const todaysAssigneeIds = this.props.assignees
      .map(a => a.assigneeId).filter(identity)

    if (todaysAssigneeIds.includes(newAssigneeId)) {
      Alert.error(TAPi18n.__('appointments.changeAssigneeMustBeDifferent'))
      return
    }

    this.props.onChangeAssignee({
      oldAssigneeId,
      newAssigneeId
    }).then(() =>
      Alert.success(TAPi18n.__('appointments.changeAssigneeSuccess'))
    )

    this.setState({
      changingAssignee: false
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

        <Popper
          open={this.state.userDropdownOpen}
          anchorEl={this.state.userDropdownAnchor}
          keepMounted
          transition
          disablePortal
          // height 0 prevents content from jumping around
          style={{ zIndex: 41, height: 0 }}
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              id='assignee-dropdown'
              style={{
                transformOrigin: 'center top'
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={this.handleUserDropdownClose}>
                  <MenuList>
                    <MenuItem onClick={this.handleToggleOverrideModeClick}>
                      Zeitraum blockieren
                    </MenuItem>
                    <MenuItem onClick={this.handleChangeAssigneeClick}>
                      Person ändern
                    </MenuItem>
                    <MenuItem
                      disabled={!this.state.canRemoveUser}
                      onClick={this.handleRemoveUser}>
                      Löschen
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>

        <AssigneesDetails
          date={this.props.date}
          calendar={this.props.calendar}
          daySchedule={this.props.daySchedule}
          canEditSchedules={this.props.canEditSchedules}
          onChangeNote={this.props.onChangeNote}
          assignees={this.props.assignees}
          expanded={this.state.hovering} />
        <div style={topPaddingStyle} />

        <Modal
          enforceFocus={false}
          show={!!this.state.changingAssignee}
          bsSize='small'>
          <Modal.Body>
            <UserPickerContainer
              autoFocus
              onChange={newAssigneeId => this.setState({ changingAssignee: {
                oldAssigneeId: this.state.changingAssignee.oldAssigneeId,
                newAssigneeId
              }})}
            />
          </Modal.Body>
          <Modal.Footer>
            <div className='pull-left'>
              <Button onClick={() => this.setState({ changingAssignee: false })}>
                {TAPi18n.__('ui.close')}
              </Button>
            </div>
            <div className='pull-right'>
              <Button color='primary' onClick={this.handleChangeAssigneeFinishClick}>
                {TAPi18n.__('ui.ok')}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}
