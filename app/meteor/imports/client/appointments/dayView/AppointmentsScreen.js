import React from 'react'
import moment from 'moment-timezone'
import { monkey } from 'spotoninc-moment-round'
import { __ } from '../../../i18n'
import { weekOfYear } from '../../../util/time/format'
import { DateNavigation } from '../../components/DateNavigation'
import { Icon } from '../../components/Icon'
import { AppointmentsView } from './AppointmentsView'
import Button from 'react-bootstrap/lib/Button'
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup'
import { PatientPicker } from '../../patients/picker'
import { formName as newAppointmentFormName } from '../new/NewAppointmentForm'
import { background } from '../../layout/styles'
import { PatientModal } from '../../patients/PatientModal'

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
  constructor (props) {
    super(props)

    this.state = {
      patientModalId: null
    }

    this.scrollToCurrentTime = this.scrollToCurrentTime.bind(this)
    this.handlePrint = this.handlePrint.bind(this)
    this.handlePatientModalClose = this.handlePatientModalClose.bind(this)
    this.handlePatientModalOpen = this.handlePatientModalOpen.bind(this)
  }

  scrollToCurrentTime () {
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

  handlePrint () {
    if (window.native && window.native.print) {
      console.log('[Client] Printing: native')
      const title = moment(this.props.date)
        .format(`YYYY-MM-DD-${__('appointments.this')}-${this.props.calendar.name}`)
      window.native.print({ title })
    } else {
      console.log('[Client] Printing: default')
      window.print()
    }
  }

  handlePatientModalOpen (patientModalId) {
    this.setState({ patientModalId })
  }

  handlePatientModalClose () {
    this.setState({ patientModalId: null })
  }

  render () {
    if (this.props.isLoading) {
      return null
    }

    return (
      <div>
        <div className='content-header hide-print' style={contentHeaderStyle}>
          <h1>
            <b>{this.props.calendar.name}</b>&ensp;
            {this.props.date.format(__('time.dateFormatWeekdayShortNoYear'))}&nbsp;
            <small>
              {weekOfYear(this.props.date, { short: true })}
              &nbsp;
              <span
                style={printStyle}
                title={__('appointments.printDayView')}
                onClick={this.handlePrint}>
                <Icon name='print' />
              </span>
            </small>
          </h1>

          <div style={{ marginLeft: 30, marginRight: 15, flexGrow: 1 }}>
            <PatientPicker
              withAppointments
              onPatientModalOpen={this.handlePatientModalOpen}
              formName={newAppointmentFormName}
            />
          </div>

          <div style={{ marginTop: 27 }}>
            <DateNavigation
              date={this.props.date}
              onTodayClick={this.scrollToCurrentTime}
              basePath={`appointments/${this.props.calendar.slug}`}
              pullRight
              jumpWeekForward
              jumpMonthForward />
          </div>
        </div>

        <div className='content print-zoom-1' style={appointmentsViewStyle}>
          <AppointmentsView
            assignees={this.props.assignees}
            date={this.props.date}
            daySchedule={this.props.daySchedule}
            calendar={this.props.calendar}
            canEditSchedules={this.props.canEditSchedules}
            onSetAdmitted={this.props.handleSetAdmitted}
            onMove={this.props.handleMove}
            onNewAppointmentModalOpen={this.props.onNewAppointmentModalOpen}
            onNewAppointmentModalClose={this.props.onNewAppointmentModalClose}
            move={this.props.move}
            dispatch={this.props.dispatch} />
        </div>

        {
          this.state.patientModalId &&
            <PatientModal
              show={!!this.state.patientModalId}
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
