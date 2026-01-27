import { Meteor } from 'meteor/meteor'
import React from 'react'
import moment from 'moment-timezone'
import { monkey } from 'spotoninc-moment-round'
import Modal from 'react-bootstrap/lib/Modal'
import { __ } from '../../../i18n'
import { weekOfYear } from '../../../util/time/format'
import { DateNavigation } from '../../components/DateNavigation'
import { Icon } from '../../components/Icon'
import { AppointmentsView } from './AppointmentsView'
import { PatientPicker } from '../../patients/picker'
import { formName as newAppointmentFormName } from '../new/NewAppointmentForm'
import { background } from '../../layout/styles'
import { getClientKey, toNative } from '../../../startup/client/native/events'
import { Loading } from '../../components/Loading'
import { Tooltip } from '../../components/Tooltip'
import { PatientsAppointmentsContainer } from '../../patientAppointments/PatientsAppointmentsContainer'
import { hasRole } from '../../../util/meteor/hasRole'
import { ScheduleDSLEditor } from '../../schedules/dsl'

const contentHeaderStyle = {
  background,
  display: 'flex',
  position: 'fixed',
  right: 0,
  left: 45,
  zIndex: 50
}

const printStyle = {
  display: 'inline-block',
  cursor: 'pointer',
  padding: 6
}

monkey(moment)

export class AppointmentsScreen extends React.Component {
  constructor(props) {
    super(props)

    console.log('Constructing AppointmentsScreen')

    this.state = {
      patientModalId: null,
      showKeyboardShortcuts: false
    }

    this.scrollToCurrentTime = this.scrollToCurrentTime.bind(this)
    this.handlePrint = this.handlePrint.bind(this)
    this.handlePatientModalClose = this.handlePatientModalClose.bind(this)
    this.handlePatientModalOpen = this.handlePatientModalOpen.bind(this)
    this.handleKeyboardShortcutsToggle = this.handleKeyboardShortcutsToggle.bind(this)
    this.handleFocusSearch = this.handleFocusSearch.bind(this)
    this.handleBlurSearch = this.handleBlurSearch.bind(this)
  }

  handleKeyboardShortcutsToggle () {
    this.setState(state => ({ showKeyboardShortcuts: !state.showKeyboardShortcuts }))
  }

  handleFocusSearch () {
    const container = document.getElementById('patient-picker-container')
    if (container) {
      const input = container.querySelector('input')
      if (input) {
        input.focus()
      }
    }
  }

  handleBlurSearch () {
    const container = document.getElementById('patient-picker-container')
    if (container) {
      const input = container.querySelector('input')
      if (input) {
        input.blur()
      }
    }
  }

  scrollToCurrentTime() {
    const now = moment()
    if (now.isSame(this.props.date, 'day')) {
      const elemId = now.floor(1, 'hour').format('[T]HHmm')
      const elem = document.getElementById(elemId)
      if (elem) {
        const offset = elem.offsetTop
        window.scrollTo({ top: offset })
        console.log('[AppointmentsScreen] Scrolled to', document.getElementById(elemId), offset)
      } else {
        console.warn('[AppointmentsScreen] scrollToCurrentTime: Could not find element with id', elemId)
      }
    }
  }

  handlePrint() {
    if (getClientKey()) {
      console.log('[Client] Printing: native')
      const title = moment(this.props.date)
        .format(`YYYY-MM-DD-${__('appointments.this')}-${this.props.calendar.name}`)
      toNative('print', { title })
    } else {
      console.log('[Client] Printing: default')
      window.print()
    }
  }

  handlePatientModalOpen(patientModalId) {
    console.log('PAM in AppointmentsScreen opening', patientModalId)
    this.setState({ patientModalId })
  }

  handlePatientModalClose(e) {
    console.log('PAM in AppointmentsScreen closing', e)
    this.setState({ patientModalId: null })
  }

  render() {
    const {
      calendar,
      assignees,
      appointments,
      availabilities,
      schedules,
      date,
      daySchedule,
      canEditSchedules,
      canSeeBookables,
      canEditBookables,
      handleSetAdmitted,
      handleMove,
      onNewAppointmentModalOpen,
      onNewAppointmentModalClose,
      move,
      dispatch,
      isReady
    } = this.props

    return (
      <div>
        <div className='content-header hide-print' style={contentHeaderStyle}>
          <h1>
            <b>{calendar.name}</b>&ensp;
            {date.format(__('time.dateFormatWeekdayShortNoYear'))}&nbsp;
            <small>
              {weekOfYear(date, { short: true })}
              &nbsp;
              <Tooltip
                title={__('appointments.printDayView')}
              >
                <span
                  style={printStyle}
                  onClick={this.handlePrint}>
                  <Icon name='print' />
                </span>
              </Tooltip>
            </small>
          </h1>

          <div id='patient-picker-container' style={{ marginLeft: 30, marginRight: 15, flexGrow: 1 }}>
            <PatientPicker
              withAppointments
              onPatientModalOpen={this.handlePatientModalOpen}
              formName={newAppointmentFormName}
              bannedIndicator={calendar.allowBanningPatients || hasRole(Meteor.userId(), ['admin', 'patients-ban'])}
            />
          </div>

          <div style={{display: "flex", alignItems: "center"}}>
            <span
              style={{ cursor: 'pointer', paddingRight: 10, marginTop: -3, opacity: 0.6 }}
              onClick={this.handleKeyboardShortcutsToggle}
              title={__('ui.keyboardShortcuts')}
            >
              <Icon name='keyboard-o' />
            </span>
          </div>

          <div style={{ marginTop: 27 }}>
            <DateNavigation
              date={date}
              onTodayClick={this.scrollToCurrentTime}
              onKeyboardShortcutsToggle={this.handleKeyboardShortcutsToggle}
              onFocusSearch={this.handleFocusSearch}
              onBlurSearch={this.handleBlurSearch}
              basePath={`appointments/${calendar.slug}`}
              pullRight
              jumpWeekForward
              jumpMonthForward />
          </div>
        </div>

        <div className='content print-zoom-1' style={appointmentsViewStyle}>
          <AppointmentsView
            assignees={assignees || []}
            appointments={appointments || []}
            availabilities={availabilities || []}
            schedules={schedules || []}
            date={date}
            daySchedule={daySchedule}
            calendar={calendar}
            canEditSchedules={canEditSchedules}
            canSeeBookables={canSeeBookables}
            canEditBookables={canEditBookables}
            onSetAdmitted={handleSetAdmitted}
            onMove={handleMove}
            onNewAppointmentModalOpen={onNewAppointmentModalOpen}
            onNewAppointmentModalClose={onNewAppointmentModalClose}
            move={move}
            dispatch={dispatch}
          />
        </div>

        {
          this.state.patientModalId &&
          <PatientsAppointmentsContainer
            show
            patientId={this.state.patientModalId}
            onClose={this.handlePatientModalClose}
          />
        }

        <Modal
          show={this.state.showKeyboardShortcuts}
          onHide={this.handleKeyboardShortcutsToggle}
          bsSize='small'
        >
          <Modal.Header closeButton>
            <Modal.Title>{__('ui.keyboardShortcuts')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr><td><kbd>←</kbd></td><td>{__('time.oneDayBackward')}</td></tr>
                <tr><td><kbd>→</kbd></td><td>{__('time.oneDayForward')}</td></tr>
                <tr><td><kbd>↑</kbd></td><td>{__('time.oneWeekBackward')}</td></tr>
                <tr><td><kbd>↓</kbd></td><td>{__('time.oneWeekForward')}</td></tr>
                <tr><td><kbd>Shift</kbd> + <kbd>←</kbd></td><td>{__('time.oneWeekBackward')}</td></tr>
                <tr><td><kbd>Shift</kbd> + <kbd>→</kbd></td><td>{__('time.oneWeekForward')}</td></tr>
                <tr><td><kbd>Shift</kbd> + <kbd>↑</kbd></td><td>{__('time.oneMonthBackward')}</td></tr>
                <tr><td><kbd>Shift</kbd> + <kbd>↓</kbd></td><td>{__('time.oneMonthForward')}</td></tr>
                <tr><td><kbd>H</kbd></td><td>{__('ui.today')}</td></tr>
                <tr><td><kbd>{__('ui.space')}</kbd></td><td>{__('patients.search')}</td></tr>
                <tr><td><kbd>Esc</kbd></td><td>{__('ui.blur')}</td></tr>
                <tr><td><kbd>?</kbd></td><td>{__('ui.keyboardShortcuts')}</td></tr>
              </tbody>
            </table>
          </Modal.Body>
        </Modal>

        {hasRole(Meteor.userId(), ['admin', 'schedules-dsl']) &&
          <ScheduleDSLEditor
            calendarId={calendar._id}
            calendar={calendar}
            history={this.props.history}
            basePath={`appointments/${calendar.slug}`}
          />
        }
      </div>
    )
  }
}

// Fix weird scrolling jumps while moving appointments in Chrome
const appointmentsViewStyle = {
  overflowAnchor: 'none'
}
