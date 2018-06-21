import React from 'react'
import moment from 'moment'
import { Box } from '../../components/Box'
import { Icon } from '../../components/Icon'
import { Meteor } from 'meteor/meteor'
import { TAPi18n } from 'meteor/tap:i18n'
import { withTracker } from 'meteor/react-meteor-data'
import { Users } from '../../../api/users'
import { DayPickerRangeController } from 'react-dates'
import { END_DATE, START_DATE } from 'react-dates/constants'
import { Button } from 'material-ui';

export class ApplyDefaultSchedule extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      startDate: null,
      endDate: null,
      focusedInput: START_DATE,
      applying: false,
      applied: false
    }

    this.handleDatesChange = this.handleDatesChange.bind(this)
    this.handleFocusChange = this.handleFocusChange.bind(this)
    this.applyDefaultSchedule = this.applyDefaultSchedule.bind(this)
  }

  applyDefaultSchedule () {
    this.setState({
      applying: true
    })

    setTimeout(() =>
      this.setState({
        applying: false,
        applied: true
      })
    , 2000)
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

  render () {
    const { startDate, endDate, focusedInput, applying } = this.state
    return (
      <Box title='Wochenplan anwenden' icon='magic' noPadding noBorder>
        <div style={containerStyle}>
          <DayPickerRangeController
            onDatesChange={this.handleDatesChange}
            onFocusChange={this.handleFocusChange}
            focusedInput={focusedInput}
            startDate={startDate}
            endDate={endDate}
            hideKeyboardShortcutsPanel
            numberOfMonths={2}
          />
          <div style={summaryStyle}>
            {
              !startDate && !endDate &&
                <p>
                  Tage auswählen, für welche die oben geplanten Anwesenheiten gelten sollen.
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
                <Icon name='cog' spin={applying} /> Wochenplan auf die gewählten Tage anwenden
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
