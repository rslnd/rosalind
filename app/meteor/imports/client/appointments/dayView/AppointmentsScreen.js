import { Meteor } from 'meteor/meteor'
import React from 'react'
import moment from 'moment-timezone'
import { monkey } from 'spotoninc-moment-round'
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

    this.state = {
      patientModalId: null
    }

    this.scrollToCurrentTime = this.scrollToCurrentTime.bind(this)
    this.handlePrint = this.handlePrint.bind(this)
    this.handlePatientModalClose = this.handlePatientModalClose.bind(this)
    this.handlePatientModalOpen = this.handlePatientModalOpen.bind(this)
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

          <div style={{ marginLeft: 30, marginRight: 15, flexGrow: 1 }}>
            <PatientPicker
              withAppointments
              onPatientModalOpen={this.handlePatientModalOpen}
              formName={newAppointmentFormName}
              bannedIndicator={calendar.allowBanningPatients || hasRole(Meteor.userId(), ['admin', 'patients-ban'])}
            />
          </div>

          <div style={{ marginTop: 27 }}>
            <DateNavigation
              date={date}
              onTodayClick={this.scrollToCurrentTime}
              basePath={`appointments/${calendar.slug}`}
              pullRight
              jumpWeekForward
              jumpMonthForward />
          </div>
        </div>

        <div className='content print-zoom-1' style={appointmentsViewStyle}>
          {
            isReady
              ? <AppointmentsView
                assignees={assignees || []}
                appointments={appointments || []}
                availabilities={availabilities || []}
                schedules={schedules || []}
                date={date}
                daySchedule={daySchedule}
                calendar={calendar}
                canEditSchedules={canEditSchedules}
                onSetAdmitted={handleSetAdmitted}
                onMove={handleMove}
                onNewAppointmentModalOpen={onNewAppointmentModalOpen}
                onNewAppointmentModalClose={onNewAppointmentModalClose}
                move={move}
                dispatch={dispatch}
              />
              : <Loading />
          }
        </div>

        {
          this.state.patientModalId &&
          <PatientsAppointmentsContainer
            show
            patientId={this.state.patientModalId}
            onClose={this.handlePatientModalClose}
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
