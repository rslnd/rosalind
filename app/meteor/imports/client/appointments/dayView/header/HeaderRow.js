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
import { Modal } from '../../../components/bootstrap'
import Button from '@material-ui/core/Button'
import { UserPicker } from '../../../users/UserPicker'
import { CalendarNote } from './CalendarNote'
import { Users } from '../../../../api/users'
import { prompt } from '../../../layout/Prompt'
import { VacationEditor } from './VacationEditor'
import { Icon } from '../../../components/Icon'
import { QuickPlanModal } from '../../../schedules/quick/QuickPlanModal'

const darkBlue = '#1e3a5f'

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

const headerCellVacationStyle = {
  backgroundColor: 'rgba(30, 58, 95, 0.10)'
}

const vacationBadgeStyle = {
  display: 'inline-block',
  marginLeft: 8,
  padding: '1px 6px',
  borderRadius: 10,
  backgroundColor: darkBlue,
  color: '#fff',
  fontSize: 11,
  fontWeight: 'bold',
  verticalAlign: 'middle'
}

const menuDividerStyle = {
  margin: '4px 0',
  border: 0,
  borderTop: `1px solid ${grayDisabled}`
}

// Fixed-width icon so the labels of all menu entries line up
const MenuIcon = ({ name }) =>
  <span style={{ display: 'inline-block', width: 22, color: '#888' }}>
    <Icon name={name} />
  </span>

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
      changingAssignee: false,
      vacationModal: null, // { assignee, vacation }
      quickPlan: null // { action, assigneeIds } for the quick planning modal
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
    this.handleClosePanel = this.handleClosePanel.bind(this)
    this.handleChangeAssigneeClick = this.handleChangeAssigneeClick.bind(this)
    this.handleChangeAssigneeFinishClick = this.handleChangeAssigneeFinishClick.bind(this)
    this.handleAddVacationClick = this.handleAddVacationClick.bind(this)
    this.handleQuickPlanClick = this.handleQuickPlanClick.bind(this)
    this.handleOpenDayQuickPlan = this.handleOpenDayQuickPlan.bind(this)
  }

  // Column menu: plan only this column (assignee) on this day
  handleQuickPlanClick (action) {
    const assigneeId = this.state.userDropdownAssigneeId
    this.handleUserDropdownClose()
    if (assigneeId) {
      this.setState({ quickPlan: { action, assigneeIds: [assigneeId] } })
    }
  }

  // Day info panel: plan the whole day
  handleOpenDayQuickPlan () {
    this.setState({ quickPlan: {} })
  }

  handleAddVacationClick () {
    const assigneeId = this.state.userDropdownAssigneeId
    if (assigneeId) {
      const assignee = this.props.assignees.find(a => a && a._id === assigneeId) || Users.findOne({ _id: assigneeId }, { removed: true })
      this.handleUserDropdownClose()
      this.setState({ vacationModal: { assignee, vacation: null } })
    }
  }

  // Clicking the "Urlaub" badge opens the modal for the existing vacation of
  // that assignee on this day (edit / delete).
  handleVacationBadgeClick (event, assignee) {
    event.stopPropagation()
    const vacation = (this.props.vacations || []).find(v => v.userId === assignee._id)
    this.setState({ vacationModal: { assignee, vacation } })
  }

  handleUserDropdownOpen ({ event, assigneeId, canRemoveUser, hasBookables }) {
    if (this.props.canEditSchedules) {
      this.setState({
        userDropdownOpen: true,
        userDropdownAnchor: event.currentTarget,
        userDropdownAssigneeId: assigneeId,
        canRemoveUser,
        hasBookables
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
      // removed: true – the column may belong to a deleted user
      const name = Users.methods.fullNameWithTitle(Users.findOne({ _id: id }, { removed: true }))

      // The column has only online releases (bookables): allow deletion, but
      // warn that those releases will be removed as well.
      if (this.state.canRemoveUser && this.state.hasBookables) {
        const ok = await prompt({
          title: <span style={{ fontSize: 20, fontWeight: 'bold' }}>Spalte löschen</span>,
          body: `Die Spalte ${name} enthält nur Online-Freigaben. Beim Löschen werden diese Online-Freigaben ebenfalls entfernt. Fortfahren?`,
          confirm: 'Ja, löschen',
          cancel: 'Abbrechen'
        })
        if (!ok) { return }
        this.handleUserDropdownClose()
        this.props.onRemoveUser(id)
        return
      }

      if (this.state.canRemoveUser) {
        this.handleUserDropdownClose()
        this.props.onRemoveUser(id)
      } else {
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

  // Click outside the opened panel: drop the explicit open again
  handleClosePanel () {
    this.setState({ open: false })
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
      onChangeNote,
      vacations,
      allVacations,
      isClosed,
      onSaveVacation,
      onRemoveVacation,
      onSetDayClosed
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
              style={(assignee && assignee.onVacation) ? { ...headerCellStyle, ...headerCellVacationStyle } : headerCellStyle}
              onClick={(event) => assignee && this.handleUserDropdownOpen({ event, assigneeId: assignee._id, canRemoveUser: !assignee.hasAppointments, hasBookables: assignee.hasBookables })}>
              {
                assignee
                  ? (
                    <span className='pointer'>
                      {
                        assignee.employee
                          ? Users.methods.fullNameWithTitle(assignee)
                          : <span className='text-muted'>{Users.methods.fullNameWithTitle(assignee)}</span>
                      }
                      {assignee.onVacation &&
                        <span
                          style={{ ...vacationBadgeStyle, cursor: 'pointer' }}
                          title='Urlaub bearbeiten / löschen'
                          onClick={(e) => this.handleVacationBadgeClick(e, assignee)}>
                          <Icon name='umbrella' />&nbsp;Urlaub
                        </span>
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
            <MenuIcon name='ban' />Zeitraum blockieren
          </MenuItem>
          <MenuItem onClick={this.handleToggleOverlayModeClick}>
            <MenuIcon name='paint-brush' />Zeitraum einfärben
          </MenuItem>
          <MenuItem onClick={this.handleRemoveOverlayModeClick}>
            <MenuIcon name='eraser' />Zeitraum-Farben entfernen
          </MenuItem>
          <MenuItem onClick={this.handleChangeAssigneeClick}>
            <MenuIcon name='exchange' />Person ändern
          </MenuItem>
          <MenuItem onClick={this.handleAddVacationClick}>
            <MenuIcon name='umbrella' />Urlaub eintragen
          </MenuItem>
          <hr style={menuDividerStyle} />
          <MenuItem onClick={() => this.handleQuickPlanClick('applyDefault')}>
            <MenuIcon name='magic' />Wochenplan anwenden
          </MenuItem>
          <MenuItem onClick={() => this.handleQuickPlanClick('openBookable')}>
            <MenuIcon name='share-square-o' />Online freigeben
          </MenuItem>
          {this.state.hasBookables &&
            <MenuItem onClick={() => this.handleQuickPlanClick('closeBookable')}>
              <MenuIcon name='square-o' />Online-Freigaben entfernen
            </MenuItem>
          }
          <hr style={menuDividerStyle} />
          {/* HoverTooltip corrects the body zoom (1.221) so it lands in the right
              spot, and wraps the item so the tooltip still fires over the disabled
              (pointer-events: none) MenuItem. No title when the column is empty. */}
          <HoverTooltip
            placement='bottom'
            title={this.state.canRemoveUser ? undefined : 'Bitte weisen Sie alle Termine dieser Spalte einer anderen ÄrztIn oder MitarbeiterIn zu, um diese Spalte zu löschen.'}>
            <MenuItem
              disabled={!this.state.canRemoveUser}
              onClick={this.handleRemoveUser}>
              <MenuIcon name='trash-o' />Spalte löschen
            </MenuItem>
          </HoverTooltip>
          <MenuItem
            onClick={this.handleUserDropdownClose}>
            Menü schließen
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
          onClosePanel={this.handleClosePanel}
          assignees={assignees}
          vacations={vacations}
          allVacations={allVacations}
          isClosed={isClosed}
          onSaveVacation={onSaveVacation}
          onRemoveVacation={onRemoveVacation}
          onSetDayClosed={onSetDayClosed}
          onOpenQuickPlan={this.handleOpenDayQuickPlan}
          hovering={this.state.hovering}
          editing={this.state.editing}
          open={this.state.open} />

        {
          this.state.vacationModal &&
            <VacationEditor
              assignee={this.state.vacationModal.assignee}
              vacation={this.state.vacationModal.vacation}
              date={date}
              existingVacations={allVacations}
              onSave={onSaveVacation}
              onRemove={onRemoveVacation}
              onClose={() => this.setState({ vacationModal: null })} />
        }
        {
          this.state.quickPlan &&
            <QuickPlanModal
              calendar={calendar}
              from={date.toDate ? date.toDate() : date}
              to={date.toDate ? date.toDate() : date}
              action={this.state.quickPlan.action}
              assigneeIds={this.state.quickPlan.assigneeIds}
              staffIds={assignees.filter(a => a && a._id).map(a => a._id)}
              onClose={() => this.setState({ quickPlan: null })} />
        }
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
