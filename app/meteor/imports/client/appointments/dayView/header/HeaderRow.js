import identity from 'lodash/identity'
import React from 'react'
import Alert from 'react-s-alert'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { __ } from '../../../../i18n'
import { HoverTooltip } from '../../../components/HoverTooltip'
import { AddAssignee } from './AddAssignee'
import { AssigneesDetails } from './AssigneesDetails'
import { background, grayDisabled, gray } from '../../../layout/styles'
import Modal from 'react-bootstrap/lib/Modal'
import Button from '@material-ui/core/Button'
import { UserPicker } from '../../../users/UserPicker'
import { CalendarNote } from './CalendarNote'
import { Users } from '../../../../api/users'
import { prompt } from '../../../layout/Prompt'

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
      editing: false,
      open: false,
      changingAssignee: false
    }

    this.handleRemoveUser = this.handleRemoveUser.bind(this)
    this.handleUserDropdownOpen = this.handleUserDropdownOpen.bind(this)
    this.handleUserDropdownClose = this.handleUserDropdownClose.bind(this)
    this.handleToggleOverrideModeClick = this.handleToggleOverrideModeClick.bind(this)
    this.handleToggleOverlayModeClick = this.handleToggleOverlayModeClick.bind(this)
    this.handleRemoveOverlayModeClick = this.handleRemoveOverlayModeClick.bind(this)
    this.handleMouseEnter = this.handleMouseEnter.bind(this)
    this.handleMouseLeave = this.handleMouseLeave.bind(this)
    this.handleEditingChange = this.handleEditingChange.bind(this)
    this.handleOpenPanel = this.handleOpenPanel.bind(this)
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

  async handleRemoveUser () {
    if (this.state.userDropdownAssigneeId) {
      const id = this.state.userDropdownAssigneeId
      if (this.state.canRemoveUser) {
        this.handleUserDropdownClose()
        this.props.onRemoveUser(id)
      } else {
        const name = Users.methods.fullNameWithTitle(Users.findOne({ _id: id }))
        const ok = await prompt({
          title: `Spalte ${name} wirklich löschen?`,
          confirm: 'Ja, löschen'
        })
        if (ok) {
          this.handleUserDropdownClose()
          this.props.onRemoveUser(id)
        }
      }
    }
  }

  handleToggleOverrideModeClick (e) {
    const assigneeId = this.state.userDropdownAssigneeId
    if (assigneeId && this.props.onToggleOverrideMode) {
      this.props.onToggleOverrideMode({ assigneeId, overlay: e.shiftKey })
    }
    this.handleUserDropdownClose()
  }

  handleToggleOverlayModeClick () {
    const assigneeId = this.state.userDropdownAssigneeId
    if (assigneeId && this.props.onToggleOverrideMode) {
      this.props.onToggleOverrideMode({ assigneeId, overlay: true })
    }
    this.handleUserDropdownClose()
  }

  handleRemoveOverlayModeClick () {
    const assigneeId = this.state.userDropdownAssigneeId
    if (assigneeId && this.props.onToggleOverrideMode) {
      this.props.onToggleOverrideMode({ assigneeId, removeOverlay: true })
    }
    this.handleUserDropdownClose()
  }

  handleMouseEnter () {
    this.setState({
      hovering: true
    })
  }

  handleMouseLeave () {
    // Only the hover-driven expansion ends here. An explicit "Info hinzufügen"
    // open (and an active edit) is kept alive so the panel does not close when
    // the mouse leaves the field after clicking the button.
    this.setState({
      hovering: false
    })
  }

  // While a field in the panel is being edited, keep the panel expanded –
  // even when the mouse leaves it. Only enter/blur ends editing.
  handleEditingChange (editing) {
    // When editing ends and the mouse is no longer on the panel, also drop the
    // explicit "Info hinzufügen" open so the panel collapses again.
    this.setState(state => ({
      editing,
      open: (!editing && !state.hovering) ? false : state.open
    }))
  }

  // "Info hinzufügen" button: open the notes panel and keep it open
  handleOpenPanel () {
    this.setState({ open: true })
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
      .map(a => a && a._id).filter(identity)

    if (todaysAssigneeIds.includes(newAssigneeId)) {
      Alert.error(__('appointments.changeAssigneeMustBeDifferent'))
      return
    }

    this.props.onChangeAssignee({
      oldAssigneeId,
      newAssigneeId
    }).then(() =>
      Alert.success(__('appointments.changeAssigneeSuccess'))
    )

    this.setState({
      changingAssignee: false
    })
  }

  render () {
    const {
      canEditSchedules,
      calendar,
      assignees,
      onAddUser,
      onChangeCalendarNote,
      date,
      daySchedule,
      onChangeNote
    } = this.props

    return (
      <div
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}>
        <div style={headerRowStyle}>
          <div className='hide-print' style={addAssigneeStyle}>
            {
              canEditSchedules &&
                <AddAssignee onAddUser={onAddUser} />
            }
          </div>
          {/* Scheduled assignees */}
          {assignees.map((assignee) => (
            <div
              key={assignee ? assignee._id : 'unassigned'}
              style={headerCellStyle}
              onClick={(event) => assignee && this.handleUserDropdownOpen({ event, assigneeId: assignee._id, canRemoveUser: !assignee.hasAppointments })}>
              {
                assignee
                  ? (
                    <span className='pointer'>
                      {
                        assignee.employee
                          ? Users.methods.fullNameWithTitle(assignee)
                          : <span className='text-muted'>{Users.methods.fullNameWithTitle(assignee)}</span>
                      }
                    </span>
                  )
                  : (
                    calendar.unassignedLabel ||
                  __('appointments.unassigned')
                  )
              }
            </div>
          ))}
        </div>

        <Menu
          anchorEl={this.state.userDropdownAnchor}
          keepMounted
          open={Boolean(this.state.userDropdownAnchor)}
          onClose={this.handleUserDropdownClose}
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MenuItem onClick={this.handleToggleOverrideModeClick}>
            Zeitraum blockieren
          </MenuItem>
          <MenuItem onClick={this.handleToggleOverlayModeClick}>
            Zeitraum einfärben
          </MenuItem>
          <MenuItem onClick={this.handleRemoveOverlayModeClick}>
            Zeitraum-Farben entfernen
          </MenuItem>
          <MenuItem onClick={this.handleChangeAssigneeClick}>
            Person ändern
          </MenuItem>
          {/* HoverTooltip corrects the body zoom (1.221) so it lands in the right
              spot, and wraps the item so the tooltip still fires over the disabled
              (pointer-events: none) MenuItem. No title when the column is empty. */}
          <HoverTooltip
            placement='bottom'
            title={this.state.canRemoveUser ? undefined : 'Bitte weisen Sie alle Termine dieser Spalte einer anderen ÄrztIn oder MitarbeiterIn zu, um diese Spalte zu löschen.'}>
            <MenuItem
              disabled={!this.state.canRemoveUser}
              onClick={this.handleRemoveUser}>
              Spalte löschen
            </MenuItem>
          </HoverTooltip>
          <hr />
          <MenuItem
            onClick={this.handleUserDropdownClose}>
            Schließen
          </MenuItem>
        </Menu>

        <CalendarNote
          calendar={calendar}
          canEditSchedules={canEditSchedules}
          onChangeNote={onChangeCalendarNote}
        />

        <AssigneesDetails
          date={date}
          calendar={calendar}
          daySchedule={daySchedule}
          canEditSchedules={canEditSchedules}
          onChangeNote={onChangeNote}
          onChangeCalendarNote={onChangeCalendarNote}
          onEditingChange={this.handleEditingChange}
          onOpenPanel={this.handleOpenPanel}
          assignees={assignees}
          hovering={this.state.hovering}
          editing={this.state.editing}
          open={this.state.open} />
        <div style={topPaddingStyle} />

        {
          this.state.changingAssignee &&
            <Modal
              enforceFocus={false}
              show={!!this.state.changingAssignee}
              bsSize='small'>
              <Modal.Body>
                <UserPicker
                  autoFocus
                  onChange={newAssigneeId => this.setState({ changingAssignee: {
                    oldAssigneeId: this.state.changingAssignee.oldAssigneeId,
                    newAssigneeId
                  } })}
                />
              </Modal.Body>
              <Modal.Footer>
                <div className='pull-left'>
                  <Button onClick={() => this.setState({ changingAssignee: false })}>
                    {__('ui.close')}
                  </Button>
                </div>
                <div className='pull-right'>
                  <Button color='primary' onClick={this.handleChangeAssigneeFinishClick}>
                    {__('ui.ok')}
                  </Button>
                </div>
              </Modal.Footer>
            </Modal>
        }
      </div>
    )
  }
}
