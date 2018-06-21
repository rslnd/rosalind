import React from 'react'
import moment from 'moment'
import Alert from 'react-s-alert'
import { Box } from '../../components/Box'
import { Icon } from '../../components/Icon'
import { Meteor } from 'meteor/meteor'
import { TAPi18n } from 'meteor/tap:i18n'
import { withTracker } from 'meteor/react-meteor-data'
import { Calendars } from '../../../api/calendars'
import { Schedules } from '../../../api/schedules'
import { DayPickerRangeController } from 'react-dates'
import { END_DATE, START_DATE } from 'react-dates/constants'
import { Button } from 'material-ui'

const composer = props => {
  const { calendarId } = props
  const calendar = Calendars.findOne({ _id: calendarId })

  Meteor.subscribe('schedules-latest-planned', { calendarId })

  const latestSchedules = Schedules.find({
    type: 'override',
    calendarId
  }, {
    sort: { end: -1 },
    limit: 1
  }).fetch()

  const lastPlannedDate = latestSchedules.length === 1
    ? latestSchedules[0].start
    : null

  console.log('lastPlannedDate', lastPlannedDate)

  return {
    ...props,
    calendar,
    lastPlannedDate
  }
}

class ApplyDefaultScheduleComponent extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      startDate: null,
      endDate: null,
      focusedInput: props.lastPlannedDate ? END_DATE : START_DATE,
      applying: false,
      applied: false
    }

    this.handleDatesChange = this.handleDatesChange.bind(this)
    this.handleFocusChange = this.handleFocusChange.bind(this)
    this.applyDefaultSchedule = this.applyDefaultSchedule.bind(this)
    this.isOutsideRange = this.isOutsideRange.bind(this)
  }

  applyDefaultSchedule () {
    this.setState({
      applying: true
    })

    return Schedules.actions.applyDefaultSchedule.callPromise({
      calendarId: this.props.calendarId,
      from: this.state.startDate.toDate(),
      to: this.state.endDate.toDate()
    }).then(res => {
      Alert.success('Erfolgreich geplant')
      this.setState({
        applying: false,
        applied: true,
        startDate: null,
        endDate: null
      })

      setTimeout(() =>
        this.setState({
          applied: false
        })
      , 10 * 1000)
    }).catch(e => {
      Alert.error(e.message)
      console.error(e)

      this.setState({
        applying: false
      })
    })
  }

  handleDatesChange ({ startDate, endDate }) {
    !this.state.applying && this.setState({
      startDate,
      endDate
    })
  }

  handleFocusChange (focusedInput) {
    // Force the focusedInput to always be truthy so that dates are always selectable
    this.setState({
      focusedInput: focusedInput || START_DATE
    })
  }

  isOutsideRange (m) {
    return this.props.lastPlannedDate
      ? m.isBefore(this.props.lastPlannedDate)
      : m.isBefore(moment())
  }

  render () {
    const { startDate, endDate, focusedInput, applying, applied } = this.state
    const { calendar, lastPlannedDate } = this.props

    return (
      <Box title='Wochenplan anwenden' icon='magic' noPadding noBorder>
        <div style={containerStyle}>
          <DayPickerRangeController
            onDatesChange={this.handleDatesChange}
            onFocusChange={this.handleFocusChange}
            focusedInput={focusedInput}
            startDate={startDate}
            endDate={endDate}
            initialVisibleMonth={lastPlannedDate ? () => moment(lastPlannedDate) : null}
            isOutsideRange={this.isOutsideRange}
            hideKeyboardShortcutsPanel
            numberOfMonths={2}
          />
          <div style={summaryStyle}>
            {
              !applied && !startDate && !endDate &&
                <p>
                  Tage auswählen, für welche die oben geplanten Anwesenheiten gelten sollen.
                </p>
            }

            {
              applied &&
                <p>
                  <Icon name='check-circle' /> Die Arbeitszeiten sind jetzt festgelegt.
                </p>
            }

            <p>
              {startDate && <span>
                Von <b>{formatDate(startDate)}</b><br />
              </span>}
              {endDate && <span>
                Bis <b>{formatDate(endDate)}</b><br />
              </span>}
            </p>

            {
              startDate && endDate &&
                <p>
                  <Icon name='exclamation-triangle' /> <b>Vorsicht</b> Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
            }

            <div>
              <Button
                variant='raised'
                size='large'
                color='secondary'
                style={buttonStyle}
                onClick={this.applyDefaultSchedule}
                disabled={applying || !startDate || !endDate}
              >
                <Icon name='cog' spin={applying} /> Wochenplan auf die gewählten Tage im Kalender {calendar.name} anwenden
              </Button>
            </div>
          </div>
        </div>
      </Box>
    )
  }
}

const containerStyle = {
  display: 'flex'
}

const summaryStyle = {
  flex: 1,
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'column',
  padding: 25
}

const buttonStyle = {
  padding: 25,
  width: '100%'
}

const formatDate = d =>
  moment(d).format(TAPi18n.__('time.dateFormatWeekday'))

export const ApplyDefaultSchedule = withTracker(composer)(ApplyDefaultScheduleComponent)
